# PumpResult Desktop beta integration evidence

## Reproducible baseline

- Baseline Desktop: `9b7ff3d7416ff8172ad3ab24fc01ab2ef29acbc9`; Suite `1.2.6-beta.365.1`.
- Reconciled Desktop: `14e4cc7585524a32007c393710ca2c5ad75695ed`; same old Suite. All 72 scenarios remained exactly equal.
- Candidate package: `1.2.7-beta.446.1`, published by [Suite PR #446](https://github.com/ORNL-AMO/MEASUR-Tools-Suite/pull/446).
- Captures used Chrome Headless 147 on macOS, actual Desktop services and synthetic inputs; no calculation mocks or copied engineering formulas.
- Immutable inputs/results: [legacy-results.json](../../src/app/tools-suite-api/motor-driven-regression-tests/legacy-results.json). SHA-256: `36d68f909802c35a353fc4c0a5fcf806a8ef01ff1a05873f174dcf8028cbe352`.
- Machine-readable per-field inputs, versions, units, deltas, reasons and acceptance: [difference report](pump-result-desktop-differences.json).

## Result gate

72 scenarios: **64 exactly unchanged**, **8 with explained differences**, **23 changed fields**, **0 unexplained differences**. All captured pump/fan outputs, annual energy/cost, inventory load-characteristic and operations results remain exactly equal. Pump outputs include production Psat rounding; fan report efficiency/PF and annual totals also receive exact display-format comparisons. Tiny raw-current deltas are reported rather than filtered by tolerance.

Ordinary tests never write the baseline or accept new results. Each allowed change is keyed by scenario and field, records its old/new value and cause, and requires explicit acceptance. Changes in structure, units, field presence, nonfinite classification or report-visible values are blockers unless individually documented. The old incomplete-input near-zero outputs are capture evidence, not valid engineering goldens.

Run the real-WASM comparison from the repository root:

```sh
npm test -- --watch=false --no-progress --include=src/app/tools-suite-api/motor-driven-regression-tests/motor-driven-results.spec.ts
```

## Verified causes and impact

### initialized-nameplate

Old five-argument MotorPowerFactor constructor left frequency/RPM/class/specified efficiency uninitialized. Complete nameplate input makes the near-zero branch deterministic. User separately approved this correction after reviewing before/after values.

### current-normalization-rounding

Required percentage-to-fraction normalization changes the selected reference-current scale. Supplied-FLA normalization cancels that scale mathematically, but floating-point multiplication/division leaves a last-bit difference. Reproducing the old percent input with the new function reproduces the captured old value; displayed currents are identical.

### motor-performance-percentage

The form supplies 90 percent but the retained MotorPerformance wrapper passed 90 as a fraction, yielding efficiencies near 9000 percent. Passing 0.90 corrects efficiency and power factor. The specified zero-load path also receives initialized Suite nameplate fields; the zero sign changes without a displayed efficiency change. Approved during planning.

The only changed display values are specified-efficiency MotorPerformance efficiency/power factor and the approved standalone near-zero power factor. These affect recalculated motor-performance charts/calculator outputs. Existing stored assessment shapes and saved outputs are not migrated or rewritten on load. The standalone near-zero corrections are passed through the existing calculation actions; the captured inventory load/operations outputs remain unchanged.

Loaded power-factor estimates retain their previous five-input behavior when optional nameplate fields are missing. Embind receives structural sentinels only for fields ignored by that loaded branch; near-zero calculations still require actual nameplate data. A regression test compares this loaded case to the captured legacy result.

## Every changed field

Before/after values and deltas below use each scenario's units recorded in the immutable input fixture. `displayed` paths are production-rounded UI values; `raw` paths are unrounded Desktop adapter outputs.

| Scenario | Field | Before | After | Absolute delta | Relative delta | Cause |
| --- | --- | --- | --- | --- | --- | --- |
| current-3-0 | `result.raw` | 62.03310557374408 | 62.03310557374413 | 4.973799150320701e-14 | 8.017975408965974e-16 | current-normalization-rounding |
| current-3-25 | `result.raw` | 81.23980620274482 | 81.23980620274484 | 2.842170943040401e-14 | 3.4984954739396875e-16 | current-normalization-rounding |
| performance-3-0.25 | `result.displayed.efficiency` | 8756.559 | 86.069 | 8670.49 | 0.9901709107424503 | motor-performance-percentage |
| performance-3-0.25 | `result.displayed.powerFactor` | 0.658 | 66.954 | 66.29599999999999 | 100.75379939209725 | motor-performance-percentage |
| performance-3-0.25 | `result.raw.current` | 36.10658053455325 | 36.10658053455326 | 7.105427357601002e-15 | 1.967903704091074e-16 | current-normalization-rounding |
| performance-3-0.25 | `result.raw.efficiency` | 8756.558954142425 | 86.0691928479951 | 8670.48976129443 | 0.9901708886677135 | motor-performance-percentage |
| performance-3-0.25 | `result.raw.powerFactor` | 0.6580941316084499 | 66.95357386448163 | 66.29547973287318 | 100.73859733536932 | motor-performance-percentage |
| performance-3-0.75 | `result.displayed.efficiency` | 9006.063 | 89.91 | 8916.153 | 0.9900167253993227 | motor-performance-percentage |
| performance-3-0.75 | `result.displayed.powerFactor` | 0.904 | 90.593 | 89.68900000000001 | 99.21349557522124 | motor-performance-percentage |
| performance-3-0.75 | `result.raw.efficiency` | 9006.062571210281 | 89.91029824825681 | 8916.152272962025 | 0.9900166918076193 | motor-performance-percentage |
| performance-3-0.75 | `result.raw.powerFactor` | 0.9044154468513277 | 90.5927603779257 | 89.68834493107437 | 99.16719715847333 | motor-performance-percentage |
| performance-3-1 | `result.displayed.efficiency` | 9000 | 89.1 | 8910.9 | 0.9901 | motor-performance-percentage |
| performance-3-1 | `result.displayed.powerFactor` | 0.925 | 93.409 | 92.48400000000001 | 99.98270270270271 | motor-performance-percentage |
| performance-3-1 | `result.raw.efficiency` | 8999.999999999949 | 89.10000000000741 | 8910.899999999941 | 0.9900999999999991 | motor-performance-percentage |
| performance-3-1 | `result.raw.powerFactor` | 0.9247521219870698 | 93.4093052512109 | 92.48455312922383 | 100.01010101009206 | motor-performance-percentage |
| power-factor-0 | `result.displayed` | -62.1 | 4.67 | 66.77 | 1.0752012882447664 | initialized-nameplate |
| power-factor-0 | `result.raw` | -62.09998759583456 | 4.669958457276021 | 66.76994605311059 | 1.075200634300759 | initialized-nameplate |
| power-factor-0.05 | `result.displayed` | -62.1 | 4.67 | 66.77 | 1.0752012882447664 | initialized-nameplate |
| power-factor-0.05 | `result.raw` | -62.09998759583456 | 4.669958457276021 | 66.76994605311059 | 1.075200634300759 | initialized-nameplate |
| performance-3-zero | `result.displayed.powerFactor` | -60.065 | 9.772 | 69.837 | 1.162690418713061 | motor-performance-percentage |
| performance-3-zero | `result.raw.current` | 27.570269143886257 | 27.57026914388628 | 2.1316282072803006e-14 | 7.731619144360047e-16 | current-normalization-rounding |
| performance-3-zero | `result.raw.efficiency` | {"$number":"-0"} | 0 | "classification/sign change" | "not applicable" | motor-performance-percentage |
| performance-3-zero | `result.raw.powerFactor` | -60.0646899955808 | 9.772043372827799 | 69.8367333684086 | 1.1626919804888158 | motor-performance-percentage |

## Validation and review

Author validation: Angular application/spec typechecks; focused wrappers/comparison gate; all 1,648 Desktop unit tests; all compressed-air fixture/privacy tests and 49 full calculation fixtures; 257 process-flow tests (one existing todo); process-flow TypeScript compilation; and the production web build passed. Final compatibility edits were followed by full unit/typecheck reruns and target rebuilds. The browser consumer initialized the installed beta through the production ToolsSuiteApiService and calculated the pump/motor examples successfully.

The existing process-flow `test:typecheck` script runs `vitest typecheck` as a file filter and exits with no tests. Actual `tsc --noEmit -p process-flow-diagram-component/tsconfig.json` passed instead.

Electron-specific checks and scaffolding were removed at the user's request: this PR changes calculation adapters and dependency pins, with no Electron implementation or asset-path changes.

Validation and exact reviewed commits are recorded in Desktop issue [#8957](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/8957) and the implementation PR. Final release versions and merging remain deferred.
