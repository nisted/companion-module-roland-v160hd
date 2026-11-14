'use strict'

const { NAMING_CHOICES, BUTTON_TEXT_CHOICES } = require('./labels')

const BUNDLE_NOTICE =
	'V-160HD Rebel is part of a little crew of Companion modules: some brand new, some old favourites given a good tweak. ' +
	"Want to know who else is in the crew, or grab the freshest version of each one? It's all here: " +
	'<a href="https://github.com/nisted/companion-modules" target="_blank">github.com/nisted/companion-modules</a>'

const CHANGE_BACK_TIP =
	"A 'Set connection settings' action put this value here. Tick, then Save, to get back what you'd typed before and type it here again."

/**
 * Connection fields that the 'Set connection settings' action can change.
 * kind: text | int | choice | bool. Ranges are checked before anything is saved.
 */
const CONN_FIELDS = {
	host: { label: 'Switcher IP address', kind: 'ip' },
	port: { label: 'Port', kind: 'int', min: 1, max: 65535 },
	password: { label: 'LAN control password', kind: 'text' },
	protocol: { label: 'Command set', kind: 'choice', choices: ['auto', 'named', 'lowlevel'] },
	polling: { label: 'Polling', kind: 'bool' },
	pollingrate: { label: 'Polling every (ms)', kind: 'int', min: 100, max: 30000 },
	timeout: { label: 'Answer timeout (ms)', kind: 'int', min: 50, max: 5000 },
	gap: { label: 'Gap between commands (ms)', kind: 'int', min: 0, max: 1000 },
	retries: { label: 'Resends if unanswered', kind: 'int', min: 0, max: 5 },
	silence: { label: 'Pause polling after (missed answers)', kind: 'int', min: 1, max: 100 },
	verbose: { label: 'Chatty log', kind: 'bool' },
	labelrefresh: { label: 'Label refresh when polling is off (seconds, 0 = off)', kind: 'int', min: 0, max: 3600 },
	inputNaming: { label: 'Call input slots', kind: 'choice', choices: ['xpt', 'input'] },
	buttonText: { label: 'Preset button text', kind: 'choice', choices: ['labelonly', 'labelinput', 'full'] },
	allowSystem: { label: 'Allow system settings', kind: 'bool' },
	allowRisky: { label: 'Allow risky system settings', kind: 'bool' },
	confirmSecs: { label: 'Second press within (seconds)', kind: 'int', min: 1, max: 30 },
	tallyBorder: { label: 'Tally: PGM + PVW border width', kind: 'int', min: 0, max: 20 },
}
// Tally look colours and which sources show each group
for (const [k, name] of Object.entries({
	pgm: 'PGM fill',
	pvw: 'PVW fill',
	border: 'PGM + PVW border',
	pinp: 'PinP markers',
	key: 'Key markers',
	dsk: 'DSK markers',
	aux: 'Aux markers',
}))
	CONN_FIELDS[`tallyColour_${k}`] = { label: `Tally colour: ${name}`, kind: 'colour' }
for (const [g, name] of Object.entries({
	main: 'PGM/PVW colours',
	pinp: 'PinP markers',
	key: 'Key markers',
	dsk: 'DSK markers',
	aux: 'Aux markers',
}))
	CONN_FIELDS[`tallyShow_${g}`] = { label: `Show ${name} on`, kind: 'list' }

const PROTOCOL_CHOICES = [
	{ id: 'auto', label: 'Auto (ask the switcher, 3.40+ = named)' },
	{ id: 'named', label: 'Named commands (firmware 3.40+)' },
	{ id: 'lowlevel', label: 'Low-level address commands (any firmware)' },
]

/**
 * Check a value for a connection field. Returns { ok, value } or { ok: false, why }.
 * Used by 'Set connection settings' (the SOP: impossible values are skipped and logged).
 */
function checkField(id, raw) {
	const f = CONN_FIELDS[id]
	const v = String(raw ?? '').trim()
	if (!f) return { ok: false, why: 'not a setting I know' }
	switch (f.kind) {
		case 'int': {
			if (!/^-?\d+(\.\d+)?$/.test(v))
				return { ok: false, why: `needs a number from ${f.min} to ${f.max}, and "${v}" isn't one` }
			const n = Number(v)
			if (!Number.isInteger(n)) return { ok: false, why: `needs a whole number, and ${v} isn't whole` }
			if (n < f.min || n > f.max) return { ok: false, why: `needs ${f.min} to ${f.max}, and ${n} is outside that` }
			return { ok: true, value: String(n) }
		}
		case 'ip': {
			const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(v)
			if (!m || m.slice(1).some((x) => Number(x) > 255))
				return { ok: false, why: `needs an IP address like 192.168.0.1, and "${v}" isn't one` }
			return { ok: true, value: v }
		}
		case 'choice': {
			const lc = v.toLowerCase().replace(/[\s-]/g, '')
			if (!f.choices.includes(lc)) return { ok: false, why: `needs one of ${f.choices.join(', ')}, and "${v}" isn't` }
			const camel = { labelonly: 'labelOnly', labelinput: 'labelInput' }
			return { ok: true, value: camel[lc] || lc }
		}
		case 'colour': {
			const m = /^#?([0-9a-f]{6})$/i.exec(v)
			if (m) return { ok: true, value: parseInt(m[1], 16) }
			if (/^\d+$/.test(v) && Number(v) <= 0xffffff) return { ok: true, value: Number(v) }
			return { ok: false, why: `needs a colour like #FF0000, and "${v}" isn't one` }
		}
		case 'list': {
			const sources = require('./sources')
			const ids = v
				.split(/[,;\s]+/)
				.filter(Boolean)
				.map((x) => sources.resolveSource(x))
			if (ids.some((x) => !x))
				return {
					ok: false,
					why: `needs sources like INPUT1, HDMI3, STILL2 (comma separated), and "${v}" has one I don't know`,
				}
			return { ok: true, value: ids.map((x) => x.id) }
		}
		case 'bool': {
			const lc = v.toLowerCase()
			if (['true', 'on', '1', 'yes'].includes(lc)) return { ok: true, value: true }
			if (['false', 'off', '0', 'no'].includes(lc)) return { ok: true, value: false }
			return { ok: false, why: `needs on or off, and "${v}" isn't either` }
		}
		default:
			return { ok: true, value: v }
	}
}

/** What a field shows while the action is in charge of it */
function shownValue(config, id) {
	const v = config ? config[id] : undefined
	if (id === 'password') return String(v ?? '') ? '•••• (hidden)' : 'blank'
	if (typeof v === 'boolean') return v ? 'on' : 'off'
	if (/^tallyColour_/.test(id))
		return (
			'#' +
			Number(v ?? 0)
				.toString(16)
				.padStart(6, '0')
				.toUpperCase()
		)
	if (Array.isArray(v)) return v.length ? v.join(', ') : 'none'
	if (id === 'protocol') return (PROTOCOL_CHOICES.find((c) => c.id === v) || {}).label || String(v ?? '')
	if (id === 'inputNaming') return v === 'input' ? 'Input' : 'XPT'
	if (id === 'buttonText') return { labelInput: 'Label + input', full: 'Full' }[v] || 'Label only'
	const s = String(v ?? '').trim()
	return s || 'blank (so the default)'
}

module.exports = {
	CONN_FIELDS,
	PROTOCOL_CHOICES,
	checkField,
	shownValue,

	getConfigFields() {
		let self = this
		const cfg = self.config || {}
		const status = self._authenticated
			? `Connected to ${self.MODEL || 'V-160HD'}${self.VERSION ? ` (firmware ${self.VERSION})` : ''}, talking ${self.PROTOCOL === 'named' ? 'named commands' : 'low-level address commands'}. All good.`
			: 'Not connected yet. Fill in the IP address and password, then Save.'

		/**
		 * A connection field. Once a 'Set connection settings' action has set it, the box is
		 * hidden and a line shows the value instead, with a 'Change back' tick beside it.
		 * `<id>_set` is a hidden flag that remembers which fields the action owns.
		 */
		const lock = (field) => [
			{
				...field,
				// Keep the field's own show/hide rule too (e.g. polling rate only with polling on)
				isVisibleExpression: field.isVisibleExpression
					? `(${field.isVisibleExpression}) && !$(options:${field.id}_set)`
					: `!$(options:${field.id}_set)`,
			},
			{
				type: 'static-text',
				id: `${field.id}_locked`,
				label: field.label,
				width: 9,
				value: `${shownValue(cfg, field.id)} <i>(set by an action)</i>`,
				isVisibleExpression: `$(options:${field.id}_set)`,
			},
			{
				type: 'checkbox',
				id: `${field.id}_changeBack`,
				label: 'Change back',
				width: 3,
				default: false,
				disableAutoExpression: true,
				tooltip: CHANGE_BACK_TIP,
				isVisibleExpression: `$(options:${field.id}_set)`,
			},
			{
				type: 'checkbox',
				id: `${field.id}_set`,
				label: 'Set by an action',
				width: 3,
				default: false,
				disableAutoExpression: true,
				isVisibleExpression: 'false',
			},
		]

		return [
			{
				type: 'static-text',
				id: 'info',
				label: 'Status',
				width: 12,
				value:
					`${status}<br>` +
					'On the switcher: <b>MENU → LAN CONTROL</b>, set a 4-digit password (no password, no remote control). ' +
					'Only one LAN controller at a time: RCS on LAN will knock this off (RCS over USB is fine).' +
					'<br>Want a button, a trigger or a variable to change a setting? Use the <b>Set connection settings</b> action. Anything it sets shows up here with a <b>Change back</b> tick.',
			},
			...lock({
				type: 'textinput',
				id: 'host',
				label: CONN_FIELDS.host.label,
				width: 9,
				default: '192.168.0.1',
				tooltip: "The V-160HD's IP address. You'll find it on the switcher: MENU → LAN CONTROL → INFORMATION.",
			}),
			...lock({
				type: 'textinput',
				id: 'port',
				label: CONN_FIELDS.port.label,
				width: 9,
				default: '8023',
				tooltip: 'The switcher listens on 8023. Leave it unless you know otherwise. (1 to 65535)',
			}),
			...lock({
				type: 'textinput',
				id: 'password',
				label: CONN_FIELDS.password.label,
				width: 9,
				default: '0000',
				tooltip:
					'The 4-digit password from MENU → LAN CONTROL on the switcher. It has to be set there or nothing works.',
			}),
			...lock({
				type: 'dropdown',
				id: 'protocol',
				label: CONN_FIELDS.protocol.label,
				width: 9,
				default: 'auto',
				choices: PROTOCOL_CHOICES,
				tooltip:
					"Auto asks the switcher its firmware when it connects: 3.40 or later gets Roland's named commands (Input 1-20 in every destination, one-shot tally), older gets the low-level address commands. Force one if Auto guesses wrong.",
			}),
			...lock({
				type: 'checkbox',
				id: 'polling',
				label: CONN_FIELDS.polling.label,
				width: 9,
				default: true,
				disableAutoExpression: true,
				tooltip:
					"On: the module keeps asking the switcher what's what, so feedbacks and variables follow changes made on the panel too. It's polite about it now: one question at a time, never piling up. Off: feedbacks only follow this module and the tally the switcher shouts about.",
			}),
			...lock({
				type: 'textinput',
				id: 'pollingrate',
				label: CONN_FIELDS.pollingrate.label,
				width: 9,
				default: '500',
				isVisibleExpression: '$(options:polling)',
				tooltip:
					"How often to ask. A round is skipped if the last one hasn't been answered, so going lower can't swamp the switcher. (100 to 30000)",
			}),
			{
				type: 'static-text',
				id: 'tuning',
				label: "Fine tuning (leave these unless something's up)",
				width: 12,
				value: '',
			},
			...lock({
				type: 'textinput',
				id: 'timeout',
				label: CONN_FIELDS.timeout.label,
				width: 9,
				default: '500',
				tooltip: 'How long to wait for the switcher to answer one command before moving on. (50 to 5000)',
			}),
			...lock({
				type: 'textinput',
				id: 'gap',
				label: CONN_FIELDS.gap.label,
				width: 9,
				default: '20',
				tooltip:
					'A breath between one answer and the next command. Roland asks for at least 20 ms between writes. (0 to 1000)',
			}),
			...lock({
				type: 'textinput',
				id: 'retries',
				label: CONN_FIELDS.retries.label,
				width: 9,
				default: '1',
				tooltip:
					"If a button's command gets no answer, send it again this many times. Toggles are never resent (twice would undo it). (0 to 5)",
			}),
			...lock({
				type: 'textinput',
				id: 'silence',
				label: CONN_FIELDS.silence.label,
				width: 9,
				default: '5',
				tooltip:
					'After this many unanswered commands in a row, polling takes a breather until the switcher speaks again. (1 to 100)',
			}),
			{
				type: 'static-text',
				id: 'namesHead',
				label: 'Labels and names',
				width: 12,
				value: '',
			},
			...lock({
				type: 'dropdown',
				id: 'inputNaming',
				label: CONN_FIELDS.inputNaming.label,
				width: 9,
				default: 'xpt',
				choices: NAMING_CHOICES,
				tooltip: 'XPT 1 - GFX-B (HDMI 3), or Input 1 - GFX-B (HDMI 3). Used everywhere the module names an input slot.',
			}),
			...lock({
				type: 'dropdown',
				id: 'buttonText',
				label: CONN_FIELDS.buttonText.label,
				width: 9,
				default: 'labelOnly',
				choices: BUTTON_TEXT_CHOICES,
				tooltip:
					'What the source presets show. No label? It falls back to the default name (HDMI 3), then the slot (XPT 1). Also the $(…:name_…) variables.',
			}),
			...lock({
				type: 'textinput',
				id: 'labelrefresh',
				label: CONN_FIELDS.labelrefresh.label,
				width: 9,
				default: '30',
				isVisibleExpression: '!$(options:polling)',
				tooltip:
					'With polling off, read the labels this often in case someone changes them on the panel. With polling on they come in with polling. (0 to 3600, 0 = only on connect and after a set)',
			}),
			{
				type: 'static-text',
				id: 'systemHead',
				label: 'System settings',
				width: 12,
				value: '',
			},
			...lock({
				type: 'checkbox',
				id: 'allowSystem',
				label: CONN_FIELDS.allowSystem.label,
				width: 9,
				default: true,
				disableAutoExpression: true,
				tooltip:
					"Actions and presets for the switcher's MENU → SYSTEM settings (Monitor SW, test pattern, multi-view, panel lock and more).",
			}),
			...lock({
				type: 'checkbox',
				id: 'allowRisky',
				label: CONN_FIELDS.allowRisky.label,
				width: 9,
				default: false,
				disableAutoExpression: true,
				isVisibleExpression: '$(options:allowSystem)',
				tooltip:
					'The ones that can take the output off air: frame rate, system format, output formats, HDCP, reference. Their actions say ⚠ RISKY, their presets have a hazard border, and they need a second press.',
			}),
			...lock({
				type: 'textinput',
				id: 'confirmSecs',
				label: CONN_FIELDS.confirmSecs.label,
				width: 9,
				default: '5',
				tooltip:
					'Risky actions and snapshot restores with risky settings want a second press inside this time. (1 to 30)',
			}),
			...self.tallyConfigFields(lock),
			...self.snapshotConfigFields(),
			...lock({
				type: 'checkbox',
				id: 'verbose',
				label: CONN_FIELDS.verbose.label,
				width: 9,
				default: false,
				tooltip: 'Logs everything sent and received. Handy for hunting problems, noisy otherwise.',
			}),
			{
				type: 'static-text',
				id: 'bundle',
				label: "Psst. This one's got mates. 🍹",
				width: 12,
				value: BUNDLE_NOTICE,
			},
		]
	},
}
