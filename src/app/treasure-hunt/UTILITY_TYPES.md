# Treasure Hunt – Utility Type String Reference

This document explains the two distinct string-literal types used to represent utility/energy categories in `src/app/treasure-hunt` and clarifies when each should be used.

---

## 1. `OpportunityUtilityType`

**Definition** (`src/app/shared/models/treasure-hunt.ts`)

```typescript
export type OpportunityUtilityType =
  | 'Electricity'
  | 'Natural Gas'
  | 'Water'
  | 'Waste Water'
  | 'Other Fuel'
  | 'Compressed Air'
  | 'Steam'
  | 'Mixed'
  | 'Other';
```

**Purpose / when to use**

- Used at the **report / summary layer**: `OpportunitySummary.utilityType`, `TreasureHuntOpportunityResults.utilityType`, and `TreasureHuntOpportunityResults.energySourceType`.
- Values are the **full display names** shown to the user in charts, tables, and exported reports.
- `'Mixed'` is assigned when an opportunity sheet covers more than one utility type.
- `'Other'` is a fallback catch-all.

**Key files**
- `src/app/treasure-hunt/treasure-hunt-report/opportunity-summary.service.ts` – maps `EnergyUseType` results to `OpportunityUtilityType` when building `OpportunitySummary` objects.
- `src/app/treasure-hunt/treasure-hunt-report/treasure-hunt-report.service.ts` – filters summaries by `utilityType`.
- `src/app/shared/models/treasure-hunt.ts` – type definition, `OpportunitySummary`, `TreasureHuntOpportunityResults`.

---

## 2. `EnergyUseType`

**Definition** (`src/app/shared/models/treasure-hunt.ts`)

```typescript
export type EnergyUseType =
  | 'Electricity'
  | 'Gas'
  | 'Water'
  | 'WWT'
  | 'Other Fuel'
  | 'Compressed Air'
  | 'Steam';
```

**Purpose / when to use**

- Used at the **opportunity sheet input layer**: `EnergyUseItem.type`.
- Values are **abbreviated names** that align directly with the utility toggles in the Operation Costs screen and the corresponding cost fields in `Settings` (e.g. `settings.fuelCost`, `settings.waterWasteCost`).
- Do **not** use `OpportunityUtilityType` values here – the abbreviations are intentional to keep the mapping to `Settings` cost fields explicit.

**Mapping to `OpportunityUtilityType`**

| `EnergyUseType` | `OpportunityUtilityType` |
|-----------------|--------------------------|
| `'Electricity'` | `'Electricity'`          |
| `'Gas'`         | `'Natural Gas'`          |
| `'Compressed Air'` | `'Compressed Air'`    |
| `'Other Fuel'`  | `'Other Fuel'`           |
| `'Steam'`       | `'Steam'`                |
| `'Water'`       | `'Water'`                |
| `'WWT'`         | `'Waste Water'`          |

This mapping is applied in `opportunity-summary.service.ts` when converting opportunity-sheet results into `OpportunitySummary` objects.

**Key files**
- `src/app/treasure-hunt/calculators/standalone-opportunity-sheet/energy-use-form/energy-use-form.component.ts` – lists available types and uses `EnergyUseType` for form items.
- `src/app/treasure-hunt/calculators/standalone-opportunity-sheet/opportunity-sheet.service.ts` – filters `EnergyUseItem[]` by type to calculate per-utility results.
- `src/app/treasure-hunt/treasure-hunt-calculator-services/assessment-opportunity.service.ts` – same filtering pattern for assessment opportunities.
- `src/app/treasure-hunt/convert-input-data.service.ts` – unit conversion keyed on `EnergyUseType`.
- `src/app/treasure-hunt/treasure-hunt-report/treasure-hunt-report.service.ts` – CO₂ emissions aggregation keyed on `EnergyUseType`.

---

## Why two types instead of one?

The two types serve different roles in the data pipeline:

1. **`EnergyUseType`** (input) is tightly coupled to `Settings` cost fields and the abbreviated labels historically used in the opportunity-sheet entry form. Changing these values would require a data migration.
2. **`OpportunityUtilityType`** (output) uses the full human-readable display names expected by reports, charts, and PowerPoint exports. It also adds `'Mixed'` and `'Other'` which have no counterpart in the input layer.

Keeping them separate makes the mapping explicit and preserves backwards compatibility with persisted assessment data.
