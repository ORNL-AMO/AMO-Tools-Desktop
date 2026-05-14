**Date Generated:** May 1, 2026

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

### 3.1 Standard Case (No Losses in Intermediate Treatment)

When water passes through an intermediate treatment unit without volume loss (outflow equals inflow), the following method is used:

**Step 1 — Determine path inflow:**  
The flow value on the first edge leaving the intake node for this path.

**Step 2 — Determine system inflow from this path:**  
The flow value on the last edge in the path, immediately upstream of the system being evaluated.

**Step 3 — Compute fraction of path flow received:**

    Fraction of path flow received = min(System inflow / Path inflow, 1.0)

The cap at 1.0 prevents over-attribution when a system also receives water from other sources on other paths; those other sources will be evaluated in their own path iterations.

**Step 4 — Compute flow responsibility:**

    System flow responsibility = Path inflow × Fraction of path flow received

**Step 5 — Compute attribution fraction:**

    Attribution fraction = System flow responsibility / Intake block cost total flow

**Step 6 — Compute cost to system:**

    Cost to system = Attribution fraction × Intake total block cost

### 3.2 Case with Losses in Intermediate Treatment

When an intermediate treatment unit reduces the flow volume (outflow < inflow), the calculation changes because the cost basis remains the full intake volume while the attributed fraction is based on the reduced downstream flow:

**Step 1 — Determine treatment unit outflow:**  
Total outflow from the intermediate treatment node.

**Step 2 — Determine system inflow from this path:**  
Flow on the edge immediately upstream of the system.

**Step 3 — Compute attribution fraction (based on share of treatment outflow):**

    Attribution fraction = System inflow / Treatment unit total outflow

**Step 4 — Compute cost to system (cost basis is the full intake block cost):**

    Cost to system = Attribution fraction × Intake total block cost

The distinction from the standard case is that the denominator for the attribution fraction is the treatment unit's outflow rather than the total intake flow. This correctly reflects that the cost component cost is incurred on the full intake volume, but the remaining downstream allocation is split among the systems receiving the (reduced) treated output.

---

## 4. Treatment Chain Limitation

When two treatment nodes appear consecutively on a path (Treatment A → Treatment B → System), the algorithm detects this configuration and **falls back to the standard flow-fraction method** rather than applying the treatment-loss adjustment. Applying the loss-adjustment formula through a chain of treatment nodes with different loss rates is not currently supported.

See *Known Limitations* for further detail.

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
- System A inflow from this path = 60 Mgal/yr
- Fraction of path flow received = 60/100 = 0.60
- System flow responsibility = 100 × 0.60 = 60 Mgal/yr
- Attribution fraction = 60 / 100 = 0.60
- Cost to System A = 0.60 × $250,000 = **$150,000/yr**

**Path 2 — Intake → Treatment → System B:**
- Path inflow = 100 Mgal/yr
- System B inflow from this path = 40 Mgal/yr
- Fraction of path flow received = 40/100 = 0.40
- Attribution fraction = 40 / 100 = 0.40
- Cost to System B = 0.40 × $250,000 = **$100,000/yr**

**Check:** $150,000 + $100,000 = $250,000 = Total intake block cost ✓

---

## 9. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction | Downstream from intake |
| Stopping point | First water-using system on each path |
| Cost basis | Full intake block cost (unit cost × total intake outflow) |
| Attribution denominator (standard) | Total intake outflow |
| Attribution denominator (with treatment losses) | Treatment unit total outflow |
| Cap on fraction per path | Min(system inflow / path inflow, 1.0) |
| Pump/motor energy | Attributed using same fraction as intake cost |
| Adjusted attribution | User-supplied fraction replaces computed default |
| De-duplication | Identical paths from intake to system are attributed only once |
