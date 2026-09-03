import { describe, it, expect, vi } from 'vitest';
import { Node } from '@xyflow/react';
import { ProcessFlowPart, calculateFlowPropagation } from 'process-flow-lib';
import {
  diagramSlice,
  edgesChangeFromPropagation,
  getDefaultDiagramData,
} from '../components/Diagram/diagramReducer';
import { propagateFlowFromNode } from '../components/Diagram/diagramThunks';
import { getNodeTotalFlow } from '../components/Diagram/FlowUtils';
import { makeIntakeNode, makeSystemNode, makeDischargeNode, makeEdge } from '../__fixtures__/builders';

// * covers flow-calculation-requirements.md item H: "Set all flow values to the end of
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

  // * covers issue-8645: Total Outflow field must reflect the conserved sum (filled sibling +
  // * newly-cascaded edge), not the pre-cascade or an evenly-overwritten value
  it('populates a node total flow from the conserved remainder when a sibling edge was already filled', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;
    const nodeC = makeDischargeNode('c') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 30);
    const edgeAC = makeEdge('a', 'c', 0);

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA, nodeB, nodeC],
      edges: [seedEdge, edgeAB, edgeAC],
      calculatedData: { nodes: {} },
    };

    const flowUpdates = calculateFlowPropagation('source', seedEdge, state.edges);
    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates,
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    const updatedEdgeAB = result.edges.find((e) => e.id === edgeAB.id);
    const updatedEdgeAC = result.edges.find((e) => e.id === edgeAC.id);
    expect(updatedEdgeAB?.data.flowValue).toBe(30);
    expect(updatedEdgeAC?.data.flowValue).toBe(70);
    expect(result.calculatedData.nodes['a'].totalDischargeFlow).toBe(100);
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

  // * covers issue-8645 condition: node has all outflows filled but the one being cascaded -
  // * the filled sibling must be left alone and the missing edge solved via conservation, not
  // * an even split across every outgoing edge
  it('leaves an already-filled sibling edge untouched and gives the unfilled edge the conserved remainder', () => {
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 30);
    const edgeAC = makeEdge('a', 'c', 0);

    const flowUpdates = calculateFlowPropagation('source', seedEdge, [seedEdge, edgeAB, edgeAC]);

    expect(flowUpdates[edgeAC.id]).toBe(70);
    expect(flowUpdates[edgeAB.id]).toBeUndefined();
  });

  it('does not touch a node whose outgoing edges are all already filled', () => {
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 40);
    const edgeAC = makeEdge('a', 'c', 60);

    const flowUpdates = calculateFlowPropagation('source', seedEdge, [seedEdge, edgeAB, edgeAC]);

    expect(flowUpdates[edgeAB.id]).toBeUndefined();
    expect(flowUpdates[edgeAC.id]).toBeUndefined();
  });

  it('splits the remaining flow evenly across multiple still-unfilled edges when one sibling is already filled', () => {
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 20);
    const edgeAC = makeEdge('a', 'c', 0);
    const edgeAD = makeEdge('a', 'd', 0);

    const flowUpdates = calculateFlowPropagation('source', seedEdge, [seedEdge, edgeAB, edgeAC, edgeAD]);

    expect(flowUpdates[edgeAB.id]).toBeUndefined();
    expect(flowUpdates[edgeAC.id]).toBe(40);
    expect(flowUpdates[edgeAD.id]).toBe(40);
  });

  // * covers issue-8645 finding #1: two branches reconverging on a shared node (e.g. two
  // * systems both feeding one waste-water-treatment node) must have their flows summed there,
  // * not have the second-visited branch overwrite the first
  it('sums flow from two branches that reconverge on a shared node instead of overwriting', () => {
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 0);
    const edgeAC = makeEdge('a', 'c', 0);
    const edgeBD = makeEdge('b', 'd', 0);
    const edgeCD = makeEdge('c', 'd', 0);
    const edgeDE = makeEdge('d', 'e', 0);

    const flowUpdates = calculateFlowPropagation('source', seedEdge, [
      seedEdge, edgeAB, edgeAC, edgeBD, edgeCD, edgeDE,
    ]);

    expect(flowUpdates[edgeBD.id]).toBe(50);
    expect(flowUpdates[edgeCD.id]).toBe(50);
    expect(flowUpdates[edgeDE.id]).toBe(100);
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
