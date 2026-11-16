Pre-release for testing on a real V-160HD.

**Lag fix**
- Replies from the switcher are gathered for 50 ms, then only the feedbacks and variables whose values actually changed go to Companion. Before, every reply redrew every feedback and re-sent every variable. Button presses still show straight away.

**Wording back to upstream**
- Action and feedback names and option labels are upstream's again (Select PGM Source, Assign Aux, Set DSK Key Source, Tally State, Aux Tally State and so on). Shown text says **PinP** throughout, Roland's own term. Ids are unchanged, so buttons keep working.
- PinP & Key Enable/Disable and PinP & Key Bus Select (issue #24): upstream names, with tooltips and descriptions saying which is the layer setting and which is on/off air.

**One tally feedback**
- **Tally State** is now the one tally feedback (the full look). Out of the box it shows everything. Switch on **Change default behaviour** to pick the state (main sources, or the switcher's own Program/Preview/Both/Either tally), which markers show, and its own colours.
- Old Tally State buttons and rebel.4's Tally: full look are upgraded. Old Tally State buttons keep their Program/Preview choice with markers off; their own button colours can't be carried over, so they use the tally colours.

**Presets**
- Program and Preview buttons show just the source name (no PGM/PVW text).

87 tests.
