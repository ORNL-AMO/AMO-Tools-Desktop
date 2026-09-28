/**
 * Correctness tests for `validateFlowSection` (Step 1 of
 * .prompts/flow-validation-refactor-plan.md) — the single shared rule set
 * both the Formik schema and `checkDiagramNodeErrors` are meant to derive
 * from. These assert the intended behavior, including the WUS >= 0
 * thresholds and the known-losses check that were previously only enforced
 * in one of the two legacy layers.
 *
 * `checkDiagramNodeErrors` tests below only cover per-node wiring (which
 * edges/fields get attributed to which node and flow direction) — rule
 * correctness itself is asserted on `validateFlowSection` directly.
 */

import { describe, it, expect } from 'vitest';
import type { Node } from '@xyflow/react';
import type { FlowValidationInput } from 'process-flow-lib';
import { checkDiagramNodeErrors, getKnownLossComponentTotals, validateFlowSection } from 'process-flow-lib';
import {
  makeIntakeNode,
  makeSystemNode,
  makeDischargeNode,
  makeTreatmentNode,
  makeEdge,
  defaultSettings,
} from '../__fixtures__/builders';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseInput = (overrides: Partial<FlowValidationInput> = {}): FlowValidationInput => ({
  totalFlow: null,
  edges: [],
  calculatedTotal: 0,
  unaccountedFlow: undefined,
  componentType: 'water-treatment',
  flowDirection: 'source',
  precision: 2,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Total flow minimum value
// ---------------------------------------------------------------------------

describe('validateFlowSection — total flow minimum value', () => {
  it('passes when totalFlow is null or undefined', () => {
    expect(validateFlowSection(baseInput({ totalFlow: null })).totalFlowError).toBeUndefined();
    expect(validateFlowSection(baseInput({ totalFlow: undefined })).totalFlowError).toBeUndefined();
  });

  it('rejects a Source total flow of 0', () => {
    const result = validateFlowSection(baseInput({ totalFlow: 0, flowDirection: 'source' }));
    expect(result.totalFlowError).toBe('Total Source Flow must be greater than 0');
    expect(result.level).toBe('error');
  });

  it('rejects a Discharge total flow of 0 for a non-WUS component', () => {
    const result = validateFlowSection(
      baseInput({ totalFlow: 0, flowDirection: 'discharge', componentType: 'water-discharge' }),
    );
    expect(result.totalFlowError).toBe('Total Discharge Flow must be greater than 0');
    expect(result.level).toBe('error');
  });

  it('accepts a Discharge total flow of exactly 0 for a water-using-system component', () => {
    const result = validateFlowSection(
      baseInput({ totalFlow: 0, flowDirection: 'discharge', componentType: 'water-using-system' }),
    );
    expect(result.totalFlowError).toBeUndefined();
    expect(result.level).toBeUndefined();
  });

  it('rejects a negative Discharge total flow for a water-using-system component', () => {
    const result = validateFlowSection(
      baseInput({ totalFlow: -1, flowDirection: 'discharge', componentType: 'water-using-system' }),
    );
    expect(result.totalFlowError).toBe('Total Discharge Flow must be greater than or equal to 0');
    expect(result.level).toBe('error');
  });

  it('rejects a negative Source total flow for a water-using-system component (WUS exception is discharge-only)', () => {
    const result = validateFlowSection(
      baseInput({ totalFlow: -1, flowDirection: 'source', componentType: 'water-using-system' }),
    );
    expect(result.totalFlowError).toBe('Total Source Flow must be greater than 0');
  });
});

// ---------------------------------------------------------------------------
// Total flow mismatch
// ---------------------------------------------------------------------------

describe('validateFlowSection — total flow mismatch', () => {
  it('passes when the total flow matches the calculated total', () => {
    const edges = [makeEdge('a', 'b', 100)];
    const result = validateFlowSection(
      baseInput({ totalFlow: 100, edges, calculatedTotal: 100 }),
    );
    expect(result.totalFlowError).toBeUndefined();
  });

  it('does not run the mismatch check when the min-value check already failed', () => {
    const edges = [makeEdge('a', 'b', 100)];
    // totalFlow=0 fails the min check; calculatedTotal mismatches too, but
    // only the min-check error should surface, not a second/different message.
    const result = validateFlowSection(
      baseInput({ totalFlow: 0, edges, calculatedTotal: 100 }),
    );
    expect(result.totalFlowError).toBe('Total Source Flow must be greater than 0');
  });

  it('flags a mismatch with the numeric difference in the message, with no unaccounted flow to reconcile it', () => {
    const edges = [makeEdge('a', 'b', 100)];
    const result = validateFlowSection(
      baseInput({ totalFlow: 90, edges, calculatedTotal: 100, flowDirection: 'discharge' }),
    );
    expect(result.totalFlowError).toBe('Total discharge flow does not match calculated flow (difference: 10)');
    expect(result.level).toBe('error');
  });

  it('reconciles a mismatch via unaccountedFlow', () => {
    const edges = [makeEdge('a', 'b', 100)];
    const result = validateFlowSection(
      baseInput({ totalFlow: 95, edges, calculatedTotal: 100, unaccountedFlow: 5 }),
    );
    expect(result.totalFlowError).toBeUndefined();
  });

  it('passes when there are no connected edges regardless of totalFlow vs calculatedTotal', () => {
    const result = validateFlowSection(
      baseInput({ totalFlow: 50, edges: [], calculatedTotal: 999 }),
    );
    expect(result.totalFlowError).toBeUndefined();
  });

  it('does not flag a mismatch when a connected edge has no flow value entered yet', () => {
    const edges = [{ ...makeEdge('a', 'b', 0), data: { ...makeEdge('a', 'b', 0).data, flowValue: undefined } }];
    // calculatedTotal defaults the un-entered edge to 0, but the total flow field
    // is entered — that's incomplete data entry, not a real mismatch.
    const result = validateFlowSection(
      baseInput({ totalFlow: 100, edges, calculatedTotal: 0, flowDirection: 'discharge' }),
    );
    expect(result.totalFlowError).toBeUndefined();
  });

  it('does not flag a mismatch when only some connected edges have flow values entered', () => {
    const edges = [
      makeEdge('a', 'b', 60),
      { ...makeEdge('c', 'b', 0), data: { ...makeEdge('c', 'b', 0).data, flowValue: undefined } },
    ];
    const result = validateFlowSection(
      baseInput({ totalFlow: 100, edges, calculatedTotal: 60, flowDirection: 'discharge' }),
    );
    expect(result.totalFlowError).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Edge flow minimum value
// ---------------------------------------------------------------------------

describe('validateFlowSection — edge flow minimum value', () => {
  it('ignores edges with a null or undefined flow value', () => {
    const edges = [{ ...makeEdge('a', 'b', 0), data: { ...makeEdge('a', 'b', 0).data, flowValue: undefined } }];
    const result = validateFlowSection(baseInput({ edges }));
    expect(result.edgeErrors).toEqual([]);
  });

  it('warns on a zero-flow edge for a non-WUS component', () => {
    const edges = [makeEdge('a', 'b', 0)];
    const result = validateFlowSection(baseInput({ edges, componentType: 'water-discharge', flowDirection: 'discharge' }));
    expect(result.edgeErrors).toEqual(['Flow must be greater than 0']);
    expect(result.level).toBe('warning');
  });

  it('warns on a negative-flow edge for a non-WUS component', () => {
    const edges = [makeEdge('a', 'b', -5)];
    const result = validateFlowSection(baseInput({ edges }));
    expect(result.edgeErrors).toEqual(['Flow must be greater than 0']);
  });

  it('accepts a zero-flow edge for a water-using-system discharge', () => {
    const edges = [makeEdge('system', 'downstream', 0)];
    const result = validateFlowSection(
      baseInput({ edges, componentType: 'water-using-system', flowDirection: 'discharge' }),
    );
    expect(result.edgeErrors).toEqual([]);
    expect(result.level).toBeUndefined();
  });

  it('warns (with the >= 0 message) on a negative-flow edge for a water-using-system discharge', () => {
    const edges = [makeEdge('system', 'downstream', -1)];
    const result = validateFlowSection(
      baseInput({ edges, componentType: 'water-using-system', flowDirection: 'discharge' }),
    );
    expect(result.edgeErrors).toEqual(['Flow must be greater than or equal to 0']);
    expect(result.level).toBe('warning');
  });

  it('rejects a zero-flow edge for a water-using-system SOURCE (WUS exception is discharge-only)', () => {
    const edges = [makeEdge('upstream', 'system', 0)];
    const result = validateFlowSection(
      baseInput({ edges, componentType: 'water-using-system', flowDirection: 'source' }),
    );
    expect(result.edgeErrors).toEqual(['Flow must be greater than 0']);
  });

  it('collects one error per invalid edge, skipping valid ones', () => {
    const edges = [makeEdge('a', 'b', 0), makeEdge('c', 'b', 50), makeEdge('d', 'b', -1)];
    const result = validateFlowSection(baseInput({ edges }));
    expect(result.edgeErrors).toEqual(['Flow must be greater than 0', 'Flow must be greater than 0']);
  });
});

// ---------------------------------------------------------------------------
// Known losses mismatch
// ---------------------------------------------------------------------------

describe('validateFlowSection — known losses mismatch', () => {
  it('is not evaluated when sumKnownLossEdges is undefined', () => {
    const result = validateFlowSection(baseInput({ userKnownLosses: 999 }));
    expect(result.knownLossesError).toBeUndefined();
  });

  it('is not evaluated when sumKnownLossEdges is 0', () => {
    const result = validateFlowSection(baseInput({ sumKnownLossEdges: 0, userKnownLosses: 999 }));
    expect(result.knownLossesError).toBeUndefined();
  });

  it('passes when userKnownLosses matches sumKnownLossEdges', () => {
    const result = validateFlowSection(baseInput({ sumKnownLossEdges: 50, userKnownLosses: 50 }));
    expect(result.knownLossesError).toBeUndefined();
  });

  it('flags a mismatch with the expected sum in the message', () => {
    const result = validateFlowSection(baseInput({ sumKnownLossEdges: 50, userKnownLosses: 40 }));
    expect(result.knownLossesError).toBe('Known Losses should equal the sum of all Known Loss flows (50)');
    expect(result.level).toBe('warning');
  });
});

// ---------------------------------------------------------------------------
// Level assignment
// ---------------------------------------------------------------------------

describe('validateFlowSection — level assignment', () => {
  it('is undefined when there are no errors', () => {
    expect(validateFlowSection(baseInput()).level).toBeUndefined();
  });

  it('is "error" whenever totalFlowError is set, even alongside edge/known-losses warnings', () => {
    const edges = [makeEdge('a', 'b', 0)];
    const result = validateFlowSection(
      baseInput({ totalFlow: 0, edges, sumKnownLossEdges: 50, userKnownLosses: 0 }),
    );
    expect(result.totalFlowError).toBeDefined();
    expect(result.edgeErrors.length).toBeGreaterThan(0);
    expect(result.knownLossesError).toBeDefined();
    expect(result.level).toBe('error');
  });

  it('is "warning" when only edge errors are present', () => {
    const edges = [makeEdge('a', 'b', 0)];
    const result = validateFlowSection(baseInput({ edges }));
    expect(result.level).toBe('warning');
  });

  it('is "warning" when only a known-losses error is present', () => {
    const result = validateFlowSection(baseInput({ sumKnownLossEdges: 50, userKnownLosses: 40 }));
    expect(result.level).toBe('warning');
  });
});

// ---------------------------------------------------------------------------
// getKnownLossComponentTotals (Step 5 input to validateFlowSection)
// ---------------------------------------------------------------------------

describe('getKnownLossComponentTotals', () => {
  const knownLossNode = (id: string): Node => ({
    id,
    type: 'known-loss',
    position: { x: 0, y: 0 },
    data: { ...(makeTreatmentNode(id).data as any), processComponentType: 'known-loss', diagramNodeId: id },
  });

  it('sums flow on discharge edges from selectedNodeId that terminate at a Known Loss component', () => {
    const knownLossA = knownLossNode('lossA');
    const knownLossB = knownLossNode('lossB');
    const edges = [makeEdge('treatment', 'lossA', 30), makeEdge('treatment', 'lossB', 20)];

    expect(getKnownLossComponentTotals(edges, [knownLossA, knownLossB] as any, 'treatment')).toBe(50);
  });

  it('ignores discharge edges that do not terminate at a Known Loss component', () => {
    const discharge = makeDischargeNode('discharge');
    const edges = [makeEdge('treatment', 'discharge', 30)];

    expect(getKnownLossComponentTotals(edges, [discharge] as any, 'treatment')).toBe(0);
  });

  it('ignores edges not sourced from selectedNodeId', () => {
    const knownLoss = knownLossNode('loss');
    const edges = [makeEdge('otherNode', 'loss', 30)];

    expect(getKnownLossComponentTotals(edges, [knownLoss] as any, 'treatment')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// checkDiagramNodeErrors — per-node wiring only (rule correctness is above)
// ---------------------------------------------------------------------------

describe('checkDiagramNodeErrors — wiring', () => {
  const settings = defaultSettings();

  it('attributes source-side edges/totals to the node they target, and discharge-side to the node they source', () => {
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system');
    const discharge = makeDischargeNode('discharge');
    (system.data as any).userEnteredData.totalSourceFlow = 90; // mismatch vs. calculated 100
    const edges = [makeEdge('intake', 'system', 100), makeEdge('system', 'discharge', 100)];

    const errors = checkDiagramNodeErrors([intake, system, discharge], edges, settings);

    expect(errors.system?.source?.totalFlow).toBeDefined();
    expect(errors.system?.discharge).toBeUndefined();
    expect(errors.intake).toBeUndefined();
    expect(errors.discharge).toBeUndefined();
  });

  it('returns an empty object when no node has any error', () => {
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system');
    (intake.data as any).userEnteredData.totalDischargeFlow = 100;
    (system.data as any).userEnteredData.totalSourceFlow = 100;
    const edges = [makeEdge('intake', 'system', 100)];

    const errors = checkDiagramNodeErrors([intake, system], edges, settings);
    expect(errors).toEqual({});
  });

  it('passes componentType/flowDirection through so a WUS discharge edge of 0 produces no error', () => {
    const system = makeSystemNode('system'); // water-using-system
    const discharge = makeDischargeNode('discharge');
    const edges = [makeEdge('system', 'discharge', 0)];

    const errors = checkDiagramNodeErrors([system, discharge], edges, settings);
    expect(errors.system).toBeUndefined();
  });

  it('still flags a warning for a zero-flow discharge edge on a non-WUS component', () => {
    const treatment = makeTreatmentNode('treatment'); // water-treatment, not WUS
    const discharge = makeDischargeNode('discharge');
    const edges = [makeEdge('treatment', 'discharge', 0)];

    const errors = checkDiagramNodeErrors([treatment, discharge], edges, settings);
    expect(errors.treatment?.discharge?.level).toBe('warning');
  });

  it('computes sumKnownLossEdges from discharge edges into Known Loss components and flags a mismatch against totalKnownLosses (Step 5)', () => {
    const treatment = makeTreatmentNode('treatment');
    const knownLoss: Node = {
      id: 'knownLoss',
      type: 'known-loss',
      position: { x: 0, y: 0 },
      data: { ...(makeTreatmentNode('knownLoss').data as any), processComponentType: 'known-loss', diagramNodeId: 'knownLoss' },
    };
    (treatment.data as any).userEnteredData.totalKnownLosses = 40; // mismatches the 50 summed below
    const edges = [makeEdge('treatment', 'knownLoss', 50)];

    const errors = checkDiagramNodeErrors([treatment, knownLoss], edges, settings);
    expect(errors.treatment?.discharge?.knownLosses).toBe(
      'Known Losses should equal the sum of all Known Loss flows (50)',
    );
  });

  it('does not flag a known-losses mismatch when totalKnownLosses matches the sum of Known Loss edges', () => {
    const treatment = makeTreatmentNode('treatment');
    const knownLoss: Node = {
      id: 'knownLoss',
      type: 'known-loss',
      position: { x: 0, y: 0 },
      data: { ...(makeTreatmentNode('knownLoss').data as any), processComponentType: 'known-loss', diagramNodeId: 'knownLoss' },
    };
    (treatment.data as any).userEnteredData.totalKnownLosses = 50;
    const edges = [makeEdge('treatment', 'knownLoss', 50)];

    const errors = checkDiagramNodeErrors([treatment, knownLoss], edges, settings);
    expect(errors.treatment).toBeUndefined();
  });
});
