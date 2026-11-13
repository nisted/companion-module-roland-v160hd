'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const p = require('../src/protocol')

test('Auto picks named from firmware 3.40', () => {
	assert.equal(p.choose('auto', '3.40'), 'named')
	assert.equal(p.choose('auto', '3.60'), 'named')
	assert.equal(p.choose('auto', '4.00'), 'named')
	assert.equal(p.choose('auto', '3.30'), 'lowlevel')
	assert.equal(p.choose('auto', '1.04'), 'lowlevel')
	assert.equal(p.choose('auto', ''), 'lowlevel')
	assert.equal(p.choose('named', '1.04'), 'named')
	assert.equal(p.choose('lowlevel', '3.60'), 'lowlevel')
})

test('parseNamed', () => {
	assert.deepEqual(p.parseNamed('PGM:HDMI1,INPUT3'), { name: 'PGM', args: ['HDMI1', 'INPUT3'] })
	assert.deepEqual(p.parseNamed('VER:V-160HD,3.60'), { name: 'VER', args: ['V-160HD', '3.60'] })
	assert.equal(p.parseNamed('ACK'), undefined)
	assert.equal(p.parseNamed('DTH:002100,20'), undefined)
})
