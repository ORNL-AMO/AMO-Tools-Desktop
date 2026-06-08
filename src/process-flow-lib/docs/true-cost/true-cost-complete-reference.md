**Date Generated:** June 8, 2026

# True Cost Attribution — Complete Reference

**Document Scope:** This is the unified team reference for the Water Assessment Tool's true cost algorithm. It covers the full calculation from raw input data through final per-system and plant-level results: what each stage does, why that ordering or approach is required, the exact formulas used, and the structure of all outputs. For deep detail on individual attribution sub-routines, see the companion documents listed at the end.

---

## The Big Picture

The calculation takes a facility's water flow diagram — nodes (systems, intakes, treatment units, discharges) and the directed connections between them — and produces a dollar figure for every water-using system that answers: *what does water truly cost us, including all the indirect costs we wouldn't see on a single utility bill?*

The five stages must run in the order shown below. Each stage produces data that the next one depends on.

---

## Glossary

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
| **`systemsWithRODirectDischarge`** | A preprocessing index (keyed by system node ID) identifying all single-system RO configurations in the diagram. Consulted by all four Stage 4 attribution sub-routines to apply the 100% override. |

---

## Inputs Required

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

## Stage 1 — Build the Graph Index

**What happens:** The raw diagram data (a list of nodes and edges) is reorganized into fast-lookup structures: maps of which nodes connect to which, what type each node is, and what flows travel along each edge.

**Why:** The attribution logic needs to traverse the diagram repeatedly — walking upstream, walking downstream, finding neighbors of a given node. Doing that by scanning the full list of nodes and edges every time would be slow and error-prone. Building lookup maps once up front makes every subsequent traversal fast and consistent.

---

## Stage 2 — Preprocessing: Identify Single-System RO Configurations

**What happens:** Before any costs are calculated, the function `assignsystemsWithRODirectDischarge` scans every Reverse Osmosis (RO) treatment node in the diagram and checks whether it exists exclusively to serve a single water-using system. Qualifying entries are stored in `graph.systemsWithRODirectDischarge`, keyed by the associated water-using system's node ID.

**Qualification criteria** — a `water-treatment` node qualifies when all of the following are true:

1. Its `treatmentType` is `6` (Reverse Osmosis).
2. It has exactly **two** downstream branches (product water path and reject path).
3. The **product water path** leads to exactly one water-using system and then to exactly one discharge node, with no other systems on that branch.
4. The **reject path** leads to exactly one discharge node with no water-using systems present.
5. A wastewater treatment unit may appear on either the product water path or the reject path (but not both). If present, it is stored in the index so that its costs are also overridden to 100% for the owning system.
6. The RO node has exactly **one** upstream water-intake node.

When all criteria are met, the index entry records the intake node, the RO treatment node, the discharge node on the product water path, and (if present) the waste-water-treatment node from either path.

**Why:** Flow-fraction attribution gives each system a share of a cost proportional to how much water actually reaches it. For an RO unit running at 70% recovery, only 70% of the water makes it through as usable product — the other 30% is rejected. A naïve fraction-based method would attribute only 70% of the RO treatment cost and 70% of the upstream intake cost to the system. But when the entire RO setup exists only to serve that one system, the reject stream is an unavoidable operating loss rather than water serving another purpose. The system should bear **100%** of all associated costs. This index is built before Stage 3 so that every subsequent stage can consult it.

---

## Stage 3 — Compute Block Costs and Flow Paths

**What happens:** For each cost-component node (water intake, water discharge, water treatment, wastewater treatment), the algorithm does two things:

1. **Computes the block cost** — the total annual cost of that node.
2. **Traces all flow paths** from that node to the boundary of the diagram using a depth-first search (DFS), recording each path as an ordered sequence of flow connections (edges).

**Block cost formulas:**

| Node type | Flow basis | Formula |
|---|---|---|
| Water Intake | Outflow (water leaving the intake) | Block cost = ($/kgal) × (outflow × 1,000) |
| Water Discharge | Inflow (water entering the discharge) | Block cost = ($/kgal) × (inflow × 1,000) |
| Water Treatment | Inflow (water entering the treatment unit) | Block cost = ($/kgal) × (inflow × 1,000) |
| Wastewater Treatment | Inflow (water entering the WWT unit) | Block cost = ($/kgal) × (inflow × 1,000) |

**Why:** The block cost answers "how much does this node cost in total per year?" before we decide how to split it across systems. We need this number first so that attribution in the next stage produces dollar amounts rather than just fractions.

The flow path trace answers "which systems can this node's cost possibly reach, and by what routes?" Computing these paths once and storing them means Stage 4 does not need to re-traverse the diagram for every system — it works from the pre-computed path list.

---

## Stage 4 — Attribute Costs to Systems

**What happens:** Five sub-routines run in sequence, each responsible for one type of cost component. Each sub-routine walks the pre-computed flow paths and decides what fraction of a cost component's block cost belongs to each water-using system.

All sub-routines share a common allocation principle: **the system closest to the cost component bears the cost.** Systems further away are not double-charged.

> **Single-system RO override:** For intake, discharge, and treatment cost components, sub-routines consult `graph.systemsWithRODirectDischarge` inline and override the attribution fraction to **1 (100%)** when the component is part of a qualifying single-system RO configuration. For wastewater treatment on the RO reject path, a dedicated fifth sub-routine (`applyROSystemWasteTreatmentCosts`) handles the override after the standard WWT pass completes.

| Sub-routine | Cost component type | Walk direction | Stopping criterion |
|---|---|---|---|
| Apply System Intake Costs | Water Intake | Downstream | First water-using system on each path |
| Apply System Discharge Costs | Water Discharge | Upstream | First water-using system on each path |
| Apply System Treatment Costs | Water Treatment | Downstream | First water-using system on each path |
| Apply System Wastewater Treatment Costs | Wastewater Treatment | Downstream (reuse) then Upstream (discharge) | First water-using-system node on each path |
| Apply RO System Wastewater Treatment Costs | Wastewater Treatment — RO reject path | Direct lookup of `systemsWithRODirectDischarge` | One attribution per qualifying RO configuration |

### Sub-routine detail

**1. Intake Costs** — walks downstream from each water intake node, stopping at the first water-using system encountered on each path. The attribution fraction uses one of two bases depending on the path:

- *Intake-flow-volume basis* (standard case): each system's fraction = its share of the total intake outflow. Used when the intake splits to multiple downstream paths or the treatment chain has no flow losses.
- *Delivered-flow-volume basis* (treatment-chain-with-losses case): when the intake has a single outgoing path and the treatment chain loses water (e.g., RO reject), the denominator switches to the treatment node's outflow rather than the intake's outflow. This ensures all downstream systems together absorb 100% of the intake cost, including the cost of water consumed in treatment. The algorithm also detects losses in earlier nodes of a chained treatment sequence so the correct basis is applied even when an intermediate node itself has no losses.
- *Single-system RO override*: forces the fraction to 1.0 for any intake registered in the Stage 2 index.

**2. Discharge Costs** — walks upstream from each discharge node, stopping at the first water-using system encountered on each path. That system receives the cost. The single-system RO override forces fraction to 1.0 for the registered discharge.

**3. Treatment Costs** — walks downstream from each water treatment node, stopping at the first water-using system encountered on each path. Two attribution bases apply:

- *Standard (no losses)*: fraction = system's share of the treatment node's total inflow.
- *With losses* (outflow < inflow): fraction = system's share of the treatment node's total outflow, but the cost basis is still the full inflow block cost. This ensures the full treatment cost is distributed across only the water that actually makes it through.
- *Single-system RO override*: forces fraction to 1.0 for the registered RO treatment node.

**4. Wastewater Treatment Costs** — two passes per WWT node:

- *Pass 1 (downstream/reuse)*: walks downstream, stopping at the first water-using system receiving the recycled water. Standard flow-fraction applies.
- *Pass 2 (upstream/discharge)*: walks upstream, stopping at the first water-using system that sent water into the WWT. The system's flow responsibility is reduced by any portion already attributed in Pass 1. Special case: when the WWT node is registered as the waste treatment component of a single-system RO configuration, the 100% attribution is assigned directly to the RO system owner — even though the immediate upstream node is an RO treatment node (not itself a water-using system).

### Why four separate passes?

Each cost component type has a different direction of responsibility. Intake costs flow forward — the system that first receives the water is the one that drove the intake. Discharge costs flow backward — the system that last used the water before it leaves the facility is responsible for the discharge. Separating the passes makes each rule explicit and independently auditable.

### Why stop at the first system?

Charging a downstream system for an upstream cost component would mean double-counting — the upstream system already bears the cost of getting water to itself, and the downstream system would be getting charged for water infrastructure it didn't directly use. The "closest system pays" rule prevents this.

### Stage 4 outputs (per pass)

- A running total of attributed costs per system, broken down by category: intake, discharge, treatment, wastewater treatment.
- A full audit trail recording which paths were evaluated, what fraction was assigned, and whether a user override was applied.

---

## Stage 5 — Finalize Per-System Results

**What happens:** With all flow-based cost attribution complete, Stage 5 adds the costs internal to each system and computes the final summary metrics.

### 5a — In-System Treatment Cost

If a treatment unit sits entirely inside a single system (it treats all of that system's water and only that system's water), its cost is calculated directly from the system's inflow rather than being distributed through the path-tracing logic.

**Why here and not Stage 4:** The path-tracing logic in Stage 4 works by following water across the diagram from one node to the next. An in-system treatment unit has no outbound paths that lead to other systems — all of its output stays within the same system. There is nothing to trace. The cost is simply unit cost × flow, applied directly to the one owning system.

### 5b — Heat Energy Cost

Calculated from the temperature rise the system imposes on the water, the heater efficiency, and the total annual flow.

```
Q = [V × ρ × C_p × (T_out − T_in)] / η
```

| Symbol | Description |
|---|---|
| V | Total annual system inflow (Mgal or m³) |
| ρ | Density of water (8.345 lb/gal Imperial; 1,000 kg/m³ Metric) |
| C_p | Specific heat of water (1.00 Btu/lb·°F Imperial; 4.1868 kJ/kg·°C Metric) |
| T_out | Leaving water temperature (°F or °C) |
| T_in | Incoming water temperature (°F or °C) |
| η | Heater efficiency (fraction, e.g., 0.78) |

Heat energy cost = Q × energy unit cost ($/MMBTU or $/GJ)

**Why here and not Stage 4:** Heat energy is not a flow-path cost. It is a consequence of what a system does to the water it already has — raising its temperature. There is no upstream or downstream cost component to attribute; the cost originates inside the system itself.

### 5c — Motor Energy Cost

The system's own pump/motor entries are summed using the standard motor energy formula:

```
E = (0.746 × hp × N × L / η) × H
```

| Symbol | Description |
|---|---|
| hp | Rated power in horsepower (converted to kW for Metric) |
| N | Number of pump/motor units |
| L | Load factor (0–1) |
| η | System efficiency (0–1) |
| H | Hours of operation per year |

Motor energy cost = E × electricity unit cost ($/kWh)

**Why re-calculated here:** Pump and motor entries belong to a specific system. During Stage 4, some motor energy may be partially accumulated from intake or discharge node attributions (because pumps exist at those nodes too). Stage 5 replaces that accumulated value with a clean calculation from the system's own motor entries, ensuring the system's motor energy reflects its actual equipment rather than a partial attribution from shared infrastructure.

### 5d — Derived Per-System Metrics

| Metric | Formula |
|---|---|
| Direct Cost per Year | Attributed intake cost + attributed discharge cost |
| Direct Cost per Unit | Direct Cost per Year ÷ (source water intake × 1,000) |
| True Cost per Year | Direct Cost + Treatment + WWT + Motor Energy + Heat Energy |
| True Cost per Unit | True Cost per Year ÷ (source water intake × 1,000) |
| True-to-Direct Ratio | True Cost per Year ÷ Direct Cost per Year |

### 5e — Plant-Level Aggregation

All system results are summed to produce plant totals. Plant-level cost-per-unit metrics use the plant's total source water intake as the denominator.

---

## Outputs

The algorithm returns four result structures.

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

## Full Calculation Sequence

```
Facility Diagram (nodes + edges)
          │
          ▼
  Stage 1: Build Graph Index
  (fast-lookup maps for nodes, edges, adjacency)
          │
          ▼
  Stage 2: Identify Single-System RO Configurations
  (assignsystemsWithRODirectDischarge — scan RO nodes;
   record systems that bear 100% of their RO-related costs
   in graph.systemsWithRODirectDischarge, keyed by system ID)
          │
          ▼
  Stage 3: Compute Block Costs and Flow Paths
  (block cost = unit cost × flow, per cost-component node;
   DFS traces all reachable paths from each node to diagram boundary)
          │
          ▼
  Stage 4: Attribute Costs to Systems (4 passes)
     ├─ Intake Costs    → downstream to first system
     ├─ Discharge Costs → upstream to first system        →  trueCostOfSystems[id].intake
     ├─ Treatment Costs → downstream to first system      →  trueCostOfSystems[id].discharge
     └─ WWT Costs       → downstream (reuse) /            →  trueCostOfSystems[id].treatment
                          upstream (discharge)             →  trueCostOfSystems[id].wasteTreatment
                                                           →  systemAttributionMap (audit trail)
          │  Partial per-system costs + audit trail
          ▼
  Stage 5: Finalize Per-System Results
     ├─ Add in-system treatment cost
     ├─ Calculate heat energy cost
     ├─ Re-calculate motor energy cost
     ├─ Compute direct cost, true cost, per-unit metrics
     └─ Aggregate to plant totals
          │
          ▼
     Final Results
     (per-system true cost, plant summary, cost component totals, audit trail)
```

---

## Companion Documents

| Document | What it covers |
|---|---|
| true-cost-algorithm-quick-reference.md | Concise algorithm reference: inputs, outputs, formulas, and glossary |
| true-cost-algorithm-stages.md | Plain-English stage-by-stage walkthrough with rationale |
| cost-component-attribution/apply-system-intake-costs.md | Detailed rules for Water Intake cost attribution |
| cost-component-attribution/apply-system-discharge-costs.md | Detailed rules for Water Discharge cost attribution |
| cost-component-attribution/apply-system-treatment-costs.md | Detailed rules for Water Treatment cost attribution |
| cost-component-attribution/apply-system-waste-water-treatment-costs.md | Detailed rules for Wastewater Treatment cost attribution |
| cost-component-attribution/cost-attribution-rules.md | Consolidated quick-reference table of all attribution rules |

