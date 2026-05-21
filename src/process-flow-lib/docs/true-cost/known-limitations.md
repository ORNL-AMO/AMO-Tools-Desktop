**Date Generated:** May 15, 2026

# Known Limitations and Unhandled Cases

**Document Scope:** This document catalogs cases that the True Cost Attribution Algorithm does not currently handle correctly or does not handle at all. Each entry describes the affected scenario, the behavior the algorithm currently produces, the expected correct behavior, and where in the source the issue is tracked.

Water assessment practitioners should be aware of these limitations when interpreting results for facility configurations that match these patterns.

---

## 1. Summary Table

| # | Issue | Affected Component | Severity | Status | Source Location |
|---|---|---|---|---|---|
| 1 | Wastewater treatment chain edge cases | Wastewater Treatment | Moderate | Open — partial support | `results.ts` ~`applySystemWasteTreatmentCosts` |
| 2 | System flow totals population | All systems | High | Open — flagged for rewrite | `results.ts` ~`setWaterUsingSystemFlows` |
| 3 | Pump/motor energy overwrite in Step 3 | All systems | Moderate | Open — known design gap | `results.ts` ~Step 3 finalization |
| 4 | Empty result type placeholders | Reporting layer | Low | Open — declared, unpopulated | `types/results.ts` |

---

## 2. Detail: Wastewater Treatment Chain Edge Cases

### Description

When multiple Wastewater Treatment units are connected in **series** (e.g., Screening → Biological Treatment → Membrane Filtration), each unit is evaluated independently. However, the two-pass logic (downstream reuse + upstream discharge) may produce inaccurate results in configurations where:

- An intermediate WWT unit in the chain has both an upstream WWT input and a downstream WWT output, with some flow going to reuse and some continuing downstream to another WWT unit.
- The `downstreamTreatmentAttributionMap` used for Pass 2 deductions does not fully account for the cascading charges across the chain.

### Current Behavior

Each WWT unit in the chain uses its own block cost and its own two-pass attribution independently. The deduction logic subtracts the Pass 1 charged portion from Pass 2 flow responsibility, but this deduction is computed only for the immediate WWT unit's own downstream attributions, not for attributions made by upstream WWT units in the same chain.

### Expected Behavior

For a chained WWT configuration, the total cost attributed across all WWT units in the chain should sum to the combined block cost of all units in the chain, with no double-charging or under-charging of any individual system.

### Consequence for Results

In complex WWT chains, individual system charges may be slightly over- or under-attributed. Simple single-unit or two-unit chains without reuse are not affected.

### Workaround

Users can apply adjusted attribution overrides to correct the attribution for affected systems. Alternatively, redesigning the diagram to combine chained WWT units into a single node will avoid the issue.

### Reference

Source location: `results.ts`, `applySystemWasteTreatmentCosts`.

---

## 4. Detail: System Flow Totals Population (`setWaterUsingSystemFlows`)

### Description

The function responsible for computing individual water flow totals for each water-using system (`setWaterUsingSystemFlows`) is flagged in the source as needing substantial maintenance. It was originally designed to support a now-incomplete assessment feature set, and its internal logic may not correctly represent the true water flows for all system configurations.

### Current Behavior

The function populates `systemFlowTotals` fields (source water, recirculated water, discharge water, known losses, water in product) for each system using a combination of user-entered overrides and edge flow values. In some paths, user-entered totals override calculated values; in others, they may conflict or be inconsistent.

### Expected Behavior

`systemFlowTotals` should accurately reflect the water balance for each system based on the diagram's flow connections, reconciled with any user-entered overrides, in a consistent and predictable manner.

### Consequence for Results

Flow totals are used in the water balance calculation and in reporting. Inaccurate system flow totals may lead to incorrect water balance results and misleading water balance percentages in summary reports.

### Workaround

Until this function is revised, verify system-level water balance results against manually calculated values for critical assessments. The True Cost dollar attribution (Step 2 and Step 3 of the algorithm) reads flow values directly from the diagram's calculated data rather than from `systemFlowTotals`, and is therefore not affected by this issue.

### Reference

Source location: `results.ts`, lines 134–207. Tracked as related issues #7432 and #7433. The source comment advises starting fresh when returning to assessment enhancement work.

---

## 5. Detail: Pump/Motor Energy Overwrite in Step 3

### Description

During Step 2 (cost attribution), pump and motor energy costs from Water Intake and Water Discharge nodes are proportionally attributed to downstream/upstream systems alongside the intake and discharge costs. These attributed energy costs accumulate in `trueCostOfSystems[systemId].systemPumpAndMotorEnergy`.

However, in Step 3 (finalization), the system's own pump/motor entries are re-calculated directly and the result **overwrites** the accumulated value in `systemPumpAndMotorEnergy`. The energy attributed from intake and discharge nodes in Step 2 is discarded.

### Current Behavior

`systemPumpAndMotorEnergy` in the final output reflects only the system's own pump/motor entries (i.e., pumps installed within or assigned directly to the system). It does not include the proportional share of intake or discharge pump energy attributed in Step 2.

### Expected Behavior

`systemPumpAndMotorEnergy` should ideally accumulate all motor energy costs attributable to the system:

1. The system's own motor entries (from Step 3).
2. The proportional share of intake pump energy (attributed in Step 2).
3. The proportional share of discharge pump energy (attributed in Step 2).

### Consequence for Results

Motor energy attributed from intake and discharge nodes is currently lost from the final per-system total. For facilities where intake or discharge pumping costs are significant, this will understate the true cost.

### Workaround

Pump and motor energy for intake and discharge infrastructure can be entered directly on the system node's motor entries rather than on the intake/discharge node, as an interim workaround.

### Reference

Source location: `results.ts`, Step 3 finalization loop.

---

## 6. Detail: Empty Result Type Placeholders

### Description

Three result structures — `WaterResults`, `ExecutiveSummaryReport`, and `SystemSummaryReport` — are declared in the type definitions but are not populated by the current algorithm.

### Current Behavior

These types exist in the type definitions file but no code path populates them with data. They are declared as placeholders for future reporting features.

### Expected Behavior

These structures are intended to provide:

- `WaterResults` — A combined results object encompassing all water assessment outputs.
- `ExecutiveSummaryReport` — A high-level summary suitable for executive reporting.
- `SystemSummaryReport` — A per-system summary report.

### Consequence for Results

Any code that attempts to read from these result types will receive empty or undefined data. There is no impact on the core true cost calculation, which uses the populated `PlantResults` structure.

### Workaround

Use `PlantResults` (returned directly by `getPlantSummaryResults`) for all current reporting needs.

### Reference

Source location: `types/results.ts`.

---

## 7. Out-of-Scope Configurations (Not Modeled)

The following facility configurations are not within the current design scope of the algorithm. They do not produce incorrect results — they simply cannot be modeled in the current diagram schema.

| Configuration | Notes |
|---|---|
| Third-party water costs | A `thirdParty` field exists in the cost structure but is not attributed by any current sub-routine. Reserved for future use. |
| Permit fees and fixed annual charges | The current model is volumetric ($/kgal). Fixed annual charges not tied to flow volume cannot be represented as a cost-component node. |
| Time-varying unit costs | All unit costs are assumed constant over the year. Seasonal rate structures or tiered pricing are not supported. |
| Water quality as an attribution factor | Attribution is based solely on volumetric flow. Quality-weighted allocation (e.g., attributing more cost to systems that receive higher-quality treated water) is not supported. |
| Multiple intakes with blending | If two intakes of different quality are blended before treatment, the algorithm treats each intake independently and does not model the blended quality or blending ratios explicitly. The volume-based attribution will still correctly split costs, but quality effects are ignored. |
