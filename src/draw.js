'use strict'

/**
 * Tiny RGBA drawing for the tally markers: rectangles, circles, a border and a
 * 3x5 pixel font (just the characters the markers need).
 */

const FONT = {
	P: ['111', '101', '111', '100', '100'],
	K: ['101', '101', '110', '101', '101'],
	D: ['110', '101', '101', '101', '110'],
	A: ['010', '101', '111', '101', '101'],
	1: ['010', '110', '010', '010', '111'],
	2: ['111', '001', '111', '100', '111'],
	3: ['111', '001', '111', '001', '111'],
	4: ['101', '101', '111', '001', '001'],
}

class Canvas {
	constructor(width, height) {
		this.w = Math.max(1, Math.round(width))
		this.h = Math.max(1, Math.round(height))
		this.buf = Buffer.alloc(this.w * this.h * 4)
		this.used = false
	}

	px(x, y, rgb) {
		if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
		const i = (y * this.w + x) * 4
		this.buf[i] = (rgb >> 16) & 0xff
		this.buf[i + 1] = (rgb >> 8) & 0xff
		this.buf[i + 2] = rgb & 0xff
		this.buf[i + 3] = 0xff
		this.used = true
	}

	rect(x, y, w, h, rgb) {
		const x0 = Math.round(x)
		const y0 = Math.round(y)
		for (let yy = y0; yy < y0 + Math.round(h); yy++)
			for (let xx = x0; xx < x0 + Math.round(w); xx++) this.px(xx, yy, rgb)
	}

	/** Filled circle inside the box x,y,w,h */
	circle(x, y, w, h, rgb) {
		const r = Math.min(w, h) / 2
		const cx = x + w / 2
		const cy = y + h / 2
		for (let yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++)
			for (let xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++) {
				const dx = xx + 0.5 - cx
				const dy = yy + 0.5 - cy
				if (dx * dx + dy * dy <= r * r) this.px(xx, yy, rgb)
			}
	}

	/** Border drawn inside the edges */
	border(width, rgb) {
		const b = Math.max(0, Math.round(width))
		if (!b) return
		this.rect(0, 0, this.w, b, rgb)
		this.rect(0, this.h - b, this.w, b, rgb)
		this.rect(0, 0, b, this.h, rgb)
		this.rect(this.w - b, 0, b, this.h, rgb)
	}

	/** Text centred in the box x,y,w,h, as big as fits */
	text(str, x, y, w, h, rgb) {
		const chars = [...String(str)].filter((c) => FONT[c])
		if (!chars.length) return
		const cols = chars.length * 4 - 1
		const scale = Math.max(1, Math.floor(Math.min((w - 2) / cols, (h - 2) / 5)))
		const tw = cols * scale
		const th = 5 * scale
		let ox = Math.round(x + (w - tw) / 2)
		const oy = Math.round(y + (h - th) / 2)
		for (const c of chars) {
			const g = FONT[c]
			for (let r = 0; r < 5; r++)
				for (let col = 0; col < 3; col++)
					if (g[r][col] === '1') this.rect(ox + col * scale, oy + r * scale, scale, scale, rgb)
			ox += 4 * scale
		}
	}

	base64() {
		return this.buf.toString('base64')
	}
}

module.exports = { Canvas, FONT }
