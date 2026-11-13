'use strict'

/**
 * Paced command queue: one command in flight at a time.
 *
 * Why: the V-160HD drops commands when it's sent a burst faster than it can
 * answer (upstream issue #21, "press it several times"). So:
 *
 *  - Only one command is on the wire at once. The next one goes when the
 *    switcher answers (ACK, ERR, or for a read its data), or when the
 *    answer timeout runs out.
 *  - Writes (things a button does) always go before reads (polling).
 *  - A read that's already waiting isn't queued twice.
 *  - A write that gets no answer is sent again, up to `retries` times, but
 *    only if sending it twice is harmless (`repeatable`). Toggles aren't.
 *  - After `silenceLimit` unanswered commands in a row, `onSilence` fires
 *    (the module pauses polling). Anything heard from the switcher fires
 *    `onAlive` and resets the count.
 *  - There's a short gap (`gapMs`) after each answer before the next send.
 *    Roland asks for 20 ms between data writes.
 *
 * Timers are injectable so the tests can run on virtual time.
 */

const PRIORITY = { HIGH: 0, LOW: 1 }

class CommandQueue {
	/**
	 * @param {object} opts
	 * @param {(cmd: string) => boolean|void} opts.send   puts one command on the wire
	 * @param {(level: string, msg: string) => void} [opts.log]
	 * @param {number} [opts.timeoutMs=500]
	 * @param {number} [opts.gapMs=20]
	 * @param {number} [opts.retries=1]
	 * @param {number} [opts.silenceLimit=5]
	 * @param {() => void} [opts.onSilence]
	 * @param {() => void} [opts.onAlive]
	 * @param {{ setTimeout: Function, clearTimeout: Function }} [opts.timers]
	 */
	constructor(opts) {
		this._send = opts.send
		this._log = opts.log || (() => {})
		this.timeoutMs = opts.timeoutMs ?? 500
		this.gapMs = opts.gapMs ?? 20
		this.retries = opts.retries ?? 1
		this.silenceLimit = opts.silenceLimit ?? 5
		this._onSilence = opts.onSilence || (() => {})
		this._onAlive = opts.onAlive || (() => {})
		this._timers = opts.timers || { setTimeout, clearTimeout }

		this._high = []
		this._low = []
		this._inFlight = null
		this._timer = null
		this._gapTimer = null
		this._missed = 0
		this._silent = false
		this._generation = 0
	}

	/**
	 * Queue a command.
	 * @param {object} item
	 * @param {string} item.cmd          the full command, e.g. 'PGM:INPUT3;' or 'DTH:002100,2A;'
	 * @param {'write'|'read'} item.kind
	 * @param {string} [item.key]        reads with the same key are only queued once
	 * @param {(msg: string) => boolean} [item.match]  a reply that completes this command (besides ACK/ERR)
	 * @param {boolean} [item.repeatable=true]  safe to send again if unanswered
	 * @param {(code: string, item: object) => void} [item.onError]  called on ERR:x
	 * @returns {boolean} false if it was a duplicate read and wasn't queued
	 */
	enqueue(item) {
		const entry = { repeatable: true, ...item, attempts: 0 }
		if (entry.kind === 'read') {
			const key = entry.key || entry.cmd
			entry.key = key
			if (this._low.some((x) => x.key === key)) return false
			if (this._inFlight && this._inFlight.kind === 'read' && this._inFlight.key === key) return false
			this._low.push(entry)
		} else {
			this._high.push(entry)
		}
		this._pump()
		return true
	}

	/** How many reads are waiting (polling uses this so it never outruns the switcher) */
	readsWaiting() {
		return this._low.length + (this._inFlight && this._inFlight.kind === 'read' ? 1 : 0)
	}

	/** Everything waiting, in flight included */
	size() {
		return this._high.length + this._low.length + (this._inFlight ? 1 : 0)
	}

	/** True once onSilence has fired and nothing has been heard since */
	get silent() {
		return this._silent
	}

	/**
	 * Tell the queue about one message from the switcher (already split on ';').
	 * Returns true if it answered the command in flight.
	 */
	handleMessage(msg) {
		const m = String(msg).trim()
		if (m === '') return false
		this._missed = 0
		if (this._silent) {
			this._silent = false
			this._onAlive()
		}
		const item = this._inFlight
		if (!item) return false

		if (/^ack$/i.test(m)) {
			this._complete()
			return true
		}
		const err = /^ERR:?\s*(\w+)?/i.exec(m)
		if (err) {
			const code = err[1] ?? '?'
			this._complete()
			try {
				if (item.onError) item.onError(code, item)
			} catch (e) {
				this._log('warn', `Error handler failed: ${e}`)
			}
			return true
		}
		if (item.match && item.match(m)) {
			this._complete()
			return true
		}
		return false
	}

	/** Drop everything (new connection, or shutting down) */
	clear() {
		this._generation++
		this._high = []
		this._low = []
		this._inFlight = null
		this._missed = 0
		this._silent = false
		if (this._timer) this._timers.clearTimeout(this._timer)
		if (this._gapTimer) this._timers.clearTimeout(this._gapTimer)
		this._timer = null
		this._gapTimer = null
	}

	_complete() {
		if (this._timer) this._timers.clearTimeout(this._timer)
		this._timer = null
		this._inFlight = null
		this._afterGap()
	}

	_afterGap() {
		if (this._gapTimer) return
		const gen = this._generation
		this._gapTimer = this._timers.setTimeout(() => {
			this._gapTimer = null
			if (gen !== this._generation) return
			this._pump()
		}, this.gapMs)
	}

	_pump() {
		if (this._inFlight || this._gapTimer) return
		const item = this._high.shift() || this._low.shift()
		if (!item) return
		this._transmit(item)
	}

	_transmit(item) {
		this._inFlight = item
		item.attempts++
		let ok = true
		try {
			ok = this._send(item.cmd) !== false
		} catch (e) {
			ok = false
			this._log('warn', `Send failed: ${e}`)
		}
		if (!ok) {
			// Not connected: nothing will answer, so don't wait for it.
			this._inFlight = null
			this._afterGap()
			return
		}
		const gen = this._generation
		this._timer = this._timers.setTimeout(() => {
			this._timer = null
			if (gen !== this._generation || this._inFlight !== item) return
			this._timedOut(item)
		}, this.timeoutMs)
	}

	_timedOut(item) {
		this._inFlight = null
		this._missed++
		const again = item.kind === 'write' && item.repeatable && item.attempts <= this.retries
		if (again) {
			this._log('debug', `No answer to ${item.cmd.trim()}, sending it again`)
			this._high.unshift(item)
		} else if (item.kind === 'write') {
			this._log('warn', `The switcher didn't answer ${item.cmd.trim()}, so it may not have happened`)
		}
		if (this._missed >= this.silenceLimit && !this._silent) {
			this._silent = true
			this._onSilence()
		}
		this._afterGap()
	}
}

module.exports = { CommandQueue, PRIORITY }
