'use strict'

/**
 * Companion 5 skips an action or feedback outright if any of its options is
 * blank or not one of its choices, hidden options included. These helpers make
 * sure every option has a value: presets carry all of them, and an upgrade fills
 * the gaps on buttons made before.
 */

/** Fill missing options from a definition's options (presets, where definitions exist) */
function fillFromDefinition(options, defOptions) {
	const out = options || {}
	for (const o of defOptions || []) {
		if (o.type === 'static-text' || !o.id) continue
		if (out[o.id] === undefined && o.default !== undefined) out[o.id] = o.default
	}
	return out
}

/** Walk preset definitions (simple and layered) and fill every action/feedback's options */
function fillPresets(presets, actionDefs, feedbackDefs) {
	const seen = new Set()
	const walk = (x) => {
		if (!x || typeof x !== 'object' || seen.has(x)) return
		seen.add(x)
		if (Array.isArray(x)) return x.forEach(walk)
		if (typeof x.actionId === 'string' && actionDefs[x.actionId]) {
			x.options = fillFromDefinition(x.options, actionDefs[x.actionId].options)
		} else if (typeof x.feedbackId === 'string' && feedbackDefs[x.feedbackId]) {
			x.options = fillFromDefinition(x.options, feedbackDefs[x.feedbackId].options)
		}
		for (const v of Object.values(x)) if (v && typeof v === 'object') walk(v)
	}
	walk(presets)
	return presets
}

/**
 * Defaults for the options that presets and upgrades left blank, worked out
 * without a running connection (for upgrade scripts). Returns { id: default } or null.
 */
function staticDefaults(kind, id) {
	const T = require('./systemTable')
	const { USER_SW_CATEGORIES } = require('./userSw')
	const tally = require('./tally')
	if (kind === 'action' && id === 'system_usersw') {
		const d = { sw: '1', cat: 'macro' }
		for (const c of USER_SW_CATEGORIES) if (c.items.length >= 2) d[`item_${c.id}`] = '0'
		return d
	}
	if (kind === 'action' && id.startsWith('system_')) {
		const settings = T.SETTINGS.filter((s) => s.menu === id.slice('system_'.length))
		if (!settings.length) return null
		const d = { setting: settings[0].id }
		for (const s of settings) d[`v_${s.id}`] = 'next'
		return d
	}
	if (kind === 'feedback' && id === 'systemIs') {
		const d = { setting: T.SETTINGS[0].id }
		for (const s of T.SETTINGS) d[`v_${s.id}`] = String(s.values[0].v)
		return d
	}
	if (kind === 'feedback' && id === 'tallyLook') {
		const d = { input: 'INPUT1', custom: false, ownColours: false }
		for (const g of tally.TALLY_GROUPS) d[`show_${g.id}`] = 'on'
		for (const [k, v] of Object.entries(tally.TALLY_DEFAULT_COLOURS)) d[`c_${k}`] = v
		return d
	}
	if (kind === 'feedback' && id === 'tally') return { input: 'INPUT1', state: 'program' }
	return null
}

module.exports = { fillFromDefinition, fillPresets, staticDefaults }
