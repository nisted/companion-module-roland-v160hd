'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { checkField } = require('../src/config')

test('impossible values are refused with a reason', () => {
	assert.equal(checkField('port', '99999').ok, false)
	assert.equal(checkField('port', 'abc').ok, false)
	assert.equal(checkField('port', '80.5').ok, false)
	assert.deepEqual(checkField('port', '8023'), { ok: true, value: '8023' })
	assert.equal(checkField('host', '300.1.1.1').ok, false)
	assert.equal(checkField('host', '192.168.0.10').ok, true)
	assert.deepEqual(checkField('protocol', 'Low-Level'), { ok: true, value: 'lowlevel' })
	assert.equal(checkField('protocol', 'fast').ok, false)
	assert.deepEqual(checkField('polling', 'on'), { ok: true, value: true })
	assert.equal(checkField('polling', 'maybe').ok, false)
	assert.equal(checkField('retries', '6').ok, false)
})
