'use strict'
const test = require('node:test')
const assert = require('node:assert/strict')
const { CommandQueue } = require('../src/commandQueue')

function clock() {
	let now = 0
	let id = 0
	const timers = new Map()
	return {
		timers: {
			setTimeout: (fn, ms) => {
				timers.set(++id, { fn, at: now + ms })
				return id
			},
			clearTimeout: (t) => timers.delete(t),
		},
		advance(ms) {
			const end = now + ms
			for (;;) {
				let next
				for (const [k, t] of timers) if (t.at <= end && (!next || t.at < next[1].at)) next = [k, t]
				if (!next) break
				timers.delete(next[0])
				now = next[1].at
				next[1].fn()
			}
			now = end
		},
	}
}

function make(opts = {}) {
	const c = clock()
	const sent = []
	const events = []
	const q = new CommandQueue({
		send: (cmd) => {
			sent.push(cmd)
			return true
		},
		timers: c.timers,
		timeoutMs: 100,
		gapMs: 20,
		retries: 1,
		silenceLimit: 3,
		onSilence: () => events.push('silent'),
		onAlive: () => events.push('alive'),
		...opts,
	})
	return { q, c, sent, events }
}

test('only one command in flight; the next waits for the answer and the gap', () => {
	const { q, c, sent } = make()
	q.enqueue({ cmd: 'A;', kind: 'write' })
	q.enqueue({ cmd: 'B;', kind: 'write' })
	assert.deepEqual(sent, ['A;'])
	c.advance(50)
	assert.deepEqual(sent, ['A;'])
	q.handleMessage('ACK')
	c.advance(19)
	assert.deepEqual(sent, ['A;'])
	c.advance(1)
	assert.deepEqual(sent, ['A;', 'B;'])
})

test('writes go before reads', () => {
	const { q, c, sent } = make()
	q.enqueue({ cmd: 'R1;', kind: 'read' })
	q.enqueue({ cmd: 'R2;', kind: 'read' })
	q.enqueue({ cmd: 'W;', kind: 'write' })
	q.handleMessage('ACK')
	c.advance(20)
	assert.deepEqual(sent, ['R1;', 'W;'])
})

test('a read already waiting is not queued twice', () => {
	const { q } = make()
	q.enqueue({ cmd: 'X;', kind: 'write' })
	assert.equal(q.enqueue({ cmd: 'R;', kind: 'read' }), true)
	assert.equal(q.enqueue({ cmd: 'R;', kind: 'read' }), false)
	assert.equal(q.readsWaiting(), 1)
})

test('a low-level read finishes on its own DTH reply', () => {
	const { q, c, sent } = make()
	q.enqueue({ cmd: 'RQH:002100,000002;', kind: 'read', match: (m) => m.startsWith('DTH:002100') })
	q.enqueue({ cmd: 'W;', kind: 'write' })
	assert.equal(q.handleMessage('DTH:0C0000,0102'), false) // a tally push isn't the answer
	assert.equal(q.handleMessage('DTH:002100,2021'), true)
	c.advance(20)
	assert.deepEqual(sent, ['RQH:002100,000002;', 'W;'])
})

test('an unanswered write is sent once more, then dropped with a warning', () => {
	const logs = []
	const { q, c, sent } = make({ log: (l, m) => logs.push(l) })
	q.enqueue({ cmd: 'W;', kind: 'write' })
	c.advance(100) // timeout
	c.advance(20) // gap
	assert.deepEqual(sent, ['W;', 'W;'])
	c.advance(120)
	assert.deepEqual(sent, ['W;', 'W;'])
	assert.ok(logs.includes('warn'))
})

test('toggles are never resent', () => {
	const { q, c, sent } = make()
	q.enqueue({ cmd: 'FRZ;', kind: 'write', repeatable: false })
	c.advance(500)
	assert.deepEqual(sent, ['FRZ;'])
})

test('ERR finishes the command and reports the code', () => {
	const { q } = make()
	let got
	q.enqueue({ cmd: 'PGM:INPUT11;', kind: 'write', onError: (code) => (got = code) })
	q.handleMessage('ERR:5')
	assert.equal(got, '5')
	assert.equal(q.size(), 0)
})

test('goes quiet after the silence limit and wakes on any answer', () => {
	const { q, c, events } = make({ retries: 0 })
	for (let i = 0; i < 3; i++) q.enqueue({ cmd: `R${i};`, kind: 'read' })
	c.advance(1000)
	assert.deepEqual(events, ['silent'])
	assert.equal(q.silent, true)
	q.handleMessage('ACK')
	assert.deepEqual(events, ['silent', 'alive'])
	assert.equal(q.silent, false)
})

test('nothing waits on a send that failed (not connected)', () => {
	const { q, c } = make({ send: () => false })
	q.enqueue({ cmd: 'A;', kind: 'write' })
	q.enqueue({ cmd: 'B;', kind: 'write' })
	c.advance(50)
	assert.equal(q.size(), 0)
})

test('clear() drops everything', () => {
	const { q, c, sent } = make()
	q.enqueue({ cmd: 'A;', kind: 'write' })
	q.enqueue({ cmd: 'B;', kind: 'write' })
	q.clear()
	q.handleMessage('ACK')
	c.advance(1000)
	assert.deepEqual(sent, ['A;'])
})
