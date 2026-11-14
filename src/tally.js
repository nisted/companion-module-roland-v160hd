'use strict'

/**
 * The full tally look for a source button (one advanced feedback, drawn by the module,
 * so it works on simple and Companion 5 buttons alike):
 *
 *   Main PGM source        red fill
 *   Main PVW source        green fill
 *   Both                   red fill, green border
 *   PinP 1-4               yellow squares, in the corners like the panel:
 *                          P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right
 *   Key 1-4 (same layers)  yellow circles, same corners, K1-K4
 *   DSK 1-2                pink-purple squares, D1 top centre, D2 bottom centre
 *   Aux 1-3                green markers down the right: rows 2-4 of 5 (rows 1 and 5 are P2/P4)
 *   On PGM: filled marker, black text. On PVW: black marker, coloured text.
 *
 * Connection page: default colours, and which sources show each group (all, to start).
 * Each feedback can override both.
 */

const sources = require('./sources')
const { Canvas } = require('./draw')
const { sameSource } = require('./feedbacksSources')

const GROUPS = [
	{ id: 'main', name: 'PGM/PVW colours' },
	{ id: 'pinp', name: 'PinP markers' },
	{ id: 'key', name: 'Key markers' },
	{ id: 'dsk', name: 'DSK markers' },
	{ id: 'aux', name: 'Aux markers' },
]

const DEFAULT_COLOURS = {
	pgm: 0xcc0000,
	pvw: 0x00a000,
	border: 0x00c000,
	pinp: 0xffd400,
	key: 0xffd400,
	dsk: 0xc040c0,
	aux: 0x00c000,
}
const COLOUR_NAMES = {
	pgm: 'PGM fill',
	pvw: 'PVW fill',
	border: 'PGM + PVW border',
	pinp: 'PinP markers',
	key: 'Key markers',
	dsk: 'DSK markers',
	aux: 'Aux markers',
}
const BLACK = 0x000000
const LAYER_ADDR = ['1B', '1C', '1D', '1E']
const DSK_ADDR = ['1F', '20']

module.exports = {
	TALLY_GROUPS: GROUPS,
	TALLY_DEFAULT_COLOURS: DEFAULT_COLOURS,

	/** Where a source is right now */
	tallyState: function (srcId) {
		const D = this.DATA || {}
		const M = this.MEM || {}
		const on = (hex) => hex !== undefined && sameSource(this, hex, srcId)
		const st = { pgm: on(D.pgmsource), pvw: on(D.pvwsource), layers: [], dsks: [], aux: [] }
		for (let n = 1; n <= 4; n++) {
			if (!on(D[`pnpkey${n}source`])) continue
			const a = LAYER_ADDR[n - 1]
			const type = M[`00${a}03`]
			st.layers.push({
				n,
				key: type !== undefined && type !== 0,
				pgm: D[`data_${a}00`] === '01',
				pvw: D[`data_${a}01`] === '01',
			})
		}
		for (let n = 1; n <= 2; n++) {
			const fill = D[`dsk${n}fill`] !== undefined ? D[`dsk${n}fill`] : D[`dsk${n}source`]
			if (!on(fill)) continue
			const a = DSK_ADDR[n - 1]
			st.dsks.push({ n, pgm: M[`00${a}00`] === 1, pvw: M[`00${a}01`] === 1 })
		}
		for (let n = 1; n <= 3; n++) if (on(D[`aux${n}source`])) st.aux.push(n)
		return st
	},

	/** Does this source show this group by default (connection page)? */
	tallyGroupDefault: function (groupId, srcId) {
		const list = this.config && this.config[`tallyShow_${groupId}`]
		if (!Array.isArray(list)) return true
		return list.includes(srcId)
	},

	_tallyColour: function (fbOpts, key) {
		if (fbOpts && fbOpts.ownColours && fbOpts[`c_${key}`] !== undefined) return Number(fbOpts[`c_${key}`])
		const c = this.config && this.config[`tallyColour_${key}`]
		return c !== undefined && c !== '' && Number.isFinite(Number(c)) ? Number(c) : DEFAULT_COLOURS[key]
	},

	/** Draw the look. Returns the advanced feedback result. */
	tallyLook: function (fb) {
		const o = fb.options || {}
		const src = sources.resolveSource(o.source)
		if (!src) return {}
		const show = (g) => {
			const v = String(o[`show_${g}`] ?? 'default')
			if (v === 'on') return true
			if (v === 'off') return false
			return this.tallyGroupDefault(g, src.id)
		}
		const st = this.tallyState(src.id)
		const col = (k) => this._tallyColour(o, k)
		const out = {}
		const W = (fb.image && fb.image.width) || 72
		const H = (fb.image && fb.image.height) || 72
		const cv = new Canvas(W, H)

		if (show('main')) {
			if (st.pgm) out.bgcolor = col('pgm')
			else if (st.pvw) out.bgcolor = col('pvw')
			if (st.pgm && st.pvw) {
				const bw = Number(o.borderWidth ?? this.config?.tallyBorder ?? 5)
				cv.border(Number.isFinite(bw) ? bw * (W / 72) : 5, col('border'))
			}
		}

		const mw = Math.round(W * 0.27)
		const mh = Math.round(H / 5)
		const marker = (x, y, w, h, colour, text, onPgm, round) => {
			const fill = onPgm ? colour : BLACK
			const ink = onPgm ? BLACK : colour
			if (round) cv.circle(x, y, w, h, fill)
			else cv.rect(x, y, w, h, fill)
			cv.text(text, x, y, w, h, ink)
		}
		const corner = (n) =>
			[
				[0, 0],
				[W - mw, 0],
				[0, H - mh],
				[W - mw, H - mh],
			][n - 1]

		for (const l of st.layers) {
			const g = l.key ? 'key' : 'pinp'
			if (!show(g) || !(l.pgm || l.pvw)) continue
			const [x, y] = corner(l.n)
			marker(x, y, mw, mh, col(g), `${l.key ? 'K' : 'P'}${l.n}`, l.pgm, l.key)
		}
		if (show('dsk')) {
			for (const d of st.dsks) {
				if (!(d.pgm || d.pvw)) continue
				marker(Math.round((W - mw) / 2), d.n === 1 ? 0 : H - mh, mw, mh, col('dsk'), `D${d.n}`, d.pgm, false)
			}
		}
		if (show('aux')) {
			const aw = Math.round(W * 0.16)
			for (const n of st.aux)
				marker(W - aw, Math.round((H / 5) * n), aw, Math.round(H / 5), col('aux'), String(n), true, false)
		}

		if (cv.used) {
			out.imageBuffer = cv.base64()
			out.imageBufferEncoding = { pixelFormat: 'RGBA' }
			out.imageBufferPosition = { x: 0, y: 0, width: W, height: H }
		}
		return out
	},

	tallyFeedbacks: function (feedbacks) {
		const self = this
		const showOpt = (g) => ({
			type: 'dropdown',
			label: g.name,
			id: `show_${g.id}`,
			default: 'default',
			choices: [
				{ id: 'default', label: 'As the connection page says' },
				{ id: 'on', label: 'Show' },
				{ id: 'off', label: 'Hide' },
			],
		})
		const colourOpts = Object.keys(DEFAULT_COLOURS).map((k) => ({
			type: 'colorpicker',
			label: COLOUR_NAMES[k],
			id: `c_${k}`,
			default: DEFAULT_COLOURS[k],
			isVisibleExpression: '$(options:ownColours)',
		}))
		feedbacks.tallyLook = {
			type: 'advanced',
			name: 'Tally: full look (PGM/PVW, PinP, Key, DSK, Aux)',
			description:
				'Red on PGM, green on PVW, red with a green border on both. Corner markers for PinP (squares) and keys (circles), DSK top/bottom centre, Aux down the right. Filled = on PGM, black = on PVW.',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: 'INPUT1',
					choices: sources.sourceChoices(),
				},
				...GROUPS.map(showOpt),
				{
					type: 'checkbox',
					label: 'Own colours (instead of the connection page ones)',
					id: 'ownColours',
					default: false,
				},
				...colourOpts,
			],
			callback: (fb) => self.tallyLook(fb),
		}
	},

	tallyConfigFields: function (lock = (f) => [f]) {
		const all = sources.SOURCES.map((s) => s.id)
		const choices = sources.SOURCES.map((s) => ({ id: s.id, label: s.label }))
		const fields = [
			{
				type: 'static-text',
				id: 'tallyHead',
				label: 'Tally look',
				width: 12,
				value: 'For the "Tally: full look" feedback. Each button can still pick its own colours and groups.',
			},
		]
		for (const k of Object.keys(DEFAULT_COLOURS)) {
			fields.push(
				...lock({
					type: 'colorpicker',
					id: `tallyColour_${k}`,
					label: `Tally colour: ${COLOUR_NAMES[k]}`,
					width: 9,
					default: DEFAULT_COLOURS[k],
					tooltip: 'Default for every "Tally: full look" feedback. A button can pick its own instead.',
				}),
			)
		}
		fields.push(
			...lock({
				type: 'textinput',
				id: 'tallyBorder',
				label: 'Tally: PGM + PVW border width',
				width: 9,
				default: '5',
				tooltip: 'In pixels on a standard 72-pixel button. (0 to 20)',
			}),
		)
		for (const g of GROUPS) {
			fields.push(
				...lock({
					type: 'multidropdown',
					id: `tallyShow_${g.id}`,
					label: `Show ${g.name} on`,
					width: 9,
					default: all,
					choices,
					tooltip: 'Sources whose buttons show this, unless the feedback says otherwise. All of them to start.',
				}),
			)
		}
		return fields
	},

	/** DSK 1/2 on PGM/PVW (each poll) */
	readDskOnAir: function () {
		for (const a of DSK_ADDR) this.sendRawCommand(`RQH:00${a}00,000002;`)
	},

	/** PinP or key, per layer (slower tier) */
	readLayerTypes: function () {
		for (const a of LAYER_ADDR) this.sendRawCommand(`RQH:00${a}03,000001;`)
	},
}
