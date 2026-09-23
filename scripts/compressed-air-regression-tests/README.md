# Compressed-air regression tests

These tests answer one question: **did a code or Suite change alter the results of
an existing compressed-air assessment?**

The checked-in test data represents Desktop behavior at commit `52f3b3bdb` with
`measur-tools-suite@1.2.5`. It gives us a stable, pre-PR #409 reference point for
reviewing later calculation changes.

## What is already in the repository?

The repository already contains everything needed to run the tests:

- 43 sanitized assessments extracted from a private MEASUR system backup.
- A seven-assessment subset used by the faster, normal test run.
- Five synthetic assessments created in test code to cover missing cases.
- The expected calculation results in the
  `pre-pr409-suite-1.2.5` baseline.

You do **not** need the private backup just to run the tests. The extraction
command is only needed when intentionally rebuilding the sanitized assessment
fixtures from a MEASUR backup.

## Extraction: what goes in and what comes out?

The extraction command requires you to provide an existing MEASUR system backup
`.json` file as its input. This is the same kind of JSON file produced when a
user exports or backs up their MEASUR data. The command does not create or
download that backup for you.

For example, if the private backup is at `/private/path/to/backup.json`, run this
from the repository root:

```sh
npm run ca:regression-tests:extract -- --input "/private/path/to/backup.json" --accept
```

The command:

1. Reads the backup from the path supplied after `--input`.
2. Selects only complete compressed-air assessments that have compressor
   inventory, system-profile data, and matching settings.
3. Ignores incomplete assessments and all unrelated MEASUR data.
4. Removes Log Tool data and replaces identifying names, notes, IDs, locations,
   dates, and other descriptive information with deterministic test values.
5. Writes the sanitized assessment fixtures to
   `src/app/compressed-air-assessment/calculations/regression-tests/fixtures/corpus.json`.
6. Writes fixture counts, coverage tags, the seven-case selection, and a
   repeatability hash to
   `src/app/compressed-air-assessment/calculations/regression-tests/fixtures/coverage.json`.

The source backup is read only. It is not changed, copied into the repository,
or included in command output. Keep it outside the repository because it may
contain private information.

`--accept` is an intentional-overwrite safeguard. Extraction replaces the
checked-in `corpus.json` and `coverage.json`, so review those changes and rerun
the privacy checks before committing them.

Extraction creates test **inputs**; it does not calculate or update the expected
results baseline. Baseline recording is a separate, explicitly accepted step.

## Running the tests

Run the seven-assessment core set during normal development:

```sh
npm run test:ca-regression-tests:core
```

Run the complete set of 43 sanitized assessments plus five synthetic
assessments before reviewing or accepting calculation changes:

```sh
npm run test:ca-regression-tests:full
```

Both commands calculate current results and compare them with the checked-in
baseline. They do not rewrite fixtures or expected results. A difference causes
the command to fail.

The extraction and comparison helpers also have focused tests for filtering,
sanitization, privacy, deterministic output, and comparison behavior:

```sh
npm run test:ca-regression-tests:fixtures
```

## Reviewing differences

After a Suite or Desktop calculation change, generate a detailed report without
making the command fail merely because results differ:

```sh
npm run ca:regression-tests:report -- --baseline pre-pr409-suite-1.2.5 --allow-differences
```

This writes sanitized JSON and Markdown reports under
`tmp/compressed-air-regression-tests/`. The `tmp` directory is ignored by Git.
The report shows which fixture and result field changed, along with the expected
value, actual value, and numerical difference where applicable.

## Recording a baseline

A baseline is the checked-in set of expected calculation results. Record one
only after the relevant result changes have been reviewed and accepted:

```sh
npm run ca:regression-tests:record -- --baseline post-change-baseline-name --accept
```

This runs all 48 cases and creates a separate baseline file under
`src/app/compressed-air-assessment/calculations/regression-tests/fixtures/baselines/`.
Use a new descriptive name for a new calculation state.

Never overwrite or remove `pre-pr409-suite-1.2.5`; it is the permanent reference
for measuring the effect of PR #409 and Desktop issue #8903. The `--accept` flag
exists to prevent accidental baseline creation or replacement.

## Typical workflows

For ordinary development, run the core test. No backup or extraction is needed:

```sh
npm run test:ca-regression-tests:core
```

When evaluating a calculation-package update:

1. Run the full test against `pre-pr409-suite-1.2.5`.
2. Generate the difference report.
3. Review and explain the changes.
4. After approval, record a new, separately named baseline.

Only rerun extraction when the team intentionally wants to rebuild the sanitized
fixture corpus from a supplied MEASUR backup. Extraction is not part of a normal
test run.
