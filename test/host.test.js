'use strict'
// End to end: the real Companion module host, the real TCP helper, and a
// pretend V-160HD on a local port.
const test = require('node:test')
const assert = require('node:assert/strict')
const net = require('node:net')

function fakeSwitcher(version, { refuse = [] } = {}) {
	const got = []
	const server = net.createServer((sock) => {
		let buf = ''
		let authed = false
		sock.write('Enter password:')
		sock.on('data', (d) => {
			buf += d.toString()
			let i
			while ((i = buf.search(/[\n;]/)) !== -1) {
				const line = buf.slice(0, i).trim()
				buf = buf.slice(i + 1)
				if (!line) continue
				if (!authed) {
					authed = line === '1234'
					sock.write(authed ? 'Welcome to V-160HD.' : 'Enter password:')
					continue
				}
				got.push(line)
				const reply = answer(line)
				// Like the real switcher: an invisible 0x02 in front of every reply
				if (reply) setTimeout(() => sock.write(reply.replace(/([^;]+;)/g, '\x02$1')), 2)
			}
		})
	})
	function answer(line) {
		if (refuse.some((r) => line.startsWith(r))) return 'ERR:5;'
		if (line === 'VER') return `VER:V-160HD,${version};ACK;`
		if (line === 'TLY')
			return (
				'TLY:' +
				new Array(52)
					.fill(0)
					.map((_, i) => (i === 34 ? 1 : 0))
					.join(',') +
				';ACK;'
			)
		if (line === 'QPGM') return 'PGM:HDMI1,INPUT3;ACK;'
		if (line === 'QPST') return 'PST:SDI1;ACK;'
		if (/^Q/.test(line)) return 'ACK;'
		const rq = /^RQH:(\w{6}),(\w{6})$/.exec(line)
		if (rq) return `DTH:${rq[1]},${'00'.repeat(parseInt(rq[2], 16))};`
		return 'ACK;'
	}
	return new Promise((resolve) =>
		server.listen(0, '127.0.0.1', () => resolve({ server, got, port: server.address().port })),
	)
}

async function boot(port, extra = {}) {
	const { InstanceWrapper } = await import('@companion-module/host')
	const { v160Instance, UpgradeScripts } = require('../index.js')
	const seen = { status: [], actions: null, feedbacks: null, presets: null, vars: null, values: {} }
	const host = {
		setStatus: (s, m) => seen.status.push([s, m]),
		setActionDefinitions: (a) => (seen.actions = a),
		setFeedbackDefinitions: (f) => (seen.feedbacks = f),
		setVariableDefinitions: (d, v) => {
			seen.vars = d
			for (const x of v) seen.values[x.id] = x.value
		},
		setPresetDefinitions: (s, p) => (seen.presets = { s, p }),
		setCompositeElementDefinitions: () => {},
		setVariableValues: (v) => {
			for (const x of v) seen.values[x.id] = x.value
		},
		updateFeedbackValues: () => {},
		saveConfig: (c) => (seen.saved = c),
		sendOSC: () => {},
		recordAction: () => {},
		setCustomVariable: () => {},
		sharedUdpSocketJoin: async () => '',
		sharedUdpSocketLeave: async () => {},
		sharedUdpSocketSend: async () => {},
	}
	const w = new InstanceWrapper('v160', host, v160Instance, UpgradeScripts, '2.1.3')
	await w.init({
		label: 'v160',
		isFirstInit: false,
		lastUpgradeIndex: UpgradeScripts.length - 1,
		secrets: {},
		config: {
			host: '127.0.0.1',
			port: String(port),
			password: '1234',
			protocol: 'auto',
			polling: false,
			timeout: '300',
			gap: '5',
			retries: '1',
			silence: '5',
			...extra,
		},
	})
	return { w, seen }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const run = (w, actionId, options) =>
	w.executeAction({ id: 'a' + Math.random(), actionId, controlId: 'c', options }, undefined)

test('firmware 3.60: connects, picks named commands, routes Input 11-20', async () => {
	const sw = await fakeSwitcher('3.60')
	const { w, seen } = await boot(sw.port)
	try {
		await wait(400)
		assert.ok(sw.got.includes('VER'), 'asked the version')
		assert.equal(seen.values.protocol, 'named')
		assert.ok(seen.actions.length > 70, 'actions accepted by the host')
		assert.ok(seen.feedbacks.length > 10, 'feedbacks accepted by the host')
		assert.ok(Object.keys(seen.presets.p).length > 300, 'presets accepted by the host')

		for (const [id, o] of [
			['select_pgm', { source: 'INPUT11' }],
			['aux_assign', { aux: '3', source: 'INPUT20' }],
			['pnpkey_setsource', { pinp: '2', source: 'INPUT15' }],
			['set_dsk_key_source', { dsk: '1', source: 'INPUT12' }],
			['input_assign', { slot: 'INPUT14', source: 'SDI4' }],
			['cut', { source: '' }],
		]) {
			const r = await run(w, id, o)
			assert.equal(r.success, true, `${id}: ${r.errorMessage}`)
		}
		await wait(300)
		for (const c of [
			'PGM:INPUT11',
			'AUX:AUX3,INPUT20',
			'PIS:PinP2,INPUT15',
			'DSS:DSK1,INPUT12',
			'VIS:INPUT14,SDI4',
			'CUT',
		]) {
			assert.ok(sw.got.includes(c), `switcher got ${c} (got: ${sw.got.join(' | ')})`)
		}
		const fields = await w.getConfigFields()
		assert.ok(fields.length > 10)
	} finally {
		await w.destroy()
		sw.server.close()
	}
})

test('firmware 3.30: low-level, and a refused Input 11 is explained', async () => {
	const sw = await fakeSwitcher('3.30', { refuse: ['DTH:002100,2A'] })
	const { w, seen } = await boot(sw.port)
	try {
		await wait(400)
		assert.equal(seen.values.protocol, 'lowlevel')
		await run(w, 'select_pgm', { source: 'INPUT11' })
		await run(w, 'select_pvw', { source: 'HDMI2' })
		await wait(200)
		assert.ok(sw.got.includes('DTH:002100,2A'))
		assert.ok(sw.got.includes('DTH:002101,01'), 'the next command still went after the ERR')
	} finally {
		await w.destroy()
		sw.server.close()
	}
})

test('polling on: answers fill feedback data, nothing piles up', async () => {
	const sw = await fakeSwitcher('3.60')
	const { w, seen } = await boot(sw.port, { polling: true, pollingrate: '100' })
	try {
		await wait(1200)
		assert.equal(seen.values.pgm, 'Input 3')
		assert.equal(seen.values.pvw, 'SDI 1')
		assert.equal(seen.values.tally_input3, 'Program')
		// Button presses still land promptly while polling runs
		const before = sw.got.length
		await run(w, 'select_pvw', { source: 'INPUT9' })
		await wait(150)
		assert.ok(sw.got.slice(before).includes('PST:INPUT9'))
	} finally {
		await w.destroy()
		sw.server.close()
	}
})
