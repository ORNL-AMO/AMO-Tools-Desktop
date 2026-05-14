**Date Generated:** May 1, 2026

# True Cost Attribution Algorithm

**Entry point:** `getPlantSummaryResults` in `water/logic/results.ts:1447`

This document explains how the water assessment tool calculates "true cost" — the full annual cost attributable to each water-using system, including shared infrastructure costs that are proportionally distributed based on water flow.

---

## Concepts and Vocabulary

| Term | Meaning |
|---|---|
| **Cost component** | A diagram node that carries a monetary cost: `water-intake`, `water-discharge`, `water-treatment`, `waste-water-treatment` |
| **Block cost** | The total annual cost of a cost component (unit cost × total flow through the node) |
| **Water-using system** | A `WaterUsingSystem` node — the receiver of attributed costs |
| **True cost** | Direct costs (intake + discharge) + indirect costs (treatment, waste treatment, motor energy, heat energy) attributed to a system |
| **Direct cost** | Only intake + discharge costs attributed to a system |
| **Attribution fraction** | The proportion of a cost component's block cost assigned to a system (0–1) |
| **Adjusted attribution** | A user-supplied override fraction that replaces the computed default fraction |
| **Downstream** | Direction of water flow toward discharge |
| **Upstream** | Direction of water flow toward intake |
| **Reused water** | Water that flows from one water-using system to another |
| **Recycled water** | Water that flows from a waste water treatment unit back into a water-using system |

---

## Output Shape

`getPlantSummaryResults` returns `PlantResults`:

```typescript
{
  trueCostOfSystems: TrueCostOfSystems;           // per-system cost breakdown
  plantSystemSummaryResults: PlantSystemSummaryResults; // aggregated plant totals
  costComponentsTotalsMap: Record<string, BlockCosts>;  // block cost per cost component
  systemAttributionMap: SystemAttributionMap;      // audit trail of all attributions
}
```

**`TrueCostOfSystems`** — keyed by system node ID, each entry is:
```typescript
{
  intake: number,                  // attributed intake costs
  discharge: number,               // attributed discharge costs
  treatment: number,               // attributed treatment + in-system treatment costs
  wasteTreatment: number,          // attributed waste water treatment costs
  systemPumpAndMotorEnergy: number,// motor energy costs (system + attributed from intakes/discharges)
  heatEnergyWastewater: number,    // heat energy cost
  thirdParty: number,              // reserved, currently unused
  total: number                    // sum of all above
}
```

**`SystemAttributionMap`** — keyed by `[systemId][costComponentId]`, provides a full audit trail: which paths were walked, what fractions were computed, and whether an adjusted override is in effect.

---

## Algorithm Overview (Three Steps)

```
Step 1 — Build index and initialize
         ├── Create NodeGraphIndex (adjacency maps, edge maps)
         ├── Classify nodes by type
         ├── Initialize trueCostOfSystems[systemId] = all zeros
         └── For each cost component: compute block cost + pre-walk all paths

Step 2 — Apply costs (in this order)
         ├── applySystemIntakeCosts      downstream walk → first systems
         ├── applySystemDischargeCosts   upstream walk → first systems
         ├── applySystemTreatmentCosts   downstream walk → first systems
         └── applySystemWasteTreatmentCosts  dual walk (downstream reuse + upstream discharge)

Step 3 — Finalize per-system and plant totals
         ├── Add in-system treatment costs
         ├── Add motor and heat energy costs
         ├── Compute trueCostPerYear, directCostPerYear, cost-per-unit
         └── Aggregate to plant-level PlantSystemSummaryResults
```

---

## Step 1: Block Costs and Graph Paths

For each cost component node, two things are computed up front and stored in a `CostComponentMap` entry:

**Block cost** — total annual cost of the node:
```
blockCost = unitCostPerKGal × (totalFlow × 1000)
```
- Intake nodes: `totalFlow` = node's calculated outflow (water leaving the intake)
- All other cost components: `totalFlow` = node's calculated inflow

**Graph paths** — all paths from the node to all reachable leaves (downstream) or roots (upstream), represented as ordered arrays of edge IDs. These are computed once via DFS in `getAllDownstreamEdgePaths` / `getAllUpstreamEdgePaths` and stored on the `CostComponentPathData`.

The paths are the input to Step 2.

---

## Step 2: Cost Attribution — Shared Pattern

All four `applySystem*Costs` functions follow the same pattern. Understanding it once makes all four readable.

### The Core Walk

For each cost component, the algorithm iterates over its pre-computed paths. Each path is an ordered list of edge IDs from the cost component to a leaf/root node.

The walk examines each edge in the path in order, resolving the source or target node:
- Downstream walks (intake, treatment, WWT reuse): examine `edge.target` at each step
- Upstream walks (discharge, WWT discharge): examine `edge.source` at each step

The walk stops when it finds the **first `water-using-system`** on the path. The rule is: the system closest to the cost component bears the cost, not distant upstream/downstream systems. This prevents double-charging when water passes through multiple systems.

```
Intake → Treatment → System A → System B
         ↑ treatment cost           ↑ not charged (System A is first)
```

### Flow Fraction Calculation

Once a target system is found, the algorithm computes what fraction of the cost component's total block cost should be attributed to that system:

```
systemAttributionFraction = systemFlowResponsibility / blockCosts.totalFlow
costToSystem = systemAttributionFraction × blockCosts.totalBlockCost
```

Where `systemFlowResponsibility` is derived from edge flow values along the path.

**When there are no losses in an intermediate treatment node:**
```
fractionPathFlowReceived = min(systemEdgeFlow / firstEdgeFlow, 1)
systemFlowResponsibility = firstEdgeFlow × fractionPathFlowReceived
```
The cap at 1 prevents over-attribution when a system receives flow from multiple sources — each source handles its own share on a separate path iteration.

**When an intermediate treatment node has losses** (outflow < inflow):
```
systemAttributionFraction = systemEdgeFlow / treatmentOutflow
costToSystem = systemAttributionFraction × blockCosts.totalBlockCost
```
The cost basis remains the upstream inflow (full block cost), but attribution is split by share of the reduced outflow.

### De-duplication

A system can appear in multiple paths (e.g., if an intake feeds two treatment units that both feed the same system). The algorithm tracks `pathsAttributed: string[][]` — an array of edge-ID sequences already charged. If the current path from the cost component to the found system exactly matches a previously attributed path prefix, the walk is skipped. This prevents double-charging while still allowing legitimate multiple attributions from genuinely different paths.

### Adjusted Attributions

`systemAttributionMap` may carry a pre-existing `adjusted` fraction for a given system↔component pair (a user override). When this exists:
- The default computed fraction is still recorded (for auditing)
- The attribution is set aside in a local `adjustedAttributions` map
- After all paths are processed, adjusted attributions are applied using the override fraction instead of the computed one

```
costToSystem = adjustedFraction × blockCosts.totalBlockCost
```

---

## Step 2 Details: Per-Component-Type Rules

### Intake (`applySystemIntakeCosts`)

**Walk direction:** downstream from intake  
**Stop at:** first `water-using-system`

An intake's cost is attributed to the first water-using systems that receive its water. Intermediate treatment nodes are transparent (the walk passes through them).

**Treatment-chain limitation:** if two treatment nodes appear consecutively on the path (`Treatment A → Treatment B → System`), treatment chain losses are not fully supported. The algorithm detects this case via `hasTreatmentChain = true` and bypasses the loss-adjustment logic, falling back to standard flow-fraction attribution. See open TODOs #7410, #7423.

**Pump/motor energy:** a proportional share of the intake node's motor energy costs is also attributed to the system using the same `systemAttributionFraction`.

### Discharge (`applySystemDischargeCosts`)

**Walk direction:** upstream from discharge  
**Stop at:** first `water-using-system`

A discharge's cost is attributed to the final user that caused the discharge — the system immediately upstream. Systems further upstream that reused water are **not** charged for a discharge they did not directly cause.

**Pump/motor energy:** similarly attributed by fraction.

### Water Treatment (`applySystemTreatmentCosts`)

**Walk direction:** downstream from treatment node  
**Stop at:** first `water-using-system`

Treatment costs flow to the systems that consume the treated water. If a single treatment unit feeds multiple systems, the cost is split by the fraction of treated water each receives.

**Series treatment:** each treatment node in a chain (RO → Chlorination → System) creates its own independent block cost row. Each is attributed 100% to the downstream system independently — no duplication occurs because each row is its own cost component.

### Waste Water Treatment (`applySystemWasteTreatmentCosts`)

WWT nodes are unique: their output may go to reuse (back to a water-using system) or to discharge, and costs must be split accordingly. This requires **two sequential passes**:

**Pass 1 — Downstream (reuse portion):**  
Walk downstream from the WWT node. Find first water-using systems receiving recycled water. Attribute cost proportional to recycled flow fraction. Record these systems and their charged flow portions in `downstreamTreatmentAttributionMap`.

**Pass 2 — Upstream (discharge portion):**  
Walk upstream from the WWT node. Find first water-using systems that sent water into the WWT. Attribute the remaining cost (total minus what was already charged downstream) to these upstream originators.

The key subtraction:
```
systemFlowResponsibility = upstreamEdgeFlow − totalDownstreamChargedPortion
systemAttributionFraction = systemFlowResponsibility / blockCosts.totalFlow
```

This ensures the total attribution across both passes sums to 1.0 for a lossless WWT node.

---

## Step 3: Per-System Finalization

After all cost components have been attributed, each system's record is finalized:

**In-system treatment cost:**  
Treatment units attached directly inside a system (`WaterUsingSystem.inSystemTreatment`) treat 100% of the system's inflow. Cost = sum of each in-system treatment's unit cost × total system inflow.

**Heat energy cost:**  
`Q = [V × ρ × Cp × (Tout − Tin)] / η × fuelCost`  
where V = total system inflow, ρ = water density, Cp = specific heat, η = heater efficiency.

**Motor energy cost (system-level):**  
System's own pump/motor entries are summed. This overwrites the accumulated attribution-path motor energy with a fresh direct calculation.

**Derived metrics per system:**
```
directCostPerYear = trueCostOfSystems[id].intake + trueCostOfSystems[id].discharge
directCostPerUnit = directCostPerYear / (sourceWaterIntake × 1000)
trueCostPerYear   = directCosts + treatment + wasteTreatment + motorEnergy + heatEnergy
trueCostPerUnit   = trueCostPerYear / (sourceWaterIntake × 1000)
trueOverDirect    = trueCostPerYear / directCostPerYear
```

**Plant-level aggregation:**  
All system results are summed into `plantSystemSummaryResults`. Plant-level `directCostPerUnit` and `trueCostPerUnit` use the plant's total intake flow as the denominator.

---

## Data Flow Diagram

```
nodes + edges
      │
      ▼
createGraphIndex()
      │ NodeGraphIndex
      ▼
 ┌────────────────────────────────────────────┐
 │ STEP 1: For each cost component node:      │
 │   blockCosts = unitCost × flow             │
 │   paths = DFS(node → leaves/roots)         │
 └────────────────────┬───────────────────────┘
                      │ CostComponentMap (blockCosts + paths per node)
                      ▼
 ┌────────────────────────────────────────────┐
 │ STEP 2:                                    │
 │   applySystemIntakeCosts()     ──────────► trueCostOfSystems[id].intake
 │   applySystemDischargeCosts()  ──────────► trueCostOfSystems[id].discharge
 │   applySystemTreatmentCosts()  ──────────► trueCostOfSystems[id].treatment
 │   applySystemWasteTreatmentCosts() ──────► trueCostOfSystems[id].wasteTreatment
 │                                            systemAttributionMap (audit trail)
 └────────────────────┬───────────────────────┘
                      │ trueCostOfSystems (partially filled)
                      ▼
 ┌────────────────────────────────────────────┐
 │ STEP 3: For each water-using system:       │
 │   add in-system treatment cost             │
 │   add heat energy cost                     │
 │   add motor energy cost                    │
 │   compute directCostPerYear, trueCostPerYear│
 │   compute per-unit metrics                 │
 │   accumulate → plantSystemSummaryResults   │
 └────────────────────┬───────────────────────┘
                      │
                      ▼
               PlantResults
```

---

## Debugging

Set `DEBUG_SYSTEM_ATTRIBUTION = true` at `results.ts:1731` to enable verbose console logging for every attribution event. Each log entry shows:

- Which system is being charged
- Which cost component is being attributed
- The current path (as both edge IDs and human-readable edge descriptions)
- `systemFlowResponsibility`, `systemAttributionFraction`, and `costToSystem`
- All path attributions accumulated so far for that system↔component pair

Adjusted attribution events are logged separately with a `$$$` prefix.

---

## Known Limitations and Open TODOs

| Issue | Description | Reference |
|---|---|---|
| Treatment chain losses | When two treatment nodes appear consecutively on a path, intake cost attribution with losses is bypassed and falls back to simple flow fractions | `results.ts:786`, TODOs #7410, #7423 |
| WWT chain accuracy | WWT nodes in a series use per-unit attribution; complex chains may have edge cases | `results.ts:1197` |
| `setWaterUsingSystemFlows` | The function that populates `systemFlowTotals` on each system is marked as needing maintenance and may have incorrect logic | `results.ts:134` |
| `systemPumpAndMotorEnergy` overwrite | Step 3 re-calculates motor energy directly on the system, potentially overwriting the accumulated attribution-path energy from Step 2 | `results.ts:1641` |
| Empty result types | `WaterResults`, `ExecutiveSummaryReport`, `SystemSummaryReport` are declared but unpopulated placeholders | `types/results.ts` |
