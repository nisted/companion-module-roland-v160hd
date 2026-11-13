import { createRequire as __esbuild_createRequire } from 'module'
import { fileURLToPath as __esbuild_fileURLToPath } from 'url'
import { dirname as __esbuild_dirname } from 'path'
const require = __esbuild_createRequire(import.meta.url)
const __filename = __esbuild_fileURLToPath(import.meta.url)
const __dirname = __esbuild_dirname(__filename)
var Mi = Object.create
var J = Object.defineProperty
var Ni = Object.getOwnPropertyDescriptor
var Bi = Object.getOwnPropertyNames
var Hi = Object.getPrototypeOf,
	Ki = Object.prototype.hasOwnProperty
var c = (e, t, n) => () => {
	if (n) throw n[0]
	try {
		return (e && (t = e((e = 0))), t)
	} catch (o) {
		throw ((n = [o]), o)
	}
}
var f = (e, t) => () => {
		try {
			return (t || e((t = { exports: {} }).exports, t), t.exports)
		} catch (n) {
			throw ((t = 0), n)
		}
	},
	Ui = (e, t) => {
		for (var n in t) J(e, n, { get: t[n], enumerable: !0 })
	},
	Qe = (e, t, n, o) => {
		if ((t && typeof t == 'object') || typeof t == 'function')
			for (let i of Bi(t))
				!Ki.call(e, i) && i !== n && J(e, i, { get: () => t[i], enumerable: !(o = Ni(t, i)) || o.enumerable })
		return e
	}
var vi = (e, t, n) => (
		(n = e != null ? Mi(Hi(e)) : {}),
		Qe(t || !e || !e.__esModule ? J(n, 'default', { value: e, enumerable: !0 }) : n, e)
	),
	F = (e) => Qe(J({}, '__esModule', { value: !0 }), e)
function ee(e, t, n) {
	;(typeof global.COMPANION_LOGGER == 'function' ? global.COMPANION_LOGGER : Fi)(e, t, n)
}
function ge(e) {
	return {
		debug: (t) => ee(e, 'debug', t),
		info: (t) => ee(e, 'info', t),
		warn: (t) => ee(e, 'warn', t),
		error: (t) => ee(e, 'error', t),
	}
}
var Fi,
	ye = c(() => {
		Fi = (e, t, n) => {
			console.log(`[${t.toUpperCase()}]${e ? ` [${e}]` : ''} ${n}`)
		}
	})
var Ze = c(() => {})
function je(e) {
	let t = e
	return !!t && typeof t == 'object' && typeof t.id == 'string' && t._isInstanceContext === !0
}
var Xe = c(() => {})
var at,
	A,
	S,
	W,
	m,
	ke,
	ne,
	Ae,
	ie,
	rt,
	x,
	L,
	Ce,
	V,
	te,
	lt,
	dt,
	Je,
	et,
	tt,
	O,
	Vi,
	Li,
	Wi,
	zi,
	it,
	nt,
	Gi,
	Se,
	Pe,
	ot,
	st,
	b,
	ct = c(() => {
		for (
			at = { grad: 0.9, turn: 360, rad: 360 / (2 * Math.PI) },
				A = function (e) {
					return typeof e == 'string' ? e.length > 0 : typeof e == 'number'
				},
				S = function (e, t, n) {
					return (t === void 0 && (t = 0), n === void 0 && (n = Math.pow(10, t)), Math.round(n * e) / n + 0)
				},
				W = function (e) {
					var t = Math.round(100 * e) / 100
					return Math.round(255 * t) === 255 * e ? t : Math.round(1e3 * e) / 1e3
				},
				m = function (e, t, n) {
					return (t === void 0 && (t = 0), n === void 0 && (n = 1), e > n ? n : e > t ? e : t)
				},
				ke = function (e) {
					return (e = isFinite(e) ? e % 360 : 0) < 0 ? e + 360 : e
				},
				ne = function (e, t) {
					return (t === void 0 && (t = 0), S(e, t) % 360)
				},
				Ae = function (e) {
					return { r: m(e.r, 0, 255), g: m(e.g, 0, 255), b: m(e.b, 0, 255), a: m(e.a) }
				},
				ie = function (e) {
					return { r: S(e.r), g: S(e.g), b: S(e.b), a: W(e.a) }
				},
				rt = /^#([0-9a-f]{3,8})$/i,
				x = function (e, t) {
					var n = e.charCodeAt(t)
					return (15 & n) + 9 * (n >> 6)
				},
				L = function (e, t) {
					return (x(e, t) << 4) | x(e, t + 1)
				},
				Ce = [],
				V = 0;
			V < 256;
			V++
		)
			Ce.push((V < 16 ? '0' : '') + V.toString(16))
		;((te = function (e) {
			return Ce[m(e, 0, 255)]
		}),
			(lt = function (e) {
				var t = e.r,
					n = e.g,
					o = e.b,
					i = e.a,
					s = Math.max(t, n, o),
					a = s - Math.min(t, n, o),
					r = a ? (s === t ? (n - o) / a : s === n ? 2 + (o - t) / a : 4 + (t - n) / a) : 0
				return { h: 60 * (r < 0 ? r + 6 : r), s: s ? (a / s) * 100 : 0, v: (s / 255) * 100, a: i }
			}),
			(dt = function (e) {
				var t = e.h,
					n = e.s,
					o = e.v,
					i = e.a
				;((t = (t / 360) * 6), (n /= 100), (o /= 100))
				var s = Math.floor(t),
					a = o * (1 - n),
					r = o * (1 - (t - s) * n),
					d = o * (1 - (1 - t + s) * n),
					p = s % 6
				return { r: 255 * [o, r, a, a, d, o][p], g: 255 * [d, o, o, r, a, a][p], b: 255 * [a, a, d, o, o, r][p], a: i }
			}),
			(Je = function (e) {
				return { h: ke(e.h), s: m(e.s, 0, 100), l: m(e.l, 0, 100), a: m(e.a) }
			}),
			(et = function (e) {
				return { h: ne(e.h), s: S(e.s), l: S(e.l), a: W(e.a) }
			}),
			(tt = function (e) {
				return dt(
					((n = (t = e).s),
					{
						h: t.h,
						s: (n *= ((o = t.l) < 50 ? o : 100 - o) / 100) > 0 ? ((2 * n) / (o + n)) * 100 : 0,
						v: o + n,
						a: t.a,
					}),
				)
				var t, n, o
			}),
			(O = function (e) {
				return {
					h: (t = lt(e)).h,
					s:
						(i = ((200 - (n = t.s)) * (o = t.v)) / 100) > 0 && i < 200
							? ((n * o) / 100 / (i <= 100 ? i : 200 - i)) * 100
							: 0,
					l: i / 2,
					a: t.a,
				}
				var t, n, o, i
			}),
			(Vi =
				/^hsla?\(\s*([+-]?(?:\d*\.\d+|\d+))(deg|rad|grad|turn)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))%\s*,\s*([+-]?(?:\d*\.\d+|\d+))%\s*(?:,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i),
			(Li =
				/^hsla?\(\s*([+-]?(?:\d*\.\d+|\d+))(deg|rad|grad|turn)?\s+([+-]?(?:\d*\.\d+|\d+))%\s+([+-]?(?:\d*\.\d+|\d+))%\s*(?:\/\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i),
			(Wi =
				/^rgba?\(\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*(?:,\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i),
			(zi =
				/^rgba?\(\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s+([+-]?(?:\d*\.\d+|\d+))(%)?\s+([+-]?(?:\d*\.\d+|\d+))(%)?\s*(?:\/\s*([+-]?(?:\d*\.\d+|\d+))(%)?\s*)?\)$/i),
			(it = {
				string: [
					[
						function (e) {
							if (!rt.test(e)) return null
							var t = e.length
							return t <= 5
								? { r: 17 * x(e, 1), g: 17 * x(e, 2), b: 17 * x(e, 3), a: t === 5 ? (17 * x(e, 4)) / 255 : 1 }
								: t === 7 || t === 9
									? { r: L(e, 1), g: L(e, 3), b: L(e, 5), a: t === 9 ? L(e, 7) / 255 : 1 }
									: null
						},
						'hex',
					],
					[
						function (e) {
							var t = Wi.exec(e) || zi.exec(e)
							return t
								? t[2] !== t[4] || t[4] !== t[6]
									? null
									: Ae({
											r: Number(t[1]) / (t[2] ? 100 / 255 : 1),
											g: Number(t[3]) / (t[4] ? 100 / 255 : 1),
											b: Number(t[5]) / (t[6] ? 100 / 255 : 1),
											a: t[7] === void 0 ? 1 : Number(t[7]) / (t[8] ? 100 : 1),
										})
								: null
						},
						'rgb',
					],
					[
						function (e) {
							var t = Vi.exec(e) || Li.exec(e)
							if (!t) return null
							var n,
								o,
								i = Je({
									h: ((n = t[1]), (o = t[2]), o === void 0 && (o = 'deg'), Number(n) * (at[o] || 1)),
									s: Number(t[3]),
									l: Number(t[4]),
									a: t[5] === void 0 ? 1 : Number(t[5]) / (t[6] ? 100 : 1),
								})
							return tt(i)
						},
						'hsl',
					],
				],
				object: [
					[
						function (e) {
							var t = e.r,
								n = e.g,
								o = e.b,
								i = e.a,
								s = i === void 0 ? 1 : i
							return A(t) && A(n) && A(o) ? Ae({ r: Number(t), g: Number(n), b: Number(o), a: Number(s) }) : null
						},
						'rgb',
					],
					[
						function (e) {
							var t = e.h,
								n = e.s,
								o = e.l,
								i = e.a,
								s = i === void 0 ? 1 : i
							if (!A(t) || !A(n) || !A(o)) return null
							var a = Je({ h: Number(t), s: Number(n), l: Number(o), a: Number(s) })
							return tt(a)
						},
						'hsl',
					],
					[
						function (e) {
							var t = e.h,
								n = e.s,
								o = e.v,
								i = e.a,
								s = i === void 0 ? 1 : i
							if (!A(t) || !A(n) || !A(o)) return null
							var a = (function (r) {
								return { h: ke(r.h), s: m(r.s, 0, 100), v: m(r.v, 0, 100), a: m(r.a) }
							})({ h: Number(t), s: Number(n), v: Number(o), a: Number(s) })
							return dt(a)
						},
						'hsv',
					],
				],
			}),
			(nt = function (e, t) {
				for (var n = 0; n < t.length; n++) {
					var o = t[n][0](e)
					if (o) return [o, t[n][1]]
				}
				return [null, void 0]
			}),
			(Gi = function (e) {
				return typeof e == 'string'
					? nt(e.trim(), it.string)
					: typeof e == 'object' && e !== null
						? nt(e, it.object)
						: [null, void 0]
			}),
			(Se = function (e, t) {
				var n = O(e)
				return { h: n.h, s: m(n.s + 100 * t, 0, 100), l: n.l, a: n.a }
			}),
			(Pe = function (e) {
				return (299 * e.r + 587 * e.g + 114 * e.b) / 1e3 / 255
			}),
			(ot = function (e, t) {
				var n = O(e)
				return { h: n.h, s: n.s, l: m(n.l + 100 * t, 0, 100), a: n.a }
			}),
			(st = (function () {
				function e(t) {
					;((this.parsed = Gi(t)[0]), (this.rgba = this.parsed || { r: 0, g: 0, b: 0, a: 1 }))
				}
				return (
					(e.prototype.isValid = function () {
						return this.parsed !== null
					}),
					(e.prototype.brightness = function () {
						return S(Pe(this.rgba), 2)
					}),
					(e.prototype.isDark = function () {
						return Pe(this.rgba) < 0.5
					}),
					(e.prototype.isLight = function () {
						return Pe(this.rgba) >= 0.5
					}),
					(e.prototype.toHex = function () {
						return (
							(t = ie(this.rgba)),
							(n = t.r),
							(o = t.g),
							(i = t.b),
							(a = (s = t.a) < 1 ? te(S(255 * s)) : ''),
							'#' + te(n) + te(o) + te(i) + a
						)
						var t, n, o, i, s, a
					}),
					(e.prototype.toRgb = function () {
						return ie(this.rgba)
					}),
					(e.prototype.toRgbString = function () {
						return (
							(t = ie(this.rgba)),
							(n = t.r),
							(o = t.g),
							(i = t.b),
							(s = t.a) < 1
								? 'rgba(' + n + ', ' + o + ', ' + i + ', ' + s + ')'
								: 'rgb(' + n + ', ' + o + ', ' + i + ')'
						)
						var t, n, o, i, s
					}),
					(e.prototype.toHsl = function () {
						return et(O(this.rgba))
					}),
					(e.prototype.toHslString = function () {
						return (
							(t = et(O(this.rgba))),
							(n = t.h),
							(o = t.s),
							(i = t.l),
							(s = t.a) < 1
								? 'hsla(' + n + ', ' + o + '%, ' + i + '%, ' + s + ')'
								: 'hsl(' + n + ', ' + o + '%, ' + i + '%)'
						)
						var t, n, o, i, s
					}),
					(e.prototype.toHsv = function () {
						return ((t = lt(this.rgba)), { h: ne(t.h), s: S(t.s), v: S(t.v), a: W(t.a) })
						var t
					}),
					(e.prototype.invert = function () {
						return b({ r: 255 - (t = this.rgba).r, g: 255 - t.g, b: 255 - t.b, a: t.a })
						var t
					}),
					(e.prototype.saturate = function (t) {
						return (t === void 0 && (t = 0.1), b(Se(this.rgba, t)))
					}),
					(e.prototype.desaturate = function (t) {
						return (t === void 0 && (t = 0.1), b(Se(this.rgba, -t)))
					}),
					(e.prototype.grayscale = function () {
						return b(Se(this.rgba, -1))
					}),
					(e.prototype.lighten = function (t) {
						return (t === void 0 && (t = 0.1), b(ot(this.rgba, t)))
					}),
					(e.prototype.darken = function (t) {
						return (t === void 0 && (t = 0.1), b(ot(this.rgba, -t)))
					}),
					(e.prototype.rotate = function (t) {
						return (t === void 0 && (t = 15), this.hue(O(this.rgba).h + t))
					}),
					(e.prototype.alpha = function (t) {
						return typeof t == 'number' ? b({ r: (n = this.rgba).r, g: n.g, b: n.b, a: t }) : W(this.rgba.a)
						var n
					}),
					(e.prototype.hue = function (t) {
						var n = O(this.rgba)
						return typeof t == 'number' ? b({ h: t, s: n.s, l: n.l, a: n.a }) : ne(n.h)
					}),
					(e.prototype.isEqual = function (t) {
						return this.toHex() === b(t).toHex()
					}),
					e
				)
			})()),
			(b = function (e) {
				return e instanceof st ? e : new st(e)
			}))
	})
function qi(e) {
	return e
}
function Yi(e) {}
function Qi(e, t, n, o) {
	let i = ((e & 255) << 16) | ((t & 255) << 8) | (n & 255)
	return (o !== void 0 && o >= 0 && o < 1 && (i += 16777216 * Math.round(255 * (1 - o))), i)
}
function oe(e) {
	if (typeof e == 'number')
		return e > 16777215
			? { r: (e >> 16) & 255, g: (e >> 8) & 255, b: e & 255, a: (255 - ((e >> 24) & 255)) / 255 }
			: { r: (e >> 16) & 255, g: (e >> 8) & 255, b: e & 255, a: 1 }
	if (typeof e == 'string' && b(e).isValid()) {
		let t = b(e).toRgb()
		return { r: t.r, g: t.g, b: t.b, a: t.a }
	} else return { r: 0, g: 0, b: 0, a: 1 }
}
function Zi(e) {
	let t = oe(e)
	return b(`rgba(${t.r}, ${t.g}, ${t.b}, ${t.a})`).toHsl()
}
function ji(e) {
	let t = oe(e)
	return b(`rgba(${t.r}, ${t.g}, ${t.b}, ${t.a})`).toHsv()
}
function Xi(e) {
	let t = oe(e)
	return b(`rgba(${t.r}, ${t.g}, ${t.b}, ${t.a})`).toHex()
}
function Ji(e) {
	return e
		.replaceAll(
			'\\n',
			`
`,
		)
		.replaceAll('\\r', '\r')
		.replaceAll('\\t', '	')
		.replaceAll('\\f', '\f')
		.replaceAll('\\v', '\v')
		.replaceAll('\\b', '\b')
		.replaceAll('\\\\', '\\')
		.replaceAll('\\x00', '\0')
		.replaceAll('\\x01', '')
		.replaceAll('\\x02', '')
		.replaceAll('\\x03', '')
}
function en(e) {
	return e
		.replaceAll(
			`
`,
			'\\n',
		)
		.replaceAll('\r', '\\r')
		.replaceAll('	', '\\t')
		.replaceAll('\f', '\\f')
		.replaceAll('\v', '\\v')
		.replaceAll('\b', '\\b')
		.replaceAll('\\', '\\\\')
		.replaceAll('\0', '\\x00')
		.replaceAll('', '\\x01')
		.replaceAll('', '\\x02')
		.replaceAll('', '\\x03')
}
var ut = c(() => {
	ct()
})
import { EventEmitter as tn } from 'events'
var se,
	pt = c(() => {
		se = class extends tn {
			#t
			#i
			get handleId() {
				return this.boundState?.handleId
			}
			get portNumber() {
				return this.boundState?.portNumber
			}
			get boundState() {
				if (this.#e && typeof this.#e == 'object') return this.#e
			}
			#e = 'pending'
			constructor(t, n) {
				;(super(), (this.#t = t), (this.#i = { ...n }))
			}
			bind(t, n, o) {
				if (this.#e && typeof this.#e == 'object') throw new Error('Socket is already bound')
				switch (this.#e) {
					case 'fatalError':
						throw new Error('Socket has encountered fatal error')
					case 'binding':
						throw new Error('Socket is already bound')
					case 'closed':
						throw new Error('Socket is closing')
					case 'pending':
						break
					default:
						throw (this.#e, new Error('Invalid socket state'))
				}
				;((this.#e = 'binding'),
					o && this.on('listening', o),
					this.#t
						.sharedUdpSocketJoin({ family: this.#i.type, portNumber: t })
						.then(
							(i) => {
								;((this.#e = { portNumber: t, handleId: i }),
									this.#t.sharedUdpSocketHandlers.set(i, this),
									this.emit('listening'))
							},
							(i) => {
								;((this.#e = 'closed'), this.emit('error', i instanceof Error ? i : new Error(i)))
							},
						)
						.catch(() => null))
			}
			close(t) {
				if (!(this.#e && typeof this.#e == 'object'))
					switch (this.#e) {
						case 'fatalError':
							throw new Error('Socket has encountered fatal error')
						case 'pending':
						case 'closed':
						case 'binding':
							throw new Error('Socket is not open')
						default:
							throw (this.#e, new Error('Invalid socket state'))
					}
				let n = this.#e.handleId
				;((this.#e = 'closed'),
					t && this.on('close', t),
					this.#t
						.sharedUdpSocketLeave({ handleId: n })
						.then(
							() => {
								;(this.#t.sharedUdpSocketHandlers.delete(n), this.emit('close'))
							},
							(o) => {
								;(this.#t.sharedUdpSocketHandlers.delete(n), this.emit('error', o instanceof Error ? o : new Error(o)))
							},
						)
						.catch(() => null))
			}
			send(t, n, o, i, s, a) {
				if (typeof n != 'number') throw new Error('Invalid arguments')
				if (typeof o == 'number') {
					if (typeof i != 'number' || typeof s != 'string') throw new Error('Invalid arguments')
					if (a !== void 0 && typeof a != 'function') throw new Error('Invalid arguments')
					let r = this.#n(t, n, o)
					this.#o(r, i, s, a)
				} else if (typeof o == 'string') {
					if (i !== void 0 && typeof i != 'function') throw new Error('Invalid arguments')
					let r = this.#n(t, 0, void 0)
					this.#o(r, n, o, i)
				} else throw new Error('Invalid arguments')
			}
			#n(t, n, o) {
				let i
				if (typeof t == 'string') i = Buffer.from(t, 'utf-8')
				else if (Buffer.isBuffer(t)) i = t
				else {
					if (Array.isArray(t)) return Buffer.from(t)
					i = Buffer.from(t.buffer, t.byteOffset, t.byteLength)
				}
				return i.subarray(n, o !== void 0 ? o + n : void 0)
			}
			#o(t, n, o, i) {
				if (!this.#e || typeof this.#e != 'object') throw new Error('Socket is not open')
				this.#t
					.sharedUdpSocketSend({ handleId: this.#e.handleId, message: t, address: o, port: n })
					.then(
						() => {
							i?.()
						},
						(s) => {
							this.emit('error', s instanceof Error ? s : new Error(s))
						},
					)
					.catch(() => null)
			}
			receiveSocketMessage(t) {
				try {
					this.emit('message', t.message, t.source)
				} catch {}
			}
			receiveSocketError(t) {
				this.#e = 'fatalError'
				let n = this.boundState
				n && this.#t.sharedUdpSocketHandlers.delete(n.handleId)
				try {
					this.emit('error', t)
				} catch {}
			}
		}
	})
var _e,
	ft = c(() => {
		Xe()
		ye()
		pt()
		_e = class {
			#t
			#i
			#e
			get id() {
				return this.#t.id
			}
			get instanceOptions() {
				return this.#e
			}
			get label() {
				return this.#t.label
			}
			constructor(t) {
				if (!je(t) || !t._isInstanceContext)
					throw new Error(
						"Module instance is being constructed incorrectly. Make sure you aren't trying to do this manually",
					)
				;((this.#t = t),
					(this.#i = ge()),
					(this.createSharedUdpSocket = this.createSharedUdpSocket.bind(this)),
					(this.#e = { disableVariableValidation: !1, disableNewConfigLayout: !1 }),
					this.log('debug', 'Initializing'))
			}
			saveConfig(t, n) {
				this.#t.saveConfig(t, n)
			}
			setActionDefinitions(t) {
				this.#t.setActionDefinitions(t)
			}
			setFeedbackDefinitions(t) {
				this.#t.setFeedbackDefinitions(t)
			}
			setPresetDefinitions(t, n) {
				this.#t.setPresetDefinitions(t, n)
			}
			setCompositeElementDefinitions(t) {
				this.#t.setCompositeElementDefinitions(t)
			}
			setVariableDefinitions(t) {
				if (Array.isArray(t)) throw new Error('Variable definitions should be an object, not an array')
				this.#t.setVariableDefinitions(t)
			}
			setVariableValues(t) {
				this.#t.setVariableValues(t)
			}
			getVariableValue(t) {
				return this.#t.getVariableValue(t)
			}
			checkAllFeedbacks() {
				this.#t.checkAllFeedbacks()
			}
			checkFeedbacks(t, ...n) {
				this.#t.checkFeedbacks([t, ...n])
			}
			checkFeedbacksById(...t) {
				this.#t.checkFeedbacksById(t)
			}
			subscribeActions(...t) {
				this.#t.subscribeActions(t)
			}
			unsubscribeActions(...t) {
				this.#t.unsubscribeActions(t)
			}
			unsubscribeFeedbacks(...t) {
				this.#t.unsubscribeFeedbacks(t)
			}
			recordAction(t, n) {
				this.#t.recordAction(t, n)
			}
			oscSend(t, n, o, i) {
				this.#t.oscSend(t, n, o, i)
			}
			updateStatus(t, n) {
				this.#t.updateStatus(t, n ?? null)
			}
			log(t, n) {
				switch (t) {
					case 'debug':
						this.#i.debug(n)
						break
					case 'info':
						this.#i.info(n)
						break
					case 'warn':
						this.#i.warn(n)
						break
					case 'error':
						this.#i.error(n)
						break
					default:
						this.#i.info(n)
						break
				}
			}
			createSharedUdpSocket(t, n) {
				let o = typeof t == 'string' ? { type: t } : t,
					i = new se(this.#t, o)
				return (n && i.on('message', n), i)
			}
		}
	})
var bt = c(() => {})
var mt = c(() => {})
var g,
	we,
	ae = c(() => {
		;(function (e) {
			;((e.Ok = 'ok'),
				(e.Connecting = 'connecting'),
				(e.Disconnected = 'disconnected'),
				(e.ConnectionFailure = 'connection_failure'),
				(e.BadConfig = 'bad_config'),
				(e.UnknownError = 'unknown_error'),
				(e.UnknownWarning = 'unknown_warning'),
				(e.AuthenticationFailure = 'authentication_failure'),
				(e.InsufficientPermissions = 'insufficient_permissions'))
		})(g || (g = {}))
		;(function (e) {
			;((e.IP = '/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/'),
				(e.HOSTNAME =
					'/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/'),
				(e.BOOLEAN = '/^(true|false|0|1)$/i'),
				(e.PORT =
					'/^([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-4])$/'),
				(e.MAC_ADDRESS = '/^(?:[a-fA-F0-9]{2}:){5}([a-fA-F0-9]{2})$/'),
				(e.PERCENT = '/^(100|[0-9]|[0-9][0-9])$/'),
				(e.FLOAT = '/^([0-9]*\\.)?[0-9]+$/'),
				(e.SIGNED_FLOAT = '/^[+-]?([0-9]*\\.)?[0-9]+$/'),
				(e.FLOAT_OR_INT = '/^([0-9]+)(\\.[0-9]+)?$/'),
				(e.NUMBER = '/^\\d+$/'),
				(e.SIGNED_NUMBER = '/^[+-]?\\d+$/'),
				(e.SOMETHING = '/^.+$/'),
				(e.TIMECODE =
					'/^(0*[0-9]|1[0-9]|2[0-4]):(0*[0-9]|[1-5][0-9]|60):(0*[0-9]|[1-5][0-9]|60):(0*[0-9]|[12][0-9]|30)$/'))
		})(we || (we = {}))
	})
var ht = c(() => {})
var gt = c(() => {})
var xe,
	Te,
	yt = c(() => {
		;(function (e) {
			;((e.FollowDefault = 'default'), (e.TopBar = 'topbar'), (e.Border = 'border'), (e.None = 'none'))
		})(xe || (xe = {}))
		;(function (e) {
			;((e.FollowDefault = 'default'), (e.ShowAll = 'all'), (e.None = 'none'))
		})(Te || (Te = {}))
	})
var St = c(() => {})
var Pt = c(() => {})
var At = c(() => {})
var Ct = c(() => {})
var nn,
	kt = c(() => {
		nn = {
			'internal:wait': '2.1.0-0',
			'internal:customLog': '2.1.0-0',
			'internal:abortButton': '2.1.0-0',
			'internal:localVariableSet': '2.1.0-0',
			'internal:checkExpression': '2.1.0-0',
			'internal:buttonPushed': '2.1.0-0',
			'internal:buttonCurrentStep': '2.1.0-0',
			'internal:actionGroup': '2.1.0-0',
			'internal:logicIf': '2.1.0-0',
			'internal:logicWhile': '2.1.0-0',
			'internal:logicOperator': '2.1.0-0',
		}
	})
var _t = c(() => {})
var wt = c(() => {
	At()
	Ct()
	kt()
	_t()
})
var xt = c(() => {})
function sn(e) {
	return (t, n) => {
		let o = []
		for (let i of n.feedbacks) {
			let s = e[i.feedbackId]
			if (
				(s === !0 &&
					(s = { bg: 'bgcolor', bgcolor: 'bgcolor', fg: 'color', color: 'color', png64: 'png64', png: 'png64' }),
				s)
			) {
				i.style || (i.style = {})
				for (let [a, r] of Object.entries(s)) {
					let d = i.options[a]
					d !== void 0 && ((i.style[r] = d), delete i.options[a], o.push(i))
				}
			}
		}
		return { updatedConfig: null, updatedSecrets: null, updatedActions: [], updatedFeedbacks: o }
	}
}
function an(e) {
	return (t, n) => {
		let o = []
		for (let i of n.feedbacks) {
			let s = e[i.feedbackId]
			if (typeof s != 'string') continue
			let a = i.options[s]
			a !== void 0 &&
				(delete i.options[s],
				a.isExpression
					? (i.isInverted = a)
					: (i.isInverted = { isExpression: !1, value: a.value === 'true' || !!a.value || Number(a.value) > 0 }),
				o.push(i))
		}
		return { updatedConfig: null, updatedSecrets: null, updatedActions: [], updatedFeedbacks: o }
	}
}
function rn(e) {
	return (t, n) => {
		let o = []
		for (let i of n.actions) {
			let s = e[i.actionId]
			if (typeof s != 'string') continue
			let a = i.options[s]
			a !== void 0 &&
				(delete i.options[s],
				(i.storeResult = {
					type: 'custom-variable',
					variableName: a.isExpression
						? { isExpression: !0, value: a.value }
						: { isExpression: !1, value: String(a.value ?? '') },
				}),
				o.push(i))
		}
		return { updatedConfig: null, updatedSecrets: null, updatedActions: o, updatedFeedbacks: [] }
	}
}
function ln(e) {
	if (!e || e.isExpression) return e
	let t = Number(e.value),
		n = e.value
	if (typeof e.value == 'number' || (typeof e.value == 'string' && e.value.trim() !== '' && !isNaN(t)))
		return { isExpression: !1, value: t }
	if (typeof n == 'string') {
		let o = n.trim()
		return o.startsWith('$(') && o.endsWith(')') && !o.slice(2).includes('$(')
			? { isExpression: !0, value: n }
			: { isExpression: !0, value: `parseVariables("${n.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")` }
	} else return e
}
function dn(e) {
	if (!e || e.isExpression) return e
	let t = e.value
	if (typeof t == 'boolean') return e
	if (typeof t == 'number') return { isExpression: !1, value: t !== 0 }
	if (typeof t == 'string') {
		let n = t.trim(),
			o = n.toLowerCase()
		return o === 'true' || o === 'false'
			? { isExpression: !1, value: o === 'true' }
			: !isNaN(Number(n)) && n !== ''
				? { isExpression: !1, value: Number(n) !== 0 }
				: n.startsWith('$(') && n.endsWith(')') && !n.slice(2).includes('$(')
					? { isExpression: !0, value: t }
					: { isExpression: !0, value: `bool(parseVariables("${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"))` }
	} else return e
}
var on,
	Tt = c(() => {
		on = () => ({ updatedConfig: null, updatedSecrets: null, updatedActions: [], updatedFeedbacks: [] })
	})
var Et = c(() => {})
var It = c(() => {
	Ze()
	ft()
	bt()
	mt()
	ae()
	ht()
	gt()
	yt()
	St()
	Pt()
	wt()
	xt()
	Tt()
	Et()
})
var Dt = c(() => {})
var Ot = c(() => {})
import { EventEmitter as cn } from 'events'
import un from 'net'
var z,
	Ee = c(() => {
		ae()
		z = class extends cn {
			#t
			#i
			_socket
			#e
			#n = !1
			#o = !1
			#s = !1
			#r
			#a
			#d
			get isConnected() {
				return this.#n
			}
			get isConnecting() {
				return this.#o
			}
			get isDestroyed() {
				return this.#s
			}
			constructor(t, n, o) {
				;(super(),
					(this.#t = t),
					(this.#i = n),
					(this.#e = { reconnect_interval: 2e3, reconnect: !0, ...o }),
					(this._socket = new un.Socket()),
					this._socket.setKeepAlive(!0),
					this._socket.setNoDelay(!0),
					this._socket.on('error', (i) => {
						;((this.#o = !1),
							(this.#n = !1),
							this.#e.reconnect && this.#c(),
							this.#l(g.UnknownError, i.message),
							this.emit('error', i))
					}),
					this._socket.on('ready', () => {
						;((this.#n = !0), (this.#o = !1), this.#l(g.Ok), this.emit('connect'))
					}),
					this._socket.on('end', () => {
						;((this.#n = !1), this.#l(g.Disconnected), !this.#o && this.#e.reconnect && this.#c(), this.emit('end'))
					}),
					this._socket.on('data', (i) => this.emit('data', i)),
					this._socket.on('drain', () => this.emit('drain')),
					this._socket.on('close', () => {
						this.#s || (this.#a === void 0 && this.#e.reconnect && ((this.#o = !1), this.#c()))
					}),
					setImmediate(() => {
						this.#s || this.connect()
					}),
					(this.#d = setTimeout(() => {
						;((this.#d = void 0),
							!this.#s &&
								!this.listenerCount('error') &&
								console.error(`Danger: TCP client for ${this.#t}:${this.#i} is missing an error handler!`))
					}, 5e3)))
			}
			connect() {
				if (this.#s) throw new Error('Cannot connect destroyed socket')
				return this.#o ? !1 : ((this.#o = !0), this._socket.connect(this.#i, this.#t), !0)
			}
			send(t) {
				if (this.#s || this._socket.destroyed) throw new Error('Cannot write to destroyed socket')
				if (!t || !t.length) throw new Error('No message to send')
				return this.#n
					? (this._socket.write(t, (n) => {
							n && ((this.#n = !1), this.#l(g.UnknownError, n.message), this.emit('error', n))
						}),
						!0)
					: !1
			}
			async sendAsync(t) {
				if (this.#s || this._socket.destroyed) throw new Error('Cannot write to destroyed socket')
				if (!t || !t.length) throw new Error('No message to send')
				return this.#n
					? (await new Promise((n, o) => {
							this._socket.write(t, (i) => {
								if (i) {
									;((this.#n = !1), this.#l(g.UnknownError, i.message), o(i))
									return
								}
								n()
							})
						}),
						!0)
					: !1
			}
			destroy() {
				;((this.#n = !1),
					(this.#o = !1),
					(this.#s = !0),
					this.#a !== void 0 && (clearTimeout(this.#a), (this.#a = void 0)),
					this.#d !== void 0 && (clearTimeout(this.#d), (this.#d = void 0)),
					this._socket.removeAllListeners(),
					this.removeAllListeners(),
					this._socket.destroy())
			}
			#c() {
				;(this.#a !== void 0 && clearTimeout(this.#a),
					(this.#a = setTimeout(() => {
						;((this.#a = void 0), this.#l(g.Connecting), this.connect())
					}, this.#e.reconnect_interval)))
			}
			#l(t, n) {
				this.#r != t && ((this.#r = t), this.emit('status_change', t, n))
			}
		}
	})
import { EventEmitter as pn } from 'events'
import { Transform as fn } from 'stream'
var G,
	bn,
	$t,
	Ie,
	Rt,
	Mt,
	De,
	Oe,
	$e,
	Re,
	Nt = c(() => {
		Ee()
		;((G = 0),
			(bn = 240),
			($t = 250),
			(Ie = 251),
			(Rt = 252),
			(Mt = 253),
			(De = 254),
			(Oe = 255),
			($e = class extends pn {
				#t
				#i
				#e
				get isConnected() {
					return this.#t.isConnected
				}
				get isConnecting() {
					return this.#t.isConnecting
				}
				get isDestroyed() {
					return this.#t.isDestroyed
				}
				constructor(t, n, o) {
					;(super(),
						(this.#t = new z(t, n, o)),
						(this.#i = new Re()),
						this.#t._socket.pipe(this.#i),
						this.#t.on('connect', () => this.emit('connect')),
						this.#t.on('end', () => this.emit('end')),
						this.#t.on('error', (i) => this.emit('error', i)),
						this.#t.on('status_change', (i, s) => this.emit('status_change', i, s)),
						this.#i.on('iac', (i, s) => this.emit('iac', i, s)),
						this.#i.on('sb', (i) => this.emit('sb', i)),
						this.#i.on('data', (i) => this.emit('data', i)),
						this.#i.on('drain', () => this.emit('drain')),
						(this.#e = setTimeout(() => {
							;((this.#e = void 0),
								!this.isDestroyed &&
									!this.listenerCount('error') &&
									console.error(`Danger: Telnet client for ${t}:${n} is missing an error handler!`))
						}, 5e3)))
				}
				connect() {
					return this.#t.connect()
				}
				send(t) {
					return this.#t.send(t)
				}
				async sendAsync(t) {
					return this.#t.sendAsync(t)
				}
				destroy() {
					;(this.#t.destroy(),
						this.#e !== void 0 && (clearTimeout(this.#e), (this.#e = void 0)),
						this.#i.removeAllListeners(),
						this.removeAllListeners(),
						this.#i.destroy())
				}
			}),
			(Re = class extends fn {
				#t
				#i
				#e
				constructor(t) {
					;(super(t), (this.#t = Buffer.alloc(0)), (this.#i = Buffer.alloc(0)), (this.#e = G))
				}
				_transform(t, n, o) {
					for (let s = 0; s < t.length; ++s) this.#n(t[s])
					let i = this.#o()
					;(i.length && this.push(i), o())
				}
				#n(t) {
					if (this.#e === G) {
						if (t === Oe) {
							this.#e = Oe
							return
						}
						this.#t = Buffer.concat([this.#t, Buffer.from([t])])
					} else if (this.#e === Oe)
						switch (t) {
							case $t:
							case Ie:
							case Rt:
							case Mt:
							case De:
								this.#e = t
								break
							default:
								this.#e = G
								break
						}
					else if (this.#e >= Ie && this.#e <= De) {
						let n
						switch (this.#e) {
							case Ie:
								n = 'WILL'
								break
							case Rt:
								n = 'WONT'
								break
							case Mt:
								n = 'DO'
								break
							case De:
								n = 'DONT'
								break
							default:
								return
						}
						;(this.emit('iac', n, t), (this.#e = G))
						return
					} else if (this.#e === $t) {
						if (t === bn) {
							;(this.emit('sb', this.#i), (this.#e = G), (this.#i = Buffer.alloc(0)))
							return
						}
						this.#i = Buffer.concat([this.#i, Buffer.from([t])])
					}
				}
				#o() {
					let t = this.#t
					return ((this.#t = Buffer.alloc(0)), t)
				}
			}))
	})
import mn from 'dgram'
import { EventEmitter as hn } from 'events'
var Me,
	Bt = c(() => {
		ae()
		Me = class extends hn {
			#t
			#i
			#e
			#n
			#o = !1
			#s
			#r
			get isDestroyed() {
				return this.#o
			}
			constructor(t, n, o) {
				;(super(), (this.#t = t), (this.#i = n), (this.#n = { ...o }), (this.#e = mn.createSocket('udp4')))
				try {
					this.#e.bind(this.#n.bind_port || 0, this.#n.bind_ip)
				} catch (i) {
					throw new Error(`Unable to bind to ip/port: ${this.#n.bind_ip || '0.0.0.0'}:${this.#n.bind_port || 0}`, {
						cause: i,
					})
				}
				;(this.#n.ttl !== void 0 && this.#e.setTTL(this.#n.ttl),
					this.#n.multicast_ttl !== void 0 && this.#e.setMulticastTTL(this.#n.multicast_ttl),
					this.#e.on('error', (i) => {
						;(this.#a(g.UnknownError, i.message), this.emit('error', i))
					}),
					this.#e.on('listening', () => {
						;(this.#n.broadcast && this.#e.setBroadcast(!0),
							this.#n.multicast_interface && this.#e.setMulticastInterface(this.#n.multicast_interface),
							this.#a(g.Ok),
							this.emit('listening'))
					}),
					this.#e.on('message', (i, s) => this.emit('data', i, s)),
					(this.#r = setTimeout(() => {
						!this.#o &&
							!this.listenerCount('error') &&
							console.error(`Danger: UDP socket for ${this.#t}:${this.#i} is missing an error handler!`)
					}, 5e3)))
			}
			send(t) {
				if (this.#o) throw new Error('Cannot write to destroyed socket')
				if (!t || !t.length) throw new Error('No message to send')
				this.#e.send(t, this.#i, this.#t, (n) => {
					n && this.emit('error', n)
				})
			}
			async sendAsync(t) {
				if (this.#o) throw new Error('Cannot write to destroyed socket')
				if (!t || !t.length) throw new Error('No message to send')
				return new Promise((n, o) => {
					this.#e.send(t, this.#i, this.#t, (i) => {
						if (i) {
							o(i)
							return
						}
						n()
					})
				})
			}
			destroy() {
				;((this.#o = !0),
					this.#r !== void 0 && (clearTimeout(this.#r), (this.#r = void 0)),
					this.#e.removeAllListeners(),
					this.#e.close(),
					this.removeAllListeners())
			}
			#a(t, n) {
				this.#s != t && ((this.#s = t), this.emit('status_change', t, n))
			}
		}
	})
var Ht = c(() => {
	Ee()
	Nt()
	Bt()
})
var $ = {}
Ui($, {
	ButtonGraphicsDecorationType: () => xe,
	ButtonGraphicsShowStatusIcons: () => Te,
	CreateConvertToBooleanFeedbackUpgradeScript: () => sn,
	CreateUseActionResultStoreUpgradeScript: () => rn,
	CreateUseBuiltinInvertForFeedbacksUpgradeScript: () => an,
	EmptyUpgradeScript: () => on,
	FixupBooleanOrVariablesValueToExpressions: () => dn,
	FixupNumericOrVariablesValueToExpressions: () => ln,
	INTERNAL_PRESET_MIN_API_VERSION: () => nn,
	InstanceBase: () => _e,
	InstanceStatus: () => g,
	Regex: () => we,
	TCPHelper: () => z,
	TelnetHelper: () => $e,
	UDPHelper: () => Me,
	assertNever: () => Yi,
	combineRgb: () => Qi,
	createModuleLogger: () => ge,
	literal: () => qi,
	parseEscapeCharacters: () => Ji,
	splitHex: () => Xi,
	splitHsl: () => Zi,
	splitHsv: () => ji,
	splitRgb: () => oe,
	substituteEscapeCharacters: () => en,
})
var R = c(() => {
	ye()
	It()
	Dt()
	Ot()
	ut()
	Ht()
})
var _ = f((cs, Ft) => {
	'use strict'
	var k = []
	for (let e = 1; e <= 20; e++) k.push({ id: `INPUT${e}`, label: `Input ${e}`, hex: M(31 + e) })
	for (let e = 1; e <= 8; e++) k.push({ id: `HDMI${e}`, label: `HDMI ${e}`, hex: M(e - 1) })
	for (let e = 1; e <= 8; e++) k.push({ id: `SDI${e}`, label: `SDI ${e}`, hex: M(7 + e) })
	for (let e = 1; e <= 16; e++) k.push({ id: `STILL${e}`, label: `Still ${e}`, hex: M(15 + e) })
	var Kt = k.filter((e) => !e.id.startsWith('INPUT')),
		le = []
	for (let e = 1; e <= 20; e++)
		le.push({ id: `INPUT${e}`, label: `Input ${e}`, address: '0000' + M(e <= 10 ? e - 1 : 36 + (e - 11)) })
	var re = new Map(k.map((e) => [e.id, e])),
		Ut = new Map(k.map((e) => [e.hex, e]))
	function M(e) {
		return e.toString(16).padStart(2, '0').toUpperCase()
	}
	function vt(e) {
		if (e == null) return
		let t = String(e).trim()
		if (t === '') return
		let n = t.toUpperCase().replace(/\s+/g, '')
		if (re.has(n)) return re.get(n)
		if (/^\d+$/.test(n)) {
			let o = Number(n)
			return o >= 1 && o <= 20 ? re.get(`INPUT${o}`) : void 0
		}
		if (/^[0-9A-F]{2}$/.test(n)) return Ut.get(n)
	}
	function gn(e) {
		if (e != null) return Ut.get(String(e).trim().toUpperCase().padStart(2, '0'))
	}
	function yn(e) {
		if (e != null) return re.get(String(e).trim().toUpperCase())
	}
	function Sn(e) {
		let t = vt(e)
		if (!(!t || !t.id.startsWith('INPUT'))) return le.find((n) => n.id === t.id)
	}
	Ft.exports = {
		SOURCES: k,
		PHYSICAL_SOURCES: Kt,
		INPUT_SLOTS: le,
		hexOf: M,
		resolveSource: vt,
		resolveSlot: Sn,
		sourceFromHex: gn,
		sourceFromToken: yn,
		sourceChoices: () => k.map((e) => ({ id: e.id, label: e.label })),
		physicalChoices: (e) =>
			(e ? [{ id: 'N/A', label: 'Nothing (N/A)' }] : []).concat(Kt.map((t) => ({ id: t.id, label: t.label }))),
		slotChoices: () => le.map((e) => ({ id: e.id, label: e.label })),
	}
})
var zt = f((us, Y) => {
	'use strict'
	var Vt = _()
	function Ne(e) {
		return e && typeof e == 'object' && !Array.isArray(e) && 'isExpression' in e && 'value' in e
	}
	function de(e, t) {
		let n = e[t]
		return Ne(n) ? (n.isExpression ? void 0 : n.value) : n
	}
	function ce(e, t, n) {
		let o = e[t]
		Ne(o)
			? (e[t] = { ...o, value: n })
			: o === void 0 && Object.values(e).some(Ne)
				? (e[t] = { value: n, isExpression: !1 })
				: (e[t] = n)
	}
	function N(e, t, n) {
		t in e && ((e[n] = e[t]), delete e[t])
	}
	var T = (e) => Vt.sourceFromHex(String(e ?? ''))?.id,
		q = (e) => (Number.isInteger(Number(e)) ? T(Vt.hexOf(Number(e))) : void 0)
	function h(e, t, n) {
		let o = de(e, t)
		if (o === void 0) return !1
		let i = n(o)
		return i === void 0 || i === o ? !1 : (ce(e, t, i), !0)
	}
	var Pn = { '000011': '1', '00002E': '2', '00002F': '3' },
		An = { '1B': '1', '1C': '2', '1D': '3', '1E': '4' },
		Cn = { 27: '1', 28: '2', 29: '3', 30: '4' },
		kn = { 31: '1', 32: '2' }
	function Lt(e, t) {
		let n = [],
			o = []
		for (let i of t.actions) {
			let s = i.options,
				a = !1
			switch (i.actionId) {
				case 'select_pgm':
				case 'select_pvw':
					;(N(s, 'input', 'source'), (a = h(s, 'source', T) || 'source' in s))
					break
				case 'aux_assign':
					;((a = h(s, 'aux', (r) => Pn[String(r).toUpperCase()])),
						N(s, 'assign', 'source'),
						(a = h(s, 'source', T) || a || 'source' in s))
					break
				case 'pnpkey_setsource':
					;((a = h(s, 'pinp', (r) => An[String(r).toUpperCase()])), (a = h(s, 'source', T) || a))
					break
				case 'set_pinp_source':
					;((i.actionId = 'pnpkey_setsource'),
						h(s, 'pinp', (r) => Cn[Number(r)]),
						N(s, 'assign', 'source'),
						h(s, 'source', q),
						(a = !0))
					break
				case 'set_dsk_key_source':
				case 'set_dsk_fill_source':
					;(h(s, 'dsk', (r) => kn[Number(r)]), N(s, 'assign', 'source'), h(s, 'source', q), (a = !0))
					break
				case 'input_assign':
					;(N(s, 'input', 'slot'),
						h(s, 'slot', (r) => (Number.isInteger(Number(r)) ? `INPUT${Number(r) + 1}` : void 0)),
						N(s, 'assign', 'source'),
						h(s, 'source', q),
						(a = !0))
					break
			}
			a && n.push(i)
		}
		for (let i of t.feedbacks) {
			let s = i.options,
				a = !1
			switch (i.feedbackId) {
				case 'tally':
					a = h(s, 'input', (r) => {
						let d = Number(r)
						if (Number.isInteger(d)) return d >= 32 && d <= 51 ? `INPUT${d - 31}` : q(d)
					})
					break
				case 'auxTally':
					a = h(s, 'assign', T)
					break
				case 'pnpKeySource':
					a = h(s, 'source', T)
					break
			}
			a && o.push(i)
		}
		return { updatedConfig: null, updatedActions: n, updatedFeedbacks: o }
	}
	function Wt(e, t) {
		let n = t.config
		if (!n) return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
		let o = { ...n }
		;((o.port === void 0 || o.port === '') && (o.port = '8023'),
			o.protocol === void 0 && (o.protocol = 'auto'),
			o.pollingrate !== void 0 && (o.pollingrate = String(o.pollingrate)))
		for (let [i, s] of [
			['timeout', '500'],
			['gap', '20'],
			['retries', '1'],
			['silence', '5'],
		])
			o[i] === void 0 && (o[i] = s)
		return { updatedConfig: o, updatedActions: [], updatedFeedbacks: [] }
	}
	Y.exports = [
		function () {
			return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
		},
		function (e, t) {
			let n = []
			for (let o of t.feedbacks) {
				let i = !1
				;(['auxTally', 'auxMute', 'auxLink'].includes(o.feedbackId) && de(o.options, 'aux') === '11'
					? (ce(o.options, 'aux', 'aux1'), (i = !0))
					: o.feedbackId === 'pnpKeySource' &&
						de(o.options, 'pinp') === '1B' &&
						(ce(o.options, 'pinp', 'pnpkey1'), (i = !0)),
					i && n.push(o))
			}
			return { updatedConfig: null, updatedActions: [], updatedFeedbacks: n }
		},
		Lt,
		Wt,
	]
	Y.exports.upgradeToRebelRouting = Lt
	Y.exports.upgradeRebelConfig = Wt
	Y.exports._test = { get: de, set: ce, tokenFromHex: T, tokenFromNum: q }
})
var He = f((ps, qt) => {
	'use strict'
	var _n = `V-160HD Rebel is part of a little crew of Companion modules: some brand new, some old favourites given a good tweak. Want to know who else is in the crew, or grab the freshest version of each one? It's all here: <a href="https://github.com/nisted/companion-modules" target="_blank">github.com/nisted/companion-modules</a>`,
		wn =
			"Ticked: this setting belongs to the 'Connection: set settings' action (a button, or a trigger on a variable). The box above locks and shows what the action set. Untick to get back what you had typed before.",
		y = {
			host: { label: 'Switcher IP address', kind: 'ip' },
			port: { label: 'Port', kind: 'int', min: 1, max: 65535 },
			password: { label: 'LAN control password', kind: 'text' },
			protocol: { label: 'Command set', kind: 'choice', choices: ['auto', 'named', 'lowlevel'] },
			polling: { label: 'Polling', kind: 'bool' },
			pollingrate: { label: 'Polling every (ms)', kind: 'int', min: 100, max: 3e4 },
			timeout: { label: 'Answer timeout (ms)', kind: 'int', min: 50, max: 5e3 },
			gap: { label: 'Gap between commands (ms)', kind: 'int', min: 0, max: 1e3 },
			retries: { label: 'Resends if unanswered', kind: 'int', min: 0, max: 5 },
			silence: { label: 'Pause polling after (missed answers)', kind: 'int', min: 1, max: 100 },
			verbose: { label: 'Chatty log', kind: 'bool' },
		},
		Be = [
			{ id: 'auto', label: 'Auto (ask the switcher, 3.40+ = named)' },
			{ id: 'named', label: 'Named commands (firmware 3.40+)' },
			{ id: 'lowlevel', label: 'Low-level address commands (any firmware)' },
		]
	function xn(e, t) {
		let n = y[e],
			o = String(t ?? '').trim()
		if (!n) return { ok: !1, why: 'not a setting I know' }
		switch (n.kind) {
			case 'int': {
				if (!/^-?\d+(\.\d+)?$/.test(o))
					return { ok: !1, why: `needs a number from ${n.min} to ${n.max}, and "${o}" isn't one` }
				let i = Number(o)
				return Number.isInteger(i)
					? i < n.min || i > n.max
						? { ok: !1, why: `needs ${n.min} to ${n.max}, and ${i} is outside that` }
						: { ok: !0, value: String(i) }
					: { ok: !1, why: `needs a whole number, and ${o} isn't whole` }
			}
			case 'ip': {
				let i = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(o)
				return !i || i.slice(1).some((s) => Number(s) > 255)
					? { ok: !1, why: `needs an IP address like 192.168.0.1, and "${o}" isn't one` }
					: { ok: !0, value: o }
			}
			case 'choice': {
				let i = o.toLowerCase().replace(/[\s-]/g, '')
				return n.choices.includes(i)
					? { ok: !0, value: i }
					: { ok: !1, why: `needs one of ${n.choices.join(', ')}, and "${o}" isn't` }
			}
			case 'bool': {
				let i = o.toLowerCase()
				return ['true', 'on', '1', 'yes'].includes(i)
					? { ok: !0, value: !0 }
					: ['false', 'off', '0', 'no'].includes(i)
						? { ok: !0, value: !1 }
						: { ok: !1, why: `needs on or off, and "${o}" isn't either` }
			}
			default:
				return { ok: !0, value: o }
		}
	}
	function Gt(e, t) {
		let n = e ? e[t] : void 0
		return t === 'password'
			? String(n ?? '')
				? '\u2022\u2022\u2022\u2022 (hidden)'
				: 'blank'
			: typeof n == 'boolean'
				? n
					? 'on'
					: 'off'
				: t === 'protocol'
					? (Be.find((i) => i.id === n) || {}).label || String(n ?? '')
					: String(n ?? '').trim() || 'blank (so the default)'
	}
	qt.exports = {
		CONN_FIELDS: y,
		PROTOCOL_CHOICES: Be,
		checkField: xn,
		shownValue: Gt,
		getConfigFields() {
			let e = this,
				t = e.config || {},
				n = e._authenticated
					? `Connected to ${e.MODEL || 'V-160HD'}${e.VERSION ? ` (firmware ${e.VERSION})` : ''}, talking ${e.PROTOCOL === 'named' ? 'named commands' : 'low-level address commands'}. All good.`
					: 'Not connected yet. Fill in the IP address and password, then Save.',
				o = (i) => [
					{ ...i, isVisibleExpression: `!$(options:${i.id}_byAction)` },
					{
						type: 'static-text',
						id: `${i.id}_locked`,
						label: i.label,
						width: i.width,
						value: `Set by the 'Connection: set settings' action: ${Gt(t, i.id)}`,
						isVisibleExpression: `$(options:${i.id}_byAction)`,
					},
					{
						type: 'checkbox',
						id: `${i.id}_byAction`,
						label: 'Can be set by the action',
						width: 3,
						default: !1,
						disableAutoExpression: !0,
						tooltip: wn,
					},
				]
			return [
				{
					type: 'static-text',
					id: 'info',
					label: 'Status',
					width: 12,
					value: `${n}<br>On the switcher: <b>MENU \u2192 LAN CONTROL</b>, set a 4-digit password (no password, no remote control). Only one LAN controller at a time: RCS on LAN will knock this off (RCS over USB is fine).<br>Want a button, a trigger or a variable to change a setting? Tick <b>Can be set by the action</b> next to it, then use <b>Connection: set settings</b>.`,
				},
				...o({
					type: 'textinput',
					id: 'host',
					label: y.host.label,
					width: 9,
					default: '192.168.0.1',
					tooltip:
						"The V-160HD's IP address. You'll find it on the switcher: MENU \u2192 LAN CONTROL \u2192 INFORMATION.",
				}),
				...o({
					type: 'textinput',
					id: 'port',
					label: y.port.label,
					width: 9,
					default: '8023',
					tooltip: 'The switcher listens on 8023. Leave it unless you know otherwise. (1 to 65535)',
				}),
				...o({
					type: 'textinput',
					id: 'password',
					label: y.password.label,
					width: 9,
					default: '0000',
					tooltip:
						'The 4-digit password from MENU \u2192 LAN CONTROL on the switcher. It has to be set there or nothing works.',
				}),
				...o({
					type: 'dropdown',
					id: 'protocol',
					label: y.protocol.label,
					width: 9,
					default: 'auto',
					choices: Be,
					tooltip:
						"Auto asks the switcher its firmware when it connects: 3.40 or later gets Roland's named commands (Input 1-20 in every destination, one-shot tally), older gets the low-level address commands. Force one if Auto guesses wrong.",
				}),
				...o({
					type: 'checkbox',
					id: 'polling',
					label: y.polling.label,
					width: 9,
					default: !0,
					disableAutoExpression: !0,
					tooltip:
						"On: the module keeps asking the switcher what's what, so feedbacks and variables follow changes made on the panel too. It's polite about it now: one question at a time, never piling up. Off: feedbacks only follow this module and the tally the switcher shouts about.",
				}),
				...o({
					type: 'textinput',
					id: 'pollingrate',
					label: y.pollingrate.label,
					width: 9,
					default: '500',
					isVisibleExpression: '$(options:polling)',
					tooltip:
						"How often to ask. A round is skipped if the last one hasn't been answered, so going lower can't swamp the switcher. (100 to 30000)",
				}),
				{
					type: 'static-text',
					id: 'tuning',
					label: "Fine tuning (leave these unless something's up)",
					width: 12,
					value: '',
				},
				...o({
					type: 'textinput',
					id: 'timeout',
					label: y.timeout.label,
					width: 9,
					default: '500',
					tooltip: 'How long to wait for the switcher to answer one command before moving on. (50 to 5000)',
				}),
				...o({
					type: 'textinput',
					id: 'gap',
					label: y.gap.label,
					width: 9,
					default: '20',
					tooltip:
						'A breath between one answer and the next command. Roland asks for at least 20 ms between writes. (0 to 1000)',
				}),
				...o({
					type: 'textinput',
					id: 'retries',
					label: y.retries.label,
					width: 9,
					default: '1',
					tooltip:
						"If a button's command gets no answer, send it again this many times. Toggles are never resent (twice would undo it). (0 to 5)",
				}),
				...o({
					type: 'textinput',
					id: 'silence',
					label: y.silence.label,
					width: 9,
					default: '5',
					tooltip:
						'After this many unanswered commands in a row, polling takes a breather until the switcher speaks again. (1 to 100)',
				}),
				...o({
					type: 'checkbox',
					id: 'verbose',
					label: y.verbose.label,
					width: 9,
					default: !1,
					tooltip: 'Logs everything sent and received. Handy for hunting problems, noisy otherwise.',
				}),
				{ type: 'static-text', id: 'bundle', label: "Psst. This one's got mates. \u{1F379}", width: 12, value: _n },
			]
		},
	}
})
var jt = f((fs, Zt) => {
	'use strict'
	var ue = _(),
		Yt = {
			pgm: {
				label: 'Program (PGM)',
				count: 1,
				named: (e, t) => `PGM:${t}`,
				address: () => '002100',
				data: () => 'pgmsource',
			},
			pvw: {
				label: 'Preview (PVW)',
				count: 1,
				named: (e, t) => `PST:${t}`,
				address: () => '002101',
				data: () => 'pvwsource',
			},
			aux: {
				label: 'Aux',
				count: 3,
				named: (e, t) => `AUX:AUX${e},${t}`,
				address: (e) => ['000011', '00002E', '00002F'][e - 1],
				data: (e) => `aux${e}source`,
			},
			pinp: {
				label: 'PinP & Key',
				count: 4,
				named: (e, t) => `PIS:PinP${e},${t}`,
				address: (e) => '00' + ['1B', '1C', '1D', '1E'][e - 1] + '02',
				data: (e) => `pnpkey${e}source`,
			},
			dskkey: {
				label: 'DSK key source',
				count: 2,
				named: (e, t) => `DSS:DSK${e},${t}`,
				address: (e) => '00' + ['1F', '20'][e - 1] + '03',
				data: (e) => `dsk${e}source`,
			},
			dskfill: {
				label: 'DSK fill source',
				count: 2,
				named: null,
				address: (e) => '00' + ['1F', '20'][e - 1] + '04',
				data: (e) => `dsk${e}fill`,
			},
		}
	function Qt(e, t, n, o) {
		let i = Yt[t]
		if (!i) return !1
		let s = Number(n)
		if (!Number.isInteger(s) || s < 1 || s > i.count)
			return (e.log('warn', `${i.label}: there's no number "${n}" (1 to ${i.count}).`), !1)
		let a = ue.resolveSource(o)
		if (!a)
			return (
				e.log(
					'warn',
					`${i.label}${i.count > 1 ? ' ' + s : ''}: "${o}" isn't a source I know. Try Input 1-20, HDMI 1-8, SDI 1-8 or Still 1-16 (e.g. INPUT11, HDMI2, STILL5, or just 11 for Input 11).`,
				),
				!1
			)
		let r = a.id.startsWith('INPUT')
		return (
			e.PROTOCOL === 'named' && i.named
				? e.sendNamed(i.named(s, a.id), { needsNamed: r })
				: e.sendCommand(i.address(s), a.hex, { needsNamed: r }),
			(e.DATA[i.data(s)] = a.hex),
			e.checkAllFeedbacks(),
			e.checkVariables(),
			!0
		)
	}
	function Tn(e, t, n) {
		let o = ue.resolveSlot(t)
		if (!o) return (e.log('warn', `Assign input: "${t}" isn't an input slot. Use Input 1-20 (or just the number).`), !1)
		let i = Number(o.id.slice(5)),
			s = /^(N\/?A|NONE|NOTHING|OFF)$/i.test(String(n ?? '').trim()),
			a = s ? void 0 : ue.resolveSource(n)
		if (!s && (!a || a.id.startsWith('INPUT')))
			return (
				e.log('warn', `Assign input: "${n}" can't go in an input slot. Use HDMI 1-8, SDI 1-8, Still 1-16 or N/A.`),
				!1
			)
		if (e.PROTOCOL === 'named') e.sendNamed(`VIS:${o.id},${s ? 'N/A' : a.id}`, { needsNamed: i > 10 })
		else {
			if (s) return (e.log('warn', 'Assign input: "nothing" needs the named commands (firmware 3.40+).'), !1)
			e.sendCommand(o.address, a.hex, { needsNamed: i > 10 })
		}
		return (
			Array.isArray(e.DATA.inputAssign) || (e.DATA.inputAssign = new Array(20).fill(void 0)),
			(e.DATA.inputAssign[i - 1] = s ? void 0 : a.hex),
			e.checkAllFeedbacks(),
			e.checkVariables(),
			!0
		)
	}
	function En(e, t, n, o) {
		let i = n === void 0 || String(n).trim() === '' ? void 0 : ue.resolveSource(n)
		if (n !== void 0 && String(n).trim() !== '' && !i)
			return (e.log('warn', `${t === 'cut' ? 'Cut' : 'Auto'}: "${n}" isn't a source I know.`), !1)
		if (e.PROTOCOL === 'named') {
			if (t === 'cut') e.sendNamed(i ? `CUT:${i.id}` : 'CUT', { repeatable: !1 })
			else {
				let a = String(o ?? '').trim(),
					r
				if (a !== '') {
					let d = Number(a)
					!Number.isFinite(d) || d < 0 || d > 4
						? e.log(
								'warn',
								`Auto: the time needs to be 0 to 4 seconds, and "${a}" isn't. Using the switcher's own time.`,
							)
						: (r = Math.round(d * 10))
				}
				i && r !== void 0
					? e.sendNamed(`ATO:${i.id},${r}`, { repeatable: !1 })
					: i
						? e.sendNamed(`ATO:${i.id}`, { repeatable: !1 })
						: e.sendNamed('ATO', { repeatable: !1 })
			}
			return !0
		}
		i && Qt(e, 'pvw', 1, i.id)
		let s = t === 'cut' ? '0B001E' : '0B001F'
		return (
			e.sendCommand(s, '01', { repeatable: !1 }),
			e.sendCommand(s, '00'),
			t === 'auto' &&
				o !== void 0 &&
				String(o).trim() !== '' &&
				e.log(
					'info',
					"Auto: a custom time needs the named commands (firmware 3.40+), so the switcher's own time was used.",
				),
			!0
		)
	}
	Zt.exports = { DESTINATIONS: Yt, route: Qt, assignSlot: Tn, transition: En }
})
var ti = f((bs, ei) => {
	'use strict'
	var C = _(),
		{ route: B, assignSlot: In, transition: Xt } = jt(),
		{ CONN_FIELDS: Dn, PROTOCOL_CHOICES: On } = He(),
		Ke =
			'Input 1-20, HDMI 1-8, SDI 1-8 or Still 1-16. With the expression switch on you can feed it a variable: INPUT11, HDMI2, STILL5, or just 11 for Input 11.',
		Jt = ' Input 11-20 here needs firmware 3.40 or later (Auto picks that up).'
	function H(e, t) {
		return {
			type: 'dropdown',
			label: e || 'Source',
			id: 'source',
			default: 'INPUT1',
			choices: C.sourceChoices(),
			tooltip: Ke + (t || ''),
		}
	}
	function pe(e, t, n, o) {
		let i = []
		for (let s = 1; s <= n; s++) i.push({ id: String(s), label: `${o} ${s}` })
		return { type: 'dropdown', label: t, id: e, default: '1', choices: i, tooltip: `1 to ${n}` }
	}
	function $n(e, t) {
		;((t.select_pgm = {
			name: 'Route: Program (PGM) source',
			description: 'Put a source straight on Program.',
			options: [H('Source')],
			callback: (n) => B(e, 'pgm', 1, n.options.source),
			learn: () => ({ source: C.sourceFromHex(e.DATA.pgmsource)?.id ?? 'INPUT1' }),
		}),
			(t.select_pvw = {
				name: 'Route: Preview (PVW) source',
				description: 'Put a source on Preview, ready for the next Cut or Auto.',
				options: [H('Source')],
				callback: (n) => B(e, 'pvw', 1, n.options.source),
				learn: () => ({ source: C.sourceFromHex(e.DATA.pvwsource)?.id ?? 'INPUT1' }),
			}),
			(t.aux_assign = {
				name: 'Route: Aux source',
				options: [pe('aux', 'Aux', 3, 'Aux'), H('Source')],
				callback: (n) => B(e, 'aux', n.options.aux, n.options.source),
				learn: (n) => ({ source: C.sourceFromHex(e.DATA[`aux${n.options.aux}source`])?.id ?? n.options.source }),
			}),
			(t.pnpkey_setsource = {
				name: 'Route: PinP & Key source',
				options: [pe('pinp', 'PinP & Key', 4, 'PinP & Key'), H('Source', Jt)],
				callback: (n) => B(e, 'pinp', n.options.pinp, n.options.source),
				learn: (n) => ({ source: C.sourceFromHex(e.DATA[`pnpkey${n.options.pinp}source`])?.id ?? n.options.source }),
			}),
			(t.set_dsk_key_source = {
				name: 'Route: DSK key source',
				description: 'In Alpha Key mode the switcher only takes Stills here.',
				options: [pe('dsk', 'DSK', 2, 'DSK'), H('Source', Jt)],
				callback: (n) => B(e, 'dskkey', n.options.dsk, n.options.source),
				learn: (n) => ({ source: C.sourceFromHex(e.DATA[`dsk${n.options.dsk}source`])?.id ?? n.options.source }),
			}),
			(t.set_dsk_fill_source = {
				name: 'Route: DSK fill source',
				description:
					'Only takes effect when the DSK is in External Key mode. Roland has no named command for this, so Input 1-20 may be turned down.',
				options: [pe('dsk', 'DSK', 2, 'DSK'), H('Source')],
				callback: (n) => B(e, 'dskfill', n.options.dsk, n.options.source),
				learn: (n) => ({ source: C.sourceFromHex(e.DATA[`dsk${n.options.dsk}fill`])?.id ?? n.options.source }),
			}),
			(t.input_assign = {
				name: 'Route: give an input slot a source',
				description: 'Which physical source sits on Input 1-20.',
				options: [
					{
						type: 'dropdown',
						label: 'Input slot',
						id: 'slot',
						default: 'INPUT1',
						choices: C.slotChoices(),
						tooltip: 'Input 1-20. Slots 11-20 on firmware below 3.40 may be turned down.',
					},
					{
						type: 'dropdown',
						label: 'Source',
						id: 'source',
						default: 'HDMI1',
						choices: C.physicalChoices(!0),
						tooltip: 'HDMI 1-8, SDI 1-8, Still 1-16, or N/A for nothing (N/A needs firmware 3.40+).',
					},
				],
				callback: (n) => In(e, n.options.slot, n.options.source),
				learn: (n) => {
					let o = Number(String(n.options.slot).replace(/\D/g, '')) || 1,
						i = Array.isArray(e.DATA.inputAssign) ? e.DATA.inputAssign[o - 1] : void 0
					return { source: C.sourceFromHex(i)?.id ?? n.options.source }
				},
			}),
			(t.cut = {
				name: 'Transition: Cut',
				description: 'Cut, optionally straight to a source.',
				options: [
					{
						type: 'textinput',
						label: 'To source (blank = whatever is on Preview)',
						id: 'source',
						default: '',
						tooltip: Ke + ' Leave blank to cut to Preview.',
					},
				],
				callback: (n) => Xt(e, 'cut', n.options.source),
			}),
			(t.auto = {
				name: 'Transition: Auto',
				description: 'Auto transition, optionally to a source and with its own time.',
				options: [
					{
						type: 'textinput',
						label: 'To source (blank = whatever is on Preview)',
						id: 'source',
						default: '',
						tooltip: Ke + ' Leave blank to take Preview.',
					},
					{
						type: 'textinput',
						label: "Time in seconds (blank = the switcher's own)",
						id: 'time',
						default: '',
						tooltip: '0 to 4 seconds, in tenths (e.g. 1.5). Needs firmware 3.40+; older firmware uses its own time.',
					},
				],
				callback: (n) => Xt(e, 'auto', n.options.source, n.options.time),
			}))
	}
	function Rn(e, t) {
		;((t.ftb = {
			name: 'Output fade (fade to black)',
			options: [
				{
					type: 'dropdown',
					label: 'Do',
					id: 'mode',
					default: 'toggle',
					choices: [
						{ id: 'toggle', label: 'Toggle' },
						{ id: 'on', label: 'Fade out (to black)' },
						{ id: 'off', label: 'Fade back in' },
					],
					tooltip:
						'Toggle, fade out or fade in. On firmware below 3.40 this presses the OUTPUT FADE button, so it toggles.',
				},
			],
			callback: (i) => {
				let s = String(i.options.mode || 'toggle').toLowerCase()
				e.PROTOCOL === 'named'
					? (s === 'on'
							? e.sendNamed('FTB:ON')
							: s === 'off'
								? e.sendNamed('FTB:OFF')
								: e.sendNamed('FTB', { repeatable: !1 }),
						e._read('QFTB;', 'FTB'))
					: (e.sendCommand('0B004E', '01', { repeatable: !1 }), e.sendCommand('0B004E', '00'))
			},
		}),
			(t.raw_command = {
				name: 'Send a raw command',
				description:
					'For anything the module has no action for. DTH:/RQH: address commands, or a named command like PGM:INPUT3 on firmware 3.40+.',
				options: [
					{
						type: 'textinput',
						label: 'Command',
						id: 'cmd',
						default: '',
						tooltip: "e.g. DTH:002100,2A or QPGM or GPO:GPO1,ON. The ';' is added if you leave it off.",
					},
				],
				callback: (i) => {
					let s = String(i.options.cmd ?? '').trim()
					s && e.sendRawCommand(s)
				},
			}))
		let o = (typeof e._tickedFields == 'function' ? e._tickedFields() : []).map((i) => {
			let s = Dn[i],
				a = ''
			return (
				s.kind === 'int' && (a = `A whole number from ${s.min} to ${s.max}.`),
				s.kind === 'ip' && (a = 'An IP address, like 192.168.0.1.'),
				s.kind === 'choice' && (a = `One of: ${On.map((r) => r.id).join(', ')}.`),
				s.kind === 'bool' && (a = 'on or off (true/false, 1/0 work too).'),
				{
					type: 'textinput',
					label: s.label,
					id: i,
					default: '',
					tooltip: `${a} Blank = leave as is. Impossible values are skipped and logged.`,
				}
			)
		})
		t.set_settings = {
			name: 'Connection: set settings',
			description: `Changes this connection's settings, for the fields ticked "Can be set by the action" on the connection page. Blank = leave as is. Put it in a trigger on "variable changed" to drive the connection from a variable.`,
			options: o.length
				? o
				: [
						{
							type: 'static-text',
							id: 'none',
							label: 'Nothing to set yet',
							value: `Tick "Can be set by the action" next to a field on this connection's settings page first. Then it turns up here, ready to set.`,
						},
					],
			callback: (i) => e.setSettingsByAction(i.options),
		}
	}
	ei.exports = { routingActions: $n, extraActions: Rn }
})
var ni = f((ms, ii) => {
	var { routingActions: Mn, extraActions: Nn } = ti()
	ii.exports = {
		initActions: function () {
			let e = this,
				t = {}
			;((t.run_macro = {
				name: 'Run Macro',
				options: [
					{
						type: 'number',
						label: 'Macro',
						id: 'macro',
						tooltip: '(1-100)',
						min: 1,
						max: 100,
						default: 1,
						step: 1,
						range: !1,
					},
				],
				callback: function (n, o) {
					let s = n.options.macro,
						r = (s - 1).toString(16).padStart(2, '0').toUpperCase()
					if (!Number.isInteger(Number(s)) || s < 1 || s > 100) {
						e.log('warn', `Run Macro: there's no macro "${s}" (1 to 100).`)
						return
					}
					e.PROTOCOL === 'named'
						? e.sendNamed(`MCREX:MACRO${s}`, { repeatable: !1 })
						: e.sendCommand('500504', r, { repeatable: !1 })
				},
			}),
				Mn(e, t),
				(t.output_assign = {
					name: 'Assign Output',
					options: [
						{
							type: 'dropdown',
							label: 'Output',
							id: 'output',
							default: e.CHOICES_OUTPUTS[0].id,
							choices: e.CHOICES_OUTPUTS,
						},
						{
							type: 'dropdown',
							label: 'Type',
							id: 'assign',
							default: e.CHOICES_OUTPUTSASSIGN[0].id,
							choices: e.CHOICES_OUTPUTSASSIGN,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = i.output,
							a = i.assign
						e.sendCommand(s, a)
					},
				}),
				(t.aux_linked_pgm_mode = {
					name: 'Aux Linked PGM Mode',
					options: [
						{
							type: 'dropdown',
							label: 'Mode',
							id: 'mode',
							default: '00',
							choices: [
								{ id: '00', label: 'Off' },
								{ id: '01', label: 'Auto Link' },
								{ id: '02', label: 'Manual Link' },
							],
						},
					],
					callback: function (n, o) {
						let s = n.options.mode
						e.sendCommand('02010D', s)
					},
				}),
				(t.aux_linked = {
					name: 'Aux Linked',
					options: [
						{
							type: 'dropdown',
							label: 'Aux',
							id: 'aux',
							default: '020154',
							choices: [
								{ id: '020154', label: 'Aux 1' },
								{ id: '020155', label: 'Aux 2' },
								{ id: '020156', label: 'Aux 3' },
							],
						},
						{
							type: 'dropdown',
							label: 'On/Off',
							id: 'value',
							default: '00',
							choices: [
								{ id: '00', label: 'Off' },
								{ id: '01', label: 'On' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = i.aux,
							a = i.value
						e.sendCommand(s, a)
					},
				}),
				(t.aux_mute = {
					name: 'Mute Aux',
					options: [
						{
							type: 'dropdown',
							label: 'Aux',
							id: 'aux',
							default: '000011',
							choices: [
								{ id: '012203', label: 'Aux 1' },
								{ id: '012503', label: 'Aux 2' },
								{ id: '012603', label: 'Aux 3' },
							],
						},
						{
							type: 'dropdown',
							label: 'Mute/Unmute',
							id: 'mute',
							default: 1,
							choices: [
								{ id: '00', label: 'Unmute' },
								{ id: '01', label: 'Mute' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = i.aux,
							a = i.mute
						e.sendCommand(s, a)
					},
				}),
				(t.pnpkey_enable = {
					name: 'PnP & Key: allow on the Program / Sub Program layer (layer setting)',
					description:
						"This is the layer setting, not taking a PinP on air. For on air, use 'PnP & Key: on/off on PGM or PVW'.",
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: e.CHOICES_PINPDSK[0].id,
							choices: e.CHOICES_PINPDSK,
						},
						{
							type: 'dropdown',
							label: 'Enable/Disable',
							id: 'enable',
							default: 1,
							choices: [
								{ id: 0, label: 'Disable' },
								{ id: 1, label: 'Enable' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '0000' + i.pinp.toString(16).padStart(2, '0').toUpperCase(),
							a = i.enable.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.pnpkey_fade = {
					name: 'PnP & Key Fade Enable/Disable',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '05',
							choices: [
								{ id: '05', label: 'PnP/Key 1' },
								{ id: '06', label: 'PnP/Key 2' },
								{ id: '07', label: 'PnP/Key 3' },
								{ id: '08', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'dropdown',
							label: 'Enable/Disable',
							id: 'enable',
							default: '01',
							choices: [
								{ id: '00', label: 'Disable' },
								{ id: '01', label: 'Enable' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '0203' + i.pinp,
							a = i.enable
						e.sendCommand(s, a)
					},
				}),
				(t.pnpkey_busselect = {
					name: 'PnP & Key: on/off on PGM or PVW',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'dropdown',
							label: 'Bus',
							id: 'bus',
							default: '00',
							choices: [
								{ id: '00', label: 'Program (PGM)' },
								{ id: '01', label: 'Preview (PVW)' },
							],
						},
						{
							type: 'dropdown',
							label: 'On/Off',
							id: 'onoff',
							default: '01',
							choices: [
								{ id: '00', label: 'Off' },
								{ id: '01', label: 'On' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}${i.bus}`,
							a = i.onoff
						e.sendCommand(s, a)
					},
				}),
				(t.pnpkey_settype = {
					name: 'PnP & Key Set Type',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'dropdown',
							label: 'Type',
							id: 'type',
							default: '00',
							choices: [
								{ id: '00', label: 'PinP' },
								{ id: '01', label: 'Luminance-White Key' },
								{ id: '02', label: 'Luminance-Black Key' },
								{ id: '03', label: 'Chroma Key' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}03`,
							a = i.type
						e.sendCommand(s, a)
					},
				}),
				(t.pnpkey_positionH = {
					name: 'PnP & Key Position Horizontal',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Position',
							id: 'position',
							tooltip: '(-100.0 - 0.0 - 100.0)',
							min: -100,
							max: 100,
							default: 50,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.position, 10)
						e.sendCommand(s + '04', e.formatBytes(a))
					},
				}),
				(t.pnpkey_positionV = {
					name: 'PnP & Key Position Vertical',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Position',
							id: 'position',
							tooltip: '(-100.0 - 0.0 - 100.0)',
							min: -100,
							max: 100,
							default: 50,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.position, 10)
						e.sendCommand(s + '06', e.formatBytes(a))
					},
				}),
				(t.pnpkey_size = {
					name: 'PnP & Key Size',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Size',
							id: 'size',
							tooltip: '(0.0 - 100.0)',
							min: 0,
							max: 100,
							default: 50,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.size, 10)
						e.sendCommand(s + '08', e.formatBytes(a))
					},
				}),
				(t.pnpkey_croppingH = {
					name: 'PnP & Key Cropping Horizontal',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Cropping',
							id: 'cropping',
							tooltip: '(0.0 - 100.0)',
							min: 0,
							max: 100,
							default: 0,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.cropping, 10)
						e.sendCommand(s + '0A', e.formatBytes(a))
					},
				}),
				(t.pnpkey_croppingV = {
					name: 'PnP & Key Cropping Vertical',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Cropping',
							id: 'cropping',
							tooltip: '(0.0 - 100.0)',
							min: 0,
							max: 100,
							default: 0,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.cropping, 10)
						e.sendCommand(s + '0C', e.formatBytes(a))
					},
				}),
				(t.pnpkey_shape = {
					name: 'PnP & Key Shape',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'dropdown',
							label: 'Shape',
							id: 'shape',
							default: '00',
							choices: [
								{ id: '00', label: 'Rectangle' },
								{ id: '01', label: 'Circle' },
								{ id: '02', label: 'Diamond' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = i.shape
						e.sendCommand(s + '0E', a)
					},
				}),
				(t.pnpkey_borderColor = {
					name: 'PnP & Key Border Color',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'dropdown',
							label: 'Border Color',
							id: 'color',
							default: '00',
							choices: [
								{ id: '00', label: 'White' },
								{ id: '01', label: 'Yellow' },
								{ id: '02', label: 'Cyan' },
								{ id: '03', label: 'Green' },
								{ id: '04', label: 'Magenta' },
								{ id: '05', label: 'Red' },
								{ id: '06', label: 'Blue' },
								{ id: '07', label: 'Black' },
								{ id: '08', label: 'Custom' },
								{ id: '09', label: 'Soft Edge' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = i.color
						e.sendCommand(s + '0F', a)
					},
				}),
				(t.pnpkey_borderWidth = {
					name: 'PnP & Key Border Width',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Border Width',
							id: 'width',
							tooltip: '0-14',
							min: 0,
							max: 14,
							default: 5,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = i.width.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s + '10', a)
					},
				}),
				(t.pnpkey_viewPositionH = {
					name: 'PnP & Key View Position Horizontal',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Position',
							id: 'position',
							tooltip: '(-50.0 - 0.0 - 50.0)',
							min: -50,
							max: 50,
							default: 0,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.position, 10)
						e.sendCommand(s + '11', e.formatBytes(a))
					},
				}),
				(t.pnpkey_viewPositionV = {
					name: 'PnP & Key View Position Vertical',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Position',
							id: 'position',
							tooltip: '(-50.0 - 0.0 - 50.0)',
							min: -50,
							max: 50,
							default: 0,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.position, 10)
						e.sendCommand(s + '13', e.formatBytes(a))
					},
				}),
				(t.pnpkey_viewZoom = {
					name: 'PnP & Key View Zoom',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Zoom',
							id: 'zoom',
							tooltip: '(100%- 400%)',
							min: 100,
							max: 400,
							default: 100,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.zoom, 1)
						e.sendCommand(s + '15', e.formatBytes(a))
					},
				}),
				(t.pnpkey_keyLevel = {
					name: 'PnP & Key Key Level',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Level',
							id: 'level',
							tooltip: '(0-255)',
							min: 0,
							max: 255,
							default: 50,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.level, 1)
						e.sendCommand(s + '17', e.formatBytes(a))
					},
				}),
				(t.pnpkey_keyGain = {
					name: 'PnP & Key Key Gain',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Gain',
							id: 'gain',
							tooltip: '(0-255)',
							min: 0,
							max: 255,
							default: 50,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.gain, 1)
						e.sendCommand(s + '19', e.formatBytes(a))
					},
				}),
				(t.pnpkey_mixLevel = {
					name: 'PnP & Key Mix Level',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Level',
							id: 'level',
							tooltip: '(0-255)',
							min: 0,
							max: 255,
							default: 50,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.level, 1)
						e.sendCommand(s + '1B', e.formatBytes(a))
					},
				}),
				(t.pnpkey_chromaColor = {
					name: 'PnP & Key Chroma Color',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'dropdown',
							label: 'Color',
							id: 'color',
							default: '00',
							choices: [
								{ id: '00', label: 'Green' },
								{ id: '01', label: 'Blue' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = i.color
						e.sendCommand(s + '1D', a)
					},
				}),
				(t.pnpkey_hueWidth = {
					name: 'PnP & Key Hue Width',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Width',
							id: 'width',
							tooltip: '(-30 - 0 - +30)',
							min: -30,
							max: 30,
							default: 0,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = i.width
						e.sendCommand(s + '1E', a)
					},
				}),
				(t.pnpkey_hueFine = {
					name: 'PnP & Key Hue Fine',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Fine',
							id: 'fine',
							tooltip: '(0 - 360)',
							min: 0,
							max: 360,
							default: 0,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.fine, 1)
						e.sendCommand(s + '1F', e.formatBytes(a))
					},
				}),
				(t.pnpkey_saturationWidth = {
					name: 'PnP & Key Saturation Width',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Width',
							id: 'width',
							tooltip: '(-127 - 0 - +127)',
							min: -127,
							max: 127,
							default: 0,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.width, 1)
						e.sendCommand(s + '21', e.formatBytes(a))
					},
				}),
				(t.pnpkey_saturationFine = {
					name: 'PnP & Key Saturation Fine',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Fine',
							id: 'fine',
							tooltip: '(0 - 255)',
							min: 0,
							max: 255,
							default: 0,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.fine, 1)
						e.sendCommand(s + '23', e.formatBytes(a))
					},
				}),
				(t.pnpkey_borderColorRed = {
					name: 'PnP & Key Border Color Red',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Red',
							id: 'red',
							tooltip: '(0 - 255)',
							min: 0,
							max: 255,
							default: 0,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.red, 1)
						e.sendCommand(s + '25', e.formatBytes(a))
					},
				}),
				(t.pnpkey_borderColorGreen = {
					name: 'PnP & Key Border Color Green',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Green',
							id: 'green',
							tooltip: '(0 - 255)',
							min: 0,
							max: 255,
							default: 0,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.green, 1)
						e.sendCommand(s + '27', e.formatBytes(a))
					},
				}),
				(t.pnpkey_borderColorBlue = {
					name: 'PnP & Key Border Color Blue',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'number',
							label: 'Blue',
							id: 'blue',
							tooltip: '(0 - 255)',
							min: 0,
							max: 255,
							default: 0,
							step: 1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.pinp}`,
							a = e.calculateBytes(i.blue, 1)
						e.sendCommand(s + '29', e.formatBytes(a))
					},
				}),
				(t.dsk_busselect = {
					name: 'DSK: on/off on PGM or PVW',
					options: [
						{
							type: 'dropdown',
							label: 'DSK',
							id: 'dsk',
							default: '1F',
							choices: [
								{ id: '1F', label: 'DSK 1' },
								{ id: '20', label: 'DSK 2' },
							],
						},
						{
							type: 'dropdown',
							label: 'Bus',
							id: 'bus',
							default: '00',
							choices: [
								{ id: '00', label: 'Program (PGM)' },
								{ id: '01', label: 'Preview (PVW)' },
							],
						},
						{
							type: 'dropdown',
							label: 'On/Off',
							id: 'onoff',
							default: '01',
							choices: [
								{ id: '00', label: 'Off' },
								{ id: '01', label: 'On' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = `00${i.dsk}${i.bus}`,
							a = i.onoff
						e.sendCommand(s, a)
					},
				}),
				(t.set_transition_time = {
					name: 'Set Transition Time',
					options: [
						{
							type: 'dropdown',
							label: 'Transition Type',
							id: 'type',
							default: e.CHOICES_TRANSITION_TIME_TYPES[0].id,
							choices: e.CHOICES_TRANSITION_TIME_TYPES,
						},
						{
							type: 'number',
							label: 'Transition Time',
							id: 'time',
							tooltip: '(0.0-4.0)',
							min: 0,
							max: 4,
							default: 1,
							step: 0.1,
							range: !0,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = i.type,
							r = (i.time * 10).toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, r)
					},
				}),
				(t.set_transition_type = {
					name: 'Set Transition Type',
					options: [
						{
							type: 'dropdown',
							label: 'Transition Type',
							id: 'type',
							default: e.CHOICES_TRANSITION_TYPES[0].id,
							choices: e.CHOICES_TRANSITION_TYPES,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '001800',
							a = i.type.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.set_mix_type = {
					name: 'Set Mix Type',
					options: [
						{
							type: 'dropdown',
							label: 'Mix Type',
							id: 'type',
							default: e.CHOICES_MIX_TYPES[0].id,
							choices: e.CHOICES_MIX_TYPES,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '001801',
							a = i.type.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.set_wipe_type = {
					name: 'Set Wipe Type',
					options: [
						{
							type: 'dropdown',
							label: 'Wipe Type',
							id: 'type',
							default: e.CHOICES_WIPE_TYPES[0].id,
							choices: e.CHOICES_WIPE_TYPES,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '001802',
							a = i.type.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.set_wipe_direction = {
					name: 'Set Wipe Direction',
					options: [
						{
							type: 'dropdown',
							label: 'Wipe Direction',
							id: 'direction',
							default: e.CHOICES_WIPE_DIRECTIONS[0].id,
							choices: e.CHOICES_WIPE_DIRECTIONS,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '001803',
							a = i.direction.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.press_and_release_switch = {
					name: 'Press and Release Panel Switch',
					options: [
						{
							type: 'dropdown',
							label: 'Switch',
							id: 'switch',
							default: e.CHOICES_SWITCHES[0].id,
							choices: e.CHOICES_SWITCHES,
						},
					],
					callback: function (n, o) {
						let i = n.options
						;(e.sendCommand(i.switch, '01'),
							setTimeout(function () {
								e.sendCommand(i.switch, '00')
							}, 200))
					},
				}),
				(t.press_switch = {
					name: "Press Panel Switch (Don't Release)",
					options: [
						{
							type: 'dropdown',
							label: 'Switch',
							id: 'switch',
							default: e.CHOICES_SWITCHES[0].id,
							choices: e.CHOICES_SWITCHES,
						},
					],
					callback: function (n, o) {
						let i = n.options
						e.sendCommand(i.switch, '01')
					},
				}),
				(t.release_switch = {
					name: 'Release Panel Switch',
					options: [
						{
							type: 'dropdown',
							label: 'Switch',
							id: 'switch',
							default: e.CHOICES_SWITCHES[0].id,
							choices: e.CHOICES_SWITCHES,
						},
					],
					callback: function (n, o) {
						let i = n.options
						e.sendCommand(i.switch, '00')
					},
				}),
				(t.set_pinp_type = {
					name: 'Set PnP & Key Type',
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: e.CHOICES_PINP_KEYS[0].id,
							choices: e.CHOICES_PINP_KEYS,
						},
						{
							type: 'dropdown',
							label: 'Key Type',
							id: 'key',
							default: e.CHOICES_PINP_TYPES[0].id,
							choices: e.CHOICES_PINP_TYPES,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '00' + i.pinp.toString(16).padStart(2, '0').toUpperCase() + '03',
							a = i.key.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.set_dsk_type = {
					name: 'Set DSK Key Type',
					options: [
						{ type: 'dropdown', label: 'DSK', id: 'dsk', default: e.CHOICES_DSK[0].id, choices: e.CHOICES_DSK },
						{
							type: 'dropdown',
							label: 'Key Type',
							id: 'key',
							default: e.CHOICES_DSK_TYPES[0].id,
							choices: e.CHOICES_DSK_TYPES,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '00' + i.dsk.toString(16).padStart(2, '0').toUpperCase() + '05',
							a = i.key.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.load_memory_trigger = {
					name: 'Load Memory Trigger',
					options: [
						{
							type: 'dropdown',
							label: 'Memory',
							id: 'memory',
							default: e.CHOICES_MEMORY[0].id,
							choices: e.CHOICES_MEMORY,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '0A0000',
							a = i.memory.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.save_memory_trigger = {
					name: 'Save Memory Trigger',
					options: [
						{
							type: 'dropdown',
							label: 'Memory',
							id: 'memory',
							default: e.CHOICES_MEMORY[0].id,
							choices: e.CHOICES_MEMORY,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '0A0001',
							a = i.memory.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.initialize_memory_trigger = {
					name: 'Initialize Memory Trigger',
					options: [
						{
							type: 'dropdown',
							label: 'Memory',
							id: 'memory',
							default: e.CHOICES_MEMORY[0].id,
							choices: e.CHOICES_MEMORY,
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '0A0002',
							a = i.memory.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.freezeSwitchOn = {
					name: 'Freeze Switch On',
					options: [],
					callback: function (n, o) {
						let i = '020500',
							s = '01'
						e.socket !== void 0 && e.socket.isConnected
							? (e._setFreezePending('freeze', s, function () {
									;(e.checkFeedbacks('freeze'), e.checkVariables())
								}),
								e.checkFeedbacks('freeze'),
								e.checkVariables(),
								e.sendCommand(i, s),
								e.sendRawCommand('RQH:' + i + ',000001;'))
							: e.sendCommand(i, s)
					},
				}),
				(t.freezeSwitchOff = {
					name: 'Freeze Switch Off',
					options: [],
					callback: function (n, o) {
						let i = '020500',
							s = '00'
						e.socket !== void 0 && e.socket.isConnected
							? (e._setFreezePending('freeze', s, function () {
									;(e.checkFeedbacks('freeze'), e.checkVariables())
								}),
								e.checkFeedbacks('freeze'),
								e.checkVariables(),
								e.sendCommand(i, s),
								e.sendRawCommand('RQH:' + i + ',000001;'))
							: e.sendCommand(i, s)
					},
				}),
				(t.freezeSwitchType = {
					name: 'Freeze Switch Type',
					options: [
						{
							type: 'dropdown',
							label: 'Type',
							id: 'type',
							default: '00',
							choices: [
								{ id: '00', label: 'All' },
								{ id: '01', label: 'Select' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '020501',
							a = i.type
						e.sendCommand(s, a)
					},
				}),
				(t.freezeSwitchSelectEnableDisable = {
					name: 'Freeze Switch Select Enable/Disable',
					options: [
						{
							type: 'dropdown',
							label: 'Input',
							id: 'input',
							default: '02',
							choices: [
								{ id: '02', label: 'HDMI IN 1' },
								{ id: '03', label: 'HDMI IN 2' },
								{ id: '04', label: 'HDMI IN 3' },
								{ id: '05', label: 'HDMI IN 4' },
								{ id: '06', label: 'HDMI IN 5' },
								{ id: '07', label: 'HDMI IN 6' },
								{ id: '08', label: 'HDMI IN 7' },
								{ id: '09', label: 'HDMI IN 8' },
								{ id: '0A', label: 'SDI IN 1' },
								{ id: '0B', label: 'SDI IN 2' },
								{ id: '0C', label: 'SDI IN 3' },
								{ id: '0D', label: 'SDI IN 4' },
								{ id: '0E', label: 'SDI IN 5' },
								{ id: '0F', label: 'SDI IN 6' },
								{ id: '10', label: 'SDI IN 7' },
								{ id: '11', label: 'SDI IN 8' },
							],
						},
						{
							type: 'dropdown',
							label: 'Enable/Disable',
							id: 'enable',
							default: 1,
							choices: [
								{ id: '00', label: 'Disable' },
								{ id: '01', label: 'Enable' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options,
							s = '0205' + i.input,
							a = i.enable
						e.sendCommand(s, a)
					},
				}),
				(t.selectCamera = {
					name: 'Select Camera',
					options: [
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
						},
					],
					callback: function (n, o) {
						let i = n.options
						e.selectedCamera = i.camera
					},
				}),
				(t.cameraCurrentPreset = {
					name: 'Camera Current Preset',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
						{
							type: 'dropdown',
							label: 'Preset',
							id: 'preset',
							default: '00',
							choices: [
								{ id: '7F', label: 'None' },
								{ id: '00', label: '1' },
								{ id: '01', label: '2' },
								{ id: '02', label: '3' },
								{ id: '03', label: '4' },
								{ id: '04', label: '5' },
								{ id: '05', label: '6' },
								{ id: '06', label: '7' },
								{ id: '07', label: '8' },
								{ id: '08', label: '9' },
								{ id: '09', label: '10' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}21`,
							a = i.preset
						e.sendCommand(s, a)
					},
				}),
				(t.cameraPanLeft = {
					name: 'Camera Pan Left',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}22`
						e.sendCommand(s, '7F')
					},
				}),
				(t.cameraPanRight = {
					name: 'Camera Pan Right',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}22`
						e.sendCommand(s, '01')
					},
				}),
				(t.cameraPanStop = {
					name: 'Camera Pan Stop',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}22`
						e.sendCommand(s, '00')
					},
				}),
				(t.cameraTiltUp = {
					name: 'Camera Tilt Up',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}23`
						e.sendCommand(s, '01')
					},
				}),
				(t.cameraTiltDown = {
					name: 'Camera Tilt Down',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}23`
						e.sendCommand(s, '7F')
					},
				}),
				(t.cameraTiltStop = {
					name: 'Camera Tilt Stop',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}23`
						e.sendCommand(s, '00')
					},
				}),
				(t.cameraPTSpeed = {
					name: 'Camera Pan/Tilt Speed',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
						{
							type: 'number',
							label: 'Speed',
							id: 'speed',
							tooltip: '(0-24)',
							min: 0,
							max: 24,
							default: 10,
							step: 1,
							range: !1,
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}24`,
							a = i.speed.toString(16).padStart(2, '0').toUpperCase()
						e.sendCommand(s, a)
					},
				}),
				(t.cameraZoomInFast = {
					name: 'Camera Zoom In Fast',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}25`
						e.sendCommand(s, '02')
					},
				}),
				(t.cameraZoomInSlow = {
					name: 'Camera Zoom In Slow',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}25`
						e.sendCommand(s, '01')
					},
				}),
				(t.cameraZoomOutFast = {
					name: 'Camera Zoom Out Fast',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}25`
						e.sendCommand(s, '7E')
					},
				}),
				(t.cameraZoomOutSlow = {
					name: 'Camera Zoom Out Slow',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}25`
						e.sendCommand(s, '7F')
					},
				}),
				(t.cameraZoomStop = {
					name: 'Camera Zoom Stop',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}25`
						e.sendCommand(s, '00')
					},
				}),
				(t.focus = {
					name: 'Camera Focus',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
						{
							type: 'dropdown',
							label: 'Focus',
							id: 'focus',
							default: '7F',
							choices: [
								{ id: '7F', label: 'Near' },
								{ id: '00', label: 'Stop' },
								{ id: '01', label: 'Far' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}26`,
							a = i.focus
						e.sendCommand(s, a)
					},
				}),
				(t.autoFocusOn = {
					name: 'Camera Auto Focus - On',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}27`
						e.sendCommand(s, '01')
					},
				}),
				(t.autoFocusOff = {
					name: 'Camera Auto Focus - Off',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}27`
						e.sendCommand(s, '00')
					},
				}),
				(t.cameraExposure = {
					name: 'Camera Exposure',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
						{
							type: 'dropdown',
							label: 'Exposure',
							id: 'exposure',
							default: '00',
							choices: [
								{ id: '00', label: 'Manual' },
								{ id: '01', label: 'Auto' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}28`,
							a = i.exposure
						e.sendCommand(s, a)
					},
				}),
				(t.cameraSetTallyChannel = {
					name: 'Camera Set Tally Channel',
					options: [
						{
							type: 'checkbox',
							label: 'Use Selected Camera',
							id: 'useSelected',
							default: !1,
							disableAutoExpression: !0,
							tooltip: 'Use the selected camera instead of the camera selected in the action',
						},
						{
							type: 'dropdown',
							label: 'Camera',
							id: 'camera',
							default: e.CHOICES_CAMERAS[0].id,
							choices: e.CHOICES_CAMERAS,
							isVisibleExpression: '!$(options:useSelected)',
						},
						{
							type: 'dropdown',
							label: 'Input for Tally',
							id: 'channel',
							default: '00',
							choices: [
								{ id: '00', label: 'HDMI 1' },
								{ id: '01', label: 'HDMI 2' },
								{ id: '02', label: 'HDMI 3' },
								{ id: '03', label: 'HDMI 4' },
								{ id: '04', label: 'HDMI 5' },
								{ id: '05', label: 'HDMI 6' },
								{ id: '06', label: 'HDMI 7' },
								{ id: '07', label: 'HDMI 8' },
								{ id: '08', label: 'SDI 1' },
								{ id: '09', label: 'SDI 2' },
								{ id: '0A', label: 'SDI 3' },
								{ id: '0B', label: 'SDI 4' },
								{ id: '0C', label: 'SDI 5' },
								{ id: '0D', label: 'SDI 6' },
								{ id: '0E', label: 'SDI 7' },
								{ id: '0F', label: 'SDI 8' },
							],
						},
					],
					callback: function (n, o) {
						let i = n.options
						i.useSelected === !0 &&
							(e.selectedCamera === void 0 && (e.selectedCamera = '41'), (i.camera = e.selectedCamera))
						let s = `02${i.camera}29`,
							a = i.channel
						e.sendCommand(s, a)
					},
				}),
				Nn(e, t),
				e.setActionDefinitions(t))
		},
	}
})
var ai = f((hs, si) => {
	'use strict'
	var { combineRgb: ve } = (R(), F($)),
		w = _(),
		E = ve(255, 255, 255),
		Q = ve(200, 0, 0),
		oi = ve(0, 150, 0),
		Ue = [
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
	function fe(e, t, n) {
		let o = w.resolveSource(n),
			i = w.sourceFromHex(t)
		if (!o || !i) return !1
		if (o.id === i.id) return !0
		let s = (d) => (d.id.startsWith('INPUT') ? e._resolveInputToPhysical(d.hex) : d.hex),
			a = s(o),
			r = s(i)
		return a !== void 0 && r !== void 0 && a === r && (o.id.startsWith('INPUT') || i.id.startsWith('INPUT'))
	}
	function Bn(e, t) {
		let n = {
			type: 'dropdown',
			label: 'Source',
			id: 'source',
			default: 'INPUT1',
			choices: w.sourceChoices(),
			tooltip: "Input 1-20, HDMI 1-8, SDI 1-8 or Still 1-16. An input and the HDMI/SDI it's given count as the same.",
		}
		;((t.tally = {
			type: 'boolean',
			name: 'Tally: source is on Program / Preview',
			description: "From the switcher's own tally: on air (PGM), on preview (PVW), or both.",
			defaultStyle: { color: E, bgcolor: Q },
			options: [
				{ ...n, id: 'input' },
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
			callback: (o) => {
				let i = w.resolveSource(o.options.input)
				if (!i) return !1
				let s = (e.TALLY || {})[i.id] || 0
				switch (o.options.state) {
					case 'preview':
						return (s & 2) !== 0
					case 'both':
						return (s & 3) === 3
					case 'either':
						return s !== 0
					default:
						return (s & 1) !== 0
				}
			},
		}),
			(t.sourceOn = {
				type: 'boolean',
				name: 'Route: source is on a destination',
				description: 'True when the chosen destination (PGM, PVW, Aux, PinP & Key, DSK) is showing the source.',
				defaultStyle: { color: E, bgcolor: Q },
				options: [
					{
						type: 'dropdown',
						label: 'Destination',
						id: 'where',
						default: 'pgm',
						choices: Ue.map((o) => ({ id: o.id, label: o.label })),
					},
					n,
				],
				callback: (o) => {
					let i = Ue.find((s) => s.id === String(o.options.where).toLowerCase())
					return !!i && fe(e, e.DATA[i.data], o.options.source)
				},
			}),
			(t.auxTally = {
				type: 'boolean',
				name: 'Route: Aux is showing a source',
				defaultStyle: { color: E, bgcolor: Q },
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
					{ ...n, id: 'assign' },
				],
				callback: (o) => fe(e, e.DATA[`${String(o.options.aux).toLowerCase()}source`], o.options.assign),
			}),
			(t.pnpKeySource = {
				type: 'boolean',
				name: 'Route: PinP & Key is showing a source',
				defaultStyle: { color: E, bgcolor: Q },
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
					n,
				],
				callback: (o) => fe(e, e.DATA[`${String(o.options.pinp).toLowerCase()}source`], o.options.source),
			}),
			(t.inputAssigned = {
				type: 'boolean',
				name: 'Route: input slot has a source',
				description: 'True when Input 1-20 is given the chosen HDMI, SDI or Still.',
				defaultStyle: { color: E, bgcolor: oi },
				options: [
					{ type: 'dropdown', label: 'Input slot', id: 'slot', default: 'INPUT1', choices: w.slotChoices() },
					{ type: 'dropdown', label: 'Source', id: 'source', default: 'HDMI1', choices: w.physicalChoices(!1) },
				],
				callback: (o) => {
					let i = w.resolveSlot(o.options.slot),
						s = w.resolveSource(o.options.source)
					return !i || !s || !Array.isArray(e.DATA.inputAssign)
						? !1
						: e.DATA.inputAssign[Number(i.id.slice(5)) - 1] === s.hex
				},
			}),
			(t.ftb = {
				type: 'boolean',
				name: 'Output fade: faded to black',
				description: 'Needs firmware 3.40+ (named commands) to know.',
				defaultStyle: { color: E, bgcolor: Q },
				options: [],
				callback: () => ['ON', 'FADEOUT'].includes(String(e.DATA.ftb || '').toUpperCase()),
			}),
			(t.memoryLoaded = {
				type: 'boolean',
				name: 'Memory: last loaded',
				defaultStyle: { color: E, bgcolor: oi },
				options: [{ type: 'number', label: 'Memory', id: 'memory', default: 1, min: 1, max: 30, tooltip: '1 to 30' }],
				callback: (o) => e.DATA.lastMemory !== void 0 && Number(e.DATA.lastMemory) + 1 === Number(o.options.memory),
			}))
	}
	si.exports = { sourceFeedbacks: Bn, sameSource: fe, WHERE: Ue }
})
var di = f((gs, li) => {
	var { combineRgb: ri } = (R(), F($)),
		{ sourceFeedbacks: Hn } = ai()
	li.exports = {
		initFeedbacks: function () {
			let e = this,
				t = {},
				n = ri(255, 255, 255),
				o = ri(255, 0, 0)
			;((t.auxMute = {
				type: 'boolean',
				name: 'Aux Mute State',
				description: 'Indicate if Aux Channel is Muted',
				defaultStyle: { color: n, bgcolor: o },
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
					{
						type: 'dropdown',
						label: 'Mute State',
						id: 'mute',
						default: '00',
						choices: [
							{ id: '00', label: 'Off' },
							{ id: '01', label: 'On' },
						],
					},
				],
				callback: function (i, s) {
					let a = i.options
					return (
						(a.aux == 'aux1' && e.DATA.aux1mute == a.mute) ||
						(a.aux == 'aux2' && e.DATA.aux2mute == a.mute) ||
						(a.aux == 'aux3' && e.DATA.aux3mute == a.mute)
					)
				},
			}),
				(t.outputAssign = {
					type: 'boolean',
					name: 'Output Assign State',
					description: 'Indicate if Output is Assigned to a specific Source',
					defaultStyle: { color: n, bgcolor: o },
					options: [
						{
							type: 'dropdown',
							label: 'Output',
							id: 'output',
							default: e.CHOICES_OUTPUTS[0].id,
							choices: e.CHOICES_OUTPUTS,
						},
						{
							type: 'dropdown',
							label: 'Type',
							id: 'assign',
							default: e.CHOICES_OUTPUTSASSIGN[0].id,
							choices: e.CHOICES_OUTPUTSASSIGN,
						},
					],
					callback: function (i, s) {
						let a = i.options
						return (
							(a.output == '00000A' && e.DATA.hdmi1assign == a.assign) ||
							(a.output == '00000B' && e.DATA.hdmi2assign == a.assign) ||
							(a.output == '00000C' && e.DATA.hdmi3assign == a.assign) ||
							(a.output == '00000D' && e.DATA.sdi1assign == a.assign) ||
							(a.output == '00000E' && e.DATA.sdi2assign == a.assign) ||
							(a.output == '00000F' && e.DATA.sdi3assign == a.assign) ||
							((a.output == '000110' || a.output == '000010') && e.DATA.usbassign == a.assign)
						)
					},
				}),
				(t.auxLinkMode = {
					type: 'boolean',
					name: 'Aux Link Mode',
					description: 'Indicate if Aux Link Mode is Off, Auto Link, or Manual Link',
					defaultStyle: { color: n, bgcolor: o },
					options: [
						{
							type: 'dropdown',
							label: 'Mode',
							id: 'mode',
							default: '00',
							choices: [
								{ id: '00', label: 'Off' },
								{ id: '01', label: 'Auto Link' },
								{ id: '02', label: 'Manual Link' },
							],
						},
					],
					callback: function (i, s) {
						let a = i.options
						return e.DATA.auxlinkmode == a.mode
					},
				}),
				(t.auxLink = {
					type: 'boolean',
					name: 'Aux Link State',
					description: 'Indicate if Aux Channel is Linked to PGM',
					defaultStyle: { color: n, bgcolor: o },
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
						{
							type: 'dropdown',
							label: 'Link Mode',
							id: 'link',
							default: '00',
							choices: [
								{ id: '00', label: 'Off' },
								{ id: '01', label: 'On' },
							],
						},
					],
					callback: function (i, s) {
						let a = i.options
						return (
							(a.aux == 'aux1' && e.DATA.aux1link == a.link) ||
							(a.aux == 'aux2' && e.DATA.aux2link == a.link) ||
							(a.aux == 'aux3' && e.DATA.aux3link == a.link)
						)
					},
				}),
				(t.keyOnAir = {
					type: 'boolean',
					name: 'Key is Selected on Bus',
					description: 'Indicate if Key is Selected on Bus',
					defaultStyle: { color: n, bgcolor: o },
					options: [
						{
							type: 'dropdown',
							label: 'PnP/Key',
							id: 'pinp',
							default: '1B',
							choices: [
								{ id: '1B', label: 'PnP/Key 1' },
								{ id: '1C', label: 'PnP/Key 2' },
								{ id: '1D', label: 'PnP/Key 3' },
								{ id: '1E', label: 'PnP/Key 4' },
							],
						},
						{
							type: 'dropdown',
							label: 'Bus',
							id: 'bus',
							default: '00',
							choices: [
								{ id: '00', label: 'Program (PGM)' },
								{ id: '01', label: 'Preview (PVW)' },
							],
						},
						{
							type: 'dropdown',
							label: 'On/Off',
							id: 'onoff',
							default: '01',
							choices: [
								{ id: '00', label: 'Off' },
								{ id: '01', label: 'On' },
							],
						},
					],
					callback: function (i, s) {
						let a = i.options,
							r = e.DATA[`data_${a.pinp}${a.bus}`]
						return r !== void 0 && r == a.onoff
					},
				}),
				(t.freeze = {
					type: 'boolean',
					name: 'Freeze State',
					description: 'Indicate if Freeze is On or Off',
					defaultStyle: { color: n, bgcolor: o },
					options: [],
					callback: function (i, s) {
						let a = i.options
						return e._freezeValue('freeze') == '01'
					},
				}),
				Hn(e, t),
				e.setFeedbackDefinitions(t))
		},
	}
})
var ui = f((ys, ci) => {
	'use strict'
	var Fe = _(),
		I = (e) => Fe.sourceFromHex(e)?.label ?? '',
		be = (e) => (e == '01' ? 'On' : 'Off'),
		Kn = (e) => (e & 1 ? 'Program' : e & 2 ? 'Preview' : 'Off')
	ci.exports = {
		initVariables: function () {
			let e = {},
				t = (n, o) => (e[n] = { name: o })
			;(t('model', 'Model'), t('version', 'Firmware version'), t('protocol', 'Command set in use (named or lowlevel)'))
			for (let n of Fe.SOURCES) t(`tally_${n.id.toLowerCase()}`, `Tally: ${n.label}`)
			for (let n = 1; n <= 10; n++) t(`tally_xpt${n}`, `Tally: Input ${n} (old name)`)
			;(t('pgm', 'Program source'), t('pvw', 'Preview source'))
			for (let n = 1; n <= 3; n++) t(`aux${n}`, `Aux ${n} source`)
			for (let n = 1; n <= 4; n++)
				(t(`pnpkey${n}_source`, `PinP & Key ${n} source`),
					t(`pnpkey${n}_pgm`, `PinP & Key ${n} on PGM`),
					t(`pnpkey${n}_pvw`, `PinP & Key ${n} on PVW`))
			for (let n = 1; n <= 2; n++)
				(t(`dsk${n}_source`, `DSK ${n} key source`), t(`dsk${n}_fill`, `DSK ${n} fill source`))
			for (let n = 1; n <= 20; n++) t(`input${n}_assign`, `Input ${n} is given`)
			;(t('hdmi1', 'HDMI Output 1 Source'),
				t('hdmi2', 'HDMI Output 2 Source'),
				t('hdmi3', 'HDMI Output 3 Source'),
				t('sdi1', 'SDI Output 1 Source'),
				t('sdi2', 'SDI Output 2 Source'),
				t('sdi3', 'SDI Output 3 Source'),
				t('usb', 'USB Output Source'))
			for (let n = 1; n <= 3; n++) (t(`aux${n}_mute`, `Aux ${n} mute`), t(`aux${n}link`, `Aux ${n} linked to PGM`))
			;(t('auxlink_mode', 'Aux link mode'), t('freeze', 'Freeze'), t('ftb', 'Output fade (firmware 3.40+)'))
			for (let n = 1; n <= 30; n++) t(`memoryname_${n}`, `Memory ${n} name`)
			;(t('lastmemorynumber', 'Last memory loaded (number)'),
				t('lastmemoryname', 'Last memory loaded (name)'),
				this.setVariableDefinitions(e))
		},
		checkVariables: function () {
			let e = this
			try {
				let t = e.DATA || {},
					n = { model: e.MODEL, version: e.VERSION, protocol: e.PROTOCOL, pgm: I(t.pgmsource), pvw: I(t.pvwsource) }
				for (let s of Fe.SOURCES) n[`tally_${s.id.toLowerCase()}`] = Kn((e.TALLY || {})[s.id] || 0)
				for (let s = 1; s <= 10; s++) n[`tally_xpt${s}`] = n[`tally_input${s}`]
				for (let s = 1; s <= 3; s++)
					((n[`aux${s}`] = I(t[`aux${s}source`])),
						(n[`aux${s}_mute`] = be(t[`aux${s}mute`])),
						(n[`aux${s}link`] = be(t[`aux${s}link`])))
				let o = ['1B', '1C', '1D', '1E']
				for (let s = 1; s <= 4; s++)
					((n[`pnpkey${s}_source`] = I(t[`pnpkey${s}source`])),
						(n[`pnpkey${s}_pgm`] = be(t[`data_${o[s - 1]}00`])),
						(n[`pnpkey${s}_pvw`] = be(t[`data_${o[s - 1]}01`])))
				for (let s = 1; s <= 2; s++)
					((n[`dsk${s}_source`] = I(t[`dsk${s}source`])), (n[`dsk${s}_fill`] = I(t[`dsk${s}fill`])))
				for (let s = 1; s <= 20; s++)
					n[`input${s}_assign`] = Array.isArray(t.inputAssign) ? I(t.inputAssign[s - 1]) : ''
				let i = (s) => (e.CHOICES_OUTPUTSASSIGN.find((a) => a.id == s) || {}).label ?? s
				;((n.hdmi1 = i(t.hdmi1assign)),
					(n.hdmi2 = i(t.hdmi2assign)),
					(n.hdmi3 = i(t.hdmi3assign)),
					(n.sdi1 = i(t.sdi1assign)),
					(n.sdi2 = i(t.sdi2assign)),
					(n.sdi3 = i(t.sdi3assign)),
					(n.usb = i(t.usbassign)),
					(n.auxlink_mode =
						t.auxlinkmode == '00'
							? 'Off'
							: t.auxlinkmode == '01'
								? 'Auto Link'
								: t.auxlinkmode == '02'
									? 'Manual Link'
									: ''),
					(n.freeze = e._freezeValue('freeze') == '01' ? 'On' : 'Off'),
					(n.ftb = String(t.ftb || '')))
				for (let s = 0; s < 30; s++) n[`memoryname_${s + 1}`] = t[`memory${s}`] ?? ''
				;(t.lastMemory !== void 0 &&
					Number.isFinite(t.lastMemory) &&
					((n.lastmemorynumber = t.lastMemory + 1), (n.lastmemoryname = t[`memory${t.lastMemory}`] ?? '')),
					e.setVariableValues(n))
			} catch (t) {
				e.log('error', 'Error setting variables: ' + String(t))
			}
		},
	}
})
var fi = f((Ss, pi) => {
	'use strict'
	var { combineRgb: K } = (R(), F($)),
		Ve = _(),
		D = K(255, 255, 255),
		Un = K(0, 0, 0),
		Z = K(200, 0, 0),
		Le = K(0, 150, 0),
		We = K(85, 0, 170),
		vn = K(200, 120, 0)
	pi.exports = {
		initPresets: function () {
			let e = this,
				t = {},
				n = [],
				o = e.label,
				i = (l, u) => n.push({ id: l, name: u, definitions: [] }),
				s = (l, u, v, me, he = [], $i = [], Ri = Un) => {
					;((t[l] = {
						type: 'simple',
						name: u,
						style: { text: v, size: 'auto', color: D, bgcolor: Ri },
						steps: [{ down: me, up: $i }],
						feedbacks: he,
					}),
						n[n.length - 1].definitions.push(l))
				},
				a = (l, u, v) => ({
					feedbackId: 'sourceOn',
					options: { where: l, source: u },
					style: { bgcolor: v, color: D },
				}),
				r = Ve.SOURCES.filter((l) => l.id.startsWith('INPUT')),
				d = Ve.PHYSICAL_SOURCES,
				p = (l) => l.label.replace('Input ', 'IN ').toUpperCase()
			;(i('transitions', 'Cut and Auto'),
				s('cut', 'Cut', 'CUT', [{ actionId: 'cut', options: { source: '' } }]),
				s('auto', 'Auto', 'AUTO', [{ actionId: 'auto', options: { source: '', time: '' } }]),
				s('auto_1s', 'Auto, 1 second', 'AUTO\\n1s', [{ actionId: 'auto', options: { source: '', time: '1' } }]),
				s('auto_2s', 'Auto, 2 seconds', 'AUTO\\n2s', [{ actionId: 'auto', options: { source: '', time: '2' } }]),
				i('pgm', 'Program: Input 1-20'))
			for (let l of r)
				s(
					`pgm_${l.id}`,
					`Program: ${l.label}`,
					`PGM\\n${p(l)}`,
					[{ actionId: 'select_pgm', options: { source: l.id } }],
					[a('pgm', l.id, Z)],
				)
			i('pvw', 'Preview: Input 1-20')
			for (let l of r)
				s(
					`pvw_${l.id}`,
					`Preview: ${l.label}`,
					`PVW\\n${p(l)}`,
					[{ actionId: 'select_pvw', options: { source: l.id } }],
					[a('pvw', l.id, Le)],
				)
			i('pgm_direct', 'Program: HDMI, SDI and Stills')
			for (let l of d)
				s(
					`pgm_${l.id}`,
					`Program: ${l.label}`,
					`PGM\\n${p(l)}`,
					[{ actionId: 'select_pgm', options: { source: l.id } }],
					[a('pgm', l.id, Z)],
				)
			i('pvw_direct', 'Preview: HDMI, SDI and Stills')
			for (let l of d)
				s(
					`pvw_${l.id}`,
					`Preview: ${l.label}`,
					`PVW\\n${p(l)}`,
					[{ actionId: 'select_pvw', options: { source: l.id } }],
					[a('pvw', l.id, Le)],
				)
			i('cut_to', 'Cut straight to Input 1-20')
			for (let l of r)
				s(
					`cut_${l.id}`,
					`Cut to ${l.label}`,
					`CUT\\n${p(l)}`,
					[{ actionId: 'cut', options: { source: l.id } }],
					[{ feedbackId: 'tally', options: { input: l.id, state: 'program' }, style: { bgcolor: Z, color: D } }],
				)
			for (let l = 1; l <= 3; l++) {
				i(`aux${l}`, `Aux ${l}: Input 1-20`)
				for (let u of r)
					s(
						`aux${l}_${u.id}`,
						`Aux ${l}: ${u.label}`,
						`AUX ${l}\\n${p(u)}`,
						[{ actionId: 'aux_assign', options: { aux: String(l), source: u.id } }],
						[a(`aux${l}`, u.id, We)],
					)
			}
			for (let l = 1; l <= 4; l++) {
				;(i(`pinp${l}`, `PinP & Key ${l}: Input 1-20`),
					s(
						`pinp${l}_pgm`,
						`PinP & Key ${l} on Program (toggle on/off with the switcher state)`,
						`PinP ${l}\\nON AIR`,
						[
							{
								actionId: 'pnpkey_busselect',
								options: { pinp: ['1B', '1C', '1D', '1E'][l - 1], bus: '00', onoff: '01' },
							},
						],
						[
							{
								feedbackId: 'keyOnAir',
								options: { pinp: ['1B', '1C', '1D', '1E'][l - 1], bus: '00', onoff: '01' },
								style: { bgcolor: Z, color: D },
							},
						],
					),
					s(`pinp${l}_pgm_off`, `PinP & Key ${l} off Program`, `PinP ${l}\\nOFF`, [
						{
							actionId: 'pnpkey_busselect',
							options: { pinp: ['1B', '1C', '1D', '1E'][l - 1], bus: '00', onoff: '00' },
						},
					]))
				for (let u of r)
					s(
						`pinp${l}_${u.id}`,
						`PinP & Key ${l}: ${u.label}`,
						`PinP ${l}\\n${p(u)}`,
						[{ actionId: 'pnpkey_setsource', options: { pinp: String(l), source: u.id } }],
						[a(`pinp${l}`, u.id, We)],
					)
			}
			for (let l = 1; l <= 2; l++) {
				;(i(`dsk${l}`, `DSK ${l}: key source Input 1-20`),
					s(`dsk${l}_on`, `DSK ${l} on Program`, `DSK ${l}\\nON AIR`, [
						{ actionId: 'dsk_busselect', options: { dsk: l === 1 ? '1F' : '20', bus: '00', onoff: '01' } },
					]),
					s(`dsk${l}_off`, `DSK ${l} off Program`, `DSK ${l}\\nOFF`, [
						{ actionId: 'dsk_busselect', options: { dsk: l === 1 ? '1F' : '20', bus: '00', onoff: '00' } },
					]))
				for (let u of r)
					s(
						`dsk${l}_${u.id}`,
						`DSK ${l} key: ${u.label}`,
						`DSK ${l}\\n${p(u)}`,
						[{ actionId: 'set_dsk_key_source', options: { dsk: String(l), source: u.id } }],
						[a(`dsk${l}`, u.id, We)],
					)
			}
			i('memories', 'Memories 1-30 (named from the switcher)')
			for (let l = 1; l <= 30; l++)
				s(
					`memory_${l}`,
					`Load memory ${l}`,
					`MEM ${l}\\n$(${o}:memoryname_${l})`,
					[{ actionId: 'load_memory_trigger', options: { memory: l - 1 } }],
					[{ feedbackId: 'memoryLoaded', options: { memory: l }, style: { bgcolor: Le, color: D } }],
				)
			i('macros', 'Macros 1-100')
			for (let l = 1; l <= 100; l++)
				s(`macro_${l}`, `Run macro ${l}`, `MACRO\\n${l}`, [{ actionId: 'run_macro', options: { macro: l } }])
			;(i('freeze_ftb', 'Freeze and output fade'),
				s(
					'freeze_on',
					'Freeze on',
					'FREEZE\\nON',
					[{ actionId: 'freezeSwitchOn', options: {} }],
					[{ feedbackId: 'freeze', options: {}, style: { bgcolor: vn, color: D } }],
				),
				s('freeze_off', 'Freeze off', 'FREEZE\\nOFF', [{ actionId: 'freezeSwitchOff', options: {} }]),
				s(
					'ftb',
					'Output fade (toggle)',
					'FADE\\nTO BLACK',
					[{ actionId: 'ftb', options: { mode: 'toggle' } }],
					[{ feedbackId: 'ftb', options: {}, style: { bgcolor: Z, color: D } }],
				),
				i('cameras', 'Cameras: pick one, then drive it'))
			for (let l of e.CHOICES_CAMERAS) {
				let u = l.label.replace('Camera ', '')
				s(`cam_select_${u}`, `Select ${l.label}`, `CAM ${u}`, [{ actionId: 'selectCamera', options: { camera: l.id } }])
			}
			let Oi = [
				['pan_left', 'Pan left', '\u25C0', 'cameraPanLeft', 'cameraPanStop'],
				['pan_right', 'Pan right', '\u25B6', 'cameraPanRight', 'cameraPanStop'],
				['tilt_up', 'Tilt up', '\u25B2', 'cameraTiltUp', 'cameraTiltStop'],
				['tilt_down', 'Tilt down', '\u25BC', 'cameraTiltDown', 'cameraTiltStop'],
				['zoom_in', 'Zoom in', 'ZOOM\\nIN', 'cameraZoomInSlow', 'cameraZoomStop'],
				['zoom_out', 'Zoom out', 'ZOOM\\nOUT', 'cameraZoomOutSlow', 'cameraZoomStop'],
			]
			for (let [l, u, v, me, he] of Oi)
				s(
					`cam_${l}`,
					`Selected camera: ${u} (hold)`,
					v,
					[{ actionId: me, options: { useSelected: !0, camera: '41' } }],
					[],
					[{ actionId: he, options: { useSelected: !0, camera: '41' } }],
				)
			for (let l = 1; l <= 10; l++)
				s(`cam_preset_${l}`, `Selected camera: recall preset ${l}`, `PRESET\\n${l}`, [
					{ actionId: 'cameraCurrentPreset', options: { useSelected: !0, camera: '41', preset: Ve.hexOf(l - 1) } },
				])
			e.setPresetDefinitions(n, t)
		},
	}
})
var hi = f((Ps, mi) => {
	'use strict'
	var bi = ['Enter password:', 'Welcome to V-160HD.']
	function Fn(e) {
		let t = [],
			n = 0
		for (; n < e.length;) {
			let o = { idx: 1 / 0, delimLen: 0, isAuth: !1, authStr: '' },
				i = e.indexOf(';', n)
			i !== -1 && i < o.idx && (o = { idx: i, delimLen: 1, isAuth: !1, authStr: '' })
			let s = e.indexOf(
				`
`,
				n,
			)
			s !== -1 && s < o.idx && (o = { idx: s, delimLen: 1, isAuth: !1, authStr: '' })
			for (let a of bi) {
				let r = e.indexOf(a, n)
				r !== -1 && r < o.idx && (o = { idx: r, delimLen: a.length, isAuth: !0, authStr: a })
			}
			if (o.idx === 1 / 0) break
			if (o.isAuth) t.push(o.authStr)
			else {
				let a = e.slice(n, o.idx).trim()
				a && t.push(a)
			}
			n = o.idx + o.delimLen
		}
		return { messages: t, remaining: e.slice(n) }
	}
	mi.exports = { extractMessages: Fn, AUTH_PROMPTS: bi }
})
var yi = f((As, gi) => {
	'use strict'
	var Vn = { HIGH: 0, LOW: 1 },
		ze = class {
			constructor(t) {
				;((this._send = t.send),
					(this._log = t.log || (() => {})),
					(this.timeoutMs = t.timeoutMs ?? 500),
					(this.gapMs = t.gapMs ?? 20),
					(this.retries = t.retries ?? 1),
					(this.silenceLimit = t.silenceLimit ?? 5),
					(this._onSilence = t.onSilence || (() => {})),
					(this._onAlive = t.onAlive || (() => {})),
					(this._timers = t.timers || { setTimeout, clearTimeout }),
					(this._high = []),
					(this._low = []),
					(this._inFlight = null),
					(this._timer = null),
					(this._gapTimer = null),
					(this._missed = 0),
					(this._silent = !1),
					(this._generation = 0))
			}
			enqueue(t) {
				let n = { repeatable: !0, ...t, attempts: 0 }
				if (n.kind === 'read') {
					let o = n.key || n.cmd
					if (
						((n.key = o),
						this._low.some((i) => i.key === o) ||
							(this._inFlight && this._inFlight.kind === 'read' && this._inFlight.key === o))
					)
						return !1
					this._low.push(n)
				} else this._high.push(n)
				return (this._pump(), !0)
			}
			readsWaiting() {
				return this._low.length + (this._inFlight && this._inFlight.kind === 'read' ? 1 : 0)
			}
			size() {
				return this._high.length + this._low.length + (this._inFlight ? 1 : 0)
			}
			get silent() {
				return this._silent
			}
			handleMessage(t) {
				let n = String(t).trim()
				if (n === '') return !1
				;((this._missed = 0), this._silent && ((this._silent = !1), this._onAlive()))
				let o = this._inFlight
				if (!o) return !1
				if (/^ack$/i.test(n)) return (this._complete(), !0)
				let i = /^ERR:?\s*(\w+)?/i.exec(n)
				if (i) {
					let s = i[1] ?? '?'
					this._complete()
					try {
						o.onError && o.onError(s, o)
					} catch (a) {
						this._log('warn', `Error handler failed: ${a}`)
					}
					return !0
				}
				return o.match && o.match(n) ? (this._complete(), !0) : !1
			}
			clear() {
				;(this._generation++,
					(this._high = []),
					(this._low = []),
					(this._inFlight = null),
					(this._missed = 0),
					(this._silent = !1),
					this._timer && this._timers.clearTimeout(this._timer),
					this._gapTimer && this._timers.clearTimeout(this._gapTimer),
					(this._timer = null),
					(this._gapTimer = null))
			}
			_complete() {
				;(this._timer && this._timers.clearTimeout(this._timer),
					(this._timer = null),
					(this._inFlight = null),
					this._afterGap())
			}
			_afterGap() {
				if (this._gapTimer) return
				let t = this._generation
				this._gapTimer = this._timers.setTimeout(() => {
					;((this._gapTimer = null), t === this._generation && this._pump())
				}, this.gapMs)
			}
			_pump() {
				if (this._inFlight || this._gapTimer) return
				let t = this._high.shift() || this._low.shift()
				t && this._transmit(t)
			}
			_transmit(t) {
				;((this._inFlight = t), t.attempts++)
				let n = !0
				try {
					n = this._send(t.cmd) !== !1
				} catch (i) {
					;((n = !1), this._log('warn', `Send failed: ${i}`))
				}
				if (!n) {
					;((this._inFlight = null), this._afterGap())
					return
				}
				let o = this._generation
				this._timer = this._timers.setTimeout(() => {
					;((this._timer = null), !(o !== this._generation || this._inFlight !== t) && this._timedOut(t))
				}, this.timeoutMs)
			}
			_timedOut(t) {
				;((this._inFlight = null),
					this._missed++,
					t.kind === 'write' && t.repeatable && t.attempts <= this.retries
						? (this._log('debug', `No answer to ${t.cmd.trim()}, sending it again`), this._high.unshift(t))
						: t.kind === 'write' &&
							this._log('warn', `The switcher didn't answer ${t.cmd.trim()}, so it may not have happened`),
					this._missed >= this.silenceLimit && !this._silent && ((this._silent = !0), this._onSilence()),
					this._afterGap())
			}
		}
	gi.exports = { CommandQueue: ze, PRIORITY: Vn }
})
var ki = f((Cs, Ci) => {
	'use strict'
	var Si = [3, 40]
	function Pi(e) {
		let t = /(\d+)\.(\d+)/.exec(String(e ?? ''))
		if (t) return [Number(t[1]), Number(t[2])]
	}
	function Ai(e, t) {
		let n = Pi(e)
		return n ? n[0] > t[0] || (n[0] === t[0] && n[1] >= t[1]) : !1
	}
	function Ln(e, t) {
		return e === 'named' ? 'named' : e === 'lowlevel' ? 'lowlevel' : Ai(t, Si) ? 'named' : 'lowlevel'
	}
	function Wn(e) {
		let t = /^([A-Z]{2,6})(?::(.*))?$/i.exec(String(e).trim())
		if (!t) return
		let n = t[1].toUpperCase()
		if (n === 'ACK' || n === 'ERR' || n === 'DTH' || n === 'RQH') return
		let o = t[2] === void 0 || t[2] === '' ? [] : t[2].split(',').map((i) => i.trim())
		return { name: n, args: o }
	}
	function zn(e) {
		switch (String(e)) {
			case '0':
				return "it didn't understand it (syntax error)"
			case '4':
				return 'another setting on the switcher is in charge of that right now, so it had no effect'
			case '5':
				return 'that value is out of range for this switcher or its firmware'
			case '6':
				return 'it was missing its start character (RS-232 only)'
			default:
				return `error ${e}`
		}
	}
	Ci.exports = { NAMED_FROM: Si, parseVersion: Pi, versionAtLeast: Ai, choose: Ln, parseNamed: Wn, errorText: zn }
})
var wi = f((ks, _i) => {
	var { InstanceStatus: P, TCPHelper: Gn } = (R(), F($)),
		{ extractMessages: qn } = hi(),
		{ CommandQueue: Yn } = yi(),
		Ge = ki(),
		j = _(),
		Qn = 2e3
	function U(e, t, n, o) {
		let i = String(e ?? '').trim()
		if (!/^\d+$/.test(i)) return o
		let s = Number(i)
		return s >= t && s <= n ? s : o
	}
	_i.exports = {
		_settings: function () {
			let e = this.config || {}
			return {
				port: U(e.port, 1, 65535, 8023),
				pollMs: U(e.pollingrate, 100, 3e4, 500),
				timeoutMs: U(e.timeout, 50, 5e3, 500),
				gapMs: U(e.gap, 0, 1e3, 20),
				retries: U(e.retries, 0, 5, 1),
				silenceLimit: U(e.silence, 1, 100, 5),
			}
		},
		initConnection: function () {
			let e = this
			;(e._stopPolling(), e._queue && e._queue.clear())
			let t = e._settings()
			if (
				((e._queue = new Yn({
					send: function (o) {
						return e.socket === void 0 || !e.socket.isConnected
							? (e.logVerbose('Not sent (not connected): ' + o.trim()), !1)
							: (e.logVerbose('Sending: ' + o.trim()),
								e.socket.send(
									o.endsWith(`
`)
										? o
										: o +
												`
`,
								))
					},
					log: function (o, i) {
						o === 'debug' ? e.logVerbose(i) : e.log(o, i)
					},
					timeoutMs: t.timeoutMs,
					gapMs: t.gapMs,
					retries: t.retries,
					silenceLimit: t.silenceLimit,
					onSilence: function () {
						;(e.log(
							'warn',
							`The switcher has stopped answering (${t.silenceLimit} commands in a row), so polling is having a breather until it says something again.`,
						),
							e.updateStatus(P.UnknownWarning, 'Not answering'))
					},
					onAlive: function () {
						;(e.log('info', 'The switcher is answering again. Back to business.'), e.updateStatus(P.Ok))
					},
				})),
				e._clearAllFreezePending(),
				e.checkFeedbacks('freeze'),
				e.socket !== void 0 && (e.socket.destroy(), delete e.socket),
				(e.PROTOCOL = 'lowlevel'),
				(e.VERSION = ''),
				!e.config.host)
			) {
				e.updateStatus(P.BadConfig, 'No IP address yet')
				return
			}
			;(e.log('info', `Opening connection to ${e.config.host}:${t.port}`),
				(e.tcpBuffer = ''),
				e.updateStatus(P.Connecting))
			let n = new Gn(e.config.host, t.port, { reconnect: !0, reconnect_interval: 5e3 })
			;((e.socket = n),
				n.on('error', function (o) {
					n === e.socket && (e._stopPolling(), e.handleError(o))
				}),
				n.on('connect', function () {
					n === e.socket &&
						((e.tcpBuffer = ''),
						e._queue.clear(),
						(e.memoryNameIndex = 0),
						(e._memoryNamesDone = !1),
						(e._passwordSent = !1),
						(e._authenticated = !1),
						e._clearAllFreezePending(),
						e.checkFeedbacks('freeze'),
						e.log('info', 'Connected. Saying the password.'),
						e.updateStatus(P.Connecting, 'Authenticating'))
				}),
				n.on('data', function (o) {
					if (n !== e.socket) return
					e.tcpBuffer += o.toString('utf8')
					let { messages: i, remaining: s } = qn(e.tcpBuffer)
					e.tcpBuffer = s
					for (let a of i) e.updateData(a)
				}),
				n.on('end', function () {
					n === e.socket &&
						(e._stopPolling(),
						e.log('warn', 'The switcher closed the connection. Trying again in 5 seconds.'),
						e.updateStatus(P.ConnectionFailure, 'Connection closed'))
				}))
		},
		handleError: function (e) {
			let t = this,
				n = e && typeof e == 'object' ? e.code : void 0,
				o
			;(n === 'ECONNREFUSED'
				? ((o =
						'The switcher refused the connection. Right IP address? Is LAN control on, with a password set? (Only one LAN controller at a time: RCS over LAN counts.)'),
					t.updateStatus(P.ConnectionFailure, 'Connection refused'))
				: n === 'ETIMEDOUT' || n === 'EHOSTUNREACH'
					? ((o = "Can't reach the switcher. Right IP address? Is it switched on and on the network?"),
						t.updateStatus(P.ConnectionFailure, 'Unreachable'))
					: n === 'ECONNRESET'
						? ((o = 'The connection was reset. Trying again shortly.'),
							t.updateStatus(P.ConnectionFailure, 'Connection reset'))
						: ((o = 'Connection problem: ' + (e && e.message ? e.message : String(e))),
							t.updateStatus(P.ConnectionFailure, 'Connection error')),
				t.log('error', o))
		},
		_onAuthenticated: function () {
			let e = this
			;((e._authenticated = !0),
				e.updateStatus(P.Ok),
				e.log('info', "In! Asking the switcher what it's running."),
				e._queue.enqueue({
					cmd: 'VER;',
					kind: 'read',
					key: 'VER',
					match: (t) => /^VER:/i.test(t),
					onError: () => e._protocolChosen(),
				}),
				clearTimeout(e._verTimer),
				(e._verTimer = setTimeout(() => {
					e._protocolDecided || e._protocolChosen()
				}, 3e3)),
				(e._protocolDecided = !1))
		},
		_protocolChosen: function () {
			let e = this
			e._protocolDecided ||
				((e._protocolDecided = !0),
				clearTimeout(e._verTimer),
				(e.PROTOCOL = Ge.choose(e.config.protocol, e.VERSION)),
				e.log(
					'info',
					e.PROTOCOL === 'named'
						? `Firmware ${e.VERSION || '?'}: using Roland's named commands (Input 1-20 everywhere).`
						: `Firmware ${e.VERSION || '?'}: using the low-level address commands.` +
								(e.config.protocol === 'lowlevel' ? '' : ' Firmware 3.40 or later unlocks the named commands.'),
				),
				e.checkVariables(),
				e.subscribeToTally(),
				e.getFreezeData(),
				e.startInterval())
		},
		_stopPolling: function () {
			;(this.INTERVAL && clearInterval(this.INTERVAL), (this.INTERVAL = void 0))
		},
		startInterval: function () {
			let e = this
			if ((e._stopPolling(), (e._pollTick = 0), e._readMemoryNames(), !e.config.polling)) {
				e.log(
					'info',
					"Polling's off, so feedbacks only follow what this module does and what the switcher shouts about (tally).",
				)
				return
			}
			let t = e._settings().pollMs
			;(e.log('info', `Polling every ${t} ms.`), e._doPoll(!0), (e.INTERVAL = setInterval(() => e._doPoll(!1), t)))
		},
		_doPoll: function (e) {
			let t = this
			if (!(!t._queue || t._queue.silent) && !(!e && t._queue.readsWaiting() > 0)) {
				if (((t._pollTick = (t._pollTick || 0) + 1), t.PROTOCOL === 'named')) {
					;(t._read('TLY;', 'TLY'), t._read('QPGM;', 'PGM'), t._read('QPST;', 'PST'))
					for (let n = 1; n <= 3; n++) t._read(`QAUX:AUX${n};`, 'AUX')
				} else t.getAuxSources()
				;(t.getPinpKeyTally(),
					(e || t._pollTick % 2 === 0) && (t.getAuxMutes(), t.getVideoAssign()),
					(e || t._pollTick % 10 === 0) &&
						(t.getPinpKeySource(),
						t.getDskSource(),
						t.getFreezeData(),
						t.getOutputData(),
						t.getAuxLinkData(),
						t.getTransitionData(),
						t.getMonitorData(),
						t.getLastMemoryLoaded()))
			}
		},
		_read: function (e, t) {
			let n = this
			if (!n._queue) return
			let o = !/^RQH:/i.test(e),
				i
			if (!o) {
				let s = e.slice(4, 10).toUpperCase()
				i = (a) => a.toUpperCase().startsWith('DTH:' + s)
			}
			n._queue.enqueue({ cmd: e, kind: 'read', key: e, match: i, repeatable: !0 })
		},
		_parseHexBlock: function (e, t) {
			if (e.length !== t * 2 || !/^[0-9A-Fa-f]+$/.test(e)) return null
			let n = []
			for (let o = 0; o < t; o++) n.push(e.slice(o * 2, o * 2 + 2).toUpperCase())
			return n
		},
		getPinpKeyTally: function () {
			;(this.sendRawCommand('RQH:001B00,000002;'),
				this.sendRawCommand('RQH:001C00,000002;'),
				this.sendRawCommand('RQH:001D00,000002;'),
				this.sendRawCommand('RQH:001E00,000002;'))
		},
		getPinpKeySource: function () {
			if (this.PROTOCOL === 'named') {
				for (let e = 1; e <= 4; e++) this._read(`QPIS:PinP${e};`, 'PIS')
				return
			}
			;(this.sendRawCommand('RQH:001B02,000001;'),
				this.sendRawCommand('RQH:001C02,000001;'),
				this.sendRawCommand('RQH:001D02,000001;'),
				this.sendRawCommand('RQH:001E02,000001;'))
		},
		getDskSource: function () {
			if (this.PROTOCOL === 'named') {
				for (let e = 1; e <= 2; e++) this._read(`QDSS:DSK${e};`, 'DSS')
				return
			}
			;(this.sendRawCommand('RQH:001F03,000002;'), this.sendRawCommand('RQH:002003,000002;'))
		},
		getAuxSources: function () {
			;(this.sendRawCommand('RQH:002100,000002;'),
				this.sendRawCommand('RQH:000011,000001;'),
				this.sendRawCommand('RQH:00002E,000002;'))
		},
		getAuxMutes: function () {
			;(this.sendRawCommand('RQH:012203,000001;'),
				this.sendRawCommand('RQH:012503,000001;'),
				this.sendRawCommand('RQH:012603,000001;'))
		},
		getFreezeData: function () {
			this.sendRawCommand('RQH:020500,000012;')
		},
		getOutputData: function () {
			this.sendRawCommand('RQH:00000A,000007;')
		},
		getAuxLinkData: function () {
			;(this.sendRawCommand('RQH:02010D,000001;'), this.sendRawCommand('RQH:020154,000003;'))
		},
		getVideoAssign: function () {
			;(this.sendRawCommand('RQH:000000,00000A;'), this.sendRawCommand('RQH:000024,00000A;'))
		},
		getTransitionData: function () {
			this.sendRawCommand('RQH:001800,000004;')
		},
		getMonitorData: function () {
			this.sendRawCommand('RQH:020116,000004;')
		},
		getLastMemoryLoaded: function () {
			this.sendRawCommand('RQH:0A0003,000001;')
		},
		_readMemoryNames: function () {
			let e = this
			if (!e._memoryNamesDone) {
				e._memoryNamesDone = !0
				for (let t = 0; t < 30; t++) {
					let n = j.hexOf(t)
					e.sendRawCommand('RQH:60' + n + '00,000008;')
				}
			}
		},
		subscribeToTally: function () {
			this.sendCommand('0C0100', '01')
		},
		_resolveInputToPhysical: function (e) {
			let t = parseInt(e, 16)
			if (t >= 32 && t <= 51 && Array.isArray(this.DATA.inputAssign)) {
				let n = this.DATA.inputAssign[t - 32]
				if (n !== void 0) return n
			}
			return String(e).toUpperCase()
		},
		_freezeValue: function (e) {
			let t = this._freezePending && this._freezePending[e]
			return t !== void 0 ? t.value : this.DATA[e]
		},
		_setFreezePending: function (e, t, n) {
			let o = this
			;(o._freezePending || (o._freezePending = {}), o._freezePending[e] && clearTimeout(o._freezePending[e].timer))
			let i = { value: t, timer: null }
			;((i.timer = setTimeout(function () {
				o._freezePending[e] === i && (delete o._freezePending[e], n && n())
			}, Qn)),
				(o._freezePending[e] = i))
		},
		_clearFreezePending: function (e) {
			this._freezePending &&
				this._freezePending[e] &&
				(clearTimeout(this._freezePending[e].timer), delete this._freezePending[e])
		},
		_clearAllFreezePending: function () {
			if (this._freezePending) {
				for (let e in this._freezePending) clearTimeout(this._freezePending[e].timer)
				this._freezePending = {}
			}
		},
		updateData: function (e) {
			let t = this,
				n = String(e).trim()
			if (n !== '') {
				if ((t.logVerbose('Received: ' + n), n === 'Enter password:')) {
					if (!t._passwordSent) {
						t._passwordSent = !0
						let o = String(t.config.password ?? '')
						;(o === '' && t.log('warn', "The switcher wants a password and there isn't one on the connection page."),
							t.socket.send(
								o +
									`
`,
							))
					}
					return
				}
				if (n === 'Welcome to V-160HD.') {
					t._onAuthenticated()
					return
				}
				t._queue && t._queue.handleMessage(n)
				try {
					if (/^ACK$/i.test(n) || /^ERR/i.test(n)) return
					let o = !1,
						i = t._recording ? t._recordSnapshot() : void 0
					if (/^DTH:/i.test(n)) {
						let s = n.slice(4),
							[a, r] = s.split(',')
						a &&
							a.length === 6 &&
							r !== void 0 &&
							(t._handleDTH(
								a.slice(0, 2).toUpperCase(),
								a.slice(2, 4).toUpperCase(),
								a.slice(4, 6).toUpperCase(),
								r.trim().toUpperCase(),
							),
							(o = !0))
					} else o = t._handleNamed(n)
					o && (t.checkAllFeedbacks(), t.checkVariables(), i && t._recordChanges(i))
				} catch (o) {
					t.log('error', `Couldn't make sense of "${n}": ${o}`)
				}
			}
		},
		_recordSnapshot: function () {
			let e = this.DATA,
				t = { pgm: e.pgmsource, pvw: e.pvwsource }
			for (let n = 1; n <= 3; n++) t[`aux${n}`] = e[`aux${n}source`]
			for (let n = 1; n <= 4; n++) t[`pinp${n}`] = e[`pnpkey${n}source`]
			for (let n = 1; n <= 2; n++) t[`dsk${n}`] = e[`dsk${n}source`]
			return t
		},
		_recordChanges: function (e) {
			let t = this
			if (typeof t.recordAction != 'function') return
			let n = t._recordSnapshot()
			for (let o of Object.keys(n)) {
				if (n[o] === void 0 || n[o] === e[o]) continue
				let i = j.sourceFromHex(n[o])
				if (!i) continue
				let s
				;(o === 'pgm'
					? (s = { actionId: 'select_pgm', options: { source: i.id } })
					: o === 'pvw'
						? (s = { actionId: 'select_pvw', options: { source: i.id } })
						: o.startsWith('aux')
							? (s = { actionId: 'aux_assign', options: { aux: o.slice(3), source: i.id } })
							: o.startsWith('pinp')
								? (s = { actionId: 'pnpkey_setsource', options: { pinp: o.slice(4), source: i.id } })
								: o.startsWith('dsk') &&
									(s = { actionId: 'set_dsk_key_source', options: { dsk: o.slice(3), source: i.id } }),
					s && t.recordAction(s, o))
			}
		},
		_handleNamed: function (e) {
			let t = this,
				n = Ge.parseNamed(e)
			if (!n) return !1
			let { name: o, args: i } = n,
				s = (r) => {
					let d = j.sourceFromToken(r)
					return d ? d.hex : void 0
				},
				a = (r, d) => s(d) ?? s(r)
			switch (o) {
				case 'VER':
					return ((t.MODEL = i[0] || t.MODEL), (t.VERSION = i[1] || ''), t._protocolChosen(), !0)
				case 'PGM': {
					let r = a(i[0], i[1])
					return (r !== void 0 && (t.DATA.pgmsource = r), !0)
				}
				case 'PST': {
					let r = a(i[0], i[1])
					return (r !== void 0 && (t.DATA.pvwsource = r), !0)
				}
				case 'AUX': {
					let r = /^AUX(\d)$/i.exec(i[0] || '')
					if (!r) return !1
					let d = a(i[1], i[2])
					return (d !== void 0 && (t.DATA[`aux${r[1]}source`] = d), !0)
				}
				case 'PIS': {
					let r = /^PINP(\d)$/i.exec(i[0] || '')
					if (!r) return !1
					let d = a(i[1], i[2])
					return (d !== void 0 && (t.DATA[`pnpkey${r[1]}source`] = d), !0)
				}
				case 'DSS': {
					let r = /^DSK(\d)$/i.exec(i[0] || '')
					if (!r) return !1
					let d = a(i[1], i[2])
					return (d !== void 0 && (t.DATA[`dsk${r[1]}source`] = d), !0)
				}
				case 'TLY':
					return (i.forEach((r, d) => t._setTally(d, Number(r))), !0)
				case 'MEM': {
					let r = /^MEMORY(\d+)$/i.exec(i[0] || '')
					return ((t.DATA.lastMemory = r ? Number(r[1]) - 1 : void 0), !0)
				}
				case 'FRZ':
					return ((t.DATA.freeze = /^ON$/i.test(i[0]) ? '01' : '00'), t._clearFreezePending('freeze'), !0)
				case 'FTB':
					return ((t.DATA.ftb = String(i[0] || '').toUpperCase()), !0)
			}
			return !1
		},
		_setTally: function (e, t) {
			if (!Number.isFinite(t)) return
			this.TALLY || (this.TALLY = {})
			let n = j.sourceFromHex(j.hexOf(e))
			n && (this.TALLY[n.id] = t)
		},
		_handleDTH: function (e, t, n, o) {
			let i = this
			if (
				(e == '0C' &&
					t == '00' &&
					n == '00' &&
					(i._parseHexBlock(o, o.length / 2) || []).forEach((a, r) => i._setTally(r, parseInt(a, 16))),
				e == '00')
			)
				if (t == '00' && n == '11') (i.logVerbose('Received Aux 1 Source: ' + o), (i.DATA.aux1source = o))
				else if (t == '00' && n == '2E') {
					let s = i._parseHexBlock(o, 2)
					s
						? ((i.DATA.aux2source = s[0]), (i.DATA.aux3source = s[1]), i.logVerbose('Received Aux 2+3 Source: ' + o))
						: i._parseHexBlock(o, 1)
							? ((i.DATA.aux2source = o), i.logVerbose('Received Aux 2 Source: ' + o))
							: i.log('warn', 'Unexpected DTH value at 00002E: ' + o)
				} else if (t == '00' && n == '2F') (i.logVerbose('Received Aux 3 Source: ' + o), (i.DATA.aux3source = o))
				else if (t == '1B' && n == '00') {
					let s = i._parseHexBlock(o, 2)
					s
						? ((i.DATA.data_1B00 = s[0]), (i.DATA.data_1B01 = s[1]), i.logVerbose('Received PnP/Key 1 PGM+PVW: ' + o))
						: i._parseHexBlock(o, 1)
							? (i.DATA.data_1B00 = o)
							: i.log('warn', 'Unexpected DTH value at 001B00: ' + o)
				} else if (t == '1C' && n == '00') {
					let s = i._parseHexBlock(o, 2)
					s
						? ((i.DATA.data_1C00 = s[0]), (i.DATA.data_1C01 = s[1]), i.logVerbose('Received PnP/Key 2 PGM+PVW: ' + o))
						: i._parseHexBlock(o, 1)
							? (i.DATA.data_1C00 = o)
							: i.log('warn', 'Unexpected DTH value at 001C00: ' + o)
				} else if (t == '1D' && n == '00') {
					let s = i._parseHexBlock(o, 2)
					s
						? ((i.DATA.data_1D00 = s[0]), (i.DATA.data_1D01 = s[1]), i.logVerbose('Received PnP/Key 3 PGM+PVW: ' + o))
						: i._parseHexBlock(o, 1)
							? (i.DATA.data_1D00 = o)
							: i.log('warn', 'Unexpected DTH value at 001D00: ' + o)
				} else if (t == '1E' && n == '00') {
					let s = i._parseHexBlock(o, 2)
					s
						? ((i.DATA.data_1E00 = s[0]), (i.DATA.data_1E01 = s[1]), i.logVerbose('Received PnP/Key 4 PGM+PVW: ' + o))
						: i._parseHexBlock(o, 1)
							? (i.DATA.data_1E00 = o)
							: i.log('warn', 'Unexpected DTH value at 001E00: ' + o)
				} else if (t == '1B' && n == '02') ((i.DATA.pnpkey1source = o), i.logVerbose('Received PnP/Key 1 Source: ' + o))
				else if (t == '1C' && n == '02') ((i.DATA.pnpkey2source = o), i.logVerbose('Received PnP/Key 2 Source: ' + o))
				else if (t == '1D' && n == '02') ((i.DATA.pnpkey3source = o), i.logVerbose('Received PnP/Key 3 Source: ' + o))
				else if (t == '1E' && n == '02') ((i.DATA.pnpkey4source = o), i.logVerbose('Received PnP/Key 4 Source: ' + o))
				else if (t == '00') {
					let s = parseInt(n, 16)
					if (s >= 0 && s <= 9)
						if (s === 0) {
							let a = i._parseHexBlock(o, 10)
							if (a) {
								Array.isArray(i.DATA.inputAssign) || (i.DATA.inputAssign = new Array(20).fill(void 0))
								for (let r = 0; r < 10; r++) i.DATA.inputAssign[r] = a[r]
								i.logVerbose('Received INPUT 1\u201310 Video Assign: ' + o)
							} else
								i._parseHexBlock(o, 1)
									? (Array.isArray(i.DATA.inputAssign) || (i.DATA.inputAssign = new Array(20).fill(void 0)),
										(i.DATA.inputAssign[0] = o.toUpperCase()),
										i.logVerbose('Received INPUT 1 Video Assign: ' + o))
									: i.log('warn', 'Unexpected DTH value at 000000: ' + o)
						} else
							i._parseHexBlock(o, 1)
								? (Array.isArray(i.DATA.inputAssign) || (i.DATA.inputAssign = new Array(20).fill(void 0)),
									(i.DATA.inputAssign[s] = o.toUpperCase()),
									i.logVerbose('Received INPUT ' + (s + 1) + ' Video Assign: ' + o))
								: i.log('warn', 'Unexpected DTH value at 0000' + n.toUpperCase() + ': ' + o)
					else if (s >= 36 && s <= 45) {
						let a = s - 36
						if (s === 36) {
							let r = i._parseHexBlock(o, 10)
							if (r) {
								Array.isArray(i.DATA.inputAssign) || (i.DATA.inputAssign = new Array(20).fill(void 0))
								for (let d = 0; d < 10; d++) i.DATA.inputAssign[10 + d] = r[d]
								i.logVerbose('Received INPUT 11\u201320 Video Assign: ' + o)
							} else
								i._parseHexBlock(o, 1)
									? (Array.isArray(i.DATA.inputAssign) || (i.DATA.inputAssign = new Array(20).fill(void 0)),
										(i.DATA.inputAssign[10] = o.toUpperCase()),
										i.logVerbose('Received INPUT 11 Video Assign: ' + o))
									: i.log('warn', 'Unexpected DTH value at 000024: ' + o)
						} else
							i._parseHexBlock(o, 1)
								? (Array.isArray(i.DATA.inputAssign) || (i.DATA.inputAssign = new Array(20).fill(void 0)),
									(i.DATA.inputAssign[10 + a] = o.toUpperCase()),
									i.logVerbose('Received INPUT ' + (11 + a) + ' Video Assign: ' + o))
								: i.log('warn', 'Unexpected DTH value at 0000' + n.toUpperCase() + ': ' + o)
					} else ((i.DATA[`data_${e}${t}${n}`] = o), (i.DATA[`data_${t}${n}`] = o))
				} else if ((t == '1F' || t == '20') && (n == '03' || n == '04')) {
					let s = t == '1F' ? 1 : 2,
						a = i._parseHexBlock(o, 2)
					n == '03' && a
						? ((i.DATA[`dsk${s}source`] = a[0]), (i.DATA[`dsk${s}fill`] = a[1]))
						: n == '03'
							? (i.DATA[`dsk${s}source`] = o)
							: (i.DATA[`dsk${s}fill`] = o)
				} else if (t == '21')
					if (n == '00') {
						let s = i._parseHexBlock(o, 2)
						s
							? ((i.DATA.pgmsource = s[0]),
								(i.DATA.pvwsource = s[1]),
								i.logVerbose('Received PGM source: ' + s[0] + ', PVW source: ' + s[1]))
							: i._parseHexBlock(o, 1)
								? ((i.DATA.pgmsource = o.toUpperCase()), i.logVerbose('Received PGM source: ' + o))
								: i.log('warn', 'Unexpected value for PGM/PVW source block: ' + o)
					} else
						n == '01' &&
							(i._parseHexBlock(o, 1)
								? ((i.DATA.pvwsource = o.toUpperCase()), i.logVerbose('Received PVW source: ' + o))
								: i.log('warn', 'Unexpected value for PVW source: ' + o))
				else if (t == '18')
					if (n == '00') {
						let s = i._parseHexBlock(o, 4)
						s
							? ((i.DATA.transitiontype = parseInt(s[0], 16)),
								(i.DATA.mixtype = parseInt(s[1], 16)),
								(i.DATA.wipetype = parseInt(s[2], 16)),
								(i.DATA.wipedirection = parseInt(s[3], 16)),
								i.logVerbose(
									'Received transition block: type=' +
										i.DATA.transitiontype +
										' mix=' +
										i.DATA.mixtype +
										' wipe=' +
										i.DATA.wipetype +
										' dir=' +
										i.DATA.wipedirection,
								))
							: i._parseHexBlock(o, 1)
								? ((i.DATA.transitiontype = parseInt(o, 16)), i.logVerbose('Received Transition Type: ' + o))
								: i.log('warn', 'Unexpected value for transition data block: ' + o)
					} else
						n == '01'
							? i._parseHexBlock(o, 1)
								? ((i.DATA.mixtype = parseInt(o, 16)), i.logVerbose('Received Mix Type: ' + o))
								: i.log('warn', 'Unexpected value for mix type: ' + o)
							: n == '02'
								? i._parseHexBlock(o, 1)
									? ((i.DATA.wipetype = parseInt(o, 16)), i.logVerbose('Received Wipe Type: ' + o))
									: i.log('warn', 'Unexpected value for wipe type: ' + o)
								: n == '03' &&
									(i._parseHexBlock(o, 1)
										? ((i.DATA.wipedirection = parseInt(o, 16)), i.logVerbose('Received Wipe Direction: ' + o))
										: i.log('warn', 'Unexpected value for wipe direction: ' + o))
				else ((i.DATA[`data_${e}${t}${n}`] = o), (i.DATA[`data_${t}${n}`] = o))
			if (e == '02' && t == '05')
				if (n == '00') {
					let s = i._parseHexBlock(o, 18)
					if (s) {
						;((i.DATA.freeze = s[0]), i._clearFreezePending('freeze'), (i.DATA.freeze_type = s[1]))
						for (let a = 2; a < s.length; a++) {
							let r = a.toString(16).padStart(2, '0').toUpperCase()
							i.DATA[`freeze_select_${r}`] = s[a]
						}
						i.logVerbose('Received freeze block: ' + o)
					} else
						i._parseHexBlock(o, 1)
							? ((i.DATA.freeze = o), i._clearFreezePending('freeze'), i.logVerbose('Received Freeze State: ' + o))
							: i.log('warn', 'Unexpected value for freeze state: ' + o)
				} else if (n == '01')
					i._parseHexBlock(o, 1)
						? ((i.DATA.freeze_type = o), i.logVerbose('Received Freeze Type: ' + o))
						: i.log('warn', 'Unexpected value for freeze type: ' + o)
				else {
					let s = parseInt(n, 16)
					s >= 2 &&
						s <= 17 &&
						(i._parseHexBlock(o, 1)
							? ((i.DATA[`freeze_select_${n.toUpperCase()}`] = o),
								i.logVerbose('Received Freeze Select ' + n + ': ' + o))
							: i.log('warn', 'Unexpected value for freeze select ' + n + ': ' + o))
				}
			if (
				(e == '01' && t == '22' && n == '03' && ((i.DATA.aux1mute = o), i.logVerbose('Received Aux 1 Mute: ' + o)),
				e == '01' && t == '25' && n == '03' && ((i.DATA.aux2mute = o), i.logVerbose('Received Aux 2 Mute: ' + o)),
				e == '01' && t == '26' && n == '03' && ((i.DATA.aux3mute = o), i.logVerbose('Received Aux 3 Mute: ' + o)),
				e == '00' && t == '00' && n == '0A')
			) {
				let s = i._parseHexBlock(o, 7)
				s
					? ((i.DATA.hdmi1assign = s[0]),
						(i.DATA.hdmi2assign = s[1]),
						(i.DATA.hdmi3assign = s[2]),
						(i.DATA.sdi1assign = s[3]),
						(i.DATA.sdi2assign = s[4]),
						(i.DATA.sdi3assign = s[5]),
						(i.DATA.usbassign = s[6]),
						i.logVerbose('Received HDMI1-3+SDI1-3+USB Output Assign: ' + o))
					: i._parseHexBlock(o, 1)
						? ((i.DATA.hdmi1assign = o), i.logVerbose('Received HDMI 1 Output Assign: ' + o))
						: i.log('warn', 'Unexpected DTH value at 00000A: ' + o)
			}
			if (
				(e == '00' &&
					t == '00' &&
					n == '0B' &&
					((i.DATA.hdmi2assign = o), i.logVerbose('Received HDMI 2 Output Assign: ' + o)),
				e == '00' &&
					t == '00' &&
					n == '0C' &&
					((i.DATA.hdmi3assign = o), i.logVerbose('Received HDMI 3 Output Assign: ' + o)),
				e == '00' &&
					t == '00' &&
					n == '0D' &&
					((i.DATA.sdi1assign = o), i.logVerbose('Received SDI 1 Output Assign: ' + o)),
				e == '00' &&
					t == '00' &&
					n == '0E' &&
					((i.DATA.sdi2assign = o), i.logVerbose('Received SDI 2 Output Assign: ' + o)),
				e == '00' &&
					t == '00' &&
					n == '0F' &&
					((i.DATA.sdi3assign = o), i.logVerbose('Received SDI 3 Output Assign: ' + o)),
				e == '00' &&
					t == '00' &&
					n == '10' &&
					((i.DATA.usbassign = o), i.logVerbose('Received USB Output Assign: ' + o)),
				e == '02' && t == '01' && n == '0D' && ((i.DATA.auxlinkmode = o), i.logVerbose('Received Aux Link Mode: ' + o)),
				e == '02' && t == '01' && n == '54')
			) {
				let s = i._parseHexBlock(o, 3)
				s
					? ((i.DATA.aux1link = s[0]),
						(i.DATA.aux2link = s[1]),
						(i.DATA.aux3link = s[2]),
						i.logVerbose('Received Aux 1-3 Link: ' + o))
					: i._parseHexBlock(o, 1)
						? ((i.DATA.aux1link = o), i.logVerbose('Received Aux 1 Link: ' + o))
						: i.log('warn', 'Unexpected DTH value at 020154: ' + o)
			}
			if (
				(e == '02' && t == '01' && n == '55' && ((i.DATA.aux2link = o), i.logVerbose('Received Aux 2 Link: ' + o)),
				e == '02' && t == '01' && n == '56' && ((i.DATA.aux3link = o), i.logVerbose('Received Aux 3 Link: ' + o)),
				e == '02' && t == '01' && n == '16')
			) {
				let s = i._parseHexBlock(o, 4)
				s
					? ((i.DATA.monitor1assign = s[0]),
						(i.DATA.monitor2assign = s[1]),
						(i.DATA.monitor3assign = s[2]),
						(i.DATA.monitor4assign = s[3]),
						i.logVerbose('Received monitor assign block: ' + o))
					: i._parseHexBlock(o, 1)
						? ((i.DATA.monitor1assign = o.toUpperCase()), i.logVerbose('Received Monitor 1 Assign: ' + o))
						: i.log('warn', 'Unexpected value for monitor assign block: ' + o)
			}
			if (
				(e == '02' &&
					t == '01' &&
					n == '17' &&
					(i._parseHexBlock(o, 1)
						? ((i.DATA.monitor2assign = o.toUpperCase()), i.logVerbose('Received Monitor 2 Assign: ' + o))
						: i.log('warn', 'Unexpected value for monitor 2 assign: ' + o)),
				e == '02' &&
					t == '01' &&
					n == '18' &&
					(i._parseHexBlock(o, 1)
						? ((i.DATA.monitor3assign = o.toUpperCase()), i.logVerbose('Received Monitor 3 Assign: ' + o))
						: i.log('warn', 'Unexpected value for monitor 3 assign: ' + o)),
				e == '02' &&
					t == '01' &&
					n == '19' &&
					(i._parseHexBlock(o, 1)
						? ((i.DATA.monitor4assign = o.toUpperCase()), i.logVerbose('Received Monitor 4 Assign: ' + o))
						: i.log('warn', 'Unexpected value for monitor 4 assign: ' + o)),
				e == '60')
			) {
				let s = parseInt(t, 16),
					a = i._parseHexBlock(o, 8)
				n == '00' &&
					a &&
					(i.DATA[`memory${s}`] = a
						.map((r) => parseInt(r, 16))
						.filter((r) => r >= 32 && r < 127)
						.map((r) => String.fromCharCode(r))
						.join('')
						.trim())
			}
			e == '0A' && t == '00' && n == '03' && (i.DATA.lastMemory = parseInt(o, 16))
		},
		sendCommand: function (e, t, n) {
			let o = this
			if (!o._queue) return
			let i = 'DTH:' + String(e).toUpperCase() + ',' + String(t).toUpperCase() + ';'
			o._queue.enqueue({
				cmd: i,
				kind: 'write',
				repeatable: !(n && n.repeatable === !1),
				onError: (s) => o._commandRefused(i, s, n),
			})
		},
		sendNamed: function (e, t) {
			let n = this
			if (!n._queue) return
			let o = e.endsWith(';') ? e : e + ';'
			n._queue.enqueue({
				cmd: o,
				kind: 'write',
				repeatable: !(t && t.repeatable === !1),
				onError: (i) => n._commandRefused(o, i, t),
			})
		},
		_commandRefused: function (e, t, n) {
			let o = this,
				i = Ge.errorText(t),
				s = ''
			;(n &&
				n.needsNamed &&
				o.PROTOCOL !== 'named' &&
				(s = " Input 11-20 here needs switcher firmware 3.40 or later (Roland's named commands)."),
				o.log('warn', `The switcher turned down ${e}: ${i}.${s}`))
		},
		requestData: function (e) {
			this.sendRawCommand('RQH:' + e + ';')
		},
		sendRawCommand: function (e) {
			let t = this
			if (!t._queue) return
			let n = String(e).trim()
			if ((n.endsWith(';') || (n += ';'), /^RQH:/i.test(n))) return t._read(n.toUpperCase())
			if (/^DTH:/i.test(n)) {
				t._queue.enqueue({ cmd: n.toUpperCase(), kind: 'write', onError: (o) => t._commandRefused(n, o) })
				return
			}
			if (/^(VER|Q)/i.test(n)) return t._read(n)
			t.sendNamed(n)
		},
		logVerbose: function (e) {
			this.config && this.config.verbose && this.log('debug', e)
		},
		calculateBytes: function (e, t = 10) {
			let n = Math.round(e * t) & 16383,
				o = n & 127
			return [(n >> 7) & 127, o]
		},
		formatBytes: function (e) {
			return e.map((t) => t.toString(16).padStart(2, '0').toUpperCase()).join('')
		},
	}
})
var Ti = f((_s, xi) => {
	xi.exports = {
		CHOICES_OUTPUTS: [
			{ id: '00000A', label: 'HDMI Output 1' },
			{ id: '00000B', label: 'HDMI Output 2' },
			{ id: '00000C', label: 'HDMI Output 3' },
			{ id: '00000D', label: 'SDI Output 1' },
			{ id: '00000E', label: 'SDI Output 2' },
			{ id: '00000F', label: 'SDI Output 3' },
			{ id: '000110', label: 'USB Output' },
		],
		CHOICES_OUTPUTSASSIGN: [
			{ id: '00', label: 'Program' },
			{ id: '01', label: 'Sub Program' },
			{ id: '02', label: 'Preview' },
			{ id: '03', label: 'Aux 1' },
			{ id: '04', label: 'Aux 2' },
			{ id: '05', label: 'Aux 3' },
			{ id: '06', label: 'DSK 1 Source' },
			{ id: '07', label: 'DSK 2 Source' },
			{ id: '08', label: 'Multi-View' },
			{ id: '09', label: '16 Input-View' },
			{ id: '0A', label: '16 Still-View' },
		],
		CHOICES_PINPDSK: [
			{ id: 18, label: 'Program Layer PinP & Key 1' },
			{ id: 19, label: 'Program Layer PinP & Key 2' },
			{ id: 20, label: 'Program Layer PinP & Key 3' },
			{ id: 21, label: 'Program Layer PinP & Key 4' },
			{ id: 22, label: 'Program Layer DSK 1' },
			{ id: 23, label: 'Program Layer DSK 2' },
			{ id: 24, label: 'Sub Program Layer PinP & Key 1' },
			{ id: 25, label: 'Sub Program Layer PinP & Key 2' },
			{ id: 26, label: 'Sub Program Layer PinP & Key 3' },
			{ id: 27, label: 'Sub Program Layer PinP & Key 4' },
			{ id: 28, label: 'Sub Program Layer DSK 1' },
			{ id: 29, label: 'Sub Program Layer DSK 2' },
		],
		CHOICES_TRANSITION_TIME_TYPES: [
			{ id: '001700', label: 'Mix/Wipe Time' },
			{ id: '001701', label: 'PinP 1 Time' },
			{ id: '001702', label: 'PinP 2 Time' },
			{ id: '001703', label: 'PinP 3 Time' },
			{ id: '001704', label: 'PinP 4 Time' },
			{ id: '001705', label: 'DSK 1 Time' },
			{ id: '001706', label: 'DSK 2 Time' },
			{ id: '001707', label: 'Output Fade Time' },
		],
		CHOICES_TRANSITION_TYPES: [
			{ id: 0, label: 'Mix' },
			{ id: 1, label: 'Wipe' },
		],
		CHOICES_MIX_TYPES: [
			{ id: 0, label: 'Mix' },
			{ id: 1, label: 'Fam' },
			{ id: 2, label: 'Nam' },
		],
		CHOICES_WIPE_TYPES: [
			{ id: 0, label: 'Horizontal' },
			{ id: 1, label: 'Vertical' },
			{ id: 2, label: 'Upper Left' },
			{ id: 3, label: 'Upper Right' },
			{ id: 4, label: 'Lower Left' },
			{ id: 5, label: 'Lower Right' },
			{ id: 6, label: 'H-Center' },
			{ id: 7, label: 'V-Center' },
		],
		CHOICES_WIPE_DIRECTIONS: [
			{ id: 0, label: 'Normal' },
			{ id: 1, label: 'Reverse' },
			{ id: 2, label: 'Round Trip' },
		],
		CHOICES_PINP_KEYS: [
			{ id: 27, label: 'PinP & Key 1' },
			{ id: 28, label: 'PinP & Key 2' },
			{ id: 29, label: 'PinP & Key 3' },
			{ id: 30, label: 'PinP & Key 4' },
		],
		CHOICES_PINP_TYPES: [
			{ id: 0, label: 'PinP' },
			{ id: 1, label: 'Luminance-White Key' },
			{ id: 2, label: 'Luminance-Black Key' },
			{ id: 3, label: 'Chroma Key' },
		],
		CHOICES_DSK: [
			{ id: 31, label: 'DSK 1' },
			{ id: 32, label: 'DSK 2' },
		],
		CHOICES_DSK_TYPES: [
			{ id: 0, label: 'Luminance-White Key' },
			{ id: 1, label: 'Luminance-Black Key' },
			{ id: 2, label: 'Chroma Key' },
		],
		CHOICES_MEMORY: [
			{ id: 0, label: 'Memory 1' },
			{ id: 1, label: 'Memory 2' },
			{ id: 2, label: 'Memory 3' },
			{ id: 3, label: 'Memory 4' },
			{ id: 4, label: 'Memory 5' },
			{ id: 5, label: 'Memory 6' },
			{ id: 6, label: 'Memory 7' },
			{ id: 7, label: 'Memory 8' },
			{ id: 8, label: 'Memory 9' },
			{ id: 9, label: 'Memory 10' },
			{ id: 10, label: 'Memory 11' },
			{ id: 11, label: 'Memory 12' },
			{ id: 12, label: 'Memory 13' },
			{ id: 13, label: 'Memory 14' },
			{ id: 14, label: 'Memory 15' },
			{ id: 15, label: 'Memory 16' },
			{ id: 16, label: 'Memory 17' },
			{ id: 17, label: 'Memory 18' },
			{ id: 18, label: 'Memory 19' },
			{ id: 19, label: 'Memory 20' },
			{ id: 20, label: 'Memory 21' },
			{ id: 21, label: 'Memory 22' },
			{ id: 22, label: 'Memory 23' },
			{ id: 23, label: 'Memory 24' },
			{ id: 24, label: 'Memory 25' },
			{ id: 25, label: 'Memory 26' },
			{ id: 26, label: 'Memory 27' },
			{ id: 27, label: 'Memory 28' },
			{ id: 28, label: 'Memory 29' },
			{ id: 29, label: 'Memory 30' },
		],
		CHOICES_SWITCHES: [
			{ id: '0B0000', label: 'PGM/A 1 SW' },
			{ id: '0B0001', label: 'PGM/A 2 SW' },
			{ id: '0B0002', label: 'PGM/A 3 SW' },
			{ id: '0B0003', label: 'PGM/A 4 SW' },
			{ id: '0B0004', label: 'PGM/A 5 SW' },
			{ id: '0B0005', label: 'PGM/A 6 SW' },
			{ id: '0B0006', label: 'PGM/A 7 SW' },
			{ id: '0B0007', label: 'PGM/A 8 SW' },
			{ id: '0B0008', label: 'PGM/A 9 SW' },
			{ id: '0B0009', label: 'PGM/A 10 SW' },
			{ id: '0B000A', label: 'PST/B 1 SW' },
			{ id: '0B000B', label: 'PST/B 2 SW' },
			{ id: '0B000C', label: 'PST/B 3 SW' },
			{ id: '0B000D', label: 'PST/B 4 SW' },
			{ id: '0B000E', label: 'PST/B 5 SW' },
			{ id: '0B000F', label: 'PST/B 6 SW' },
			{ id: '0B0010', label: 'PST/B 7 SW' },
			{ id: '0B0011', label: 'PST/B 8 SW' },
			{ id: '0B0012', label: 'PST/B 9 SW' },
			{ id: '0B0013', label: 'PST/B 10 SW' },
			{ id: '0B0014', label: 'AUX 1 SW' },
			{ id: '0B0015', label: 'AUX 2 SW' },
			{ id: '0B0016', label: 'AUX 3 SW' },
			{ id: '0B0017', label: 'AUX 4 SW' },
			{ id: '0B0018', label: 'AUX 5 SW' },
			{ id: '0B0019', label: 'AUX 6 SW' },
			{ id: '0B001A', label: 'AUX 7 SW' },
			{ id: '0B001B', label: 'AUX 8 SW' },
			{ id: '0B001C', label: 'AUX 9 SW' },
			{ id: '0B001D', label: 'AUX 10 SW' },
			{ id: '0B001E', label: 'CUT SW' },
			{ id: '0B001F', label: 'AUTO SW' },
			{ id: '0B0020', label: 'TRANSITION SW' },
			{ id: '0B0021', label: 'MODE SW' },
			{ id: '0B0022', label: 'INPUT ASSIGN SW' },
			{ id: '0B0023', label: 'PGM-CENTER ENCODER' },
			{ id: '0B0024', label: 'PST-CENTER ENCODER' },
			{ id: '0B0025', label: 'SPLIT A SW' },
			{ id: '0B0026', label: 'SPLIT B SW' },
			{ id: '0B0027', label: 'AUTO MIXING' },
			{ id: '0B0028', label: 'CAPTURE SW' },
			{ id: '0B0029', label: 'USER 1 SW' },
			{ id: '0B002A', label: 'USER 2 SW' },
			{ id: '0B002B', label: 'USER 3 SW' },
			{ id: '0B002C', label: 'USER 4 SW' },
			{ id: '0B002D', label: 'PinP 1 POSITION H' },
			{ id: '0B002E', label: 'PinP 1 POSITION V' },
			{ id: '0B002F', label: 'PinP 1 SOURCE SW' },
			{ id: '0B0030', label: 'PinP 1 PVW SW' },
			{ id: '0B0031', label: 'PinP 1 PGM SW' },
			{ id: '0B0032', label: 'PinP 2 POSITION H' },
			{ id: '0B0033', label: 'PinP 2 POSITION V' },
			{ id: '0B0034', label: 'PinP 2 SOURCE SW' },
			{ id: '0B0035', label: 'PinP 2 PVW SW' },
			{ id: '0B0036', label: 'PinP 2 PGM SW' },
			{ id: '0B0037', label: 'PinP 3 POSITION H' },
			{ id: '0B0038', label: 'PinP 3 POSITION V' },
			{ id: '0B0039', label: 'PinP 3 SOURCE SW' },
			{ id: '0B003A', label: 'PinP 3 PVW SW' },
			{ id: '0B003B', label: 'PinP 3 PGM SW' },
			{ id: '0B003C', label: 'PinP 4 POSITION H' },
			{ id: '0B003D', label: 'PinP 4 POSITION V' },
			{ id: '0B003E', label: 'PinP 4 SOURCE SW' },
			{ id: '0B003F', label: 'PinP 4 PVW SW' },
			{ id: '0B0040', label: 'PinP 4 PGM SW' },
			{ id: '0B0041', label: 'DSK 1 SOURCE SW' },
			{ id: '0B0042', label: 'DSK 1 PVW SW' },
			{ id: '0B0043', label: 'DSK 1 PGM SW' },
			{ id: '0B0044', label: 'DSK 2 SOURCE SW' },
			{ id: '0B0045', label: 'DSK 2 PVW SW' },
			{ id: '0B0046', label: 'DSK 2 PGM SW' },
			{ id: '0B0047', label: 'MONITOR 1 SW' },
			{ id: '0B0048', label: 'MONITOR 2 SW' },
			{ id: '0B0049', label: 'MONITOR 3 SW' },
			{ id: '0B004A', label: 'MONITOR 4 SW' },
			{ id: '0B004B', label: 'MENU SW' },
			{ id: '0B004C', label: 'EXIT SW' },
			{ id: '0B004D', label: 'ENTER SW' },
			{ id: '0B004E', label: 'OUTPUT FADE SW' },
			{ id: '0B004F', label: 'SEQUENCER ON SW' },
			{ id: '0B0050', label: 'SEQUENCER AUTO SW' },
			{ id: '0B0051', label: 'SEQUENCER PREV SW' },
			{ id: '0B0052', label: 'SEQUENCER NEXT SW' },
		],
		CHOICES_CAMERAS: [
			{ id: '41', label: 'Camera 1' },
			{ id: '42', label: 'Camera 2' },
			{ id: '43', label: 'Camera 3' },
			{ id: '44', label: 'Camera 4' },
			{ id: '45', label: 'Camera 5' },
			{ id: '46', label: 'Camera 6' },
			{ id: '47', label: 'Camera 7' },
			{ id: '48', label: 'Camera 8' },
			{ id: '49', label: 'Camera 9' },
			{ id: '4A', label: 'Camera 10' },
			{ id: '4B', label: 'Camera 11' },
			{ id: '4C', label: 'Camera 12' },
			{ id: '4D', label: 'Camera 13' },
			{ id: '4E', label: 'Camera 14' },
			{ id: '4F', label: 'Camera 15' },
			{ id: '50', label: 'Camera 16' },
		],
	}
})
var Di = f((ws, Ii) => {
	var { InstanceBase: Zn } = (R(), F($)),
		jn = zt(),
		Ei = He(),
		Xn = ni(),
		Jn = di(),
		eo = ui(),
		to = fi(),
		io = wi(),
		no = Ti(),
		{ CONN_FIELDS: X, checkField: oo } = Ei,
		qe = class extends Zn {
			constructor(t) {
				;(super(t),
					Object.assign(this, { ...Ei, ...Xn, ...Jn, ...eo, ...to, ...io, ...no }),
					(this.INTERVAL = void 0),
					(this.MODEL = 'V-160HD'),
					(this.VERSION = ''),
					(this.PROTOCOL = 'lowlevel'),
					(this.TALLY = {}),
					(this.DATA = {
						data_1B00: '00',
						data_1B01: '00',
						data_1C00: '00',
						data_1C01: '00',
						data_1D00: '00',
						data_1D01: '00',
						data_1E00: '00',
						data_1E01: '00',
					}),
					(this._freezePending = {}),
					(this.selectedCamera = '41'))
			}
			async init(t) {
				;((this.config = t), this._buildDefinitions(), this.initConnection())
			}
			async destroy() {
				try {
					;(this._stopPolling(),
						clearTimeout(this._verTimer),
						this._queue && this._queue.clear(),
						this._clearAllFreezePending(),
						this.socket !== void 0 && (this.socket.destroy(), delete this.socket))
				} catch (t) {
					this.log('error', 'destroy error: ' + t)
				}
			}
			_buildDefinitions() {
				;(this.initActions(),
					this.initFeedbacks(),
					this.initVariables(),
					this.initPresets(),
					this.checkAllFeedbacks(),
					this.checkVariables())
			}
			handleStartStopRecordActions(t) {
				this._recording = t
			}
			_savedValues() {
				try {
					let t = JSON.parse(String(this.config?.actionSaved ?? '') || '{}')
					return t && typeof t == 'object' && !Array.isArray(t) ? t : {}
				} catch {
					return {}
				}
			}
			async configUpdated(t) {
				let n = this.config || {},
					o = { ...t, actionSaved: n.actionSaved },
					i = this._savedValues(),
					s = !1
				for (let r of Object.keys(X)) {
					let d = n[`${r}_byAction`] === !0,
						p = o[`${r}_byAction`] === !0
					!d && p
						? ((i[r] = o[r]), (s = !0))
						: d && p
							? (o[r] = n[r])
							: d && !p && (r in i && (o[r] = i[r]), delete i[r], (s = !0))
				}
				;((o.actionSaved = JSON.stringify(i)),
					(this.config = o),
					s && this.initActions(),
					this._buildDefinitions(),
					this.initConnection(),
					[...new Set([...Object.keys(t), ...Object.keys(o)])].some(
						(r) => JSON.stringify(t[r]) !== JSON.stringify(o[r]),
					) && this.saveConfig(o))
			}
			_tickedFields() {
				return Object.keys(X).filter((t) => this.config?.[`${t}_byAction`] === !0)
			}
			async setSettingsByAction(t) {
				let n = this._tickedFields()
				if (!n.length) {
					this.log(
						'info',
						`Connection: set settings: nothing's ticked "Can be set by the action" on the connection page yet, so there's nothing for me to set.`,
					)
					return
				}
				let o = { ...this.config },
					i = !1
				for (let s of Object.keys(X)) {
					let a = t[s]
					if (a == null || String(a).trim() === '') continue
					if (!n.includes(s)) {
						this.log(
							'info',
							`Connection: set settings: "${X[s].label}" isn't ticked "Can be set by the action", so I've left it alone.`,
						)
						continue
					}
					let r = oo(s, a)
					if (!r.ok) {
						this.log('warn', `Connection: set settings: "${X[s].label}" ${r.why}. Left it as it was.`)
						continue
					}
					JSON.stringify(o[s]) !== JSON.stringify(r.value) && ((o[s] = r.value), (i = !0))
				}
				i && ((this.config = o), this.saveConfig(o), this._buildDefinitions(), this.initConnection())
			}
		}
	Ii.exports = { v160Instance: qe, UpgradeScripts: jn }
})
var Ye = vi(Di(), 1),
	xs = Ye.default.UpgradeScripts,
	Ts = Ye.default.v160Instance
export { xs as UpgradeScripts, Ts as default }
