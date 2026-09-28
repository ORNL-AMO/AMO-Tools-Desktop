# True Cost Algorithm — Version 2

This document updates [algorithm-v1.md](algorithm-v1.md) to match the algorithm as actually implemented in the MEASUR Water Diagram. Each section either expands the original rule or adds rules that the implementation enforces but that v1 did not state.


---

## Attribution Formula

```
attribution fraction = system's received flow (MGY) / denominator (MGY)
cost charged to system = total component cost × attribution fraction
```

The denominator is not always the same flow value. Depending on path structure, it may be the intake's outflow, a treatment node's total outflow, or the WWT unit's total inflow. Each sub-section below specifies which flow value serves as the denominator for that case.

---

## Core Rules

1. 100% of every cost component needs to be allocated between the water using systems (not more or less).^1^

2. To determine water using systems associated with cost components: trace flows upstream or downstream. Use outlet flow when tracing downstream. If there are branching flows, the cost will be split accordingly weighted by flow.

3. Losses: During tracing (upstream or downstream), there could be losses in intermediate systems — e.g., when tracing intake source costs to the individual water using systems, water treatment steps in between can have losses. This should not affect the percentage ratios. (See Intake rule — How to attribute, Case C for the specific denominator rule that enforces this.)

---

## Cost Attribution

### 1. Intake Cost Components (e.g., City Water, Well Water)

- **What to follow:** Start at the intake node; go downstream through any water treatment units.
- **Where to stop:** At the first water using systems reached on each path. Do not continue into other users even if they later receive recycled water.
- **How to attribute:** Attribute the intake's cost among those first users by the volume each receives from that intake. The denominator used for this attribution depends on the path structure: ***[v2]***
  - **Case A — Intake splits to multiple paths:** Use the full intake outflow as the denominator for every path. Each path's systems absorb their proportional share; the remaining paths cover the rest. If a path routes through a treatment node that loses volume, that path's systems absorb the lost volume's cost the same way Case C does for a single-outflow intake: the path's intake contribution is prorated by each system's share of the treatment's total delivered outflow, not by each system's share of the path's raw (pre-loss) inflow. ***[v2]***
  - **Case B — Intake feeds a single treatment chain with no losses:** Use the full intake outflow as the denominator (the chain delivers all intake volume to systems, so results are identical either way). ***[v2]***
  - **Case C — Intake routes all its flow into one treatment path and that path loses volume (at any stage):** Use the treatment node's total outflow — the volume delivered to all downstream systems combined — as the denominator. Treatment may still fan out to multiple systems at the end; the denominator covers them all. This ensures 100% of intake cost is distributed, including the cost of water lost in treatment. ***[v2]***
- **Multi-source cap:** When a system draws from more than one intake, the fraction of any single path's flow attributed to that system is capped at 1.0. This prevents over-attribution; the system's responsibility from each intake is evaluated independently on each intake's own path iteration. ***[v2]***

#### Examples

- **Case A (split path, no losses):** City Water → RO → Process (5 MGY) and City Water → CT (3 MGY). City Water row = Process 62.5%, CT 37.5%.
- **Case B (single chain, no losses):** City Water (10 MGY) → Chlorination (10 in / 10 out) → Process (6 MGY) + Boiler (4 MGY). City Water row = Process 60%, Boiler 40%. Total = 100%. ***[v2]***
- **Case C (single chain, treatment losses):** City Water (10 MGY) → RO (10 in / 8 out) → Process (5 MGY) + Boiler (3 MGY). City Water row = Process 62.5% (5/8), Boiler 37.5% (3/8). Total = 100%. ***[v2]***
- **Case A with in-path treatment loss:** City Water (177.2 MGY total) → Chemical Treatment (49.2 in / 25 out, feeding only Cooling Tower) is one of several paths from City Water. Cooling Tower's fraction is 49.2/177.2 = 27.76% (the full 49.2 routed down this path), not 25/177.2 = 14.1% (the post-loss received volume). ***[v2]***

### 2. Water Treatment Cost Components (e.g., RO, CT Chlorination)

- **What to follow:** Start at the water treatment unit; go downstream (through any additional treatment) until you reach the first water-using systems.
- **Where to stop:** At the first users consuming the treated water.
- **How to attribute:** Attribute the treatment unit's cost across those users by the volume of treated water they receive from this unit. The block cost is calculated on the total volume entering the treatment node (inflow × unit cost). Attribution fractions are determined as follows: ***[v2]***
  - **Case E — Standard (no losses):** Attribute by each system's received flow as a share of total treatment inflow. Since inflow equals outflow in the no-loss case, either may serve as the denominator.
  - **Case F — Treatment has losses (outflow < inflow):** Use total treatment outflow as the denominator. This ensures all downstream systems collectively absorb 100% of the treatment cost, including the cost of water lost during treatment. The cost basis remains the full inflow block cost. ***[v2]***
- **Multi-source cap:** When a system receives treated water from more than one source, the fraction attributed from any single path is capped at 1.0. ***[v2]***
- **Series note:** If RO → Chlorination → Process, then both RO and Chlorination each create a row, and each row goes 100% to Process. No duplication occurs because each row is its own cost component.

#### Examples

- **Case E (no losses):** RO → Process (5 MGY) and RO → CT (2 MGY). RO row = Process 71.4% (5/7), CT 28.6% (2/7).
- **Case F (treatment losses):** RO (10 MGY in / 8 MGY out, 2 MGY internal loss) → Process (5 MGY) + CT (3 MGY). Block cost calculated on 10 MGY inflow. RO row = Process 62.5% (5/8), CT 37.5% (3/8). Total = 100%. ***[v2]***

### 3. Wastewater Treatment (WWT) Cost Components (e.g., Filtration, Flotation, pH)

Attribution runs in two sequential passes across all WWT nodes: the downstream pass completes for every WWT node before the upstream pass begins. This ordering ensures the full set of downstream (reuse) attributions is available when the upstream pass executes. ***[v2]***

- **What to follow:**
  - **Downstream pass (first):** From the WWT unit, follow treated water downstream until the first water-using systems receiving the recycled flow are reached. ***[v2]***
  - **Upstream pass (second):** From the WWT unit, follow contributing flow upstream until the first water-using systems that discharged into this WWT unit are reached. Systems already charged in the downstream pass are excluded from this pass. ***[v2]***
- **Case H — Where to allocate:**
  - Reuse portion → allocate to the downstream user(s) who receive the treated water, by their share of the WWT unit's total inflow.
  - Discharged portion → allocate back to the upstream discharger(s) that fed the WWT unit. The discharger's flow responsibility equals its raw flow contribution to the WWT, reduced by the total flow volume already attributed to downstream reuse systems in the first pass, expressed as a fraction of the WWT unit's total inflow. ***[v2]***
- **Multi-source cap:** The attribution fraction from any single path is capped at 1.0. ***[v2]***
- **Series note:** For chains like Filter → Flotation, handle each unit separately based on that unit's own inputs and outputs. The deduction mechanism isolates each unit's discharge remainder: the flow volume charged to reuse systems in Flotation's downstream pass is deducted from the upstream discharger's responsibility in Flotation's upstream pass. ***[v2]***

#### Examples

- **Case H:** WWT receives 10 MGY from System A. WWT outputs 6 MGY to System B (reuse) and 4 MGY to Municipal Sewer. Downstream pass: System B = 60% (6/10). Upstream pass: System A flow responsibility = 10 − 6 = 4 MGY; attribution fraction = 40% (4/10). Total = 100%.

### 4. Discharge Cost Components (e.g., Municipal Sewer, Storm Sewer, Discharge Fees)

- **What to follow:** Start at the discharge node; go upstream until you hit water using systems.
- **Where to stop:** At the first user encountered on each path (the final user causing the discharge). Do not charge upstream users whose water was reused before discharging.
- **Case J — How to attribute:** Attribute the discharge cost by how much final discharge each user causes to that discharge node.
- **Multi-source cap:** When a system routes water to more than one discharge node, the fraction attributed from any single path is capped at 1.0. ***[v2]***

#### Examples

- **Case J:** CT HVAC sends 7 MGY to Municipal Sewer; Wash Bay sends 3 MGY. "Municipal Sewer fee" row = CT HVAC 70%, Wash Bay 30%.

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
