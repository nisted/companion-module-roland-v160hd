'use strict'

/**
 * USER SW 1-4 assign list (02 01 4C-53, 2 bytes each). Not in Roland's guide:
 * mapped on Nige's V-160HD (firmware 3.60, 16 Nov 2026) from reads and videos of
 * the panel's lists. 0-716, in panel order.
 */

const range = (prefix, from, to) => {
	const out = []
	for (let i = from; i <= to; i++) out.push(`${prefix}${i}`)
	return out
}
const pad2 = (n) => String(n).padStart(2, '0')

const CATEGORIES = [
	{ id: 'na', name: 'N/A', items: ['---'] },
	{ id: 'freeze', name: 'Freeze', items: ['---'] },
	// Value 3 not seen on the panel: probably BPM tap
	{ id: 'autosw', name: 'Auto switching', items: ['Auto switching SW', 'BPM tap (unconfirmed)'] },
	{ id: 'inputassign', name: 'Input assign', items: range('Input ', 1, 20) },
	{ id: 'still', name: 'Still output', items: range('Still ', 1, 16) },
	{
		id: 'audioinmute',
		name: 'Audio input mute',
		items: [
			'Audio In 1',
			'Audio In 2',
			'Audio In 3/4',
			'USB In',
			'Bluetooth In',
			...range('HDMI ', 1, 8),
			...range('SDI ', 1, 8),
		],
	},
	{ id: 'audiooutmute', name: 'Audio output mute', items: ['Master output', 'Aux 1', 'Aux 2', 'Aux 3', 'USB out'] },
	{ id: 'voicechanger', name: 'Voice changer SW', items: ['Audio In 1', 'Audio In 2'] },
	{ id: 'reverbmom', name: 'Reverb (momentary)', items: ['---'] },
	{ id: 'reverbalt', name: 'Reverb (alternate)', items: ['---'] },
	{ id: 'memory', name: 'Preset memory', items: range('Memory ', 1, 30) },
	{ id: 'inputscan', name: 'Input scan', items: ['Normal', 'Reverse'] },
	{ id: 'memoryscan', name: 'Memory scan', items: ['Normal', 'Reverse'] },
	...[1, 2, 3, 4].map((n) => ({ id: `pinp${n}scan`, name: `PinP & Key ${n} scan`, items: ['Normal', 'Reverse'] })),
	...[1, 2].map((n) => ({ id: `dsk${n}scan`, name: `DSK ${n} scan`, items: ['Normal', 'Reverse'] })),
	{ id: 'rec', name: 'Rec control', items: ['---'] },
	{ id: 'macro', name: 'Macro execute', items: range('Macro ', 1, 100) },
	{ id: 'gpoone', name: 'GPO (one shot)', items: range('GPO ', 1, 16) },
	{ id: 'gpoalt', name: 'GPO (alternate)', items: range('GPO ', 1, 16) },
	{
		id: 'camera',
		name: 'Camera control',
		items: [
			'Mode',
			'Pan left',
			'Pan right',
			'Tilt down',
			'Tilt up',
			'Zoom wide (slow)',
			'Zoom wide (fast)',
			'Zoom tele (slow)',
			'Zoom tele (fast)',
			'Focus near',
			'Focus far',
			'Auto focus',
			'Auto exposure',
			...range('Preset ', 1, 100).map((p) => `${p} recall`),
			...range('Camera ', 1, 16).map((c) => `${c} select`),
		],
	},
	{
		id: 'gp',
		name: 'Graphics Presenter',
		items: [
			'Select next content',
			...range('Select content ', 1, 124),
			'Hide front contents',
			'Hide background contents',
			'On air switch',
		],
	},
	{ id: 'vc100', name: 'VC-100UHD control', items: range('Select channel ', 1, 8) },
	{
		id: 'yamaha',
		name: 'Yamaha mixer control',
		items: [
			'Control',
			...Array.from({ length: 100 }, (_, i) => `Scene recall A${pad2(i)}`),
			...Array.from({ length: 100 }, (_, i) => `Scene recall B${pad2(i)}`),
		],
	},
	{ id: 'system', name: 'System', items: ['Effects transition sync', 'Bluetooth control'] },
]

// Number each item in order
let v = 0
for (const c of CATEGORIES) {
	c.start = v
	v += c.items.length
}
const TOTAL = v // 717

/** Every value as { v, label } */
const VALUES = []
for (const c of CATEGORIES) {
	c.items.forEach((item, i) => {
		VALUES.push({ v: c.start + i, label: item === '---' ? c.name : `${c.name}: ${item}` })
	})
}

function categoryOf(value) {
	for (let i = CATEGORIES.length - 1; i >= 0; i--) if (value >= CATEGORIES[i].start) return CATEGORIES[i]
	return CATEGORIES[0]
}

module.exports = {
	USER_SW_CATEGORIES: CATEGORIES,
	USER_SW_VALUES: VALUES,
	USER_SW_TOTAL: TOTAL,
	userSwCategoryOf: categoryOf,
}
