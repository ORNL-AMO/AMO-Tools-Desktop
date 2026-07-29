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

### 3.1 proportional-discharge — Standard Case

The discharge cost allocation mirrors the intake cost allocation method, but applied in the upstream direction.

**Step 1 — Determine path discharge flow:**  
The flow value on the first edge leaving the discharge node in the upstream direction (i.e., the edge entering the discharge).

**Step 2 — Determine system discharge contribution to this path:**  
The flow value on the last edge in the upstream path, immediately downstream of the system being evaluated.

**Step 3 — Compute fraction of path discharge caused by this system:**

    Fraction of path discharge = min(Path first-edge flow / System edge flow, 1.0)

The cap at 1.0 prevents over-attribution when a system also sends water to other discharge points; those will be evaluated in their own separate path iterations.

**Step 4 — Compute system flow responsibility:**

    System flow responsibility = System edge flow × Fraction of path discharge

**Step 5 — Compute attribution fraction:**

    Attribution fraction = System flow responsibility / Discharge block cost attributable flow

`Attributable flow` is the discharge's total inflow minus any unaccounted flow the discharge
reports (see Core Rule below) — it is not the same value used for the discharge's block cost,
which stays based on the full inflow.

**Step 6 — Compute cost to system:**

    Cost to system = Attribution fraction × Discharge total block cost

**Core Rule (unaccounted flow doesn't go unattributed):** A discharge node may report a portion
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
- First-edge discharge flow = 70 Mgal/yr (edge from System A to discharge)
- System A's edge flow = 70 Mgal/yr
- Fraction = min(70/70, 1.0) = 1.0
- System flow responsibility = 70 × 1.0 = 70 Mgal/yr
- Attribution fraction = 70 / 110 = 0.636
- Cost to System A = 0.636 × $198,000 = **$125,925/yr**

**Path 2 — Discharge → System B (upstream):**
- First-edge flow = 40 Mgal/yr
- System B's edge flow = 40 Mgal/yr
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

## 8. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction | Upstream from discharge |
| Stopping point | First water-using system on each path |
| Cost basis | Full discharge block cost (unit cost × total discharge inflow, unaccounted flow included) |
| Attribution denominator | System flow responsibility ÷ `attributableFlow` (total discharge inflow minus any unaccounted flow) |
| Cap on fraction per path | Min(path first-edge flow / system edge flow, 1.0) |
| Pump/motor energy | Attributed using same fraction as discharge cost |
| Adjusted attribution | User-supplied fraction replaces computed default |
| De-duplication | Identical paths from discharge to system are attributed only once |
| Unaccounted flow | Excluded from the attribution denominator (not the block cost) so its cost is spread pro-rata across systems that sent traceable flow, instead of going unattributed |

**Known limitation (out of scope for the unaccounted-flow fix above):** when multiple systems'
flows converge through a shared waste-water-treatment node before reaching the discharge (e.g.
three systems feeding one WWTP whose output is smaller than their combined input), the
cap-based `Fraction of path discharge` in §3.1 Step 3 over-attributes flow responsibility,
because it compares the discharge-adjacent edge against each contributing system's own edge
independently rather than apportioning by each contributor's share of the merge node's total
inflow. This is a separate defect from unaccounted flow and is tracked independently.
