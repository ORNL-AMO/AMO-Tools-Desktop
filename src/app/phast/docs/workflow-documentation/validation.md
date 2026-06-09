**Date Generated:** May 31, 2026

# Validation and Setup Completion

PHAST uses a two-tier validation model: a coarse-grained `setupDone` flag that gates access to the analysis phase, and a granular `PhastValid` object that provides field-level validation feedback throughout the UI.

---

## SetupDone

`setupDone` is a boolean property on the `PHAST` data object. When `true`, the assessment is considered sufficiently complete to support analysis and reporting.

### What triggers `setupDone = true`

The `LossesService.checkSetupDone()` method evaluates the following conditions. All must be satisfied:

1. **Furnace type is selected** in Assessment Settings
2. **Energy source is selected** in Assessment Settings
3. **Operating hours are set** (non-zero)
4. **At least one loss entry exists** for every required loss category for the configured furnace type:
   - Charge material must have at least one entry (for applicable furnace types)
   - Operations data must be entered
5. **At least one energy cost is configured** (fuel cost, electricity cost, or steam cost as applicable)

Optional steps (Aux Equipment, Design Energy Use, Metered Energy) do not affect `setupDone`.

### UI Consequences of `setupDone`

| Element | Behavior when `setupDone = false` | Behavior when `setupDone = true` |
|---|---|---|
| Assessment tab | Hidden or disabled | Visible and clickable |
| Report tab | Hidden or disabled | Visible and clickable |
| Sankey tab | Hidden or disabled | Visible and clickable |
| "Go to Assessment" button | Not shown | Shown in footer |
| Banner status indicator | Shows incomplete state | Shows complete state |

---

## PhastValid Object

`PhastValid` is a structured validation result object produced by `PhastValidService.checkValid()`. It provides per-section and per-item validation status that drives the visual status indicators (colored dots or icons) on individual tabs and form fields.

### Structure

```
PhastValid {
  isValid: boolean              // overall assessment validity
  system: boolean               // Assessment Settings complete and valid
  losses: {
    chargeMaterialValid: boolean
    wallLossesValid: boolean
    atmosphereLossesValid: boolean
    fixtureLossesValid: boolean
    openingLossesValid: boolean
    coolingLossesValid: boolean
    flueGasValid: boolean
    otherLossesValid: boolean
    leakageLossesValid: boolean
    extendedSurfaceValid: boolean
    slagLossesValid: boolean
    auxiliaryPowerValid: boolean
    energyInputEAFValid: boolean
    exhaustGasEAFValid: boolean
    energyInputExhaustGasValid: boolean
    heatSystemEfficiencyValid: boolean
  }
  operationsValid: boolean
  auxEquipmentValid: boolean
}
```

### What "valid" means per loss type

A loss type is considered valid when:

- Every entered item within that type has all required fields populated with in-range values
- No form field is in an error state (e.g., temperature out of range, negative area)

A loss type with zero entries is considered valid (it is not required unless it falls under the `setupDone` required categories above). The distinction matters: having no wall loss entries is fine, but having one wall loss entry with missing fields is invalid.

### Where PhastValid is used

- **Loss tab headers** — Each tab shows a visual indicator (color dot) reflecting the valid state of its entries. A red/warning indicator flags that one or more entries need attention.
- **Phast-tabs step bar** — The step tabs in baseline mode show aggregate validity for each step.
- **Banner** — The overall banner status indicator reflects the `isValid` flag.
- **Report** — Invalid data does not prevent report generation, but a warning is shown.

---

## Tab Status Indicators

Two aggregate status flags feed the step tab visual indicators:

- **`tab1Status`** — derived from `PhastValid.system` — reflects whether Assessment Settings is complete
- **`tab2Status`** — derived from `PhastValid.losses` and `PhastValid.operationsValid` — reflects whether the Heat Balance is complete and valid

These are computed in `PhastComponent` and passed as inputs to the `PhastTabsComponent`.

---

## Validation Timing

Validation is recomputed on every save. After any form change that triggers a `saveDb()` call in `PhastComponent`:

1. `LossesService.checkSetupDone()` runs → updates `phast.setupDone`
2. `PhastValidService.checkValid()` runs → produces a new `PhastValid` object
3. Both results are stored on the assessment and trigger Angular change detection to update all UI status indicators

This means validation feedback is always current with the latest saved state.

---

## Invalid PHAST State

If the assessment data is found to be corrupt or unreadable when loaded (e.g., a migration failure or data import error), the `InvalidPhastComponent` is shown instead of the normal assessment UI. This component displays an error message and options to attempt recovery or start over.

---

## Related

- `src/app/phast/phast-valid.service.ts` — Validation logic and `PhastValid` production
- `src/app/phast/losses/losses.service.ts` — `checkSetupDone` implementation
- `src/app/phast/phast.component.ts` — Orchestrates validation on every save
- `src/app/phast/invalid-phast/` — Error state component for unreadable assessments
