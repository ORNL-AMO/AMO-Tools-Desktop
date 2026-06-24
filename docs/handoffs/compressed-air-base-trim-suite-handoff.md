# Compressed Air Base/Trim Reallocation Handoff

## Summary

AMO-Tools-Desktop migrated compressed-air assessment flow reallocation to `MEASUR-Tools-Suite::reallocateProfileFlow`. A new suite WASM test has been added in:

`tests/wasm-mocha/compressedAir/assessment/wasm_compressor_system_profile.test.ts`

Test name:

`reallocates base-trim flow for the desktop interval 11 payload`

The expected values in that test come from the pre-suite-migration desktop implementation. The current suite result does not match those values. The same mismatch reproduces in both the suite WASM test and a desktop characterization test, so the primary behavior change is suite-side.

## Expected Vs Current Result

For trim compressor `p8p62x1d2`, day type `hvb0u7041`, interval `11`:

Expected previous desktop result:

- Power: `65.52 kW`
- Airflow: `332.01 acfm`
- Percent capacity: `97.08%`
- Percent power: `97.93%`

Current suite result:

- Power: `62.65869100089972 kW`
- Airflow: `312.10603612645116 acfm`
- Percent capacity: `91.2590748907752%`
- Percent power: `93.66022571135981%`

## Key Reproduction Data

Demand row:

```ts
{
  dayTypeId: 'hvb0u7041',
  timeIntervalHr: 11,
  airflowAcfm: 677.1060361264512,
  powerKw: 153.3360384,
  totalPowerKw: 153.3360384,
  airflowFraction: 0.6316287650433314,
  powerFraction: 0.7883600946015424,
  auxiliaryPowerKw: 0
}
```

System mode:

```ts
controlMode: CompressorSystemControlMode.BaseTrim
inputBasis: CompressorInputBasis.Electrical
atmosphericPressurePsia: 14.7
totalAirStorageFt3: 5000
additionalReceiverVolumeFt3: 0
canShutdown: true
```

Trim selection:

```ts
{
  dayTypeId: 'hvb0u7041',
  compressorId: 'p8p62x1d2'
}
```

Base compressors:

- `diagqi3k4`
- `3qo7b7u3w`
- Both are screw, injected, single-stage, `VariableDisplacementUnload`.
- Both have full-load point `100 psig`, `365 acfm`, `63.8 kW`.
- Both have desktop control `unloadPointCapacity = 40`.
- Their performance-point unload airflow is `182 acfm`, which implies `182 / 365 = 49.86%`.

Trim compressor:

- `p8p62x1d2`
- Screw, injected, single-stage, `Vfd`.
- Full load: `115 psig`, `342 acfm`, `66.9 kW`.
- Mid turndown: `117.4 psig`, `205 acfm`, `45 kW`.
- Turndown: `119.1 psig`, `109 acfm`, `25.9 kW`.

## Investigation Notes

The current suite result can be explained exactly by the current allocation:

```text
677.106036 acfm demand - 365 acfm selected base flow = 312.106036 acfm trim flow
```

That `312.106036 acfm` is the suite’s current trim row output.

The expected previous desktop trim airflow implies a different selected base contribution:

```text
677.106036 acfm demand - 332.01 acfm expected trim flow = 345.096036 acfm base flow
```

So the old desktop behavior did not effectively subtract the selected base compressor’s `365 acfm` full-load point in this case. It behaved as if the selected base compressor contributed about `345.096 acfm`.

Current suite base/trim flow is in:

`src/compressedAir/assessment/compressor_system_profile.cpp`

Relevant behavior:

- The base/trim branch subtracts trim full-load airflow to select enough base compressors.
- It sets selected base compressors before the trim compressor.
- It then falls through to the generic measured-capacity allocation loop.
- The generic loop calculates selected base compressors using `full_load_airflow`.
- In this case, that means the first selected base compressor is allocated at `365 acfm`, leaving `312.106036 acfm` for the trim.

## Likely API Gap

The pre-migration desktop scalar calculation path had access to desktop compressor control settings, especially:

```ts
compressor.compressorControls.unloadPointCapacity
```

For the base compressors in this test, that value is `40`.

The current suite profile input type, `CompressorProfileCompressor`, does not carry `unloadPointCapacityPct`. In `compressor_system_profile.cpp`, suite reconstructs unload capacity using performance-point airflow:

```cpp
unload_airflow / full_load_airflow * 100.0
```

For the base compressors here, that becomes:

```text
182 / 365 * 100 = 49.86%
```

That is not the same as the desktop control setting of `40%`. The assessment profile API likely needs to carry explicit compressor control data, or at least `unloadPointCapacityPct`, so profile calculations can reproduce the old desktop scalar compressor behavior.

## Suggested Suite Work

1. Add a C++ unit test equivalent to the WASM test for `reallocateProfileFlow`.
2. Decide whether `CompressorProfileCompressor` should include explicit control fields such as:
   - `unloadPointCapacityPct`
   - possibly any other control fields used by scalar compressor constructors but missing from profile structs.
3. Update `calculatePositiveDisplacement` / `unloadPointCapacityPercent` so profile calculations use the explicit desktop-equivalent control value when supplied.
4. Re-run the new WASM test and confirm the trim compressor returns:
   - `65.52 kW`
   - `332.01 acfm`
   - `0.9708 airflowFraction`
   - `0.9793 powerFraction`
5. If the profile API changes, update:
   - `include/compressedAir/assessment/compressor_system_profile.h`
   - `src/compressedAir/assessment/compressor_system_profile.cpp`
   - `bindings-wasm/compressedAir/assessment/compressor_system_profile.cpp`
   - `ts_def/ts_def_modules/compressedAir/assessment/compressor_system_profile.d.ts`
   - C++ and WASM tests

## Desktop Follow-Up

If the suite adds an explicit `unloadPointCapacityPct` or similar field, AMO-Tools-Desktop should map it from:

```ts
compressor.compressorControls.unloadPointCapacity
```

in:

`src/app/compressed-air-assessment/compressed-air-calculation.service.ts`

specifically in the mapper that builds suite `CompressorProfileCompressor` objects.

Desktop should not massage the suite output to force the old values. The calculation should remain suite-owned.

## Verification Commands

Suite:

```bash
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/karma start --browsers ChromeHeadlessNoSandbox --auto-watch false
```

Desktop after suite update:

```bash
./node_modules/.bin/tsc -p src/tsconfig.app.json --noEmit
./node_modules/.bin/ng test --watch=false --browsers=ChromeHeadless --include=src/app/compressed-air-assessment/calculations/compressed-air-example-calculations.spec.ts
```
