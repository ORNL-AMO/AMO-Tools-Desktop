# True Cost Algorithm — Version 3

This document updates [algorithm-v2.md](algorithm-v2.md) to match the algorithm as actually implemented in the MEASUR Water Diagram. Each section either expands the original rule or adds rules that the implementation enforces but that v2 did not state.


---

## Attribution Formula

```
attribution fraction = system's received flow (MGY) / denominator (MGY)
cost charged to system = total component cost × attribution fraction
```

The denominator is not always the same flow value. Depending on path structure, it may be the intake's outflow, a treatment node's total outflow, or the WWT unit's total inflow. Each sub-section below specifies which flow value serves as the denominator for that case.

---

## Definitions

- **Path** — the sequence of edges walked from a cost component's node to a water-using system, following that cost component type's "What to follow" / "Where to stop" rule.
- **Block cost** — the total dollar cost of a cost component's line item, calculated from the volume of water entering that component and its unit cost (inflow × unit cost). This is the amount distributed across systems via attribution fractions.
- **Local branch ratio (localRatio)** — for a single edge in a path whose source is a water-treatment node, that edge's flow divided by the treatment node's total outflow to all of its children. 1.0 when the node has a single child and no losses, or when the edge's source is not a water-treatment node.
- **Branch fraction (branchFraction)** — the product of every localRatio found in a path. For Intake Cost Components, this is the product across the *entire* path — the intake itself is never a treatment node, so there is no risk of double-counting. For Water Treatment Cost Components, this is the product across every edge *after* the first one — the first edge leaves the cost component's own node, and that node's own split is exactly the fraction being computed, so it is excluded from the product rather than folded into it.
- **Path inflow (pathInflow)** — for Intake Cost Components: the flow value of the first edge in a path (the intake's own outflow on that path).
- **Flow responsibility** — the volume of flow a system, or (in WWT's upstream pass) an upstream discharger, is charged for on a given path. Computed differently by cost-component type: for Intake, `systemFlowResponsibility = pathInflow × branchFraction`; for Water Treatment, `systemFlowResponsibility = (first edge's flow) × branchFraction`; for WWT's upstream pass, a discharger's flow responsibility is its raw contribution to the WWT unit minus the flow volume already attributed to downstream reuse systems.

---

## Core Rules

1. 100% of every cost component needs to be allocated between the water using systems (not more or less).^1^

2. To determine water using systems associated with cost components: trace flows upstream or downstream. Use outlet flow when tracing downstream. If there are branching flows, the cost will be split accordingly weighted by flow.

3. Losses: During tracing (upstream or downstream), there could be losses in intermediate systems — e.g., when tracing intake source costs to the individual water using systems, water treatment steps in between can have losses. This should not affect the percentage ratios. (See Intake rule — How to attribute, the with-losses-path case, and Water Treatment rule — How to attribute, the chained-downstream-loss case, for the specific denominator rules that enforce this.)

---

## Cost Attribution

### 1. Intake Cost Components (e.g., City Water, Well Water)

- **What to follow:** Start at the intake node; go downstream through any water treatment units.
- **Where to stop:** At the first water using systems reached on each path. Do not continue into other users even if they later receive recycled water.
- **How to attribute:** Attribute the intake's cost among those first users by the volume each receives from that intake. Walk every edge in the path from the intake to the system and take the product of each treatment-source edge's localRatio to get branchFraction. Multiplying branchFraction by pathInflow gives the system's flow responsibility (see [Definitions](#definitions)): ***[v3]***

  ```
  branchFraction = Π(localRatio for each treatment-source edge in the path)
  systemFlowResponsibility = pathInflow × branchFraction
  attribution fraction = systemFlowResponsibility / intake's total outflow
  ```

  This single rule covers every path shape below: ***[v3]***
  - **no-losses-path** (intake splits to multiple paths, or a single lossless treatment chain — formerly Cases A and B): no treatment node in the path, or a treatment node with a single lossless child, contributes a ratio of 1.0 — a direct intake split reduces to "each system absorbs its share of the intake's own path outflow." A treatment node that splits into multiple children (with no losses) divides that path's contribution among those branches by their share of its total outflow.
  - **with-losses-path** (single treatment path with losses — formerly Case C): a treatment node that loses volume (outflow < inflow) still contributes a ratio of 1.0 to its sole child, so the downstream system on that branch absorbs the cost of the lost water rather than the lost water shrinking its attributed percentage (Core Rule 3) — now also correct when that same lossy node splits into multiple children (each branch absorbs its own proportional share of the loss through the same ratio) or when the loss and a fork sit at different nodes in the chain.
  - **mid-chain-fork** (new in v3, not covered by any former case): because the product walks every treatment node in the path, a treatment node that forks mid-chain into branches of different depth — one branch reaching a system immediately, another passing through a further treatment node first — is attributed correctly instead of double-counted. ***[v3]***
- **Multi-source cap:** No explicit cap is needed on the branch-ratio product — it cannot exceed 1.0 given valid flow data, so a system's share of any single path is bounded automatically. When a system draws from more than one intake, each intake's path is still evaluated independently, and each intake attributes based on its own outflow and its own block cost. ***[v3]***

#### Examples

- **no-losses-path, split:** City Water → RO → Process (5 MGY) and City Water → CT (3 MGY). City Water row = Process 62.5%, CT 37.5%.
- **no-losses-path, single chain:** City Water (10 MGY) → Chlorination (10 in / 10 out) → Process (6 MGY) + Boiler (4 MGY). City Water row = Process 60%, Boiler 40%. Total = 100%.
- **with-losses-path, single chain:** City Water (10 MGY) → RO (10 in / 8 out) → Process (5 MGY) + Boiler (3 MGY). City Water row = Process 62.5% (5/8), Boiler 37.5% (3/8). Total = 100%.
- **with-losses-path, in-path treatment loss on a split intake:** City Water (177.2 MGY total) → Chemical Treatment (49.2 in / 25 out, feeding only Cooling Tower) is one of several paths from City Water. Cooling Tower's fraction is 49.2/177.2 = 27.76% (the full 49.2 routed down this path), not 25/177.2 = 14.1% (the post-loss received volume).
- **mid-chain-fork, branch to mixed-depth systems:** City Water (177.2 MGY total; 49.2 down this path) → Chemical Treatment 2 (49.2 in / 37 out) → [Cooling Tower (25), UV Filtration (12 in / 6 out) → Boiler]. Cooling Tower's branch ratio at Chemical Treatment 2 is 25/37; its fraction is 49.2 × 25/37 / 177.2 = 18.76%. Boiler's branch ratio is (12/37) × (6/6) = 12/37; its fraction is 49.2 × 12/37 / 177.2 = 9.00%. Sum = 27.76%, exactly the path's true share of the intake — not the 46.53% a formula that only looks one hop upstream would produce. ***[v3]***

### 2. Water Treatment Cost Components (e.g., RO, CT Chlorination)

- **What to follow:** Start at the water treatment unit; go downstream (through any additional treatment) until you reach the first water-using systems.
- **Where to stop:** At the first users consuming the treated water.
- **How to attribute:** Attribute the treatment unit's cost across those users by the volume of treated water they receive from this unit. The block cost is calculated on the total volume entering the treatment node (inflow × unit cost). Walk every edge in the path after the first one and take the product of each further treatment-source edge's localRatio to get branchFraction. Multiplying branchFraction by the first edge's flow gives the system's flow responsibility (see [Definitions](#definitions)): ***[v3]***

  ```
  branchFraction = Π(localRatio for each treatment-source edge after the first one in the path)
  systemFlowResponsibility = (first edge's flow) × branchFraction
  attribution fraction = systemFlowResponsibility / this treatment node's total outflow
  ```

  This single rule covers every path shape below, replacing the former no-losses / with-losses denominator switch (formerly Cases E and F) — the two denominators were already numerically identical whenever this treatment node itself had no loss, so the switch never added distinct behavior for valid data: ***[v3]***
  - **no-losses** (formerly Case E): this treatment node has no loss of its own (outflow equals inflow); a further treatment node later in the path contributes its own localRatio to branchFraction exactly as in the with-losses case below.
  - **with-losses** (formerly Case F, outflow < inflow): this treatment node's own loss narrows the denominator (its own total outflow) rather than the numerator; a further, lossy treatment node later in the path still contributes a ratio of 1.0 to its sole child, so that later loss is absorbed by the eventual system rather than shrinking this node's own attributed percentage.
  - **chained-downstream-loss** (new in v3, not covered by either former case): a treatment node with no loss of its own, whose path to the system passes through a further, lossy treatment node, still attributes 100% of its own cost correctly — reading only the edge closest to the system would have silently absorbed that later node's loss into this node's fraction. ***[v3]***
- **Multi-source cap:** No explicit cap is needed on the branch-ratio product — it cannot exceed 1.0 given valid flow data, so a system's share of any single path is bounded automatically. When a system receives treated water from more than one source, each source's path is still evaluated independently. ***[v3]***
- **Series note:** If RO → Chlorination → Process, then both RO and Chlorination each create a row, and each row goes 100% to Process. No duplication occurs because each row is its own cost component.

#### Examples

- **no-losses:** RO → Process (5 MGY) and RO → CT (2 MGY). RO row = Process 71.4% (5/7), CT 28.6% (2/7).
- **with-losses:** RO (10 MGY in / 8 MGY out, 2 MGY internal loss) → Process (5 MGY) + CT (3 MGY). Block cost calculated on 10 MGY inflow. RO row = Process 62.5% (5/8), CT 37.5% (3/8). Total = 100%. ***[v2]***
- **chained-downstream-loss:** TreatA (100 in / 100 out, lossless) → TreatB (100 in / 70 out, loses 30) → System. TreatA row = System 100% (first edge's flow 100 × branchFraction 1.0, since TreatB's localRatio to its sole child is 1.0), not 70% (the post-loss edge into System). TreatB row = System 100% independently. ***[v3]***
- **mid-chain-fork, branch to mixed-depth systems:** Chemical Treatment 2 (49.2 in / 37 out) → [Cooling Tower (25), UV Filtration (12 in / 6 out) → Boiler]. Cooling Tower's branch ratio is 25/37 = 67.57%. Boiler's branch ratio is (12/37) × (6/6) = 12/37 = 32.43%, using the 12 MGY Chemical Treatment 2 actually sent down that branch, not the 6 MGY that survives UV Filtration's own loss. Sum = 100% of Chemical Treatment 2's own block cost — not the 83.79% (67.57% + 16.22%) a formula that reads only the edge closest to the system would produce. ***[v3]***

### 3. Wastewater Treatment (WWT) Cost Components (e.g., Filtration, Flotation, pH)

Attribution runs in two sequential passes across all WWT nodes: the downstream pass completes for every WWT node before the upstream pass begins. This ordering ensures the full set of downstream (reuse) attributions is available when the upstream pass executes. ***[v2]***

- **What to follow:**
  - **Downstream pass (first):** From the WWT unit, follow treated water downstream until the first water-using systems receiving the recycled flow are reached. ***[v2]***
  - **Upstream pass (second):** From the WWT unit, follow contributing flow upstream until the first water-using systems that discharged into this WWT unit are reached. Systems already charged in the downstream pass are excluded from this pass. ***[v2]***
- **reuse-and-discharge-split** (formerly Case H) — where to allocate:
  - Reuse portion → allocate to the downstream user(s) who receive the treated water, by their share of the WWT unit's total inflow.
  - Discharged portion → allocate back to the upstream discharger(s) that fed the WWT unit. The discharger's flow responsibility equals its raw flow contribution to the WWT, reduced by the total flow volume already attributed to downstream reuse systems in the first pass, expressed as a fraction of the WWT unit's total inflow. ***[v2]***
- **Multi-source cap:** The attribution fraction from any single path is capped at 1.0. ***[v2]***
- **Series note:** For chains like Filter → Flotation, handle each unit separately based on that unit's own inputs and outputs. The deduction mechanism isolates each unit's discharge remainder: the flow volume charged to reuse systems in Flotation's downstream pass is deducted from the upstream discharger's responsibility in Flotation's upstream pass. ***[v2]***

#### Examples

- **reuse-and-discharge-split:** WWT receives 10 MGY from System A. WWT outputs 6 MGY to System B (reuse) and 4 MGY to Municipal Sewer. Downstream pass: System B = 60% (6/10). Upstream pass: System A flow responsibility = 10 − 6 = 4 MGY; attribution fraction = 40% (4/10). Total = 100%.

### 4. Discharge Cost Components (e.g., Municipal Sewer, Storm Sewer, Discharge Fees)

- **What to follow:** Start at the discharge node; go upstream until you hit water using systems.
- **Where to stop:** At the first user encountered on each path (the final user causing the discharge). Do not charge upstream users whose water was reused before discharging.
- **proportional-discharge** (formerly Case J) — how to attribute: Attribute the discharge cost by how much final discharge each user causes to that discharge node.
- **Multi-source cap:** When a system routes water to more than one discharge node, the fraction attributed from any single path is capped at 1.0. ***[v2]***

#### Examples

- **proportional-discharge:** CT HVAC sends 7 MGY to Municipal Sewer; Wash Bay sends 3 MGY. "Municipal Sewer fee" row = CT HVAC 70%, Wash Bay 30%.

---

## Recycled and Reused Water

### Recycled Water

Water is considered **recycled** if it flows from a wastewater treatment system to a water-using system.

- All upstream costs are attributed to the first water-using system.
- The second system (the one using the recycled water) is assigned the cost of wastewater treatment and all downstream processes, because this second system is the reason the treatment occurred in the first place.

### Reused Water

Water is considered **reused** if it flows directly from one water-using system to another.

- The first system is responsible for all upstream costs (intake source, water treatment, pumping, etc.).
- The last water user is responsible for all downstream costs (discharge, wastewater treatment, etc.).
- Any intermediate systems (in cases where three or more water-using systems are connected in series) have zero cost components.

These rules are not implemented as a separate processing step. They are enforced through the stopping conditions built into each cost attribution sub-routine: intake and treatment attribution stop at the first system on each downstream path; discharge attribution stops at the first system on each upstream path; WWT attribution uses the two-pass mechanism to separate reuse and discharge responsibilities. ***[v2]***

---

## Technical Implementation Details ***[v2]***

### Path Deduplication

When more than one downstream path from the same cost component reaches the same water-using system via an identical sequence of flow connections, that system is attributed only once for that path sequence. Genuinely distinct paths (different intermediate nodes) are each attributed and the fractions accumulate.

### Adjusted Attribution

A user may supply an override attribution fraction for a specific system–component pair. When an override is present, the computed default fraction is still recorded for audit, but the cost to the system is calculated using the override fraction. Adjusted attributions are collected during the path walk and applied as a batch after all paths for that component are processed.

---

## Footnotes

> **^1^** This rule is not enforced by the algorithm. It holds as a consequence of the attribution math, but no runtime check validates the sum.
