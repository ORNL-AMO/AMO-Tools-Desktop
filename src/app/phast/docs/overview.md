# PHAST — Developer Overview

## Purpose

This document covers non-obvious architectural patterns in the PHAST module that cannot be discovered by running the application for a few minutes. It assumes you can already navigate PHAST yourself. For component-level details see [architecture.md](./architecture.md); for data shapes see [data-model.md](./data-model.md); for routing see [routing-and-navigation.md](./routing-and-navigation.md).

---

## The `_phast` Working Copy Pattern

`PhastComponent` never binds forms directly to `assessment.phast`. On init it deep-clones the persisted object into `_phast` via `JSON.parse(JSON.stringify(...))`. All child components receive `_phast` as `@Input`. Saves are triggered explicitly (user clicks Save or navigates away) at which point `_phast` is written back to `assessment.phast` and flushed to IndexedDB. This means any mid-session state the user has not saved will be lost on refresh — that is intentional.

## `setupDone` Is a Persisted Flag

`phast.setupDone` is stored in IndexedDB alongside the rest of the assessment object, not derived at runtime. The Analysis and Report tabs become available only when this flag is `true`. It is set to `true` by `PhastComponent` when the user advances past the Metered Energy step. If you need to gate a feature on completion, check this flag rather than recomputing whether all losses are valid.

## Loss Tabs Are Conditionally Filtered by Furnace and Energy Type

The set of loss-category tabs shown in the Heat Balance step is not static. `LossesService` computes the visible tabs at runtime from `phast.losses` and the furnace/energy type stored in `system-basics`. The base set is `defaultTabs` in [`tabs.ts`](../tabs.ts). Additional tabs (charge material, flue gas, slag, energy input, exhaust gas, etc.) are prepended or appended depending on furnace configuration. A developer adding a new loss type must update both `tabs.ts` and `losses.service.ts`.

## The Calculation Engine Runs via Native Module API

All thermodynamic calculations (flue gas, charge material, wall loss, etc.) are not performed in TypeScript. They are delegated to `ProcessHeatingApiService`, which wraps native (WebAssembly or Electron native) calls from the AMO Tools Suite C++ library. `PhastService` methods each handle unit conversion before calling the API (always converting Metric → Imperial before the call, then converting results back). Never assume the raw API output is in the user's selected unit system.

## Unit Storage Convention

All values in `PHAST.losses` are persisted in **Imperial units**, regardless of the user's settings. `ConvertPhastService.convertPhastImperialToMetric` / `convertMetricToImperial` handle the round-trip. `ConvertPhastService` is called once on load and once on save when the settings unit system differs from `phast.lossDataUnits`. The `lossDataUnits` field on the `PHAST` object records which unit system the stored values are in, acting as a migration marker.

## Modifications Are Nested PHAST Objects

Each `Modification` in `PHAST.modifications[]` contains a full nested `phast: PHAST` object — a complete snapshot of the loss set for that scenario. There is no diff/patch structure. `PhastCompareService` holds a `BehaviorSubject<Modification>` called `selectedModification`; all compare badge logic derives from comparing `_phast` (baseline) against this selected modification's inner `phast`.

## Explore Opportunities vs. Modify Conditions

The Assessment tab has two sub-modes controlled by `assessmentTab` in `PhastService`:

- `explore-opportunities` — renders `ExplorePhastOpportunitiesComponent`, which provides simplified sliders to adjust individual loss categories and shows instant savings without creating a full modification record.
- `modify-conditions` — renders the full `LossesComponent` for the selected modification, allowing arbitrary changes to any loss form.

When a new modification is created it sets `exploreOpportunities: true` on the `Modification` object. If a modification lacks `exploreOpportunities` (legacy data), the component falls back to `modify-conditions` mode. `setExploreOppsDefaults()` in `PhastComponent.ngOnInit` patches any missing `exploreOpps*` fields on load to prevent runtime errors on old assessments.

## Adding a New Loss Type — Files to Touch

1. [`src/app/shared/models/phast/phast.ts`](../../shared/models/phast/phast.ts) — add field to `Losses` interface
2. [`src/app/shared/models/phast/losses/`](../../shared/models/phast/losses/) — create the new loss model file
3. [`src/app/phast/tabs.ts`](../tabs.ts) — add a `LossTab` entry to the appropriate tab array
4. [`src/app/phast/losses/losses.service.ts`](../losses/losses.service.ts) — wire the tab visibility condition
5. [`src/app/phast/losses/`](../losses/) — create the loss sub-component folder with component, form service, and module
6. [`src/app/phast/phast.service.ts`](../phast.service.ts) — add the calculation method (with unit conversion)
7. [`src/app/phast/phast-results.service.ts`](../phast-results.service.ts) — accumulate the result into `PhastResults`
8. [`src/app/phast/phast-valid.service.ts`](../phast-valid.service.ts) — add validation check and include in `checkValid`
9. [`src/app/phast/convert-phast.service.ts`](../convert-phast.service.ts) — add Imperial ↔ Metric conversion

## EAF Is a Special Sub-Mode

Electric Arc Furnace (EAF) assessments use a separate set of loss categories (`energyInputEAF`, `exhaustGasEAF`) and result paths in `PhastResultsService`. The calculation branches on `phast.losses.energyInputEAF` being present. Results for EAF are surfaced through `hourlyEAFResults` / `annualEAFResults` on `PhastResults` rather than the standard `totalInput` / `heatingSystemEfficiency` path. If you are debugging result discrepancies, verify which branch `getResultCategories` selects.

## DB Persistence and Debounce

There is no auto-save debounce in PHAST. Saves are explicit: the user clicks the Save button or a lifecycle event calls `saveAssessment()` in `PhastComponent`. `saveAssessment` calls `AssessmentDbService.updateWithSettings(assessment)` which writes to IndexedDB. Navigating away from the route without saving will discard unsaved changes.

## Welcome Screen and `disableSetupDialog`

On first load of an assessment with no existing data, `PhastComponent` shows `WelcomeScreenComponent` as a modal overlay. Once dismissed, `phast.disableSetupDialog` is set to `true` and persisted so the welcome screen is never shown again for that assessment.
