'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const s = require('../src/sources')

test('52 sources in the agreed order with the right hex', () => {
	assert.equal(s.SOURCES.length, 52)
	assert.deepEqual(
		s.SOURCES.slice(0, 2).map((x) => [x.id, x.hex]),
		[
			['INPUT1', '20'],
			['INPUT2', '21'],
		],
	)
	assert.equal(s.resolveSource('INPUT20').hex, '33')
	assert.equal(s.resolveSource('HDMI1').hex, '00')
	assert.equal(s.resolveSource('SDI8').hex, '0F')
	assert.equal(s.resolveSource('STILL16').hex, '1F')
})

test('resolveSource takes tokens, labels, numbers and lettered hex', () => {
	assert.equal(s.resolveSource('Input 11').id, 'INPUT11')
	assert.equal(s.resolveSource('input11').id, 'INPUT11')
	assert.equal(s.resolveSource(11).id, 'INPUT11')
	assert.equal(s.resolveSource('2A').id, 'INPUT11')
	assert.equal(s.resolveSource('0A').id, 'SDI3')
	assert.equal(s.resolveSource('21'), undefined)
	assert.equal(s.resolveSource('nope'), undefined)
	assert.equal(s.resolveSource(''), undefined)
})

test('input slots 11-20 live at 00 00 24-2D', () => {
	assert.equal(s.resolveSlot('INPUT1').address, '000000')
	assert.equal(s.resolveSlot('INPUT10').address, '000009')
	assert.equal(s.resolveSlot('INPUT11').address, '000024')
	assert.equal(s.resolveSlot(20).address, '00002D')
	assert.equal(s.resolveSlot('HDMI1'), undefined)
})
