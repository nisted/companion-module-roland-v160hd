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

/** rebel.4: labels, naming, system settings, tally look: fill in the new connection settings */
function upgradeRebel4Config(_context, props) {
	const c = props.config
	if (!c) return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
	const { TALLY_DEFAULT_COLOURS, TALLY_GROUPS } = require('./tally')
	const sources = require('./sources')
	const defaults = {
		inputNaming: 'xpt',
		buttonText: 'labelOnly',
		labelrefresh: '30',
		allowSystem: true,
		allowRisky: false,
		confirmSecs: '5',
		tallyBorder: '5',
	}
	for (const [k, v] of Object.entries(TALLY_DEFAULT_COLOURS)) defaults[`tallyColour_${k}`] = v
	for (const g of TALLY_GROUPS) defaults[`tallyShow_${g.id}`] = sources.SOURCES.map((s) => s.id)
	const next = { ...c }
	let changed = false
	for (const [k, v] of Object.entries(defaults)) {
		if (next[k] === undefined) {
			next[k] = v
			changed = true
		}
	}
	return { updatedConfig: changed ? next : null, updatedActions: [], updatedFeedbacks: [] }
}

/**
 * rebel.5: one tally feedback. Old boolean Tally State buttons and rebel.4's
 * "Tally: full look" both become the one advanced Tally State (id 'tally').
 *  - Old Tally State (has 'state', no 'custom'): Change default behaviour on, same
 *    state (switcher tally, as before), PGM/PVW colours only, no markers.
 *  - Tally: full look: renamed to 'tally', 'source' -> 'input'; Change default
 *    behaviour on only if it had anything other than the defaults.
 */
function upgradeRebel5Tally(_context, props) {
	const updatedFeedbacks = []
	const groups = ['main', 'pinp', 'key', 'dsk', 'aux']
	for (const f of props.feedbacks) {
		const o = f.options
		if (f.feedbackId === 'tally' && 'state' in o && !('custom' in o)) {
			set(o, 'custom', true)
			set(o, 'show_main', 'on')
			for (const g of groups.slice(1)) set(o, `show_${g}`, 'off')
			set(o, 'ownColours', false)
			updatedFeedbacks.push(f)
		} else if (f.feedbackId === 'tallyLook') {
			f.feedbackId = 'tally'
			rename(o, 'source', 'input')
			const own = get(o, 'ownColours') === true
			const groupsChanged = groups.some((g) => {
				const v = o[`show_${g}`]
				return v !== undefined && (wrapped(v) ? v.isExpression || v.value !== 'default' : v !== 'default')
			})
			set(o, 'custom', own || groupsChanged)
			set(o, 'state', 'full')
			updatedFeedbacks.push(f)
		}
	}
	return { updatedConfig: null, updatedActions: [], updatedFeedbacks }
}

/**
 * rebel.6: Tally State back to upstream (on/off, so style overrides work again),
 * the full look as its own feedback, Multi Tally (id 'tallyLook').
 *  - 'tally' carrying rebel.5 look options with state 'full' (or none): was a full
 *    look (rebel.4 Tally: full look, or a rebel.5 preset) -> Multi Tally.
 *  - Any other 'tally': upstream Tally State. Look options removed; state kept if
 *    it's Program/Preview/Both, 'Either' or missing -> Program (A).
 *  - Multi Tally gets any missing options at their defaults.
 *  - Config: Tally State type = Both where it isn't set.
 */
function upgradeRebel6Tally(_context, props) {
	const { TALLY_DEFAULT_COLOURS, TALLY_GROUPS } = require('./tally')
	const lookKeys = ['custom', 'ownColours', ...TALLY_GROUPS.map((g) => `show_${g.id}`)]
	const colourKeys = Object.keys(TALLY_DEFAULT_COLOURS).map((k) => `c_${k}`)
	const fillLook = (o) => {
		if (!('custom' in o)) set(o, 'custom', false)
		if (!('ownColours' in o)) set(o, 'ownColours', false)
		for (const g of TALLY_GROUPS) if (!(`show_${g.id}` in o)) set(o, `show_${g.id}`, 'on')
		for (const [k, v] of Object.entries(TALLY_DEFAULT_COLOURS)) if (!(`c_${k}` in o)) set(o, `c_${k}`, v)
	}
	const updatedFeedbacks = []
	for (const f of props.feedbacks) {
		const o = f.options
		if (f.feedbackId === 'tallyLook') {
			rename(o, 'source', 'input')
			delete o.state
			fillLook(o)
			updatedFeedbacks.push(f)
		} else if (f.feedbackId === 'tally') {
			const st = get(o, 'state')
			const hadLook = lookKeys.some((k) => k in o)
			if (hadLook && (st === undefined || st === 'full')) {
				f.feedbackId = 'tallyLook'
				delete o.state
				fillLook(o)
			} else {
				for (const k of [...lookKeys, ...colourKeys, 'borderWidth']) delete o[k]
				if (!['program', 'preview', 'both'].includes(st)) set(o, 'state', 'program')
			}
			updatedFeedbacks.push(f)
		}
	}
	const c = props.config
	let updatedConfig = null
	if (c && c.tallyMode === undefined) updatedConfig = { ...c, tallyMode: 'both' }
	return { updatedConfig, updatedActions: [], updatedFeedbacks }
}

/**
 * rebel.7: Companion 5 skips an action/feedback with any blank option. Presets
 * before rebel.7 only filled some options (system actions, System: setting is,
 * USER SW assign, Multi Tally), so fill every blank one with its default.
 */
function upgradeRebel7FillOptions(_context, props) {
	const { staticDefaults } = require('./optionDefaults')
	const fill = (list, kind, idKey) => {
		const out = []
		for (const x of list) {
			const d = staticDefaults(kind, x[idKey])
			if (!d) continue
			let changed = false
			for (const [k, v] of Object.entries(d)) {
				const cur = x.options[k]
				const blank =
					cur === undefined ||
					cur === null ||
					cur === '' ||
					(wrapped(cur) && !cur.isExpression && (cur.value === undefined || cur.value === null || cur.value === ''))
				if (blank) {
					if (wrapped(cur)) x.options[k] = { ...cur, value: v }
					else set(x.options, k, v)
					changed = true
				}
			}
			if (changed) out.push(x)
		}
		return out
	}
	// Upstream defaults that were never valid choices (Companion 5 skips them)
	const badDefaults = {
		aux_mute: { aux: ['000011', '012203'], mute: [1, '01'] },
		freezeSwitchSelectEnableDisable: { enable: [1, '01'] },
	}
	const fixed = []
	for (const a of props.actions) {
		const b = badDefaults[a.actionId]
		if (!b) continue
		let changed = false
		for (const [k, [from, to]] of Object.entries(b)) {
			const v = get(a.options, k)
			if (v === undefined && !(k in a.options)) {
				set(a.options, k, to)
				changed = true
			} else if (v !== undefined && String(v) === String(from)) {
				set(a.options, k, to)
				changed = true
			}
		}
		if (changed) fixed.push(a)
	}
	const filled = fill(props.actions, 'action', 'actionId')
	return {
		updatedConfig: null,
		updatedActions: [...new Set([...fixed, ...filled])],
		updatedFeedbacks: fill(props.feedbacks, 'feedback', 'feedbackId'),
	}
}

/** rebel.8: the snapshot pickers on the connection page get a real 'nothing picked' value */
function upgradeRebel8Config(_context, props) {
	const c = props.config
	if (!c) return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
	const NONE = '__none__'
	const next = { ...c }
	let changed = false
	for (const k of ['snapRestore', 'snapRename', 'snapDelete']) {
		if (next[k] === undefined || next[k] === null || next[k] === '') {
			next[k] = NONE
			changed = true
		}
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
	upgradeRebel4Config,
	upgradeRebel5Tally,
	upgradeRebel6Tally,
	upgradeRebel7FillOptions,
	upgradeRebel8Config,
]

module.exports.upgradeToRebelRouting = upgradeToRebelRouting
module.exports.upgradeRebelConfig = upgradeRebelConfig
module.exports.upgradeSetByAction = upgradeSetByAction
module.exports.upgradeRebel4Config = upgradeRebel4Config
module.exports.upgradeRebel5Tally = upgradeRebel5Tally
module.exports.upgradeRebel6Tally = upgradeRebel6Tally
module.exports.upgradeRebel7FillOptions = upgradeRebel7FillOptions
module.exports.upgradeRebel8Config = upgradeRebel8Config
module.exports._test = { get, set, tokenFromHex, tokenFromNum }
