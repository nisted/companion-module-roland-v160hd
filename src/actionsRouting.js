'use strict'

const sources = require('./sources')
const { route, assignSlot, transition } = require('./routing')
const { CONN_FIELDS, PROTOCOL_CHOICES } = require('./config')

const SOURCE_TIP =
	'Input 1-20, HDMI 1-8, SDI 1-8 or Still 1-16. With the expression switch on you can feed it a variable: INPUT11, HDMI2, STILL5, or just 11 for Input 11.'
const INPUT_11_20_TIP = ' Input 11-20 here needs firmware 3.40 or later (Auto picks that up).'

function sourceOption(label, extraTip) {
	return {
		type: 'dropdown',
		label: label || 'Source',
		id: 'source',
		default: 'INPUT1',
		choices: sources.sourceChoices(),
		tooltip: SOURCE_TIP + (extraTip || ''),
	}
}

function numberChoice(id, label, count, prefix) {
	const choices = []
	for (let i = 1; i <= count; i++) choices.push({ id: String(i), label: `${prefix} ${i}` })
	return { type: 'dropdown', label, id, default: '1', choices, tooltip: `1 to ${count}` }
}

function routingActions(self, actions) {
	actions.select_pgm = {
		name: 'Select PGM Source',
		description: 'Put a source straight on Program.',
		options: [sourceOption('Input')],
		callback: (a) => route(self, 'pgm', 1, a.options.source),
		learn: () => ({ source: sources.sourceFromHex(self.DATA.pgmsource)?.id ?? 'INPUT1' }),
	}

	actions.select_pvw = {
		name: 'Select PVW Source',
		description: 'Put a source on Preview, ready for the next Cut or Auto.',
		options: [sourceOption('Input')],
		callback: (a) => route(self, 'pvw', 1, a.options.source),
		learn: () => ({ source: sources.sourceFromHex(self.DATA.pvwsource)?.id ?? 'INPUT1' }),
	}

	actions.aux_assign = {
		name: 'Assign Aux',
		options: [numberChoice('aux', 'Aux', 3, 'Aux'), sourceOption('Input Type')],
		callback: (a) => route(self, 'aux', a.options.aux, a.options.source),
		learn: (a) => ({ source: sources.sourceFromHex(self.DATA[`aux${a.options.aux}source`])?.id ?? a.options.source }),
	}

	actions.pnpkey_setsource = {
		name: 'PinP & Key Set Source',
		options: [numberChoice('pinp', 'PinP/Key', 4, 'PinP/Key'), sourceOption('Source', INPUT_11_20_TIP)],
		callback: (a) => route(self, 'pinp', a.options.pinp, a.options.source),
		learn: (a) => ({
			source: sources.sourceFromHex(self.DATA[`pnpkey${a.options.pinp}source`])?.id ?? a.options.source,
		}),
	}

	actions.set_dsk_key_source = {
		name: 'Set DSK Key Source',
		description: 'In Alpha Key mode the switcher only takes Stills here.',
		options: [numberChoice('dsk', 'DSK', 2, 'DSK'), sourceOption('Input Type', INPUT_11_20_TIP)],
		callback: (a) => route(self, 'dskkey', a.options.dsk, a.options.source),
		learn: (a) => ({ source: sources.sourceFromHex(self.DATA[`dsk${a.options.dsk}source`])?.id ?? a.options.source }),
	}

	actions.set_dsk_fill_source = {
		name: 'Set DSK Fill Source',
		description:
			'Only takes effect when the DSK is in External Key mode. Roland has no named command for this, so Input 1-20 may be turned down.',
		options: [numberChoice('dsk', 'DSK', 2, 'DSK'), sourceOption('Input Type')],
		callback: (a) => route(self, 'dskfill', a.options.dsk, a.options.source),
		learn: (a) => ({ source: sources.sourceFromHex(self.DATA[`dsk${a.options.dsk}fill`])?.id ?? a.options.source }),
	}

	actions.input_assign = {
		name: 'Assign Input',
		description: 'Which physical source sits on Input 1-20.',
		options: [
			{
				type: 'dropdown',
				label: 'Input Channel',
				id: 'slot',
				default: 'INPUT1',
				choices: sources.slotChoices(),
				tooltip: 'Input 1-20. Slots 11-20 may be refused on firmware below 3.40.',
			},
			{
				type: 'dropdown',
				label: 'Input Type',
				id: 'source',
				default: 'HDMI1',
				choices: sources.physicalChoices(true),
				tooltip: 'HDMI 1-8, SDI 1-8, Still 1-16, or N/A for nothing (N/A needs firmware 3.40+).',
			},
		],
		callback: (a) => assignSlot(self, a.options.slot, a.options.source),
		learn: (a) => {
			const n = Number(String(a.options.slot).replace(/\D/g, '')) || 1
			const hex = Array.isArray(self.DATA.inputAssign) ? self.DATA.inputAssign[n - 1] : undefined
			return { source: sources.sourceFromHex(hex)?.id ?? a.options.source }
		},
	}

	actions.cut = {
		name: 'Transition: Cut',
		description: 'Cut, optionally straight to a source.',
		options: [
			{
				type: 'textinput',
				label: 'To source (blank = whatever is on Preview)',
				id: 'source',
				default: '',
				tooltip: SOURCE_TIP + ' Leave blank to cut to Preview.',
			},
		],
		callback: (a) => transition(self, 'cut', a.options.source),
	}

	actions.auto = {
		name: 'Transition: Auto',
		description: 'Auto transition, optionally to a source and with its own time.',
		options: [
			{
				type: 'textinput',
				label: 'To source (blank = whatever is on Preview)',
				id: 'source',
				default: '',
				tooltip: SOURCE_TIP + ' Leave blank to take Preview.',
			},
			{
				type: 'textinput',
				label: "Time in seconds (blank = the switcher's own)",
				id: 'time',
				default: '',
				tooltip: '0 to 4 seconds, in tenths (e.g. 1.5). Needs firmware 3.40+; older firmware uses its own time.',
			},
		],
		callback: (a) => transition(self, 'auto', a.options.source, a.options.time),
	}
}

function extraActions(self, actions) {
	actions.ftb = {
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
		callback: (a) => {
			const mode = String(a.options.mode || 'toggle').toLowerCase()
			if (self.PROTOCOL === 'named') {
				if (mode === 'on') self.sendNamed('FTB:ON')
				else if (mode === 'off') self.sendNamed('FTB:OFF')
				else self.sendNamed('FTB', { repeatable: false })
				self._read('QFTB;', 'FTB')
			} else {
				self.sendCommand('0B004E', '01', { repeatable: false })
				self.sendCommand('0B004E', '00')
			}
		},
	}

	actions.raw_command = {
		name: 'Send a raw command',
		description:
			'For anything the module has no action for. DTH:/RQH: address commands, or a named command like PGM:INPUT3 on firmware 3.40+.',
		options: [
			{
				type: 'textinput',
				label: 'Command',
				id: 'cmd',
				default: '',
				tooltip: "For example DTH:002100,2A, QPGM or GPO:GPO1,ON. A missing ';' is added.",
			},
		],
		callback: (a) => {
			const c = String(a.options.cmd ?? '').trim()
			if (c) self.sendRawCommand(c)
		},
	}

	// Set connection settings: every field, blank = leave as is
	const settingOptions = Object.keys(CONN_FIELDS).map((f) => {
		const def = CONN_FIELDS[f]
		let tip = ''
		if (def.kind === 'int') tip = `A whole number from ${def.min} to ${def.max}.`
		if (def.kind === 'ip') tip = 'An IP address, like 192.168.0.1.'
		if (def.kind === 'choice')
			tip = `One of: ${f === 'protocol' ? PROTOCOL_CHOICES.map((c) => c.id).join(', ') : def.choices.join(', ')}.`
		if (def.kind === 'colour') tip = 'A colour like #FF0000.'
		if (def.kind === 'list') tip = 'Sources, comma separated: INPUT1, HDMI3, STILL2…'
		if (def.kind === 'bool') tip = 'on or off (true/false, 1/0 work too).'
		return {
			type: 'textinput',
			label: def.label,
			id: f,
			default: '',
			tooltip: `${tip} Blank = leave as is. Impossible values are skipped and logged.`,
		}
	})
	actions.set_settings = {
		name: 'Set connection settings',
		description:
			"Changes this connection's settings. Fill in only what you want to change; blank = leave as is. Anything set here shows on the connection page with a 'Change back' tick. Put it in a trigger on \"variable changed\" to drive the connection from a variable.",
		options: settingOptions,
		callback: (a) => self.setSettingsByAction(a.options),
	}
}

module.exports = { routingActions, extraActions }
