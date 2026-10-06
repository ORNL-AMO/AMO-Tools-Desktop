# Process Heating Assessment Snapshot Tests

Golden-master tests for the process-heating-assessment module. The fixtures and snapshots here are
ported from the legacy suite in `src/app/phast/snapshot-tests/` (see its `README.md` for how snapshots
are captured and why a failing snapshot means the code is wrong, not the snapshot). The legacy
`PhastResultsService` output is the reference; the new module's calculators must reproduce it.

## What lives here

```
snapshot-tests/
├── fixtures/                       Copies of the legacy fixtures (exported assessments)
├── snapshots/                      Copies of the legacy snapshots (legacy PhastResults output)
├── snapshot-fixtures.ts            Registry of every fixture + snapshot pair (FIXTURES)
├── snapshot.helper.ts              Service wiring shared by all specs
├── <name>.snapshot.spec.ts         One legacy-results spec per fixture (copy of the legacy spec)
├── scenario-roundtrip.snapshot.spec.ts   Every FIXTURES entry through scenarioOverrides
├── new-calc-services.snapshot.spec.ts    New per-loss calculators vs. snapshot totals
├── charge-material-results.snapshot.spec.ts  New charge material results vs. snapshot totals
└── flue-gas-by-mass.snapshot.spec.ts     Live legacy vs. new, for By Mass cases no fixture covers
```

The `EAF Dummy Values`, `Steam Synthetic` and `Custom Electrotechnology Synthetic` fixtures are synthetic, not real
assessments, and are to be replaced with real ones later. `EAF Dummy Values` was captured in the legacy folder and
ported; the Steam and Custom Electrotechnology fixtures (and their `steam` and `custom-electrotechnology` specs) exist only
in this module, with snapshots captured here from the legacy `PhastResultsService`.

Snapshots are never written here first for a shared fixture. Capture them in the legacy folder, then copy.

## Keeping the two folders in sync

`npm run check:phast-snapshot-drift` (part of `pretest`) compares every fixture and snapshot filename
present in both folders and fails if the JSON differs. It does not require a file to exist in both, so
a fixture missing from this folder is not flagged; it just goes untested here.

## Porting a fixture from legacy

Replace `<name>` with the fixture's name, e.g. `20-1367-By-Mass` (fixture) and `20-1367-by-mass`
(snapshot and spec names are lowercased by the legacy scaffold).

1. **Capture in legacy first.** Follow "Adding a new fixture" in the legacy README
   (`npm run snapshot:add -- "<name>.json"`) and confirm the snapshot has an entry for `baseline` and
   every `modification_<n>`. A failed capture can still write a file with only some entries.
2. **Copy the fixture and snapshot** with identical filenames:
   - `src/app/phast/snapshot-tests/fixtures/<name>.json` to `fixtures/<name>.json`
   - `src/app/phast/snapshot-tests/snapshots/<name>.snap.json` to `snapshots/<name>.snap.json`
3. **Copy the spec** `phast-<name>.snapshot.spec.ts` to `<name>.snapshot.spec.ts`. Change only the
   `PhastResultsService` import to `'../../phast/phast-results.service'` and the file name in the
   header comment. Keep `GENERATE = false`.
4. **Register the pair** in `snapshot-fixtures.ts`. The shared specs (round-trip, new calculators,
   charge material) pick it up automatically.
5. **Verify**:
   ```bash
   npm run check:phast-snapshot-drift
   npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/process-heating-assessment/**/*.spec.ts'
   ```
   A failure in a shared spec after registering is a real finding about the new calculator or the
   migration. Do not regenerate the snapshot to make it pass.

## Fixtures with a Flue Gas By Mass entry

Legacy results look the fuel up by `gasTypeId` through `SolidLiquidMaterialDbService.getById` to derive
O2 and excess air. The helpers have no database, so they pass a stand-in:

- **Legacy helper**: `buildPhastServices({ solidLiquidMaterialDbService })`. The legacy spec must pass a
  stub whose `getById` returns the fixture's own fuel analysis (carbon, hydrogen, sulphur, inertAsh,
  o2, moisture, nitrogen). Without it, capture and tests throw
  `Cannot read properties of null (reading 'getById')`.
- **This helper**: defaults to `createFixtureFuelDb()`, built from every By Mass entry in `FIXTURES`
  (baseline and modifications). Nothing to add per fixture, but two fixtures that reuse a `gasTypeId`
  with different analyses make it throw. Give the new fixture's fuel a distinct `gasTypeId` or pass the
  option explicitly.

Both baseline and modification should be By Mass if the modification is meant to cover By Mass.

## Coverage limits

See the header of `new-calc-services.snapshot.spec.ts`. In short: all fixtures are Imperial (Metric is
covered by unit specs and by the live cases in `flue-gas-by-mass.snapshot.spec.ts`), and extended surface
totals are not compared because legacy always totals them as 0.
