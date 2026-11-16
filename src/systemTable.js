'use strict'

/**
 * The switcher's system settings (System Parameter Area, 02 xx xx), from Roland's
 * V-160HD Remote Control Guide v3.30 (Apr 2025).
 *
 * Each setting: id, name, addr (6 hex), menu, values [{ v, label }], risky?, size (1 or 2).
 * risky = can take the output off air (frame rate, system format, output formats,
 * HDCP, reference). Those sit behind their own connection switch.
 *
 * Left out (flagged in the spec): reference clock/line adjust (02 01 05-08), CUT/AUTO
 * SW assign (02 01 0E-0F, labels garbled in Roland's PDF), CTL A/B, EXP,
 * GPI and keypad assigns (numbers not documented: to probe on the unit). Their raw bytes
 * still travel in snapshots.
 */

const MENUS = [
	{ id: 'system', name: 'System' },
	{ id: 'display', name: 'Display and meters' },
	{ id: 'multiview', name: 'Multi-view' },
	{ id: 'test', name: 'Test signals' },
	{ id: 'inputview', name: '16 INPUT-VIEW layout' },
	{ id: 'panellock', name: 'Panel lock' },
	{ id: 'memory', name: 'Preset memory' },
	{ id: 'autoswitch', name: 'Auto switching' },
	{ id: 'rs232', name: 'RS-232, tally and GPO' },
	{ id: 'risky', name: 'Formats and sync (risky)' },
]

const list = (...labels) => labels.map((label, v) => ({ v, label }))
const OFFON = list('Off', 'On')
const DISEN = list('Disable', 'Enable')
const METER = list('Off', 'Left', 'Right')
const range = (from, to, fmt) => {
	const out = []
	for (let v = from; v <= to; v++) out.push({ v, label: fmt(v) })
	return out
}
const SECS_0_4 = range(0, 40, (v) => `${(v / 10).toFixed(1)} s`)
const SCAN_TIME = range(0, 120, (v) => (v === 0 ? 'Off' : `${v} s`))
const h = (n) => n.toString(16).padStart(2, '0').toUpperCase()

const SETTINGS = []
const add = (menu, sub, byte, id, name, values, extra = {}) =>
	SETTINGS.push({ menu, id, name, addr: '02' + sub + h(byte), values, size: 1, ...extra })

// ── 02 01: SYSTEM ───────────────────────────────────────────────────────────
add('risky', '01', 0x00, 'hdcp', 'HDCP', OFFON, { risky: true })
add(
	'risky',
	'01',
	0x01,
	'frame_rate',
	'Frame rate',
	list('60 Hz', '59.94 Hz', '50 Hz', '30 Hz', '29.97 Hz', '25 Hz', '24 Hz', '23.98 Hz'),
	{ risky: true },
)
add('risky', '01', 0x02, 'usb_rate', 'USB OUT rate', list('Half rate', 'Normal'), { risky: true })
add('risky', '01', 0x03, 'system_format', 'System format', list('1080p', '720p'), { risky: true })
add(
	'risky',
	'01',
	0x04,
	'reference',
	'Reference',
	list('Internal', 'External', ...range(1, 8, (i) => `SDI ${i}`).map((x) => x.label)),
	{ risky: true },
)
add('system', '01', 0x09, 'bluetooth', 'Bluetooth', OFFON)
add('system', '01', 0x0a, 'panel_operation', 'Panel operation', list('A/B', 'PGM/PST', 'Dissolve', 'PGM/PST (20)'))
add('system', '01', 0x0b, 'transition_sync', 'Effect transition sync', OFFON)
add('system', '01', 0x0c, 'effect_spot', 'Effect spot', DISEN)
add('system', '01', 0x0d, 'aux_link_mode', 'Aux linked PGM mode', list('Off', 'Auto link', 'Manual link'))
add('system', '01', 0x10, 'fade_video', 'Output fade (video)', list('N/A', 'Black', 'White', 'Aux 1', 'Aux 2', 'Aux 3'))
add('system', '01', 0x11, 'fade_audio', 'Output fade (audio)', DISEN)
const MONITOR = list(
	'N/A',
	'Multi-view',
	'16 Input-view',
	'16 Still-view',
	'Program',
	'Sub Program',
	'Preview',
	'Aux 1',
	'Aux 2',
	'Aux 3',
	'DSK 1 source',
	'DSK 2 source',
)
for (let i = 1; i <= 4; i++) add('system', '01', 0x15 + i, `monitor${i}`, `Monitor SW ${i}`, MONITOR)
add('system', '01', 0x33, 'aux_sw_mode', 'AUX SW mode', list('Aux', 'Memory', 'Macro'))
for (let i = 1; i <= 3; i++) add('system', '01', 0x53 + i, `aux${i}_linked`, `Aux ${i} linked to PGM`, OFFON)
add('display', '01', 0x1a, 'led_dimmer', 'LED dimmer', range(1, 8, String))
add('display', '01', 0x1b, 'lcd_dimmer', 'LCD dimmer', range(1, 8, String))
add(
	'display',
	'01',
	0x1c,
	'osd_position',
	'On-screen menu position',
	list('Upper left', 'Upper right', 'Lower left', 'Lower right'),
)
add('display', '01', 0x1d, 'tally_frame', 'Tally frame', OFFON)
add('display', '01', 0x1e, 'aux_indicator', 'Aux/source indicator', OFFON)
add('display', '01', 0x1f, 'rec_indicator', 'Rec indicator', OFFON)
add('display', '01', 0x20, 'meter', 'Audio level meter', OFFON)
add('display', '01', 0x21, 'meter_master', 'Meter: master output', METER)
add('display', '01', 0x22, 'meter_aux1', 'Meter: Aux 1', METER)
add('display', '01', 0x57, 'meter_aux2', 'Meter: Aux 2', METER)
add('display', '01', 0x58, 'meter_aux3', 'Meter: Aux 3', METER)
add('display', '01', 0x23, 'meter_usb', 'Meter: USB out', METER)
add('display', '01', 0x24, 'meter_audioin', 'Meter: audio in/USB/Bluetooth', list('Off', 'Lower', 'Upper'))
add('display', '01', 0x2a, 'out3_osd_menu', 'Output 3 OSD: on-screen menu', OFFON)
add('display', '01', 0x2b, 'out3_osd_tally', 'Output 3 OSD: tally frame', OFFON)
add('display', '01', 0x2c, 'out3_osd_label', 'Output 3 OSD: label/meter/mark', OFFON)
add('display', '01', 0x2d, 'auto_input_detect', 'Auto input detect', OFFON)
add('multiview', '01', 0x25, 'mv_label', 'Multi-view labels', OFFON)
add('multiview', '01', 0x26, 'mv_label_autohide', 'Multi-view label auto hide', OFFON)
add('multiview', '01', 0x27, 'mv_label_size', 'Multi-view label size', list('Small', 'Normal'))
const MV_LAYOUT = list(
	'Program',
	'Sub Program',
	'Preview',
	'Aux 1',
	'Aux 2',
	'Aux 3',
	'DSK 1 source',
	'DSK 2 source',
	'Black',
)
add('multiview', '01', 0x28, 'mv_layout_left', 'Multi-view layout: left', MV_LAYOUT)
add('multiview', '01', 0x29, 'mv_layout_right', 'Multi-view layout: right', MV_LAYOUT)
add(
	'test',
	'01',
	0x2e,
	'test_pattern',
	'Test pattern',
	list('Off', '75% colour bars', '100% colour bars', 'Ramp', 'Step', 'Hatch'),
)
add('test', '01', 0x2f, 'test_motion', 'Test pattern motion', list('Disable', 'Slow', 'Fast'))
add('test', '01', 0x30, 'test_tone', 'Test tone level', list('Off', '-20 dB', '-10 dB', '0 dB'))
add('test', '01', 0x31, 'tone_freq_l', 'Test tone frequency L', list('500 Hz', '1 kHz', '2 kHz'))
add('test', '01', 0x32, 'tone_freq_r', 'Test tone frequency R', list('500 Hz', '1 kHz', '2 kHz'))
add('risky', '01', 0x35, 'usb_format', 'USB OUT format', list('YUY2 & MJPEG', 'YUY2'), { risky: true })
add('risky', '01', 0x36, 'fmt_usb', 'Output format: USB OUT', list('1080p', '720p'), { risky: true })
const OUTFMT = list('1080p', '1080i')
add('risky', '01', 0x37, 'fmt_hdmi1', 'Output format: HDMI OUT 1', OUTFMT, { risky: true })
add('risky', '01', 0x38, 'fmt_hdmi2', 'Output format: HDMI OUT 2', OUTFMT, { risky: true })
for (let i = 1; i <= 3; i++)
	add('risky', '01', 0x38 + i, `fmt_sdi${i}`, `Output format: SDI OUT ${i}`, OUTFMT, { risky: true })
// 16 INPUT-VIEW: value order inferred from Roland's list (N/A, HDMI, SDI, Still, Input)
const VIEW_SOURCES = [{ v: 0, label: 'N/A' }]
for (let i = 1; i <= 8; i++) VIEW_SOURCES.push({ v: i, label: `HDMI ${i}`, src: `HDMI${i}` })
for (let i = 1; i <= 8; i++) VIEW_SOURCES.push({ v: 8 + i, label: `SDI ${i}`, src: `SDI${i}` })
for (let i = 1; i <= 16; i++) VIEW_SOURCES.push({ v: 16 + i, label: `Still ${i}`, src: `STILL${i}` })
for (let i = 1; i <= 20; i++) VIEW_SOURCES.push({ v: 32 + i, label: `Input ${i}`, src: `INPUT${i}` })
for (let i = 1; i <= 16; i++) add('inputview', '01', 0x3b + i, `inputview${i}`, `16 INPUT-VIEW box ${i}`, VIEW_SOURCES)

// ── 02 02: PANEL LOCK ───────────────────────────────────────────────────────
const LOCKS = []
for (let i = 1; i <= 10; i++) LOCKS.push(`A/PGM ${i}`)
for (let i = 1; i <= 10; i++) LOCKS.push(`B/PST ${i}`)
LOCKS.push(
	'Input assign',
	'Cut',
	'Auto',
	'Mode',
	'Aux',
	'Memory',
	'Macro',
	'Transition',
	'Video fader',
	'Split 1',
	'Sequencer block',
)
for (let i = 1; i <= 4; i++) LOCKS.push(`PinP & Key ${i} source`)
LOCKS.push('DSK 1 source', 'DSK 2 source')
for (let i = 1; i <= 4; i++) LOCKS.push(`Monitor ${i}`)
LOCKS.push('Output fade', 'Capture image')
for (let i = 1; i <= 4; i++) LOCKS.push(`User ${i}`)
LOCKS.push(
	'Audio in 1 volume',
	'Audio in 2 volume',
	'Audio in 3/4 volume',
	'Auto mixing',
	'Aux volume',
	'USB stream volume',
	'Master output volume',
)
LOCKS.push('Split 2', 'Split PGM center', 'Split PST center')
for (let i = 1; i <= 4; i++) LOCKS.push(`PinP & Key ${i} PVW`)
LOCKS.push('DSK 1 PVW', 'DSK 2 PVW')
for (let i = 1; i <= 4; i++) LOCKS.push(`PinP & Key ${i} PGM`)
LOCKS.push('DSK 1 PGM', 'DSK 2 PGM')
for (let i = 1; i <= 4; i++) LOCKS.push(`PinP & Key ${i} position H`)
LOCKS.push('DSK 1 level', 'DSK 2 level')
for (let i = 1; i <= 4; i++) LOCKS.push(`PinP & Key ${i} position V`)
LOCKS.push('DSK 1 gain', 'DSK 2 gain')
LOCKS.forEach((name, i) => add('panellock', '02', i, `lock_${i}`, `Panel lock: ${name}`, OFFON))

// ── 02 03: PRESET MEMORY ────────────────────────────────────────────────────
add('memory', '03', 0x00, 'mem_startup', 'Start-up memory', [
	{ v: 0, label: 'Last memory' },
	...range(1, 30, (i) => `Memory ${i}`),
])
add('memory', '03', 0x01, 'mem_protect', 'Memory protect', OFFON)
add('memory', '03', 0x02, 'mem_count', 'Number of memory switches', list('10', '30'))
add('memory', '03', 0x03, 'mem_fade_time', 'Memory fade time', SECS_0_4)
const FADE_T = ['Mix/Wipe', 'PinP & Key 1', 'PinP & Key 2', 'PinP & Key 3', 'PinP & Key 4', 'DSK 1', 'DSK 2']
FADE_T.forEach((n, i) => add('memory', '03', 0x04 + i, `mem_fade_${i}`, `Memory fade: ${n}`, OFFON))
const LOADS = [
	[0x0b, 'Video assign'],
	[0x0c, 'Video input'],
	[0x0d, 'Video output'],
	[0x0e, 'Transition time'],
	[0x0f, 'Mix/Wipe'],
	[0x10, 'Split 1'],
	[0x11, 'PinP & Key 1'],
	[0x12, 'DSK 1'],
	[0x13, 'Crosspoint'],
	[0x15, 'Audio input'],
	[0x16, 'Audio output'],
	[0x17, 'Audio follow'],
	[0x18, 'Auto mixing'],
	[0x19, 'Split 2'],
	[0x1a, 'PinP & Key 2'],
	[0x1b, 'PinP & Key 3'],
	[0x1c, 'PinP & Key 4'],
	[0x1d, 'DSK 2'],
	[0x1f, 'Aux 1'],
	[0x20, 'Aux 2'],
	[0x21, 'Aux 3'],
]
for (const [b, n] of LOADS) add('memory', '03', b, `mem_load_${h(b).toLowerCase()}`, `Memory loads: ${n}`, OFFON)
add('memory', '03', 0x14, 'mem_load_14', 'Memory loads: Video fader', list('Initialize', 'On'))
add('memory', '03', 0x1e, 'mem_startup_priority', 'Start-up priority', list('Memory', 'Panel'))
add('memory', '04', 0x00, 'still_save', 'Stills: save to internal storage', DISEN)
add('memory', '0C', 0x00, 'fill_key_mode', 'Roland FILL+KEY mode', list('Off', 'DSK 1', 'DSK 2'))

// ── 02 06: AUTO SWITCHING ───────────────────────────────────────────────────
add('autoswitch', '06', 0x00, 'as_switch', 'Auto switching', OFFON)
add(
	'autoswitch',
	'06',
	0x01,
	'as_type',
	'Auto switching type',
	list(
		'Input scan',
		'Preset memory scan',
		'BPM sync',
		'PinP & Key 1 scan',
		'PinP & Key 2 scan',
		'PinP & Key 3 scan',
		'PinP & Key 4 scan',
		'DSK 1 scan',
		'DSK 2 scan',
	),
)
add('autoswitch', '06', 0x02, 'as_input_seq', 'Input scan sequence', list('Normal', 'Reverse', 'Random'))
add('autoswitch', '06', 0x03, 'as_input_time', 'Input scan transition time', SECS_0_4)
add(
	'autoswitch',
	'06',
	0x04,
	'as_input_target',
	'Input scan target',
	list('PGM/A & PST/B', 'PinP & Key 1', 'PinP & Key 2', 'PinP & Key 3', 'PinP & Key 4', 'DSK 1', 'DSK 2'),
)
for (let i = 1; i <= 10; i++)
	add('autoswitch', '06', 0x04 + i, `as_scan_in${i}`, `Input scan time: Input ${i}`, SCAN_TIME)
for (let i = 11; i <= 20; i++)
	add('autoswitch', '06', 0x32 + i - 11, `as_scan_in${i}`, `Input scan time: Input ${i}`, SCAN_TIME)
add('autoswitch', '06', 0x0f, 'as_mem_seq', 'Memory scan sequence', list('Normal', 'Reverse', 'Random'))
for (let i = 1; i <= 30; i++)
	add('autoswitch', '06', 0x13 + i, `as_scan_mem${i}`, `Memory scan time: Memory ${i}`, SCAN_TIME)
add('autoswitch', '06', 0x10, 'as_bpm', 'BPM sync: BPM', range(20, 250, String), { size: 2 })
add('autoswitch', '06', 0x12, 'as_bpm_mode', 'BPM sync mode', list('Transition', 'Cut'))
add('autoswitch', '06', 0x13, 'as_bpm_speed', 'BPM sync speed', list('x1/4', 'x1/2', 'x1', 'x2'))

// ── 02 07/08 and 02 09: CTL/EXP type, RS-232, tally/GPO ─────────────────────
add('rs232', '07', 0x00, 'ctl1_type', 'CTL/EXP 1 type', list('Off', 'CTL A & CTL B', 'EXP'))
add('rs232', '08', 0x00, 'ctl2_type', 'CTL/EXP 2 type', list('Off', 'CTL A & CTL B', 'EXP'))
add('rs232', '09', 0x00, 'rs232', 'RS-232', OFFON)
add('rs232', '09', 0x01, 'rs232_baud', 'RS-232 baud rate', list('9600', '38400', '115200'))
add(
	'rs232',
	'09',
	0x02,
	'tally_template',
	'Tally/GPO template',
	list('HDMI tally', 'SDI tally', 'GPO', 'HDMI tally/GPO', 'SDI tally/GPO'),
)
// Tally/GPO 1-16 value order inferred from Roland's list: PGM then PST (HDMI, SDI, Still, Input), then GPO 1-16
const TALLY_SRC = []
const bank = (bus) => {
	for (let i = 1; i <= 8; i++) TALLY_SRC.push(`${bus} HDMI ${i}`)
	for (let i = 1; i <= 8; i++) TALLY_SRC.push(`${bus} SDI ${i}`)
	for (let i = 1; i <= 16; i++) TALLY_SRC.push(`${bus} Still ${i}`)
	for (let i = 1; i <= 20; i++) TALLY_SRC.push(`${bus} Input ${i}`)
}
bank('PGM')
bank('PST')
for (let i = 1; i <= 16; i++) TALLY_SRC.push(`GPO ${i}`)
for (let i = 1; i <= 16; i++) add('rs232', '09', 0x02 + i, `tally_gpo${i}`, `Tally/GPO ${i}`, list(...TALLY_SRC))
const TALLY_EN = [
	[0x43, 'Aux 1'],
	[0x44, 'PinP & Key 1'],
	[0x45, 'PinP & Key 2'],
	[0x46, 'PinP & Key 3'],
	[0x47, 'PinP & Key 4'],
	[0x48, 'DSK 1'],
	[0x49, 'DSK 2'],
	[0x4a, 'Aux 2'],
	[0x4b, 'Aux 3'],
]
for (const [b, n] of TALLY_EN) add('rs232', '09', b, `tally_en_${h(b).toLowerCase()}`, `Tally follows: ${n}`, DISEN)

// ── 02 01 4C-53: USER SW 1-4 assign (2 bytes, list mapped on hardware: see userSw.js)
const { USER_SW_VALUES } = require('./userSw')
for (let i = 1; i <= 4; i++)
	add('usersw', '01', 0x4a + i * 2, `user_sw${i}`, `USER ${i} SW assign`, USER_SW_VALUES, { size: 2 })

/** Blocks read from the switcher (and kept whole in snapshots) */
const READ_BLOCKS = [
	{ addr: '020100', size: 0x59 },
	{ addr: '020200', size: 0x51 },
	{ addr: '020300', size: 0x22 },
	{ addr: '020400', size: 0x01 },
	{ addr: '020600', size: 0x3c },
	{ addr: '020700', size: 0x06 },
	{ addr: '020800', size: 0x06 },
	{ addr: '020900', size: 0x4c },
	{ addr: '020C00', size: 0x01 },
]

const BY_ID = new Map(SETTINGS.map((s) => [s.id, s]))

module.exports = { MENUS, SETTINGS, BY_ID, READ_BLOCKS, VIEW_SOURCES }
