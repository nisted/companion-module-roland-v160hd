'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { upgradeToRebelRouting, upgradeRebelConfig } = require('../src/upgrades')

const w = (value) => ({ value, isExpression: false })
const run = (actions, feedbacks = []) => upgradeToRebelRouting({}, { actions, feedbacks, config: null })

test('old routing buttons (plain options) become the new ones', () => {
	const actions = [
		{ actionId: 'select_pgm', options: { input: '2A' } },
		{ actionId: 'aux_assign', options: { aux: '00002E', assign: '05' } },
		{ actionId: 'set_pinp_source', options: { pinp: 28, assign: 16 } },
		{ actionId: 'set_dsk_fill_source', options: { dsk: 32, assign: 9 } },
		{ actionId: 'input_assign', options: { input: 0, assign: 3 } },
		{ actionId: 'pnpkey_setsource', options: { pinp: '1D', source: '33' } },
	]
	run(actions)
	assert.deepEqual(
		actions.map((a) => [a.actionId, a.options]),
		[
			['select_pgm', { source: 'INPUT11' }],
			['aux_assign', { aux: '2', source: 'HDMI6' }],
			['pnpkey_setsource', { pinp: '2', source: 'STILL1' }],
			['set_dsk_fill_source', { dsk: '2', source: 'SDI2' }],
			['input_assign', { slot: 'INPUT1', source: 'HDMI4' }],
			['pnpkey_setsource', { pinp: '3', source: 'INPUT20' }],
		],
	)
})

test('wrapped options keep their wrapper; expressions are left alone', () => {
	const actions = [
		{ actionId: 'select_pvw', options: { input: w('0A') } },
		{ actionId: 'aux_assign', options: { aux: w('000011'), assign: { value: '$(x:y)', isExpression: true } } },
	]
	run(actions)
	assert.deepEqual(actions[0].options, { source: w('SDI3') })
	assert.deepEqual(actions[1].options, { aux: w('1'), source: { value: '$(x:y)', isExpression: true } })
})

test('feedbacks', () => {
	const feedbacks = [
		{ feedbackId: 'tally', options: { input: 33, state: 'program' } },
		{ feedbackId: 'tally', options: { input: 8, state: 'program' } },
		{ feedbackId: 'auxTally', options: { aux: 'aux1', assign: '2B' } },
		{ feedbackId: 'pnpKeySource', options: { pinp: 'pnpkey1', source: '10' } },
	]
	run([], feedbacks)
	assert.equal(feedbacks[0].options.input, 'INPUT2')
	assert.equal(feedbacks[1].options.input, 'SDI1')
	assert.equal(feedbacks[2].options.assign, 'INPUT12')
	assert.equal(feedbacks[3].options.source, 'STILL1')
})

test('config gets the new settings with sensible defaults', () => {
	const r = upgradeRebelConfig({}, { config: { host: '1.2.3.4', pollingrate: 1000, polling: false } })
	assert.equal(r.updatedConfig.port, '8023')
	assert.equal(r.updatedConfig.protocol, 'auto')
	assert.equal(r.updatedConfig.pollingrate, '1000')
	assert.equal(r.updatedConfig.polling, false)
	assert.equal(r.updatedConfig.timeout, '500')
})
