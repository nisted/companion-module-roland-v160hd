'use strict'

/**
 * Multiview labels (LABEL EDIT, 02 xx 00-07, 8 characters each) and the names
 * the module shows for every source.
 *
 * Fallback everywhere: custom label → default name → input slot.
 *   HDMI 3 labelled GFX-B on XPT 1:
 *     full        XPT 1 - GFX-B (HDMI 3)
 *     labelInput  XPT 1 / GFX-B
 *     labelOnly   GFX-B
 */

const sources = require('./sources')
const mem = require('./mem')

/** The 40 label targets, from Roland's Remote Control Guide v3.30 */
const LABEL_TARGETS = []
for (let i = 1; i <= 8; i++) LABEL_TARGETS.push({ id: `HDMI${i}`, label: `HDMI ${i}`, byte: 0x10 + i - 1 })
for (let i = 1; i <= 8; i++) LABEL_TARGETS.push({ id: `SDI${i}`, label: `SDI ${i}`, byte: 0x18 + i - 1 })
for (let i = 1; i <= 16; i++) LABEL_TARGETS.push({ id: `STILL${i}`, label: `Still ${i}`, byte: 0x20 + i - 1 })
LABEL_TARGETS.push({ id: 'PGM', label: 'Program', byte: 0x30 })
LABEL_TARGETS.push({ id: 'SUBPGM', label: 'Sub Program', byte: 0x31 })
LABEL_TARGETS.push({ id: 'PVW', label: 'Preview', byte: 0x32 })
LABEL_TARGETS.push({ id: 'AUX1', label: 'Aux 1', byte: 0x33 })
LABEL_TARGETS.push({ id: 'AUX2', label: 'Aux 2', byte: 0x3a })
LABEL_TARGETS.push({ id: 'AUX3', label: 'Aux 3', byte: 0x3b })
LABEL_TARGETS.push({ id: 'DSK1', label: 'DSK 1 source', byte: 0x3c })
LABEL_TARGETS.push({ id: 'DSK2', label: 'DSK 2 source', byte: 0x3d })
for (const t of LABEL_TARGETS) t.address = '02' + sources.hexOf(t.byte) + '00'
const TARGET_BY_ID = new Map(LABEL_TARGETS.map((t) => [t.id, t]))

const NAMING_CHOICES = [
	{ id: 'xpt', label: 'XPT (XPT 1 - GFX-B (HDMI 3))' },
	{ id: 'input', label: 'Input (Input 1 - GFX-B (HDMI 3))' },
]
const BUTTON_TEXT_CHOICES = [
	{ id: 'labelOnly', label: 'Label only (GFX-B)' },
	{ id: 'labelInput', label: 'Label + input (XPT 1 / GFX-B)' },
	{ id: 'full', label: 'Full (XPT 1 - GFX-B (HDMI 3))' },
]

/** Decode 8 bytes: stop at the first NUL, drop trailing spaces */
function decodeLabel(list) {
	if (!list) return undefined
	let s = ''
	for (const b of list) {
		if (b === 0) break
		s += b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : ''
	}
	return s.replace(/\s+$/, '')
}

/** Encode text to 8 bytes, padded with NUL (what the switcher uses). Returns { bytes, cut, replaced } */
function encodeLabel(text) {
	const raw = String(text ?? '')
	let replaced = false
	const chars = [...raw].map((c) => {
		const code = c.charCodeAt(0)
		if (code >= 0x20 && code < 0x7f) return code
		replaced = true
		return 0x3f // ?
	})
	const cut = chars.length > 8
	const out = chars.slice(0, 8)
	while (out.length < 8) out.push(0)
	return { bytes: out, cut, replaced, shown: String.fromCharCode(...chars.slice(0, 8)) }
}

const squash = (s) =>
	String(s || '')
		.toUpperCase()
		.replace(/[\s_-]+/g, '')

function resolveTarget(value) {
	const up = String(value ?? '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '')
	if (TARGET_BY_ID.has(up)) return TARGET_BY_ID.get(up)
	return LABEL_TARGETS.find((t) => squash(t.label) === up)
}

module.exports = {
	LABEL_TARGETS,
	NAMING_CHOICES,
	BUTTON_TEXT_CHOICES,
	decodeLabel,
	encodeLabel,
	resolveTarget,

	/** The custom label for a target, or '' if blank or just the default name */
	customLabel: function (targetId) {
		const t = TARGET_BY_ID.get(targetId)
		if (!t) return ''
		const l = decodeLabel(mem.bytes(this.MEM || {}, t.address, 8))
		if (!l) return ''
		if (squash(l) === squash(t.label)) return ''
		return l
	},

	/** What the module calls input slots: 'XPT' (default) or 'Input' */
	slotWord: function () {
		return this.config && this.config.inputNaming === 'input' ? 'Input' : 'XPT'
	},

	/** The physical source sitting on input slot n (1-20), or undefined */
	_slotPhysical: function (n) {
		const a = Array.isArray(this.DATA && this.DATA.inputAssign) ? this.DATA.inputAssign[n - 1] : undefined
		const s = sources.sourceFromHex(a)
		return s && !s.id.startsWith('INPUT') ? s : undefined
	},

	/**
	 * The name for a source, in one of three forms (see top of file).
	 * mode: 'full' | 'labelInput' | 'labelOnly'
	 */
	sourceName: function (srcId, mode = 'full') {
		const s = sources.resolveSource(srcId)
		if (!s) return String(srcId ?? '')
		const physName = (p) => {
			const custom = this.customLabel(p.id)
			return { custom, def: p.label, full: custom ? `${custom} (${p.label})` : p.label }
		}
		if (!s.id.startsWith('INPUT')) {
			const p = physName(s)
			return mode === 'full' ? p.full : p.custom || p.def
		}
		const n = Number(s.id.slice(5))
		const word = `${this.slotWord()} ${n}`
		const phys = this._slotPhysical(n)
		if (!phys) return word
		const p = physName(phys)
		if (mode === 'full') return `${word} - ${p.full}`
		if (mode === 'labelInput') return `${word} / ${p.custom || p.def}`
		return p.custom || p.def
	},

	/** Button-text form chosen on the connection page */
	buttonTextMode: function () {
		const m = this.config && this.config.buttonText
		return BUTTON_TEXT_CHOICES.some((c) => c.id === m) ? m : 'labelOnly'
	},

	/** Name for a target in dropdowns: GFX-B (HDMI 3), or just HDMI 3 */
	targetName: function (t) {
		const custom = this.customLabel(t.id)
		return custom ? `${custom} (${t.label})` : t.label
	},

	// ── Reading and writing ────────────────────────────────────────────────

	readLabels: function () {
		for (const t of LABEL_TARGETS) this.sendRawCommand(`RQH:${t.address},000008;`)
	},

	/** Set a label. Over 8 characters is cut to 8 and logged. */
	setLabel: function (rawTarget, rawText) {
		const t = resolveTarget(rawTarget)
		if (!t) {
			this.log(
				'warn',
				`Label: set: "${rawTarget}" isn't a label I know (HDMI 1-8, SDI 1-8, Still 1-16, PGM, PVW, Aux 1-3, DSK 1-2).`,
			)
			return false
		}
		const e = encodeLabel(rawText)
		if (e.cut)
			this.log('warn', `Label: set ${t.label}: "${rawText}" is over 8 characters, so it's been cut to "${e.shown}".`)
		if (e.replaced) this.log('warn', `Label: set ${t.label}: characters the switcher can't show were swapped for "?".`)
		this.sendCommand(t.address, mem.hexBytes(e.bytes))
		// Show it straight away, then read it back to be sure
		if (!this.MEM) this.MEM = {}
		mem.capture(this.MEM, t.address, mem.hexBytes(e.bytes))
		this.sendRawCommand(`RQH:${t.address},000008;`)
		this._labelsChanged()
		return true
	},

	/** Labels or input assigns changed: names in variables now, dropdowns shortly after */
	_labelsChanged: function () {
		const sig = this._nameSignature()
		if (sig === this._lastNameSig) return
		this._lastNameSig = sig
		if (typeof this.checkVariables === 'function') this.checkVariables()
		clearTimeout(this._rebuildTimer)
		this._rebuildTimer = setTimeout(() => {
			if (typeof this._buildDefinitions === 'function') this._buildDefinitions()
		}, 1000)
	},

	_nameSignature: function () {
		const parts = LABEL_TARGETS.map((t) => this.customLabel(t.id))
		const a = Array.isArray(this.DATA && this.DATA.inputAssign) ? this.DATA.inputAssign.join(',') : ''
		return parts.join('|') + '#' + a + '#' + this.slotWord()
	},

	/** Timed label refresh, only when polling's off (polling reads them itself) */
	startLabelRefresh: function () {
		clearInterval(this._labelTimer)
		this._labelTimer = undefined
		if (this.config && this.config.polling) return
		const secs = Number(this.config && this.config.labelrefresh)
		const s = Number.isFinite(secs) ? secs : 30
		if (s <= 0) return
		this._labelTimer = setInterval(() => this.readLabels(), Math.max(5, s) * 1000)
	},

	stopLabelRefresh: function () {
		clearInterval(this._labelTimer)
		this._labelTimer = undefined
		clearTimeout(this._rebuildTimer)
	},

	// ── Definitions ────────────────────────────────────────────────────────

	targetChoices: function () {
		return LABEL_TARGETS.map((t) => ({ id: t.id, label: this.targetName(t) }))
	},

	labelActions: function (actions) {
		const self = this
		actions.label_set = {
			name: 'Label: set',
			description: 'Sets a multiview label on the switcher. Up to 8 characters; longer gets cut to 8 (and logged).',
			options: [
				{
					type: 'dropdown',
					label: 'Label',
					id: 'target',
					default: 'HDMI1',
					choices: self.targetChoices(),
					tooltip: 'HDMI 1-8, SDI 1-8, Still 1-16, Program, Sub Program, Preview, Aux 1-3, DSK 1-2 source.',
				},
				{
					type: 'textinput',
					label: 'Text',
					id: 'text',
					default: '',
					tooltip: 'Up to 8 characters; longer text is cut to 8. Accepts variables and expressions.',
				},
			],
			callback: (a) => self.setLabel(a.options.target, a.options.text),
		}
		actions.label_refresh = {
			name: 'Label: refresh',
			description: 'Reads every label from the switcher again.',
			options: [],
			callback: () => self.readLabels(),
		}
	},

	labelFeedbacks: function (feedbacks) {
		const self = this
		feedbacks.labelMatches = {
			type: 'boolean',
			name: 'Label: matches text',
			description: "True while a source's multiview label is the text you give (not fussy about upper/lower case).",
			defaultStyle: { color: 0xffffff, bgcolor: 0xcc0000 },
			options: [
				{ type: 'dropdown', label: 'Label', id: 'target', default: 'HDMI1', choices: self.targetChoices() },
				{ type: 'textinput', label: 'Text', id: 'text', default: '' },
			],
			callback: (fb) => {
				const t = resolveTarget(fb.options.target)
				if (!t) return false
				const l = decodeLabel(mem.bytes(self.MEM || {}, t.address, 8)) ?? ''
				return squash(l) === squash(fb.options.text)
			},
		}
	},

	labelVariableDefs: function (add) {
		for (const t of LABEL_TARGETS) add(`label_${t.id.toLowerCase()}`, `Label: ${t.label}`)
		for (const s of sources.SOURCES) {
			add(`name_${s.id.toLowerCase()}`, `Name (button text form): ${s.label}`)
			add(`fullname_${s.id.toLowerCase()}`, `Name (full): ${s.label}`)
		}
	},

	labelVariableValues: function (v) {
		const mode = this.buttonTextMode()
		for (const t of LABEL_TARGETS) {
			v[`label_${t.id.toLowerCase()}`] = decodeLabel(mem.bytes(this.MEM || {}, t.address, 8)) ?? ''
		}
		for (const s of sources.SOURCES) {
			v[`name_${s.id.toLowerCase()}`] = this.sourceName(s.id, mode)
			v[`fullname_${s.id.toLowerCase()}`] = this.sourceName(s.id, 'full')
		}
	},
}
