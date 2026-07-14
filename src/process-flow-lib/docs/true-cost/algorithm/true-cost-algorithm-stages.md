**Date Generated:** June 5, 2026

# True Cost Calculation — Flow Diagram Guide

**Document Scope:** This document walks through each stage of the true cost calculation in plain English, following the same sequence as the algorithm. For each stage it explains what happens and why that ordering or approach is necessary. The companion overview document (`true-cost-complete-reference.md`) covers inputs, outputs, and the full glossary.

---

## The Big Picture

The calculation takes a facility's water flow diagram — nodes (systems, intakes, treatment units, discharges) and the directed connections between them — and produces a dollar figure for every water-using system that answers: *what does water truly cost us, including all the indirect costs we wouldn't see on a single utility bill?*

The stages must run in the order shown below. Each stage produces data that the next one depends on.

---

## Stage 1 — Build the Graph Index

**What happens:** The raw diagram data (a list of nodes and edges) is reorganized into fast-lookup structures: maps of which nodes connect to which, what type each node is, and what flows travel along each edge.

**Why we do this:** The attribution logic needs to traverse the diagram repeatedly — walking upstream, walking downstream, finding neighbors of a given node. Doing that by scanning the full list of nodes and edges every time would be slow and error-prone. Building lookup maps once up front makes every subsequent traversal fast and consistent.

---

## Stage 2 — Compute Block Costs and Flow Paths

**What happens:** For each cost-component node (water intake, water discharge, water treatment, wastewater treatment), the algorithm does two things:

1. **Computes the block cost** — the total annual cost of that node, calculated as unit cost ($/kgal) multiplied by the total annual flow through the node.
2. **Traces all flow paths** from that node to the edge of the diagram using a depth-first search, recording each path as an ordered sequence of connections.

**Why we do this:** The block cost answers "how much does this node cost in total per year?" before we decide how to attribute it across systems. We need this number first so that attribution in the next stage produces dollar amounts rather than just fractions.

The flow path trace answers "which systems can this node's cost possibly reach, and by what routes?" By computing these paths once and storing them, the attribution stage does not need to re-traverse the diagram for every system — it just works from the pre-computed path list.

---

## Stage 3 — Attribute Costs to Systems

**What happens:** Four sub-routines run in sequence, each responsible for one type of cost component. Each sub-routine walks the pre-computed flow paths and decides what fraction of a cost component's block cost belongs to each water-using system.

The four sub-routines are:

1. **Intake Costs** — walks downstream from each water intake node, stopping at the first water-using system encountered on each path. The attribution fraction uses one of two bases depending on the path:
   - *Intake-flow-volume basis* (standard case): each system's fraction = its share of the total intake outflow. Used when the intake splits to multiple downstream paths or the treatment chain has no flow losses.
   - *Delivered-flow-volume basis* (treatment-chain-with-losses case): when the intake has a single outgoing path and the treatment chain loses water, the denominator switches to the treatment node's outflow rather than the intake's outflow. This ensures all downstream systems together absorb 100% of the intake cost, including the cost of water that was consumed in treatment. The algorithm also detects losses in earlier nodes of a chained treatment sequence so the correct basis is applied even when an intermediate node itself has no losses.

2. **Discharge Costs** — walks upstream from each discharge node, stopping at the first water-using system encountered on each path. That system receives the cost.

3. **Treatment Costs** — walks downstream from each water treatment node, passing through any further treatment nodes, and stops at the first water-using system encountered on each path. Each system's fraction is its share of the treatment node's total outflow, where "share" accounts for every further treatment node the path passes through on the way to the system — not just the value of the very last edge before the system. This lets a further treatment node's own loss or fork be absorbed correctly without shrinking (or double-shrinking) this node's own attributed fraction.

4. **Wastewater Treatment Costs** — two passes per WWT node:
   - *Pass 1 (downstream/reuse)*: walks downstream, stopping at the first water-using system receiving the recycled water. Standard flow-fraction applies.
   - *Pass 2 (upstream/discharge)*: walks upstream, stopping at the first water-using system that sent water into the WWT. The system's flow responsibility is reduced by any portion already attributed in Pass 1.

**RO configuration override:** When a water-treatment node qualifies as a Reverse Osmosis reject-redirect configuration, the **ro-reject-redirect** rule overrides the four sub-routines above for that node's reject branch — its share of intake, treatment, WWT, and discharge cost is redirected to the RO's product-recipient system(s) instead of being left permanently unattributed. See `ro-specification.md` for qualification criteria and worked examples.

**Why we do this as four separate passes:** Each cost component type has a different "direction of responsibility." Intake costs naturally flow forward — the system that first receives the water is the one that drove the intake. Discharge costs flow backward — the system that last used the water before it leaves the facility is the one responsible for the discharge. Separating the passes makes each rule explicit and independently auditable.

**Why we stop at the first system:** Charging a downstream system for an upstream cost component would mean double-counting — the upstream system already bears the cost of getting water to itself, and the downstream system would be getting charged for water infrastructure it didn't directly use. The "closest system pays" rule prevents this.

Each pass produces two outputs:
- A running total of attributed costs per system (broken down by category: intake, discharge, treatment, wastewater treatment).
- A full audit trail recording which paths were evaluated, what fraction was assigned, and whether a user override was applied.

---

## Stage 4 — Finalize Per-System Results

**What happens:** With all flow-based cost attribution complete, Stage 4 adds the costs that are internal to each system and then computes the final summary metrics.

For each water-using system:

1. **In-system treatment cost** is added. If a treatment unit sits entirely inside a single system (it treats all of that system's water and only that system's water), its cost is calculated directly from the system's inflow rather than being distributed through the path-tracing logic.

2. **Heat energy cost** is calculated from the temperature rise the system imposes on the water, the heater efficiency, and the total annual flow. This converts to energy (BTU or kJ) and then to dollars using the fuel or electricity unit cost.

3. **Motor energy cost** is calculated from the system's own pump and motor entries — rated power, load factor, efficiency, and hours of operation — and converted to dollars using the electricity unit cost.

4. **Summary metrics** are computed:

   | Metric | What it means |
   |---|---|
   | Direct Cost per Year | The annual cost of water intake and discharge attributed to this system |
   | Direct Cost per Unit | What each thousand gallons of intake water costs at the direct level |
   | True Cost per Year | The full annual cost including treatment, energy, and heat |
   | True Cost per Unit | What each thousand gallons of intake water truly costs |
   | True-to-Direct Ratio | How many times larger the true cost is compared to the visible direct cost |

5. **Plant-level aggregation** sums all system results into facility-wide totals.

**Why in-system treatment is handled here instead of in Stage 3:** The path-tracing logic in Stage 3 works by following water across the diagram from one node to the next. An in-system treatment unit has no outbound paths that lead to other systems — all of its output stays within the same system. There is nothing to trace. The cost is simply the unit cost times the flow, applied directly to the one system that owns it.

**Why motor energy is re-calculated here:** Pump and motor entries belong to a specific system. During Stage 3, some motor energy may be partially accumulated from intake or discharge node attributions (because pumps exist at those nodes too). Stage 4 replaces that accumulated value with a clean calculation from the system's own motor entries, ensuring the system's motor energy reflects its actual equipment rather than a partial attribution from shared infrastructure.

**Why heat energy is in Stage 4 and not Stage 3:** Heat energy is not a flow-path cost. It is a consequence of what a system does to the water it already has — raising its temperature. There is no upstream or downstream cost component to attribute; the cost originates inside the system itself.

---

## Full Sequence at a Glance

```
Facility Diagram (nodes + edges)
          │
          ▼
  Stage 1: Build Graph Index
  (fast-lookup maps for nodes, edges, adjacency)
          │
          ▼
  Stage 2: Compute Block Costs and Flow Paths
  (total annual cost per node; all reachable paths per node)
          │
          ▼
  Stage 3: Attribute Costs to Systems (4 passes)
     ├─ Intake Costs    → downstream to first system
     ├─ Discharge Costs → upstream to first system
     ├─ Treatment Costs → downstream to first system
     └─ WWT Costs       → downstream (reuse) / upstream (discharge)
          │
          │  Partial per-system costs + audit trail
          ▼
  Stage 4: Finalize Per-System Results
     ├─ Add in-system treatment cost
     ├─ Calculate heat energy cost
     ├─ Re-calculate motor energy cost
     ├─ Compute direct cost, true cost, per-unit metrics
     └─ Aggregate to plant totals
          │
          ▼
     Final Results
     (per-system true cost, plant summary, audit trail)
```

---

## Related Documents

| Document | What it covers |
|---|---|
| true-cost-complete-reference.md | Full algorithm reference with inputs, outputs, formulas, and glossary |
| cost-component-attribution/apply-system-intake-costs.md | Detailed rules for how intake costs are attributed |
| cost-component-attribution/apply-system-discharge-costs.md | Detailed rules for how discharge costs are attributed |
| cost-component-attribution/apply-system-treatment-costs.md | Detailed rules for how treatment costs are attributed |
| cost-component-attribution/apply-system-waste-water-treatment-costs.md | Detailed rules for how wastewater treatment costs are attributed |
| cost-component-attribution/cost-attribution-rules.md | Consolidated quick-reference table of all attribution rules |

