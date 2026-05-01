# process-flow-diagram-component

A self-contained React + Redux diagram editor compiled as a browser-native **Custom Element** (Web Component). It is embedded inside an Angular application via a thin wrapper component. Domain logic is sourced from `src/process-flow-lib`.

---

## Purpose

Provides an interactive drag-and-drop diagram canvas for building water process flow networks. Features include:

- Add/remove/reconnect water system nodes (intake, discharge, treatment, systems, losses)
- Enter per-component data (flows, system type, energy, treatment)
- Real-time flow balance validation with visual error indicators
- Customizable edge styles and node colors
- Results sidebar displaying system-level and plant-level summaries
- Shadow DOM isolation so MUI and XYFlow styles never leak into the Angular shell

---

## Architecture Overview

```
Angular Shell
└── ProcessFlowDiagramWrapperComponent   (src/app/shared/process-flow-diagram-wrapper/)
    ├── Reads ProcessFlowParentState @Input
    ├── Sets <process-flow-diagram parentstate="..."> attribute
    └── Listens for updateDiagramDetailEvent custom event
        ↓
Custom Element  <process-flow-diagram>      (AppWebComponent.tsx)
├── Shadow DOM (MUI EmotionCache scoped here)
└── React 19 app (Redux store per instance)
    ├── Diagram.tsx            Main canvas (ReactFlow + drag-drop + connection handlers)
    ├── Nodes/                 Custom node renderers per component type
    ├── Edges/                 Custom edge renderers (Bezier, SmoothStep, Step, Straight)
    └── Drawer/                Sidebars (data entry, menu, customization)
        └── Forms/             Per-component data forms + water system estimation forms
```

---

## Directory Structure

```
process-flow-diagram-component/
├── README.md                      Build instructions and known issues
├── OVERVIEW.md                    This file
├── src/
│   ├── AppWebComponent.tsx        Custom Element definition and React root bootstrap
│   ├── App.tsx                    Redux Provider + top-level layout
│   ├── store/                     Redux store configuration and diagram slice
│   ├── hooks/                     useDiagramStateDebounce, useUserEventDebounce, redux hooks
│   ├── services/
│   │   ├── FlowCalculationService.ts   Orchestrates flow recalculation on state change
│   │   └── FlowService.ts             Low-level flow edge utilities
│   ├── validation/                Diagram validation helpers (thin wrappers over process-flow-lib)
│   └── components/
│       ├── Diagram/               <ReactFlow> canvas, drag-drop, connection callbacks
│       ├── Nodes/                 One subfolder per WaterProcessComponent type
│       ├── Edges/                 BezierEdge, SmoothStepEdge, StepEdge, StraightEdge renderers
│       └── Drawer/
│           ├── DataSidebar/       Right-panel: component data, results
│           ├── MenuSidebar/       Left-panel: component palette, settings, diagram notes
│           ├── CustomizeEdge/     Edge appearance controls
│           ├── CustomizeNode/     Node appearance controls
│           └── Forms/
│               ├── ComponentDataForm/        Generic form shell
│               ├── SourceFlowForm/           Intake source data
│               ├── DischargeFlowForm/        Discharge outlet data
│               ├── WaterTreatmentForm/       Treatment data
│               └── WaterSystemEstimation/   System-type-specific forms
│                   ├── ProcessUseForm/
│                   ├── CoolingTowerForm/
│                   ├── BoilerWaterForm/
│                   ├── KitchenRestroomForm/
│                   └── LandscapingForm/
├── webpack.config.js              Dev server (MFE mode)
└── webpack-build-mfe.config.js    Production web-component build
```

---

## Communication Contract

### Angular → React (Input)

The Angular wrapper serializes `ProcessFlowParentState` to JSON and sets it on the custom element's `parentstate` attribute. `AppWebComponent` observes this attribute via `observedAttributes` / `attributeChangedCallback` and passes it as props into the React tree.

```typescript
// ProcessFlowParentState shape
{
  context: 'water';
  parentContainer: { height: number; headerHeight: number; footerHeight: number };
  waterDiagram: {
    isValid: boolean;
    assessmentId?: number;
    flowDiagramData: FlowDiagramData;
  };
}
```

### React → Angular (Output)

When diagram state changes the component dispatches a `CustomEvent`:

```typescript
new CustomEvent('updateDiagramDetailEvent', {
  bubbles: true,
  composed: true,       // crosses shadow DOM boundary
  detail: ProcessFlowDiagramState
})
```

`composed: true` is required for the event to reach the Angular wrapper outside the shadow root.

```typescript
// ProcessFlowDiagramState shape
{
  context?: string;
  flowDiagramData: FlowDiagramData;
  waterDiagram?: WaterDiagram;
}
```

The Angular wrapper's `onUpdateDiagramState(event)` handler passes the payload to `ProcessFlowDiagramService`, which updates the parent `WaterProcessDiagramService`.

---

## State Management (Redux)

The Redux store is created fresh per web component instance (`configureAppStore(initialState)`).

### Store Slice: `diagram`

| Field | Type | Purpose |
|---|---|---|
| `nodes` | `DiagramNode[]` | XYFlow node array |
| `edges` | `Edge[]` | XYFlow edge array |
| `composedNodeData` | map | Child node data keyed by ID |
| `settings` | `DiagramSettings` | Flow precision, units, costs |
| `diagramOptions` | `UserDiagramOptions` | Display preferences |
| `nodeErrors` | `NodeErrors` | Validation output |
| `calculatedData` | `DiagramCalculatedData` | Computed flow totals per node |
| `selectedDataId` | `string \| null` | Currently selected node |
| `focusedEdgeId` | `string \| null` | Currently focused edge |
| `isDataDrawerOpen` | `boolean` | Right sidebar visibility |
| `isMenuDrawerOpen` | `boolean` | Left sidebar visibility |
| `isDialogOpen` | `boolean` | Modal dialog state |
| `diagramNotes` | `string` | Free-text diagram notes |
| `recentNodeColors` | `string[]` | MRU color palette for nodes |
| `recentEdgeColors` | `string[]` | MRU color palette for edges |

### Listener Middleware

A Redux listener watches for `addNode` actions and triggers `saveDiagramState()`, which debounces the full diagram state out to the Angular parent via `updateDiagramDetailEvent`.

---

## Key Patterns

### Custom Element Bootstrap

`AppWebComponent` extends `HTMLElement`. On `connectedCallback` it:
1. Attaches a shadow root
2. Creates a scoped MUI `EmotionCache` targeting the shadow root
3. Mounts a React root into a `<div>` inside the shadow root

On `attributeChangedCallback('parentstate', ...)` it re-renders with the new parsed state. On `disconnectedCallback` it unmounts the React root.

### XYFlow Integration

`Diagram.tsx` renders `<ReactFlow>` with:
- `nodeTypes` — maps `processComponentType` strings to custom React components (one per node type)
- `edgeTypes` — maps `UserDiagramOptions.edgeType` to custom edge renderers
- `onConnect` — calls `getEdgeFromConnection()` to create a typed edge with default flow data
- `onDrop` / `onDragOver` — converts screen coordinates via `reactFlowInstance.screenToFlowPosition()` and dispatches `addNode`
- `onReconnect` — calls `reconnectEdge()` and updates the store
- `nodesChange` / `edgesChange` — apply XYFlow's built-in change objects to the store

### Flow Recalculation

`FlowCalculationService` runs after every structural change (add/remove node or edge). It:
1. Builds a `GraphIndex` via `createGraphIndex(nodes, edges)`
2. Walks the graph to sum inflow and outflow for each node into `DiagramCalculatedData`
3. Dispatches `setCalculatedData` to the store
4. Triggers validation via `checkDiagramNodeErrors`

### Debounced Parent Updates

`useDiagramStateDebounce` watches `nodes`, `edges`, and `diagramNotes` and debounces emission of `updateDiagramDetailEvent` to avoid flooding the Angular parent on every keystroke or drag pixel.

### Shadow DOM and MUI

MUI components that use portals (Modal, Dialog, Popover, Tooltip) must target the shadow root's inner container, not `document.body`. The scoped `EmotionCache` handles CSS-in-JS injection. Components that open portals pass `container` or `disablePortal` props accordingly.

### Form Structure

Each node type has a dedicated form component rendered inside `DataSidebar`. The active form is determined by `selectedDataId` + the selected node's `processComponentType`. Forms dispatch Redux actions to update `composedNodeData`; changes propagate up on next `saveDiagramState` tick.

---

## Building

```bash
# Development (hot-reload MFE mode)
npm run dev

# Build standalone web component (production)
npm run build-web-component

# Build MFE bundle
npm run build-standalone
```

Output is placed in `dist/`. The Angular build picks up the compiled web component from this dist output.

> **Note:** When updating `package-lock.json` here, the Angular shell's `package-lock.json` must also be regenerated for CI to pass (see README Known Issues).

---

## Integration Point in Angular

The web component is consumed by `ProcessFlowDiagramWrapperComponent`:

```
src/app/shared/process-flow-diagram-wrapper/
├── process-flow-diagram-wrapper.component.ts   Angular wrapper
├── process-flow-diagram-wrapper.component.html <process-flow-diagram> element
├── process-flow-diagram.service.ts             BehaviorSubject bridge to parent service
└── process-flow-diagram-wrapper.module.ts      CUSTOM_ELEMENTS_SCHEMA, exports wrapper
```

The module uses `CUSTOM_ELEMENTS_SCHEMA` to suppress Angular's unknown-element warnings for `<process-flow-diagram>`.

The wrapper is used by `WaterProcessDiagramComponent` in the water assessment feature, which sets `processFlowParentState` from the current assessment's `FlowDiagramData` and subscribes to `updateDiagramDetailEvent` to persist changes back to IndexedDB.
