**Date Generated:** May 14, 2026 | **Last Updated:** June 8, 2026

# True Cost Attribution Algorithm — Overview

**Document Scope:** This document describes how the Water Assessment Tool calculates the "true cost" of water for each water-using system in a facility. It covers the full calculation from raw input data through final per-system and plant-level cost results. Companion documents cover the individual cost attribution methods in detail.

---

## 1. Glossary

| Term | Definition |
|---|---|
| **Cost component** | A diagram node that carries a unit cost: Water Intake, Water Discharge, Water Treatment, or Wastewater Treatment. |
| **Block cost** | The total annual cost of a cost component: unit cost ($/kgal) × total annual flow through that node. |
| **Water-using system** | A production or utility system that consumes water (e.g., Cooling Tower, Boiler, Process Use). The entity to which costs are ultimately attributed. |
| **Attribution fraction** | The share (0 to 1) of a cost component's block cost assigned to a given system. All fractions across all systems for one component should sum to 1.0. |
| **Adjusted attribution** | A user-supplied override fraction that replaces the computed default attribution for a specific system–component pair. |
| **Direct cost** | Intake costs + discharge costs attributed to a system. |
| **True cost** | Direct costs + all indirect costs (treatment, wastewater treatment, motor energy, heat energy) attributed to a system. |
| **Downstream** | In the direction of water flow — toward discharge. |
| **Upstream** | Against the direction of water flow — toward intake. |
| **Reused water** | Water that flows from one water-using system directly into another water-using system. |
| **Recycled water** | Water that flows from a wastewater treatment unit back into a water-using system. |
| **In-system treatment** | Treatment equipment located entirely within a single system that treats 100% of that system's inflow. Costed separately from shared treatment nodes. |
| **Single-system RO configuration** | An RO treatment node whose entire product water output flows to exactly one water-using system and whose reject stream flows to exactly one discharge (optionally through a waste-water-treatment node), with exactly one upstream intake. In this configuration, the system bears 100% of all associated cost components. |
| **`systemsWithRODirectDischarge`** | A preprocessing index (keyed by system node ID) identifying all single-system RO configurations in the diagram. Consulted by Step 2 attribution sub-routines to apply the 100% override. For intake, discharge, and treatment cost components, the override is applied inline within each sub-routine. For wastewater treatment, it is applied by the dedicated `applyROSystemWasteTreatmentCosts` function. |

---

## 2. Inputs Required

| Input | Description |
|---|---|
| Facility flow diagram | Nodes (systems, intakes, treatment, discharge) and directed edges (flow connections) |
| Annual flow values | Per-edge flow in million gallons per year (Mgal/yr) or cubic meters per year |
| Unit cost per node | Cost per thousand gallons ($/kgal) or cost per liter ($/L), per cost-component node |
| Electricity unit cost | $/kWh, used for pump/motor and heat energy calculations |
| Fuel unit cost | $/MMBTU or $/GJ, used when the system's heat source is a fuel-fired heater |
| Motor energy inputs | Number of units, rated power, load factor, system efficiency, hours per year — per pump/motor entry |
| Heat energy inputs | Incoming and outgoing water temperatures, heater efficiency, hours per year — per system with heat |
| Adjusted attribution overrides | Optional user-supplied fraction overrides, keyed by system ID and cost-component ID |

---

## 3. Algorithm Overview — Three Steps

The algorithm executes in three sequential steps. The order is mandatory; results from an earlier step feed into later steps.

### Step 1 — Initialize and Compute Block Costs

For each cost-component node (intake, discharge, treatment, wastewater treatment):

1. Compute the **block cost** (total annual cost of that node).
2. Trace all flow paths from that node to the boundary of the diagram using a depth-first search (DFS), recording paths as ordered sequences of flow connections (edges).

These paths are the input to Step 2.

**Block cost formulas:**

| Node type | Flow basis | Formula |
|---|---|---|
| Water Intake | Outflow (water leaving the intake) | Block cost = ($/kgal) × (outflow × 1,000) |
| Water Discharge | Inflow (water entering the discharge) | Block cost = ($/kgal) × (inflow × 1,000) |
| Water Treatment | Inflow (water entering the treatment unit) | Block cost = ($/kgal) × (inflow × 1,000) |
| Wastewater Treatment | Inflow (water entering the WWT unit) | Block cost = ($/kgal) × (inflow × 1,000) |

---

### Step 1.5 — Preprocessing: Single-System RO Detection

Before any cost attribution begins, the function `assignsystemsWithRODirectDischarge` scans every `water-treatment` node in the diagram and identifies those that qualify as a **single-system RO configuration**. It then stores the qualifying entries in `graph.systemsWithRODirectDischarge`, keyed by the associated water-using system's node ID.

**Qualification criteria** — a `water-treatment` node qualifies when all of the following are true:

1. Its `treatmentType` is `6` (Reverse Osmosis).
2. It has exactly **two** downstream branches (product water path and reject path).
3. The **product water path** leads to exactly one water-using system and then to exactly one discharge node, with no other systems on that branch.
4. The **reject path** leads to exactly one discharge node with no water-using systems present.
5. A wastewater treatment unit may appear on either the product water path or the reject path (but not both). If present, it is stored in the index so that its costs are also overridden to 100% for the owning system.
6. The RO node has exactly **one** upstream water-intake node.

When all criteria are met, the index entry records the intake node, the RO treatment node, the discharge node on the product water path, and (if present) the waste-water-treatment node from either path.

**Why this preprocessing is needed:** Flow-fraction attribution methods allocate only a share of costs proportional to how much water reaches a given system. For an RO unit operating at, say, 70% recovery, a naïve fraction-based method attributes only 70% of the RO treatment cost and 70% of the upstream intake cost to the system — because 30% of the water is "lost" as reject. However, when the entire RO setup exists solely to serve that one system, the reject stream is an unavoidable operational loss rather than water serving another purpose. The system should therefore bear **100%** of all associated costs. This index is built before Step 1 so that it is available to all four Step 2 sub-routines.

---

### Step 2 — Attribute Costs to Systems

Five attribution sub-routines execute in order. Each walks the pre-computed paths for one class of cost component and assigns a portion of each component's block cost to the appropriate water-using system(s).

| Sub-routine | Cost component type | Walk direction | Stopping criterion |
|---|---|---|---|
| Apply System Intake Costs | Water Intake | Downstream | First water-using system on each path |
| Apply System Discharge Costs | Water Discharge | Upstream | First water-using system on each path |
| Apply System Treatment Costs | Water Treatment | Downstream | First water-using system on each path |
| Apply System Wastewater Treatment Costs | Wastewater Treatment | Downstream (reuse) then Upstream (discharge) | First water-using system on each path |
| Apply RO System Wastewater Treatment Costs | Wastewater Treatment — RO reject path only | Direct lookup of single-system RO configurations | One attribution per qualifying RO configuration |

All sub-routines share a common allocation principle: **the system closest to the cost component bears the cost**. Systems further away (which may have already passed or will later receive water) are not double-charged.

> **Single-system RO override:** For intake, treatment, and discharge cost components, when the component being processed is part of a single-system RO configuration, the attribution fraction is overridden to **1** (100%), regardless of what the flow-fraction calculation would otherwise produce. For wastewater treatment costs on the RO reject path, this override is handled by a dedicated fifth sub-routine rather than inline — it runs after the standard wastewater treatment pass and directly assigns 100% of the WWT cost to the system that owns the RO unit.

Each sub-routine is described in its own companion document.

---

### Step 3 — Finalize Per-System Results

After all cost components have been attributed in Step 2, Step 3 completes the per-system accounting:

1. **In-system treatment cost** — For each treatment unit that is embedded entirely within one system, cost = unit cost × total system inflow. This is added to the system's treatment cost total.

2. **Heat energy cost** — Calculated from water temperature rise, heater efficiency, and annual flow:

   Q = [V × ρ × C_p × (T_out − T_in)] / η

   Where:
   - V = total annual system inflow (Mgal or m³)
   - ρ = density of water (8.345 lb/gal in Imperial; 1,000 kg/m³ in Metric)
   - C_p = specific heat of water (1.00 Btu/lb·°F in Imperial; 4.1868 kJ/kg·°C in Metric)
   - T_out = leaving water temperature (°F or °C)
   - T_in = incoming water temperature (°F or °C)
   - η = heater efficiency (fraction, e.g., 0.78)

   Heat energy cost = Q × energy unit cost ($/MMBTU or $/GJ)

3. **Motor energy cost (system-level)** — The system's own pump/motor entries are summed using the standard motor energy formula:

   E = (0.746 × hp × N × L / η) × H

   Where:
   - hp = rated power in horsepower (converted to kW for Metric)
   - N = number of pump/motor units
   - L = load factor (0–1)
   - η = system efficiency (0–1)
   - H = hours of operation per year

   Motor energy cost = E × electricity unit cost ($/kWh)

   > **Note:** Step 3 re-calculates motor energy directly from the system's own motor entries. This overwrites any pump/motor energy that was accumulated during Step 2 from intake and discharge node attributions. See *Known Limitations* for discussion.

4. **Derived per-system metrics:**

   | Metric | Formula |
   |---|---|
   | Direct Cost per Year | Attributed intake cost + attributed discharge cost |
   | Direct Cost per Unit | Direct Cost per Year ÷ (source water intake × 1,000) |
   | True Cost per Year | Direct Cost + Treatment + WWT + Motor Energy + Heat Energy |
   | True Cost per Unit | True Cost per Year ÷ (source water intake × 1,000) |
   | True-to-Direct Ratio | True Cost per Year ÷ Direct Cost per Year |

5. **Plant-level aggregation** — All system results are summed to produce plant totals. Plant-level cost-per-unit metrics use the plant's total source water intake as the denominator.

---

## 4. Outputs

The algorithm returns four result structures:

### True Cost of Systems

Keyed by system node ID. Each system entry contains the annual cost attributed to that system from each cost category:

| Field | Content |
|---|---|
| Intake | Attributed water intake costs |
| Discharge | Attributed water discharge costs |
| Treatment | Attributed water treatment costs + in-system treatment costs |
| Waste Treatment | Attributed wastewater treatment costs |
| System Pump and Motor Energy | Motor energy from the system's own pump/motor entries |
| Heat Energy | Calculated heat energy cost |
| Total | Sum of all categories |

### Plant System Summary Results

Plant-level totals aggregated from all systems:

| Field | Content |
|---|---|
| Source Water Intake | Total intake flow across all systems (Mgal/yr or m³/yr) |
| Discharge Water | Total discharge flow across all systems |
| Direct Cost per Year | Sum of all system direct costs |
| Direct Cost per Unit | Plant direct cost ÷ plant intake ($/kgal or $/m³) |
| True Cost per Year | Sum of all system true costs |
| True Cost per Unit | Plant true cost ÷ plant intake ($/kgal or $/m³) |
| True-to-Direct Ratio | Plant true cost ÷ plant direct cost |
| All System Results | Array of per-system summary entries |

### Cost Component Totals Map

Keyed by cost-component node ID. Records the block cost (total annual cost and total flow) for every intake, discharge, treatment, and wastewater treatment node. Used for audit and reporting.

### System Attribution Map

The full audit trail of every cost allocation. Keyed by system ID, then by cost-component ID. Each entry records:

- Which flow paths were evaluated
- The computed default attribution fraction for each path
- The adjusted (user-override) fraction, if applicable
- The cumulative total attribution fraction

---

## 5. Flow Diagram

```
Facility Diagram (nodes + edges)
          │
          ▼
  Build Graph Index
  (adjacency maps, edge maps, node maps)
          │
          ▼
┌─────────────────────────────────────┐
│ STEP 1.5: Preprocessing             │
│   assignsystemsWithRODirectDischarge│
│   Scan RO treatment nodes;          │
│   record single-system RO entries   │
│   in graph.systemsWithRODirect-     │
│   Discharge (keyed by system ID)    │
└──────────────┬──────────────────────┘
               │ RO detection index
               ▼
┌─────────────────────────────────────┐
│ STEP 1: For each cost-component node │
│   Block cost = unit cost × flow      │
│   Paths = DFS from node to boundary  │
└──────────────┬──────────────────────┘
               │ Block costs and paths per node
               ▼
┌─────────────────────────────────────┐
│ STEP 2:                             │
│   Apply Intake Costs     ────────►  │
│   Apply Discharge Costs  ────────►  │  trueCostOfSystems[id].intake
│   Apply Treatment Costs  ────────►  │  trueCostOfSystems[id].discharge
│   Apply WWT Costs        ────────►  │  trueCostOfSystems[id].treatment
│   Apply RO WWT Costs     ────────►  │  trueCostOfSystems[id].wasteTreatment
│                                     │  systemAttributionMap (audit trail)
└──────────────┬──────────────────────┘
               │ Partially populated per-system costs
               ▼
┌─────────────────────────────────────┐
│ STEP 3: For each water-using system  │
│   Add in-system treatment cost       │
│   Add heat energy cost               │
│   Re-calculate motor energy cost     │
│   Compute direct cost / true cost    │
│   Compute per-unit metrics           │
│   Accumulate → plant totals          │
└──────────────┬──────────────────────┘
               │
               ▼
          Plant Results
```

---

## 6. Companion Documents

| Document | Description |
|---|---|
| true-cost-algorithm-stages.md | Plain-English walkthrough of the full calculation flow with rationale for each stage |
| cost-component-attribution/apply-system-intake-costs.md | Detailed rules for Water Intake cost attribution |
| cost-component-attribution/apply-system-discharge-costs.md | Detailed rules for Water Discharge cost attribution |
| cost-component-attribution/apply-system-treatment-costs.md | Detailed rules for Water Treatment cost attribution |
| cost-component-attribution/apply-system-waste-water-treatment-costs.md | Detailed rules for Wastewater Treatment cost attribution |
| cost-component-attribution/cost-attribution-rules.md | Consolidated reference table of attribution rules per cost component |

