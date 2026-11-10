# Fan affinity-law Suite integration

This integration targets `epic-affinity-law` and pins both the Angular application and
process-flow component to `measur-tools-suite@1.2.7-beta.461.2`. Both lockfiles are generated
with npm. The calculation changes originate in [Suite PR #461](https://github.com/ORNL-AMO/MEASUR-Tools-Suite/pull/461)
and are coordinated through [Desktop issue #7129](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/7129).

## Fan adapter and saved data

`FanAffinityLawApiService` maps the existing application input to the typed Suite input.
It calls `calculateFanAffinityLaws`, `calculateFanAffinityLawsWithFanSize`, and
`get50PercentTimeFactor`. Results are plain values and require no `delete()`.
Runtime enums retain their numeric mappings; the adapter obtains their values from the
loaded Suite module. Percent input fields remain percentages. The standalone time helper
accepts a dimensionless fraction and returns dimensionless time shares.

Delivered Fan Power means mechanical power delivered to the fan at the baseline operating
point. It is entered and stored in hp for imperial settings and kW for metric settings;
the calculation adapter receives kW after application unit conversion. Flow volumes use
consistent units. Diameter changes use the cubed diameter ratio for rated capacity.
Displayed electrical power is calculated from Suite annual energy divided by operating hours,
and Two-Speed time shares come from the Suite helper using the applicable rated capacity.

Existing saved numeric inputs and database initialization are preserved. **Saved power values
previously entered as nameplate or full-speed power need engineering review** under the
delivered-baseline-power interpretation. No automatic data rewrite or nameplate estimator
is included.

## Validation and upgrade compatibility

Desktop owns validation. Invalid active inputs clear results and prevent Suite calls,
including Treasure Hunt calculations. Power, efficiencies, rated flow, operating hours,
variable-control baseline flow, and active diameters must be finite and positive.
Efficiencies cannot exceed 100%; hours cannot exceed 8,760 per year. Electricity price and
modification flow may be zero. Baseline flow cannot exceed rated flow; modification flow
cannot exceed the resized rated capacity. Positive larger and smaller diameters are supported.
On/Off baseline flow follows rated flow. Inactive modification inputs do not invalidate
baseline-only calculations.

The upgrade from Suite 1.2.0 also migrates affected pump/motor, compressor/catalog, heating,
cooling, steam, water, lighting, fan, and standalone adapters. Applicable changes were reused
from [Desktop integration PR #9054](https://github.com/ORNL-AMO/AMO-Tools-Desktop/pull/9054),
without its unrelated feature work. The pump differential-pressure field is optional for
existing records. Near-zero motor power-factor calculations now supply motor nameplate data.
Owned Suite classes and vectors retain cleanup; value-object outputs do not.
The process-flow water-estimator loader uses the package's default factory and resolves
WASM relative to the document for web and Electron file loading. Chiller efficiency rows
use the current energy-result vectors with explicit cleanup of the owned vector handles.

## Verification and release dependency

The fan integration tests load the published beta WASM and cover delivered baseline power,
resized Two-Speed flow/time shares, percent/volume equivalence, unit conversion, unchanged
operating points, saved inputs, invalid inputs, and Treasure Hunt. Pump/motor fixtures record
accepted Suite corrections explicitly in `expected-differences.json`. A runtime export
inventory also checks active adapter members because the shared module is typed as `any`.
The runtime smoke fixture uses the application initializer and checks pump, motor, and fan
calculations over HTTP and the Electron-style `file:` loading path.

The help link uses `environment.measurDocsUrl + 'group__fan__affinity__laws__calculator'`.
The development target returned HTTP 404 during integration on 2026-11-10. **Deploy the new
Suite documentation before releasing this Desktop change.** This dependency is recorded in
the issue and PR; the application keeps the canonical documentation URL.

Nameplate estimation, layout redesign, and remaining cosmetic feedback are separate work.
