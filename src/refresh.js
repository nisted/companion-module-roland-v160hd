'use strict'

/**
 * Change-only refresh (rebel.5 lag fix).
 *
 * Before: every reply from the switcher re-ran every feedback (the tally look
 * draws an image per button) and re-sent every variable, even when nothing had
 * changed. A polling round brings in a dozen-plus replies, so Companion was
 * being asked to redraw everything many times a second.
 *
 * Now:
 *  - Replies only mark that something may have changed. One refresh runs per
 *    batch (BATCH_MS after the first reply), or straight away after a button press.
 *  - The refresh compares the state each feedback reads against last time and
 *    only re-checks the feedbacks whose state actually changed.
 *  - Variables are only sent when their value changed (see checkVariables).
 */

const BATCH_MS = 50

/** Which parts of the state each feedback reads. Anything not listed reads 'data'. */
const FEEDBACK_DEPS = {
	tally: ['data', 'tally', 'mem00'],
	labelMatches: ['labels'],
	systemIs: ['sys'],
	confirmPending: [],
	freeze: ['data', 'freeze'],
	keyOnAir: ['data', 'mem00'],
}

/** Label addresses: 02 10 00 to 02 3D 07 */
const isLabelAddr = (a) => {
	if (a.slice(0, 2) !== '02') return false
	const mid = parseInt(a.slice(2, 4), 16)
	return mid >= 0x10 && mid <= 0x3d
}

module.exports = {
	REFRESH_BATCH_MS: BATCH_MS,
	FEEDBACK_DEPS,

	/** A fingerprint of each part of the state */
	_stateSlices: function () {
		const M = this.MEM || {}
		let mem00 = ''
		let labels = ''
		let sys = ''
		for (const k in M) {
			const part = `${k}=${M[k]};`
			if (k.startsWith('00')) mem00 += part
			else if (isLabelAddr(k)) labels += part
			else sys += part
		}
		const fp = this._freezePending || {}
		return {
			data: JSON.stringify(this.DATA || {}),
			tally: JSON.stringify(this.TALLY || {}),
			freeze: Object.keys(fp)
				.map((k) => `${k}=${fp[k].value}`)
				.join(';'),
			mem00,
			labels,
			sys,
		}
	},

	/** Something may have changed: refresh soon (or now, after a button press) */
	scheduleRefresh: function (now = false) {
		if (now) {
			clearTimeout(this._refreshTimer)
			this._refreshTimer = undefined
			this.refreshChanged()
			return
		}
		if (this._refreshTimer) return
		this._refreshTimer = setTimeout(() => {
			this._refreshTimer = undefined
			this.refreshChanged()
		}, BATCH_MS)
	},

	/** Re-check only what changed. Returns the feedback ids it checked. */
	refreshChanged: function () {
		const now = this._stateSlices()
		const before = this._lastSlices
		this._lastSlices = now
		const changed = new Set()
		for (const k of Object.keys(now)) if (!before || before[k] !== now[k]) changed.add(k)
		if (changed.size === 0) return []
		if (changed.has('labels') || changed.has('data')) {
			if (typeof this._labelsChanged === 'function') this._labelsChanged()
		}
		const ids = (this._feedbackIds || []).filter((id) => {
			const deps = FEEDBACK_DEPS[id] || ['data']
			return deps.some((d) => changed.has(d))
		})
		if (ids.length) this.checkFeedbacks(...ids)
		this.checkVariables()
		return ids
	},

	/** After the definitions are rebuilt: everything once, then change-only again */
	refreshAll: function () {
		clearTimeout(this._refreshTimer)
		this._refreshTimer = undefined
		this._lastSlices = this._stateSlices()
		this._varCache = undefined
		this.checkAllFeedbacks()
		this.checkVariables()
	},

	stopRefresh: function () {
		clearTimeout(this._refreshTimer)
		this._refreshTimer = undefined
	},
}
