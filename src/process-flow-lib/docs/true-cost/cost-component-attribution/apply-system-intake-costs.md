**Date Generated:** June 17, 2026

# Apply System Intake Costs

**Document Scope:** This document describes how Water Intake costs are attributed to water-using systems. This is the first of four cost attribution sub-routines executed in Step 2 of the True Cost Attribution Algorithm. See *True Cost Algorithm Overview* for context.

---

## 1. Guiding Principle

**The system closest to the intake on each flow path bears the intake cost.** Systems that are further downstream — for example, a system that receives reused water from a first system which drew from this intake — are not charged for this intake. The rationale is that the downstream system is already paying for that water through the inter-system water transfer, not through a direct draw on the intake infrastructure.

---

## 2. Walk Direction and Stopping Rule

Starting at the intake node, the algorithm follows water flow **downstream** through any intermediate infrastructure (treatment units, piping) until it encounters the first water-using system on each path.

**Stopping rule:** Stop at the first water-using system found on each downstream path. Do not continue through that system to systems further downstream.

```
Example — Linear path:

  Intake ──► Treatment A ──► System 1 ──► System 2

  Result: System 1 is charged; System 2 is not.
```

```
Example — Branching path:

  Intake ──► Treatment A ──► System 1
                         └──► System 2

  Result: System 1 and System 2 are each charged their proportional share.
```

---

## 3. Flow Fraction and Cost Calculation

### 3.1 Branch-Ratio Product Rule

A single rule computes the attribution fraction for every path shape — direct intake splits, lossless treatment chains, lossy treatment chains, and treatment nodes that fork mid-chain into branches of different depth. It replaces the three-case denominator switch (formerly Cases A, B, and C) that this document described in earlier versions, which could not correctly attribute a treatment node that forks mid-chain into branches of different depth (see §8b below for the worked example that exposed the gap).

**Step 1 — Determine path inflow:**  
The flow value on the first edge leaving the intake node for this path.

**Step 2 — Walk the path and compute the branch fraction:**  
For every edge in the path from the intake to the system, check whether that edge's source node is a water-treatment node. If so, compute that edge's **local branch ratio**:

    localRatio = edge flow / treatment node's total outflow (to all of its children)

A treatment node with a single child and no losses always produces `localRatio = 1.0` — its full outflow goes down the one path that exists, so it is invisible to the calculation. A node that splits into multiple children divides its outflow among them, so each child's edge gets a `localRatio` less than 1.0. A node that loses volume (outflow < inflow) still produces `localRatio = 1.0` for its sole child — the loss is absorbed through `pathInflow`, not through this ratio (see Core Rule 3 below).

Multiply every `localRatio` found in the path together to get the **branch fraction**:

    branchFraction = Π(localRatio for every treatment-source edge in the path)

If no treatment node appears in the path, or every treatment node in the path has a single lossless child, `branchFraction = 1.0`.

**Step 3 — Compute flow responsibility:**

    System flow responsibility = Path inflow × branchFraction

**Step 4 — Compute attribution fraction:**

    Attribution fraction = System flow responsibility / Intake block cost total flow

No cap is applied — the product of ratios in Step 2 cannot exceed 1.0 given valid flow data, so the attribution fraction is bounded automatically. (A prior version of this formula applied `min(systemInflow / pathInflow, 1.0)` as an explicit safeguard; that cap is no longer necessary because the formula no longer reads `systemInflow` — the last edge's flow into the system — at all. It uses only `pathInflow` and the path-wide product of branch ratios.)

**Step 5 — Compute cost to system:**

    Cost to system = Attribution fraction × Intake total block cost

**Core Rule 3 (losses don't shrink attributed percentage):** When a treatment node loses volume, the downstream system on that branch is still responsible for the full pre-loss flow that entered the branch, not the smaller post-loss volume it actually received. The formula enforces this by never dividing by anything that shrinks when a node loses water with a single child — `pathInflow` is fixed at the intake edge, and a single-child node's `localRatio` is always 1.0 regardless of how much volume it lost. If that same lossy node also splits into multiple children, each child's branch absorbs its own proportional share of the total (pre-loss) contribution — see the mid-chain-branching worked example in §8b.

---

## 4. Treatment Chain and Mid-Chain Branch Support

Chained treatment configurations (Treatment A → Treatment B → System) and mid-chain branching configurations (a treatment node whose children reach systems at different depths — one immediately, another through a further treatment node) are both handled by the same branch-ratio product walk described in §3.1. There is no separate detection step for "is this a chain" or "did an earlier node lose volume" — every treatment-source edge in the path contributes its `localRatio` to the product regardless of where it sits in the chain or whether it is the immediate upstream node.

**Example — Treatment A with losses, Treatment B balanced (linear chain):**

```
  Intake (10 Mgal) ──► Treatment A (10 in / 8 out) ──► Treatment B (8 in / 8 out)
                                                              ├──► System C: 5 Mgal
                                                              └──► System D: 3 Mgal
```

- Treatment A has a single child (Treatment B), so its `localRatio` = 8/8 = 1.0 (the loss is absorbed through `pathInflow`, not this ratio).
- Treatment B splits: System C's `localRatio` = 5/8 = 0.625; System D's `localRatio` = 3/8 = 0.375.
- System C attribution fraction = 10 × (1.0 × 0.625) / 10 = 62.5%
- System D attribution fraction = 10 × (1.0 × 0.375) / 10 = 37.5%
- Total: 100% of intake cost distributed ✓

**Example — mid-chain branch to systems at different depths:** see §8b below. This is the configuration a per-immediate-node-only formula gets wrong (a double-count), because the node right next to the system cannot see that it was itself just one branch of an earlier split.

---

## 5. Pump and Motor Energy Attribution

Pump and motor energy costs associated with the intake node (e.g., intake pumps) are attributed to systems using the same attribution fraction calculated above.

    Energy cost to system = Attribution fraction × Intake node pump/motor energy cost

This ensures that the pumping cost is distributed to systems in exact proportion to their water draw from that intake.

---

## 6. Adjusted Attribution (User Override)

A user may supply an override attribution fraction for a specific system–intake pair. When an override is present:

1. The default computed fraction is still recorded for audit purposes.
2. The cost to the system is calculated using the override fraction instead of the computed fraction:

       Cost to system = Adjusted fraction × Intake total block cost

3. Pump and motor energy attribution is also applied using the adjusted fraction.

Adjusted attributions are collected during the path walk and applied as a batch after all paths are processed for that intake node.

---

## 7. De-duplication of Paths

A system may appear on multiple downstream paths from the same intake (for example, if two treatment trains both lead to the same system). To prevent double-charging:

- The algorithm records every path segment (from the intake to the system) that has already been attributed.
- If a subsequent path reaches the same system via an identical sequence of flow connections, that path is skipped.
- If the path is genuinely different (different intermediate nodes), the attribution proceeds and the fractions accumulate.

---

## 8. Worked Example

**Scenario:** A facility has one intake serving two systems through a shared treatment unit.

```
  Intake (100 Mgal/yr, $2.50/kgal)
       │
       ▼
  Chlorination Treatment (no losses)
       ├──► System A: receives 60 Mgal/yr
       └──► System B: receives 40 Mgal/yr
```

**Block cost of intake:**  
100 Mgal/yr × 1,000 × $2.50/kgal = $250,000/yr

**Path 1 — Intake → Treatment → System A:**
- Path inflow = 100 Mgal/yr (first edge from intake)
- Treatment's total outflow = 100 Mgal/yr; edge into System A = 60 Mgal/yr, so `localRatio` = 60/100 = 0.60
- branchFraction = 0.60
- System flow responsibility = 100 × 0.60 = 60 Mgal/yr
- Attribution fraction = 60 / 100 = 0.60
- Cost to System A = 0.60 × $250,000 = **$150,000/yr**

**Path 2 — Intake → Treatment → System B:**
- Path inflow = 100 Mgal/yr
- Edge into System B = 40 Mgal/yr, so `localRatio` = 40/100 = 0.40
- branchFraction = 0.40
- Attribution fraction = 40 / 100 = 0.40
- Cost to System B = 0.40 × $250,000 = **$100,000/yr**

**Check:** $150,000 + $100,000 = $250,000 = Total intake block cost ✓

---

## 8b. Worked Example — Mid-Chain Branch to Mixed-Depth Systems

**Scenario:** An intake splits to multiple paths; one of those paths runs through a treatment node (Chemical Treatment 2) that itself forks into branches of different depth — Cooling Tower is one hop away, Boiler is two hops away through a second treatment node (UV Filtration). Both treatment nodes lose volume.

```
  City Water (177.2 Mgal/yr total; 49.2 down this path, $1,000/Mgal)
       │
       ▼
  Chemical Treatment 2      ← receives 49.2, outputs 37 (loses 12.2)
       │             │
      (25)          (12)
       │             │
       ▼             ▼
  Cooling Tower   UV Filtration   ← receives 12, outputs 6 (loses 6)
                        │
                       (6)
                        ▼
                      Boiler
```

**Block cost of intake:** 177.2 Mgal/yr × $1,000/Mgal = $177,200/yr

**Cooling Tower — path: [intake→ChemTreat2 (49.2), ChemTreat2→CoolingTower (25)]:**
- Path inflow = 49.2 Mgal/yr
- ChemTreat2 total outflow = 37; `localRatio` = 25/37 = 0.6757
- branchFraction = 0.6757
- System flow responsibility = 49.2 × 0.6757 = 33.24 Mgal/yr
- Attribution fraction = 33.24 / 177.2 = 18.76%
- Cost to Cooling Tower = 0.1876 × $177,200 = **$33,243/yr**

**Boiler — path: [intake→ChemTreat2 (49.2), ChemTreat2→UVFiltration (12), UVFiltration→Boiler (6)]:**
- Path inflow = 49.2 Mgal/yr
- At ChemTreat2: `localRatio` = 12/37 = 0.3243
- At UV Filtration: total outflow = 6 (its only child); `localRatio` = 6/6 = 1.0 — UV Filtration's own loss (12 in, 6 out) does not shrink this ratio, because it has a single child; the loss is absorbed through `pathInflow`, same as §4's linear-chain example
- branchFraction = 0.3243 × 1.0 = 0.3243
- System flow responsibility = 49.2 × 0.3243 = 15.96 Mgal/yr
- Attribution fraction = 15.96 / 177.2 = 9.00%
- Cost to Boiler = 0.0900 × $177,200 = **$15,957/yr**

**Check:** $33,243 + $15,957 = $49,200/yr, exactly this path's true share of the intake block cost (49.2/177.2 × $177,200 = $49,200) — confirming no double-count. A formula that only looked at the treatment node immediately upstream of each system (the pre-existing behavior this replaced) attributed Cooling Tower and Boiler 46.53% combined against a true path share of 27.77%.

---

## 9. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction | Downstream from intake |
| Stopping point | First water-using system on each path |
| Cost basis | Full intake block cost (unit cost × total intake outflow) |
| Attribution denominator — branch-ratio product rule | Path inflow × branchFraction, where branchFraction is the product of every treatment-source edge's `localRatio` (that edge's flow ÷ its source treatment node's total outflow) across the whole path. Covers direct intake splits, lossless chains, lossy chains, and mid-chain forks to systems at different depths with one formula. |
| Cap on fraction per path | None needed — the branch-ratio product cannot exceed 1.0 given valid flow data. |
| Pump/motor energy | Attributed using same fraction as intake cost |
| Adjusted attribution | User-supplied fraction replaces computed default |
| De-duplication | Identical paths from intake to system are attributed only once |
