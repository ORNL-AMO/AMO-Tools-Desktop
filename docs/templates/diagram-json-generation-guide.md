# Water Diagram JSON Generation Guide

## Purpose

This guide documents how to generate importable water diagram JSON files (the format produced by MEASUR's export and consumed by its import) from either:

1. A written configuration spec, such as the "Supported Configurations" section of `src/process-flow-lib/docs/true-cost/algorithm/ro-specification.md`.
2. Test fixtures in `process-flow-diagram-component/src/__tests__/plant-summary.test.ts`, built with the helpers in `process-flow-diagram-component/src/__fixtures__/builders.ts`.

The output is a single JSON file with a `diagrams` array, importable into the app and openable in the diagram editor to visually confirm the configuration and its computed attribution.

A working example produced with this method is `output/ro-configuration-diagrams.json`, covering the 8 supported RO (Reverse Osmosis) configurations from `ro-specification.md`.

---

## Procedure

Follow these steps in order when asked to generate diagram JSON from a prompt:

1. **Identify the input type and the configurations in scope.** Is the request pointing at a written spec doc (a `*-specification.md` file, an ASCII arrow diagram, or a plain-English description), at test fixtures in `plant-summary.test.ts`, or at a description typed directly in the prompt? List out, by name, which distinct configurations need a diagram. If the request is ambiguous about scope (e.g. "generate diagrams for the RO spec" when the spec has both supported and non-qualifying configurations), ask before generating all of them.
2. **Build one `spec` object per configuration.** Use [Mode 1](#mode-1-generating-a-spec-from-a-written-configuration-description) for written descriptions, [Mode 2](#mode-2-generating-a-spec-from-a-plant-summarytestts-fixture) for test fixtures. Each `spec` needs `diagramName`, `nodes` (`key`, `type`, `name`, `cost`, `treatmentType` where relevant), and `edges` (`from`, `to`, `flow`). Consult [Node schema](#node-schema) for the exact field set and defaults per type before filling these in, don't guess field names.
3. **Get the generator script in hand.** Copy the script from [Reusable generator (JavaScript)](#reusable-generator-javascript), or reuse an existing copy already saved in this repo/session if one exists and matches the current version. Append the `specs` array built in step 2 and the closing `diagrams`/`fs.writeFileSync` call shown in the commented-out lines at the bottom of that script.
4. **Fill in the full `settings` boilerplate block.** The script's `settings` return value is intentionally truncated; before running, replace it with the complete object, copied from an existing generated file such as `output/ro-configuration-diagrams.json`, changing only `diagramId`/`id` per diagram.
5. **Run the script** (`node <script>.js`) and confirm it reports the expected diagram count.
6. **Run the [Validation checklist](#validation-checklist)** against the generated JSON (orphan edges, duplicate handles, handle/edge-count match, flow-field completeness, deliberate `treatmentType`, `diagramId` consistency). Fix and re-run rather than shipping a file that fails any check.
7. **Write the output to the location the user asked for** (e.g. `output/<name>.json` for an app-importable file), and report back which configurations are included, using the same descriptive names as `spec.diagramName`.

---

## Top-level file shape

```json
{
    "directories": [],
    "assessments": [],
    "calculators": [],
    "inventories": [],
    "diagrams": [
        { "diagram": { ... }, "settings": { ... } }
    ],
    "origin": "AMO-TOOLS-DESKTOP"
}
```

Each entry in `diagrams` pairs a `diagram` object (the diagram itself, holding `waterDiagram.flowDiagramData.nodes`/`edges`) with a `settings` object (a full app-settings snapshot; mostly boilerplate, but `diagramId` must match `diagram.id`).

---

## Node schema

Every node has this outer shape:

```json
{
  "id": "n_xxxxxxx",
  "type": "<camelCase render type>",
  "position": { "x": 0, "y": 0 },
  "className": "<kebab-case processComponentType>",
  "data": { ... },
  "style": { "backgroundColor": "#...", "color": "#..." },
  "measured": { "width": 221, "height": 71 }
}
```

**Two different casings matter and are not interchangeable:**

| Concept | Casing | Read by |
|---|---|---|
| `node.type` (outer) | camelCase (`waterIntake`, `waterUsingSystem`, `waterDischarge`, `waterTreatment`, `wasteWaterTreatment`) | React Flow's renderer, to pick the component (`process-flow-diagram-component/src/components/Diagram/FlowTypes.ts`) |
| `data.processComponentType` (inner) | kebab-case (`water-intake`, `water-using-system`, `water-discharge`, `water-treatment`, `waste-water-treatment`) | The true-cost algorithm (`src/process-flow-lib/water/logic/results.ts`), which never reads `node.type` |

Both must be set correctly. The mapping between them is `getAdaptedTypeString()` in `process-flow-diagram-component/src/components/Diagram/FlowUtils.ts:137`.

### Per-type data fields and style

| Type (`processComponentType`) | Style | Extra `data` fields beyond the common base | Handles |
|---|---|---|---|
| `water-intake` | `#75a1ff` / `#000000` | `disableInflowConnections: true`, `sourceType: 0`, `annualUse: 0` | outflow only, keys `e,f,g,h,i,j,k,l` (max 8) |
| `water-using-system` | `#00bbff` / `#ffffff` | `systemType: 0`, `inSystemTreatment: []` | inflow `a,b,c,d` + outflow `e,f,g,h` (max 4 each) |
| `water-discharge` | `#7f7fff` / `#ffffff` | `disableOutflowConnections: true`, `sourceType: 0`, `annualUse: 0` | inflow only, keys `a,b,c,d,e,f,g,h` (max 8) |
| `water-treatment` | `#009386` / `#ffffff` | `treatmentType: <number>` (6 = Reverse Osmosis, see `src/process-flow-lib/water/constants.ts:19`), `flowValue: 0` | inflow `a,b,c,d` + outflow `e,f,g,h` (max 4 each) |
| `waste-water-treatment` | `#93e200` / `#000000` | none beyond the common base | inflow `a,b,c,d` + outflow `e,f,g,h` (max 4 each) |

Common `data` base fields on every node type:

```json
{
  "processComponentType": "<kebab-case type>",
  "createdByAssessment": false,
  "name": "<label>",
  "className": "<kebab-case type>",
  "cost": <number, cost per kGal>,
  "isValid": true,
  "userEnteredData": { ... },
  "diagramNodeId": "<same as node.id>",
  "modifiedDate": "<ISO timestamp>",
  "handles": { ... },
  "addedMotorEnergy": []
}
```

`cost` is only meaningful on `water-intake`, `water-treatment`, `waste-water-treatment`, and `water-discharge` (the four cost-bearing components in the true-cost algorithm). `water-using-system` nodes keep `cost: 0`; they are cost recipients, not cost sources.

### `handles` object

`handles` mirrors which connection points are enabled, keyed by the letters above, each `true`/`false`. Only turn on as many as are actually wired by edges (at minimum 2 per direction to match app defaults), in letter order starting from the first letter of that direction. Example for a `water-treatment` node with 2 inflow edges and 3 outflow edges:

```json
"handles": {
  "inflowHandles": { "a": true, "b": true, "c": false, "d": false },
  "outflowHandles": { "e": true, "f": true, "g": true, "h": false }
}
```

### `userEnteredData`, Total Flow fields

This is where the "Total Flow" values shown in the app come from. The rule is per-node, based on which sides of the node actually have edges, not on node type:

- If the node has **any inflow edge(s)**, set `userEnteredData.totalSourceFlow` = sum of the flow values on those inflow edges.
- If the node has **any outflow edge(s)**, set `userEnteredData.totalDischargeFlow` = sum of the flow values on those outflow edges.

A pass-through node (system, treatment, WWT) with edges on both sides gets **both** fields. A pure source (`water-intake`, or any node with no upstream edge) gets only `totalDischargeFlow`. A pure sink (`water-discharge`) gets only `totalSourceFlow`. Do not default to setting only one field per node type; verify every node against its actual edge list (see Validation below).

---

## Edge schema

```json
{
  "animated": false,
  "type": "smoothstep",
  "source": "<source node id>",
  "sourceHandle": "<letter>",
  "target": "<target node id>",
  "targetHandle": "<letter>",
  "markerEnd": { "type": "arrowclosed", "width": 25, "height": 25 },
  "data": {
    "flowValue": <number>,
    "hasOwnEdgeType": "",
    "edgeDescription": "edge-desc__<sourceId>-<targetId>"
  },
  "style": { "stroke": "#6c757d", "strokeWidth": 2 },
  "id": "xy-edge__<sourceId><sourceHandle>-<targetId><targetHandle>"
}
```

Only `data.flowValue` is read by the algorithm; the rest is cosmetic but expected by the diagram editor. `sourceHandle`/`targetHandle` must be assigned in edge-declaration order per node (first outgoing edge from a node gets its first outflow letter, second gets the next, etc.), and must not collide with another edge on the same handle.

---

## Layout

Position nodes by rank (longest path from any node with no inflow), left to right:

- `x = 200 + depth * 380`
- `y = 100 + (index within that column) * 170`

This keeps intake on the left and discharges on the right without manual placement, and scales to any number of parallel branches.

---

## Reusable generator (JavaScript)

The script below is the generalized core used to build `output/ro-configuration-diagrams.json`. Feed it a list of `specs` (see the two input modes below) and it produces a fully-formed import file.

```js
const fs = require('fs');
const path = require('path');

const APP_VERSION = '1.8.0'; // keep in sync with package.json "version"
const NOW = new Date().toISOString();

const STYLE = {
  'water-intake': { backgroundColor: '#75a1ff', color: '#000000' },
  'water-using-system': { backgroundColor: '#00bbff', color: '#ffffff' },
  'water-discharge': { backgroundColor: '#7f7fff', color: '#ffffff' },
  'water-treatment': { backgroundColor: '#009386', color: '#ffffff' },
  'waste-water-treatment': { backgroundColor: '#93e200', color: '#000000' },
};

const TYPE_ADAPT = {
  'water-intake': 'waterIntake',
  'water-using-system': 'waterUsingSystem',
  'water-discharge': 'waterDischarge',
  'water-treatment': 'waterTreatment',
  'waste-water-treatment': 'wasteWaterTreatment',
};

const OUTFLOW_LETTERS = {
  'water-intake': ['e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
  'water-using-system': ['e', 'f', 'g', 'h'],
  'water-treatment': ['e', 'f', 'g', 'h'],
  'waste-water-treatment': ['e', 'f', 'g', 'h'],
};

const INFLOW_LETTERS = {
  'water-discharge': ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  'water-using-system': ['a', 'b', 'c', 'd'],
  'water-treatment': ['a', 'b', 'c', 'd'],
  'waste-water-treatment': ['a', 'b', 'c', 'd'],
};

function buildHandles(type, inflowCount, outflowCount) {
  const handles = {};
  if (INFLOW_LETTERS[type]) {
    handles.inflowHandles = {};
    INFLOW_LETTERS[type].forEach((l, i) => { handles.inflowHandles[l] = i < Math.max(inflowCount, 2); });
  }
  if (OUTFLOW_LETTERS[type]) {
    handles.outflowHandles = {};
    OUTFLOW_LETTERS[type].forEach((l, i) => { handles.outflowHandles[l] = i < Math.max(outflowCount, 2); });
  }
  return handles;
}

function nodeId() {
  return 'n_' + Math.random().toString(36).slice(2, 9);
}

// spec.nodes: [{ key, type, cost, treatmentType, name }]
// spec.edges: [{ from, to, flow }]
function buildDiagram(spec, diagramNumId, settingsId) {
  const keyToId = {};
  spec.nodes.forEach(n => { keyToId[n.key] = nodeId(); });

  const outflowCounts = {}, inflowCounts = {}, outflowSums = {}, inflowSums = {};
  spec.edges.forEach(e => {
    outflowCounts[e.from] = (outflowCounts[e.from] || 0) + 1;
    inflowCounts[e.to] = (inflowCounts[e.to] || 0) + 1;
    outflowSums[e.from] = (outflowSums[e.from] || 0) + e.flow;
    inflowSums[e.to] = (inflowSums[e.to] || 0) + e.flow;
  });

  const depth = {};
  function getDepth(key) {
    if (depth[key] !== undefined) return depth[key];
    const incoming = spec.edges.filter(e => e.to === key);
    if (incoming.length === 0) { depth[key] = 0; return 0; }
    const d = 1 + Math.max(...incoming.map(e => getDepth(e.from)));
    depth[key] = d;
    return d;
  }
  spec.nodes.forEach(n => getDepth(n.key));

  const columnCounts = {};
  const nodes = spec.nodes.map(n => {
    const col = depth[n.key];
    const row = columnCounts[col] || 0;
    columnCounts[col] = row + 1;
    const x = 200 + col * 380, y = 100 + row * 170;

    const handles = buildHandles(n.type, inflowCounts[n.key] || 0, outflowCounts[n.key] || 0);
    const id = keyToId[n.key];

    const userEnteredData = {};
    if (inflowCounts[n.key]) userEnteredData.totalSourceFlow = inflowSums[n.key];
    if (outflowCounts[n.key]) userEnteredData.totalDischargeFlow = outflowSums[n.key];

    const cost = n.type === 'water-using-system' ? 0 : (n.cost !== undefined ? n.cost : 1);

    const data = {
      processComponentType: n.type,
      createdByAssessment: false,
      name: n.name,
      className: n.type,
      cost,
      isValid: true,
      userEnteredData,
      diagramNodeId: id,
      modifiedDate: NOW,
      handles,
      addedMotorEnergy: [],
    };

    if (n.type === 'water-intake') {
      data.disableInflowConnections = true; data.sourceType = 0; data.annualUse = 0;
    } else if (n.type === 'water-discharge') {
      data.disableOutflowConnections = true; data.sourceType = 0; data.annualUse = 0;
    } else if (n.type === 'water-using-system') {
      data.systemType = 0; data.inSystemTreatment = [];
    } else if (n.type === 'water-treatment') {
      data.treatmentType = n.treatmentType !== undefined ? n.treatmentType : 0;
      data.flowValue = 0;
    }

    return { id, type: TYPE_ADAPT[n.type], position: { x, y }, className: n.type, data,
      style: STYLE[n.type], measured: { width: 221, height: 71 } };
  });

  const outUsed = {}, inUsed = {};
  const edges = spec.edges.map(e => {
    const sourceId = keyToId[e.from], targetId = keyToId[e.to];
    const sourceType = spec.nodes.find(n => n.key === e.from).type;
    const targetType = spec.nodes.find(n => n.key === e.to).type;
    const outIdx = outUsed[e.from] || 0; outUsed[e.from] = outIdx + 1;
    const inIdx = inUsed[e.to] || 0; inUsed[e.to] = inIdx + 1;
    const sourceHandle = OUTFLOW_LETTERS[sourceType][outIdx];
    const targetHandle = INFLOW_LETTERS[targetType][inIdx];
    return {
      animated: false, type: 'smoothstep', source: sourceId, sourceHandle, target: targetId, targetHandle,
      markerEnd: { type: 'arrowclosed', width: 25, height: 25 },
      data: { flowValue: e.flow, hasOwnEdgeType: '', edgeDescription: `edge-desc__${sourceId}-${targetId}` },
      style: { stroke: '#6c757d', strokeWidth: 2 },
      id: `xy-edge__${sourceId}${sourceHandle}-${targetId}${targetHandle}`,
    };
  });

  const paletteColors = ['#75a1ff', '#00bbff', '#7f7fff', '#009386', '#93e200'];

  return {
    diagram: {
      createdDate: NOW, modifiedDate: NOW, name: spec.diagramName, appVersion: APP_VERSION,
      type: 'Water', directoryId: 1,
      waterDiagram: {
        isValid: true,
        flowDiagramData: {
          name: 'Water Process Diagram', nodes, diagramFlowErrors: {}, edges,
          settings: { electricityCost: 0.066, fuelCost: 3.99, flowDecimalPrecision: 2, unitsOfMeasure: 'Imperial', conductivityUnit: 'mmho' },
          userDiagramOptions: { strokeWidth: 2, edgeType: 'smoothstep', minimapVisible: false, controlsVisible: true,
            directionalArrowsVisible: true, showFlowLabels: true, flowLabelSize: 1, animated: false, paletteColors },
          calculatedData: { nodes: {} }, recentNodeColors: paletteColors, recentEdgeColors: paletteColors,
        },
      },
      id: diagramNumId, selected: false,
    },
    settings: { /* full app settings snapshot; see output/ro-configuration-diagrams.json for the boilerplate block */
      diagramId: diagramNumId, id: settingsId,
    },
  };
}

// --- fill in `specs` per the two modes below, then: ---
// const diagrams = specs.map((spec, i) => buildDiagram(spec, 101 + i, 201 + i));
// fs.writeFileSync(path.join(__dirname, 'out.json'), JSON.stringify(
//   { directories: [], assessments: [], calculators: [], inventories: [], diagrams, origin: 'AMO-TOOLS-DESKTOP' },
//   null, 4));
```

The `settings` object in the snippet above is truncated for readability; copy the full boilerplate block (currency, units, tutorial-disable flags, emissions defaults, etc.) from an existing generated file such as `output/ro-configuration-diagrams.json` and only change `diagramId`/`id` per diagram. None of the other fields vary between diagrams in this use case.

---

## Mode 1: generating a spec from a written configuration description

Written configurations (e.g. the ASCII arrow diagrams in a `*-specification.md` file, or a plain-English description like "intake feeds two systems, one discharges directly, the other goes through a shared WWT with a third independent system") map directly to `spec.nodes` / `spec.edges`:

1. Each named component (Intake, RO, System A, WWT, Discharge) becomes one entry in `spec.nodes`, with a short `key`, its `type`, a `name` label, and `cost` if relevant to the point being illustrated.
2. Each arrow becomes one entry in `spec.edges`, `{ from: <key>, to: <key>, flow: <number> }`. Pick flow numbers that are internally consistent (a node's total inflow should equal its total outflow unless the configuration specifically models a loss) and, where the spec gives concrete worked-example numbers, reuse those numbers so the diagram matches the doc's math exactly.
3. Give the diagram a descriptive name identifying which configuration it demonstrates (e.g. `"RO Config 4 - Reject Path Through WWT"`), so multiple diagrams in one import file stay distinguishable in the app's diagram list.
4. If a component in the description needs a treatment-type flag (e.g. Reverse Osmosis), set `treatmentType` on that node (`6` for RO; see `src/process-flow-lib/water/constants.ts` for the full `waterTreatmentTypeOptions` list).

## Mode 2: generating a spec from a `plant-summary.test.ts` fixture

Test fixtures already describe a diagram in code; the mapping to `spec` is close to mechanical:

| Test fixture element | Maps to |
|---|---|
| `makeIntakeNode('id', cost)` | `{ key: 'id', type: 'water-intake', cost, name: <descriptive label> }` |
| `makeSystemNode('id')` | `{ key: 'id', type: 'water-using-system', name: <descriptive label> }` |
| `makeDischargeNode('id', cost)` | `{ key: 'id', type: 'water-discharge', cost, name: <descriptive label> }` |
| `makeTreatmentNode('id', cost, treatmentType)` | `{ key: 'id', type: 'water-treatment', cost, treatmentType, name: <descriptive label> }` |
| `makeWasteTreatmentNode('id', cost)` | `{ key: 'id', type: 'waste-water-treatment', cost, name: <descriptive label> }` |
| `makeEdge('from', 'to', flowValue)` | `{ from, to, flow: flowValue }` |

Notes specific to translating tests:

- Test node ids (`'sysA'`, `'ro'`, etc.) are fine as `spec.nodes[].key` directly; only `name` needs a human-readable label since the test id is not shown in the app.
- Ignore `makeCalcData()` when generating the diagram; it exists only to feed the algorithm directly in unit tests. The generator computes the equivalent `totalSourceFlow`/`totalDischargeFlow` from the edge list, and the app recomputes calculated data itself on open. Do not copy `makeCalcData` values into `userEnteredData` unless the test deliberately diverges from what the edges imply (rare; check the fixture's comment block if unsure).
- Some fixtures deliberately omit an edge to isolate one behavior (e.g. a product-recipient system with no downstream discharge). For a diagram meant to be opened and inspected in the app, add the missing edge so every system has both an inflow and an outflow; otherwise the diagram editor may flag the node invalid. Only skip this if the fixture is specifically about testing an incomplete/invalid diagram.
- Only include fixtures that describe a **supported** configuration if the goal is a demo/reference set. Fixtures the file describes as `non-qualifying` (e.g. a doc comment saying "does not apply the override") are for algorithm regression coverage, not for showing a working diagram, and should usually be excluded from an app-import file, though the generator handles them fine if a non-qualifying case specifically needs to be visualized (e.g. to explain why the standard rule applies).

---

## Validation checklist

Run these checks on the generated JSON before treating it as done (see the inline `node -e "..."` checks used while building `output/ro-configuration-diagrams.json` for a working implementation):

1. **No orphan edges.** Every edge's `source` and `target` resolve to a node id present in that diagram's `nodes` array.
2. **No duplicate handle usage.** No two edges share the same `(source, sourceHandle)` pair, and no two edges share the same `(target, targetHandle)` pair.
3. **Handles match edge counts.** For each node, the number of `true` entries in `inflowHandles`/`outflowHandles` is at least the number of actual inflow/outflow edges (and at least 2, matching app defaults).
4. **Every flow field is present.** For each node: if it has any inflow edge, `userEnteredData.totalSourceFlow` is set; if it has any outflow edge, `userEnteredData.totalDischargeFlow` is set. Neither field should be silently missing on a pass-through node.
5. **`treatmentType` is set deliberately**, not left at the default `0`, whenever the configuration being demonstrated depends on a specific treatment type (RO = `6`).
6. **`settings.diagramId` matches `diagram.id`** for every entry, and `diagram.id` values are unique within the file.

---

## Related files

- Source spec used for the current RO diagram set: `src/process-flow-lib/docs/true-cost/algorithm/ro-specification.md`
- Test fixtures used for the current RO diagram set: `process-flow-diagram-component/src/__tests__/plant-summary.test.ts` (search `ro-reject-redirect fixtures`)
- Test node/edge builders: `process-flow-diagram-component/src/__fixtures__/builders.ts`
- True-cost algorithm reading these nodes: `src/process-flow-lib/water/logic/results.ts`
- Default handle/data shape for each component: `src/process-flow-lib/water/logic/water-components.ts`
- Node type adaptation (kebab-case to camelCase): `process-flow-diagram-component/src/components/Diagram/FlowUtils.ts:137`
- Node style colors: `src/process-flow-lib/water/constants.ts` (`CustomNodeStyleMap`)
- Example generated output: `output/ro-configuration-diagrams.json`
