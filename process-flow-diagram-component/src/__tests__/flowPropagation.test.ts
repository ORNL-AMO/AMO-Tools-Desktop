import { describe, it, expect, vi } from 'vitest';
import { Node } from '@xyflow/react';
import { ProcessFlowPart, calculateFlowPropagation } from 'process-flow-lib';
import {
  diagramSlice,
  edgesChangeFromPropagation,
  getDefaultDiagramData,
  propagateFlowFromNode,
} from '../components/Diagram/diagramReducer';
import { getNodeTotalFlow } from '../components/Diagram/FlowUtils';
import { makeIntakeNode, makeSystemNode, makeDischargeNode, makeEdge } from '../__fixtures__/builders';

// * covers flow-propagation-requirements.md item H: "Set all flow values to the end of
// * path" must calculate downstream node totals, not just edge values (previously only
// * edgesChangeFromPropagationReducer's edge.data.flowValue was updated, calculatedData
// * was left stale, which was also the root of Spec Question 1's "Evenly vs All" mismatch)
describe('edgesChangeFromPropagation updates downstream node totals', () => {
  it('recomputes calculatedData totals for every node the cascade touches (source -> a -> b)', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 0);

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA, nodeB],
      edges: [seedEdge, edgeAB],
      calculatedData: { nodes: {} },
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100, [edgeAB.id]: 100 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    expect(result.calculatedData.nodes['a'].totalSourceFlow).toBe(100);
    expect(result.calculatedData.nodes['a'].totalDischargeFlow).toBe(100);
    expect(result.calculatedData.nodes['b'].totalSourceFlow).toBe(100);

    const updatedNodeA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    expect(getNodeTotalFlow('totalSourceFlow', result.calculatedData.nodes['a'], result.nodes as Node<ProcessFlowPart>[], 'a')).toBe(100);
    expect(updatedNodeA.data.userEnteredData.totalSourceFlow).toBeUndefined();
  });

  it('leaves a user-entered total flow display unchanged, per requirement G, even though calculatedData is refreshed underneath', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    nodeA.data.userEnteredData = { totalSourceFlow: 999 };

    const seedEdge = makeEdge('source', 'a', 100);

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA],
      edges: [seedEdge],
      calculatedData: { nodes: {} },
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    expect(result.calculatedData.nodes['a'].totalSourceFlow).toBe(100);
    expect(
      getNodeTotalFlow('totalSourceFlow', result.calculatedData.nodes['a'], result.nodes as Node<ProcessFlowPart>[], 'a')
    ).toBe(999);
  });
});

// * calculateFlowPropagation now lives standalone in process-flow-lib (previously a private method
// * on the deleted FlowCalculationService class), independently testable without Redux/React
describe('calculateFlowPropagation (pure DFS)', () => {
  it('splits the seed flow evenly across a node with multiple outgoing edges', () => {
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 0);
    const edgeAC = makeEdge('a', 'c', 0);

    const flowUpdates = calculateFlowPropagation('source', seedEdge, [seedEdge, edgeAB, edgeAC]);

    expect(flowUpdates[edgeAB.id]).toBe(50);
    expect(flowUpdates[edgeAC.id]).toBe(50);
  });

  it('carries the full seed flow down a single-path chain', () => {
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 0);
    const edgeBC = makeEdge('b', 'c', 0);

    const flowUpdates = calculateFlowPropagation('source', seedEdge, [seedEdge, edgeAB, edgeBC]);

    expect(flowUpdates[edgeAB.id]).toBe(100);
    expect(flowUpdates[edgeBC.id]).toBe(100);
  });

  it('protects against a cycle (a -> b -> a) instead of recursing until the call stack overflows', () => {
    const seedEdge = makeEdge('a', 'b', 100);
    const edgeBA = makeEdge('b', 'a', 0);

    const flowUpdates = calculateFlowPropagation('a', seedEdge, [seedEdge, edgeBA]);

    expect(flowUpdates[seedEdge.id]).toBe(100);
    expect(flowUpdates[edgeBA.id]).toBe(100);
  });
});

describe('propagateFlowFromNode thunk', () => {
  it('reads edges from getState, computes the cascade, and dispatches edgesChangeFromPropagation', () => {
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 0);
    const dispatch = vi.fn();
    const getState = () => ({ diagram: { ...getDefaultDiagramData(), edges: [seedEdge, edgeAB] } });

    propagateFlowFromNode('source', seedEdge)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith(diagramSlice.actions.edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100, [edgeAB.id]: 100 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));
  });
});
