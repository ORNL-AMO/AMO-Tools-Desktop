**Date Generated:** June 17, 2026

# Apply System Treatment Costs

**Document Scope:** This document describes how Water Treatment costs are attributed to water-using systems. This is the third of four cost attribution sub-routines executed in Step 2 of the True Cost Attribution Algorithm. See *True Cost Algorithm Overview* for context.

---

## 1. Guiding Principle

**The system that receives the treated water bears the treatment cost.** Each treatment unit is evaluated independently as a discrete cost center. Its cost is allocated to the first downstream water-using systems in proportion to the volume of treated water each system receives from that unit.

---

## 2. Walk Direction and Stopping Rule

Starting at the treatment node, the algorithm follows water flow **downstream** until it encounters the first water-using system on each path.

**Stopping rule:** Stop at the first water-using system found on each downstream path. Intermediate treatment nodes (when treatment units are connected in series) are passed through; they will each be evaluated separately as their own cost centers.

```
Example — Single treatment unit feeding two systems:

  Treatment ──► System A (60 Mgal/yr)
           └──► System B (40 Mgal/yr)

  Result: Treatment cost split 60/40 between System A and System B.
```

```
Example — Series treatment:

  RO Unit ──► Chlorination ──► System C

  Result: RO Unit cost → 100% to System C
          Chlorination cost → 100% to System C
          (Each is an independent cost center; no duplication.)
```

---

## 3. Flow Fraction and Cost Calculation

### 3.1 Branch-Ratio Product Rule

A single rule computes the attribution fraction for every path shape — direct splits, unbranched chains where a later treatment node has its own loss, and treatment nodes that fork mid-chain into branches of different depth. It replaces the former no-losses / with-losses denominator switch (formerly Cases E and F), which read the flow value on the edge closest to the system rather than the edge the cost component itself sent down that branch — correct for a single hop, but wrong the moment a further treatment node sits between this cost component and the system (see §4 below).

**Step 1 — Determine the first edge's flow:**  
The flow value on the first edge leaving this treatment node for this path (not the edge closest to the system).

**Step 2 — Walk the remainder of the path and compute the branch fraction:**  
For every edge *after* the first one in the path, check whether that edge's source node is a water-treatment node. If so, compute that edge's **local branch ratio**:

    localRatio = edge flow / that treatment node's total outflow (to all of its children)

A treatment node with a single child and no losses always produces `localRatio = 1.0` — its full outflow goes down the one path that exists, so it is invisible to the calculation. A node that splits into multiple children divides its outflow among them, so each child's edge gets a `localRatio` less than 1.0. A node that loses volume (outflow < inflow) still produces `localRatio = 1.0` for its sole child — the loss is absorbed through the first edge's flow, not through this ratio.

Multiply every `localRatio` found after the first edge together to get the **branch fraction**:

    branchFraction = Π(localRatio for every further treatment-source edge in the path)

If no further treatment node appears in the path, or every further treatment node has a single lossless child, `branchFraction = 1.0`.

**Step 3 — Compute flow responsibility:**

    System flow responsibility = First edge's flow × branchFraction

**Step 4 — Compute attribution fraction:**

    Attribution fraction = System flow responsibility / This treatment node's total outflow

No cap is applied — the product of ratios in Step 2 cannot exceed 1.0 given valid flow data, so the attribution fraction is bounded automatically.

**Step 5 — Compute cost to system (cost basis is the full treatment block cost):**

    Cost to system = Attribution fraction × Treatment total block cost

The cost basis is the block cost computed on the full inflow (what drives the treatment operating cost); the downstream allocation denominator is this node's own total outflow. This correctly reflects that a system receiving 100% of this node's product bears 100% of its cost, even when the path to that system passes through a further treatment node with its own split or loss.

---

## 4. Treatment Chain and Mid-Chain Branch Support

Chained treatment configurations (Treatment A → Treatment B → System) and mid-chain branching configurations (a treatment node whose children reach systems at different depths — one immediately, another through a further treatment node) are both handled by the same branch-ratio product walk described in §3.1. There is no separate detection step for "is this a chain" or "did a later node lose volume" — every treatment-source edge after the first one contributes its `localRatio` to the product regardless of where it sits in the chain or whether it is the immediate upstream node of the system.

**This matters even without branching.** A treatment node with a *single*, lossy downstream treatment node in its path still needs the branch-ratio walk: reading only the last edge (the one closest to the system) would silently absorb that later node's loss into *this* node's attribution, undercounting its true cost. See §8c for the worked example that exposes this in its simplest, unbranched form.

**Example — Treatment A lossless, Treatment B lossy (linear chain, no branching):**

```
  Intake (100 Mgal) ──► Treatment A (100 in / 100 out) ──► Treatment B (100 in / 70 out) ──► System
```

- Treatment A's own cost component: first edge flow = 100 (Treatment A → Treatment B). Treatment B has a single child, so its `localRatio` = 70/70 = 1.0 — Treatment B's loss does not shrink this ratio.
- branchFraction = 1.0; System flow responsibility = 100 × 1.0 = 100; Treatment A's total outflow = 100 (no loss).
- Attribution fraction = 100/100 = **100%** — System bears all of Treatment A's cost, exactly as if Treatment B did not exist. Reading the last edge instead (70) would have produced 70%, silently dropping 30% of Treatment A's cost.

**Example — mid-chain branch to systems at different depths:** see §8d below. This is the configuration where the gap compounds with branching: the node immediately upstream of Boiler (UV Filtration) cannot see that it is itself just one branch of Chemical Treatment 2's earlier split.

---

## 5. Series Treatment (Multiple Treatment Units in Sequence)

Each treatment unit in a series creates its own independent block cost row and is attributed independently. For example, in a chain of Multimedia Filtration → RO → UV Disinfection → System D:

- Multimedia Filtration block cost is attributed 100% to System D (since all of its output reaches System D).
- RO block cost is attributed 100% to System D.
- UV Disinfection block cost is attributed 100% to System D.

No duplication occurs because each unit is its own cost center evaluated separately. The costs accumulate in System D's treatment cost total.

---

## 6. Adjusted Attribution (User Override)

A user may supply an override attribution fraction for a specific system–treatment unit pair. When an override is present:

1. The default computed fraction is still recorded for audit purposes.
2. The cost to the system is calculated using the override fraction:

       Cost to system = Adjusted fraction × Treatment total block cost

Adjusted attributions are collected during the path walk and applied as a batch after all paths are processed for that treatment node.

---

## 7. De-duplication of Paths

If a treatment unit feeds multiple downstream paths that converge on the same system, de-duplication prevents double-charging. The path segment from the treatment node to the system is recorded after each attribution. Subsequent paths that reach the same system via the same sequence of flow connections are skipped. Genuinely distinct paths (through different intermediate nodes) are attributed and the fractions accumulate.

---

## 8. Worked Example — Single System With Loss

**Scenario:** A softening unit experiences a 10% volume loss due to regeneration waste. It feeds one system.

```
  Softener (inflow: 50 Mgal/yr, outflow: 45 Mgal/yr, $3.00/kgal)
       │
       ▼ (45 Mgal/yr product)
  System E
```

**Block cost of softener:**  
50 Mgal/yr × 1,000 × $3.00/kgal = $150,000/yr

- First edge's flow (Softener → System E) = 45 Mgal/yr; no further treatment node, so branchFraction = 1.0.
- Softener's total outflow = 45 Mgal/yr.
- Attribution fraction = 45 / 45 = 1.00
- Cost to System E = 1.00 × $150,000 = **$150,000/yr**

System E bears 100% of the softener cost because it receives all of the product water. The cost basis is the full inflow (50 Mgal/yr) because that is what was actually treated. This single-hop case is unaffected by the branch-ratio rule in §3.1 — there is nothing after the first edge to multiply in.

---

## 8b. Worked Example — Branching with Treatment Losses

**Scenario:** An RO unit (30% recovery loss) feeds two systems directly.

```
  RO Unit (inflow: 100 Mgal/yr, product outflow: 70 Mgal/yr, $5.00/kgal)
       ├──► System F: receives 42 Mgal/yr
       └──► System G: receives 28 Mgal/yr
```

**Block cost of RO unit:**  
100 Mgal/yr × 1,000 × $5.00/kgal = $500,000/yr

**Path to System F:** first edge's flow = 42; no further treatment node; branchFraction = 1.0.
- Attribution fraction = 42 / 70 = 0.60
- Cost to System F = 0.60 × $500,000 = **$300,000/yr**

**Path to System G:** first edge's flow = 28; branchFraction = 1.0.
- Attribution fraction = 28 / 70 = 0.40
- Cost to System G = 0.40 × $500,000 = **$200,000/yr**

**Check:** $300,000 + $200,000 = $500,000 = Total RO block cost ✓. Both systems are one hop from the RO unit, so this case is also unaffected by the branch-ratio rule — it only changes results once a *further* treatment node sits between the cost component and the system.

---

## 8c. Worked Example — Downstream Loss in an Unbranched Chain

**Scenario:** Treatment A has no loss of its own, but the next treatment node in the chain (Treatment B) does. There is no branching anywhere in this diagram.

```
  Intake (100 Mgal/yr) ──► Treatment A (100 in / 100 out, $5.00/kgal) ──► Treatment B (100 in / 70 out, $4.00/kgal) ──► System
```

**Treatment A's own block cost:** 100 Mgal/yr × 1,000 × $5.00/kgal = $500,000/yr

- First edge's flow (Treatment A → Treatment B) = 100 Mgal/yr.
- Treatment B is the only further node in the path; it has a single child (System), so its `localRatio` = 70/70 = 1.0 — Treatment B's own loss does not shrink this ratio.
- branchFraction = 1.0; System flow responsibility = 100 × 1.0 = 100.
- Treatment A's total outflow = 100 Mgal/yr (no loss).
- Attribution fraction = 100 / 100 = **100%**
- Cost to System = 1.00 × $500,000 = **$500,000/yr**

**Treatment B's own block cost:** 100 Mgal/yr × 1,000 × $4.00/kgal = $400,000/yr. System is the sole downstream system on a single edge, so it bears 100% = **$400,000/yr**, unaffected by the branch-ratio rule.

**Total treatment cost to System:** $500,000 + $400,000 = **$900,000/yr**.

Reading only the edge closest to the system (70 Mgal/yr, Treatment B's post-loss outflow) instead of the edge Treatment A actually sent downstream (100 Mgal/yr) would have produced an attribution fraction of 70/100 = 70% for Treatment A — undercounting its cost by $150,000/yr even though nothing in this diagram branches. This is why the branch-ratio walk is needed for chained treatment, not only for forks.

---

## 8d. Worked Example — Mid-Chain Branch to Mixed-Depth Systems

**Scenario:** Chemical Treatment 2 forks into branches of different depth — Cooling Tower is one hop away, Boiler is two hops away through a second treatment node (UV Filtration). Both treatment nodes lose volume. This is the same diagram used for the intake-cost worked example in `apply-system-intake-costs.md` §8b, here evaluating Chemical Treatment 2's *own* treatment cost row instead of the intake's.

```
  Chemical Treatment 2 (inflow: 49.2 Mgal/yr, outflow: 37, loses 12.2, $2.00/kgal)
       │             │
      (25)          (12)
       │             │
       ▼             ▼
  Cooling Tower   UV Filtration (inflow: 12, outflow: 6, loses 6, $4.00/kgal)
                        │
                       (6)
                        ▼
                      Boiler
```

**Block cost of Chemical Treatment 2:** 49.2 Mgal/yr × 1,000 × $2.00/kgal = $98,400/yr

**Cooling Tower — path: [ChemTreat2 → CoolingTower (25)]:**
- First edge's flow = 25; no further treatment node; branchFraction = 1.0.
- Attribution fraction = 25 / 37 = 67.57%
- Cost to Cooling Tower = 0.6757 × $98,400 = **$66,486/yr**

**Boiler — path: [ChemTreat2 → UVFiltration (12), UVFiltration → Boiler (6)]:**
- First edge's flow = 12 (what Chemical Treatment 2 sent down this branch — not the 6 Mgal/yr that survives UV Filtration's own loss).
- UV Filtration is the only further node; it has a single child (Boiler), so its `localRatio` = 6/6 = 1.0 — its own loss does not shrink this ratio, same mechanism as §8c.
- branchFraction = 1.0; System flow responsibility = 12 × 1.0 = 12.
- Attribution fraction = 12 / 37 = 32.43%
- Cost to Boiler (from Chemical Treatment 2) = 0.3243 × $98,400 = **$31,914/yr**

**Check:** $66,486 + $31,914 = $98,400 = Chemical Treatment 2's own block cost ✓. Reading the last edge instead (6 Mgal/yr) would have produced a Boiler fraction of 6/37 = 16.22% (\$15,957) — undercounting Chemical Treatment 2's cost by $15,957/yr and leaving the two systems' fractions summing to only 83.79% instead of 100%.

**UV Filtration's own block cost:** 12 Mgal/yr × 1,000 × $4.00/kgal = $48,000/yr. Boiler is the sole downstream system on a single edge, so it bears 100% = **$48,000/yr**, unaffected by the fix. Boiler's total treatment cost across both rows is $31,914 + $48,000 = **$79,914/yr**.

---

## 9. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction | Downstream from treatment unit |
| Stopping point | First water-using system on each path |
| Cost basis | Full treatment block cost (unit cost × total treatment inflow) |
| Attribution denominator — branch-ratio product rule | First edge's flow × branchFraction, divided by this treatment node's own total outflow, where branchFraction is the product of every further treatment-source edge's `localRatio` (that edge's flow ÷ its own treatment node's total outflow) in the rest of the path. Covers direct splits, unbranched chains with a later loss, and mid-chain forks to systems at different depths with one formula. |
| Cap on fraction per path | None needed — the branch-ratio product cannot exceed 1.0 given valid flow data. |
| Series treatment | Each unit in series is an independent cost center; no duplication |
| Adjusted attribution | User-supplied fraction replaces computed default |
| De-duplication | Identical paths from treatment node to system are attributed only once |
