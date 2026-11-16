Pre-release for testing on a real V-160HD.

- **Polling off:** Program, Preview, Aux, PinP & Key and DSK sources are read on connect and again whenever the switcher reports a tally change. Before, with polling off, Program/Preview were never read, so Multi Tally and the source feedbacks had nothing to go on.
- **Connection page saves again:** the snapshot pickers had an empty "nothing picked" value, which Companion 5 counts as invalid, so Save stayed greyed out. They now use a real "—" choice.
- Includes rebel.7: every preset and old button gets all its options; hide rules work; Multi Tally wording.

101 tests.
