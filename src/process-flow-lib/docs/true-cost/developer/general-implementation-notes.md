**Date Generated:** June 8, 2026

# True Cost Attribution — Developer Implementation Notes

---

## Source File Map

| File | Role |
|---|---|
| `src/process-flow-lib/water/logic/results.ts` | Main algorithm entry point; all three steps live here |
| `src/process-flow-lib/water/logic/graph.ts` | Graph index construction and DFS traversal utilities |
| `src/process-flow-lib/types/results.ts` | Result type definitions (several are declared but unpopulated — see below) |
| `process-flow-diagram-component/src/__tests__/plant-summary.test.ts` | Integration test suite; `plant-summary-test-cases.md` is its human-readable companion |

---

## Why the Steps Must Run in This Exact Order

The algorithm runs three steps in sequence. The ordering is a hard dependency chain, not a style choice:

1. **Step 1 (block costs + path traces) must finish before Step 2** — each sub-routine needs the precomputed block cost dollar amount and the list of DFS paths. There is no lazy evaluation; Step 2 is a direct consumer of Step 1's output.

2. **Step 2's four sub-routines run in sequence, but their internal order doesn't matter for correctness** — intake, discharge, treatment, and WWT each write to separate fields on `trueCostOfSystems[systemId]`. The exception is WWT's own internal two-pass structure (see below).

3. **Step 3 must run after Step 2** — it reads the partially populated `trueCostOfSystems` entries produced by Step 2 and adds in-system treatment, heat energy, and motor energy on top.

---

## The Delivered-Flow-Volume Basis — When It Activates and Why

For intake cost attribution there are two possible denominators. The switch between them is controlled by two boolean flags that must *both* be true:

- `intakeHasSingleOutflow` — the intake has exactly one child node
- Treatment losses exist somewhere in the chain — either the immediate upstream treatment node (`deliveredFlowVolume < treatmentNodeInflow`) OR any earlier node in the path (`hasUpstreamTreatmentLoss`)

**Why both conditions are required:**

If the intake splits to multiple paths, each path's systems can only ever receive a fraction of the intake's total outflow. Using the treatment's outflow as the denominator would over-attribute on each branch. The delivered-flow-volume basis only makes sense when all intake flow passes through a single treatment chain.

If the treatment chain has no losses, the treatment outflow equals the intake outflow, so both denominators produce the same result. Using the intake-flow-volume basis in that case is simply the cheaper operation.

**The `hasUpstreamTreatmentLoss` flag is what makes chained treatment work correctly.**

Without it, consider this chain:

```
Intake (100) → Treatment A (100 in / 80 out) → Treatment B (80 in / 80 out) → Systems
```

When the path evaluation reaches the point of computing the intake attribution for systems downstream of Treatment B, the "immediate upstream treatment node" is Treatment B — which has no losses. Without the upstream loss flag, the algorithm would incorrectly use the intake-flow-volume basis (denominator = 100), leaving 20 units of cost unattributed. The flag causes it to use the delivered-flow-volume basis (denominator = Treatment B's outflow = 80), which distributes 100% of the intake cost.

---

## WWT Two-Pass: Pass 1 Must Complete Before Pass 2 Begins

This is the only strict intra-sub-routine ordering constraint. Pass 2 subtracts the flow volume already charged in Pass 1 from each upstream system's flow responsibility. If Pass 1 has not completed, the deduction map is empty and Pass 2 over-attributes.

In code: the internal `downstreamTreatmentAttributionMap` (tracking which systems were charged in Pass 1 and for how much flow) must be fully populated before the upstream walk begins.

---

## WWT Pass 2 Deduction Bug — Read Before Touching This Code

**Location:** `results.ts`, `applySystemWasteTreatmentCosts`, Pass 2 logic.

**Scenario:** A WWT unit has multiple upstream systems (A sends 60, B sends 40) and also has a downstream reuse path (60 units to System C).

**Current behavior:** The Pass 2 deduction subtracts the *full* downstream charged volume (60 units) from each upstream system's flow responsibility independently:

- System A: 60 − 60 = 0 → pays nothing
- System B: 40 − 60 = −20 → **negative result**, which is clamped or produces garbage

**Correct behavior:** The deduction should be prorated by each upstream system's share of the total WWT inflow:

- System A: 60 − (60/100 × 60) = 60 − 36 = 24 → pays for 24 units
- System B: 40 − (40/100 × 60) = 40 − 24 = 16 → pays for 16 units

This is a documented known bug. The test in `plant-summary.test.ts` case `wwt-two-upstream-with-reuse` uses a snapshot to lock in the current (wrong) output. **When you fix this, update the snapshot and verify the corrected values match the "Correct attribution" table in `plant-summary-test-cases.md §4.3`.**

---

## Motor Energy Overwrite in Step 3 — Intentional but Incomplete

**Location:** `results.ts`, Step 3 finalization loop.

During Step 2, pump/motor energy from intake and discharge nodes is attributed to systems alongside the intake/discharge costs and accumulated in `trueCostOfSystems[systemId].systemPumpAndMotorEnergy`.

Step 3 then **overwrites** this field with a fresh calculation from the system's own motor entries, discarding the Step 2 accumulation.

This is not a bug in the traditional sense — the decision was made because motor entries on intake/discharge nodes and motor entries on system nodes were tracked differently at the time this was written. But the result is that any pump energy modeled at the intake or discharge node is silently dropped from the final per-system total.

**Practical impact:** Facilities where significant pumping happens at the intake or discharge nodes will have that energy cost underreported in the per-system breakdown. The workaround documented for users is to enter intake/discharge pump data on the system node directly instead.

**If you fix this:** Step 3 should *add* the system's own motor energy calculation to whatever was accumulated from Step 2, not replace it. Make sure to add a test case — none currently cover the Step 2 accumulation pathway for motor energy.

---

## `setWaterUsingSystemFlows` — Do Not Trust, Do Not Extend

**Location:** `results.ts`, lines 134–207.

This function populates `systemFlowTotals` (source water, recirculated water, discharge water, known losses, water in product) for each water-using system. It was written to support assessment features that were never completed and has grown inconsistent: some paths use user-entered overrides, others use calculated edge values, and they can conflict.

**Critical:** The true cost dollar attribution (Steps 2 and 3) reads flow values directly from the diagram's calculated edge data, not from `systemFlowTotals`. The dollar amounts are not affected by this function's bugs.

**What is affected:** Water balance calculations and the water balance percentages shown in summary reports. If a system's water balance looks wrong in the UI, look here first.

The source comment on this function advises starting fresh rather than patching. If you are working on assessment features that need accurate system-level flow totals, plan a rewrite of this function rather than adding more conditional logic to it. Related issues: #7432 and #7433.

---

## Cycle Detection Is Missing in Graph Traversal

**Location:** `graph.ts`, `getAllDownstreamEdgePaths` and `getAllUpstreamEdgePaths`.

The DFS traversal functions have no cycle detection. A directed cycle in the diagram (e.g., a system whose effluent is recycled back to itself via a WWT unit) will cause infinite recursion and a stack overflow.

The test case `wwt-recycled-back-to-same-system` in `plant-summary-test-cases.md §8` is blocked entirely because of this. Any diagram configuration that closes a cycle will be unsafe until cycle detection is added to the traversal functions.

**When adding cycle detection:** the traversal needs to track visited edges (not just visited nodes), because a valid diagram can have two different paths passing through the same node without forming a cycle. A node-visited guard would incorrectly prune valid paths.

---

## De-duplication Guards — Edge-Based, Not Node-Based

The de-duplication that prevents a system from being double-charged when two paths from the same cost component converge on it works by recording the sequence of edges (flow connections) in the path, not just the destination system node. This means:

- Two paths that travel through different intermediate nodes to reach the same system are **both attributed** — the attributions accumulate on the system.
- Two paths that are genuinely identical (same edge sequence, same destination) are attributed only once.

The diamond treatment test case (`plant-summary-test-cases.md §2.4`) is specifically there to catch regressions where the de-duplication is accidentally too aggressive and suppresses a legitimately distinct second path.

---

## Test Coverage Notes

The `plant-summary.test.ts` suite uses a snapshot assertion for the known-broken case `wwt-two-upstream-with-reuse` System B cost. Snapshot tests in broken-behavior cases exist to make the fix visible — when you correct the bug, the snapshot will fail and you must update it intentionally. This is by design. Do not update snapshots without understanding what changed and verifying the new values are correct.

The mass-balance invariant suite (`plant-summary-test-cases.md §7`) runs cross-cutting assertions (costs sum to block cost, no negatives, fractions bounded 0–1) on top of the basic configurations. Run this suite after any change to attribution logic to catch conservation-of-cost violations.
