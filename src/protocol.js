'use strict'

/**
 * Which command set to talk to the switcher in.
 *
 *  named     Roland's LAN/RS-232 Basic Control Commands (PGM:INPUT11; AUX:AUX1,HDMI2; TLY; ...).
 *            Firmware 3.40 and later. Input 1-20 work everywhere.
 *  lowlevel  The SysEx address commands (DTH:aabbcc,vv; RQH:...). Every firmware from 1.04.
 *  auto      Ask the switcher's version (VER) and pick: 3.40 or later = named.
 */

const NAMED_FROM = [3, 40]

/** '3.41' -> [3, 41]; anything odd -> undefined */
function parseVersion(v) {
	const m = /(\d+)\.(\d+)/.exec(String(v ?? ''))
	if (!m) return undefined
	return [Number(m[1]), Number(m[2])]
}

function versionAtLeast(v, min) {
	const p = parseVersion(v)
	if (!p) return false
	return p[0] > min[0] || (p[0] === min[0] && p[1] >= min[1])
}

/**
 * @param {string} setting  'auto' | 'named' | 'lowlevel' from the connection page
 * @param {string} version  what VER said, e.g. '3.60'
 */
function choose(setting, version) {
	if (setting === 'named') return 'named'
	if (setting === 'lowlevel') return 'lowlevel'
	return versionAtLeast(version, NAMED_FROM) ? 'named' : 'lowlevel'
}

/**
 * 'PGM:HDMI1,INPUT3' -> { name: 'PGM', args: ['HDMI1', 'INPUT3'] }
 * 'TLY:0,1,2'        -> { name: 'TLY', args: ['0','1','2'] }
 * The answers to Q-commands come back without the Q (QPGM -> PGM).
 */
function parseNamed(msg) {
	const m = /^([A-Z]{2,6})(?::(.*))?$/i.exec(String(msg).trim())
	if (!m) return undefined
	const name = m[1].toUpperCase()
	if (name === 'ACK' || name === 'ERR' || name === 'DTH' || name === 'RQH') return undefined
	const args = m[2] === undefined || m[2] === '' ? [] : m[2].split(',').map((x) => x.trim())
	return { name, args }
}

/** Roland's ERR codes, in plain words */
function errorText(code) {
	switch (String(code)) {
		case '0':
			return "it didn't understand it (syntax error)"
		case '4':
			return 'another setting on the switcher is in charge of that right now, so it had no effect'
		case '5':
			return 'that value is out of range for this switcher or its firmware'
		case '6':
			return 'it was missing its start character (RS-232 only)'
		default:
			return `error ${code}`
	}
}

module.exports = { NAMED_FROM, parseVersion, versionAtLeast, choose, parseNamed, errorText }
