# Agent Guide: Compressed-Air Regression-Test Tooling

This directory contains the Node side of the compressed-air calculation-regression framework. Read the adjacent `README.md` for the human-oriented overview. Also follow the repository-root `AGENTS.md`.

The Node tools do not calculate assessment results. Angular/Karma owns calculation because the production Suite integration requires browser-loaded WebAssembly. These scripts manage sanitized inputs, invoke the focused Karma spec, compare snapshots, create reports, and explicitly record accepted snapshots.

## Commands

Run commands from the repository root:

- Helper, sanitization, privacy, and comparator tests: `npm run test:ca-regression-tests:fixtures`
- Fast coverage-selected calculation set: `npm run test:ca-regression-tests:core`
- Every committed and synthetic calculation case: `npm run test:ca-regression-tests:full`
- Diagnostic report: `npm run ca:regression-tests:report -- --snapshot <name> --allow-differences`
- Record a reviewed full snapshot: `npm run ca:regression-tests:record -- --snapshot <new-name> --accept`
- Add one real fixture: `npm run ca:regression-tests:add-fixture -- --input "/private/path/to/assessment-export.json" --accept`

Use the narrow helper tests while changing sanitization or comparison behavior. Run the core calculation set for ordinary compressed-air calculation changes. Run the full set before accepting calculation changes, changing the runner or result projection, or recording a snapshot.

## Choosing the Right Kind of Test Data

- Add a real fixture when a sanitized user-created assessment contributes a meaningful combination of compressors, controls, profile inputs, system controls, EEMs, intervals, units, or boundary behavior that the corpus does not already represent.
- Add a synthetic fixture when a small, deliberate mutation of an existing sanitized fixture is clearer than maintaining another large real assessment.
- Add a Node test in `fixture-tools.test.mjs` for sanitization, privacy, coverage selection, canonical JSON, tolerance, or structural-comparison behavior.
- Add or extend the Karma spec for behavior that must prove the production Angular-to-Suite/WASM calculation path is used.

Do not add a real fixture merely to increase the fixture count. Check `fixtures/coverage.json` and the synthetic cases first.

## Adding a Real Fixture

The input must be a normal MEASUR JSON assessment export whose `assessments` array contains exactly one complete compressed-air assessment with its settings. Do not use a system backup. The command rejects zero matches, multiple matches, and an assessment already represented by an equivalent sanitized fixture.

The add command must continue to:

- Treat the private input as read-only.
- Avoid printing or storing its path, source IDs, names, notes, locations, dates, Log Tool fields, or descriptive emissions data.
- Create the next `fixtures/assessments/ca-real-NNN.json` without renumbering or rewriting existing fixture files.
- Remap all retained internal references consistently.
- Validate privacy before publishing the new fixture or replacing metadata.
- Refresh coverage tags, the core selection, and the corpus hash.
- Leave every expected-results snapshot unchanged.

After adding a fixture, inspect its new assessment JSON and the `coverage.json` diff, run the helper tests, and run a full diagnostic report. The active snapshot will initially lack the new fixture; that difference is expected until its results are reviewed and a separately named snapshot is recorded.

Never commit or attach the source export. Never write private source data or source paths under `tmp/`, because ignored files can still be collected accidentally as CI artifacts.

## Snapshot Rules

- Ordinary tests and reports are read-only with respect to fixtures and snapshots.
- Recording requires `--accept` and full scope.
- Use a new lowercase, descriptive snapshot name containing only letters, numbers, dots, and hyphens.
- Never overwrite a snapshot in place. Record and review a new snapshot first. A superseded snapshot may be removed after acceptance when Git history is sufficient for the audit trail.
- Do not accept a snapshot solely to make a failing test pass. First produce and review the diagnostic report and explain every intended behavior change.
- Recording never activates a snapshot. Change only `fixtures/manifest.json.activeSnapshot` after review.
- A newly fixed `known-failure` is still a behavior change and requires review.

## Editing the Tooling

Keep `fixture-tools.mjs` free of Angular and Suite imports so it remains fast and testable with `node:test`. Preserve exact comparison of structure, order, field presence, flags, enums, status, and nullability. Finite numeric comparison uses `1e-6 * max(1, abs(expected))`; report-visible strings remain exact.

If the snapshot schema or projection changes, update its schema version and document why. Do not make normal tests rewrite expected output. Keep temporary calculation and report files under the ignored `tmp/compressed-air-regression-tests/` directory.

For work that generalizes this machinery to another assessment, read `docs/testing/assessment-regression-tests.md` before copying files. Several names, environment variables, paths, and Karma messages are still compressed-air-specific.
