# Agent Guide: Compressed-Air Regression Calculations

This directory contains the browser side of the compressed-air calculation-regression framework. Also follow the repository-root `AGENTS.md`, `scripts/compressed-air-regression-tests/AGENTS.md`, and `docs/testing/assessment-regression-tests.md`.

## Production Calculation Boundary

These are integration tests, not alternate engineering implementations. The required path is:

```text
compressed-air-regression-tests.spec.ts
  -> compressed-air-regression-tests.runner.ts
    -> production baseline and modification result classes
      -> CompressedAirCalculationService
        -> CompressedAirSuiteApiService
          -> measur-tools-suite JavaScript/WASM
```

Initialize the real Suite module once in `beforeAll`. Do not mock compressor calculations, reproduce Suite formulas in the test, or introduce direct Suite calls outside `src/app/tools-suite-api/`. The runner may construct production services without IndexedDB, but it must preserve the application calculation boundary.

## Fixture Execution Rules

- Deep-clone assessment and settings input before migration or calculation.
- Run `UpdateDataService.updateAssessmentVersion` before calculating so older saved-data shapes exercise the current migration path.
- Preserve fixture and array order; order is part of the snapshot contract.
- Keep real fixture inputs in `fixtures/corpus.json`. Do not embed private source data in TypeScript.
- Build synthetic fixtures by cloning sanitized real fixtures and changing only inputs required for the missing scenario.
- Keep every synthetic fixture's `coverageTags` synchronized with its mutations.
- Keep fixture-count assertions data-driven. Do not hard-code the current real, synthetic, or core counts.

Use a real fixture for a representative assessment and a synthetic fixture for a narrow boundary or uncommon input combination. If a synthetic case depends on a particular real fixture, make that dependency obvious through `findFixture` and a comment explaining the required source characteristics.

## Snapshot Contract

Capture canonical application-facing results, not Emscripten class instances. The projection should cover calculation outputs that users can observe or that downstream calculations consume, including baseline and modification profiles, totals, rated metrics, savings, cost, demand, emissions, and report-visible formatting.

Canonicalization must preserve missing values separately from `null`, normalize negative zero, preserve array order, and represent explicitly allowlisted legacy non-finite values. Unexpected `NaN`, infinity, or calculation exceptions must fail the test; never make them baselineable by classifying them automatically.

`fixtures/known-non-finite-paths.json` is intentionally separate from result baselines. Update it only when a specific legacy output has been investigated and documented; baseline recording must never modify it.

When adding or removing projected fields:

1. Explain why the field belongs in the compatibility contract.
2. Increment the result schema version when the serialized contract changes.
3. Run the full corpus and create a diagnostic report.
4. Review both raw numerical differences and display-formatted differences before recording a new baseline.

Keep report formatting tests small and intentional. They exist to detect user-visible rounding changes, not to duplicate report components.

## Verification

For a runner, projection, synthetic-fixture, or Suite-integration change, run:

1. `npm run test:ca-regression-tests:fixtures`
2. `npx tsc -p src/tsconfig.spec.json --noEmit`
3. `npm run test:ca-regression-tests:core`
4. `npm run test:ca-regression-tests:full` before acceptance

Use a diagnostic report when changes are expected. Baseline recording belongs to a separate, explicit review step and must never happen inside a Karma test.
