'use strict'

/**
 * Upgrade scripts. Companion runs each one once per connection, in order.
 * Options can arrive plain or wrapped as { value, isExpression } (base 2.x),
 * so every read and write goes through get()/set() below.
 */

const sources = require('./sources')

function wrapped(v) {
	return v && typeof v === 'object' && !Array.isArray(v) && 'isExpression' in v && 'value' in v
}

/** An option's plain value, or undefined if it's an expression (left alone) */
function get(options, key) {
	const v = options[key]
	if (wrapped(v)) return v.isExpression ? undefined : v.value
	return v
}

/** Set an option, keeping the wrapper style it came in */
function set(options, key, value) {
	const v = options[key]
	if (wrapped(v)) options[key] = { ...v, value }
	else if (v === undefined && Object.values(options).some(wrapped)) options[key] = { value, isExpression: false }
	else options[key] = value
}

/** Move an option to a new key (expression or not) */
function rename(options, from, to) {
	if (from in options) {
		options[to] = options[from]
		delete options[from]
	}
}

/** Old hex source code ('2A', '0A') -> token ('INPUT11', 'SDI3') */
const tokenFromHex = (hex) => sources.sourceFromHex(String(hex ?? ''))?.id
/** Old numeric source (0-31, decimal) -> token */
const tokenFromNum = (n) => (Number.isInteger(Number(n)) ? tokenFromHex(sources.hexOf(Number(n))) : undefined)

/** Convert the option `key` with fn; only if it isn't an expression */
function convert(options, key, fn) {
	const v = get(options, key)
	if (v === undefined) return false
	const nv = fn(v)
	if (nv === undefined || nv === v) return false
	set(options, key, nv)
	return true
}

const AUX_ADDR = { '000011': '1', '00002E': '2', '00002F': '3' }
const PINP_HEX = { '1B': '1', '1C': '2', '1D': '3', '1E': '4' }
const PINP_NUM = { 27: '1', 28: '2', 29: '3', 30: '4' }
const DSK_NUM = { 31: '1', 32: '2' }

/** 2.x rebel: one source list everywhere, merged duplicate actions */
function upgradeToRebelRouting(_context, props) {
	const updatedActions = []
	const updatedFeedbacks = []

	for (const a of props.actions) {
		const o = a.options
		let changed = false
		switch (a.actionId) {
			case 'select_pgm':
			case 'select_pvw':
				rename(o, 'input', 'source')
				changed = convert(o, 'source', tokenFromHex) || 'source' in o
				break
			case 'aux_assign':
				changed = convert(o, 'aux', (v) => AUX_ADDR[String(v).toUpperCase()])
				rename(o, 'assign', 'source')
				changed = convert(o, 'source', tokenFromHex) || changed || 'source' in o
				break
			case 'pnpkey_setsource':
				changed = convert(o, 'pinp', (v) => PINP_HEX[String(v).toUpperCase()])
				changed = convert(o, 'source', tokenFromHex) || changed
				break
			case 'set_pinp_source':
				a.actionId = 'pnpkey_setsource'
				convert(o, 'pinp', (v) => PINP_NUM[Number(v)])
				rename(o, 'assign', 'source')
				convert(o, 'source', tokenFromNum)
				changed = true
				break
			case 'set_dsk_key_source':
			case 'set_dsk_fill_source':
				convert(o, 'dsk', (v) => DSK_NUM[Number(v)])
				rename(o, 'assign', 'source')
				convert(o, 'source', tokenFromNum)
				changed = true
				break
			case 'input_assign':
				rename(o, 'input', 'slot')
				convert(o, 'slot', (v) => (Number.isInteger(Number(v)) ? `INPUT${Number(v) + 1}` : undefined))
				rename(o, 'assign', 'source')
				convert(o, 'source', tokenFromNum)
				changed = true
				break
		}
		if (changed) updatedActions.push(a)
	}

	for (const f of props.feedbacks) {
		const o = f.options
		let changed = false
		switch (f.feedbackId) {
			case 'tally':
				// old ids: 0-31 HDMI/SDI/Still, 32-41 XPT 1-10 (= Input 1-10)
				changed = convert(o, 'input', (v) => {
					const n = Number(v)
					if (!Number.isInteger(n)) return undefined
					return n >= 32 && n <= 51 ? `INPUT${n - 31}` : tokenFromNum(n)
				})
				break
			case 'auxTally':
				changed = convert(o, 'assign', tokenFromHex)
				break
			case 'pnpKeySource':
				changed = convert(o, 'source', tokenFromHex)
				break
		}
		if (changed) updatedFeedbacks.push(f)
	}

	return { updatedConfig: null, updatedActions, updatedFeedbacks }
}

/** Connection settings: port, polling defaults, command set */
function upgradeRebelConfig(_context, props) {
	const c = props.config
	if (!c) return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
	const next = { ...c }
	if (next.port === undefined || next.port === '') next.port = '8023'
	if (next.protocol === undefined) next.protocol = 'auto'
	if (next.pollingrate !== undefined) next.pollingrate = String(next.pollingrate)
	for (const [k, d] of [
		['timeout', '500'],
		['gap', '20'],
		['retries', '1'],
		['silence', '5'],
	]) {
		if (next[k] === undefined) next[k] = d
	}
	return { updatedConfig: next, updatedActions: [], updatedFeedbacks: [] }
}

/** 'Can be set by the action' ticks -> 'set by an action' flags (new Set connection settings pattern) */
function upgradeSetByAction(_context, props) {
	const c = props.config
	if (!c) return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
	const next = { ...c }
	let changed = false
	for (const k of Object.keys(c)) {
		const m = /^(.+)_byAction$/.exec(k)
		if (!m) continue
		// A ticked field was the action's: keep it that way (its typed value is already in actionSaved)
		if (c[k] === true) next[`${m[1]}_set`] = true
		delete next[k]
		changed = true
	}
	return { updatedConfig: changed ? next : null, updatedActions: [], updatedFeedbacks: [] }
}

module.exports = [
	function () {
		return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
	},
	// Upstream: feedbacks saved with an invalid default option value
	function (_context, props) {
		const updatedFeedbacks = []
		for (const feedback of props.feedbacks) {
			let changed = false
			if (['auxTally', 'auxMute', 'auxLink'].includes(feedback.feedbackId) && get(feedback.options, 'aux') === '11') {
				set(feedback.options, 'aux', 'aux1')
				changed = true
			} else if (feedback.feedbackId === 'pnpKeySource' && get(feedback.options, 'pinp') === '1B') {
				set(feedback.options, 'pinp', 'pnpkey1')
				changed = true
			}
			if (changed) updatedFeedbacks.push(feedback)
		}
		return { updatedConfig: null, updatedActions: [], updatedFeedbacks }
	},
	upgradeToRebelRouting,
	upgradeRebelConfig,
	upgradeSetByAction,
]

module.exports.upgradeToRebelRouting = upgradeToRebelRouting
module.exports.upgradeRebelConfig = upgradeRebelConfig
module.exports.upgradeSetByAction = upgradeSetByAction
module.exports._test = { get, set, tokenFromHex, tokenFromNum }
