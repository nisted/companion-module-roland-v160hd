Pre-release for testing on a real V-160HD. Fixes buttons Companion 5 was skipping.

- **Blank options:** Companion 5 skips an action or feedback if any option is blank, even a hidden one. System setting presets, USER SW assign, System: setting is and Multi Tally presets only filled some options, so they never ran. Every preset now carries every option, and an upgrade fills blank options on existing buttons. Two upstream defaults that were never valid (Aux mute, Freeze enable) are fixed too.
- **Hiding works:** Change default behaviour, Customise colours, the system Setting and the USER SW Category no longer have an expression toggle. Companion only allows hide rules on fields without one.
- **Multi Tally wording:** marker choices are Show (default), Hide, Default (as the connection page says); "Own colours" is now "Customise colours".

96 tests.
