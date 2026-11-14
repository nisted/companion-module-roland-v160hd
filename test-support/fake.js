'use strict'
// A stand-in for the Companion instance: the module's own methods, with the
// Companion calls recorded instead of sent anywhere.
const config = require('../src/config')
const actions = require('../src/actions')
const feedbacks = require('../src/feedbacks')
const variables = require('../src/variables')
const presets = require('../src/presets')
const api = require('../src/api')
const constants = require('../src/constants')
const { CommandQueue } = require('../src/commandQueue')

function makeFake(cfg = {}) {
	const sent = []
	const logs = []
	const self = {
		...config,
		...actions,
		...feedbacks,
		...variables,
		...presets,
		...api,
		...constants,
		label: 'v160',
		config: { host: '10.0.0.1', password: '1234', protocol: 'auto', polling: true, ...cfg },
		DATA: {},
		TALLY: {},
		MODEL: 'V-160HD',
		VERSION: '',
		PROTOCOL: 'lowlevel',
		_freezePending: {},
		selectedCamera: '41',
		log: (level, msg) => logs.push([level, msg]),
		updateStatus: () => {},
		setActionDefinitions(d) {
			self.actionDefs = d
		},
		setFeedbackDefinitions(d) {
			self.feedbackDefs = d
		},
		setVariableDefinitions(d) {
			self.variableDefs = d
		},
		setVariableValues(v) {
			self.variableValues = { ...(self.variableValues || {}), ...v }
		},
		setPresetDefinitions(structure, defs) {
			self.presetStructure = structure
			self.presetDefs = defs
		},
		checkFeedbacks() {},
		checkAllFeedbacks() {},
		saveConfig(c) {
			self.savedConfig = c
		},
		setSettingsByAction() {},
	}
	// A queue that just records what would go on the wire, answering nothing
	self._queue = new CommandQueue({
		send: (cmd) => {
			sent.push(cmd)
			return true
		},
		timeoutMs: 1e9,
		gapMs: 0,
		timers: { setTimeout: () => 0, clearTimeout: () => {} },
	})
	// Answer every command straight away so the queue keeps flowing
	const origEnqueue = self._queue.enqueue.bind(self._queue)
	self._queue.enqueue = (item) => {
		const r = origEnqueue(item)
		while (self._queue._inFlight) {
			self._queue._inFlight = null
			const next = self._queue._high.shift() || self._queue._low.shift()
			if (next) self._queue._transmit(next)
		}
		return r
	}
	return { self, sent, logs }
}

module.exports = { makeFake }
