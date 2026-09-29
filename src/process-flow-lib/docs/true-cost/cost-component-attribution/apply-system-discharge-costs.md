**Date Generated:** June 17, 2026

# Apply System Discharge Costs

**Document Scope:** This document describes how Water Discharge costs are attributed to water-using systems. This is the second of four cost attribution sub-routines executed in Step 2 of the True Cost Attribution Algorithm. See *True Cost Algorithm Overview* for context.

---

## 1. Guiding Principle

**The system immediately upstream of the discharge — the final user that causes the discharge — bears the discharge cost.** Systems that are further upstream and whose water was reused by an intermediate system before reaching the discharge are not charged. The rationale is that an upstream system's water has already been accounted for through the inter-system water transfer; the system that ultimately sends water to the discharge point is the one incurring the discharge cost.

---

## 2. Walk Direction and Stopping Rule

Starting at the discharge node, the algorithm traces water flow **upstream** through any intermediate infrastructure until it encounters the first water-using system on each path.

**Stopping rule:** Stop at the first water-using system found on each upstream path. Do not continue further upstream to systems that previously held the water.

```
Example — Linear path:

  System 1 ──► System 2 ──► Discharge

  Result: System 2 is charged (it is the immediate upstream system);
          System 1 is not charged for this discharge.
```

```
Example — Branching path (two systems discharging to one outlet):

  System A ──►
               Discharge
  System B ──►

  Result: System A and System B are each charged their proportional share.
```

---

## 3. Flow Fraction and Cost Calculation

### 3.1 Branch-Ratio Product Rule

The discharge cost allocation mirrors the intake cost allocation method's branch-ratio product
rule (see *Apply System Intake Costs* §3.1), but applied in the upstream direction and keyed to
each waste-water-treatment merge node's total **inflow** instead of a water-treatment node's total
outflow.

**Step 1 — Determine the discharge-adjacent flow:**  
The flow value on the first edge leaving the discharge node in the upstream direction (i.e., the
edge entering the discharge). This is the actual volume that reaches the discharge along this
path.

**Step 2 — Walk the path and compute the branch fraction:**  
For every edge in the path from the discharge to the system (excluding the discharge-adjacent
edge itself), check whether that edge's *target* is a waste-water-treatment node. If so, compute
that edge's **local branch ratio**:

    localRatio = edge flow / waste-water-treatment node's total inflow (from all of its contributors)

A waste-water-treatment node with a single upstream contributor always produces `localRatio =
1.0` — its full inflow comes down the one path that exists, so it is invisible to the
calculation, whether or not that node loses volume. A node that merges more than one upstream
contributor divides its total inflow among them, so each contributor's edge gets a `localRatio`
less than 1.0 — this is what correctly apportions volume lost at a shared merge point across the
systems that fed it, instead of crediting each one independently for the full downstream flow.

Multiply every `localRatio` found in the path together to get the **branch fraction**:

    branchFraction = Π(localRatio for every waste-water-treatment-target edge in the path)

If no waste-water-treatment node appears in the path (a direct system → discharge edge), or every
waste-water-treatment node in the path has a single contributor, `branchFraction = 1.0`.

**Step 3 — Compute system flow responsibility:**

    System flow responsibility = Discharge-adjacent flow × branchFraction

**Step 4 — Compute attribution fraction:**

    Attribution fraction = System flow responsibility / Discharge block cost attributable flow

`Attributable flow` is the discharge's total inflow minus any unaccounted flow the discharge
reports (see Core Rule 4 below) — it is not the same value used for the discharge's block cost,
which stays based on the full inflow.

No cap is applied — the product of ratios in Step 2 cannot exceed 1.0 given valid flow data, so
the attribution fraction is bounded automatically. (A prior version of this formula applied
`min(systemEdgeFlow / dischargeAdjacentFlow, 1.0)` — comparing only the two endpoint edges — as an
explicit safeguard; that formula never inspected any edge *between* the two endpoints, so it was
blind to loss or merging at any waste-water-treatment node along the way. It over-attributed
whenever more than one system converged through a shared, lossy waste-water-treatment node before
reaching the discharge — see Core Rule 3 and the worked example in §7c.)

**Step 5 — Compute cost to system:**

    Cost to system = Attribution fraction × Discharge total block cost

**Core Rule 3 (merge-node losses don't cause over-attribution):** When more than one system's
flow converges through a shared waste-water-treatment node that loses volume, each contributing
system is responsible only for its proportional share of the merge node's total inflow — not its
own full raw outflow independently compared against the (smaller) post-loss volume reaching the
discharge. The branch-ratio product rule enforces this because each merge node's `localRatio` is
keyed to that node's total inflow across *all* its contributors, so the contributors' shares
always sum to the node's actual downstream volume rather than double- or over-counting it. This
mirrors Core Rule 3 in *Apply System Intake Costs* ("losses during tracing should not affect the
percentage ratios"), applied to the upstream/fan-in side instead of the downstream/fan-out side.

**Core Rule 4 (unaccounted flow doesn't go unattributed):** A discharge node may report a portion
of its inflow as unaccounted (e.g. stormwater or groundwater infiltration entering the discharge
point directly, with no traceable upstream system) via a dedicated user-entered field. That flow
has no upstream edge, so it never contributes to any system's flow responsibility. If the
attribution denominator used the full inflow (including unaccounted flow), every system's
fraction would come up short by exactly the unaccounted flow's share, and the total attribution
would fall short of 100% — see the worked example in §7b. The formula avoids this by dividing by
`attributableFlow` (total inflow minus unaccounted flow) instead: the unaccounted flow's share of
the block cost is spread pro-rata across the systems that did send traceable flow, rather than
left unattributed. The block cost itself is unaffected — it is still based on the full inflow,
since the discharge still incurs that cost regardless of where the water came from. This mirrors
Core Rule 4 in *Apply System Intake Costs*, applied to the inflow side of a discharge node
instead of the outflow side of an intake node.

---

## 4. Pump and Motor Energy Attribution

Pump and motor energy costs associated with the discharge node (e.g., effluent pumps at the discharge point) are attributed to upstream systems using the same attribution fraction.

    Energy cost to system = Attribution fraction × Discharge node pump/motor energy cost

---

## 5. Adjusted Attribution (User Override)

A user may supply an override attribution fraction for a specific system–discharge pair. When an override is present:

1. The default computed fraction is still recorded for audit purposes.
2. The cost to the system is calculated using the override fraction:

       Cost to system = Adjusted fraction × Discharge total block cost

3. Pump and motor energy attribution is also applied using the adjusted fraction.

Adjusted attributions are collected during the path walk and applied as a batch after all paths are processed for that discharge node.

---

## 6. De-duplication of Paths

As with intake cost attribution, a system may appear on multiple upstream paths from the same discharge point. De-duplication rules prevent double-charging:

- The path segment from the discharge to the system is recorded after each attribution.
- If a subsequent path reaches the same system via an identical sequence of flow connections (upstream), that path is skipped.
- If the path is genuinely different (e.g., through different intermediate wastewater treatment units), the attribution proceeds and fractions accumulate.

---

## 7. Worked Example

**Scenario:** Two production systems both discharge to a shared outfall.

```
  System A (sends 70 Mgal/yr to discharge) ──►
                                               Discharge Outfall (110 Mgal/yr, $1.80/kgal)
  System B (sends 40 Mgal/yr to discharge) ──►
```

**Block cost of discharge:**  
110 Mgal/yr × 1,000 × $1.80/kgal = $198,000/yr

**Path 1 — Discharge → System A (upstream):**
- Discharge-adjacent flow = 70 Mgal/yr (edge from System A to discharge; no waste-water-treatment
  node in the path, so `branchFraction` = 1.0)
- System flow responsibility = 70 × 1.0 = 70 Mgal/yr
- Attribution fraction = 70 / 110 = 0.636
- Cost to System A = 0.636 × $198,000 = **$125,925/yr**

**Path 2 — Discharge → System B (upstream):**
- Discharge-adjacent flow = 40 Mgal/yr, `branchFraction` = 1.0
- Attribution fraction = 40 / 110 = 0.364
- Cost to System B = 0.364 × $198,000 = **$72,075/yr**

**Check:** $125,925 + $72,075 = $198,000 = Total discharge block cost ✓

---

## 7b. Worked Example — Unaccounted Flow

**Scenario:** A discharge point reports 10 gpm of unaccounted inflow (e.g. stormwater or
groundwater infiltration entering the sewer directly) alongside its entered inflow, fed by two
independent upstream systems with no shared intermediate node.

```
  System A (60 gpm) ──►
                          Discharge (entered inflow 100 gpm, cost $2/kgal, 10 gpm unaccounted)
  System B (30 gpm) ──►
```

**Block cost of discharge:** 100 gpm × 1,000 × $2/kgal = **$200,000/yr** — based on the full
entered inflow; the unaccounted 10 gpm still arrives at the discharge and still costs money to
treat/dispose of.

**attributableFlow** = 100 − 10 = **90 gpm** — the routed total (60 + 30 = 90) that actually has
an upstream edge.

Using `attributableFlow` as the denominator for each upstream system's attribution fraction
(Step 5), System A and System B collectively absorb:

    90 / 90 = 100% of the $200,000 block cost

(System A: 60/90 = 66.7% → $133,333/yr; System B: 30/90 = 33.3% → $66,667/yr.)

**Check — what goes wrong without this rule:** If the denominator were the full inflow (100 gpm)
instead, the same systems would only ever sum to 90 / 100 = 90%, leaving 10/100 = 10% of the
$200,000 block cost ($20,000/yr) permanently unattributed to any system — a violation of
Core Rule 1.

---

## 7c. Worked Example — Merge-Node Loss

**Scenario:** Two systems both discharge into a shared waste-water-treatment unit that loses
volume before reaching the discharge.

```
  System A (60 Mgal/yr) ──┐
                            ├──► WWT ($1/kgal, 100 in / 80 out, loses 20) ──► Discharge (80 in)
  System B (40 Mgal/yr) ──┘
```

**Block cost of discharge:** 80 Mgal/yr × 1,000 × $1/kgal = **$80,000/yr**.

**Path 1 — Discharge → WWT → System A (upstream):**
- Discharge-adjacent flow = 80 Mgal/yr (edge from WWT to discharge)
- `localRatio` at WWT = System A's edge flow (60) / WWT's total inflow (100) = 0.60
- `branchFraction` = 0.60
- System flow responsibility = 80 × 0.60 = 48 Mgal/yr
- Attribution fraction = 48 / 80 = 0.60
- Cost to System A = 0.60 × $80,000 = **$48,000/yr**

**Path 2 — Discharge → WWT → System B (upstream):**
- `localRatio` at WWT = 40 / 100 = 0.40
- System flow responsibility = 80 × 0.40 = 32 Mgal/yr
- Attribution fraction = 32 / 80 = 0.40
- Cost to System B = 0.40 × $80,000 = **$32,000/yr**

**Check:** $48,000 + $32,000 = $80,000 = Total discharge block cost ✓

**Check — what goes wrong without this rule:** The prior cap-based formula compared the
discharge-adjacent flow (80) against each system's own edge flow independently: System A =
min(80/60, 1.0) × 60 = 60, giving 60/80 = 75%; System B = min(80/40, 1.0) × 40 = 40, giving
40/80 = 50%. Sum = 125% ($100,000 attributed against an $80,000 block cost), because neither
calculation ever learned that WWT's other contributor existed or that WWT lost 20 Mgal/yr — each
system was independently credited as if its own full raw outflow reached the discharge.

---

## 8. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction | Upstream from discharge |
| Stopping point | First water-using system on each path |
| Cost basis | Full discharge block cost (unit cost × total discharge inflow, unaccounted flow included) |
| Attribution denominator — branch-ratio product rule | Discharge-adjacent flow × `branchFraction`, where `branchFraction` is the product of every waste-water-treatment-target edge's `localRatio` (that edge's flow ÷ its target waste-water-treatment node's total inflow) across the whole path, divided by `attributableFlow` (total discharge inflow minus any unaccounted flow). Covers direct shared discharges, single-contributor waste-water-treatment chains (with or without loss), merge nodes with multiple contributors, and unaccounted flow with one formula. |
| Cap on fraction per path | None needed — the branch-ratio product cannot exceed 1.0 given valid flow data. |
| Pump/motor energy | Attributed using same fraction as discharge cost |
| Adjusted attribution | User-supplied fraction replaces computed default |
| De-duplication | Identical paths from discharge to system are attributed only once |
| Unaccounted flow | Excluded from the attribution denominator (not the block cost) so its cost is spread pro-rata across systems that sent traceable flow, instead of going unattributed |
| Merge-node losses | Excluded from over-attributing any single contributor by keying each merge node's `localRatio` to its total inflow across all contributors, instead of comparing only the two endpoint edges of a path |
