# Compressed-air regression tests

These tests answer one question: **did a Desktop or Suite change alter the
results of an existing compressed-air assessment?**

The permanent starting point is Desktop commit `52f3b3bdb` with
`measur-tools-suite@1.2.5`. Its expected results are stored in the
`pre-pr409-suite-1.2.5` baseline.

## What is checked in?

The repository contains everything needed to run the tests:

- `fixtures/corpus.json` contains sanitized assessment inputs. It currently has
  43 real assessment cases originally derived from a private system backup.
- `synthetic-fixtures.ts` creates six targeted cases in memory for scenarios
  that were missing from the real assessments.
- `fixtures/coverage.json` records coverage tags, the smaller core test set, and
  a hash of the real fixture corpus. It reports real, synthetic, and combined
  coverage separately.
- `fixtures/known-non-finite-paths.json` is the exact fixture/path allowlist for
  legacy `NaN` and infinity outputs. Any non-finite output outside this list
  fails instead of becoming baseline data.
- `fixtures/baselines/` contains accepted calculation outputs.

The original private backup has no role in the tests and is not needed again.
It is not stored in the repository.

## Where are the Suite calculations called?

The Karma test uses the production calculation path and the real Suite WASM:

```text
compressed-air-regression-tests.spec.ts
  -> compressed-air-regression-tests.runner.ts
    -> Desktop baseline and modification result classes
      -> CompressedAirCalculationService
        -> CompressedAirSuiteApiService
          -> measur-tools-suite JavaScript/WASM
  -> compare current results with an accepted baseline
```

The files under `src/app/.../regression-tests/` run in the browser through
Karma, where the Suite WASM can initialize. The files in this `scripts/`
directory manage sanitized fixture inputs, run the focused Karma test, and
compare or record outputs.

Important files:

- `compressed-air-regression-tests.spec.ts` is the Karma entry point.
- `compressed-air-regression-tests.runner.ts` migrates cloned fixture data and
  calculates baseline and modification results through application services.
- `synthetic-fixtures.ts` creates targeted coverage cases in memory.
- `run-regression-tests.mjs` runs Karma and compares, reports, or records its
  result snapshot.
- `add-fixture.mjs` safely adds one private assessment export to the corpus.
- `fixture-tools.mjs` contains sanitization, privacy, coverage, stable JSON, and
  comparison helpers.
- `karma.conf.cjs` transfers the large browser result back to the Node command.

`corpus.json` is test **input**. A baseline is expected test **output**. Normal
tests never rewrite either one.

## Adding one real assessment

Adding a fixture is optional. Do it when a new assessment represents useful
calculation coverage that is not already in the corpus. For a small, artificial
edge case, adding a synthetic fixture in code is usually clearer.

First, use MEASUR to export the one complete compressed-air assessment you want
to add. The JSON export must include that assessment and its matching settings.
It may contain unrelated or incomplete records, but it must contain exactly one
**complete** compressed-air assessment.

Keep the export outside the repository, then run:

```sh
npm run ca:regression-tests:add-fixture -- --input "/private/path/to/assessment-export.json" --accept
```

The command:

1. Reads the private export without changing it.
2. Finds the one complete compressed-air assessment and its settings.
3. Refuses the file if there are no complete matches, multiple complete
   matches, or an equivalent fixture is already present.
4. Removes Log Tool data and replaces names, notes, IDs, locations, dates, and
   other identifying text with deterministic test values.
5. Runs privacy checks before writing anything.
6. Appends the next ID, such as `ca-real-044`, without rebuilding or renumbering
   existing fixtures.
7. Refreshes `coverage.json`, including the core selection and corpus hash.

The private path and source names are not printed or stored. Only the sanitized
fixture is committed. `--accept` is required because the command intentionally
changes checked-in test inputs.

The command does **not** calculate or accept expected results. After adding a
fixture, inspect the changes to `corpus.json` and `coverage.json`, run the
privacy/helper tests, and calculate the full corpus. A missing expected result
is intentional until the team reviews it and records a new baseline.

## Running the tests

Run the smaller core set during normal development:

```sh
npm run test:ca-regression-tests:core
```

Run every real and synthetic fixture before reviewing calculation changes:

```sh
npm run test:ca-regression-tests:full
```

Both commands calculate current results and compare them with the checked-in
baseline. They do not rewrite fixtures or expected results. A difference causes
the command to fail.

Run the fast Node tests for sanitization, fixture addition, privacy, coverage,
and comparison behavior with:

```sh
npm run test:ca-regression-tests:fixtures
```

## Reviewing differences

After a Suite or Desktop calculation change, generate a report without failing
just because results differ:

```sh
npm run ca:regression-tests:report -- --baseline pre-pr409-suite-1.2.5 --allow-differences
```

Sanitized JSON and Markdown reports are written under the ignored
`tmp/compressed-air-regression-tests/` directory. They identify the fixture and
field that changed and show numerical differences where applicable.

## Recording a baseline

Record expected results only after changes have been reviewed and accepted:

```sh
npm run ca:regression-tests:record -- --baseline post-change-baseline-name --accept
```

This creates a separate baseline file under `fixtures/baselines/`. Use a new,
descriptive name for each accepted calculation state. Recording refuses to
overwrite any existing baseline, even when `--accept` is supplied.

Never overwrite or remove `pre-pr409-suite-1.2.5`; it is the permanent reference
for measuring the effect of Suite PR #409 and Desktop issue #8903.

## Typical workflow

For ordinary development, run the core test. No private export is needed.

When evaluating a calculation change:

1. Run the full test against the accepted baseline.
2. Generate the difference report.
3. Review and explain the differences.
4. After approval, record a separately named baseline.

When adding a new real scenario:

1. Export that one assessment from MEASUR.
2. Run `ca:regression-tests:add-fixture` against the private export.
3. Review the sanitized corpus and coverage changes.
4. Run the helper/privacy tests and the full calculation report.
5. Record a new baseline only after the new result is reviewed.
