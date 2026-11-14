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

const { makeFake } = require('../test-support/fake')
const { v160Instance } = require('../index.js')

/** The real configUpdated / setSettingsByAction, on a fake instance */
function inst(config) {
	const { self } = makeFake()
	self.config = { ...config }
	self._savedValues = v160Instance.prototype._savedValues
	self.configUpdated = v160Instance.prototype.configUpdated
	self.setSettingsByAction = v160Instance.prototype.setSettingsByAction
	self._buildDefinitions = () => {}
	self.initConnection = () => {}
	return self
}

test('the action can set any field, no tick needed, and marks it as set by an action', async () => {
	const self = inst({ host: '10.0.0.1', port: '8023' })
	await self.setSettingsByAction({ port: '9000', host: '' })
	assert.equal(self.config.port, '9000')
	assert.equal(self.config.port_set, true)
	assert.equal(self.config.host, '10.0.0.1')
	assert.notEqual(self.config.host_set, true)
	assert.equal(self.savedConfig.port, '9000')
})

test('impossible values are skipped and the field stays as it was', async () => {
	const self = inst({ port: '8023' })
	await self.setSettingsByAction({ port: '99999' })
	assert.equal(self.config.port, '8023')
	assert.notEqual(self.config.port_set, true)
})

test('while set by an action, saving the page keeps the action value', async () => {
	const self = inst({ port: '8023' })
	await self.setSettingsByAction({ port: '9000' })
	await self.configUpdated({ ...self.config, port: '1234' })
	assert.equal(self.config.port, '9000')
	assert.equal(self.config.port_set, true)
})

test('Change back restores what was typed before, even after several action changes', async () => {
	const self = inst({ port: '8023' })
	await self.setSettingsByAction({ port: '9000' })
	await self.setSettingsByAction({ port: '9100' })
	await self.configUpdated({ ...self.config, port_changeBack: true })
	assert.equal(self.config.port, '8023')
	assert.equal(self.config.port_set, false)
	assert.equal(self.config.port_changeBack, false)
	// and it's normal again: the page can change it
	await self.configUpdated({ ...self.config, port: '8024' })
	assert.equal(self.config.port, '8024')
})

test('old "Can be set by the action" ticks become set-by-an-action flags', () => {
	const { upgradeSetByAction } = require('../src/upgrades')
	const r = upgradeSetByAction({}, { config: { port: '9000', port_byAction: true, host_byAction: false } })
	assert.equal(r.updatedConfig.port_set, true)
	assert.equal(r.updatedConfig.host_set, undefined)
	assert.equal('port_byAction' in r.updatedConfig, false)
	assert.equal('host_byAction' in r.updatedConfig, false)
})
