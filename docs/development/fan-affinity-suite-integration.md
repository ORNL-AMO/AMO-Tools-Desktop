# Fan affinity-law Suite integration

This change targets `epic-affinity-law`, synced with `develop` after the pump-result
integration. Shared Suite adapters and motor regression coverage come from that base;
this PR changes the fan calculator and adopts `measur-tools-suite@1.2.7-beta.461.2`
in both packages, with npm-generated lockfiles.

The calculation changes originate in [Suite PR #461](https://github.com/ORNL-AMO/MEASUR-Tools-Suite/pull/461)
and are coordinated through [Desktop issue #7129](https://github.com/ORNL-AMO/AMO-Tools-Desktop/issues/7129).

`FanAffinityLawApiService` maps the existing application input to the typed Suite input
and calls `calculateFanAffinityLaws`, `calculateFanAffinityLawsWithFanSize`, and
`get50PercentTimeFactor`. Results are plain values with no `delete()`. Runtime enum
mappings and percentage input conventions are preserved; the time helper accepts and
returns dimensionless fractions.

Delivered Fan Power is mechanical power delivered at the baseline operating point.
Entry and storage remain hp for imperial settings and kW for metric settings; Suite
receives kW after conversion. Existing numeric inputs are not rewritten. **Values
previously entered as nameplate or full-speed power need engineering review.**

Displayed electrical power is Suite annual energy divided by operating hours. Two-Speed
time shares use the exported helper and the applicable resized rated capacity. Flow units
remain consistent, and rated capacity scales with the cubed diameter ratio.

Desktop retains required, positive/range, and flow-capacity checks, On/Off flow
synchronization, and invalid-result clearing including Treasure Hunt. Positive larger
and smaller diameters are supported. No custom finite-number form checks are added.
Fan integration tests cover supplied examples, percent/volume and unit equivalence,
unchanged operating points, saved inputs, time shares, invalid forms, and Treasure Hunt.

The help link uses `environment.measurDocsUrl + 'group__fan__affinity__laws__calculator'`.
The development URL returned HTTP 404 during integration. **Deploy the new Suite
documentation before releasing this Desktop change.**

Nameplate estimation, layout redesign, and remaining cosmetic feedback are separate work.
