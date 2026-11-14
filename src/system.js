'use strict'

/**
 * System settings: actions, feedbacks, variables and presets, built from systemTable.
 *
 * Connection switches:
 *   allowSystem (on by default)  system-settings actions and presets exist at all
 *   allowRisky  (off by default) the risky ones (can take the output off air) too
 * Risky actions also need a second press within the confirm time (5 s default).
 */

const T = require('./systemTable')
const mem = require('./mem')

const RISKY_FLAG = '⚠ RISKY'
const NEXT = 'next'
const PREV = 'prev'

function valueChoices(s, withStep) {
	const c = s.values.map((x) => ({ id: String(x.v), label: x.label }))
	return withStep ? [{ id: NEXT, label: '→ Next value' }, { id: PREV, label: '← Previous value' }, ...c] : c
}

function menuSettings(menuId) {
	return T.SETTINGS.filter((s) => s.menu === menuId)
}

module.exports = {
	SYSTEM_RISKY_FLAG: RISKY_FLAG,

	systemAllowed: function () {
		return !this.config || this.config.allowSystem !== false
	},
	riskyAllowed: function () {
		return !!(this.config && this.config.allowRisky)
	},

	readSystem: function () {
		for (const b of T.READ_BLOCKS)
			this.sendRawCommand(`RQH:${b.addr},${b.size.toString(16).padStart(6, '0').toUpperCase()};`)
	},

	/** Current value number of a setting, or undefined */
	systemValue: function (s) {
		const b = mem.bytes(this.MEM || {}, s.addr, s.size)
		if (!b) return undefined
		return s.size === 2 ? mem.from7bit(b[0], b[1]) : b[0]
	},

	systemValueLabel: function (s) {
		const v = this.systemValue(s)
		if (v === undefined) return ''
		const x = s.values.find((y) => y.v === v)
		return x ? x.label : String(v)
	},

	/** Write a setting. raw: a value number, a label, 'next' or 'prev'. */
	setSystem: function (id, raw) {
		const s = T.BY_ID.get(id)
		if (!s) {
			this.log('warn', `System: "${id}" isn't a setting I know.`)
			return false
		}
		if (s.risky && !this.riskyAllowed()) {
			this.log(
				'warn',
				`System: ${s.name} is a risky one. Turn on "Allow risky system settings" on the connection page first.`,
			)
			return false
		}
		const r = String(raw ?? '').trim()
		let target
		if (r === NEXT || r === PREV) {
			const cur = this.systemValue(s)
			let i = s.values.findIndex((x) => x.v === cur)
			if (i < 0) i = r === NEXT ? -1 : 0
			const n = s.values.length
			target = s.values[(i + (r === NEXT ? 1 : -1) + n) % n]
		} else {
			target =
				s.values.find((x) => String(x.v) === r) ||
				s.values.find((x) => x.label.toLowerCase().replace(/\s+/g, '') === r.toLowerCase().replace(/\s+/g, ''))
		}
		if (!target) {
			this.log(
				'warn',
				`System: ${s.name} can't be "${r}". It takes: ${s.values
					.map((x) => x.label)
					.slice(0, 12)
					.join(', ')}${s.values.length > 12 ? '…' : ''}.`,
			)
			return false
		}
		const bytes = s.size === 2 ? mem.to7bit(target.v) : [target.v]
		this.sendCommand(s.addr, mem.hexBytes(bytes))
		if (!this.MEM) this.MEM = {}
		mem.capture(this.MEM, s.addr, mem.hexBytes(bytes))
		this.sendRawCommand(`RQH:${s.addr},${s.size.toString(16).padStart(6, '0')};`)
		this.logVerbose(`System: ${s.name} → ${target.label}`)
		this.checkFeedbacks('systemIs')
		this.checkVariables()
		return true
	},

	// ── Second press to confirm ───────────────────────────────────────────

	/**
	 * Returns true when this press should go ahead. First press arms it and flashes the
	 * button; a second press inside the confirm time does it.
	 */
	confirmPress: function (key, what) {
		if (!this._confirm) this._confirm = new Map()
		const now = Date.now()
		const secs = Number(this.config && this.config.confirmSecs)
		const windowMs = (Number.isFinite(secs) && secs > 0 ? secs : 5) * 1000
		const p = this._confirm.get(key)
		if (p && now <= p.until) {
			this._confirm.delete(key)
			this._confirmTick()
			return true
		}
		this._confirm.set(key, { until: now + windowMs })
		this.log('warn', `${what}: press again within ${windowMs / 1000} s to confirm.`)
		this._confirmTick()
		return false
	},

	confirmWaiting: function (key) {
		const p = this._confirm && this._confirm.get(key)
		return !!p && Date.now() <= p.until
	},

	_confirmTick: function () {
		const now = Date.now()
		if (this._confirm) for (const [k, p] of this._confirm) if (now > p.until) this._confirm.delete(k)
		this._blink = !this._blink
		this.checkFeedbacks('confirmPending')
		clearTimeout(this._confirmTimer)
		if (this._confirm && this._confirm.size > 0) this._confirmTimer = setTimeout(() => this._confirmTick(), 400)
	},

	stopConfirm: function () {
		clearTimeout(this._confirmTimer)
		if (this._confirm) this._confirm.clear()
	},

	// ── Definitions ──────────────────────────────────────────────────────

	_menuOptions: function (settings, withStep) {
		const opts = [
			{
				type: 'dropdown',
				label: 'Setting',
				id: 'setting',
				default: settings[0].id,
				choices: settings.map((s) => ({ id: s.id, label: s.name })),
			},
		]
		for (const s of settings) {
			opts.push({
				type: 'dropdown',
				label: 'Value',
				id: `v_${s.id}`,
				default: withStep ? NEXT : String(s.values[0].v),
				choices: valueChoices(s, withStep),
				isVisibleExpression: `$(options:setting) == '${s.id}'`,
				tooltip: withStep ? 'Next/Previous steps through the values (round and round).' : undefined,
			})
		}
		return opts
	},

	systemActions: function (actions) {
		const self = this
		if (!self.systemAllowed()) return
		for (const m of T.MENUS) {
			const settings = menuSettings(m.id)
			if (!settings.length) continue
			const risky = m.id === 'risky'
			if (risky && !self.riskyAllowed()) continue
			actions[`system_${m.id}`] = {
				name: `${risky ? RISKY_FLAG + ' ' : ''}System: ${m.name}`,
				description: risky
					? 'Can take the output off air. Press twice (within the confirm time) to do it.'
					: "Sets one of the switcher's system settings. Next/Previous steps through the values.",
				options: self._menuOptions(settings, true),
				callback: (a) => {
					const id = a.options.setting
					const s = T.BY_ID.get(id)
					if (!s) return
					if (risky && !self.confirmPress(`${a.controlId}:${a.actionId}`, `${RISKY_FLAG} ${s.name}`)) return
					self.setSystem(id, a.options[`v_${id}`])
				},
			}
		}
	},

	systemFeedbacks: function (feedbacks) {
		const self = this
		const all = T.SETTINGS
		feedbacks.systemIs = {
			type: 'boolean',
			name: 'System: setting is',
			description: 'True while a system setting has the value you pick.',
			defaultStyle: { color: 0x000000, bgcolor: 0xffc000 },
			options: self._menuOptions(all, false),
			callback: (fb) => {
				const s = T.BY_ID.get(fb.options.setting)
				if (!s) return false
				return String(self.systemValue(s)) === String(fb.options[`v_${s.id}`])
			},
		}
		feedbacks.confirmPending = {
			type: 'boolean',
			name: 'Confirm: waiting for a second press',
			description: 'Flashes while a risky action or a snapshot restore is waiting for its second press.',
			defaultStyle: { color: 0x000000, bgcolor: 0xffb000 },
			options: [],
			callback: (fb) => self._confirmWaitingFor(fb.controlId),
		}
	},

	_confirmWaitingFor: function (controlId) {
		if (!this._confirm || !this._blink) return false
		const now = Date.now()
		for (const [k, p] of this._confirm) if (k.startsWith(`${controlId}:`) && now <= p.until) return true
		return false
	},

	systemVariableDefs: function (add) {
		for (const s of T.SETTINGS) add(`sys_${s.id}`, `System: ${s.name}`)
	},

	systemVariableValues: function (v) {
		for (const s of T.SETTINGS) v[`sys_${s.id}`] = this.systemValueLabel(s)
	},

	/** Presets: a stepper for every setting, plus one-per-value for lists of 12 or fewer */
	systemPresets: function (section, button, layered) {
		const self = this
		if (!self.systemAllowed()) return
		const L = self.label
		for (const m of T.MENUS) {
			const risky = m.id === 'risky'
			if (risky && !self.riskyAllowed()) continue
			const settings = menuSettings(m.id)
			section(`sys_${m.id}`, `${risky ? RISKY_FLAG + ' ' : ''}System: ${m.name}`)
			for (const s of settings) {
				const step = { actionId: `system_${m.id}`, options: { setting: s.id, [`v_${s.id}`]: NEXT } }
				const name = `${s.name}: next value`
				const text = `${short(s.name)}\\n$(${L}:sys_${s.id})`
				if (risky) layered(`sys_${s.id}_step`, name, text, [step])
				else button(`sys_${s.id}_step`, name, text, [step])
				if (s.values.length > 12) continue
				for (const x of s.values) {
					const act = { actionId: `system_${m.id}`, options: { setting: s.id, [`v_${s.id}`]: String(x.v) } }
					const fb = { feedbackId: 'systemIs', options: { setting: s.id, [`v_${s.id}`]: String(x.v) } }
					const t = `${short(s.name)}\\n${x.label}`
					if (risky) layered(`sys_${s.id}_${x.v}`, `${s.name}: ${x.label}`, t, [act], fb)
					else
						button(
							`sys_${s.id}_${x.v}`,
							`${s.name}: ${x.label}`,
							t,
							[act],
							[{ ...fb, style: { bgcolor: 0xffc000, color: 0x000000 } }],
						)
				}
			}
		}
	},
}

/** Short button text for a setting name */
function short(name) {
	return name
		.replace(/^Panel lock: /, 'LOCK ')
		.replace(/^Output format: /, 'FMT ')
		.replace(/^Memory loads: /, 'MEM LOAD ')
		.replace(/^Memory fade: /, 'MEM FADE ')
		.replace(/^Input scan time: /, 'SCAN ')
		.replace(/^Memory scan time: /, 'SCAN ')
		.replace(/^Tally follows: /, 'TALLY ')
		.replace(/^Meter: /, 'METER ')
		.replace(/^Multi-view /, 'MV ')
		.replace(/^16 INPUT-VIEW box /, '16IV ')
		.toUpperCase()
}

module.exports.short = short
