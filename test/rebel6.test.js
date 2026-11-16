'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')
const upgrades = require('../src/upgrades')

function build(cfg) {
	const f = makeFake(cfg)
	f.self.initActions()
	f.self.initFeedbacks()
	f.self.initVariables()
	f.self.initPresets()
	return f
}

test('Tally State type: Both (default) offers Tally State and Multi Tally', () => {
	const { self } = build()
	assert.equal(self.feedbackDefs.tally.type, 'boolean')
	assert.equal(self.feedbackDefs.tallyLook.type, 'advanced')
	assert.equal(self.feedbackDefs.tallyLook.name, 'Multi Tally')
})

test('Tally State type: Upstream = Tally State only; Full look = Multi Tally only', () => {
	let { self } = build({ tallyMode: 'upstream' })
	assert.ok(self.feedbackDefs.tally)
	assert.equal(self.feedbackDefs.tallyLook, undefined)
	;({ self } = build({ tallyMode: 'look' }))
	assert.equal(self.feedbackDefs.tally, undefined)
	assert.ok(self.feedbackDefs.tallyLook)
})

test('Tally State is upstream: name, options, three states, switcher tally', () => {
	const { self } = build()
	const d = self.feedbackDefs.tally
	assert.equal(d.name, 'Tally State')
	assert.equal(d.description, 'Indicate if Input Channel is in Preview or Program')
	assert.deepEqual(
		d.options.map((o) => [o.id, o.label]),
		[
			['input', 'Input Channel'],
			['state', 'Indicate in X State'],
		],
	)
	assert.deepEqual(
		d.options[1].choices.map((c) => c.label),
		['Program (A)', 'Preview (B)', 'Both'],
	)
	self.TALLY.HDMI3 = 2
	const cb = (state) => d.callback({ options: { input: 'HDMI3', state } })
	assert.equal(cb('program'), false)
	assert.equal(cb('preview'), true)
	assert.equal(cb('both'), false)
	self.TALLY.HDMI3 = 3
	assert.equal(cb('both'), true)
})

test('Multi Tally: tells Companion what it changes; hidden options until Change default behaviour', () => {
	const { self } = build()
	const d = self.feedbackDefs.tallyLook
	assert.deepEqual(d.affectedProperties, ['bgcolor', 'imageBuffer'])
	assert.ok(!d.options.some((o) => o.id === 'state'), 'no Indicate in X State on Multi Tally')
	assert.deepEqual(
		d.options.slice(0, 2).map((o) => o.id),
		['input', 'custom'],
	)
	for (const o of d.options.slice(2)) assert.match(o.isVisibleExpression, /\$\(options:custom\)/, o.id)
	self.DATA.pgmsource = '02'
	const r = d.callback({
		options: { input: 'HDMI3', custom: false, show_main: 'off' },
		image: { width: 72, height: 72 },
	})
	assert.equal(r.bgcolor, 0xcc0000, 'hidden options ignored while Change default behaviour is off')
})

test('upgrade: rebel.5 buttons go back (Tally State upstream, look -> Multi Tally), gaps filled', () => {
	const feedbacks = [
		// old Tally State as rebel.5 left it
		{
			feedbackId: 'tally',
			options: {
				input: 'INPUT3',
				state: 'preview',
				custom: true,
				show_main: 'on',
				show_pinp: 'off',
				ownColours: false,
			},
		},
		// rebel.4 full look as rebel.5 left it
		{ feedbackId: 'tally', options: { input: 'HDMI2', custom: true, state: 'full', show_aux: 'off' } },
		// old Tally State that rebel.5 never touched (state not stored)
		{ feedbackId: 'tally', options: { input: 'INPUT2' } },
		// rebel.4 Either
		{ feedbackId: 'tally', options: { input: 'INPUT4', state: 'either' } },
		// a Multi Tally missing options
		{ feedbackId: 'tallyLook', options: { input: 'SDI1' } },
	]
	const r = upgrades.upgradeRebel6Tally({}, { feedbacks, actions: [], config: {} })
	const [a, b, c, d, e] = r.updatedFeedbacks
	assert.equal(a.feedbackId, 'tally')
	assert.deepEqual(Object.keys(a.options).sort(), ['input', 'state'])
	assert.equal(a.options.state, 'preview')
	assert.equal(b.feedbackId, 'tallyLook')
	assert.equal(b.options.custom, true)
	assert.equal(b.options.show_aux, 'off')
	assert.equal(b.options.show_pinp, 'default')
	assert.ok(!('state' in b.options))
	assert.equal(c.feedbackId, 'tally')
	assert.equal(c.options.state, 'program')
	assert.equal(d.options.state, 'program')
	assert.equal(e.options.custom, false)
	assert.equal(e.options.ownColours, false)
	assert.equal(r.updatedConfig.tallyMode, 'both')
})

test('presets: Multi Tally when offered, upstream Tally State (PVW green, PGM red) otherwise', () => {
	let { self } = build()
	assert.equal(self.presetDefs.pgm_INPUT1.feedbacks[0].feedbackId, 'tallyLook')
	;({ self } = build({ tallyMode: 'upstream' }))
	const fbs = self.presetDefs.pgm_INPUT1.feedbacks
	assert.deepEqual(
		fbs.map((f) => [f.feedbackId, f.options.state]),
		[
			['tally', 'preview'],
			['tally', 'program'],
		],
	)
})

test('Tally State type is on the connection page and settable by the action', () => {
	const { self } = build()
	const f = self.getConfigFields().find((x) => x.id === 'tallyMode')
	assert.equal(f.default, 'both')
	assert.ok(self.actionDefs.set_settings.options.some((o) => o.id === 'tallyMode'))
})
