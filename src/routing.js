'use strict'

/**
 * Every routing destination, one way of doing it.
 *
 * Each destination takes the same source list (Input 1-20, HDMI 1-8, SDI 1-8,
 * Still 1-16) and sends either Roland's named command (firmware 3.40+) or
 * the low-level address command, depending on the connection's command set.
 *
 * Input slot assign is the odd one out: a slot is given a physical source
 * (HDMI, SDI, Still) or nothing.
 */

const sources = require('./sources')

/** Where each destination lives. idx is 1-based. */
const DESTINATIONS = {
	pgm: {
		label: 'Program (PGM)',
		count: 1,
		named: (_i, tok) => `PGM:${tok}`,
		address: () => '002100',
		data: () => 'pgmsource',
	},
	pvw: {
		label: 'Preview (PVW)',
		count: 1,
		named: (_i, tok) => `PST:${tok}`,
		address: () => '002101',
		data: () => 'pvwsource',
	},
	aux: {
		label: 'Aux',
		count: 3,
		named: (i, tok) => `AUX:AUX${i},${tok}`,
		address: (i) => ['000011', '00002E', '00002F'][i - 1],
		data: (i) => `aux${i}source`,
	},
	pinp: {
		label: 'PinP & Key',
		count: 4,
		named: (i, tok) => `PIS:PinP${i},${tok}`,
		address: (i) => '00' + ['1B', '1C', '1D', '1E'][i - 1] + '02',
		data: (i) => `pnpkey${i}source`,
	},
	dskkey: {
		label: 'DSK key source',
		count: 2,
		named: (i, tok) => `DSS:DSK${i},${tok}`,
		address: (i) => '00' + ['1F', '20'][i - 1] + '03',
		data: (i) => `dsk${i}source`,
	},
	dskfill: {
		label: 'DSK fill source',
		count: 2,
		// No named command for the fill: always low-level
		named: null,
		address: (i) => '00' + ['1F', '20'][i - 1] + '04',
		data: (i) => `dsk${i}fill`,
	},
}

/**
 * Route a source to a destination.
 * @param self   the module instance
 * @param {string} dest   key of DESTINATIONS
 * @param {number} idx    1-based (Aux 2 = 2)
 * @param {*} rawSource   whatever the button/expression gave
 * @returns {boolean} sent
 */
function route(self, dest, idx, rawSource) {
	const d = DESTINATIONS[dest]
	if (!d) return false
	const n = Number(idx)
	if (!Number.isInteger(n) || n < 1 || n > d.count) {
		self.log('warn', `${d.label}: there's no number "${idx}" (1 to ${d.count}).`)
		return false
	}
	const src = sources.resolveSource(rawSource)
	if (!src) {
		self.log(
			'warn',
			`${d.label}${d.count > 1 ? ' ' + n : ''}: "${rawSource}" isn't a source I know. Try Input 1-20, HDMI 1-8, SDI 1-8 or Still 1-16 (e.g. INPUT11, HDMI2, STILL5, or just 11 for Input 11).`,
		)
		return false
	}
	const isInput = src.id.startsWith('INPUT')
	if (self.PROTOCOL === 'named' && d.named) {
		self.sendNamed(d.named(n, src.id), { needsNamed: isInput })
	} else {
		self.sendCommand(d.address(n), src.hex, { needsNamed: isInput })
	}
	// Show it straight away; polling (or the switcher's ERR) puts it right if needed
	self.DATA[d.data(n)] = src.hex
	self.checkAllFeedbacks()
	self.checkVariables()
	return true
}

/** Give input slot 1-20 a physical source (or nothing) */
function assignSlot(self, rawSlot, rawSource) {
	const slot = sources.resolveSlot(rawSlot)
	if (!slot) {
		self.log('warn', `Assign input: "${rawSlot}" isn't an input slot. Use Input 1-20 (or just the number).`)
		return false
	}
	const n = Number(slot.id.slice(5))
	const none = /^(N\/?A|NONE|NOTHING|OFF)$/i.test(String(rawSource ?? '').trim())
	const src = none ? undefined : sources.resolveSource(rawSource)
	if (!none && (!src || src.id.startsWith('INPUT'))) {
		self.log(
			'warn',
			`Assign input: "${rawSource}" can't go in an input slot. Use HDMI 1-8, SDI 1-8, Still 1-16 or N/A.`,
		)
		return false
	}
	if (self.PROTOCOL === 'named') {
		self.sendNamed(`VIS:${slot.id},${none ? 'N/A' : src.id}`, { needsNamed: n > 10 })
	} else {
		if (none) {
			self.log('warn', 'Assign input: "nothing" needs the named commands (firmware 3.40+).')
			return false
		}
		self.sendCommand(slot.address, src.hex, { needsNamed: n > 10 })
	}
	if (!Array.isArray(self.DATA.inputAssign)) self.DATA.inputAssign = new Array(20).fill(undefined)
	self.DATA.inputAssign[n - 1] = none ? undefined : src.hex
	self.checkAllFeedbacks()
	self.checkVariables()
	return true
}

/** Cut or Auto, optionally to a source first */
function transition(self, kind, rawSource, rawTime) {
	const src = rawSource === undefined || String(rawSource).trim() === '' ? undefined : sources.resolveSource(rawSource)
	if (rawSource !== undefined && String(rawSource).trim() !== '' && !src) {
		self.log('warn', `${kind === 'cut' ? 'Cut' : 'Auto'}: "${rawSource}" isn't a source I know.`)
		return false
	}
	if (self.PROTOCOL === 'named') {
		if (kind === 'cut') {
			self.sendNamed(src ? `CUT:${src.id}` : 'CUT', { repeatable: false })
		} else {
			const t = String(rawTime ?? '').trim()
			let tenths
			if (t !== '') {
				const secs = Number(t)
				if (!Number.isFinite(secs) || secs < 0 || secs > 4) {
					self.log(
						'warn',
						`Auto: the time needs to be 0 to 4 seconds, and "${t}" isn't. Using the switcher's own time.`,
					)
				} else {
					tenths = Math.round(secs * 10)
				}
			}
			if (src && tenths !== undefined) self.sendNamed(`ATO:${src.id},${tenths}`, { repeatable: false })
			else if (src) self.sendNamed(`ATO:${src.id}`, { repeatable: false })
			else self.sendNamed('ATO', { repeatable: false })
		}
		return true
	}
	// Low-level: pick the source on preview, then press the panel's CUT or AUTO.
	if (src) route(self, 'pvw', 1, src.id)
	const sw = kind === 'cut' ? '0B001E' : '0B001F'
	self.sendCommand(sw, '01', { repeatable: false })
	self.sendCommand(sw, '00')
	if (kind === 'auto' && rawTime !== undefined && String(rawTime).trim() !== '') {
		self.log(
			'info',
			"Auto: a custom time needs the named commands (firmware 3.40+), so the switcher's own time was used.",
		)
	}
	return true
}

module.exports = { DESTINATIONS, route, assignSlot, transition }
