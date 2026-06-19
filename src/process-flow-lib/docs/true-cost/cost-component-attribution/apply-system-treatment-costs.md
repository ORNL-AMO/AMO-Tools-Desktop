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

### 3.1 Case A — Standard Case (No Losses)

When the treatment unit does not reduce water volume (outflow equals inflow):

**Step 1 — Determine treatment unit total outflow:**  
Total flow exiting the treatment node (may be less than inflow if there are losses).

**Step 2 — Determine system inflow from this path:**  
Flow on the edge immediately upstream of the system being evaluated.

**Step 3 — Determine path inflow:**  
Flow on the first edge exiting the treatment node on this path.

**Step 4 — Compute fraction of path flow received:**

    Fraction of path flow received = min(System inflow / Path inflow, 1.0)

**Step 5 — Compute system flow responsibility:**

    System flow responsibility = Path inflow × Fraction of path flow received

**Step 6 — Compute attribution fraction:**

    Attribution fraction = System flow responsibility / Treatment block cost total flow

**Step 7 — Compute cost to system:**

    Cost to system = Attribution fraction × Treatment total block cost

### 3.2 Case B — Treatment Node Has Losses

When the treatment unit reduces water volume (outflow < inflow — for example, an RO system with a reject stream):

**Step 1 — Determine treatment unit total outflow:**  
Total volume exiting the treatment unit (the product water side only, not the reject).

**Step 2 — Determine system inflow from this path:**  
Flow on the edge immediately upstream of the system.

**Step 3 — Compute attribution fraction (based on share of treatment product output):**

    Attribution fraction = System inflow / Treatment unit total outflow

**Step 4 — Compute cost to system (cost basis is the full treatment block cost):**

    Cost to system = Attribution fraction × Treatment total block cost

The key distinction: the cost basis is the block cost computed on the full inflow (which is what drives the treatment operating cost), but the downstream allocation denominator is the reduced outflow volume. This correctly reflects that a system receiving 100% of the product from a loss-generating treatment unit bears 100% of that unit's cost.

## 4. Series Treatment (Multiple Treatment Units in Sequence)

Each treatment unit in a series creates its own independent block cost row and is attributed independently. For example, in a chain of Multimedia Filtration → RO → UV Disinfection → System D:

- Multimedia Filtration block cost is attributed 100% to System D (since all of its output reaches System D).
- RO block cost is attributed 100% to System D.
- UV Disinfection block cost is attributed 100% to System D.

No duplication occurs because each unit is its own cost center evaluated separately. The costs accumulate in System D's treatment cost total.

---

## 5. Adjusted Attribution (User Override)

A user may supply an override attribution fraction for a specific system–treatment unit pair. When an override is present:

1. The default computed fraction is still recorded for audit purposes.
2. The cost to the system is calculated using the override fraction:

       Cost to system = Adjusted fraction × Treatment total block cost

Adjusted attributions are collected during the path walk and applied as a batch after all paths are processed for that treatment node.

---

## 6. De-duplication of Paths

If a treatment unit feeds multiple downstream paths that converge on the same system, de-duplication prevents double-charging. The path segment from the treatment node to the system is recorded after each attribution. Subsequent paths that reach the same system via the same sequence of flow connections are skipped. Genuinely distinct paths (through different intermediate nodes) are attributed and the fractions accumulate.

---

## 7. Worked Example

**Scenario:** A softening unit experiences a 10% volume loss due to regeneration waste. It feeds one system.

```
  Softener (inflow: 50 Mgal/yr, outflow: 45 Mgal/yr, $3.00/kgal)
       │
       ▼ (45 Mgal/yr product)
  System E
```

**Block cost of softener:**  
50 Mgal/yr × 1,000 × $3.00/kgal = $150,000/yr

**Because outflow (45) < inflow (50), the loss-adjusted method applies:**
- Treatment unit total outflow = 45 Mgal/yr
- System E inflow from this path = 45 Mgal/yr
- Attribution fraction = 45 / 45 = 1.00
- Cost to System E = 1.00 × $150,000 = **$150,000/yr**

System E bears 100% of the softener cost because it receives all of the product water. The cost basis is the full inflow (50 Mgal/yr) because that is what was actually treated.

---

## 8. Worked Example — Branching with Treatment Losses

**Scenario:** An RO unit (30% recovery loss) feeds two systems.

```
  RO Unit (inflow: 100 Mgal/yr, product outflow: 70 Mgal/yr, $5.00/kgal)
       ├──► System F: receives 42 Mgal/yr
       └──► System G: receives 28 Mgal/yr
```

**Block cost of RO unit:**  
100 Mgal/yr × 1,000 × $5.00/kgal = $500,000/yr

**Because outflow (70) < inflow (100), the loss-adjusted method applies:**

**Path to System F:**
- Attribution fraction = 42 / 70 = 0.60
- Cost to System F = 0.60 × $500,000 = **$300,000/yr**

**Path to System G:**
- Attribution fraction = 28 / 70 = 0.40
- Cost to System G = 0.40 × $500,000 = **$200,000/yr**

**Check:** $300,000 + $200,000 = $500,000 = Total RO block cost ✓

---

## 9. Summary of Attribution Rules

| Rule | Description |
|---|---|
| Walk direction | Downstream from treatment unit |
| Stopping point | First water-using system on each path |
| Cost basis | Full treatment block cost (unit cost × total treatment inflow) |
| Attribution denominator — Case A (no losses) | Treatment total inflow |
| Attribution denominator — Case B (with losses) | Treatment total outflow (product water only) |
| Cap on fraction per path | Min(system inflow / path inflow, 1.0) |
| Series treatment | Each unit in series is an independent cost center; no duplication |
| Adjusted attribution | User-supplied fraction replaces computed default |
| De-duplication | Identical paths from treatment node to system are attributed only once |
