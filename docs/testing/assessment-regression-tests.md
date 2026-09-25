# Assessment Calculation-Regression Framework

## Purpose

Assessment regression tests preserve calculation behavior while Desktop and `measur-tools-suite` evolve. They run saved assessment inputs through the production calculation path, serialize a stable result projection, and compare it with an accepted baseline.

The compressed-air implementation is the first complete example in this repository. It is a working pattern, but it is not yet an assessment-neutral library. Reuse its architecture deliberately rather than copying every compressed-air name or assumption.

## Framework Shape

Each assessment implementation needs four layers:

1. **Sanitized inputs**: representative saved assessments with enough settings to calculate, stripped of identifying and unrelated data.
2. **Browser calculation adapter**: migrates cloned saved data and invokes the assessment's real production services, including Suite/WASM where applicable.
3. **Canonical result projection**: captures raw and report-visible behavior without serializing framework or Emscripten instances.
4. **Node orchestration**: selects core or full scope, compares snapshots, reports differences, and records explicitly accepted baselines.

Normal tests are read-only. Fixture addition and baseline recording are separate commands with explicit acceptance safeguards.

## What Can Be Shared

The following concepts and code are candidates for assessment-neutral reuse:

- Stable object-key serialization while preserving array order.
- Missing-value, negative-zero, and non-finite canonicalization.
- Exact structural comparison plus relative numerical tolerance.
- Difference classification and Markdown/JSON reporting.
- Baseline naming, full-scope recording, and overwrite safeguards.
- Karma-to-Node snapshot chunk transport.
- Core-set selection from deterministic coverage tags.
- Common privacy checks and atomic fixture-file replacement.

The following remain assessment-specific:

- What makes an exported assessment complete and calculation-ready.
- Which settings and saved-data fields calculations require.
- Identifying fields and internal IDs that must be sanitized or remapped.
- Production services and result classes used to calculate.
- Result fields and display formatting included in the snapshot contract.
- Coverage vocabulary and synthetic edge cases.
- Existing failures that should be classified rather than hidden.

## Current Compressed-Air-Specific Seams

Do not copy these unchanged into another assessment:

- `ca-*` Karma arguments and `CA_REGRESSION_TEST_*` environment variables.
- The `caSnapshotChunk` browser message and `ca-snapshot` reporter name.
- Compressed-air fixture, baseline, report, and temporary paths.
- `CompressedAirRegressionTestRunner` service construction and result projection.
- Compressed-air coverage tags and synthetic fixtures.
- The permanent `pre-pr409-suite-1.2.5` baseline metadata.

If a second assessment needs the same behavior, parameterize these seams rather than adding another large copy. At minimum, a shared orchestrator should accept an assessment key, spec path, fixture paths, baseline name, and snapshot-message key. A shared browser transport should not know the assessment's calculation services or result shape.

## Adding the Framework to Another Assessment

### 1. Define the compatibility contract

Document what must remain stable: saved-data compatibility, raw calculated values, report-visible values, ordering, flags, nullability, known failures, units, and Suite version. Decide whether the baseline represents current accepted behavior or behavior before a planned refactor.

### 2. Build a small private source corpus

Select the smallest useful set of complete assessments. Sanitize them deterministically, remap every retained reference, remove unrelated modules and logging/import data, and add a privacy test. Do not commit the original exports.

Define coverage tags for relevant equipment types, control modes, input bases, modifications, intervals, units, and known boundaries. Use deterministic greedy selection for a fast core set; retain a full command for release and refactor review.

### 3. Add targeted synthetic cases

Clone sanitized fixtures and mutate only the inputs needed to cover a missing edge. Avoid constructing a second unofficial saved-data format. Explain why each synthetic case exists and keep its coverage tags accurate.

### 4. Invoke production calculations

Create a browser runner that initializes real dependencies once, deep-clones each fixture, applies saved-data migration, and calls the same services used by the application. Keep Suite calls behind `src/app/tools-suite-api/`. Do not duplicate calculation formulas in snapshots or tests.

### 5. Design the result projection

Capture enough information to locate a change by assessment, baseline or modification, operating period, equipment item, interval, and field. Include a compact display projection for values whose report rounding matters. Exclude transient UI state and class instances.

Assign fixture and result schema versions. A schema change is not automatically an accepted calculation change.

### 6. Wire core, full, report, and record commands

Provide clear package commands and keep comparison as the default. Reports may tolerate differences only through an explicit diagnostic flag. Recording must require an explicit acceptance flag, full scope, and a new descriptive baseline name.

### 7. Establish phase gates

Before removing or replacing an old calculation path, require:

- Sanitizer/privacy/helper tests.
- TypeScript validation.
- Real-WASM or real production-backend coverage where applicable.
- Core tests during development.
- Full-corpus comparison and diagnostic review.
- Import/export and report checks when their contracts are represented.
- A separately reviewed baseline only after intended changes are understood.

## Deciding Where a New Case Belongs

| Need | Add it as |
| --- | --- |
| Representative real assessment with a new combination of inputs | Sanitized real fixture |
| Small missing boundary or rare option | Synthetic fixture |
| Sanitization, privacy, tolerance, or comparison rule | Fast Node unit test |
| Proof that application services and Suite/WASM are actually called | Browser integration test |
| Accepted calculation behavior after review | New named baseline |

Avoid expanding a corpus solely for volume. Every fixture should add identifiable coverage or reproduce an important failure.

## Documentation Expectations

Each assessment implementation should include:

- A human README explaining what the tests protect and how to run them.
- A local `AGENTS.md` for fixture, calculation, privacy, and baseline rules.
- Comments at the browser/Node boundary and the production calculation call site.
- A coverage file or equivalent inventory that explains why each core case exists.
- A permanent baseline policy, including which historical baselines must never be overwritten.
