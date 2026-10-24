# Compressed-air regression tests

These tests answer one question: **did a Desktop or Suite change alter the
results of an existing compressed-air assessment?**

The active accepted reference uses the compressed-air integration from Desktop
issue #8903 with `measur-tools-suite@1.2.6-rc.2`. Its results are stored in the
`post-pr409-issue-8903-suite-1.2.6-rc.2` snapshot. The earlier Suite 1.2.5
snapshot was used to review this transition; it was removed after acceptance
because Git history already preserves it.

## Terminology

- An **assessment baseline** is the compressed-air system before a user applies
  modifications. This is production calculation terminology and appears in
  fields such as `output.baseline`.
- A **regression-test snapshot** is a checked-in set of expected test results.
  Recording or activating a snapshot never changes an assessment baseline.

## What is checked in?

- `fixtures/assessments/` contains one sanitized real assessment per JSON file.
  The 43 files were originally derived from a private system backup.
- `fixtures/manifest.json` records the fixture schema/source version and names
  the snapshot used by ordinary tests and CI through `activeSnapshot`.
- `synthetic-fixtures.ts` creates targeted cases in memory for scenarios absent
  from the real assessments.
- `fixtures/coverage.json` records per-fixture hashes and tags, the smaller core
  set, and a scenario matrix with matching fixtures and known gaps.
- `fixtures/known-non-finite-paths.json` records exact legacy non-finite paths,
  grouped by an investigated reason. Unexpected paths fail the test.
- `fixtures/snapshots/<name>/` contains a provenance manifest and one expected-
  result JSON file per real or synthetic fixture.
- `fixtures/fixture-registry.ts` is a small generated static-import index needed
  by the Karma bundler. Fixture addition and snapshot recording refresh it.

The private backup has no role in test execution and is not needed again. It is
not stored in the repository.

## Where are the Suite calculations called?

The Karma test uses the production calculation path and the real Suite WASM:

```text
compressed-air-regression-tests.spec.ts
  -> compressed-air-regression-tests.runner.ts
    -> Desktop assessment baseline and modification result classes
      -> CompressedAirCalculationService
        -> CompressedAirSuiteApiService
          -> measur-tools-suite JavaScript/WASM
  -> compare current results with the active regression-test snapshot
```

The files under `src/app/.../regression-tests/` execute in Chrome through
Karma, where the Suite WASM can initialize. The files in this `scripts/`
directory manage sanitized fixtures, run the focused Karma spec, compare
outputs, create reports, and record explicitly accepted snapshots.

Normal tests never rewrite fixtures, the active-snapshot setting, expected
results, or the known-non-finite allowance file.

## Adding one real assessment

Add a fixture only when a new assessment contributes calculation coverage that
is not already represented. For a small artificial boundary, a synthetic
fixture is usually clearer.

Use MEASUR to export one complete compressed-air assessment with its matching
settings. Keep that private JSON outside the repository, then run:

```sh
npm run ca:regression-tests:add-fixture -- --input "/private/path/to/assessment-export.json" --accept
```

The command:

1. Reads the private export without changing, copying, or logging its path.
2. Requires exactly one complete compressed-air assessment and settings pair.
3. Removes Log Tool data and deterministically replaces identifying text and
   internal IDs while preserving calculation inputs and references.
4. Runs privacy checks before publishing anything.
5. Creates only the next `fixtures/assessments/ca-real-NNN.json` file.
6. Refreshes the fixture manifest and coverage inventory without rewriting any
   existing assessment or expected-results file.

The new fixture has no expected result yet. Review its sanitized JSON and the
coverage changes, run the helper tests, and generate a full diagnostic report.
Only after the result is understood should a new snapshot be recorded and
activated.

## Running the tests

Run the smaller coverage-selected set during normal development:

```sh
npm run test:ca-regression-tests:core
```

Run every real and synthetic case before accepting calculation changes:

```sh
npm run test:ca-regression-tests:full
```

Both commands compare against `fixtures/manifest.json.activeSnapshot` and fail
on differences. The fast Node tests cover sanitization, fixture storage,
privacy, coverage, snapshot loading, and comparison behavior:

```sh
npm run test:ca-regression-tests:fixtures
```

Snapshot, Desktop, Suite, and source MEASUR versions are provenance metadata.
They remain recorded in manifests and diagnostic reports, but version changes
alone do not fail result comparison. Schema versions, scope, fixture structure,
and calculation results are still compared.

## Reviewing differences

Generate a non-failing diagnostic report against the active snapshot:

```sh
npm run ca:regression-tests:report -- --allow-differences
```

To compare with another immutable snapshot, add `--snapshot <name>`. Sanitized
JSON and Markdown reports are written under the ignored
`tmp/compressed-air-regression-tests/` directory. They include stored/current
provenance and locate each structural, numerical, display, or failure change.

## Recording and activating a snapshot

Recording always requires a new explicit name:

```sh
npm run ca:regression-tests:record -- --snapshot post-change-name --accept
```

This creates `fixtures/snapshots/post-change-name/`, stamps its manifest with
the current Desktop commit, application version, Suite version, and source
MEASUR version, and writes one formatted result file per fixture. It refuses to
overwrite an existing directory.

Recording deliberately does **not** activate the snapshot. After review, change
only `activeSnapshot` in `fixtures/manifest.json`, then run the commands without
snapshot overrides. Never overwrite a snapshot in place. A superseded snapshot
may be removed after the replacement is accepted when Git history provides the
required audit trail.

## Intentional calculation-change workflow

1. Make the calculation or Suite integration change.
2. Run `npm run test:ca-regression-tests:full` against the active snapshot.
3. Run `npm run ca:regression-tests:report -- --allow-differences`.
4. Confirm every changed fixture and field is intended. A known failure that
   starts calculating is also a behavior change and must be reviewed.
5. If non-finite paths changed, investigate the producing formula and update
   `known-non-finite-paths.json` with a documented reason. Recording never
   changes this file automatically.
6. Record a new snapshot with a lowercase descriptive name and `--accept`.
7. Review its per-fixture files and provenance manifest.
8. Set `fixtures/manifest.json.activeSnapshot` to the new name.
9. Run `npm test -- --watch=false --no-progress`, the core command, and the full
   command without `--snapshot`; all must pass.
10. Commit the calculation change, new snapshot directory, activation change,
    and any reviewed allowance update together. Explain the observed result
    differences in the PR description.

Do not modify an old snapshot to make tests pass. Record and review a new
snapshot first. Once it is accepted and active, decide whether an older
snapshot still provides enough day-to-day comparison value to justify keeping
its duplicate result files in the current tree.
