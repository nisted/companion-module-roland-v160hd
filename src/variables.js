'use strict'

const sources = require('./sources')

/** Full name for a source the switcher reported: XPT 1 - GFX-B (HDMI 3) */
const named = (self, hex) => {
	const s = sources.sourceFromHex(hex)
	return s ? self.sourceName(s.id, 'full') : ''
}
const onOff = (v) => (v == '01' ? 'On' : 'Off')
const tallyText = (st) => (st & 0x01 ? 'Program' : st & 0x02 ? 'Preview' : 'Off')

module.exports = {
	initVariables: function () {
		const v = {}
		const add = (id, name) => (v[id] = { name })

		add('model', 'Model')
		add('version', 'Firmware version')
		add('protocol', 'Command set in use (named or lowlevel)')

		for (const s of sources.SOURCES) add(`tally_${s.id.toLowerCase()}`, `Tally: ${s.label}`)
		// Older name for Input 1-10 tally, kept so existing buttons keep working
		for (let i = 1; i <= 10; i++) add(`tally_xpt${i}`, `Tally: Input ${i} (old name)`)

		add('pgm', 'Program source')
		add('pvw', 'Preview source')
		for (let i = 1; i <= 3; i++) add(`aux${i}`, `Aux ${i} source`)
		for (let i = 1; i <= 4; i++) {
			add(`pnpkey${i}_source`, `PinP & Key ${i} source`)
			add(`pnpkey${i}_pgm`, `PinP & Key ${i} on PGM`)
			add(`pnpkey${i}_pvw`, `PinP & Key ${i} on PVW`)
		}
		for (let i = 1; i <= 2; i++) {
			add(`dsk${i}_source`, `DSK ${i} key source`)
			add(`dsk${i}_fill`, `DSK ${i} fill source`)
		}
		for (let i = 1; i <= 20; i++) add(`input${i}_assign`, `Input ${i} is given`)

		add('hdmi1', 'HDMI Output 1 Source')
		add('hdmi2', 'HDMI Output 2 Source')
		add('hdmi3', 'HDMI Output 3 Source')
		add('sdi1', 'SDI Output 1 Source')
		add('sdi2', 'SDI Output 2 Source')
		add('sdi3', 'SDI Output 3 Source')
		add('usb', 'USB Output Source')

		for (let i = 1; i <= 3; i++) {
			add(`aux${i}_mute`, `Aux ${i} mute`)
			add(`aux${i}link`, `Aux ${i} linked to PGM`)
		}
		add('auxlink_mode', 'Aux link mode')
		add('freeze', 'Freeze')
		add('ftb', 'Output fade (firmware 3.40+)')

		for (let i = 1; i <= 30; i++) add(`memoryname_${i}`, `Memory ${i} name`)
		add('lastmemorynumber', 'Last memory loaded (number)')
		add('lastmemoryname', 'Last memory loaded (name)')
		this.labelVariableDefs(add)
		this.systemVariableDefs(add)
		this.snapshotVariableDefs(add)

		this.setVariableDefinitions(v)
	},

	checkVariables: function () {
		let self = this
		try {
			const D = self.DATA || {}
			const v = {
				model: self.MODEL,
				version: self.VERSION,
				protocol: self.PROTOCOL,
				pgm: named(self, D.pgmsource),
				pvw: named(self, D.pvwsource),
			}
			for (const s of sources.SOURCES) v[`tally_${s.id.toLowerCase()}`] = tallyText((self.TALLY || {})[s.id] || 0)
			for (let i = 1; i <= 10; i++) v[`tally_xpt${i}`] = v[`tally_input${i}`]
			for (let i = 1; i <= 3; i++) {
				v[`aux${i}`] = named(self, D[`aux${i}source`])
				v[`aux${i}_mute`] = onOff(D[`aux${i}mute`])
				v[`aux${i}link`] = onOff(D[`aux${i}link`])
			}
			const pk = ['1B', '1C', '1D', '1E']
			for (let i = 1; i <= 4; i++) {
				v[`pnpkey${i}_source`] = named(self, D[`pnpkey${i}source`])
				v[`pnpkey${i}_pgm`] = onOff(D[`data_${pk[i - 1]}00`])
				v[`pnpkey${i}_pvw`] = onOff(D[`data_${pk[i - 1]}01`])
			}
			for (let i = 1; i <= 2; i++) {
				v[`dsk${i}_source`] = named(self, D[`dsk${i}source`])
				v[`dsk${i}_fill`] = named(self, D[`dsk${i}fill`])
			}
			for (let i = 1; i <= 20; i++) {
				v[`input${i}_assign`] = Array.isArray(D.inputAssign) ? named(self, D.inputAssign[i - 1]) : ''
			}
			const out = (hex) => (self.CHOICES_OUTPUTSASSIGN.find((x) => x.id == hex) || {}).label ?? hex
			v.hdmi1 = out(D.hdmi1assign)
			v.hdmi2 = out(D.hdmi2assign)
			v.hdmi3 = out(D.hdmi3assign)
			v.sdi1 = out(D.sdi1assign)
			v.sdi2 = out(D.sdi2assign)
			v.sdi3 = out(D.sdi3assign)
			v.usb = out(D.usbassign)
			v.auxlink_mode =
				D.auxlinkmode == '00' ? 'Off' : D.auxlinkmode == '01' ? 'Auto Link' : D.auxlinkmode == '02' ? 'Manual Link' : ''
			v.freeze = self._freezeValue('freeze') == '01' ? 'On' : 'Off'
			v.ftb = String(D.ftb || '')
			for (let i = 0; i < 30; i++) v[`memoryname_${i + 1}`] = D[`memory${i}`] ?? ''
			if (D.lastMemory !== undefined && Number.isFinite(D.lastMemory)) {
				v.lastmemorynumber = D.lastMemory + 1
				v.lastmemoryname = D[`memory${D.lastMemory}`] ?? ''
			}
			self.labelVariableValues(v)
			self.systemVariableValues(v)
			self.snapshotVariableValues(v)
			self.setVariableValues(v)
		} catch (error) {
			self.log('error', 'Error setting variables: ' + String(error))
		}
	},
}
