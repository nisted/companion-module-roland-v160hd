const { combineRgb } = require('@companion-module/base')
const { sourceFeedbacks } = require('./feedbacksSources')

module.exports = {
	initFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red

		feedbacks.auxMute = {
			type: 'boolean',
			name: 'Aux Mute State',
			description: 'Indicate if Aux Channel is Muted',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
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
			callback: function (feedback, bank) {
				let opt = feedback.options

				if (opt.aux == 'aux1') {
					if (self.DATA.aux1mute == opt.mute) {
						return true
					}
				}

				if (opt.aux == 'aux2') {
					if (self.DATA.aux2mute == opt.mute) {
						return true
					}
				}

				if (opt.aux == 'aux3') {
					if (self.DATA.aux3mute == opt.mute) {
						return true
					}
				}

				return false
			},
		}

		feedbacks.outputAssign = {
			type: 'boolean',
			name: 'Output Assign State',
			description: 'Indicate if Output is Assigned to a specific Source',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Output',
					id: 'output',
					default: self.CHOICES_OUTPUTS[0].id,
					choices: self.CHOICES_OUTPUTS,
				},
				{
					type: 'dropdown',
					label: 'Type',
					id: 'assign',
					default: self.CHOICES_OUTPUTSASSIGN[0].id,
					choices: self.CHOICES_OUTPUTSASSIGN,
				},
			],
			callback: function (feedback, bank) {
				let opt = feedback.options

				if (opt.output == '00000A') {
					//hdmi 1 output
					if (self.DATA.hdmi1assign == opt.assign) {
						return true
					}
				}

				if (opt.output == '00000B') {
					//hdmi 2 output
					if (self.DATA.hdmi2assign == opt.assign) {
						return true
					}
				}

				if (opt.output == '00000C') {
					//hdmi 3 output
					if (self.DATA.hdmi3assign == opt.assign) {
						return true
					}
				}

				if (opt.output == '00000D') {
					//sdi 1 output
					if (self.DATA.sdi1assign == opt.assign) {
						return true
					}
				}

				if (opt.output == '00000E') {
					//sdi 2 output
					if (self.DATA.sdi2assign == opt.assign) {
						return true
					}
				}

				if (opt.output == '00000F') {
					//sdi 3 output
					if (self.DATA.sdi3assign == opt.assign) {
						return true
					}
				}

				if (opt.output == '000110' || opt.output == '000010') {
					// usb output. CHOICES_OUTPUTS' own id for USB is '000110';
					// '000010' is accepted as a compatibility alias so buttons
					// saved before this fix keep working. Both read the same
					// DATA.usbassign field.
					if (self.DATA.usbassign == opt.assign) {
						return true
					}
				}

				return false
			},
		}

		feedbacks.auxLinkMode = {
			type: 'boolean',
			name: 'Aux Link Mode',
			description: 'Indicate if Aux Link Mode is Off, Auto Link, or Manual Link',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
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
			callback: function (feedback, bank) {
				let opt = feedback.options

				if (self.DATA.auxlinkmode == opt.mode) {
					return true
				}

				return false
			},
		}

		feedbacks.auxLink = {
			type: 'boolean',
			name: 'Aux Link State',
			description: 'Indicate if Aux Channel is Linked to PGM',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
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
			callback: function (feedback, bank) {
				let opt = feedback.options

				if (opt.aux == 'aux1') {
					if (self.DATA.aux1link == opt.link) {
						return true
					}
				}

				if (opt.aux == 'aux2') {
					if (self.DATA.aux2link == opt.link) {
						return true
					}
				}

				if (opt.aux == 'aux3') {
					if (self.DATA.aux3link == opt.link) {
						return true
					}
				}

				return false
			},
		}

		feedbacks.keyOnAir = {
			type: 'boolean',
			name: 'Key is Selected on Bus',
			description: 'Indicate if Key is Selected on Bus',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'PinP/Key',
					id: 'pinp',
					default: '1B',
					choices: [
						{ id: '1B', label: 'PinP/Key 1' },
						{ id: '1C', label: 'PinP/Key 2' },
						{ id: '1D', label: 'PinP/Key 3' },
						{ id: '1E', label: 'PinP/Key 4' },
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
			callback: function (feedback, bank) {
				let opt = feedback.options

				let val = self.DATA[`data_${opt.pinp}${opt.bus}`]

				if (val !== undefined && val == opt.onoff) {
					return true
				}

				return false
			},
		}

		feedbacks.freeze = {
			type: 'boolean',
			name: 'Freeze State',
			description: 'Indicate if Freeze is On or Off',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [],
			callback: function (feedback, bank) {
				let opt = feedback.options

				// Reads the effective value: a locally-pending, not-yet-
				// confirmed value if one exists, otherwise the last real
				// device-confirmed DATA.freeze. See src/api.js's _freezeValue.
				if (self._freezeValue('freeze') == '01') {
					return true
				}

				return false
			},
		}

		sourceFeedbacks(self, feedbacks)
		self.labelFeedbacks(feedbacks)
		self.systemFeedbacks(feedbacks)
		self.tallyFeedbacks(feedbacks)
		self._feedbackIds = Object.keys(feedbacks)
		self.feedbackDefs = feedbacks
		self.setFeedbackDefinitions(feedbacks)
	},
}
