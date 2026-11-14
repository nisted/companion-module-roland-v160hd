'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')

function build() {
	const { self } = makeFake()
	self.initActions()
	self.initFeedbacks()
	self.initVariables()
	self.initPresets()
	return self
}

test('every preset uses actions and feedbacks that exist, with valid choices', () => {
	const self = build()
	const check = (defs, id, opts, kind) => {
		const def = defs[id]
		assert.ok(def, `${kind} ${id} exists`)
		for (const [k, v] of Object.entries(opts)) {
			const o = def.options.find((x) => x.id === k)
			assert.ok(o, `${kind} ${id} has option ${k}`)
			if (o.type === 'dropdown' && !o.allowCustom)
				assert.ok(
					o.choices.some((c) => c.id === v),
					`${kind} ${id}.${k} = ${v} is a choice`,
				)
		}
	}
	let n = 0
	const flat = Object.values(self.presetDefs).flatMap((p) => (p.type === 'alternatives' ? p.variants : [p]))
	for (const p of flat) {
		for (const step of p.steps)
			for (const a of [...step.down, ...step.up]) check(self.actionDefs, a.actionId, a.options, 'action')
		for (const f of p.feedbacks) check(self.feedbackDefs, f.feedbackId, f.options, 'feedback')
	}
	n = Object.keys(self.presetDefs).length
	assert.ok(n > 300, `${n} presets`)
	const listed = self.presetStructure.flatMap((s) => s.definitions)
	assert.equal(listed.length, n)
})

test('every action and feedback field has an id and no base 1.x leftovers', () => {
	const self = build()
	for (const [id, d] of [...Object.entries(self.actionDefs), ...Object.entries(self.feedbackDefs)]) {
		for (const o of d.options) {
			assert.ok(o.id, `${id} option id`)
			assert.equal(typeof o.isVisible, 'undefined', `${id}.${o.id} uses isVisibleExpression`)
		}
		assert.equal(d.style, undefined, `${id} uses defaultStyle`)
	}
})

test('variables are an object, and checkVariables fills them without throwing', () => {
	const self = build()
	assert.ok(!Array.isArray(self.variableDefs))
	self.checkVariables()
	for (const k of Object.keys(self.variableValues)) assert.ok(k in self.variableDefs, `${k} is defined`)
})

test('connection page: every input field has a tooltip, a Change back tick and a hidden set flag', () => {
	const { self } = makeFake()
	const fields = self.getConfigFields()
	// Snapshot picks are one-shot page commands (restore/rename/delete), not settings
	const inputs = fields.filter(
		(f) => f.type !== 'static-text' && !/_(set|changeBack)$/.test(f.id) && !/^snap/.test(f.id),
	)
	for (const f of inputs) {
		assert.ok(f.tooltip, `${f.id} tooltip`)
		assert.ok(f.isVisibleExpression.endsWith(`!$(options:${f.id}_set)`), `${f.id} hides when set by an action`)
		assert.ok(
			fields.some((x) => x.id === `${f.id}_changeBack` && x.label === 'Change back'),
			`${f.id} change back`,
		)
		assert.ok(
			fields.some((x) => x.id === `${f.id}_set` && x.isVisibleExpression === 'false'),
			`${f.id} hidden flag`,
		)
	}
	assert.equal(fields.filter((f) => /_byAction$/.test(f.id)).length, 0, 'no old ticks')
	assert.ok(fields.some((f) => f.label && f.label.includes("Psst. This one's got mates")))
})

test('Set connection settings offers every connection field', () => {
	const self = build()
	const a = self.actionDefs.set_settings
	assert.equal(a.name, 'Set connection settings')
	const { CONN_FIELDS } = require('../src/config')
	assert.deepEqual(a.options.map((o) => o.id).sort(), Object.keys(CONN_FIELDS).sort())
})

test('the source feedback treats an input and its HDMI as the same picture', () => {
	const self = build()
	self.DATA.inputAssign = ['04']
	self.DATA.pgmsource = '20' // Input 1
	const cb = self.feedbackDefs.sourceOn.callback
	assert.equal(cb({ options: { where: 'pgm', source: 'INPUT1' } }), true)
	assert.equal(cb({ options: { where: 'pgm', source: 'HDMI5' } }), true)
	assert.equal(cb({ options: { where: 'pgm', source: 'HDMI1' } }), false)
})
