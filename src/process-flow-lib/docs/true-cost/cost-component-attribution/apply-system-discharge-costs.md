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

    Attribution fraction = System flow responsibility / Discharge block cost total flow

**Step 6 — Compute cost to system:**

    Cost to system = Attribution fraction × Discharge total block cost

### 3.2 single-system-ro — Single-System RO Override

When a discharge node collects the reject stream from an RO unit that exclusively serves one water-using system (a "single-system RO configuration"), that system bears 100% of the discharge block cost regardless of what the standard flow-fraction formula would compute.

**Why the standard formula under-attributes:** The reject stream is an unavoidable operational byproduct of the RO process — it is not water that was proportionally shared among multiple beneficiaries. Attributing discharge cost by raw flow ratio would dilute the charge below what the single benefitting system truly owes.

**Attribution condition:**

    graph.systemsWithRODirectDischarge[systemId]?.dischargeNode.id === dischargeId

When this condition is true, the computed `systemAttributionFraction` is overridden to `1` before costs are applied.

**Worked example:**

```
  Intake ──► RO Unit ──► (product water) ──► System A
                    └──► (reject, 100 Mgal/yr) ──► Discharge ($1.00/kgal)
```

- Discharge block cost = 100 Mgal/yr × 1,000 × $1.00/kgal = $100,000/yr
- Standard formula: attribution fraction = reject flow / total discharge inflow (would be less than 1.0 if other flows also enter the discharge)
- **Override:** System A attribution fraction = 1.0
- Cost to System A = 1.0 × $100,000 = **$100,000/yr**

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

## 8. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction | Upstream from discharge |
| Stopping point | First water-using system on each path |
| Cost basis | Full discharge block cost (unit cost × total discharge inflow) |
| Attribution denominator | Total discharge inflow |
| Cap on fraction per path | Min(path first-edge flow / system edge flow, 1.0) |
| Pump/motor energy | Attributed using same fraction as discharge cost |
| Adjusted attribution | User-supplied fraction replaces computed default |
| De-duplication | Identical paths from discharge to system are attributed only once |
| single-system-ro override | When discharge is the reject-stream outlet of a single-system RO configuration, attribution fraction is forced to 1.0 |
