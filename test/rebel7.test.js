'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')
const upgrades = require('../src/upgrades')

function build(cfg) {
	const f = makeFake({ allowRisky: true, ...cfg })
	f.self.initActions()
	f.self.initFeedbacks()
	f.self.initVariables()
	f.self.initPresets()
	return f.self
}

/** Every action/feedback inside the presets, simple and layered */
function presetEntities(presets) {
	const out = []
	const walk = (x) => {
		if (!x || typeof x !== 'object') return
		if (Array.isArray(x)) return x.forEach(walk)
		if (typeof x.actionId === 'string') out.push(['action', x])
		else if (typeof x.feedbackId === 'string') out.push(['feedback', x])
		for (const v of Object.values(x)) walk(v)
	}
	walk(presets)
	return out
}

const isValid = (o, v) => {
	if (o.type === 'dropdown') return o.choices.some((c) => String(c.id) === String(v)) || o.allowCustom
	if (o.type === 'checkbox') return typeof v === 'boolean'
	if (o.type === 'colorpicker') return typeof v === 'number' || typeof v === 'string'
	return v !== undefined
}

test('presets: every action and feedback carries every option, all valid (Companion 5 skips blanks)', () => {
	const self = build()
	let n = 0
	for (const [kind, e] of presetEntities(self.presetDefs)) {
		const def = kind === 'action' ? self.actionDefs[e.actionId] : self.feedbackDefs[e.feedbackId]
		assert.ok(def, `${kind} ${e.actionId || e.feedbackId} exists`)
		for (const o of def.options || []) {
			if (o.type === 'static-text') continue
			assert.ok(isValid(o, e.options[o.id]), `${e.actionId || e.feedbackId}.${o.id} = ${e.options[o.id]}`)
		}
		n++
	}
	assert.ok(n > 1000)
})

test('every option default is valid', () => {
	const self = build()
	const bad = []
	for (const defs of [self.actionDefs, self.feedbackDefs])
		for (const [id, d] of Object.entries(defs))
			for (const o of d.options || []) {
				if (o.type === 'static-text' || o.default === undefined) continue
				if (!isValid(o, o.default)) bad.push(`${id}.${o.id}=${o.default}`)
			}
	assert.deepEqual(bad, [])
})

test('hide rules only point at fields without the expression toggle (Companion rule)', () => {
	const self = build()
	for (const defs of [self.actionDefs, self.feedbackDefs])
		for (const [id, d] of Object.entries(defs)) {
			const byId = Object.fromEntries((d.options || []).map((o) => [o.id, o]))
			for (const o of d.options || [])
				for (const m of String(o.isVisibleExpression || '').matchAll(/options:(\w+)/g))
					assert.equal(byId[m[1]]?.disableAutoExpression, true, `${id}.${o.id} hides by ${m[1]}`)
		}
})

test('Multi Tally wording and defaults', () => {
	const self = build()
	const opts = self.feedbackDefs.tallyLook.options
	const show = opts.find((o) => o.id === 'show_pinp')
	assert.equal(show.default, 'on')
	assert.deepEqual(
		show.choices.map((c) => c.label),
		['Show', 'Hide', 'Default'],
	)
	assert.equal(opts.find((o) => o.id === 'ownColours').label, 'Customise colours')
})

test('upgrade: blank options on old buttons are filled', () => {
	const actions = [
		{ actionId: 'system_test', options: { setting: 'test_pattern', v_test_pattern: 'next' } },
		{ actionId: 'system_usersw', options: { sw: '2', cat: 'macro', item_macro: '5' } },
		{ actionId: 'select_pgm', options: { source: 'INPUT1' } },
		{ actionId: 'aux_mute', options: { aux: '000011', mute: 1 } },
	]
	const feedbacks = [
		{ feedbackId: 'tallyLook', options: { input: { isExpression: false, value: 'HDMI1' } } },
		{ feedbackId: 'systemIs', options: { setting: 'test_pattern' } },
	]
	const r = upgrades.upgradeRebel7FillOptions({}, { actions, feedbacks, config: null })
	assert.equal(r.updatedActions.length, 3)
	const mute = r.updatedActions.find((a) => a.actionId === 'aux_mute').options
	assert.deepEqual([mute.aux, mute.mute], ['012203', '01'])
	const sys = r.updatedActions.find((a) => a.actionId === 'system_test').options
	assert.equal(sys.v_test_pattern, 'next', 'existing value kept')
	assert.ok(Object.keys(sys).length > 2)
	assert.equal(r.updatedActions.find((a) => a.actionId === 'system_usersw').options.item_macro, '5')
	const look = r.updatedFeedbacks[0].options
	assert.deepEqual(look.custom, { isExpression: false, value: false })
	assert.deepEqual(look.show_aux, { isExpression: false, value: 'on' })
	assert.equal(r.updatedFeedbacks.length, 2)
	// Every default it filled is a valid choice
	const self = build()
	for (const a of r.updatedActions)
		for (const o of self.actionDefs[a.actionId].options)
			if (o.type !== 'static-text') assert.ok(isValid(o, a.options[o.id]), `${a.actionId}.${o.id}`)
})
