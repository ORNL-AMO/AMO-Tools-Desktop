**Date Generated:** May 15, 2026

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

### 3.2 Delivered-Flow-Volume Basis (Treatment Chain with Losses)

When water passes through a treatment chain and volume is lost somewhere in that chain, the attribution fraction denominator switches from the full intake outflow to the **delivered flow volume** — the outflow of the immediate treatment node upstream of the system. This ensures that all downstream systems collectively absorb 100% of the intake cost, including the cost of water lost in treatment.

**Conditions — both must hold:**

1. **`intakeHasSingleOutflow`:** The intake node has exactly one outgoing child. When the intake splits to multiple paths, systems on each branch are attributed using the intake-flow-volume basis regardless of treatment losses; the other paths cover their portion of the intake cost.
2. **Treatment chain has losses:** Either the immediate upstream treatment node has losses (`deliveredFlowVolume < treatmentNodeInflow`), or any treatment node traversed earlier in the same path has losses (`hasUpstreamTreatmentLoss`). The upstream scan supports chained configurations where Treatment A loses water but Treatment B (the immediate treatment source) is balanced.

**Step 1 — Determine delivered flow volume:**  
Total outflow of the treatment node immediately upstream of the system (`deliveredFlowVolume`). For a chained configuration (Treatment A → Treatment B → System), this is Treatment B's total outflow — the volume actually delivered to downstream systems.

**Step 2 — Determine system inflow from this path:**  
Flow on the edge immediately upstream of the system.

**Step 3 — Compute attribution fraction (delivered-flow-volume basis):**

    Attribution fraction = System inflow / deliveredFlowVolume

**Step 4 — Compute cost to system (cost basis is the full intake block cost):**

    Cost to system = Attribution fraction × Intake total block cost

The denominator is the treatment chain's delivered output, not the intake total. This correctly distributes 100% of intake cost among the systems receiving the treated water, including the proportional share of cost attributable to water lost in treatment.

### 3.3 Single-System RO Override

**What the override does:** When a water intake feeds a reverse-osmosis (RO) treatment unit that exclusively serves one water-using system — with the RO reject stream going directly to discharge (not to another system) — the beneficiary system is assigned an attribution fraction of **1.0** (100% of the intake block cost), regardless of what the standard flow-fraction formula would produce.

**Why this override is needed:** An RO unit splits its feed water into a product water stream (usable output) and a reject stream (waste). Under the standard formula, the reject flow counts against the system's attribution fraction because it reduces the apparent share of intake flow that reaches the system. But the reject is an operational necessity of the RO process itself, not water consumed by a separate system. Since no other system draws from this intake → RO path, there is no other beneficiary to share the cost, and the full intake cost should fall on the one system that benefits.

**Condition for the override:**

    Attribution fraction = 1.0
    when graph.systemsWithRODirectDischarge[systemId]?.intakeNode.id === intakeId

This condition is true only when:
- The current system is identified as the sole beneficiary of an RO configuration (stored in `graph.systemsWithRODirectDischarge` keyed by system node ID), and
- The intake currently being evaluated is the same intake that feeds that RO unit.

**Worked example:**

```
  Intake (100 Mgal/yr, $2.50/kgal)
       │
       ▼
  RO Treatment
       ├──► System A (product water): 70 Mgal/yr
       └──► Discharge (reject):  30 Mgal/yr
```

Block cost of intake: 100 Mgal/yr × 1,000 × $2.50/kgal = **$250,000/yr**

Standard formula (without override):
- Attribution fraction = 70 / 100 = 0.70
- Cost to System A = 0.70 × $250,000 = $175,000/yr

RO override (single-system configuration detected):
- Attribution fraction = **1.0**
- Cost to System A = 1.0 × $250,000 = **$250,000/yr**

The 30 Mgal/yr reject is an unavoidable consequence of RO operation, not consumption by another system. System A is the only beneficiary and bears the full intake cost.

---

## 4. Treatment Chain Support

Chained treatment configurations (Treatment A → Treatment B → System) are fully supported. The algorithm scans all treatment nodes traversed earlier in the current path (`hasUpstreamTreatmentLoss`) to detect losses that occurred upstream of the immediate treatment node. When such a loss is found, the delivered-flow-volume basis applies using the immediate treatment node's outflow as the denominator — which for a chain equals the volume the chain ultimately delivers to downstream systems.

**Example — Treatment A with losses, Treatment B balanced:**

```
  Intake (10 Mgal) ──► Treatment A (10 in / 8 out) ──► Treatment B (8 in / 8 out)
                                                              ├──► System C: 5 Mgal
                                                              └──► System D: 3 Mgal
```

- `deliveredFlowVolume` = Treatment B outflow = 8 Mgal
- System C attribution fraction = 5 / 8 = 62.5%
- System D attribution fraction = 3 / 8 = 37.5%
- Total: 100% of intake cost distributed ✓

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
| Attribution denominator — intake-flow-volume basis | Total intake outflow. Used when intake splits to multiple paths, or when no treatment losses exist in the chain. |
| Attribution denominator — delivered-flow-volume basis | Immediate treatment node total outflow (`deliveredFlowVolume`). Used when the intake has a single outgoing path AND treatment losses exist anywhere in the chain (including upstream nodes). |
| Cap on fraction per path | Min(system inflow / path inflow, 1.0) |
| Pump/motor energy | Attributed using same fraction as intake cost |
| Adjusted attribution | User-supplied fraction replaces computed default |
| Single-system RO override | When intake feeds a single-system RO configuration, attribution fraction is forced to 1.0 |
| De-duplication | Identical paths from intake to system are attributed only once |
