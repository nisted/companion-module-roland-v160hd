'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { makeFake } = require('../test-support/fake')
const mem = require('../src/mem')
const labels = require('../src/labels')
const T = require('../src/systemTable')

function build(cfg) {
	const f = makeFake(cfg)
	f.self.initActions()
	f.self.initFeedbacks()
	f.self.initVariables()
	f.self.initPresets()
	return f
}
const label8 = (s) => mem.hexBytes(labels.encodeLabel(s).bytes)

// ── Memory mirror ─────────────────────────────────────────────────────────

test('addresses carry over in 7 bits: 02 01 7F + 1 = 02 02 00', () => {
	assert.equal(mem.addAddr('02017F', 1), '020200')
	const m = {}
	mem.capture(m, '02017E', '0102')
	assert.equal(m['02017E'], 1)
	assert.equal(m['02017F'], 2)
	assert.deepEqual(mem.to7bit(400), [3, 16])
	assert.equal(mem.from7bit(3, 16), 400)
})

// ── Labels ────────────────────────────────────────────────────────────────

test("labels: 40 targets at the addresses in Roland's guide", () => {
	assert.equal(labels.LABEL_TARGETS.length, 40)
	const at = (id) => labels.LABEL_TARGETS.find((t) => t.id === id).address
	assert.equal(at('HDMI1'), '021000')
	assert.equal(at('SDI1'), '021800')
	assert.equal(at('STILL16'), '022F00')
	assert.equal(at('PGM'), '023000')
	assert.equal(at('AUX1'), '023300')
	assert.equal(at('AUX2'), '023A00')
	assert.equal(at('DSK2'), '023D00')
})

test('labels: decode stops at NUL and drops trailing spaces; encode pads with NUL', () => {
	assert.equal(labels.decodeLabel([0x43, 0x41, 0x4d, 0x20, 0x31, 0x20, 0x20, 0x20]), 'CAM 1')
	assert.equal(labels.decodeLabel([0x50, 0x47, 0x4d, 0, 0, 0, 0, 0]), 'PGM')
	assert.equal(label8('GFX-B'), '4746582D42000000')
})

test('Label: set cuts at 8 characters and logs it', () => {
	const { self, sent, logs } = build()
	self.setLabel('HDMI3', 'GRAPHICS-B')
	assert.ok(sent.includes(`DTH:021200,${label8('GRAPHICS')};`), sent.join(' '))
	assert.ok(logs.some(([l, m]) => l === 'warn' && m.includes('cut to "GRAPHICS"')))
	assert.equal(self.customLabel('HDMI3'), 'GRAPHICS')
})

test('names: full, label + input and label only, with XPT or Input, and the fallbacks', () => {
	const { self } = build()
	mem.capture(self.MEM, '021200', label8('GFX-B')) // HDMI 3
	self.DATA.inputAssign = ['02', '03'] // XPT 1 = HDMI 3, XPT 2 = HDMI 4
	assert.equal(self.sourceName('HDMI3', 'full'), 'GFX-B (HDMI 3)')
	assert.equal(self.sourceName('INPUT1', 'full'), 'XPT 1 - GFX-B (HDMI 3)')
	assert.equal(self.sourceName('INPUT1', 'labelInput'), 'XPT 1 / GFX-B')
	assert.equal(self.sourceName('INPUT1', 'labelOnly'), 'GFX-B')
	// No custom label: just the default name, no doubling
	assert.equal(self.sourceName('INPUT2', 'full'), 'XPT 2 - HDMI 4')
	assert.equal(self.sourceName('INPUT2', 'labelOnly'), 'HDMI 4')
	// A label that's just the default name counts as no label
	mem.capture(self.MEM, '021300', label8('HDMI 4'))
	assert.equal(self.sourceName('HDMI4', 'full'), 'HDMI 4')
	// Nothing on the slot: the slot itself
	assert.equal(self.sourceName('INPUT5', 'labelOnly'), 'XPT 5')
	self.config.inputNaming = 'input'
	assert.equal(self.sourceName('INPUT1', 'full'), 'Input 1 - GFX-B (HDMI 3)')
})

test('label variables, name variables and the label-match feedback', () => {
	const { self } = build({ buttonText: 'labelInput' })
	mem.capture(self.MEM, '021200', label8('GFX-B'))
	self.DATA.inputAssign = ['02']
	self.checkVariables()
	assert.equal(self.variableValues.label_hdmi3, 'GFX-B')
	assert.equal(self.variableValues.name_input1, 'XPT 1 / GFX-B')
	assert.equal(self.variableValues.fullname_input1, 'XPT 1 - GFX-B (HDMI 3)')
	assert.equal(self.variableValues.pgm, '')
	self.DATA.pgmsource = '20'
	self.checkVariables()
	assert.equal(self.variableValues.pgm, 'XPT 1 - GFX-B (HDMI 3)')
	const fb = self.feedbackDefs.labelMatches
	assert.equal(fb.callback({ options: { target: 'HDMI3', text: 'gfx-b' } }), true)
	assert.equal(fb.callback({ options: { target: 'HDMI3', text: 'CAM 1' } }), false)
})

test('label refresh timer only runs with polling off', () => {
	const a = makeFake({ polling: false, labelrefresh: '30' }).self
	a.startLabelRefresh()
	assert.ok(a._labelTimer)
	a.stopLabelRefresh()
	const b = makeFake({ polling: true }).self
	b.startLabelRefresh()
	assert.equal(b._labelTimer, undefined)
})

// ── System settings ───────────────────────────────────────────────────────

test('system table: unique ids and addresses, all inside the blocks we read', () => {
	const ids = new Set()
	const addrs = new Set()
	for (const s of T.SETTINGS) {
		assert.ok(!ids.has(s.id), `id ${s.id}`)
		ids.add(s.id)
		for (let i = 0; i < s.size; i++) {
			const a = mem.addAddr(s.addr, i)
			assert.ok(!addrs.has(a), `address ${a} (${s.id})`)
			addrs.add(a)
			const inBlock = T.READ_BLOCKS.some((b) => {
				const n = mem.addrToNum(a) - mem.addrToNum(b.addr)
				return n >= 0 && n < b.size
			})
			assert.ok(inBlock, `${s.id} at ${a} is read`)
		}
	}
	assert.ok(T.SETTINGS.length > 250)
})

test('Monitor SW 1 = Aux 1 writes 02 01 16 = 07; Next steps and wraps', () => {
	const { self, sent } = build()
	self.actionDefs.system_system.callback({
		options: { setting: 'monitor1', v_monitor1: '7' },
		controlId: 'c',
		actionId: 'system_system',
	})
	assert.ok(sent.includes('DTH:020116,07;'))
	assert.equal(self.systemValueLabel(T.BY_ID.get('monitor1')), 'Aux 1')
	mem.capture(self.MEM, '020116', '0B')
	self.setSystem('monitor1', 'next')
	assert.ok(sent.includes('DTH:020116,00;'), 'wrapped from DSK 2 source back to N/A')
	self.setSystem('as_bpm', '120')
	assert.ok(sent.includes('DTH:020610,0078;'), '2-byte BPM')
})

test('risky: no actions or presets until allowed; then two presses within the time', () => {
	const off = build().self
	assert.equal(off.actionDefs.system_risky, undefined)
	assert.ok(!Object.keys(off.presetDefs).some((k) => k.startsWith('sys_frame_rate')))
	assert.equal(off.setSystem('frame_rate', '2'), false)

	const { self, sent } = build({ allowRisky: true })
	const a = self.actionDefs.system_risky
	assert.ok(a.name.startsWith('⚠ RISKY'))
	const press = () =>
		a.callback({ options: { setting: 'frame_rate', v_frame_rate: '2' }, controlId: 'b1', actionId: 'system_risky' })
	press()
	assert.ok(!sent.some((c) => c.startsWith('DTH:020101')), 'first press only arms it')
	assert.equal(self.feedbackDefs.confirmPending.callback({ controlId: 'b1' }) || self._confirm.size === 1, true)
	press()
	assert.ok(sent.includes('DTH:020101,02;'), 'second press does it')
	const p = self.presetDefs.sys_frame_rate_step
	assert.equal(p.type, 'alternatives')
	const box = p.variants[0].elements.find((e) => e.id === 'bg')
	assert.equal(box.borderPosition, 'inside')
	assert.ok(box.borderWidth > 0)
})

test('system settings switch off: no system actions or presets', () => {
	const { self } = build({ allowSystem: false })
	assert.ok(!Object.keys(self.actionDefs).some((k) => k.startsWith('system_')))
	assert.ok(!Object.keys(self.presetDefs).some((k) => k.startsWith('sys_')))
})

test('every system preset uses a real action and value', () => {
	const { self } = build({ allowRisky: true })
	let n = 0
	for (const [id, p0] of Object.entries(self.presetDefs)) {
		if (!id.startsWith('sys_') || id.startsWith('sys_user_sw')) continue
		const p = p0.type === 'alternatives' ? p0.variants[0] : p0
		const a = p.steps[0].down[0]
		const def = self.actionDefs[a.actionId]
		assert.ok(def, a.actionId)
		const vkey = Object.keys(a.options).find((k) => k.startsWith('v_'))
		const opt = def.options.find((o) => o.id === vkey)
		assert.ok(
			opt.choices.some((c) => c.id === a.options[vkey]),
			`${id} ${vkey}=${a.options[vkey]}`,
		)
		n++
	}
	assert.ok(n > 400, `${n} system presets`)
})

// ── Tally look ────────────────────────────────────────────────────────────

const px = (res, W, x, y) => {
	const b = Buffer.from(res.imageBuffer, 'base64')
	const i = (y * W + x) * 4
	return (b[i] << 16) | (b[i + 1] << 8) | b[i + 2]
}

test('tally look: red on PGM, green on PVW, red with a green border on both', () => {
	const { self } = build()
	self.DATA.pgmsource = '02'
	self.DATA.pvwsource = '03'
	const look = (src) => self.feedbackDefs.tally.callback({ options: { source: src }, image: { width: 72, height: 72 } })
	assert.equal(look('HDMI3').bgcolor, 0xcc0000)
	assert.equal(look('HDMI3').imageBuffer, undefined)
	assert.equal(look('HDMI4').bgcolor, 0x00a000)
	self.DATA.pvwsource = '02'
	const both = look('HDMI3')
	assert.equal(both.bgcolor, 0xcc0000)
	assert.equal(px(both, 72, 36, 1), 0x00c000, 'green border at the top')
	assert.equal(px(both, 72, 36, 36) === 0, true, 'middle left clear')
})

test('tally look: PinP square top-left, key circle, DSK top centre, Aux down the right', () => {
	const { self } = build()
	self.DATA.pnpkey1source = '02'
	self.DATA.data_1B00 = '01' // PinP 1 on PGM
	self.MEM['001B03'] = 0 // PinP
	self.DATA.pnpkey4source = '02'
	self.DATA.data_1E01 = '01' // layer 4 on PVW
	self.MEM['001E03'] = 1 // key
	self.DATA.dsk1fill = '02'
	self.MEM['001F00'] = 1
	self.DATA.aux2source = '02'
	const r = self.feedbackDefs.tally.callback({ options: { source: 'HDMI3' }, image: { width: 72, height: 72 } })
	assert.equal(r.bgcolor, undefined, 'not the main PGM source')
	assert.equal(px(r, 72, 0, 0), 0xffd400, 'P1: yellow square in the corner')
	// Layer 4 is a key on PVW: black circle, so the very corner stays clear
	assert.equal(px(r, 72, 71, 71), 0, 'K4 is round')
	assert.equal(px(r, 72, 36, 0), 0xc040c0, 'D1 top centre, on PGM')
	assert.equal(px(r, 72, 71, Math.round(72 / 5) * 2 + 2), 0x00c000, 'Aux 2 in row 3 on the right')
	// The feedback can hide a group
	const hidden = self.feedbackDefs.tally.callback({
		options: { source: 'HDMI3', custom: true, show_pinp: 'off', show_key: 'off', show_dsk: 'off', show_aux: 'off' },
		image: { width: 72, height: 72 },
	})
	assert.equal(hidden.imageBuffer, undefined)
	// So can the connection page, per source
	self.config.tallyShow_aux = ['HDMI1']
	const r2 = self.feedbackDefs.tally.callback({
		options: { source: 'HDMI3', custom: true, show_pinp: 'off', show_key: 'off', show_dsk: 'off' },
		image: { width: 72, height: 72 },
	})
	assert.equal(r2.imageBuffer, undefined)
})

test('tally look: an input slot lights for its HDMI and the other way round', () => {
	const { self } = build()
	self.DATA.inputAssign = ['02']
	self.DATA.pgmsource = '20' // XPT 1
	const look = (src) => self.feedbackDefs.tally.callback({ options: { source: src }, image: { width: 72, height: 72 } })
	assert.equal(look('HDMI3').bgcolor, 0xcc0000)
	assert.equal(look('INPUT1').bgcolor, 0xcc0000)
})

// ── Snapshots ─────────────────────────────────────────────────────────────

function loaded() {
	const f = build({ allowRisky: true })
	const self = f.self
	self._authenticated = true
	mem.capture(self.MEM, '020100', '00' + '02') // HDCP off, frame rate 50
	mem.capture(self.MEM, '020116', '07')
	mem.capture(self.MEM, '021200', label8('GFX-B'))
	self.DATA.inputAssign = ['02']
	self.DATA.aux1source = '20'
	return f
}

test('snapshot: capture splits risky from system and keeps labels, inputs and routing', () => {
	const { self } = loaded()
	const s = self.captureSnapshot('Hall 9')
	assert.equal(s.parts.risky['020101'], 2)
	assert.equal(s.parts.system['020116'], 7)
	assert.equal(s.parts.system['020101'], undefined)
	assert.equal(s.parts.labels['021200'], 0x47)
	assert.equal(s.parts.inputs['000000'], 2)
	assert.equal(s.parts.routing['000011'], 0x20)
	const only = self.captureSnapshot('L', ['labels'])
	assert.deepEqual(Object.keys(only.parts), ['labels'])
})

test('snapshot: restore writes only what it holds, risky first, and leaves risky out without the second press', () => {
	const { self, sent } = loaded()
	const store = { 'Hall 9': self.captureSnapshot('Hall 9') }
	self.config.snapshots = JSON.stringify(store)
	sent.length = 0
	self.restoreSnapshot('Hall 9', undefined, false)
	assert.ok(!sent.some((c) => c.startsWith('DTH:020100')), 'risky left out')
	assert.ok(sent.includes('DTH:020116,07;'))
	assert.ok(sent.includes(`DTH:021200,${label8('GFX-B')};`))
	sent.length = 0
	self.restoreSnapshot('Hall 9', ['risky', 'system'], true)
	const first = sent.findIndex((c) => c.startsWith('DTH:020100'))
	const sys = sent.findIndex((c) => c.startsWith('DTH:020116'))
	assert.ok(first >= 0 && first < sys, 'risky before the rest')
	assert.ok(!sent.some((c) => c.startsWith('DTH:0212')), 'labels not picked')
})

test('snapshot restore action: press twice when it holds risky settings', () => {
	const { self, sent } = loaded()
	self.config.snapshots = JSON.stringify({ X: self.captureSnapshot('X') })
	const a = self.actionDefs.snapshot_restore
	sent.length = 0
	a.callback({ options: { name: 'X', parts: ['risky', 'system'] }, controlId: 'b', actionId: 'snapshot_restore' })
	assert.equal(sent.filter((c) => c.startsWith('DTH:')).length, 0)
	a.callback({ options: { name: 'X', parts: ['risky', 'system'] }, controlId: 'b', actionId: 'snapshot_restore' })
	assert.ok(sent.some((c) => c.startsWith('DTH:020100')))
})

test('snapshot web page: export, import, delete', async () => {
	const { self } = loaded()
	self.config.snapshots = JSON.stringify({ 'Hall 9': self.captureSnapshot('Hall 9') })
	self.saveConfig = (c) => (self.config = c)
	const page = await self.handleHttpRequest({ method: 'GET', path: '/', query: {} })
	assert.equal(page.status, 200)
	assert.ok(page.body.includes('Hall 9'))
	const file = await self.handleHttpRequest({ method: 'GET', path: '/snapshot', query: { name: 'Hall 9' } })
	assert.match(file.headers['Content-Disposition'], /attachment/)
	const imp = await self.handleHttpRequest({
		method: 'POST',
		path: '/import',
		query: { name: 'Hall 1' },
		body: file.body,
	})
	assert.equal(JSON.parse(imp.body).name, 'Hall 1')
	assert.deepEqual(self.snapshotStore()['Hall 1'].parts, self.snapshotStore()['Hall 9'].parts)
	const bad = await self.handleHttpRequest({ method: 'POST', path: '/import', query: {}, body: 'nope' })
	assert.equal(bad.status, 400)
	await self.handleHttpRequest({ method: 'POST', path: '/delete', query: { name: 'Hall 1' } })
	assert.equal(self.snapshotStore()['Hall 1'], undefined)
})

test('snapshot: rename and delete from the connection page, fields cleared after', () => {
	const { self } = loaded()
	self.saveConfig = (c) => (self.config = c)
	self.config.snapshots = JSON.stringify({ A: self.captureSnapshot('A'), B: self.captureSnapshot('B') })
	const next = { ...self.config, snapRename: 'A', snapRenameTo: 'Hall 9', snapDelete: 'B' }
	self.takeSnapshotConfigOps(next)
	assert.deepEqual(Object.keys(JSON.parse(next.snapshots)), ['Hall 9'])
	assert.equal(next.snapRename, '')
	assert.equal(next.snapDelete, '')
})

test('snapshot writes: runs of up to 8 bytes, reserved byte skipped', () => {
	const { snapshotRuns } = require('../src/snapshots')
	const m = {}
	for (let i = 0; i < 20; i++) m[mem.addAddr('020130', i)] = 0
	const r = snapshotRuns(m)
	assert.ok(r.every((x) => x.bytes.length <= 8))
	assert.ok(
		!r.some(
			(x) =>
				mem.addrToNum(x.addr) <= mem.addrToNum('020134') &&
				mem.addrToNum(x.addr) + x.bytes.length > mem.addrToNum('020134'),
		),
	)
})

test('connection page has the new switches with the agreed defaults', () => {
	const { self } = makeFake()
	const f = Object.fromEntries(self.getConfigFields().map((x) => [x.id, x]))
	assert.equal(f.inputNaming.default, 'xpt')
	assert.equal(f.buttonText.default, 'labelOnly')
	assert.equal(f.labelrefresh.default, '30')
	assert.ok(f.labelrefresh.isVisibleExpression.startsWith('(!$(options:polling))'))
	assert.equal(f.allowSystem.default, true)
	assert.equal(f.allowRisky.default, false)
	assert.equal(f.confirmSecs.default, '5')
	assert.equal(f.tallyShow_aux.default.length, 52)
})

test('upgrade: existing connections get the new settings at the agreed defaults, typed values kept', () => {
	const up = require('../src/upgrades').upgradeRebel4Config
	const r = up({}, { config: { host: '1.2.3.4', allowRisky: true }, actions: [], feedbacks: [] })
	assert.equal(r.updatedConfig.inputNaming, 'xpt')
	assert.equal(r.updatedConfig.allowSystem, true)
	assert.equal(r.updatedConfig.allowRisky, true)
	assert.equal(r.updatedConfig.labelrefresh, '30')
	assert.equal(r.updatedConfig.tallyShow_pinp.length, 52)
	assert.equal(up({}, { config: r.updatedConfig, actions: [], feedbacks: [] }).updatedConfig, null)
})

// ── USER SW assign (mapped on Nige's unit) ─────────────────────────────────

test('USER SW list: 717 values, and the numbers read off the real switcher', () => {
	const { USER_SW_VALUES, USER_SW_TOTAL, USER_SW_CATEGORIES } = require('../src/userSw')
	assert.equal(USER_SW_TOTAL, 717)
	const at = (v) => USER_SW_VALUES[v].label
	assert.equal(at(40), 'Audio input mute: Audio In 1')
	assert.equal(at(61), 'Audio output mute: Master output')
	assert.equal(at(66), 'Voice changer SW: Audio In 1')
	assert.equal(at(68), 'Reverb (momentary)')
	assert.equal(at(70), 'Preset memory: Memory 1')
	assert.equal(at(100), 'Input scan: Normal')
	assert.equal(at(116), 'Rec control')
	assert.equal(at(117), 'Macro execute: Macro 1')
	assert.equal(at(217), 'GPO (one shot): GPO 1')
	assert.equal(at(233), 'GPO (alternate): GPO 1')
	assert.equal(at(249), 'Camera control: Mode')
	assert.equal(at(250), 'Camera control: Pan left')
	assert.equal(at(377), 'Camera control: Camera 16 select')
	assert.equal(at(378), 'Graphics Presenter: Select next content')
	assert.equal(at(506), 'VC-100UHD control: Select channel 1')
	assert.equal(at(514), 'Yamaha mixer control: Control')
	assert.equal(at(715), 'System: Effects transition sync')
	assert.equal(USER_SW_CATEGORIES.length, 28)
})

test('USER SW assign action: Macro 1 on USER 3 writes 02 01 50 = 00 75', () => {
	const { self, sent } = build()
	self.actionDefs.system_usersw.callback({
		options: { sw: '3', cat: 'macro', item_macro: '0' },
		controlId: 'c',
		actionId: 'system_usersw',
	})
	assert.ok(sent.includes('DTH:020150,0075;'), sent.join(' '))
	// System first item = 715 = 05 4B (as read off the unit)
	self.actionDefs.system_usersw.callback({
		options: { sw: '4', cat: 'system', item_system: '0' },
		controlId: 'c',
		actionId: 'system_usersw',
	})
	assert.ok(sent.includes('DTH:020152,054B;'))
	// What the unit reported, decoded into variables
	mem.capture(self.MEM, '02014C', '002800420075027A')
	self.checkVariables()
	assert.equal(self.variableValues.sys_user_sw1, 'Audio input mute: Audio In 1')
	assert.equal(self.variableValues.sys_user_sw2, 'Voice changer SW: Audio In 1')
	assert.equal(self.variableValues.sys_user_sw3, 'Macro execute: Macro 1')
	assert.equal(self.variableValues.sys_user_sw4, 'Graphics Presenter: Select next content')
})
