# Process Cooling Assessment — Overview

## Purpose

This document covers non-obvious constraints, design decisions, and developer traps in the Process Cooling Assessment module — things that would take significant code reading to discover on your own. It assumes you can navigate the app yourself and focuses on what the UI doesn't tell you.

For component/service structure, see [architecture.md](architecture.md). For data shapes and validation, see [data-model.md](data-model.md). For routing guards and stepped navigation, see [routing-and-navigation.md](routing-and-navigation.md).

---

## What This Module Is

A multi-step tool for modeling the annual energy consumption of a chilled-water cooling plant and evaluating potential efficiency improvements. The core output is a comparison of baseline energy use against one or more "modification" scenarios — each representing a named combination of engineering changes. The number-crunching is done by a WASM-compiled C++ engine (the "Suite API") that the Angular layer feeds data to and gets results from.

From the user's perspective there are three tabs: Baseline, Assessment, Report. From a developer's perspective the interesting complexity is in how modifications work, how state flows to the Suite API, and how several non-obvious constraints shape the architecture.

---

## How Modifications Actually Work

This is the most important thing to understand before changing anything in the Explore Opportunities flow.

**Modifications are EEM overlays, not copies.** A `Modification` object stores only the delta values for each EEM — it does not contain a full copy of the assessment. At results-calculation time, `ModificationService.getModifiedProcessCoolingAssessment()` assembles a complete `ProcessCoolingAssessment` by taking the current baseline and applying each active EEM as a targeted override patch. This assembled object is what gets passed to the Suite API.

```
baseline ProcessCoolingAssessment
  + modification.increaseChilledWaterTemp → overrides operations.chilledWaterSupplyTemp
  + modification.upgradeCoolingTowerFans → overrides towerInput.towerType, fanSpeedType, numberOfFans
  ...
= modified ProcessCoolingAssessment (ephemeral, never stored)
```

The `useOpportunity` boolean on each EEM object is the activation flag. When `useOpportunity = false`, `getModifiedProcessCoolingAssessment` skips that block entirely — the baseline value stays unchanged. This means you can have an EEM object with values populated but still inactive.

**New modifications are pre-seeded from baseline values.** `getNewModification()` calls `getBaselineExploreOppsValues()` first and uses those values as the starting point for each EEM. This is why the forms show sensible current-system defaults rather than blank fields.

**`replaceChillerRefrigerant` is architecturally different from all other EEMs.** All other EEMs work by patching `systemInformation` fields in `getModifiedProcessCoolingAssessment`. This one instead sets `installVSD: true` on individual chillers in the inventory copy AND passes `SuiteModificationArgs.changeRefrig = true` as a separate flag to a different Suite API code path. If you're adding a new EEM that modifies per-chiller data rather than system-level data, look at `installVSDOnCentrifugalCompressors` and `replaceChillerRefrigerant` as precedents — they require more than just a `systemInformation` patch.

**Invalid modifications produce empty zeroed results, intentionally.** If `isModificationValid()` returns false for a modification, `ProcessCoolingResultsService` still emits a result for it — just a zeroed `ProcessCoolingResults` via `getEmptyInvalidResults()`. The executive summary shows invalid modifications with blank values rather than hiding them. This is deliberate UX.

---

## Adding a New EEM

To add an EEM you need to touch more places than just the component:

1. Add the EEM property type to `Modification` in the shared models
2. Add its `ModificationEEMProperty` key
3. Seed it in `ModificationService.getNewModification()` (with baseline values where applicable)
4. Apply it in `ModificationService.getModifiedProcessCoolingAssessment()` by patching the appropriate field
5. Add its validation to `ModificationService.isModificationValid()` using `ExploreOpportunitiesFormService`
6. Add a label to `EEM_LABELS` in [process-cooling-constants.ts](../constants/process-cooling-constants.ts)
7. Create the component in `explore-opportunities/`

---

## Weather as a Hard Dependency

Weather data is required before the Suite API will return any results — `ProcessCoolingResultsService.getProcessCoolingSuiteResults()` returns `undefined` if `isValidWeatherData()` is false. This also blocks forward navigation: the stepped-nav gates on `isWeatherDataValidSignal()` before allowing access to the Pump step and beyond.

Weather data is also separately **converted** before being passed to the Suite API. The main assessment data goes through its own conversion path, but weather data has its own conversion method: `ConvertProcessCoolingService.convertWeatherDataForSuiteApi()` is called inside `getProcessCoolingSuiteResults()` just before the Suite API call. Both conversions are required; they're independent.

The weather module is lazy-loaded and communicates through the `WEATHER_CONTEXT` injection token. When weather data changes inside the lazy-loaded module, `ProcessCoolingWeatherContextService` (the implementation of that token) emits on `weatherContextData$`. `ProcessCoolingAssessmentService` subscribes to this in its constructor and writes valid weather data into the assessment automatically — components don't need to wire this manually.

---

## DB Persistence Has Extra Overhead

Every state update triggers a DB write via a 300ms debounce on `assessment$`. But after the write, the service does more than just update the one record:

```typescript
// After updateWithObservable(assessment):
this.assessmentDbService.getAllAssessments()
  .pipe(tap(all => this.assessmentDbService.setAll(all)))
```

This `getAllAssessments → setAll` round-trip is a legacy pattern required to keep the in-memory assessment list (used by directory/dashboard components outside this module) up to date. A comment in the service marks it as legacy debt. The consequence for developers: every assessment save makes two DB calls. Don't try to optimize this away without understanding the directory components that read from `setAll`.

---

## `hoursOnMonToSun` Is Stored, Not Computed

`WeeklyOperatingSchedule` has a `days` array (7 `DayScheduleData` entries) and a `hoursOnMonToSun` array (7 derived numbers). The hours array is what the Suite API actually uses. It is computed by `getHoursOnMonToSun(days)` but **stored on the object** — it is not recalculated at read time.

If you update `days` values without also calling `getHoursOnMonToSun()` and storing the result, the saved schedule will be stale. Always call both together. The `WeeklyOperatingScheduleComponent` handles this, but if you're writing test fixtures or migration code that constructs schedule objects directly, you need to set both fields.

---

## `selectedModificationId` Persists Across Sessions

`ModificationService` stores the selected modification ID in `localStorage` under the key `PC_SELECTED_MODIFICATION_KEY`. The resolver reads it back on load and selects the matching modification (or falls back to the first modification in the list if the stored ID isn't found). This means the selected modification survives page refreshes and navigating away and back — a developer who adds a "delete modification" flow needs to clean up localStorage if the deleted modification was selected.

---

## The Suite API Branches on Condenser Type

`ProcessCoolingResultsService` calls either `suiteApi.getWaterCooledResults()` or `suiteApi.getAirCooledResults()` based on `systemInformation.operations.condenserCoolingMethod`. These are different Suite API entry points with different input shapes — air-cooled assessments use `airCooledSystemInput` while water-cooled assessments use `waterCooledSystemInput`. Both fields are always present on `SystemInformation` (they're set in the default), but only one is relevant at a time. Don't assume fields from the inactive condenser type will be ignored gracefully — if you're constructing test data, populate the correct one for the condenser method.

---

## `setupDone` Gates the Assessment Tab

`processCooling.setupDone` is what `AssessmentRedirectGuard` reads to decide whether to let users into the `assessment/` route. Until this flag is `true`, clicking the Assessment tab redirects back to `baseline/assessment-settings`. Understanding where this flag gets set is important if you're adding or changing the baseline completion flow.

---

## Unit Conversion Timing

Unit conversion only runs once per assessment — when `initAssessmentSettings()` first creates assessment-level settings. If the parent directory uses Metric, the assessment data gets converted from Imperial to Metric at that point. After that, the saved data remains in whatever units were applied, and the `Settings.unitsOfMeasure` drives how validators and display labels are applied.

The `existingDataUnits` field on `ProcessCoolingAssessment` (`'Imperial'` on all defaults) records the units the data was originally created in. This field is relevant if you're writing migration or conversion logic — read it before assuming the stored data is in any particular unit system.
