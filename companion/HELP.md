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

| Setting                                              | What it does                                                                                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Switcher IP address                                  | Where the V-160HD lives.                                                                                                                                    |
| Port                                                 | 8023. Leave it unless you know better.                                                                                                                      |
| LAN control password                                 | The 4 digits from MENU → LAN CONTROL.                                                                                                                       |
| Command set                                          | **Auto** (default) asks the switcher its firmware: 3.40+ gets Roland's named commands, older gets the low-level address commands. Force either if you like. |
| Polling                                              | Keeps feedbacks and variables in step with the panel. Now polite: one question at a time, never piling up.                                                  |
| Polling every (ms)                                   | How often. A round is skipped while the last is unanswered, so you can't swamp it.                                                                          |
| Answer timeout / Gap / Resends / Pause polling after | Fine tuning for the command queue. Leave them unless something's up.                                                                                        |
| Chatty log                                           | Everything sent and received, in the log.                                                                                                                   |

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

## Routing (all with the same source list)

Every routing action takes the same list, in the same order: **Input 1-20, HDMI 1-8, SDI 1-8, Still 1-16**. Turn on the expression switch and feed it a variable: `INPUT11`, `HDMI2`, `STILL5`, or just `11` for Input 11.

- **Route: Program (PGM) source** / **Route: Preview (PVW) source**
- **Route: Aux source** (Aux 1-3)
- **Route: PinP & Key source** (1-4). The two duplicate PinP source actions are now one.
- **Route: DSK key source** / **Route: DSK fill source** (DSK 1-2). Fill only counts in External Key mode, and Roland has no named command for it.
- **Route: give an input slot a source** (Input 1-20 ← HDMI, SDI, Still or N/A)
- **Transition: Cut** / **Transition: Auto**, optionally straight to a source, Auto with a time (0-4 s)
- **Output fade (fade to black)**: toggle, out or in

The action recorder works: switch things on the panel while recording and they turn up as actions.

## Everything else

Output assign, aux mute and link, PinP & Key on/off on PGM or PVW, every PinP & Key parameter (position, size, crop, border, chroma and the rest), DSK on/off and type, transitions, panel buttons, memories (load, save, initialise), macros 1-100, freeze, and camera control (PTZ, zoom, focus, exposure, presets, tally), plus **Send a raw command** for anything else.

**PnP & Key: allow on the Program / Sub Program layer** is the layer setting, not "put it on air". For on air, use **PnP & Key: on/off on PGM or PVW**. (That mix-up is probably upstream issue #24.)

## Feedbacks

- **Tally: source is on Program / Preview**: any of the 52 sources (Input 1-20 included), program, preview, both or either.
- **Route: source is on a destination**: PGM, PVW, Aux, PinP & Key, DSK key or fill. An input and the HDMI/SDI it's given count as the same picture.
- **Route: input slot has a source**, **Output fade: faded to black**, **Memory: last loaded**
- Plus aux mute and link, output assign, PinP & Key on air, freeze.

## Variables

`$(v160hd:pgm)`, `pvw`, `aux1`-`aux3`, `pnpkey1_source`-`pnpkey4_source`, `dsk1_source`, `dsk1_fill`…, `input1_assign`-`input20_assign`, `tally_input1`-`tally_input20`, `tally_hdmi1`…, `memoryname_1`-`memoryname_30`, `lastmemorynumber`, `lastmemoryname`, `version`, `protocol` and the rest. (Swap `v160hd` for your connection's name.)

## Presets

- **Cut and Auto**, and **Cut straight to Input 1-20**
- **Program** and **Preview**: Input 1-20, plus HDMI, SDI and Stills
- **Aux 1-3**, **PinP & Key 1-4** (with on/off), **DSK 1-2** (with on/off): Input 1-20
- **Memories 1-30**, labelled with their names from the switcher, lit when loaded
- **Macros 1-100**
- **Freeze and output fade**
- **Cameras**: pick one of 16, then pan, tilt and zoom (hold), and recall presets 1-10

## Not tested on every firmware

Built against Roland's documents and the community module's production fixes. If something on your firmware doesn't behave, turn on **Chatty log**, try it, and open an issue with the log: https://github.com/nisted/companion-module-roland-v160hd/issues
