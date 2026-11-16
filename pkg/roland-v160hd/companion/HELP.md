# Roland V-160HD (Rebel)

Your V-160HD, with every input slot in every destination, buttons that land first time, and a pile of ready-made presets. 🎬

> **Psst. This one's got mates. 🍹** V-160HD Rebel is part of a little crew of Companion modules: some brand new, some old favourites given a good tweak. Want to know who else is in the crew, or grab the freshest version of each one? It's all here: https://github.com/nisted/companion-modules

This is a rebel version of the community V-160HD module (thanks, Joseph Adams and Roope Berg). It drops in over it: your buttons and triggers are upgraded automatically.

## Before you start (on the switcher)

1. **MENU → LAN CONTROL**: set a 4-digit password. No password, no remote control.
2. Note the IP address (MENU → LAN CONTROL → INFORMATION).
3. **One LAN controller at a time.** Roland RCS over LAN will knock Companion off, and the other way round. RCS over USB is fine alongside.
4. Firmware 1.04 or later works. **3.40 or later** unlocks the good stuff (see below). Latest is 3.60.

## Connection settings

| Setting                                              | What it does                                                                                                                                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Switcher IP address                                  | Where the V-160HD lives.                                                                                                                                        |
| Port                                                 | 8023. Leave it unless you know better.                                                                                                                          |
| LAN control password                                 | The 4 digits from MENU → LAN CONTROL.                                                                                                                           |
| Command set                                          | **Auto** (default) asks the switcher its firmware: 3.40+ gets Roland's named commands, older gets the low-level address commands. Force either if you like.     |
| Polling                                              | Keeps feedbacks and variables in step with the panel. Now polite: one question at a time, never piling up.                                                      |
| Polling every (ms)                                   | How often. A round is skipped while the last is unanswered, so you can't swamp it.                                                                              |
| Answer timeout / Gap / Resends / Pause polling after | Fine tuning for the command queue. Leave them unless something's up.                                                                                            |
| Call input slots                                     | **XPT** (default) or **Input**: `XPT 1 - GFX-B (HDMI 3)` or `Input 1 - GFX-B (HDMI 3)`, everywhere the module names a slot.                                     |
| Preset button text                                   | **Label only** (default, `GFX-B`), **Label + input** (`XPT 1 / GFX-B`) or **Full** (`XPT 1 - GFX-B (HDMI 3)`).                                                  |
| Label refresh when polling is off                    | Only shows with polling off. Reads the labels every so often (30 s to start) in case someone changes them on the panel. With polling on they come with polling. |
| Allow system settings                                | On to start. Actions and presets for MENU → SYSTEM and friends.                                                                                                 |
| Allow risky system settings                          | Off to start. The ones that can take the output off air. See below.                                                                                             |
| Second press within (seconds)                        | How long a risky button waits for its second press. 5 to start.                                                                                                 |
| Tally State type                                     | **Both** (default), **Upstream** or **Full look**. Which tally feedbacks the connection offers. See below.                                                      |
| Tally colours, border, "Show … on"                   | Defaults for the **Multi Tally** feedback. See below.                                                                                                           |
| Snapshots                                            | Restore, rename or delete a saved snapshot (pick, then Save). See below.                                                                                        |
| Chatty log                                           | Everything sent and received, in the log.                                                                                                                       |

**Set connection settings** (an action) can change any of these from a button, or from a trigger on a variable. Fill in only what you want to change; blank means leave it. Impossible values (port 99999, an IP that isn't one) are skipped and logged, never saved.

Anything the action has set shows on this page as its value, marked _set by an action_, instead of the usual box. Want it back to normal? Tick **Change back** next to it and Save: you get back what you'd typed before, and the box is yours again.

## Why "named" commands matter (firmware 3.40+)

Roland added proper commands in 3.40 (`PGM:INPUT11;`, `AUX:AUX1,HDMI2;` and friends). With them:

- **Input 1-20 works in every destination**: Program, Preview, Aux 1-3, PinP & Key 1-4, DSK 1-2, Cut and Auto.
- **Input slots 1-20** can all be given a source (or set to nothing).
- **One-shot tally**: all 52 sources in a single answer.
- **Auto with its own time**, and fade to black on/off (not just toggle).

On older firmware everything still works in low-level mode. Pick Input 11-20 somewhere the switcher can't take it and you'll get a plain-words warning in the log saying it needs 3.40+.

## The "press it three times" fix

The old module fired status requests at the switcher in bursts and never checked the answers, so the switcher's buffer filled up and button presses got lost (upstream issue #21). Now:

- **One command on the wire at a time.** The next goes when the switcher answers (or the timeout runs out).
- **Your buttons jump the queue** ahead of polling.
- **Unanswered button commands are sent again** (once, by default). Toggles aren't, as twice would undo them.
- **Polling never piles up**, and takes a breather if the switcher goes quiet, then picks up again when it speaks.
- **ERR answers are logged in plain words** (out of range, overridden by another setting, and so on).
- **Memory names are read once** after connecting, not every round, and they're shown as text now.
- **Only what changed gets redrawn.** Replies are gathered for a moment (50 ms), then only the feedbacks and variables whose values actually changed go to Companion. Your own button presses still show straight away.

## Routing (all with the same source list)

Every routing action takes the same list, in the same order: **Input 1-20, HDMI 1-8, SDI 1-8, Still 1-16**. Turn on the expression switch and feed it a variable: `INPUT11`, `HDMI2`, `STILL5`, or just `11` for Input 11.

- **Select PGM Source** / **Select PVW Source**
- **Assign Aux** (Aux 1-3)
- **PinP & Key Set Source** (1-4). The two duplicate PinP source actions are now one.
- **Set DSK Key Source** / **Set DSK Fill Source** (DSK 1-2). Fill only counts in External Key mode, and Roland has no named command for it.
- **Assign Input** (Input 1-20 ← HDMI, SDI, Still or N/A)
- **Transition: Cut** / **Transition: Auto**, optionally straight to a source, Auto with a time (0-4 s)
- **Output fade (fade to black)**: toggle, out or in

The action recorder works: switch things on the panel while recording and they turn up as actions.

## Everything else

Output assign, aux mute and link, PinP & Key on/off on PGM or PVW (**PinP & Key Bus Select**), every PinP & Key parameter (position, size, crop, border, chroma and the rest), DSK on/off and type, transitions, panel buttons, memories (load, save, initialise), macros 1-100, freeze, and camera control (PTZ, zoom, focus, exposure, presets, tally), plus **Send a raw command** for anything else.

**PinP & Key Enable/Disable** is the layer setting (may this PinP/Key be used on the Program / Sub Program layer), not "put it on air". For on and off air, use **PinP & Key Bus Select**. The tooltips say so too. (That mix-up is probably upstream issue #24.)

## Labels (the multiview names)

The module reads the switcher's 40 labels (HDMI 1-8, SDI 1-8, Still 1-16, Program, Sub Program, Preview, Aux 1-3, DSK 1-2 source) and uses them everywhere: dropdowns, variables, preset text and the log.

- With a label: `GFX-B (HDMI 3)`, and for a slot `XPT 1 - GFX-B (HDMI 3)`.
- No label (blank, or just its own name): `HDMI 3` / `XPT 1 - HDMI 3`. No doubling up.
- Falls back custom label → default name → the slot itself (`XPT 5` when nothing's on it).
- **Label: set**: up to 8 characters. Takes variables, so a label can follow a custom variable or another module. Longer gets cut to 8 and logged.
- **Label: refresh**: reads them all again.
- **Label: matches text** (feedback): lights while a label says something, e.g. HDMI 3 is `GFX-B`.

## System settings

Monitor SW 1-4, multi-view layout and labels, test pattern and tone, dimmers, meters, OSD, panel lock, preset memory, auto switching, RS-232, tally/GPO and more, from Roland's Remote Control Guide v3.30. One action per menu (**System: Display and meters** and so on); pick the setting, then a value, or **Next** / **Previous** to step round. Every setting has a variable (`$(v160hd:sys_monitor1)`) and the **System: setting is** feedback.

Presets: a stepper for every setting (press to go to the next value, shows the current one), plus a button per value for the shorter lists.

**Risky ones** (frame rate, system format, output formats, HDCP, reference) can take the output off air. They only appear once **Allow risky system settings** is on, their actions say **⚠ RISKY**, their presets have a hazard border, and they want a **second press** within the confirm time. The button flashes while it waits.

**USER SW 1-4 assign** is in: **System: USER SW assign** (pick the switch, a category, then the item), a `sys_user_sw1`-`4` variable each, and presets. Roland doesn't publish these numbers, so they were mapped on a real V-160HD (firmware 3.60).

Not in yet: CTL A/B, EXP, GPI and keypad assigns (they use a different list, still to map). They do travel in snapshots.

## Snapshots ("this is my Hall 9")

- **Snapshot: save**: reads everything from the switcher and keeps it under a name. Pick parts if you like: system settings, risky settings, labels, input assigns, routing.
- **Snapshot: restore**: writes it back. Pick parts again if you like. Only what the snapshot holds is changed; the rest is left alone. If it holds risky settings, press twice.
- **Snapshot: delete** (press twice).
- On the connection page: restore, rename or delete (pick, then Save).
- **Export and import as files** on the connection's web page: `http://<Companion address>:8000/instance/<connection name>/`. Handy for sharing a Hall 9 between rigs, or keeping a backup.

Snapshots live in the connection's settings, so they go wherever a Companion export goes.

## Tally State and Multi Tally

Two tally feedbacks. **Tally State type** on the connection page decides which this connection offers: **Both** (default), **Upstream** (Tally State only) or **Full look** (Multi Tally only). Changing it after buttons are set up can break their style overrides, so set it once.

**Tally State** is upstream's feedback, unchanged: on or off from the switcher's own tally, **Indicate in X State** = **Program (A)**, **Preview (B)** or **Both**, and your style overrides do the colouring. The switcher's tally also counts a source that's on air inside a PinP, key or DSK.

**Multi Tally** draws the full look:

- **Red** when it's the main Program source, **green** on Preview, **red with a green border** on both.
- **PinP**: yellow squares in the corners, laid out like the panel. P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- **Key**: the same corners, but round (K1-K4).
- **DSK**: pink-purple squares, D1 top centre, D2 bottom centre.
- **Aux**: green markers down the right-hand side, Aux 1-3 between the P2 and P4 corners.
- Filled marker with black text = on Program. Black marker with coloured text = on Preview.

The connection page sets the colours and which sources show each group (all of them to start). Tick **Change default behaviour** on a button to choose which markers show (**Show**, **Hide**, or **Default** = as the connection page says); tick **Customise colours** to set its own colours. Unticked, their options stay hidden. On Companion 5, Multi Tally's style overrides pick from its outputs (background colour, picture).

The Program, Preview and Cut presets use Multi Tally (or, with Upstream, Tally State: green on Preview, red on Program).

**Upgrading from rebel.5:** Tally State buttons go back to upstream's Tally State, so their own style overrides work again ("Either" becomes Program (A)). Full-look buttons become Multi Tally. A button dragged in from a rebel.5 preset may come back as Tally State with no style: drag the preset in again.

## Every option has a value

Companion 5 skips an action or feedback if any of its options is blank, even a hidden one. Every preset now carries all its options, and the rebel.7 upgrade fills blank options on buttons made before (system settings, USER SW assign, System: setting is, Multi Tally).

## Feedbacks

- **Route: source is on a destination**: PGM, PVW, Aux, PinP & Key, DSK key or fill. An input and the HDMI/SDI it's given count as the same picture.
- **Route: input slot has a source**, **Output fade: faded to black**, **Memory: last loaded**
- **Aux Tally State**, **PinP/Key Source State**, plus aux mute and link, output assign, PinP & Key on air, freeze.

## Variables

`label_hdmi1`… (the raw labels), `name_input1`… (the preset-text form), `fullname_input1`… (the full form), `sys_…` (every system setting), `snapshot_count`, `snapshot_names`, and `$(v160hd:pgm)`, `pvw`, `aux1`-`aux3`, `pnpkey1_source`-`pnpkey4_source`, `dsk1_source`, `dsk1_fill`…, `input1_assign`-`input20_assign`, `tally_input1`-`tally_input20`, `tally_hdmi1`…, `memoryname_1`-`memoryname_30`, `lastmemorynumber`, `lastmemoryname`, `version`, `protocol` and the rest. (Swap `v160hd` for your connection's name.)

## Presets

- **Cut and Auto**, and **Cut straight to Input 1-20**
- **Program** and **Preview**: Input 1-20, plus HDMI, SDI and Stills. The button shows just the source name; Multi Tally colours it.
- **Aux 1-3**, **PinP & Key 1-4** (with on/off), **DSK 1-2** (with on/off): Input 1-20
- **Memories 1-30**, labelled with their names from the switcher, lit when loaded
- **Macros 1-100**
- **Freeze and output fade**
- **Cameras**: pick one of 16, then pan, tilt and zoom (hold), and recall presets 1-10
- **Labels** (refresh) and **Snapshots** (save and restore 1-4)
- **System settings**, one section per menu (if allowed on the connection page)

Source presets show the label live, in the form picked on the connection page.

## Not tested on every firmware

Built against Roland's documents and the community module's production fixes. If something on your firmware doesn't behave, turn on **Chatty log**, try it, and open an issue with the log: https://github.com/nisted/companion-module-roland-v160hd/issues
