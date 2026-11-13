'use strict'

const { combineRgb } = require('@companion-module/base')
const sources = require('./sources')

const WHITE = combineRgb(255, 255, 255)
const RED = combineRgb(200, 0, 0)
const GREEN = combineRgb(0, 150, 0)

/** Where each "what's on" answer is kept */
const WHERE = [
	{ id: 'pgm', label: 'Program (PGM)', data: 'pgmsource' },
	{ id: 'pvw', label: 'Preview (PVW)', data: 'pvwsource' },
	{ id: 'aux1', label: 'Aux 1', data: 'aux1source' },
	{ id: 'aux2', label: 'Aux 2', data: 'aux2source' },
	{ id: 'aux3', label: 'Aux 3', data: 'aux3source' },
	{ id: 'pinp1', label: 'PinP & Key 1', data: 'pnpkey1source' },
	{ id: 'pinp2', label: 'PinP & Key 2', data: 'pnpkey2source' },
	{ id: 'pinp3', label: 'PinP & Key 3', data: 'pnpkey3source' },
	{ id: 'pinp4', label: 'PinP & Key 4', data: 'pnpkey4source' },
	{ id: 'dsk1', label: 'DSK 1 key', data: 'dsk1source' },
	{ id: 'dsk2', label: 'DSK 2 key', data: 'dsk2source' },
	{ id: 'dsk1fill', label: 'DSK 1 fill', data: 'dsk1fill' },
	{ id: 'dsk2fill', label: 'DSK 2 fill', data: 'dsk2fill' },
]

/**
 * Is `target` (a source the button asks about) what's in `dataHex`?
 * Input 3 and the HDMI it's given count as the same picture, both ways round.
 */
function sameSource(self, dataHex, target) {
	const want = sources.resolveSource(target)
	const have = sources.sourceFromHex(dataHex)
	if (!want || !have) return false
	if (want.id === have.id) return true
	const phys = (s) => (s.id.startsWith('INPUT') ? self._resolveInputToPhysical(s.hex) : s.hex)
	const a = phys(want)
	const b = phys(have)
	return a !== undefined && b !== undefined && a === b && (want.id.startsWith('INPUT') || have.id.startsWith('INPUT'))
}

function sourceFeedbacks(self, feedbacks) {
	const sourceOpt = {
		type: 'dropdown',
		label: 'Source',
		id: 'source',
		default: 'INPUT1',
		choices: sources.sourceChoices(),
		tooltip: "Input 1-20, HDMI 1-8, SDI 1-8 or Still 1-16. An input and the HDMI/SDI it's given count as the same.",
	}

	feedbacks.tally = {
		type: 'boolean',
		name: 'Tally: source is on Program / Preview',
		description: "From the switcher's own tally: on air (PGM), on preview (PVW), or both.",
		defaultStyle: { color: WHITE, bgcolor: RED },
		options: [
			{ ...sourceOpt, id: 'input' },
			{
				type: 'dropdown',
				label: 'When it is on',
				id: 'state',
				default: 'program',
				choices: [
					{ id: 'program', label: 'Program' },
					{ id: 'preview', label: 'Preview' },
					{ id: 'both', label: 'Both at once' },
					{ id: 'either', label: 'Either' },
				],
			},
		],
		callback: (fb) => {
			const src = sources.resolveSource(fb.options.input)
			if (!src) return false
			const status = (self.TALLY || {})[src.id] || 0
			switch (fb.options.state) {
				case 'preview':
					return (status & 0x02) !== 0
				case 'both':
					return (status & 0x03) === 0x03
				case 'either':
					return status !== 0
				default:
					return (status & 0x01) !== 0
			}
		},
	}

	feedbacks.sourceOn = {
		type: 'boolean',
		name: 'Route: source is on a destination',
		description: 'True when the chosen destination (PGM, PVW, Aux, PinP & Key, DSK) is showing the source.',
		defaultStyle: { color: WHITE, bgcolor: RED },
		options: [
			{
				type: 'dropdown',
				label: 'Destination',
				id: 'where',
				default: 'pgm',
				choices: WHERE.map((w) => ({ id: w.id, label: w.label })),
			},
			sourceOpt,
		],
		callback: (fb) => {
			const w = WHERE.find((x) => x.id === String(fb.options.where).toLowerCase())
			return !!w && sameSource(self, self.DATA[w.data], fb.options.source)
		},
	}

	// Kept for buttons made with the upstream module (upgrade scripts convert their options)
	feedbacks.auxTally = {
		type: 'boolean',
		name: 'Route: Aux is showing a source',
		defaultStyle: { color: WHITE, bgcolor: RED },
		options: [
			{
				type: 'dropdown',
				label: 'Aux',
				id: 'aux',
				default: 'aux1',
				choices: [
					{ id: 'aux1', label: 'Aux 1' },
					{ id: 'aux2', label: 'Aux 2' },
					{ id: 'aux3', label: 'Aux 3' },
				],
			},
			{ ...sourceOpt, id: 'assign' },
		],
		callback: (fb) => sameSource(self, self.DATA[`${String(fb.options.aux).toLowerCase()}source`], fb.options.assign),
	}

	feedbacks.pnpKeySource = {
		type: 'boolean',
		name: 'Route: PinP & Key is showing a source',
		defaultStyle: { color: WHITE, bgcolor: RED },
		options: [
			{
				type: 'dropdown',
				label: 'PinP & Key',
				id: 'pinp',
				default: 'pnpkey1',
				choices: [
					{ id: 'pnpkey1', label: 'PinP & Key 1' },
					{ id: 'pnpkey2', label: 'PinP & Key 2' },
					{ id: 'pnpkey3', label: 'PinP & Key 3' },
					{ id: 'pnpkey4', label: 'PinP & Key 4' },
				],
			},
			sourceOpt,
		],
		callback: (fb) => sameSource(self, self.DATA[`${String(fb.options.pinp).toLowerCase()}source`], fb.options.source),
	}

	feedbacks.inputAssigned = {
		type: 'boolean',
		name: 'Route: input slot has a source',
		description: 'True when Input 1-20 is given the chosen HDMI, SDI or Still.',
		defaultStyle: { color: WHITE, bgcolor: GREEN },
		options: [
			{ type: 'dropdown', label: 'Input slot', id: 'slot', default: 'INPUT1', choices: sources.slotChoices() },
			{ type: 'dropdown', label: 'Source', id: 'source', default: 'HDMI1', choices: sources.physicalChoices(false) },
		],
		callback: (fb) => {
			const slot = sources.resolveSlot(fb.options.slot)
			const src = sources.resolveSource(fb.options.source)
			if (!slot || !src || !Array.isArray(self.DATA.inputAssign)) return false
			return self.DATA.inputAssign[Number(slot.id.slice(5)) - 1] === src.hex
		},
	}

	feedbacks.ftb = {
		type: 'boolean',
		name: 'Output fade: faded to black',
		description: 'Needs firmware 3.40+ (named commands) to know.',
		defaultStyle: { color: WHITE, bgcolor: RED },
		options: [],
		callback: () => ['ON', 'FADEOUT'].includes(String(self.DATA.ftb || '').toUpperCase()),
	}

	feedbacks.memoryLoaded = {
		type: 'boolean',
		name: 'Memory: last loaded',
		defaultStyle: { color: WHITE, bgcolor: GREEN },
		options: [{ type: 'number', label: 'Memory', id: 'memory', default: 1, min: 1, max: 30, tooltip: '1 to 30' }],
		callback: (fb) =>
			self.DATA.lastMemory !== undefined && Number(self.DATA.lastMemory) + 1 === Number(fb.options.memory),
	}
}

module.exports = { sourceFeedbacks, sameSource, WHERE }
