import type { Node, Edge } from '@xyflow/react';
import type {
  ProcessFlowPart,
  WaterProcessComponentType,
  CustomEdgeData,
  DiagramCalculatedData,
  DiagramSettings,
} from 'process-flow-lib';

// ---------------------------------------------------------------------------
// Node factories — produce the smallest valid Node<ProcessFlowPart> for each
// component type. Only the fields the calculation algorithm actually reads are
// populated; everything else is left at safe defaults.
// ---------------------------------------------------------------------------

const basePart = (
  id: string,
  type: WaterProcessComponentType,
  cost = 0,
  extra: Record<string, unknown> = {},
): ProcessFlowPart =>
  ({
    name: id,
    processComponentType: type,
    className: type,
    cost,
    isValid: true,
    createdByAssessment: false,
    diagramNodeId: id,
    handles: {},
    userEnteredData: {},
    ...extra,
  } as ProcessFlowPart);

export const makeIntakeNode = (id: string, costPerKGal = 0): Node =>
  ({
    id,
    type: 'water-intake',
    position: { x: 0, y: 0 },
    data: basePart(id, 'water-intake', costPerKGal, {
      disableInflowConnections: true,
      addedMotorEnergy: [],
    }),
  } as Node);

export const makeSystemNode = (id: string): Node =>
  ({
    id,
    type: 'water-using-system',
    position: { x: 0, y: 0 },
    data: basePart(id, 'water-using-system', 0, {
      inSystemTreatment: [],
      addedMotorEnergy: [],
      heatEnergy: undefined,
    }),
  } as Node);

export const makeDischargeNode = (id: string, costPerKGal = 0): Node =>
  ({
    id,
    type: 'water-discharge',
    position: { x: 0, y: 0 },
    data: basePart(id, 'water-discharge', costPerKGal, {
      disableOutflowConnections: true,
      addedMotorEnergy: [],
    }),
  } as Node);

export const makeTreatmentNode = (
  id: string,
  costPerKGal = 0,
  treatmentType = 0,
): Node =>
  ({
    id,
    type: 'water-treatment',
    position: { x: 0, y: 0 },
    data: basePart(id, 'water-treatment', costPerKGal, { treatmentType }),
  } as Node);

export const makeWasteTreatmentNode = (id: string, costPerKGal = 0): Node =>
  ({
    id,
    type: 'waste-water-treatment',
    position: { x: 0, y: 0 },
    data: basePart(id, 'waste-water-treatment', costPerKGal),
  } as Node);

export const makeSummingNode = (id: string): Node =>
  ({
    id,
    type: 'summing-node',
    position: { x: 0, y: 0 },
    data: basePart(id, 'summing-node', 0),
  } as Node);

// ---------------------------------------------------------------------------
// Edge factory
// Edge IDs must match the pattern getNewEdgeId() produces so that
// getConnectionFromEdgeId() can decode them if needed.
// ---------------------------------------------------------------------------

export const makeEdge = (
  source: string,
  target: string,
  flowValue: number,
): Edge<CustomEdgeData> => ({
  id: `xy-edge__${source}e-${target}a`,
  source,
  target,
  sourceHandle: 'e',
  targetHandle: 'a',
  data: {
    flowValue,
    hasOwnEdgeType: '',
    edgeDescription: `edge-desc__${source}-${target}`,
  },
});

// ---------------------------------------------------------------------------
// DiagramCalculatedData factory
// Pass an object mapping nodeId → { totalSourceFlow?, totalDischargeFlow? }.
// The algorithm reads:
//   intake  → totalDischargeFlow  (getOutflowBlockCosts)
//   discharge/treatment → totalSourceFlow (getInflowBlockCosts)
//   treatment → totalDischargeFlow (loss detection in applySystemTreatmentCosts)
// ---------------------------------------------------------------------------

export const makeCalcData = (
  entries: Record<string, { totalSourceFlow?: number; totalDischargeFlow?: number }>,
): DiagramCalculatedData => ({ nodes: entries });

// ---------------------------------------------------------------------------
// Default settings — keeps tests isolated from global constant changes
// ---------------------------------------------------------------------------

export const defaultSettings = (): DiagramSettings => ({
  unitsOfMeasure: 'Imperial',
  electricityCost: 0.066,
  fuelCost: 3.99,
  flowDecimalPrecision: 2,
  conductivityUnit: 'mmho',
});
