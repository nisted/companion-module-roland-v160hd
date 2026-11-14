'use strict'

/**
 * A byte-for-byte mirror of everything the switcher has told us (DTH replies),
 * keyed by 6-hex-digit address. Labels, system settings and snapshots all read
 * from here, so one parser covers every block.
 *
 * Roland addresses are 7-bit per byte: 02 01 7F + 1 = 02 02 00.
 */

function addrToNum(addr) {
	const a = String(addr).toUpperCase()
	return (parseInt(a.slice(0, 2), 16) << 14) | (parseInt(a.slice(2, 4), 16) << 7) | parseInt(a.slice(4, 6), 16)
}

function numToAddr(n) {
	const h = (x) => x.toString(16).padStart(2, '0').toUpperCase()
	return h((n >> 14) & 0x7f) + h((n >> 7) & 0x7f) + h(n & 0x7f)
}

function addAddr(addr, offset) {
	return numToAddr(addrToNum(addr) + offset)
}

/** Store every byte of a DTH reply. value is a hex string, 2 digits per byte. */
function capture(mem, addr, value) {
	const v = String(value || '').trim()
	if (!/^[0-9A-Fa-f]*$/.test(v) || v.length % 2 !== 0 || v.length === 0) return 0
	const base = addrToNum(addr)
	const n = v.length / 2
	for (let i = 0; i < n; i++) mem[numToAddr(base + i)] = parseInt(v.slice(i * 2, i * 2 + 2), 16)
	return n
}

/** A run of bytes, or undefined if any are missing */
function bytes(mem, addr, count) {
	const base = addrToNum(addr)
	const out = []
	for (let i = 0; i < count; i++) {
		const b = mem[numToAddr(base + i)]
		if (b === undefined) return undefined
		out.push(b)
	}
	return out
}

/** Hex for a DTH write */
function hexBytes(list) {
	return list.map((b) => (b & 0x7f).toString(16).padStart(2, '0').toUpperCase()).join('')
}

/** Roland 2-byte values are 7 bits each: 03 10 = 3*128+16 = 400 */
function from7bit(hi, lo) {
	return ((hi & 0x7f) << 7) | (lo & 0x7f)
}
function to7bit(n) {
	return [(n >> 7) & 0x7f, n & 0x7f]
}

module.exports = { addrToNum, numToAddr, addAddr, capture, bytes, hexBytes, from7bit, to7bit }
