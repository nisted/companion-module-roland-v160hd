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
		})

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
		this._buildDefinitions()
		this.initConnection()
	}

	async destroy() {
		try {
			this._stopPolling()
			clearTimeout(this._verTimer)
			if (this._queue) this._queue.clear()
			this._clearAllFreezePending()
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
		this.checkAllFeedbacks()
		this.checkVariables()
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
		const next = { ...newConfig, actionSaved: old.actionSaved }
		const saved = this._savedValues()
		let ticksChanged = false
		for (const f of Object.keys(CONN_FIELDS)) {
			const was = old[`${f}_byAction`] === true
			const now = next[`${f}_byAction`] === true
			if (!was && now) {
				// Handed to the action: remember what was typed, to put back when unticked
				saved[f] = next[f]
				ticksChanged = true
			} else if (was && now) {
				// Locked: only the action changes it
				next[f] = old[f]
			} else if (was && !now) {
				if (f in saved) next[f] = saved[f]
				delete saved[f]
				ticksChanged = true
			}
		}
		next.actionSaved = JSON.stringify(saved)
		this.config = next
		if (ticksChanged) this.initActions()
		this._buildDefinitions()
		this.initConnection()
		const keys = new Set([...Object.keys(newConfig), ...Object.keys(next)])
		if ([...keys].some((k) => JSON.stringify(newConfig[k]) !== JSON.stringify(next[k]))) this.saveConfig(next)
	}

	/** The fields ticked "Can be set by the action" */
	_tickedFields() {
		return Object.keys(CONN_FIELDS).filter((f) => this.config?.[`${f}_byAction`] === true)
	}

	/** 'Connection: set settings': write the given values into the ticked fields, then reconnect */
	async setSettingsByAction(options) {
		const ticked = this._tickedFields()
		if (!ticked.length) {
			this.log(
				'info',
				'Connection: set settings: nothing\'s ticked "Can be set by the action" on the connection page yet, so there\'s nothing for me to set.',
			)
			return
		}
		const next = { ...this.config }
		let changed = false
		for (const f of Object.keys(CONN_FIELDS)) {
			const raw = options[f]
			if (raw === undefined || raw === null || String(raw).trim() === '') continue
			if (!ticked.includes(f)) {
				this.log(
					'info',
					`Connection: set settings: "${CONN_FIELDS[f].label}" isn't ticked "Can be set by the action", so I've left it alone.`,
				)
				continue
			}
			const r = checkField(f, raw)
			if (!r.ok) {
				this.log('warn', `Connection: set settings: "${CONN_FIELDS[f].label}" ${r.why}. Left it as it was.`)
				continue
			}
			if (JSON.stringify(next[f]) !== JSON.stringify(r.value)) {
				next[f] = r.value
				changed = true
			}
		}
		if (!changed) return
		this.config = next
		this.saveConfig(next)
		this._buildDefinitions()
		this.initConnection()
	}
}

module.exports = { v160Instance, UpgradeScripts: upgrades }
