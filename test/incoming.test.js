'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')

function feed(self, ...msgs) {
	for (const m of msgs) self.updateData(m)
}

test('VER 3.60 on Auto switches to named commands', () => {
	const { self } = makeFake()
	self._protocolDecided = false
	self.startInterval = () => {}
	feed(self, 'VER:V-160HD,3.60')
	assert.equal(self.PROTOCOL, 'named')
	assert.equal(self.VERSION, '3.60')
})

test('VER 3.30 on Auto stays low-level', () => {
	const { self } = makeFake()
	self._protocolDecided = false
	self.startInterval = () => {}
	feed(self, 'VER:V-160HD,3.30')
	assert.equal(self.PROTOCOL, 'lowlevel')
})

test('named answers land in the same place as low-level ones', () => {
	const { self } = makeFake()
	feed(self, 'PGM:HDMI1,INPUT3', 'PST:SDI2', 'AUX:AUX2,HDMI4,INPUT12', 'PIS:PinP3,STILL5', 'DSS:DSK1,STILL1')
	assert.equal(self.DATA.pgmsource, '22')
	assert.equal(self.DATA.pvwsource, '09')
	assert.equal(self.DATA.aux2source, '2B')
	assert.equal(self.DATA.pnpkey3source, '14')
	assert.equal(self.DATA.dsk1source, '10')
	feed(self, 'DTH:002100,2A21')
	assert.equal(self.DATA.pgmsource, '2A')
	assert.equal(self.DATA.pvwsource, '21')
})

test('TLY and the low-level tally push both fill Input 1-20', () => {
	const { self } = makeFake()
	const tly = new Array(52).fill(0)
	tly[0] = 1 // HDMI1 on program
	tly[32 + 10] = 2 // Input 11 on preview
	feed(self, 'TLY:' + tly.join(','))
	assert.equal(self.TALLY.HDMI1, 1)
	assert.equal(self.TALLY.INPUT11, 2)
	feed(self, 'DTH:0C0000,' + '00'.repeat(32) + '03')
	assert.equal(self.TALLY.HDMI1, 0)
	assert.equal(self.TALLY.INPUT1, 3)
})

test('memory names are decoded to text', () => {
	const { self } = makeFake()
	const hex = Buffer.from('Opening\0', 'latin1').toString('hex').toUpperCase()
	feed(self, `DTH:600200,${hex}`)
	assert.equal(self.DATA.memory2, 'Opening')
	self.checkVariables()
	assert.equal(self.variableValues.memoryname_3, 'Opening')
})

test('DSK key and fill come back as one block', () => {
	const { self } = makeFake()
	feed(self, 'DTH:002003,1102')
	assert.equal(self.DATA.dsk2source, '11')
	assert.equal(self.DATA.dsk2fill, '02')
})

test('polling never piles up: a round is skipped while the last one is unanswered', () => {
	const { self } = makeFake()
	self._queue.enqueue = (item) => {
		if (item.kind === 'read') self._queue._low.push(item)
		return true
	}
	self._doPoll(false)
	const after1 = self._queue._low.length
	assert.ok(after1 > 0)
	self._doPoll(false)
	assert.equal(self._queue._low.length, after1)
})

test('ERR turns into a plain-words warning, mentioning firmware for Input 11-20', () => {
	const { self, logs } = makeFake()
	self._commandRefused('DTH:002100,2A;', '5', { needsNamed: true })
	assert.match(logs.at(-1)[1], /out of range/)
	assert.match(logs.at(-1)[1], /3\.40/)
})

test('replies with the invisible start byte (0x02) are still read', () => {
	const { self } = makeFake()
	self._protocolDecided = false
	self.startInterval = () => {}
	feed(self, '\x02VER:V-160HD,3.60', '\x02ACK')
	assert.equal(self.PROTOCOL, 'named')
	feed(self, '\x02DTH:002100,2A21')
	assert.equal(self.DATA.pgmsource, '2A')
	feed(self, '\x02PGM:HDMI1,INPUT3')
	assert.equal(self.DATA.pgmsource, '22')
})

test('a low-level read with the start byte finishes on its reply, not the timeout', () => {
	const { makeFake: mk } = require('../test-support/fake')
	const { CommandQueue } = require('../src/commandQueue')
	const { self } = mk()
	const sent = []
	self._queue = new CommandQueue({
		send: (c) => sent.push(c),
		timeoutMs: 1e9,
		gapMs: 0,
		timers: { setTimeout: (fn, ms) => (ms < 1e6 ? fn() : 0, 0), clearTimeout: () => {} },
	})
	self._read('RQH:002100,000002;')
	self._read('RQH:000011,000001;')
	assert.equal(sent.length, 1)
	self.updateData('\x02DTH:002100,2021')
	assert.equal(sent.length, 2)
	self.updateData('\x02ACK')
	self.updateData('\x02DTH:000011,05')
	assert.equal(self.DATA.aux1source, '05')
})
