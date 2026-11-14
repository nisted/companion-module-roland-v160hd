'use strict'

/**
 * One source list for every routing destination.
 *
 * Each source has:
 *   id     the option value buttons store, and the token the named
 *          (firmware 3.40+) commands use, e.g. 'INPUT11', 'HDMI3', 'STILL12'
 *   label  what people see in dropdowns, e.g. 'Input 11'
 *   hex    the value the low-level (SysEx address) commands use, e.g. '2A'
 *
 * Order everywhere: Input 1-20, HDMI 1-8, SDI 1-8, Still 1-16.
 */

const SOURCES = []
for (let i = 1; i <= 20; i++) SOURCES.push({ id: `INPUT${i}`, label: `Input ${i}`, hex: hexOf(0x1f + i) })
for (let i = 1; i <= 8; i++) SOURCES.push({ id: `HDMI${i}`, label: `HDMI ${i}`, hex: hexOf(i - 1) })
for (let i = 1; i <= 8; i++) SOURCES.push({ id: `SDI${i}`, label: `SDI ${i}`, hex: hexOf(0x07 + i) })
for (let i = 1; i <= 16; i++) SOURCES.push({ id: `STILL${i}`, label: `Still ${i}`, hex: hexOf(0x0f + i) })

/** Physical sources only (what an input slot can be given): HDMI, SDI and Stills */
const PHYSICAL_SOURCES = SOURCES.filter((s) => !s.id.startsWith('INPUT'))

/** Input slots 1-20 */
const INPUT_SLOTS = []
for (let i = 1; i <= 20; i++) {
	// Slots 1-10 live at 00 00 00-09, slots 11-20 at 00 00 24-2D
	INPUT_SLOTS.push({ id: `INPUT${i}`, label: `Input ${i}`, address: '0000' + hexOf(i <= 10 ? i - 1 : 0x24 + (i - 11)) })
}

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]))
const BY_HEX = new Map(SOURCES.map((s) => [s.hex, s]))

function hexOf(n) {
	return n.toString(16).padStart(2, '0').toUpperCase()
}

/**
 * Turn whatever a button or expression gave us into a source.
 * Accepts the token ('INPUT11'), the label ('Input 11'), a hex code from an
 * older button ('2A'), or a plain number meaning an input (11 -> Input 11).
 * Returns undefined when it can't make sense of it.
 */
function resolveSource(value) {
	if (value === undefined || value === null) return undefined
	const raw = String(value).trim()
	if (raw === '') return undefined
	const up = raw.toUpperCase().replace(/\s+/g, '')
	if (BY_ID.has(up)) return BY_ID.get(up)
	// Plain numbers mean an input: 11 -> Input 11
	if (/^\d+$/.test(up)) {
		const n = Number(up)
		return n >= 1 && n <= 20 ? BY_ID.get(`INPUT${n}`) : undefined
	}
	// Hex codes with a letter in ('2A', '0F') are older low-level values.
	// (All-digit hex from older buttons is converted by the upgrade scripts.)
	if (/^[0-9A-F]{2}$/.test(up)) return BY_HEX.get(up)
	return undefined
}

/** A source from a low-level hex value the switcher sent back */
function sourceFromHex(hex) {
	if (hex === undefined || hex === null) return undefined
	return BY_HEX.get(String(hex).trim().toUpperCase().padStart(2, '0'))
}

/** A source from a named-command token the switcher sent back ('INPUT3', 'N/A' -> undefined) */
function sourceFromToken(token) {
	if (token === undefined || token === null) return undefined
	return BY_ID.get(String(token).trim().toUpperCase())
}

/** Resolve an input slot from 'INPUT11', 'Input 11' or 11 */
function resolveSlot(value) {
	const s = resolveSource(value)
	if (!s || !s.id.startsWith('INPUT')) return undefined
	return INPUT_SLOTS.find((x) => x.id === s.id)
}

/**
 * Who names sources in dropdowns. The instance sets this so dropdowns show labels
 * (XPT 1 - GFX-B (HDMI 3)). Each connection runs in its own process, so one is fine.
 */
let namer = null
function useNamer(fn) {
	namer = typeof fn === 'function' ? fn : null
}
const nameOf = (s) => {
	if (!namer) return s.label
	try {
		return namer(s.id) || s.label
	} catch {
		return s.label
	}
}

module.exports = {
	SOURCES,
	PHYSICAL_SOURCES,
	INPUT_SLOTS,
	hexOf,
	resolveSource,
	resolveSlot,
	sourceFromHex,
	sourceFromToken,
	useNamer,
	/** Dropdown choices */
	sourceChoices: () => SOURCES.map((s) => ({ id: s.id, label: nameOf(s) })),
	physicalChoices: (withNone) =>
		(withNone ? [{ id: 'N/A', label: 'Nothing (N/A)' }] : []).concat(
			PHYSICAL_SOURCES.map((s) => ({ id: s.id, label: nameOf(s) })),
		),
	slotChoices: () => INPUT_SLOTS.map((s) => ({ id: s.id, label: nameOf(s) })),
}
