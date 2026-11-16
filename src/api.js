const { InstanceStatus, TCPHelper } = require('@companion-module/base')
const { extractMessages } = require('./tcpParser')
const { CommandQueue } = require('./commandQueue')
const protocol = require('./protocol')
const sources = require('./sources')
const mem = require('./mem')

// How long a Freeze field's local pending value (set optimistically by a
// write action, before the device has confirmed it) is shown before falling
// back to the last real DATA value if nothing has confirmed or superseded it.
const FREEZE_PENDING_TIMEOUT_MS = 2000

/** Pick a whole number out of a config value, inside a range, or use the default */
function intIn(value, lo, hi, fallback) {
	const s = String(value ?? '').trim()
	if (!/^\d+$/.test(s)) return fallback
	const n = Number(s)
	return n >= lo && n <= hi ? n : fallback
}

module.exports = {
	/** Connection numbers, from the config, checked */
	_settings: function () {
		const c = this.config || {}
		return {
			port: intIn(c.port, 1, 65535, 8023),
			pollMs: intIn(c.pollingrate, 100, 30000, 500),
			timeoutMs: intIn(c.timeout, 50, 5000, 500),
			gapMs: intIn(c.gap, 0, 1000, 20),
			retries: intIn(c.retries, 0, 5, 1),
			silenceLimit: intIn(c.silence, 1, 100, 5),
		}
	},

	initConnection: function () {
		let self = this

		self._stopPolling()
		if (typeof self.stopLabelRefresh === 'function') self.stopLabelRefresh()
		if (self._queue) self._queue.clear()

		const s = self._settings()
		self._queue = new CommandQueue({
			send: function (cmd) {
				if (self.socket === undefined || !self.socket.isConnected) {
					self.logVerbose('Not sent (not connected): ' + cmd.trim())
					return false
				}
				self.logVerbose('Sending: ' + cmd.trim())
				return self.socket.send(cmd.endsWith('\n') ? cmd : cmd + '\n')
			},
			log: function (level, msg) {
				if (level === 'debug') self.logVerbose(msg)
				else self.log(level, msg)
			},
			timeoutMs: s.timeoutMs,
			gapMs: s.gapMs,
			retries: s.retries,
			silenceLimit: s.silenceLimit,
			onSilence: function () {
				self.log(
					'warn',
					`The switcher has stopped answering (${s.silenceLimit} commands in a row), so polling is having a breather until it says something again.`,
				)
				self.updateStatus(InstanceStatus.UnknownWarning, 'Not answering')
			},
			onAlive: function () {
				self.log('info', 'The switcher is answering again. Back to business.')
				self.updateStatus(InstanceStatus.Ok)
			},
		})

		self._clearAllFreezePending()
		self.checkFeedbacks('freeze')

		if (self.socket !== undefined) {
			self.socket.destroy()
			delete self.socket
		}

		self.PROTOCOL = 'lowlevel'
		self.VERSION = ''

		if (!self.config.host) {
			self.updateStatus(InstanceStatus.BadConfig, 'No IP address yet')
			return
		}

		self.log('info', `Opening connection to ${self.config.host}:${s.port}`)
		self.tcpBuffer = ''
		self.updateStatus(InstanceStatus.Connecting)

		const socket = new TCPHelper(self.config.host, s.port, { reconnect: true, reconnect_interval: 5000 })
		self.socket = socket

		socket.on('error', function (err) {
			if (socket !== self.socket) return
			self._stopPolling()
			self.handleError(err)
		})

		socket.on('connect', function () {
			if (socket !== self.socket) return
			self.tcpBuffer = ''
			self._queue.clear()
			self.memoryNameIndex = 0
			self._memoryNamesDone = false
			self._passwordSent = false
			self._authenticated = false
			self._clearAllFreezePending()
			self.checkFeedbacks('freeze')
			self.log('info', 'Connected. Saying the password.')
			self.updateStatus(InstanceStatus.Connecting, 'Authenticating')
		})

		socket.on('data', function (buffer) {
			if (socket !== self.socket) return
			self.tcpBuffer += buffer.toString('utf8')
			const { messages, remaining } = extractMessages(self.tcpBuffer)
			self.tcpBuffer = remaining
			for (const msg of messages) {
				self.updateData(msg)
			}
		})

		socket.on('end', function () {
			if (socket !== self.socket) return
			self._stopPolling()
			self.log('warn', 'The switcher closed the connection. Trying again in 5 seconds.')
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Connection closed')
		})
	},

	handleError: function (err) {
		let self = this
		const code = err && typeof err === 'object' ? err.code : undefined
		let message
		if (code === 'ECONNREFUSED') {
			message =
				'The switcher refused the connection. Right IP address? Is LAN control on, with a password set? (Only one LAN controller at a time: RCS over LAN counts.)'
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Connection refused')
		} else if (code === 'ETIMEDOUT' || code === 'EHOSTUNREACH') {
			message = "Can't reach the switcher. Right IP address? Is it switched on and on the network?"
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Unreachable')
		} else if (code === 'ECONNRESET') {
			message = 'The connection was reset. Trying again shortly.'
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Connection reset')
		} else {
			message = 'Connection problem: ' + (err && err.message ? err.message : String(err))
			self.updateStatus(InstanceStatus.ConnectionFailure, 'Connection error')
		}
		self.log('error', message)
	},

	// ── After the password ─────────────────────────────────────────────────

	_onAuthenticated: function () {
		let self = this
		self._authenticated = true
		self.updateStatus(InstanceStatus.Ok)
		self.log('info', "In! Asking the switcher what it's running.")
		// VER decides the protocol (Auto). Everything else waits for its answer.
		self._queue.enqueue({
			cmd: 'VER;',
			kind: 'read',
			key: 'VER',
			match: (m) => /^VER:/i.test(m),
			onError: () => self._protocolChosen(),
		})
		// If VER never answers, carry on in low-level mode anyway.
		clearTimeout(self._verTimer)
		self._verTimer = setTimeout(() => {
			if (!self._protocolDecided) self._protocolChosen()
		}, 3000)
		self._protocolDecided = false
	},

	_protocolChosen: function () {
		let self = this
		if (self._protocolDecided) return
		self._protocolDecided = true
		clearTimeout(self._verTimer)
		self.PROTOCOL = protocol.choose(self.config.protocol, self.VERSION)
		self.log(
			'info',
			self.PROTOCOL === 'named'
				? `Firmware ${self.VERSION || '?'}: using Roland's named commands (Input 1-20 everywhere).`
				: `Firmware ${self.VERSION || '?'}: using the low-level address commands.` +
						(self.config.protocol === 'lowlevel' ? '' : ' Firmware 3.40 or later unlocks the named commands.'),
		)
		self.checkVariables()
		self.subscribeToTally()
		self.getFreezeData()
		self.startInterval()
		// Names, system settings and the tally extras, once on connect
		self.readLabels()
		self.getVideoAssign()
		self.readSystem()
		self.readLayerTypes()
		self.readDskOnAir()
		// Main sources once on connect, so feedbacks work with polling off too
		self.readRouting()
		self.startLabelRefresh()
		self.runPendingRestore()
	},

	/** Program, Preview, Aux, PinP & Key and DSK sources (named or low-level) */
	readRouting: function () {
		let self = this
		if (!self._queue) return
		if (self.PROTOCOL === 'named') {
			self._read('QPGM;', 'PGM')
			self._read('QPST;', 'PST')
			for (let a = 1; a <= 3; a++) self._read(`QAUX:AUX${a};`, 'AUX')
		} else {
			self.getAuxSources()
		}
		self.getPinpKeySource()
		self.getDskSource()
		self.getPinpKeyTally()
		self.readDskOnAir()
	},

	/**
	 * The switcher pushes tally when anything goes on or off air. With polling off,
	 * read the sources again then (once per burst), so Program/Preview stay right.
	 */
	_tallyChanged: function () {
		let self = this
		if (self.config.polling || !self._protocolDecided) return
		if (self._routingTimer) return
		self._routingTimer = setTimeout(() => {
			self._routingTimer = undefined
			self.readRouting()
		}, 100)
	},

	// ── Polling ────────────────────────────────────────────────────────────

	_stopPolling: function () {
		clearTimeout(this._routingTimer)
		this._routingTimer = undefined
		if (this.INTERVAL) clearInterval(this.INTERVAL)
		this.INTERVAL = undefined
	},

	startInterval: function () {
		let self = this
		self._stopPolling()
		self._pollTick = 0
		// Memory names are read once after connecting, slowly, not every cycle.
		self._readMemoryNames()
		if (!self.config.polling) {
			self.log(
				'info',
				'Polling is off: sources are read on connect and again whenever the switcher reports a tally change.',
			)
			return
		}
		const rate = self._settings().pollMs
		self.log('info', `Polling every ${rate} ms.`)
		self._doPoll(true)
		self.INTERVAL = setInterval(() => self._doPoll(false), rate)
	},

	_doPoll: function (immediate) {
		let self = this
		if (!self._queue || self._queue.silent) return
		// Backpressure: if last round's reads haven't been answered yet, skip this one.
		if (!immediate && self._queue.readsWaiting() > 0) return
		self._pollTick = (self._pollTick || 0) + 1

		if (self.PROTOCOL === 'named') {
			self._read('TLY;', 'TLY')
			self._read('QPGM;', 'PGM')
			self._read('QPST;', 'PST')
			for (let a = 1; a <= 3; a++) self._read(`QAUX:AUX${a};`, 'AUX')
		} else {
			self.getAuxSources()
		}
		self.getPinpKeyTally()
		self.readDskOnAir()

		if (immediate || self._pollTick % 2 === 0) {
			self.getAuxMutes()
			self.getVideoAssign()
		}
		if (immediate || self._pollTick % 10 === 0) {
			self.getPinpKeySource()
			self.getDskSource()
			self.getFreezeData()
			self.getOutputData()
			self.getAuxLinkData()
			self.getTransitionData()
			self.getMonitorData()
			self.getLastMemoryLoaded()
			self.readLayerTypes()
		}
		// Labels and system settings: slowest tier (they rarely change from the panel)
		if (!immediate && self._pollTick % 20 === 0) {
			self.readLabels()
			self.readSystem()
		}
	},

	/** Queue a read. Named reads finish on ACK; low-level reads finish on their DTH reply. */
	_read: function (cmd, prefix) {
		let self = this
		if (!self._queue) return
		const named = !/^RQH:/i.test(cmd)
		let match
		if (!named) {
			const addr = cmd.slice(4, 10).toUpperCase()
			match = (m) => m.toUpperCase().startsWith('DTH:' + addr)
		}
		self._queue.enqueue({ cmd, kind: 'read', key: cmd, match, repeatable: true })
	},

	_parseHexBlock: function (value, expectedBytes) {
		if (value.length !== expectedBytes * 2) return null
		if (!/^[0-9A-Fa-f]+$/.test(value)) return null
		const out = []
		for (let i = 0; i < expectedBytes; i++) {
			out.push(value.slice(i * 2, i * 2 + 2).toUpperCase())
		}
		return out
	},

	getPinpKeyTally: function () {
		this.sendRawCommand('RQH:001B00,000002;')
		this.sendRawCommand('RQH:001C00,000002;')
		this.sendRawCommand('RQH:001D00,000002;')
		this.sendRawCommand('RQH:001E00,000002;')
	},

	getPinpKeySource: function () {
		if (this.PROTOCOL === 'named') {
			for (let k = 1; k <= 4; k++) this._read(`QPIS:PinP${k};`, 'PIS')
			return
		}
		this.sendRawCommand('RQH:001B02,000001;')
		this.sendRawCommand('RQH:001C02,000001;')
		this.sendRawCommand('RQH:001D02,000001;')
		this.sendRawCommand('RQH:001E02,000001;')
	},

	getDskSource: function () {
		if (this.PROTOCOL === 'named') {
			for (let k = 1; k <= 2; k++) this._read(`QDSS:DSK${k};`, 'DSS')
		}
		// DSK 1 + 2 key source and fill source
		this.sendRawCommand('RQH:001F03,000002;')
		this.sendRawCommand('RQH:002003,000002;')
	},

	getAuxSources: function () {
		this.sendRawCommand('RQH:002100,000002;') // PGM + PVW
		this.sendRawCommand('RQH:000011,000001;') // Aux 1
		this.sendRawCommand('RQH:00002E,000002;') // Aux 2 + 3
	},

	getAuxMutes: function () {
		this.sendRawCommand('RQH:012203,000001;')
		this.sendRawCommand('RQH:012503,000001;')
		this.sendRawCommand('RQH:012603,000001;')
	},

	getFreezeData: function () {
		// Freeze SW (020500) through SDI IN 8 select (020511): 18 bytes.
		this.sendRawCommand('RQH:020500,000012;')
	},

	getOutputData: function () {
		// HDMI 1-3 + SDI 1-3 + USB (00000A-000010): 7 bytes.
		this.sendRawCommand('RQH:00000A,000007;')
	},

	getAuxLinkData: function () {
		this.sendRawCommand('RQH:02010D,000001;')
		this.sendRawCommand('RQH:020154,000003;')
	},

	getVideoAssign: function () {
		this.sendRawCommand('RQH:000000,00000A;') // Input 1-10
		this.sendRawCommand('RQH:000024,00000A;') // Input 11-20
	},

	getTransitionData: function () {
		this.sendRawCommand('RQH:001800,000004;')
	},

	getMonitorData: function () {
		this.sendRawCommand('RQH:020116,000004;')
	},

	getLastMemoryLoaded: function () {
		this.sendRawCommand('RQH:0A0003,000001;')
	},

	/** Read memory names 1-30 once, one at a time, behind everything else */
	_readMemoryNames: function () {
		let self = this
		if (self._memoryNamesDone) return
		self._memoryNamesDone = true
		for (let i = 0; i < 30; i++) {
			const h = sources.hexOf(i)
			self.sendRawCommand('RQH:60' + h + '00,000008;')
		}
	},

	subscribeToTally: function () {
		this.sendCommand('0C0100', '01') // TALLY SEND ACTIVE
	},

	_resolveInputToPhysical: function (rawId) {
		// If rawId is a logical INPUT source (0x20-0x33), return the physical
		// source that input is currently given. Falls back to rawId.
		const code = parseInt(rawId, 16)
		if (code >= 0x20 && code <= 0x33 && Array.isArray(this.DATA.inputAssign)) {
			const physical = this.DATA.inputAssign[code - 0x20]
			if (physical !== undefined) return physical
		}
		return String(rawId).toUpperCase()
	},

	// ── Freeze: local pending-value overlay (from upstream PR #61) ───────────
	_freezeValue: function (field) {
		const pending = this._freezePending && this._freezePending[field]
		return pending !== undefined ? pending.value : this.DATA[field]
	},

	_setFreezePending: function (field, value, onExpire) {
		let self = this
		if (!self._freezePending) self._freezePending = {}
		if (self._freezePending[field]) clearTimeout(self._freezePending[field].timer)
		const record = { value: value, timer: null }
		record.timer = setTimeout(function () {
			if (self._freezePending[field] !== record) return
			delete self._freezePending[field]
			if (onExpire) onExpire()
		}, FREEZE_PENDING_TIMEOUT_MS)
		self._freezePending[field] = record
	},

	_clearFreezePending: function (field) {
		if (this._freezePending && this._freezePending[field]) {
			clearTimeout(this._freezePending[field].timer)
			delete this._freezePending[field]
		}
	},

	_clearAllFreezePending: function () {
		if (!this._freezePending) return
		for (const field in this._freezePending) clearTimeout(this._freezePending[field].timer)
		this._freezePending = {}
	},

	// ── Incoming ───────────────────────────────────────────────────────────

	updateData: function (data) {
		let self = this
		// The switcher puts an invisible start byte (0x02, Roland's "stx") in front of
		// its replies. Strip that and any other control characters before reading.
		const msg = String(data)
			.replace(/[\x00-\x1F\x7F]/g, '')
			.trim()
		if (msg === '') return
		self.logVerbose('Received: ' + msg)

		if (msg === 'Enter password:') {
			if (!self._passwordSent) {
				self._passwordSent = true
				const pw = String(self.config.password ?? '')
				if (pw === '') self.log('warn', "The switcher wants a password and there isn't one on the connection page.")
				self.socket.send(pw + '\n')
			}
			return
		}
		if (msg === 'Welcome to V-160HD.') {
			self._onAuthenticated()
			return
		}

		// Let the queue know first (ACK / ERR / the reply it was waiting for)
		if (self._queue) self._queue.handleMessage(msg)

		try {
			if (/^ACK$/i.test(msg) || /^ERR/i.test(msg)) return
			let changed = false
			const before = self._recording ? self._recordSnapshot() : undefined
			if (/^DTH:/i.test(msg)) {
				const body = msg.slice(4)
				const [addr, value] = body.split(',')
				if (addr && addr.length === 6 && value !== undefined) {
					if (!self.MEM) self.MEM = {}
					mem.capture(self.MEM, addr, value.trim())
					self._handleDTH(
						addr.slice(0, 2).toUpperCase(),
						addr.slice(2, 4).toUpperCase(),
						addr.slice(4, 6).toUpperCase(),
						value.trim().toUpperCase(),
					)
					changed = true
				}
			} else {
				changed = self._handleNamed(msg)
			}
			if (changed) {
				// Only what actually changed gets re-checked, once per batch (src/refresh.js)
				self.scheduleRefresh()
				if (before) self._recordChanges(before)
			}
		} catch (error) {
			self.log('error', `Couldn't make sense of "${msg}": ${error}`)
		}
	},

	// ── Action recorder: changes made on the switcher's panel become actions ──

	_recordSnapshot: function () {
		const D = this.DATA
		const snap = { pgm: D.pgmsource, pvw: D.pvwsource }
		for (let i = 1; i <= 3; i++) snap[`aux${i}`] = D[`aux${i}source`]
		for (let i = 1; i <= 4; i++) snap[`pinp${i}`] = D[`pnpkey${i}source`]
		for (let i = 1; i <= 2; i++) snap[`dsk${i}`] = D[`dsk${i}source`]
		return snap
	},

	_recordChanges: function (before) {
		let self = this
		if (typeof self.recordAction !== 'function') return
		const after = self._recordSnapshot()
		for (const k of Object.keys(after)) {
			if (after[k] === undefined || after[k] === before[k]) continue
			const src = sources.sourceFromHex(after[k])
			if (!src) continue
			let action
			if (k === 'pgm') action = { actionId: 'select_pgm', options: { source: src.id } }
			else if (k === 'pvw') action = { actionId: 'select_pvw', options: { source: src.id } }
			else if (k.startsWith('aux')) action = { actionId: 'aux_assign', options: { aux: k.slice(3), source: src.id } }
			else if (k.startsWith('pinp'))
				action = { actionId: 'pnpkey_setsource', options: { pinp: k.slice(4), source: src.id } }
			else if (k.startsWith('dsk'))
				action = { actionId: 'set_dsk_key_source', options: { dsk: k.slice(3), source: src.id } }
			if (action) self.recordAction(action, k)
		}
	},

	/** Answers to the named (3.40+) commands, and VER. Returns true if anything changed. */
	_handleNamed: function (msg) {
		let self = this
		const parsed = protocol.parseNamed(msg)
		if (!parsed) return false
		const { name, args } = parsed
		const hexOf = (tok) => {
			const s = sources.sourceFromToken(tok)
			return s ? s.hex : undefined
		}
		// Named answers give the physical source and, separately, the input it came from.
		const pick = (phys, input) => hexOf(input) ?? hexOf(phys)
		switch (name) {
			case 'VER':
				self.MODEL = args[0] || self.MODEL
				self.VERSION = args[1] || ''
				self._protocolChosen()
				return true
			case 'PGM': {
				const h = pick(args[0], args[1])
				if (h !== undefined) self.DATA.pgmsource = h
				return true
			}
			case 'PST': {
				const h = pick(args[0], args[1])
				if (h !== undefined) self.DATA.pvwsource = h
				return true
			}
			case 'AUX': {
				const n = /^AUX(\d)$/i.exec(args[0] || '')
				if (!n) return false
				const h = pick(args[1], args[2])
				if (h !== undefined) self.DATA[`aux${n[1]}source`] = h
				return true
			}
			case 'PIS': {
				const n = /^PINP(\d)$/i.exec(args[0] || '')
				if (!n) return false
				const h = pick(args[1], args[2])
				if (h !== undefined) self.DATA[`pnpkey${n[1]}source`] = h
				return true
			}
			case 'DSS': {
				const n = /^DSK(\d)$/i.exec(args[0] || '')
				if (!n) return false
				const h = pick(args[1], args[2])
				if (h !== undefined) self.DATA[`dsk${n[1]}source`] = h
				return true
			}
			case 'TLY':
				args.forEach((v, i) => self._setTally(i, Number(v)))
				return true
			case 'MEM': {
				const n = /^MEMORY(\d+)$/i.exec(args[0] || '')
				self.DATA.lastMemory = n ? Number(n[1]) - 1 : undefined
				return true
			}
			case 'FRZ':
				self.DATA.freeze = /^ON$/i.test(args[0]) ? '01' : '00'
				self._clearFreezePending('freeze')
				return true
			case 'FTB':
				self.DATA.ftb = String(args[0] || '').toUpperCase()
				return true
		}
		return false
	},

	/** Tally by position: 0-31 HDMI/SDI/Still (same as their hex), 32-51 Input 1-20 */
	_setTally: function (index, status) {
		if (!Number.isFinite(status)) return
		if (!this.TALLY) this.TALLY = {}
		const s = sources.sourceFromHex(sources.hexOf(index))
		if (s && this.TALLY[s.id] !== status) {
			const first = this.TALLY[s.id] === undefined
			this.TALLY[s.id] = status
			if (!first) this._tallyChanged()
		}
	},

	/** Low-level answers (DTH:aabbcc,value) */
	_handleDTH: function (param1, param2, param3, value) {
		let self = this
		if (param1 == '0C' && param2 == '00' && param3 == '00') {
			// Tally push (or answer): one byte per source, HDMI/SDI/Still then inputs
			const bytes = self._parseHexBlock(value, value.length / 2) || []
			bytes.forEach((b, i) => self._setTally(i, parseInt(b, 16)))
		}

		if (param1 == '00') {
			if (param2 == '00' && param3 == '11') {
				//aux 1 source
				self.logVerbose('Received Aux 1 Source: ' + value)
				self.DATA.aux1source = value
			} else if (param2 == '00' && param3 == '2E') {
				//aux 2 source (+ aux 3 when responding to 2-byte block query)
				const block2E = self._parseHexBlock(value, 2)
				if (block2E) {
					self.DATA.aux2source = block2E[0]
					self.DATA.aux3source = block2E[1]
					self.logVerbose('Received Aux 2+3 Source: ' + value)
				} else if (self._parseHexBlock(value, 1)) {
					self.DATA.aux2source = value
					self.logVerbose('Received Aux 2 Source: ' + value)
				} else {
					self.log('warn', 'Unexpected DTH value at 00002E: ' + value)
				}
			} else if (param2 == '00' && param3 == '2F') {
				//aux 3 source (single-byte device notification)
				self.logVerbose('Received Aux 3 Source: ' + value)
				self.DATA.aux3source = value
			} else if (param2 == '1B' && param3 == '00') {
				//pnp/key 1 PGM + PVW (2-byte block) or single-byte PGM
				const block1B = self._parseHexBlock(value, 2)
				if (block1B) {
					self.DATA['data_1B00'] = block1B[0]
					self.DATA['data_1B01'] = block1B[1]
					self.logVerbose('Received PinP/Key 1 PGM+PVW: ' + value)
				} else if (self._parseHexBlock(value, 1)) {
					self.DATA['data_1B00'] = value
				} else {
					self.log('warn', 'Unexpected DTH value at 001B00: ' + value)
				}
			} else if (param2 == '1C' && param3 == '00') {
				//pnp/key 2 PGM + PVW (2-byte block) or single-byte PGM
				const block1C = self._parseHexBlock(value, 2)
				if (block1C) {
					self.DATA['data_1C00'] = block1C[0]
					self.DATA['data_1C01'] = block1C[1]
					self.logVerbose('Received PinP/Key 2 PGM+PVW: ' + value)
				} else if (self._parseHexBlock(value, 1)) {
					self.DATA['data_1C00'] = value
				} else {
					self.log('warn', 'Unexpected DTH value at 001C00: ' + value)
				}
			} else if (param2 == '1D' && param3 == '00') {
				//pnp/key 3 PGM + PVW (2-byte block) or single-byte PGM
				const block1D = self._parseHexBlock(value, 2)
				if (block1D) {
					self.DATA['data_1D00'] = block1D[0]
					self.DATA['data_1D01'] = block1D[1]
					self.logVerbose('Received PinP/Key 3 PGM+PVW: ' + value)
				} else if (self._parseHexBlock(value, 1)) {
					self.DATA['data_1D00'] = value
				} else {
					self.log('warn', 'Unexpected DTH value at 001D00: ' + value)
				}
			} else if (param2 == '1E' && param3 == '00') {
				//pnp/key 4 PGM + PVW (2-byte block) or single-byte PGM
				const block1E = self._parseHexBlock(value, 2)
				if (block1E) {
					self.DATA['data_1E00'] = block1E[0]
					self.DATA['data_1E01'] = block1E[1]
					self.logVerbose('Received PinP/Key 4 PGM+PVW: ' + value)
				} else if (self._parseHexBlock(value, 1)) {
					self.DATA['data_1E00'] = value
				} else {
					self.log('warn', 'Unexpected DTH value at 001E00: ' + value)
				}
			} else if (param2 == '1B' && param3 == '02') {
				self.DATA.pnpkey1source = value
				self.logVerbose('Received PinP/Key 1 Source: ' + value)
			} else if (param2 == '1C' && param3 == '02') {
				self.DATA.pnpkey2source = value
				self.logVerbose('Received PinP/Key 2 Source: ' + value)
			} else if (param2 == '1D' && param3 == '02') {
				self.DATA.pnpkey3source = value
				self.logVerbose('Received PinP/Key 3 Source: ' + value)
			} else if (param2 == '1E' && param3 == '02') {
				self.DATA.pnpkey4source = value
				self.logVerbose('Received PinP/Key 4 Source: ' + value)
			} else if (param2 == '00') {
				const p3va = parseInt(param3, 16)
				if (p3va >= 0x00 && p3va <= 0x09) {
					// INPUT 1–10 video assign: 10-byte block at 000000 or individual notifications
					if (p3va === 0x00) {
						const blockVA1 = self._parseHexBlock(value, 10)
						if (blockVA1) {
							if (!Array.isArray(self.DATA.inputAssign)) self.DATA.inputAssign = new Array(20).fill(undefined)
							for (let i = 0; i < 10; i++) self.DATA.inputAssign[i] = blockVA1[i]
							self.logVerbose('Received INPUT 1–10 Video Assign: ' + value)
						} else if (self._parseHexBlock(value, 1)) {
							if (!Array.isArray(self.DATA.inputAssign)) self.DATA.inputAssign = new Array(20).fill(undefined)
							self.DATA.inputAssign[0] = value.toUpperCase()
							self.logVerbose('Received INPUT 1 Video Assign: ' + value)
						} else {
							self.log('warn', 'Unexpected DTH value at 000000: ' + value)
						}
					} else {
						// INPUT 2–10 individual notifications
						if (self._parseHexBlock(value, 1)) {
							if (!Array.isArray(self.DATA.inputAssign)) self.DATA.inputAssign = new Array(20).fill(undefined)
							self.DATA.inputAssign[p3va] = value.toUpperCase()
							self.logVerbose('Received INPUT ' + (p3va + 1) + ' Video Assign: ' + value)
						} else {
							self.log('warn', 'Unexpected DTH value at 0000' + param3.toUpperCase() + ': ' + value)
						}
					}
				} else if (p3va >= 0x24 && p3va <= 0x2d) {
					// INPUT 11–20 video assign: 10-byte block at 000024 or individual notifications
					const slot = p3va - 0x24
					if (p3va === 0x24) {
						const blockVA2 = self._parseHexBlock(value, 10)
						if (blockVA2) {
							if (!Array.isArray(self.DATA.inputAssign)) self.DATA.inputAssign = new Array(20).fill(undefined)
							for (let i = 0; i < 10; i++) self.DATA.inputAssign[10 + i] = blockVA2[i]
							self.logVerbose('Received INPUT 11–20 Video Assign: ' + value)
						} else if (self._parseHexBlock(value, 1)) {
							if (!Array.isArray(self.DATA.inputAssign)) self.DATA.inputAssign = new Array(20).fill(undefined)
							self.DATA.inputAssign[10] = value.toUpperCase()
							self.logVerbose('Received INPUT 11 Video Assign: ' + value)
						} else {
							self.log('warn', 'Unexpected DTH value at 000024: ' + value)
						}
					} else {
						// INPUT 12–20 individual notifications
						if (self._parseHexBlock(value, 1)) {
							if (!Array.isArray(self.DATA.inputAssign)) self.DATA.inputAssign = new Array(20).fill(undefined)
							self.DATA.inputAssign[10 + slot] = value.toUpperCase()
							self.logVerbose('Received INPUT ' + (11 + slot) + ' Video Assign: ' + value)
						} else {
							self.log('warn', 'Unexpected DTH value at 0000' + param3.toUpperCase() + ': ' + value)
						}
					}
				} else {
					self.DATA[`data_${param1}${param2}${param3}`] = value
					self.DATA[`data_${param2}${param3}`] = value
				}
			} else if ((param2 == '1F' || param2 == '20') && (param3 == '03' || param3 == '04')) {
				// DSK 1/2 key source (+ fill source as a 2-byte block)
				const n = param2 == '1F' ? 1 : 2
				const block = self._parseHexBlock(value, 2)
				if (param3 == '03' && block) {
					self.DATA[`dsk${n}source`] = block[0]
					self.DATA[`dsk${n}fill`] = block[1]
				} else if (param3 == '03') {
					self.DATA[`dsk${n}source`] = value
				} else {
					self.DATA[`dsk${n}fill`] = value
				}
			} else if (param2 == '21') {
				if (param3 == '00') {
					//pgm+pvw 2-byte block response or pgm source notification
					const block = self._parseHexBlock(value, 2)
					if (block) {
						self.DATA.pgmsource = block[0]
						self.DATA.pvwsource = block[1]
						self.logVerbose('Received PGM source: ' + block[0] + ', PVW source: ' + block[1])
					} else if (self._parseHexBlock(value, 1)) {
						self.DATA.pgmsource = value.toUpperCase()
						self.logVerbose('Received PGM source: ' + value)
					} else {
						self.log('warn', 'Unexpected value for PGM/PVW source block: ' + value)
					}
				} else if (param3 == '01') {
					//pvw source notification
					if (self._parseHexBlock(value, 1)) {
						self.DATA.pvwsource = value.toUpperCase()
						self.logVerbose('Received PVW source: ' + value)
					} else {
						self.log('warn', 'Unexpected value for PVW source: ' + value)
					}
				}
			} else if (param2 == '18') {
				if (param3 == '00') {
					//transition type+mix+wipe+direction 4-byte block, or single-byte type notification
					const block = self._parseHexBlock(value, 4)
					if (block) {
						self.DATA.transitiontype = parseInt(block[0], 16)
						self.DATA.mixtype = parseInt(block[1], 16)
						self.DATA.wipetype = parseInt(block[2], 16)
						self.DATA.wipedirection = parseInt(block[3], 16)
						self.logVerbose(
							'Received transition block: type=' +
								self.DATA.transitiontype +
								' mix=' +
								self.DATA.mixtype +
								' wipe=' +
								self.DATA.wipetype +
								' dir=' +
								self.DATA.wipedirection,
						)
					} else if (self._parseHexBlock(value, 1)) {
						self.DATA.transitiontype = parseInt(value, 16)
						self.logVerbose('Received Transition Type: ' + value)
					} else {
						self.log('warn', 'Unexpected value for transition data block: ' + value)
					}
				} else if (param3 == '01') {
					//mix type notification
					if (self._parseHexBlock(value, 1)) {
						self.DATA.mixtype = parseInt(value, 16)
						self.logVerbose('Received Mix Type: ' + value)
					} else {
						self.log('warn', 'Unexpected value for mix type: ' + value)
					}
				} else if (param3 == '02') {
					//wipe type notification
					if (self._parseHexBlock(value, 1)) {
						self.DATA.wipetype = parseInt(value, 16)
						self.logVerbose('Received Wipe Type: ' + value)
					} else {
						self.log('warn', 'Unexpected value for wipe type: ' + value)
					}
				} else if (param3 == '03') {
					//wipe direction notification
					if (self._parseHexBlock(value, 1)) {
						self.DATA.wipedirection = parseInt(value, 16)
						self.logVerbose('Received Wipe Direction: ' + value)
					} else {
						self.log('warn', 'Unexpected value for wipe direction: ' + value)
					}
				}
			} else {
				//other data
				self.DATA[`data_${param1}${param2}${param3}`] = value
				self.DATA[`data_${param2}${param3}`] = value
			}
		}

		if (param1 == '02' && param2 == '05') {
			if (param3 == '00') {
				// 18-byte block response or single-byte freeze on/off notification
				const block = self._parseHexBlock(value, 18)
				if (block) {
					self.DATA.freeze = block[0]
					self._clearFreezePending('freeze')
					self.DATA.freeze_type = block[1]
					for (let i = 2; i < block.length; i++) {
						const addrHex = i.toString(16).padStart(2, '0').toUpperCase()
						self.DATA[`freeze_select_${addrHex}`] = block[i]
					}
					self.logVerbose('Received freeze block: ' + value)
				} else if (self._parseHexBlock(value, 1)) {
					self.DATA.freeze = value
					self._clearFreezePending('freeze')
					self.logVerbose('Received Freeze State: ' + value)
				} else {
					self.log('warn', 'Unexpected value for freeze state: ' + value)
				}
			} else if (param3 == '01') {
				if (self._parseHexBlock(value, 1)) {
					self.DATA.freeze_type = value
					self.logVerbose('Received Freeze Type: ' + value)
				} else {
					self.log('warn', 'Unexpected value for freeze type: ' + value)
				}
			} else {
				const p3 = parseInt(param3, 16)
				if (p3 >= 2 && p3 <= 0x11) {
					if (self._parseHexBlock(value, 1)) {
						self.DATA[`freeze_select_${param3.toUpperCase()}`] = value
						self.logVerbose('Received Freeze Select ' + param3 + ': ' + value)
					} else {
						self.log('warn', 'Unexpected value for freeze select ' + param3 + ': ' + value)
					}
				}
			}
		}

		if (param1 == '01' && param2 == '22' && param3 == '03') {
			//aux 1 mute
			self.DATA.aux1mute = value
			self.logVerbose('Received Aux 1 Mute: ' + value)
		}

		if (param1 == '01' && param2 == '25' && param3 == '03') {
			//aux 2 mute
			self.DATA.aux2mute = value
			self.logVerbose('Received Aux 2 Mute: ' + value)
		}

		if (param1 == '01' && param2 == '26' && param3 == '03') {
			//aux 3 mute
			self.DATA.aux3mute = value
			self.logVerbose('Received Aux 3 Mute: ' + value)
		}

		if (param1 == '00' && param2 == '00' && param3 == '0A') {
			//hdmi 1-3 + sdi 1-3 + usb output assign (7-byte block) or single-byte hdmi 1 notification
			const blockOA = self._parseHexBlock(value, 7)
			if (blockOA) {
				self.DATA.hdmi1assign = blockOA[0]
				self.DATA.hdmi2assign = blockOA[1]
				self.DATA.hdmi3assign = blockOA[2]
				self.DATA.sdi1assign = blockOA[3]
				self.DATA.sdi2assign = blockOA[4]
				self.DATA.sdi3assign = blockOA[5]
				self.DATA.usbassign = blockOA[6]
				self.logVerbose('Received HDMI1-3+SDI1-3+USB Output Assign: ' + value)
			} else if (self._parseHexBlock(value, 1)) {
				self.DATA.hdmi1assign = value
				self.logVerbose('Received HDMI 1 Output Assign: ' + value)
			} else {
				self.log('warn', 'Unexpected DTH value at 00000A: ' + value)
			}
		}

		if (param1 == '00' && param2 == '00' && param3 == '0B') {
			//hdmi 2 output assign
			self.DATA.hdmi2assign = value
			self.logVerbose('Received HDMI 2 Output Assign: ' + value)
		}

		if (param1 == '00' && param2 == '00' && param3 == '0C') {
			//hdmi 3 output assign
			self.DATA.hdmi3assign = value
			self.logVerbose('Received HDMI 3 Output Assign: ' + value)
		}

		if (param1 == '00' && param2 == '00' && param3 == '0D') {
			//sdi 1 output assign
			self.DATA.sdi1assign = value
			self.logVerbose('Received SDI 1 Output Assign: ' + value)
		}

		if (param1 == '00' && param2 == '00' && param3 == '0E') {
			//sdi 2 output assign
			self.DATA.sdi2assign = value
			self.logVerbose('Received SDI 2 Output Assign: ' + value)
		}

		if (param1 == '00' && param2 == '00' && param3 == '0F') {
			//sdi 3 output assign
			self.DATA.sdi3assign = value
			self.logVerbose('Received SDI 3 Output Assign: ' + value)
		}

		if (param1 == '00' && param2 == '00' && param3 == '10') {
			//usb output assign
			self.DATA.usbassign = value
			self.logVerbose('Received USB Output Assign: ' + value)
		}

		if (param1 == '02' && param2 == '01' && param3 == '0D') {
			//aux link mode
			self.DATA.auxlinkmode = value
			self.logVerbose('Received Aux Link Mode: ' + value)
		}

		if (param1 == '02' && param2 == '01' && param3 == '54') {
			//aux 1-3 link on/off (3-byte block) or single-byte aux 1
			const block54 = self._parseHexBlock(value, 3)
			if (block54) {
				self.DATA.aux1link = block54[0]
				self.DATA.aux2link = block54[1]
				self.DATA.aux3link = block54[2]
				self.logVerbose('Received Aux 1-3 Link: ' + value)
			} else if (self._parseHexBlock(value, 1)) {
				self.DATA.aux1link = value
				self.logVerbose('Received Aux 1 Link: ' + value)
			} else {
				self.log('warn', 'Unexpected DTH value at 020154: ' + value)
			}
		}

		if (param1 == '02' && param2 == '01' && param3 == '55') {
			//aux 2 link
			self.DATA.aux2link = value
			self.logVerbose('Received Aux 2 Link: ' + value)
		}

		if (param1 == '02' && param2 == '01' && param3 == '56') {
			//aux 3 link
			self.DATA.aux3link = value
			self.logVerbose('Received Aux 3 Link: ' + value)
		}

		if (param1 == '02' && param2 == '01' && param3 == '16') {
			//monitor assign block (020116–020119) or single monitor 1 notification
			const block = self._parseHexBlock(value, 4)
			if (block) {
				self.DATA.monitor1assign = block[0]
				self.DATA.monitor2assign = block[1]
				self.DATA.monitor3assign = block[2]
				self.DATA.monitor4assign = block[3]
				self.logVerbose('Received monitor assign block: ' + value)
			} else if (self._parseHexBlock(value, 1)) {
				self.DATA.monitor1assign = value.toUpperCase()
				self.logVerbose('Received Monitor 1 Assign: ' + value)
			} else {
				self.log('warn', 'Unexpected value for monitor assign block: ' + value)
			}
		}

		if (param1 == '02' && param2 == '01' && param3 == '17') {
			//monitor 2 assign notification
			if (self._parseHexBlock(value, 1)) {
				self.DATA.monitor2assign = value.toUpperCase()
				self.logVerbose('Received Monitor 2 Assign: ' + value)
			} else {
				self.log('warn', 'Unexpected value for monitor 2 assign: ' + value)
			}
		}

		if (param1 == '02' && param2 == '01' && param3 == '18') {
			//monitor 3 assign notification
			if (self._parseHexBlock(value, 1)) {
				self.DATA.monitor3assign = value.toUpperCase()
				self.logVerbose('Received Monitor 3 Assign: ' + value)
			} else {
				self.log('warn', 'Unexpected value for monitor 3 assign: ' + value)
			}
		}

		if (param1 == '02' && param2 == '01' && param3 == '19') {
			//monitor 4 assign notification
			if (self._parseHexBlock(value, 1)) {
				self.DATA.monitor4assign = value.toUpperCase()
				self.logVerbose('Received Monitor 4 Assign: ' + value)
			} else {
				self.log('warn', 'Unexpected value for monitor 4 assign: ' + value)
			}
		}

		if (param1 == '60') {
			// Memory names: 8 ASCII bytes per memory, padded with spaces or NULs
			const memoryNumber = parseInt(param2, 16)
			const block8 = self._parseHexBlock(value, 8)
			if (param3 == '00' && block8) {
				self.DATA[`memory${memoryNumber}`] = block8
					.map((h) => parseInt(h, 16))
					.filter((c) => c >= 0x20 && c < 0x7f)
					.map((c) => String.fromCharCode(c))
					.join('')
					.trim()
			}
		}

		if (param1 == '0A' && param2 == '00' && param3 == '03') {
			// Last memory loaded
			self.DATA.lastMemory = parseInt(value, 16)
		}
	},

	sendCommand: function (address, value, opts) {
		let self = this
		if (!self._queue) return
		const cmd = 'DTH:' + String(address).toUpperCase() + ',' + String(value).toUpperCase() + ';'
		self._queue.enqueue({
			cmd,
			kind: 'write',
			repeatable: !(opts && opts.repeatable === false),
			onError: (code) => self._commandRefused(cmd, code, opts),
		})
	},

	/** Send a named (3.40+) command */
	sendNamed: function (cmd, opts) {
		let self = this
		if (!self._queue) return
		const full = cmd.endsWith(';') ? cmd : cmd + ';'
		self._queue.enqueue({
			cmd: full,
			kind: 'write',
			repeatable: !(opts && opts.repeatable === false),
			onError: (code) => self._commandRefused(full, code, opts),
		})
	},

	/** The switcher said ERR: say why in plain words */
	_commandRefused: function (cmd, code, opts) {
		let self = this
		const why = protocol.errorText(code)
		let extra = ''
		if (opts && opts.needsNamed && self.PROTOCOL !== 'named') {
			extra = " Input 11-20 here needs switcher firmware 3.40 or later (Roland's named commands)."
		}
		self.log('warn', `The switcher turned down ${String(cmd).replace(/;$/, '')}: ${why}.${extra}`)
	},

	requestData: function (command) {
		this.sendRawCommand('RQH:' + command + ';')
	},

	/** Raw text from the old "send raw" paths: DTH writes, RQH reads, or named commands */
	sendRawCommand: function (command) {
		let self = this
		if (!self._queue) return
		let cmd = String(command).trim()
		if (!cmd.endsWith(';')) cmd += ';'
		if (/^RQH:/i.test(cmd)) return self._read(cmd.toUpperCase())
		if (/^DTH:/i.test(cmd)) {
			self._queue.enqueue({ cmd: cmd.toUpperCase(), kind: 'write', onError: (code) => self._commandRefused(cmd, code) })
			return
		}
		if (/^(VER|Q)/i.test(cmd)) return self._read(cmd)
		self.sendNamed(cmd)
	},

	logVerbose: function (message) {
		if (this.config && this.config.verbose) this.log('debug', message)
	},

	calculateBytes: function (value, scale = 10) {
		// Roland: 8-bit data is split into 7-bit sections, two 7-bit bytes make 14 bits.
		const scaled = Math.round(value * scale) & 0x3fff
		const lsb = scaled & 0x7f
		const msb = (scaled >> 7) & 0x7f
		return [msb, lsb]
	},

	formatBytes: function (bytes) {
		return bytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join('')
	},
}
