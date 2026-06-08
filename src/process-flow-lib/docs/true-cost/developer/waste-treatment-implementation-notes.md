**Date Generated:** June 8, 2026

# True Cost Attribution — Waste Treatment Developer Notes

---

## Why There Are Two Separate `forEach` Loops, Not One

`applySystemWasteTreatmentCosts` contains two `Object.entries(wasteTreatmentCostData).forEach(...)` calls — the first for Pass 1 (downstream/reuse), the second for Pass 2 (upstream/discharge). This is not a refactor artifact. The separation is a correctness requirement.

The `downstreamTreatmentAttributionMap` is declared *outside* both loops and is shared across all WWT units. Pass 1 populates it; Pass 2 reads it to subtract already-charged flow from each upstream system's flow responsibility.

If both passes ran in one loop (i.e., Pass 1 then Pass 2 for WWT unit A, then Pass 1 then Pass 2 for WWT unit B), the following chained scenario would break:

```
System A ──► WWT-1 ──► (reuse) ──► System B ──► WWT-2 ──► Discharge
```

WWT-2's Pass 2 walks upstream and reaches System B. The deduction should account for whatever WWT-2's Pass 1 already charged System B for receiving the WWT-1 reuse water. If WWT-1's full two-pass cycle ran before WWT-2's Pass 1, that deduction data exists. If WWT-2's Pass 1 ran before WWT-1's Pass 1, it does not.

Running all of Pass 1 across every WWT unit first guarantees the deduction map is fully populated before any Pass 2 begins.

---

## `visitedSystemIds` Pre-population in Pass 2 — Why Pass 1 Recipients Are Excluded

At the start of Pass 2 for each WWT unit:

```ts
let visitedSystemIds: string[] = downstreamTreatmentAttributionMap[treatmentId]?.map(item => item.systemId) || [];
```

This pre-populates `visitedSystemIds` with every system that was charged in Pass 1. The effect: if a system received recycled water from this WWT unit (and was already charged for it in Pass 1), Pass 2's upstream walk will skip that system if it encounters it again.

**Why this matters in practice:** Consider a closed-loop where System A sends effluent to WWT, which recycles back to System A. Without this guard, Pass 2 would charge System A again as an upstream discharger — which would be double-attribution on top of the Pass 1 reuse charge. The pre-population prevents this.

This guard does NOT extend across different WWT units. If System A sends to WWT-1 (which charges it in Pass 2) and also sends to WWT-2 (which charges it in Pass 2), both charges are correct and intentional — System A is responsible for its share of each unit's costs independently.

---

## `applyROSystemWasteTreatmentCosts` — Why It Is a Separate Function

RO reject-path WWT attribution is handled by a dedicated function separate from `applySystemWasteTreatmentCosts`. `applySystemWasteTreatmentCosts` stops strictly at `water-using-system` nodes and ignores RO nodes entirely. `applyROSystemWasteTreatmentCosts` handles all RO reject-path WWT attribution via a direct lookup of `graph.systemsWithRODirectDischarge`, assigning fraction `1.0` to the `roSystemOwner` in one operation per qualifying configuration.

The idempotency guard prevents double-attribution when both routines would otherwise write to the same `(roSystemOwner, wasteTreatmentId)` pair (Configuration B, where `applySystemWasteTreatmentCosts` Pass 2 already wrote an entry before `applyROSystemWasteTreatmentCosts` runs):

```ts
if (systemAttributionMap[roSystemOwner.id]?.[wasteTreatmentId] !== undefined) return;
```

**`applyROSystemWasteTreatmentCosts` must run after `applySystemWasteTreatmentCosts`** — the idempotency guard reads entries that Pass 1/Pass 2 may have already written.

---

## The Flat Deduction Bug — Geometry of the Error

The Pass 2 deduction subtracts the *full* downstream-charged flow volume from *each* upstream system's flow responsibility independently:

```ts
const totalDownstreamChargedPortion = downstreamTreatmentAttributionMap[treatmentId]
  .reduce((total, item) => total + item.chargedPortion, 0);
systemFlowResponsibility = systemFlowResponsibility - totalDownstreamChargedPortion;
```

With a single upstream system, this is correct: the one upstream system bears whatever flow the WWT received minus whatever was reused downstream.

With multiple upstream systems, this subtracts the *same* total downstream volume from each system's individual responsibility. If System A sends 60 units and System B sends 40 units, and 60 units were recycled downstream, the deduction reduces System A's responsibility to 0 and System B's to −20. A negative result either clamps or produces garbage.

The correct deduction is proportional: each upstream system should have its flow responsibility reduced by `totalDownstreamChargedPortion × (its contribution / total WWT inflow)`.

The test case `wwt-two-upstream-with-reuse` in `plant-summary-test-cases.md §4.3` uses a snapshot for System B's cost precisely because this bug produces a deterministic wrong number. When you fix the deduction, update the snapshot and verify the corrected values match the "Correct attribution" table in `§4.3`.

---

## Block Cost Uses Inflow, Not Outflow — And Why That Matters for Fractions

WWT uses `getInflowBlockCosts`:

```ts
const blockCosts = getInflowBlockCosts(node, calculatedData, settings.unitsOfMeasure);
```

This sets `blockCosts.totalFlow` to the WWT node's total inflow volume. All attribution fractions in both passes divide by this same denominator. This is intentional — the economic model charges per unit of wastewater treated (entering the WWT), not per unit exiting.

One consequence: if the WWT node has internal losses (inflow > outflow), the Pass 1 downstream systems' fractions sum to less than 1.0, and the remaining fraction is picked up by Pass 2 upstream dischargers. The total across both passes still equals 1.0. This is correct behavior.

A second consequence: Pass 2 computes `systemFlowResponsibility` using the upstream path's edge flow values *before* deducting the downstream charged portion. After subtracting, it divides by `totalFlow` (the full inflow). Do not change the denominator to the remaining-after-deduction volume — the block cost is for the full inflow, and the fraction must be expressed against that same total to produce a correct dollar amount.

---

## `fractionPathInflowReceived` Cap — The "Other Intakes" Skip

Both passes contain this guard:

```ts
const fractionPathInflowReceived = (systemInflow / pathInflow) > 1 ? 1 : (systemInflow / pathInflow);
```

The cap handles cases where a system receives more water than the path edge alone carries — because the system also has other upstream sources. The comment reads "we will observe other intakes on another iteration."

In practice, this means the algorithm will attribute the path's full flow to the system (capping at 1.0) and expect that the system's other inflow sources will produce additional attribution fractions from their own path iterations. This can over-attribute if the path inflow already accounts for the combined flow, but it avoids under-attribution in the common case where each path is truly independent.

Do not remove this cap. Without it, a misconfigured diagram where edge flow values sum incorrectly could produce a fraction greater than 1.0, leading to costs above the block cost total for that system.

---

## `adjustedAttributions` Deferred Write — Why Cost Is Not Set Inside the Path Loop

After `setSystemAttribution` runs, the code checks:

```ts
const hasAdjustedAttribution = systemAttributionMap[currentNode.id][treatmentId].totalAttribution.adjusted !== undefined;
```

If `adjusted` is defined, the immediate cost write (`trueCostOfSystems[...].wasteTreatment += ...`) is skipped. Instead, the system is queued in `adjustedAttributions` and costs are written in a separate `Object.entries(adjustedAttributions).forEach(...)` pass *after* all paths for this WWT unit have been iterated.

**Why:** When a user has manually overridden an attribution fraction in the editable table (`true-cost-editable-table.component.ts`), `totalAttribution.adjusted` is set to their fraction. The override is for the *total* attribution to this component, not for any single path. Writing the cost inside the path loop would apply the user's fraction once per path traversal — over-charging on a multi-path system. The deferred write applies it exactly once after all paths for this WWT unit are resolved.

**Side effect:** If a system's `adjusted` value exists from a prior calculation and the user has not cleared it, the default path-by-path cost is completely suppressed. Ensure that when users revert to default attribution (via `revertToDefaultAttribution` in the editable table), the `adjusted` field is deleted (not set to `undefined`). Deletion is the signal that puts the code back on the default path.

---

## Chained WWT Units Pass Through Silently in Pass 1

In Pass 1's downstream walk, the stopping condition is:

```ts
if (currentNode.data.processComponentType === 'water-using-system') { ... break; }
```

If a downstream path from WWT-1 passes through another WWT unit (WWT-2) before reaching a water-using system, the algorithm traverses WWT-2 without stopping or attributing. WWT-2 is not a `water-using-system`, so it is silently skipped.

This is the "series note" from the algorithm comment: each unit handles its own output flows independently. WWT-1's Pass 1 charges whatever system is downstream of the full chain. WWT-2's Pass 1 then separately charges its own downstream systems.

**Gotcha:** If the chain is `System A → WWT-1 → WWT-2 → System B`, WWT-1's Pass 1 will find System B (the first water-using system it reaches). WWT-2's Pass 1 will also find System B. System B ends up charged by both WWT units for the reuse-path flow. It is not a bug in the iteration logic but a limitation of treating each unit independently.

---

## `path[0]` Always Refers to the WWT Node's Direct Edge

In both passes, `const treatmentEdge = graph.edgeMap[path[0]]` extracts the first edge of the path. Because `downstreamPathsByEdgeId` and `upstreamPathsByEdgeId` are built by `getAllDownstreamEdgePaths` / `getAllUpstreamEdgePaths` starting at the WWT node, `path[0]` is always the edge directly connected to the WWT node itself.

In Pass 1: `path[0]` is a WWT output edge. Its `flowValue` is the volume this specific downstream path carries out of the WWT — the denominator for the path's fraction share within the downstream allocation.

In Pass 2: `path[0]` is a WWT input edge (in reverse — it's the edge whose `target` is the WWT node). Its `flowValue` is the volume this specific upstream path contributes into the WWT.

If you add any processing that references edges by position in a path, do not assume `path[0]` is the WWT edge — confirm this by checking whether `getAllDownstreamEdgePaths` and `getAllUpstreamEdgePaths` always start their path arrays at the root node's outgoing or incoming edge respectively.

---

## RO Reject-Path WWT Is Not Handled Inside Pass 2

Pass 2 stops strictly at `water-using-system` nodes and does not detect or handle the RO case inline. All RO reject-path WWT attribution is done by `applyROSystemWasteTreatmentCosts` (see above). Do not introduce inline RO handling inside `applySystemWasteTreatmentCosts` Pass 2 — doing so would cause the upstream walk to continue past the RO node, bypass the `visitedSystemIds` break, and revisit upstream edges, attributing the same WWT cost to the RO system owner once per upstream edge.

---

## Test Coverage Reference for WWT

| Test Case | Location | What It Guards |
|---|---|---|
| `wwt-discharge-only` | `plant-summary-test-cases.md §4.1` | Pass 1 finds nothing, Pass 2 charges 100% to single upstream system |
| `wwt-reuse` | `plant-summary-test-cases.md §4.2` | Pass 1 + Pass 2 together sum to 100% block cost |
| `wwt-two-upstream-with-reuse` ⚠ | `plant-summary-test-cases.md §4.3` | Flat deduction bug; snapshot test locks in broken output |
| `ro-single-system-wwt` | `plant-summary-test-cases.md §3.3` | RO reject WWT (Configuration A): `applyROSystemWasteTreatmentCosts` assigns 100% to System A; expects $90,000 |
| `ro-system-downstream-wwt` | `plant-summary-test-cases.md §3.4` | RO reject WWT (Configuration B): product system's effluent goes to WWT; `applyROSystemWasteTreatmentCosts` overrides Pass 2's flow-fraction with 100%; expects $5,000 |
| `wwt-recycled-back-to-same-system` *(pending)* | `plant-summary-test-cases.md §8` | Blocked by missing cycle detection in graph traversal |

One snapshot test (⚠) remains. When you fix the flat deduction bug, the snapshot will fail — update it intentionally after verifying the new values match the "Correct attribution" table in `§4.3`.
