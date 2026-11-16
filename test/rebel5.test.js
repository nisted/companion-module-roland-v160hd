'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')

function build(cfg) {
	const f = makeFake(cfg)
	f.self.initActions()
	f.self.initFeedbacks()
	f.self.initVariables()
	f.self.initPresets()
	// Record what Companion is asked to do
	f.self.checked = []
	f.self.checkFeedbacks = (...ids) => f.self.checked.push(ids)
	f.self.sentVars = []
	f.self.setVariableValues = (v) => f.self.sentVars.push(v)
	f.self.refreshAll()
	f.self.checked = []
	f.self.sentVars = []
	return f
}

// ── Lag fix: change-only, batched ───────────────────────────────────────

test('lag: a reply that changes nothing re-checks nothing and sends no variables', () => {
	const { self } = build()
	self.updateData('DTH:002100,2A21')
	self.refreshChanged()
	self.checked = []
	self.sentVars = []
	for (let i = 0; i < 20; i++) self.updateData('DTH:002100,2A21')
	self.refreshChanged()
	assert.deepEqual(self.checked, [])
	assert.deepEqual(self.sentVars, [])
	self.stopRefresh()
})

test('lag: a change re-checks only the feedbacks that read it, and sends only changed variables', () => {
	const { self } = build()
	self.updateData('DTH:002100,2A21')
	self.refreshChanged()
	self.checked = []
	self.sentVars = []
	// A label changes: only the label feedback (and the names) care
	self.updateData('DTH:021000,4746582D42000000')
	self.refreshChanged()
	assert.equal(self.checked.length, 1)
	assert.deepEqual(self.checked[0], ['labelMatches'])
	const sent = Object.assign({}, ...self.sentVars)
	assert.ok(Object.keys(sent).length > 0 && Object.keys(sent).length < 20, 'only the changed variables')
	assert.ok(!('model' in sent))
	self.stopRefresh()
})

test('lag: a whole polling round in one batch is one refresh', async () => {
	const { self } = build()
	self.updateData('DTH:002100,2A21')
	self.updateData('DTH:000011,22')
	self.updateData('DTH:00002E,2324')
	assert.deepEqual(self.checked, [], 'nothing yet, inside the batch window')
	// Wait for the batch timer (allowing for a busy test machine)
	for (let t = 0; t < 100 && self.checked.length === 0; t++) await new Promise((r) => setTimeout(r, 20))
	assert.equal(self.checked.length, 1)
	assert.ok(self.checked[0].includes('tallyLook'))
	assert.ok(!self.checked[0].includes('systemIs'))
})

test('lag: a button press refreshes straight away', () => {
	const { self } = build()
	self.PROTOCOL = 'named'
	self.actionDefs.select_pgm.callback({ options: { source: 'INPUT3' } })
	assert.equal(self.checked.length, 1)
	assert.ok(self.checked[0].includes('tallyLook'))
})

// ── Wording ─────────────────────────────────────────────────────────────

test('wording: upstream names are back, PinP throughout', () => {
	const { self } = build()
	const a = self.actionDefs
	const f = self.feedbackDefs
	assert.equal(a.select_pgm.name, 'Select PGM Source')
	assert.equal(a.select_pvw.name, 'Select PVW Source')
	assert.equal(a.aux_assign.name, 'Assign Aux')
	assert.equal(a.input_assign.name, 'Assign Input')
	assert.equal(a.pnpkey_setsource.name, 'PinP & Key Set Source')
	assert.equal(a.set_dsk_key_source.name, 'Set DSK Key Source')
	assert.equal(a.set_dsk_fill_source.name, 'Set DSK Fill Source')
	assert.equal(a.pnpkey_enable.name, 'PinP & Key Enable/Disable')
	assert.equal(a.pnpkey_busselect.name, 'PinP & Key Bus Select')
	assert.equal(a.dsk_busselect.name, 'DSK Bus Select')
	assert.equal(f.tally.name, 'Tally State')
	assert.equal(f.auxTally.name, 'Aux Tally State')
	assert.equal(f.pnpKeySource.name, 'PinP/Key Source State')
	// #24 pair: upstream names, with the difference explained
	assert.match(a.pnpkey_enable.options.find((o) => o.id === 'enable').tooltip, /Bus Select/)
	assert.match(a.pnpkey_busselect.options.find((o) => o.id === 'onoff').tooltip, /Enable\/Disable/)
	const all = JSON.stringify([a, f, self.presetDefs])
	assert.ok(!/PnP/.test(all), 'no PnP in shown text')
})

// ── Presets ─────────────────────────────────────────────────────────────

test('presets: no PGM/PVW text on the Program and Preview buttons', () => {
	const { self } = build()
	for (const [id, p] of Object.entries(self.presetDefs)) {
		if (!/^(pgm|pvw)_/.test(id)) continue
		assert.ok(!/PGM|PVW/.test(p.style.text), `${id}: ${p.style.text}`)
		assert.equal(p.feedbacks[0].feedbackId, 'tallyLook')
	}
})
