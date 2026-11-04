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

Author validation privately copies freshly rebuilt Suite WASM/declarations into this checkout's
ignored node_modules. This is local source validation, **not** acceptance of package pin
`1.2.7-beta.446.1`. Both committed pins stay aligned until the reviewed exact PCHIP beta is published;
then update both manifests and npm-generated lockfiles and repeat affected verification.

- Suite: 8626 native assertions / 362 cases and 301 fresh-WASM browser tests passed.
- Independent SciPy 1.17.1 goldens use extrapolate=False; every knot and interval samples are covered.
- Final local-source Desktop suite: 1666 tests passed, including startup migration, graphs and failed requests.
- Application and spec TypeScript checks passed; complete diff whitespace passed.
- Web build passed. Process-flow: 257 passed, one existing todo; typecheck passed.
- The immutable 72-scenario motor-driven gate retains its original approved differences.
- Doxygen generated the changed Suite pages with its existing BibTeX error and unrelated warnings;
  no new pump/PCHIP diagnostic was reported.

Exact review commits and published-beta verification are pending.
Final-package adoption requires the same two-manifest/two-lockfile update and repeated checks.

## Engineering release gates

Before product release, engineering must confirm digitized C/H data, H's 300–1300 US gpm range,
and axial V-base/nonvertical-speed mapping, and supply the companion workbook. SciPy returns
70.77499999999999% for H at 400 US gpm (Python two-decimal rounding: 70.77%). All 28 printed
examples match stated precision. Final release remains deferred until engineering and Desktop acceptance.
