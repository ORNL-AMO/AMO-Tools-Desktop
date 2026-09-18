**Date Generated:** May 1, 2026

# process-flow-lib

Domain logic and type definitions for the MEASUR water process flow diagram feature. This library is framework-agnostic TypeScript, consumed by both the Angular shell and the React diagram web component.

---

## Purpose

Provides:
- **Canonical type definitions** for all diagram entities (nodes, edges, components, settings, results)
- **Factory functions** for creating correctly-initialized component instances
- **Graph traversal utilities** for walking upstream/downstream paths in a flow network
- **Calculation engine** for water balance, system results, and true cost attribution
- **Validation logic** for detecting flow imbalances and component errors
- **Unit conversion** helpers (Imperial ↔ Metric, flow metrics)
- **Constants** (treatment type options, unit maps, node styling)

All public symbols are re-exported from `index.ts`, so consumers import from a single entry point.

---

## Directory Structure

```
src/process-flow-lib/
├── index.ts                       Root barrel — all public exports
├── graph.ts                       Graph traversal (upstream/downstream path finding)
├── package.json
├── tsconfig.json
└── water/
    ├── constants.ts               Enums, option arrays, unit maps, node styling
    ├── types/
    │   ├── assessment.ts          WaterAssessment, WaterSystemBasics, Modification
    │   ├── diagram.ts             FlowDiagramData, DiagramNode, ProcessFlowPart, handles, settings
    │   ├── results.ts             Cost structures: TrueCostOfSystems, PlantSystemSummaryResults, etc.
    │   └── water-components.ts    All WaterProcessComponent subtypes and their result types
    └── logic/
        ├── water-components.ts    Component factories and flow edge utilities
        ├── results.ts             Water balance, system results, and cost attribution engine
        ├── validation.ts          Flow validation and node error accumulation
        └── utils.ts               ID generation, flow conversion, null-safety helpers
```

---

## Key Concepts

### Component Types

Every diagram node has a `processComponentType` discriminant. The union `WaterProcessComponent` covers:

| Type | Description |
|---|---|
| `intake-source` | Water entry point (municipal, groundwater, ocean, etc.) |
| `discharge-outlet` | Water exit point (sewer, river, disposal, etc.) |
| `water-using-system` | A facility system that uses and/or recirculates water |
| `water-treatment` | Pre-use treatment step |
| `waste-water-treatment` | Post-use treatment step (may reuse or discharge) |
| `known-loss` | Explicitly modeled water loss |
| `summing-node` | Flow aggregation point |

`WaterUsingSystem` nodes carry a nested `systemType` that further discriminates into `ProcessUse`, `CoolingTower`, `BoilerWater`, `KitchenRestroom`, and `Landscaping`, each with its own input and result type.

### Diagram State

`FlowDiagramData` is the top-level serializable state:

```typescript
{
  nodes: DiagramNode[];      // @xyflow/react nodes wrapping ProcessFlowPart data
  edges: Edge[];             // @xyflow/react edges with CustomEdgeData
  diagramFlowErrors: DiagramFlowErrors; // validation output, keyed by node ID
  settings: DiagramSettings; // flow precision, units, costs, conductivity units
  diagramOptions: UserDiagramOptions; // display preferences
  calculatedData: DiagramCalculatedData; // flow totals keyed by node ID
}
```

`DiagramNode` wraps `ProcessFlowPart` in the XYFlow `Node<ProcessFlowPart>` generic — all water-domain data lives in `node.data`.

### Graph Utilities (`graph.ts`)

`createGraphIndex(nodes, edges)` builds lookup maps in a single pass:
- `parentMap` / `childMap` — adjacency by node ID
- `edgeMap` — edge lookup by ID
- `nodeMap` — node lookup by ID

`getAllUpstreamEdgePaths` / `getAllDownstreamEdgePaths` perform DFS from any node to the roots (intakes) or leaves (discharges), returning all edge-path arrays. These paths drive the cost attribution algorithm.

---

## Usage Patterns

### Creating a New Component

```typescript
import { getNewProcessComponent, getIntakeSource } from 'process-flow-lib';

// Generic factory (sets defaults, no assessment context)
const part = getNewProcessComponent('water-treatment');

// Assessment-aware factories (accept WaterSystemBasics for unit/cost defaults)
const intake = getIntakeSource(systemBasics);
const system = getWaterUsingSystem(systemBasics);
```

### Creating an XYFlow Node

```typescript
import { getNewNode } from 'process-flow-lib';

const node = getNewNode(part, { x: 200, y: 100 });
// Returns Node<ProcessFlowPart> ready for ReactFlow nodes array
```

### Running Calculations

```typescript
import { getPlantSummaryResults, getWaterBalanceResults } from 'process-flow-lib';

// Water balance (inflow / outflow / estimated losses per system)
const balanceResults = getWaterBalanceResults(flowDiagramData, WaterAssessmentInstance);

// Full plant summary with true cost attribution
const summary = getPlantSummaryResults(flowDiagramData, waterAssessment, WaterAssessmentInstance);
```

`getPlantSummaryResults` runs a three-step algorithm:
1. **Set block costs** — calculate total cost for each intake, discharge, and treatment node
2. **Apply costs** — distribute costs downstream (intakes) or upstream (discharges) along all graph paths, weighted by flow fraction
3. **Aggregate** — sum energy, in-system treatment, and attributed costs per `WaterUsingSystem`

### Validating a Diagram

```typescript
import { checkDiagramNodeErrors, getIsDiagramValid } from 'process-flow-lib';

const errors = checkDiagramNodeErrors(nodes, edges, settings);
const isValid = getIsDiagramValid(errors);
```

Validation checks:
- Source nodes: outflow must match calculated outflow
- Discharge nodes: inflow must match calculated inflow
- Known-loss nodes: sum of individual losses must match parent system's stated total
- All numeric checks use `settings.flowDecimals` precision tolerance

### Unit Conversion

```typescript
import { convertFlowDiagramData } from 'process-flow-lib';

// Switch entire diagram between Imperial and Metric
const converted = convertFlowDiagramData(flowDiagramData, targetUnitsAreMetric);
```

`convertFlowValue(value, toMetric)` uses 3785.4118 gal/m³ as the conversion factor.

---

## Patterns

### Factory Pattern

All component constructors are factory functions (`get*`) rather than `new ClassName()`. Factories enforce required defaults and accept only the minimal parameters needed at creation time. This keeps construction logic centralized and avoids partially-initialized objects.

### Discriminated Union Dispatch

Component-type-specific logic uses `switch (component.processComponentType)` or `switch (system.systemType)`. Adding a new component type requires updating the union in `water-components.ts` and all relevant switch statements — TypeScript exhaustiveness checking surfaces the gaps.

### Cost Attribution via Graph Paths

The true-cost engine attributes shared infrastructure costs (intake, discharge, treatment) to individual water-using systems proportionally by flow fraction:

1. Find all edge paths from a cost node to every downstream/upstream system.
2. For each path, calculate `fraction = pathFlow / totalFlow`.
3. Multiply the block cost by the fraction and accumulate onto the system.
4. Handle adjusted attributions (user overrides) separately from computed ones.

See `applySystemIntakeCosts`, `applySystemDischargeCosts`, `applySystemTreatmentCosts`, and `applySystemWasteTreatmentCosts` in `water/logic/results.ts`.

### Calculation Delegation

System-specific calculations that depend on complex thermodynamics (cooling tower evaporation, boiler blowdown, landscaping irrigation) are delegated to `WaterAssessmentInstance`, a WASM-backed native object. The lib defines the input/output types; the native code does the physics.

### Edge ID Encoding

`getNewEdgeId(sourceId, sourceHandle, targetId, targetHandle)` encodes all four values into the edge ID string with `--` delimiters. `getConnectionFromEdgeId` decodes it. This enables reconnection and handle-lookup without a separate lookup table.

---

## Important Notes

- `results.ts` (~1800 lines) is the most complex file. It contains the complete cost attribution algorithm with extensive inline comments describing the algorithm evolution (Dec 2025).
- Several `WaterResults` / `ExecutiveSummaryReport` types are declared but empty — they are placeholders for upcoming reporting features.
- Treatment-chain losses are partially supported; open TODOs reference issues #7410, #7423, #7432, #7433, #7481.
- `DEBUG_SYSTEM_ATTRIBUTION` flag in `results.ts` gates verbose `console.log` tracing of the cost attribution walk.
