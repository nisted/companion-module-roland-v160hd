'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')
const { route, assignSlot, transition } = require('../src/routing')

const strip = (a) => a.map((c) => c.trim())

test('named: every destination takes Input 1-20', () => {
	const { self, sent } = makeFake()
	self.PROTOCOL = 'named'
	route(self, 'pgm', 1, 'INPUT11')
	route(self, 'pvw', 1, 'INPUT20')
	route(self, 'aux', 2, 'INPUT15')
	route(self, 'pinp', 4, 'INPUT12')
	route(self, 'dskkey', 1, 'INPUT13')
	assert.deepEqual(strip(sent), [
		'PGM:INPUT11;',
		'PST:INPUT20;',
		'AUX:AUX2,INPUT15;',
		'PIS:PinP4,INPUT12;',
		'DSS:DSK1,INPUT13;',
	])
})

test('low-level: same destinations as address commands', () => {
	const { self, sent } = makeFake()
	route(self, 'pgm', 1, 'INPUT11')
	route(self, 'pvw', 1, 'HDMI3')
	route(self, 'aux', 1, 'SDI1')
	route(self, 'aux', 3, 'INPUT2')
	route(self, 'pinp', 2, 'STILL4')
	route(self, 'dskkey', 2, 'STILL1')
	route(self, 'dskfill', 1, 'HDMI1')
	assert.deepEqual(strip(sent), [
		'DTH:002100,2A;',
		'DTH:002101,02;',
		'DTH:000011,08;',
		'DTH:00002F,21;',
		'DTH:001C02,13;',
		'DTH:002003,10;',
		'DTH:001F04,00;',
	])
})

test('the feedback state updates straight away', () => {
	const { self } = makeFake()
	route(self, 'aux', 2, 11)
	assert.equal(self.DATA.aux2source, '2A')
})

test('nonsense sources and destinations are refused with a log, not sent', () => {
	const { self, sent, logs } = makeFake()
	assert.equal(route(self, 'aux', 4, 'INPUT1'), false)
	assert.equal(route(self, 'pgm', 1, 'INPUT21'), false)
	assert.equal(sent.length, 0)
	assert.equal(logs.length, 2)
})

test('input slots 1-20', () => {
	const { self, sent } = makeFake()
	assignSlot(self, 'INPUT11', 'SDI2')
	assignSlot(self, 3, 'HDMI4')
	self.PROTOCOL = 'named'
	assignSlot(self, 'INPUT20', 'STILL2')
	assignSlot(self, 'INPUT5', 'N/A')
	assert.deepEqual(strip(sent), ['DTH:000024,09;', 'DTH:000002,03;', 'VIS:INPUT20,STILL2;', 'VIS:INPUT5,N/A;'])
	assert.equal(self.DATA.inputAssign[10], '09')
})

test('an input slot can only be given a physical source', () => {
	const { self, sent } = makeFake()
	assert.equal(assignSlot(self, 'INPUT1', 'INPUT2'), false)
	assert.equal(sent.length, 0)
})

test('cut and auto', () => {
	const { self, sent } = makeFake()
	self.PROTOCOL = 'named'
	transition(self, 'cut', '')
	transition(self, 'cut', 'INPUT14')
	transition(self, 'auto', 'HDMI2', '1.5')
	transition(self, 'auto', '', '')
	assert.deepEqual(strip(sent), ['CUT;', 'CUT:INPUT14;', 'ATO:HDMI2,15;', 'ATO;'])
})

test('low-level cut to a source: preview then the CUT button', () => {
	const { self, sent } = makeFake()
	transition(self, 'cut', 'INPUT3')
	assert.deepEqual(strip(sent), ['DTH:002101,22;', 'DTH:0B001E,01;', 'DTH:0B001E,00;'])
})
