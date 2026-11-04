# HI 2020 pump-efficiency adoption

Implementation record for [Desktop #9063](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/9063)
and [Suite #458](https://github.com/ORNL-AMO/MEASUR-Tools-Suite/issues/458).

## Baseline and runtime contract

Desktop starts at `cbf65e9dd1dcecc2b7da9deca0c2c3da4fa2a542`, the pending PumpResult
integration [#9054](https://github.com/ORNL-AMO/AMO-Tools-Desktop/pull/9054). Its immutable
72-scenario baseline and approved differences remain unchanged. The namespace refactor
[#9059](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/9059) remains separate.

Suite interpolates HI 2020 raw flow/speed tables and returns NaN for unavailable estimates.
Numeric signatures and `{average,max}` fractional results are preserved. The new plain
`getPumpEfficiencyLimits` result has supported flag and inclusive min/max flow/speed bounds,
in US gpm / US customary specific speed. No input/result cleanup is needed. Desktop preserves
conversions and display rounding; displayed flow limits use the selected unit.

## Saved-data preservation

Optional `PsatInputs.pumpEfficiencyModel` records version 1, source and original physical type.
Unmarked rotodynamic scenarios with finite saved `0 < pump_specified <= 100` become specified
efficiency (style 11), retaining the exact percentage. Missing/invalid values are retained and
marked needs-review; measured baseline output is never substituted. Specified/PD inputs stay
unchanged. New assessments/estimates/modifications carry provenance; duplication/export/import
retain it and do not repeat migration.

The feature migration also runs for same-app-version imports without replaying unrelated upgrades.
The application upgrade now defaults whatIfScenario only when missing, preserving explicit false
measured-scenario flags. Baseline measured calculations do not depend on HI-estimate availability.
Inventory/report projections retain physical classification independently of efficiency mode.
Restoring an inventory connection must not restore automatic estimation or change saved efficiency.

Explicit re-estimation applies a valid value only on success. A failure retains the previous value
and method and explains reference limits. Modified scenarios with unavailable current HI duties
are invalid for savings calculations even if an earlier estimate remains in the input record.
Graphs retain historical point provenance and omit unavailable current points. No catalog reseeding,
WASM filename/path or Electron loading changes are included.

## Verification and packages

Initial author validation used a private freshly rebuilt Suite module. Published-beta acceptance now
uses **measur-tools-suite@1.2.7-beta.459.1**, installed from npm in both root and process-flow packages.
Both manifests and both npm-generated lockfiles change together; no unrelated dependency pins changed.
[Suite PR #459](https://github.com/ORNL-AMO/MEASUR-Tools-Suite/pull/459) CI passed declarations/docs,
Linux native/Valgrind and rebuilt WASM checks. Publication evidence is the
[exact beta comment](https://github.com/ORNL-AMO/MEASUR-Tools-Suite/pull/459#issuecomment-6633132045).

- Suite: 8626 native assertions / 362 cases and 301 fresh-WASM browser tests passed.
- Independent SciPy 1.17.1 goldens use extrapolate=False; every knot and interval samples are covered.
- Final published-beta Desktop full suite: 1673 tests passed, with the immutable 72-scenario motor-driven
  baseline and its earlier accepted differences unchanged.
- Application/spec TypeScript checks and complete diff whitespace passed.
- Final post-beta web build passed.
- Published-beta process-flow verification: 257 passed, one existing todo; typecheck passed.
- Doxygen generated changed Suite pages with the existing local BibTeX error/unrelated warnings;
  no new pump/PCHIP diagnostic. CI declarations/documentation checks passed.

### Independent Desktop review and fixes

Initial review of `96c39cccca82db3cdb8a3f52864cf2c28a471e7f` against base
`cbf65e9dd1dcecc2b7da9deca0c2c3da4fa2a542` found five actionable issues, all addressed:

1. Measured modifications incorrectly required an optimal efficiency. Measured scenarios now bypass
   HI/supplied-optimal requirements, with real production-service regression for a null saved optimum.
2. Optional settings bypassed HI validation and empty results could imply 100% savings. Production
   callers now pass settings; HI validation fails closed without them; comparison/report savings are
   zero when either scenario is invalid. Invalid modifications are excluded from integrated energy
   options. Direct modified calculation still requires a valid supplied efficiency and HI duty.
3. Achievable graph refresh appended duplicate current points after an unavailable duty. Current
   rows are inserted at index zero, preserving saved user points through repeated refreshes.
4. Speed graph rendering dropped the first historical point after current-point removal. It now
   filters by current-point identity instead of array position.
5. Clicking a historical speed point could falsely label old values as HI. The correction is now
   recomputed and range-checked before adding a new HI point; unavailable clicks add nothing.

Follow-up review found two additional downstream groups: rollup/export comparisons could still turn
empty results into full savings, and dashboard/Sankey validation omitted settings and measured routing.
All production validation callers now pass required settings, enforced by TypeScript. Dashboard, Sankey,
diagram and motor-warning consumers respect measured scenarios. Rollups filter unavailable comparisons,
retain original modification indexes, and fall back to baseline when none are valid; invalid explicit
selections are omitted. The Justifi export leaves unavailable savings blank instead of exporting baseline
energy as savings. Actual-service regression cases cover these paths. The preexisting Justifi measured
export behavior is unchanged; this work does not correct unrelated export semantics.

The regression tests use the published WASM, actual form/CO2/calculation services, and both graph
lifecycles. Final fix-candidate review commits/readiness will be recorded before PR creation. Final
package adoption remains deferred until engineering acceptance and requires repeating affected checks.

## Engineering release gates

Before product release, engineering must confirm digitized C/H data, H's 300–1300 US gpm range,
and axial V-base/nonvertical-speed mapping, and supply the companion workbook. SciPy returns
70.77499999999999% for H at 400 US gpm (Python two-decimal rounding: 70.77%). All 28 printed
examples match stated precision. Final release remains deferred until engineering and Desktop acceptance.
