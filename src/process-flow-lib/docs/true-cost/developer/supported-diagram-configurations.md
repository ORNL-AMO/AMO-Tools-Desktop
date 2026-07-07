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

A single formula computes every path's attribution fraction — there is no case split on intake shape or treatment losses. Walk every edge in the path from intake to system; for each edge whose source is a water-treatment node, compute `localRatio = edge flow / treatment node's total outflow`. The product of every `localRatio` found in the path (`branchFraction`) multiplied by the path's inflow gives the system's flow responsibility:

    Attribution fraction = (Path inflow × branchFraction) / intakeData.blockCosts.totalFlow

A treatment node with a single lossless child contributes `localRatio = 1.0`, so a direct intake split or a lossless chain reduces to the same result the intake-flow-volume basis produced under the older two-denominator switch. A treatment node with losses still contributes `localRatio = 1.0` to its sole child (the loss is absorbed through path inflow, not this ratio); a treatment node that splits divides its outflow among its children by their share. This one formula replaced the former `deliveredFlowVolume` / `intakeHasSingleOutflow` / `hasUpstreamTreatmentLoss` two-denominator switch, which could not correctly attribute a treatment node that forks mid-chain into branches of different depth (see the `mid-chain-branching` fixture below).

**Verified cases (test fixture → behavior):**

| Test fixture | Configuration | Treatment nodes in path | Expected result |
|---|---|---|---|
| `simple-linear` | Intake → System → Discharge | none | System 100% |
| `shared-intake` | Intake → {SystemA (60), SystemB (40)} | none | SystemA 60%, SystemB 40% |
| `treatment-with-loss` | Intake(100) → Treatment(100in/80out) → System | Treatment (single child, lossy) | System 100% (`localRatio` = 80/80 = 1.0) |
| `treatment-no-loss` | Intake(100) → Treatment(100in/100out) → {SystemA(60), SystemB(40)} | Treatment (splits, lossless) | SystemA 60%, SystemB 40% |
| `treatment-chain` | Intake(100) → TreatA(100in/80out) → TreatB(80in/80out) → System | TreatA (single child, lossy), TreatB (single child, lossless) | System 100% (both `localRatio` = 1.0) |
| `diamond-treatment` | Intake(100) → {TreatA(60) → SysA, TreatB(40) → SysA} | TreatA, TreatB (each single child) | SysA 60%+40% = 100% accumulated across both paths |
| `split-path-treatment-loss` | Intake(100) → {Treatment(60in/30out) → SysA, SysB(40) direct} | Treatment (single child, lossy) on SysA's path only | SysA 60% (pre-loss path inflow, not the post-loss 30), SysB 40% |
| `mid-chain-branching` | CityWater(177.2 total; 49.2 down this path) → ChemTreat2(37 out) → {CoolingTower(25), UVFiltration(12in/6out) → Boiler} | ChemTreat2 (splits, lossy), UVFiltration (single child, lossy) on Boiler's path | CoolingTower 18.76%, Boiler 9.00% — sum 27.76% matches the true path share; the pre-existing per-immediate-node-only formula summed these to 46.53% (a double-count) |
| `treatment-based-merge-node` | {IntakeA(60), IntakeB(40)} → Treatment(100in/100out) → System | Treatment (single child, lossless), fed by two intakes | System 100% of each intake's own block cost (accumulated) — analogous to `summing-node` but through a water-treatment node instead of a transparent summing node |
| `ro-single-system` | Intake → RO(treatmentType=6) → {SysA, Discharge(reject)} | RO (single-system override) | SysA 100% (fraction forced to 1.0) |
| `ro-multi-system` | Intake → RO → {SysA(40), SysB(40), Discharge(20)} | RO (splits, no override — 3 children) | SysA 40%, SysB 40% |
| `summing-node` | {IntakeA(60), IntakeB(40)} → Summing → System | none (summing node is not a water-treatment type) | System 100% of each intake's block cost (accumulated) |
| `adjusted-attribution` | Intake → System (adjusted=0.75 on intake) | — | System 75% of intake block cost |

---

## `applySystemDischargeCosts` — `water-discharge`

Walks upstream from each discharge node, stopping attribution at the first water-using system on each path. The system immediately upstream of the discharge bears the cost.

**Verified cases:**

| Test fixture | Configuration | Expected result |
|---|---|---|
| `simple-linear` | Intake → System → Discharge | System 100% of discharge block cost |
| `shared-discharge` | {SysA(60), SysB(40)} → Discharge | SysA 60%, SysB 40%, costs sum to discharge block cost |
| `reuse-chained-systems` | Intake → SysA → SysB → Discharge | SysB 100%; SysA receives zero discharge cost (not the closest system) |
| `ro-single-system` | SysA → Discharge1 (product path); Discharge2 (reject, cost=0) | SysA 100% of Discharge1 via RO override; Discharge2 cost is zero (no upstream system on reject path) |
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
| `ro-single-system` | Intake → RO(treatmentType=6) → {SysA, Discharge} | — | SysA 100% via RO single-system override |
| `ro-multi-system` | Intake → RO → {SysA(40%), SysB(40%), Discharge(20%)} | — | SysA 40%, SysB 40% (no RO override — 3 children) |
| `ro-single-system-wwt` | Intake → RO → {SysA, WWT → Discharge} | — | SysA 100% of RO block cost via RO override |
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
| `ro-single-system-wwt` ⚠ snapshot | Intake → RO → {SysA, WWT(reject) → Discharge} | no downstream reuse systems | SysA 100% via RO reject WWT special case — but attributed once per upstream edge, causing double-attribution | RO reject WWT double-attribution bug. |

---

## RO Single-System Override (cross-cutting)

`assignsystemsWithRODirectDischarge` identifies single-system RO configurations in preprocessing. When triggered, all four attribution sub-routines force the fraction to 1.0 for the registered system across all associated cost components (intake, RO treatment node, product-path discharge, and if present, the reject-path WWT node).

**Qualification criteria tested:**

| Criterion | Verified by fixture |
|---|---|
| `treatmentType === 6` (Reverse Osmosis) | `ro-single-system`, `ro-single-system-wwt` |
| Exactly 2 downstream branches | `ro-single-system` (product + reject) |
| Product path leads to exactly 1 system then 1 discharge | `ro-single-system`, `ro-single-system-wwt` |
| Reject path leads to exactly 1 discharge, no systems | `ro-single-system` |
| WWT on reject path is recorded and overridden | `ro-single-system-wwt` |
| 3+ children → override does NOT apply | `ro-multi-system` |

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
| `treatment-based-merge-node` | {IntakeA, IntakeB} → Treatment → System | Same merge pattern as `summing-node`, but through a `water-treatment` node instead of a transparent `summing-node` type — exercises the branch-ratio `localRatio` calculation for each intake's path independently rather than skipping it. Each intake still attributes 100% of its own block cost. |
| `reuse-chained-systems` | Intake → SysA → SysB → Discharge | Intake attribution stops at SysA (first system downstream). Discharge attribution stops at SysB (first system upstream). Systems do not receive costs from components they did not directly interact with. |
| `diamond-treatment` | Intake → {TreatA, TreatB} → SysA | De-duplication is edge-based, not node-based. Both paths are distinct (different first edges), so each attributes independently to SysA. Fractions accumulate correctly to 1.0. |
| `mid-chain-branching` | CityWater → ChemTreat2 → {CoolingTower, UVFiltration → Boiler} | ChemTreat2 forks into branches of different depth, and both ChemTreat2 and UVFiltration lose volume. The branch-ratio product walk attributes CoolingTower and Boiler correctly regardless of depth; a formula limited to the treatment node immediately upstream of each system double-counts this configuration. |

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
