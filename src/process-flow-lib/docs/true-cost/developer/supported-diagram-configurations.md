**Date Generated:** June 8, 2026

# True Cost Attribution — Supported Cases

Cases verified for each attribution function in `src/process-flow-lib/water/logic/results.ts`.

---

## Origin of Supported Cases

All cases in this document are derived from the fixture-based unit test suite at
`process-flow-diagram-component/src/__tests__/plant-summary.test.ts`. Each fixture defines
the minimum graph needed to exercise one identifiable behavior of `getPlantSummaryResults`.
Cases are listed here assuming all tests pass.

Cases marked **⚠ snapshot** lock in current behavior that is known to be incorrect. The
expected correct behavior is noted alongside. Snapshot tests must be deliberately updated
when the underlying algorithm bug is fixed.

Cases marked **⏳ pending** describe configurations that the algorithm cannot currently
handle safely. The test exists as `it.todo()` in the test file.

---

## `applySystemIntakeCosts` — `water-intake`

Walks downstream from each intake node, stopping attribution at the first water-using system on each path. Splits intake cost among those systems by the volume each receives from the intake.

**Denominator selection:**

Attribution fractions are computed against one of two denominators:

- **Delivered-flow-volume basis** (`deliveredFlowVolume` — the immediate treatment node's total outflow): used when the treatment chain is the sole gateway through which all intake flow reaches downstream systems. Ensures 100% of intake cost is distributed even when water is lost in treatment.
- **Intake-flow-volume basis** (`intakeData.blockCosts.totalFlow` — the intake's total outflow): used when the intake splits to multiple paths, or when no treatment losses exist. Each system receives its proportional share of the full intake volume; other paths cover the remainder.

**Conditions for delivered-flow-volume basis** (both must hold):

1. `intakeHasSingleOutflow` — the intake node has exactly one outgoing child, meaning all intake flow enters a single treatment chain.
2. A treatment loss exists somewhere in the chain — either the immediate upstream treatment node (`deliveredFlowVolume < treatmentNodeInflow`) or any treatment node traversed earlier in the path (`hasUpstreamTreatmentLoss`).

**Verified cases (test fixture → behavior):**

| Test fixture | Configuration | `intakeHasSingleOutflow` | Chain has losses | Denominator basis | Expected result |
|---|---|---|---|---|---|
| `simple-linear` | Intake → System → Discharge | true | false — no treatment | intake-flow-volume | System 100% |
| `shared-intake` | Intake → {SystemA (60), SystemB (40)} | false | false — no treatment | intake-flow-volume | SystemA 60%, SystemB 40% |
| `treatment-with-loss` | Intake(100) → Treatment(100in/80out) → System | true | true | delivered-flow-volume | System 100% (80/80) |
| `treatment-no-loss` | Intake(100) → Treatment(100in/100out) → {SystemA(60), SystemB(40)} | true | false | intake-flow-volume | SystemA 60%, SystemB 40% |
| `treatment-chain` | Intake(100) → TreatA(100in/80out) → TreatB(80in/80out) → System | true | true — TreatA in path | delivered-flow-volume | System 100% |
| `diamond-treatment` | Intake(100) → {TreatA(60) → SysA, TreatB(40) → SysA} | false | false | intake-flow-volume | SysA 60%+40% = 100% accumulated across both paths |
| `ro-multi-system` | Intake → RO → {SysA(40), SysB(40), Discharge(20)} | false | true | delivered-flow-volume | SysA 40%, SysB 40% |
| `summing-node` | {IntakeA(60), IntakeB(40)} → Summing → System | true per intake | false | intake-flow-volume | System 100% of each intake's block cost (accumulated) |
| `adjusted-attribution` | Intake → System (adjusted=0.75 on intake) | — | — | override | System 75% of intake block cost |

---

## `applySystemDischargeCosts` — `water-discharge`

Walks upstream from each discharge node, stopping attribution at the first water-using system on each path. The system immediately upstream of the discharge bears the cost.

**Verified cases:**

| Test fixture | Configuration | Expected result |
|---|---|---|
| `simple-linear` | Intake → System → Discharge | System 100% of discharge block cost |
| `shared-discharge` | {SysA(60), SysB(40)} → Discharge | SysA 60%, SysB 40%, costs sum to discharge block cost |
| `reuse-chained-systems` | Intake → SysA → SysB → Discharge | SysB 100%; SysA receives zero discharge cost (not the closest system) |
| `adjusted-attribution-discharge` | SysA → Discharge (adjusted=0.60 on discharge) | SysA 60% of discharge block cost; computed default 1.0 preserved in attribution map |

---

## `applySystemTreatmentCosts` — `water-treatment`

Walks downstream from each treatment node, stopping attribution at the first water-using system on each path. Block cost uses the treatment node's inflow as the cost basis; the attribution fraction uses outflow when losses exist.

**Verified cases:**

| Test fixture | Configuration | Losses | Expected result |
|---|---|---|---|
| `treatment-with-loss` | Intake → Treatment(100in/80out) → System | yes | System 100% of treatment block cost (inflow basis); fraction = 80/80 = 1.0 after loss adjustment |
| `treatment-no-loss` | Intake → Treatment(100in/100out) → {SysA(60), SysB(40)} | no | SysA 60%, SysB 40%; costs sum to treatment block cost |
| `treatment-chain` | Intake → TreatA(100in/80out) → TreatB(80in/80out) → System | TreatA yes, TreatB no | System 100% of TreatA block cost + 100% of TreatB block cost (each node attributed independently) |
| `diamond-treatment` | Intake → {TreatA(60), TreatB(40)} → SysA | no (both paths) | SysA receives 100% of TreatA block cost + 100% of TreatB block cost; each treatment node is an independent cost component |
| `ro-multi-system` | Intake → RO → {SysA(40%), SysB(40%), Discharge(20%)} | yes | SysA 40%, SysB 40% |
| `adjusted-attribution-treatment` | Intake → Treatment → SysA (adjusted=0.80 on treatment) | no | SysA 80% of treatment block cost; computed default 1.0 preserved; intake unaffected |

---

## `applySystemWasteTreatmentCosts` — `waste-water-treatment`

Two sequential passes per WWT node.

- **Pass 1 (downstream/reuse):** walks downstream from the WWT node, stopping at the first water-using system that receives the recycled water. The system's fraction = its share of the WWT node's total outflow.
- **Pass 2 (upstream/discharge):** walks upstream from the WWT node, stopping at the first water-using system that sent water into it. Each system's flow responsibility = its upstream edge flow minus the total downstream charged portion already absorbed in Pass 1.

All Pass 1 iterations complete across all WWT nodes before any Pass 2 iteration begins.

**Verified cases:**

| Test fixture | Configuration | Pass 1 | Pass 2 | Known issue |
|---|---|---|---|---|
| `wwt-discharge-only` | System → WWT → Discharge | no downstream systems — no attribution | System 100% (all WWT cost to upstream discharger) | — |
| `wwt-reuse` | SysA → WWT → {SysB (60%), Discharge (40%)} | SysB 60% of WWT block cost | SysA 40% (remaining discharge fraction) | — |
| `wwt-two-upstream-with-reuse` ⚠ snapshot | {SysA(60), SysB(40)} → WWT → {SysC(60, reuse), Discharge(40)} | SysC 60% | SysA 0% (60−60=0 net); SysB **negative** (40−60=−20, BUG) | Pass 2 deducts the full downstream charged portion from each upstream system independently instead of prorating. Correct: SysA 24%, SysB 16%. |
---

## Adjusted Attribution (cross-cutting)

A pre-populated `SystemAttributionMap` entry with a non-null `adjusted` fraction overrides the algorithm's computed default for that system–component pair. The computed default is always recorded alongside the override for audit purposes.

| Test fixture | Override target | Adjusted fraction | Effect on other components |
|---|---|---|---|
| `adjusted-attribution` | intake | 0.75 | discharge unaffected (computed normally at 1.0) |
| `adjusted-attribution-discharge` | discharge | 0.60 | computed default 1.0 preserved in attribution map |
| `adjusted-attribution-treatment` | treatment | 0.80 | intake computed normally at 1.0 |

---

## Diagram Configuration Support

| Test fixture | Configuration | Behavior |
|---|---|---|
| `summing-node` | {IntakeA, IntakeB} → Summing Node → System | Summing node is a transparent pass-through. Each intake attributes 100% of its own block cost to the downstream system independently; costs accumulate additively. |
| `reuse-chained-systems` | Intake → SysA → SysB → Discharge | Intake attribution stops at SysA (first system downstream). Discharge attribution stops at SysB (first system upstream). Systems do not receive costs from components they did not directly interact with. |
| `diamond-treatment` | Intake → {TreatA, TreatB} → SysA | De-duplication is edge-based, not node-based. Both paths are distinct (different first edges), so each attributes independently to SysA. Fractions accumulate correctly to 1.0. |

---

## Mass-Balance Invariants

The following invariants are asserted directly in the test suite under the `mass-balance invariants` describe block and apply regardless of diagram configuration.

| Invariant | What the test checks |
|---|---|
| Intake sum equals block cost | Sum of all `trueCostOfSystems[id].intake` across all systems equals `costComponentsTotalsMap[intakeId].totalBlockCost` |
| No negative costs | Every system's `intake`, `discharge`, and `treatment` fields are ≥ 0 |
| Attribution fractions bounded | Every `totalAttribution.default` in `systemAttributionMap` is in the range [0, 1] (with 1e-9 float tolerance) |

---

## Pending Cases

| Test | Configuration | Blocker |
|---|---|---|
| `wwt-recycled-back-to-same-system` ⏳ | System A → WWT → System A (partial recycle) + Discharge | No cycle detection in `getAllDownstreamEdgePaths` / `getAllUpstreamEdgePaths` in `graph.ts`. Calling `getPlantSummaryResults` on this graph causes unbounded DFS recursion. Expected behavior once fixed: SysA receives the recycled fraction via Pass 1; Pass 2 skips SysA (already in `visitedSystemIds`), leaving the discharge fraction unattributed. |
