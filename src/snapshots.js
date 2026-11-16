'use strict'

/**
 * Snapshots: save the switcher's set-up under a name ("Hall 9"), restore it later.
 *
 * Parts (pick on save and on restore): system settings, risky settings, labels,
 * input assigns, routing (Aux, PinP & Key and DSK sources). Restore only writes
 * what the snapshot holds; everything else is left alone. Risky settings need a
 * second press. Kept in the connection's config, so they travel with Companion
 * exports. Export/import as files on the module's web page.
 */

const mem = require('./mem')
const T = require('./systemTable')
const { LABEL_TARGETS } = require('./labels')
const sources = require('./sources')

const PARTS = [
	{ id: 'system', label: 'System settings' },
	{ id: 'risky', label: 'Risky settings (formats, frame rate, HDCP, reference)' },
	{ id: 'labels', label: 'Labels' },
	{ id: 'inputs', label: 'Input assigns' },
	{ id: 'routing', label: 'Routing (Aux, PinP & Key, DSK sources)' },
]
const ALL_PARTS = PARTS.map((p) => p.id)

const RISKY_ADDRS = new Set()
for (const s of T.SETTINGS) if (s.risky) for (let i = 0; i < s.size; i++) RISKY_ADDRS.add(mem.addAddr(s.addr, i))
// Read-only or reserved bytes: never written back
const SKIP_ADDRS = new Set(['020134'])

/** Routing addresses, with where the module keeps each value */
const ROUTING = [
	['000011', 'aux1source'],
	['00002E', 'aux2source'],
	['00002F', 'aux3source'],
	['001B02', 'pnpkey1source'],
	['001C02', 'pnpkey2source'],
	['001D02', 'pnpkey3source'],
	['001E02', 'pnpkey4source'],
	['001F03', 'dsk1source'],
	['001F04', 'dsk1fill'],
	['002003', 'dsk2source'],
	['002004', 'dsk2fill'],
]
const RESTORE_ORDER = ['risky', 'system', 'inputs', 'routing', 'labels']

function parseStore(raw) {
	try {
		const v = JSON.parse(String(raw || '') || '{}')
		return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
	} catch {
		return {}
	}
}

/** Turn a snapshot's address→byte map into write runs of up to 8 bytes */
function runs(map) {
	const addrs = Object.keys(map)
		.filter((a) => !SKIP_ADDRS.has(a))
		.sort((a, b) => mem.addrToNum(a) - mem.addrToNum(b))
	const out = []
	for (const a of addrs) {
		const last = out[out.length - 1]
		if (last && last.bytes.length < 8 && mem.addrToNum(last.addr) + last.bytes.length === mem.addrToNum(a))
			last.bytes.push(map[a])
		else out.push({ addr: a, bytes: [map[a]] })
	}
	return out
}

function cleanName(raw) {
	return String(raw ?? '')
		.replace(/[\u0000-\u001f]/g, '')
		.trim()
		.slice(0, 40)
}

function pickParts(raw) {
	const list = Array.isArray(raw) ? raw : String(raw ?? '').split(',')
	const p = list.map((x) => String(x).trim().toLowerCase()).filter((x) => ALL_PARTS.includes(x))
	return p.length ? p : ALL_PARTS
}

module.exports = {
	SNAPSHOT_PARTS: PARTS,
	snapshotRuns: runs,

	snapshotStore: function () {
		return parseStore(this.config && this.config.snapshots)
	},

	snapshotNames: function () {
		return Object.keys(this.snapshotStore()).sort((a, b) => a.localeCompare(b))
	},

	_saveStore: function (store) {
		const next = { ...this.config, snapshots: JSON.stringify(store) }
		this.config = next
		this.saveConfig(next)
		clearTimeout(this._snapRebuild)
		this._snapRebuild = setTimeout(() => this._buildDefinitions && this._buildDefinitions(), 200)
	},

	/** What's in memory now, as a snapshot */
	captureSnapshot: function (name, rawParts) {
		const parts = pickParts(rawParts)
		const M = this.MEM || {}
		const D = this.DATA || {}
		const snap = { name, savedAt: new Date().toISOString(), firmware: this.VERSION || '', parts: {} }
		if (parts.includes('system') || parts.includes('risky')) {
			const sys = {}
			const risky = {}
			for (const b of T.READ_BLOCKS) {
				for (let i = 0; i < b.size; i++) {
					const a = mem.addAddr(b.addr, i)
					if (M[a] === undefined) continue
					if (RISKY_ADDRS.has(a)) risky[a] = M[a]
					else sys[a] = M[a]
				}
			}
			if (parts.includes('system')) snap.parts.system = sys
			if (parts.includes('risky')) snap.parts.risky = risky
		}
		if (parts.includes('labels')) {
			const l = {}
			for (const t of LABEL_TARGETS) {
				const b = mem.bytes(M, t.address, 8)
				if (b) b.forEach((x, i) => (l[mem.addAddr(t.address, i)] = x))
			}
			snap.parts.labels = l
		}
		if (parts.includes('inputs') && Array.isArray(D.inputAssign)) {
			const inp = {}
			for (const s of sources.INPUT_SLOTS) {
				const v = D.inputAssign[Number(s.id.slice(5)) - 1]
				if (v !== undefined) inp[s.address] = parseInt(v, 16)
			}
			snap.parts.inputs = inp
		}
		if (parts.includes('routing')) {
			const r = {}
			for (const [a, k] of ROUTING) if (D[k] !== undefined) r[a] = parseInt(D[k], 16)
			snap.parts.routing = r
		}
		return snap
	},

	/** Read everything fresh, wait for the answers, then save */
	saveSnapshot: async function (rawName, rawParts) {
		const name = cleanName(rawName)
		if (!name) {
			this.log('warn', 'Snapshot: save: it needs a name.')
			return false
		}
		if (!this._authenticated) {
			this.log('warn', "Snapshot: save: the switcher isn't connected, so there's nothing to save.")
			return false
		}
		this.readAll()
		await this._waitForReads(20000)
		const snap = this.captureSnapshot(name, rawParts)
		const store = this.snapshotStore()
		store[name] = snap
		this._saveStore(store)
		const counts = Object.entries(snap.parts).map(([k, v]) => `${k} ${Object.keys(v).length}`)
		this.log('info', `Snapshot "${name}" saved (${counts.join(', ')}).`)
		this.checkVariables()
		return true
	},

	_waitForReads: function (maxMs) {
		return new Promise((resolve) => {
			const start = Date.now()
			const tick = () => {
				if (!this._queue || this._queue.readsWaiting() === 0 || Date.now() - start > maxMs) return resolve()
				this._snapWait = setTimeout(tick, 100)
			}
			tick()
		})
	},

	/** Every read a snapshot needs */
	readAll: function () {
		this.readSystem()
		this.readLabels()
		this.getVideoAssign()
		this.sendRawCommand('RQH:000011,000001;')
		this.sendRawCommand('RQH:00002E,000002;')
		for (const a of ['1B', '1C', '1D', '1E']) this.sendRawCommand(`RQH:00${a}02,000001;`)
		this.sendRawCommand('RQH:001F03,000002;')
		this.sendRawCommand('RQH:002003,000002;')
	},

	/**
	 * Restore. confirmed = the second press has happened (or it came from somewhere
	 * that confirmed already). Without it, the risky part is skipped and logged.
	 */
	restoreSnapshot: function (rawName, rawParts, confirmedRisky) {
		const name = cleanName(rawName)
		const snap = this.snapshotStore()[name]
		if (!snap) {
			this.log('warn', `Snapshot: restore: there's no snapshot called "${name}".`)
			return false
		}
		if (!this._authenticated) {
			this.log('warn', "Snapshot: restore: the switcher isn't connected.")
			return false
		}
		const parts = pickParts(rawParts)
		let writes = 0
		for (const p of RESTORE_ORDER) {
			if (!parts.includes(p) || !snap.parts || !snap.parts[p]) continue
			if (p === 'risky' && !confirmedRisky) {
				if (Object.keys(snap.parts.risky).length)
					this.log('warn', `Snapshot "${name}": risky settings left out (they need the second press).`)
				continue
			}
			for (const r of runs(snap.parts[p])) {
				this._writeRun(r.addr, r.bytes)
				writes++
			}
		}
		this.log('info', `Snapshot "${name}" restoring: ${writes} writes queued. Anything it doesn't hold is left alone.`)
		// Read it all back so feedbacks and variables catch up
		this.readAll()
		return true
	},

	/** One multi-byte write; if the switcher turns it down, try the bytes one at a time */
	_writeRun: function (addr, bytes) {
		if (!this._queue) return
		const cmd = `DTH:${addr},${mem.hexBytes(bytes)};`
		this._queue.enqueue({
			cmd,
			kind: 'write',
			repeatable: true,
			onError: (code) => {
				if (bytes.length > 1) {
					bytes.forEach((b, i) => this._writeRun(mem.addAddr(addr, i), [b]))
				} else {
					this.logVerbose(`Snapshot: the switcher turned down ${cmd} (ERR ${code}); skipped.`)
				}
			},
		})
	},

	deleteSnapshot: function (rawName) {
		const name = cleanName(rawName)
		const store = this.snapshotStore()
		if (!store[name]) return false
		delete store[name]
		this._saveStore(store)
		this.log('info', `Snapshot "${name}" deleted.`)
		return true
	},

	renameSnapshot: function (rawFrom, rawTo) {
		const from = cleanName(rawFrom)
		const to = cleanName(rawTo)
		const store = this.snapshotStore()
		if (!store[from] || !to || from === to) return false
		store[to] = { ...store[from], name: to }
		delete store[from]
		this._saveStore(store)
		this.log('info', `Snapshot "${from}" renamed to "${to}".`)
		return true
	},

	/** Add a snapshot from a file. Returns its name, or throws with a reason. */
	importSnapshot: function (text, rawName) {
		let snap
		try {
			snap = JSON.parse(String(text || ''))
		} catch {
			throw new Error("that file isn't a snapshot (not JSON)")
		}
		if (!snap || typeof snap !== 'object' || !snap.parts || typeof snap.parts !== 'object')
			throw new Error("that file isn't a snapshot")
		const clean = {}
		for (const p of ALL_PARTS) {
			const part = snap.parts[p]
			if (!part || typeof part !== 'object') continue
			clean[p] = {}
			for (const [a, v] of Object.entries(part)) {
				if (!/^[0-7][0-9A-F]{5}$/i.test(a)) continue
				const n = Number(v)
				if (Number.isInteger(n) && n >= 0 && n <= 0x7f) clean[p][a.toUpperCase()] = n
			}
		}
		const name = cleanName(rawName) || cleanName(snap.name) || `Imported ${new Date().toISOString().slice(0, 16)}`
		const store = this.snapshotStore()
		store[name] = {
			name,
			savedAt: snap.savedAt || new Date().toISOString(),
			firmware: snap.firmware || '',
			parts: clean,
		}
		this._saveStore(store)
		this.log('info', `Snapshot "${name}" imported.`)
		return name
	},

	// ── Definitions ──────────────────────────────────────────────────────

	_snapshotChoices: function () {
		const names = this.snapshotNames()
		return names.length ? names.map((n) => ({ id: n, label: n })) : [{ id: '', label: '(none saved yet)' }]
	},

	snapshotActions: function (actions) {
		const self = this
		const partsOpt = {
			type: 'multidropdown',
			label: 'Parts',
			id: 'parts',
			default: ALL_PARTS,
			choices: PARTS,
			tooltip: 'Default: everything. Choose fewer to save or restore only those parts.',
		}
		actions.snapshot_save = {
			name: 'Snapshot: save',
			description: 'Reads everything from the switcher and keeps it under a name. Same name = replaced.',
			options: [{ type: 'textinput', label: 'Name', id: 'name', default: 'Hall 9' }, partsOpt],
			callback: (a) => self.saveSnapshot(a.options.name, a.options.parts),
		}
		actions.snapshot_restore = {
			name: 'Snapshot: restore',
			description:
				'Writes a saved snapshot back to the switcher. Only what it holds is changed. If it holds risky settings, press twice (within the confirm time).',
			options: [
				{
					type: 'dropdown',
					label: 'Snapshot',
					id: 'name',
					default: self.snapshotNames()[0] || '',
					choices: self._snapshotChoices(),
					allowCustom: true,
				},
				partsOpt,
			],
			callback: (a) => {
				const name = cleanName(a.options.name)
				const snap = self.snapshotStore()[name]
				const parts = pickParts(a.options.parts)
				const hasRisky = !!(snap && parts.includes('risky') && snap.parts.risky && Object.keys(snap.parts.risky).length)
				if (hasRisky && !self.confirmPress(`${a.controlId}:${a.actionId}`, `Snapshot "${name}" holds risky settings`))
					return
				self.restoreSnapshot(name, parts, hasRisky)
			},
		}
		actions.snapshot_delete = {
			name: 'Snapshot: delete',
			options: [
				{
					type: 'dropdown',
					label: 'Snapshot',
					id: 'name',
					default: self.snapshotNames()[0] || '',
					choices: self._snapshotChoices(),
					allowCustom: true,
				},
			],
			callback: (a) => {
				if (!self.confirmPress(`${a.controlId}:${a.actionId}`, `Snapshot: delete "${a.options.name}"`)) return
				self.deleteSnapshot(a.options.name)
			},
		}
	},

	snapshotVariableDefs: function (add) {
		add('snapshot_count', 'Snapshots saved')
		add('snapshot_names', 'Snapshot names (comma separated)')
	},
	snapshotVariableValues: function (v) {
		const n = this.snapshotNames()
		v.snapshot_count = n.length
		v.snapshot_names = n.join(', ')
	},

	snapshotConfigFields: function () {
		const names = this.snapshotNames()
		const choices = [{ id: '', label: '—' }, ...names.map((n) => ({ id: n, label: n }))]
		const label = this.label || 'this-connection'
		return [
			{
				type: 'static-text',
				id: 'snapHead',
				label: 'Snapshots',
				width: 12,
				value:
					(names.length
						? `Saved: <b>${names.map(escapeHtml).join('</b>, <b>')}</b>.`
						: 'None saved yet. Use the <b>Snapshot: save</b> action.') +
					`<br>Export and import as files on this connection's web page: <code>http://&lt;Companion address&gt;:8000/instance/${escapeHtml(label)}/</code>` +
					'<br>To restore, rename or delete here: pick below, then Save.',
			},
			{
				type: 'dropdown',
				id: 'snapRestore',
				label: 'Restore on Save',
				width: 6,
				default: '',
				choices,
				tooltip:
					'Sends this snapshot to the switcher when you press Save. Only the settings in the snapshot are changed.',
			},
			{
				type: 'multidropdown',
				id: 'snapRestoreParts',
				label: 'Parts to restore',
				width: 6,
				default: ALL_PARTS.filter((p) => p !== 'risky'),
				choices: PARTS,
				isVisibleExpression: "$(options:snapRestore) != ''",
				tooltip: 'Risky settings are left out unless you pick them here.',
			},
			{
				type: 'dropdown',
				id: 'snapRename',
				label: 'Rename',
				width: 6,
				default: '',
				choices,
				tooltip: 'Choose a snapshot, type the new name, then Save.',
			},
			{
				type: 'textinput',
				id: 'snapRenameTo',
				label: 'New name',
				width: 6,
				default: '',
				isVisibleExpression: "$(options:snapRename) != ''",
				tooltip: 'Up to 40 characters.',
			},
			{
				type: 'dropdown',
				id: 'snapDelete',
				label: 'Delete on Save',
				width: 6,
				default: '',
				choices,
				tooltip: 'Deleted when you press Save. Export it first to keep a copy.',
			},
		]
	},

	/** Connection page snapshot picks: do them, then clear the fields. Returns true if any. */
	takeSnapshotConfigOps: function (next) {
		let any = false
		if (next.snapRename && next.snapRenameTo) {
			this.config = next
			this.renameSnapshot(next.snapRename, next.snapRenameTo)
			next.snapshots = this.config.snapshots
			any = true
		}
		if (next.snapDelete) {
			this.config = next
			this.deleteSnapshot(next.snapDelete)
			next.snapshots = this.config.snapshots
			any = true
		}
		if (next.snapRestore) {
			// Risky settings from the page count as confirmed: picking them and pressing Save is the second step
			this._pendingRestore = { name: next.snapRestore, parts: next.snapRestoreParts }
			any = true
		}
		next.snapRename = ''
		next.snapRenameTo = ''
		next.snapDelete = ''
		next.snapRestore = ''
		return any
	},

	runPendingRestore: function () {
		const p = this._pendingRestore
		if (!p) return
		this._pendingRestore = undefined
		const parts = pickParts(p.parts)
		this.restoreSnapshot(p.name, parts, parts.includes('risky'))
	},

	stopSnapshots: function () {
		clearTimeout(this._snapWait)
		clearTimeout(this._snapRebuild)
	},

	// ── Web page ─────────────────────────────────────────────────────────

	handleHttpRequest: async function (req) {
		const path = String(req.path || '/').replace(/\/+$/, '') || '/'
		const method = String(req.method || 'GET').toUpperCase()
		try {
			if (method === 'GET' && (path === '/' || path === '/index.html')) {
				return { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }, body: this._snapshotPage() }
			}
			if (method === 'GET' && path === '/snapshot') {
				const name = cleanName(req.query && req.query.name)
				const snap = this.snapshotStore()[name]
				if (!snap) return { status: 404, body: 'No snapshot by that name.' }
				const file = name.replace(/[^A-Za-z0-9 _.-]/g, '_') || 'snapshot'
				return {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						'Content-Disposition': `attachment; filename="V-160HD ${file}.json"`,
					},
					body: JSON.stringify(snap, null, 2),
				}
			}
			if (method === 'POST' && path === '/import') {
				const name = this.importSnapshot(req.body, req.query && req.query.name)
				return {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ok: true, name }),
				}
			}
			if (method === 'POST' && path === '/delete') {
				const ok = this.deleteSnapshot(req.query && req.query.name)
				return { status: ok ? 200 : 404, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok }) }
			}
			return { status: 404, body: 'Nothing here.' }
		} catch (e) {
			return {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ok: false, error: String(e.message || e) }),
			}
		}
	},

	_snapshotPage: function () {
		const store = this.snapshotStore()
		const rows = Object.keys(store)
			.sort((a, b) => a.localeCompare(b))
			.map((n) => {
				const s = store[n]
				const counts = Object.entries(s.parts || {})
					.map(([k, v]) => `${k} ${Object.keys(v).length}`)
					.join(', ')
				const q = encodeURIComponent(n)
				return `<tr><td><b>${escapeHtml(n)}</b></td><td>${escapeHtml(
					String(s.savedAt || '')
						.replace('T', ' ')
						.slice(0, 16),
				)}</td><td>${escapeHtml(s.firmware || '')}</td><td>${escapeHtml(counts)}</td><td><a href="snapshot?name=${q}">Export</a> · <a href="#" onclick="del('${q}');return false">Delete</a></td></tr>`
			})
			.join('')
		return `<!doctype html><html><head><meta charset="utf-8"><title>V-160HD snapshots</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:15px system-ui,sans-serif;margin:24px;background:#16161a;color:#eee}h1{font-size:20px}table{border-collapse:collapse;width:100%;margin:16px 0}td,th{padding:8px;border-bottom:1px solid #333;text-align:left}a{color:#ffd400}.box{background:#222228;padding:16px;border-radius:8px;max-width:640px}button{background:#ffd400;border:0;padding:8px 14px;border-radius:6px;font-weight:600;cursor:pointer}input{padding:6px;margin:4px 0}#msg{margin-top:10px}</style></head><body>
<h1>V-160HD snapshots 🍹</h1>
<p>Saved set-ups for this connection (${escapeHtml(this.label || '')}). Save new ones with the <b>Snapshot: save</b> action; restore with <b>Snapshot: restore</b>.</p>
<table><tr><th>Name</th><th>Saved</th><th>Firmware</th><th>Holds</th><th></th></tr>${rows || '<tr><td colspan="5">None yet.</td></tr>'}</table>
<div class="box"><b>Import a snapshot file</b><br><input type="file" id="file" accept=".json,application/json"><br>
<input id="name" placeholder="Name (blank = the one in the file)"><br><button onclick="imp()">Import</button><div id="msg"></div></div>
<script>
async function imp(){const f=document.getElementById('file').files[0];const m=document.getElementById('msg');if(!f){m.textContent='Pick a file first.';return}
const n=document.getElementById('name').value;const r=await fetch('import'+(n?'?name='+encodeURIComponent(n):''),{method:'POST',headers:{'Content-Type':'application/json'},body:await f.text()});
const j=await r.json().catch(()=>({}));m.textContent=j.ok?'Imported as "'+j.name+'".':'Didn\\'t work: '+(j.error||r.status);if(j.ok)setTimeout(()=>location.reload(),800)}
async function del(q){if(!confirm('Delete '+decodeURIComponent(q)+'?'))return;await fetch('delete?name='+q,{method:'POST'});location.reload()}
</script></body></html>`
	},
}

function escapeHtml(s) {
	return String(s).replace(
		/[&<>"']/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
	)
}
