'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')
const upgrades = require('../src/upgrades')

test('connection page: every field default is a valid choice (Companion 5 blocks Save otherwise)', () => {
	const { self } = makeFake({})
	const bad = []
	for (const f of self.getConfigFields()) {
		if (f.type === 'dropdown' && f.default !== undefined && !f.choices.some((c) => c.id === f.default)) bad.push(f.id)
		if (f.type === 'dropdown' && f.choices.some((c) => c.id === '')) bad.push(`${f.id} has an empty choice`)
	}
	assert.deepEqual(bad, [])
})

test('upgrade: blank snapshot pickers become the none value', () => {
	const r = upgrades.upgradeRebel8Config({}, { config: { snapRestore: '', host: 'x' }, actions: [], feedbacks: [] })
	assert.equal(r.updatedConfig.snapRestore, '__none__')
	assert.equal(r.updatedConfig.snapRename, '__none__')
	assert.equal(r.updatedConfig.host, 'x')
})

test('snapshot page ops: none means nothing, and the pickers reset to none', () => {
	const { self } = makeFake({})
	const next = { snapRestore: '__none__', snapRename: '__none__', snapDelete: '__none__', snapRenameTo: '' }
	assert.equal(self.takeSnapshotConfigOps(next), false)
	assert.equal(next.snapRestore, '__none__')
})

test('polling off: Program/Preview are read on connect and after a tally change', async () => {
	const { self } = makeFake({ polling: false })
	const sent = []
	self.PROTOCOL = 'named'
	self._protocolDecided = true
	self._queue = { readsWaiting: () => 0 }
	self._read = (cmd) => sent.push(cmd)
	self.sendRawCommand = (cmd) => sent.push(cmd)
	self.readRouting()
	assert.ok(sent.includes('QPGM;') && sent.includes('QPST;'))
	sent.length = 0
	self.TALLY = {}
	self._setTally(32, 1) // first value: no re-read
	self._setTally(32, 1) // unchanged
	await new Promise((r) => setTimeout(r, 150))
	assert.equal(sent.length, 0)
	self._setTally(32, 2) // changed
	self._setTally(33, 1)
	await new Promise((r) => setTimeout(r, 150))
	assert.equal(sent.filter((c) => c === 'QPGM;').length, 1, 'one re-read per burst')
	self._stopPolling()
})

test('polling on: a tally change does not trigger extra reads', async () => {
	const { self } = makeFake({ polling: true })
	const sent = []
	self.PROTOCOL = 'named'
	self._protocolDecided = true
	self._queue = {}
	self._read = (cmd) => sent.push(cmd)
	self.sendRawCommand = (cmd) => sent.push(cmd)
	self.TALLY = { INPUT1: 0 }
	self._setTally(32, 1)
	await new Promise((r) => setTimeout(r, 150))
	assert.equal(sent.length, 0)
})
