# PHAST Snapshot Tests

Snapshot tests capture the full numeric output of the PHAST calculation layer for a fixed set of inputs and fail if any output shifts. They are the primary regression safety net for the refactor — not a test of correctness, but a test of consistency.

## How to run

Run all snapshot test suites (CI mode, no watch):

```bash
npm run test:phast-snapshot
```

Run all snapshot test suites with watch mode (useful while working):

```bash
npm run test:phast-snapshot:watch
```

Run a single fixture suite directly:

```bash
ng test --include="**/phast-fuel-example.snapshot.spec.ts" --watch=false --browsers=ChromeHeadlessNoSandbox
```

## Structure

```
snapshot-tests/
├── fixtures/            Input assessment JSON files (exported from the app)
├── snapshots/           Committed expected output JSON (one file per fixture)
├── snapshot.helper.ts   Service wiring shared across all specs
├── *.snapshot.spec.ts   One spec file per fixture
├── scaffold-spec.py     Generates spec files and placeholder snapshots from a fixture
├── add-fixture.sh       End-to-end: scaffold + capture (called by npm run snapshot:add)
├── generate-snapshot.py Parses SNAPSHOT: log lines from ng test output → .snap.json
└── regenerate-all.sh    Re-captures all snapshots (called by npm run snapshot:regenerate)
```

## A failing test means the code is wrong, not the snapshot

If a snapshot test fails during a refactor stage, **fix the code**. Do not regenerate the snapshot. The test did its job — it caught that your change shifted a calculated output it should not have.

The snapshot represents the correct behavior of the codebase at the time it was captured. A refactor must not change outputs.

## When to regenerate snapshots

Regenerate only when a change intentionally alters a calculated output — e.g. a bug fix or a `measur-tools-suite` upgrade. If a snapshot fails during a refactor, fix the code, not the snapshot.

## How to regenerate snapshots

### Regenerate all at once (preferred)

When an intentional code change affects outputs across multiple assessments, regenerate everything in one pass:

```bash
npm run snapshot:regenerate
```

This script (`regenerate-all.sh`) loops over every `*.snapshot.spec.ts`, temporarily flips `GENERATE=true`, runs each spec, writes the new snapshot file, then restores `GENERATE=false`. It uses a `trap EXIT` so the flag is always restored even if the run is interrupted.

After it completes, verify all tests pass against the new snapshots:

```bash
npm run test:phast-snapshot
```

### Regenerate a single snapshot

Use this when only one fixture is affected:

1. Open the relevant spec file (e.g., `phast-fuel-example.snapshot.spec.ts`)
2. Set `const GENERATE = true` near the top
3. Run the capture command:
   ```bash
   ng test --include="**/phast-fuel-example.snapshot.spec.ts" --watch=false --browsers=ChromeHeadless 2>&1 \
     | python3 src/app/phast/snapshot-tests/generate-snapshot.py \
     > src/app/phast/snapshot-tests/snapshots/fuel-example.snap.json
   ```
4. Set `const GENERATE = false`
5. Re-run the spec to confirm all tests pass against the new snapshot

In both cases, commit the updated snapshot(s) with a message explaining **why** the output changed.

Snapshots must never be auto-updated. Regeneration requires a deliberate decision and a code review.

## Adding a new fixture

1. Export the assessment from the app and place the JSON in `fixtures/`
2. Run:
   ```bash
   npm run snapshot:add
   ```
   This finds anything that needs capturing — either a fixture with no spec yet, or a spec
   whose snapshot is still the placeholder `{}` — then in one pass:
   - Scaffolds a `phast-<name>.snapshot.spec.ts` with the correct modification count (if needed)
   - Creates a placeholder `snapshots/<name>.snap.json` so webpack can resolve the `require()` at bundle time
   - Captures the initial snapshot by running the spec with `GENERATE=true`
   - Restores `GENERATE=false`

   To target specific fixture(s) rather than auto-detecting:
   ```bash
   npm run snapshot:add -- "07-1353.json" "TEST B1.json"
   ```

3. Run `npm run test:phast-snapshot` to confirm everything is green
4. Commit fixture, spec, and snapshot together

When adding fixtures for electrotechnology, EAF, or steam assessments, check `snapshot.helper.ts` — those pathways may require material DB services to be provided (the fuel-fired By Volume path is the only one that needs no DB mocking).

> **Why the placeholder is required:** webpack resolves all `require()` calls statically at
> bundle time, including the `require('./snapshots/…snap.json')` inside the `else` branch.
> If the file doesn't exist the bundle fails and no `SNAPSHOT:` log lines are produced.
> `add-fixture.sh` creates `{}` as the placeholder before running the spec.

## Snapshot content

Each snapshot captures the full `PhastResults` object returned by `PhastResultsService.getResults()` for the baseline and every modification in the fixture. Fields include:

- `totalInput`, `grossHeatInput` — heat balance totals
- `totalChargeMaterialLoss`, `totalWallLoss`, `totalFlueGas`, etc. — per-loss-type contributions
- `flueGasAvailableHeat`, `calculatedExcessAir`, `calculatedFlueGasO2` — flue gas results
- `co2EmissionsOutput` — CO2 and emissions figures

Any change to any of these fields — including floating-point drift — will fail the test.
