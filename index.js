// Roland V-160HD (Rebel)
const { InstanceBase } = require('@companion-module/base')
const upgrades = require('./src/upgrades')

const config = require('./src/config')
const actions = require('./src/actions')
const feedbacks = require('./src/feedbacks')
const variables = require('./src/variables')
const presets = require('./src/presets')
const api = require('./src/api')
const constants = require('./src/constants')
const labels = require('./src/labels')
const system = require('./src/system')
const tally = require('./src/tally')
const snapshots = require('./src/snapshots')
const sources = require('./src/sources')
const refresh = require('./src/refresh')

const { CONN_FIELDS, checkField } = config

class v160Instance extends InstanceBase {
	constructor(internal) {
		super(internal)

		Object.assign(this, {
			...config,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...api,
			...constants,
			...labels,
			...system,
			...tally,
			...snapshots,
			...refresh,
		})
		this.MEM = {}

		this.INTERVAL = undefined
		this.MODEL = 'V-160HD'
		this.VERSION = ''
		this.PROTOCOL = 'lowlevel'
		this.TALLY = {}

		this.DATA = {
			data_1B00: '00',
			data_1B01: '00',
			data_1C00: '00',
			data_1C01: '00',
			data_1D00: '00',
			data_1D01: '00',
			data_1E00: '00',
			data_1E01: '00',
		}

		this._freezePending = {}
		this.selectedCamera = '41' // camera 1 (Roland protocol address 0x41)
	}

	async init(config) {
		this.config = config
		sources.useNamer((id) => this.sourceName(id, 'full'))
		this._buildDefinitions()
		this.initConnection()
	}

	async destroy() {
		try {
			this._stopPolling()
			clearTimeout(this._verTimer)
			if (this._queue) this._queue.clear()
			this._clearAllFreezePending()
			this.stopLabelRefresh()
			this.stopConfirm()
			this.stopSnapshots()
			this.stopRefresh()
			if (this.socket !== undefined) {
				this.socket.destroy()
				delete this.socket
			}
		} catch (error) {
			this.log('error', 'destroy error: ' + error)
		}
	}

	_buildDefinitions() {
		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()
		this.refreshAll()
	}

	/** Action recorder: Companion says recording started or stopped */
	handleStartStopRecordActions(isRecording) {
		this._recording = isRecording
	}

	/** The hand-typed values put aside while a field belongs to the action */
	_savedValues() {
		try {
			const v = JSON.parse(String(this.config?.actionSaved ?? '') || '{}')
			return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
		} catch {
			return {}
		}
	}

	async configUpdated(newConfig) {
		const old = this.config || {}
		// Kept by the module, not typed on the page: carry them over
		const next = { ...newConfig, actionSaved: old.actionSaved, snapshots: old.snapshots }
		const saved = this._savedValues()
		for (const f of Object.keys(CONN_FIELDS)) {
			const owned = old[`${f}_set`] === true
			if (owned && next[`${f}_changeBack`] === true) {
				// Hand it back: what was typed before the action took over
				if (f in saved) next[f] = saved[f]
				delete saved[f]
				next[`${f}_set`] = false
			} else if (owned) {
				// Still the action's: the page can't change it
				next[f] = old[f]
				next[`${f}_set`] = true
			} else {
				next[`${f}_set`] = false
			}
			next[`${f}_changeBack`] = false
		}
		next.actionSaved = JSON.stringify(saved)
		this.config = next
		this.takeSnapshotConfigOps(next)
		this.config = next
		this._buildDefinitions()
		this.initConnection()
		const keys = new Set([...Object.keys(newConfig), ...Object.keys(next)])
		if ([...keys].some((k) => JSON.stringify(newConfig[k]) !== JSON.stringify(next[k]))) this.saveConfig(next)
	}

	/** 'Set connection settings': any field, blank = leave alone, impossible values skipped and logged */
	async setSettingsByAction(options) {
		const next = { ...this.config }
		const saved = this._savedValues()
		let changed = false
		for (const f of Object.keys(CONN_FIELDS)) {
			const raw = options[f]
			if (raw === undefined || raw === null || String(raw).trim() === '') continue
			const r = checkField(f, raw)
			if (!r.ok) {
				this.log('warn', `Set connection settings: "${CONN_FIELDS[f].label}" ${r.why}. Left it as it was.`)
				continue
			}
			if (next[`${f}_set`] !== true) {
				// First time the action takes this field: keep what was typed, for Change back
				saved[f] = next[f]
				next[`${f}_set`] = true
				changed = true
			}
			if (JSON.stringify(next[f]) !== JSON.stringify(r.value)) {
				next[f] = r.value
				changed = true
			}
		}
		if (!changed) return
		next.actionSaved = JSON.stringify(saved)
		this.config = next
		this.saveConfig(next)
		this._buildDefinitions()
		this.initConnection()
	}
}

module.exports = { v160Instance, UpgradeScripts: upgrades }
