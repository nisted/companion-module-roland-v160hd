'use strict'

const { combineRgb } = require('@companion-module/base')
const sources = require('./sources')

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const RED = combineRgb(200, 0, 0)
const GREEN = combineRgb(0, 150, 0)
const PURPLE = combineRgb(85, 0, 170)
const AMBER = combineRgb(200, 120, 0)

module.exports = {
	initPresets: function () {
		let self = this
		const presets = {}
		const structure = []
		const L = self.label

		const W = self.slotWord()
		const section = (id, name) => structure.push({ id, name, definitions: [] })
		const button = (id, name, text, down, feedbacks = [], up = [], bgcolor = BLACK) => {
			presets[id] = {
				type: 'simple',
				name,
				style: { text, size: 'auto', color: WHITE, bgcolor },
				steps: [{ down, up }],
				feedbacks,
			}
			structure[structure.length - 1].definitions.push(id)
		}
		const onWhere = (where, source, bg) => ({
			feedbackId: 'sourceOn',
			options: { where, source },
			style: { bgcolor: bg, color: WHITE },
		})

		const inputs = sources.SOURCES.filter((s) => s.id.startsWith('INPUT'))
		const direct = sources.PHYSICAL_SOURCES
		// Button text follows the labels live (form chosen on the connection page)
		const short = (s) => `$(${L}:name_${s.id.toLowerCase()})`
		const full = (s) => self.sourceName(s.id, 'full')
		const look = (s) => ({ feedbackId: 'tally', options: { input: s.id } })

		// ── 1. Program / Preview / Cut / Auto ──
		section('transitions', 'Cut and Auto')
		button('cut', 'Cut', 'CUT', [{ actionId: 'cut', options: { source: '' } }])
		button('auto', 'Auto', 'AUTO', [{ actionId: 'auto', options: { source: '', time: '' } }])
		button('auto_1s', 'Auto, 1 second', 'AUTO\\n1s', [{ actionId: 'auto', options: { source: '', time: '1' } }])
		button('auto_2s', 'Auto, 2 seconds', 'AUTO\\n2s', [{ actionId: 'auto', options: { source: '', time: '2' } }])

		section('pgm', `Program: ${W} 1-20`)
		for (const s of inputs) {
			button(
				`pgm_${s.id}`,
				`Program: ${full(s)}`,
				short(s),
				[{ actionId: 'select_pgm', options: { source: s.id } }],
				[look(s)],
			)
		}
		section('pvw', `Preview: ${W} 1-20`)
		for (const s of inputs) {
			button(
				`pvw_${s.id}`,
				`Preview: ${full(s)}`,
				short(s),
				[{ actionId: 'select_pvw', options: { source: s.id } }],
				[look(s)],
			)
		}
		section('pgm_direct', 'Program: HDMI, SDI and Stills')
		for (const s of direct) {
			button(
				`pgm_${s.id}`,
				`Program: ${full(s)}`,
				short(s),
				[{ actionId: 'select_pgm', options: { source: s.id } }],
				[look(s)],
			)
		}
		section('pvw_direct', 'Preview: HDMI, SDI and Stills')
		for (const s of direct) {
			button(
				`pvw_${s.id}`,
				`Preview: ${full(s)}`,
				short(s),
				[{ actionId: 'select_pvw', options: { source: s.id } }],
				[look(s)],
			)
		}
		section('cut_to', `Cut straight to ${W} 1-20`)
		for (const s of inputs) {
			button(
				`cut_${s.id}`,
				`Cut to ${full(s)}`,
				`CUT\\n${short(s)}`,
				[{ actionId: 'cut', options: { source: s.id } }],
				[look(s)],
			)
		}

		// ── 2. Routing: Aux, PinP & Key, DSK ──
		for (let a = 1; a <= 3; a++) {
			section(`aux${a}`, `Aux ${a}: ${W} 1-20`)
			for (const s of inputs) {
				button(
					`aux${a}_${s.id}`,
					`Aux ${a}: ${full(s)}`,
					`AUX ${a}\\n${short(s)}`,
					[{ actionId: 'aux_assign', options: { aux: String(a), source: s.id } }],
					[onWhere(`aux${a}`, s.id, PURPLE)],
				)
			}
		}
		for (let k = 1; k <= 4; k++) {
			section(`pinp${k}`, `PinP & Key ${k}: ${W} 1-20`)
			button(
				`pinp${k}_pgm`,
				`PinP & Key ${k} on Program (toggle on/off with the switcher state)`,
				`PinP ${k}\\nON AIR`,
				[{ actionId: 'pnpkey_busselect', options: { pinp: ['1B', '1C', '1D', '1E'][k - 1], bus: '00', onoff: '01' } }],
				[
					{
						feedbackId: 'keyOnAir',
						options: { pinp: ['1B', '1C', '1D', '1E'][k - 1], bus: '00', onoff: '01' },
						style: { bgcolor: RED, color: WHITE },
					},
				],
			)
			button(`pinp${k}_pgm_off`, `PinP & Key ${k} off Program`, `PinP ${k}\\nOFF`, [
				{ actionId: 'pnpkey_busselect', options: { pinp: ['1B', '1C', '1D', '1E'][k - 1], bus: '00', onoff: '00' } },
			])
			for (const s of inputs) {
				button(
					`pinp${k}_${s.id}`,
					`PinP & Key ${k}: ${full(s)}`,
					`PinP ${k}\\n${short(s)}`,
					[{ actionId: 'pnpkey_setsource', options: { pinp: String(k), source: s.id } }],
					[onWhere(`pinp${k}`, s.id, PURPLE)],
				)
			}
		}
		for (let d = 1; d <= 2; d++) {
			section(`dsk${d}`, `DSK ${d}: key source ${W} 1-20`)
			button(`dsk${d}_on`, `DSK ${d} on Program`, `DSK ${d}\\nON AIR`, [
				{ actionId: 'dsk_busselect', options: { dsk: d === 1 ? '1F' : '20', bus: '00', onoff: '01' } },
			])
			button(`dsk${d}_off`, `DSK ${d} off Program`, `DSK ${d}\\nOFF`, [
				{ actionId: 'dsk_busselect', options: { dsk: d === 1 ? '1F' : '20', bus: '00', onoff: '00' } },
			])
			for (const s of inputs) {
				button(
					`dsk${d}_${s.id}`,
					`DSK ${d} key: ${full(s)}`,
					`DSK ${d}\\n${short(s)}`,
					[{ actionId: 'set_dsk_key_source', options: { dsk: String(d), source: s.id } }],
					[onWhere(`dsk${d}`, s.id, PURPLE)],
				)
			}
		}

		// ── 3. Memories and macros ──
		section('memories', 'Memories 1-30 (named from the switcher)')
		for (let m = 1; m <= 30; m++) {
			button(
				`memory_${m}`,
				`Load memory ${m}`,
				`MEM ${m}\\n$(${L}:memoryname_${m})`,
				[{ actionId: 'load_memory_trigger', options: { memory: m - 1 } }],
				[{ feedbackId: 'memoryLoaded', options: { memory: m }, style: { bgcolor: GREEN, color: WHITE } }],
			)
		}
		section('macros', 'Macros 1-100')
		for (let m = 1; m <= 100; m++) {
			button(`macro_${m}`, `Run macro ${m}`, `MACRO\\n${m}`, [{ actionId: 'run_macro', options: { macro: m } }])
		}

		// ── 4. Cameras, freeze and fade ──
		section('freeze_ftb', 'Freeze and output fade')
		button(
			'freeze_on',
			'Freeze on',
			'FREEZE\\nON',
			[{ actionId: 'freezeSwitchOn', options: {} }],
			[{ feedbackId: 'freeze', options: {}, style: { bgcolor: AMBER, color: WHITE } }],
		)
		button('freeze_off', 'Freeze off', 'FREEZE\\nOFF', [{ actionId: 'freezeSwitchOff', options: {} }])
		button(
			'ftb',
			'Output fade (toggle)',
			'FADE\\nTO BLACK',
			[{ actionId: 'ftb', options: { mode: 'toggle' } }],
			[{ feedbackId: 'ftb', options: {}, style: { bgcolor: RED, color: WHITE } }],
		)

		section('cameras', 'Cameras: pick one, then drive it')
		for (const c of self.CHOICES_CAMERAS) {
			const n = c.label.replace('Camera ', '')
			button(`cam_select_${n}`, `Select ${c.label}`, `CAM ${n}`, [
				{ actionId: 'selectCamera', options: { camera: c.id } },
			])
		}
		const drive = [
			['pan_left', 'Pan left', '◀', 'cameraPanLeft', 'cameraPanStop'],
			['pan_right', 'Pan right', '▶', 'cameraPanRight', 'cameraPanStop'],
			['tilt_up', 'Tilt up', '▲', 'cameraTiltUp', 'cameraTiltStop'],
			['tilt_down', 'Tilt down', '▼', 'cameraTiltDown', 'cameraTiltStop'],
			['zoom_in', 'Zoom in', 'ZOOM\\nIN', 'cameraZoomInSlow', 'cameraZoomStop'],
			['zoom_out', 'Zoom out', 'ZOOM\\nOUT', 'cameraZoomOutSlow', 'cameraZoomStop'],
		]
		for (const [id, name, text, down, up] of drive) {
			button(
				`cam_${id}`,
				`Selected camera: ${name} (hold)`,
				text,
				[{ actionId: down, options: { useSelected: true, camera: '41' } }],
				[],
				[{ actionId: up, options: { useSelected: true, camera: '41' } }],
			)
		}
		for (let p = 1; p <= 10; p++) {
			button(`cam_preset_${p}`, `Selected camera: recall preset ${p}`, `PRESET\\n${p}`, [
				{ actionId: 'cameraCurrentPreset', options: { useSelected: true, camera: '41', preset: sources.hexOf(p - 1) } },
			])
		}

		// ── 5. Labels and snapshots ──
		section('labels', 'Labels')
		button('label_refresh', 'Read every label again', 'LABELS\\nREFRESH', [{ actionId: 'label_refresh', options: {} }])
		section('snapshots', 'Snapshots (save and restore the set-up)')
		for (let n = 1; n <= 4; n++) {
			button(`snap_save_${n}`, `Save snapshot "Snapshot ${n}"`, `SAVE\\nSNAP ${n}`, [
				{ actionId: 'snapshot_save', options: { name: `Snapshot ${n}`, parts: self.SNAPSHOT_PARTS.map((p) => p.id) } },
			])
			button(
				`snap_restore_${n}`,
				`Restore snapshot "Snapshot ${n}" (press twice if it holds risky settings)`,
				`LOAD\\nSNAP ${n}`,
				[
					{
						actionId: 'snapshot_restore',
						options: { name: `Snapshot ${n}`, parts: self.SNAPSHOT_PARTS.map((p) => p.id) },
					},
				],
				[{ feedbackId: 'confirmPending', options: {}, style: { bgcolor: AMBER, color: BLACK } }],
			)
		}

		// ── 6. System settings (if allowed on the connection page) ──
		const HAZARD = combineRgb(255, 176, 0)
		const layered = (id, name, text, down, fb) => {
			const overrides = (colour) => [
				{ elementId: 'bg', elementProperty: 'color', override: { isExpression: false, value: colour } },
			]
			const lf = [{ feedbackId: 'confirmPending', options: {}, styleOverrides: overrides(HAZARD) }]
			const sf = [{ feedbackId: 'confirmPending', options: {}, style: { bgcolor: HAZARD, color: BLACK } }]
			if (fb) {
				lf.unshift({ ...fb, styleOverrides: overrides(combineRgb(120, 60, 0)) })
				sf.unshift({ ...fb, style: { bgcolor: combineRgb(120, 60, 0), color: WHITE } })
			}
			presets[id] = {
				type: 'alternatives',
				variants: [
					{
						type: 'layered',
						name: `${self.SYSTEM_RISKY_FLAG} ${name}`,
						elements: [
							{
								type: 'box',
								id: 'bg',
								x: 0,
								y: 0,
								width: 100,
								height: 100,
								color: BLACK,
								borderWidth: 6,
								borderColor: HAZARD,
								borderPosition: 'inside',
							},
							{
								type: 'text',
								id: 'text',
								x: 0,
								y: 0,
								width: 100,
								height: 100,
								text: text.replace(/\\n/g, '\n'),
								color: WHITE,
								halign: 'center',
								valign: 'center',
							},
						],
						steps: [{ down, up: [] }],
						feedbacks: lf,
					},
					{
						type: 'simple',
						name: `${self.SYSTEM_RISKY_FLAG} ${name}`,
						style: { text: `⚠ ${text}`, size: 'auto', color: HAZARD, bgcolor: BLACK },
						steps: [{ down, up: [] }],
						feedbacks: sf,
					},
				],
			}
			structure[structure.length - 1].definitions.push(id)
		}
		self.systemPresets(section, button, layered)

		self.setPresetDefinitions(structure, presets)
	},
}
