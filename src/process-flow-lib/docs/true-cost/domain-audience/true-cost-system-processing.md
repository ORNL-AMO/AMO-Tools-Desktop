**Date Generated:** May 5, 2026

# True Cost — System Processing Summary

**Document Scope:** High-level description of how the application calculates and attributes true water costs to each water-using system in a facility. Intended for subject-matter experts who need to understand the processing model, not the implementation details.

---

## Processing — Three Sequential Steps

### Step 1 — Block Costs and Flow Paths

For each cost-bearing node (intake, discharge, treatment, wastewater treatment):

- Compute its **block cost**: unit cost × total annual flow through that node.
- Trace all flow paths from that node through the diagram graph to identify which systems are downstream or upstream.

### Step 2 — Cost Attribution to Systems

Four sub-routines run in sequence. Each attributes one cost type to water-using systems by walking the graph from the cost node and stopping at the first water-using system encountered. Cost is split proportionally by flow fraction when multiple systems share a cost node. User-supplied attribution overrides replace computed fractions for any system–component pair. Path de-duplication prevents double-charging when two distinct paths converge on the same system.

---

#### 2.1 Water Intake

Walk direction: **downstream** from the intake node.

The first water-using system on each path bears the intake cost. Systems further downstream that receive water via inter-system reuse are not charged — their water draw is already accounted for through the reuse transfer, not the intake.

Each system's share is proportional to the volume it draws from that intake path relative to total intake outflow. If an intermediate treatment unit reduces flow volume (e.g., an RO reject stream), the attribution denominator shifts to the treatment unit's product outflow rather than the raw intake volume, ensuring the loss is not spread to downstream systems unfairly.

Pump and motor energy associated with the intake node is attributed to systems using the same fraction as the intake cost.

---

#### 2.2 Water Discharge

Walk direction: **upstream** from the discharge node.

The system immediately upstream of the discharge bears the cost — the final user that causes the discharge. Systems further upstream that previously held the water are not charged; their water was already transferred downstream and is the responsibility of the system that ultimately discharged it.

Each system's share is proportional to its contribution to the discharge flow relative to total discharge inflow. Pump and motor energy at the discharge node is attributed using the same fraction.

---

#### 2.3 Water Treatment

Walk direction: **downstream** from the treatment node.

The system that receives the treated water bears the treatment cost. Each treatment unit is an independent cost center evaluated separately — series treatment chains (e.g., filtration → RO → UV) do not cause duplication because each unit is attributed on its own.

When a treatment unit reduces flow volume (e.g., an RO system with reject), the attribution denominator is the product outflow, so the system(s) receiving all of the product water bear the full treatment cost even though the cost basis is the larger inflow volume. When flow loss occurs across two consecutive treatment nodes, the algorithm falls back to standard flow-fraction attribution.

---

#### 2.4 Wastewater Treatment

Walk direction: **downstream then upstream** (two sequential passes).

WWT cost is split between systems that benefit from recycled output and systems that generated the wastewater that was subsequently discharged.

**Pass 1 — Downstream (reuse portion):** Walk downstream from the WWT node. The first water-using system on each path is charged in proportion to the recycled volume it receives relative to total WWT inflow. Each attributed system and its charged flow volume are recorded before Pass 2 begins.

**Pass 2 — Upstream (discharged portion):** Walk upstream from the WWT node. Systems already charged in Pass 1 are excluded. Each upstream system's flow responsibility is reduced by the total volume already attributed downstream in Pass 1, ensuring the full WWT block cost is recovered exactly once. For a lossless WWT unit, Pass 1 and Pass 2 fractions sum to 1.0.

Series WWT configurations (multiple WWT units in sequence) are handled by evaluating each unit independently through its own two-pass attribution.

---

### Step 3 — Per-System Finalization

After attribution, each system's result is completed:

- **In-system treatment** costs are added directly (treatment equipment scoped entirely within one system).
- **Heat energy** and **motor energy** costs are computed from system-specific inputs and added.
- **Direct cost**, **true cost**, and **per-unit metrics** are derived.
- All systems are aggregated into plant-level totals.

---

## Outputs

| Result | Description |
|---|---|
| Per-system costs | Intake, discharge, treatment, WWT, motor energy, heat energy, and total — per system |
| Per-system metrics | Direct cost/yr, true cost/yr, direct cost/unit, true cost/unit, true-to-direct ratio |
| Plant summary | Same metrics aggregated across all systems |
| Attribution audit trail | Full record of which flow paths and fractions drove each system's cost allocation |
