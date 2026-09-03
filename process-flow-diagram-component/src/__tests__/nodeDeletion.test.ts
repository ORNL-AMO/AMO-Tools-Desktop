import { describe, it, expect } from 'vitest';
import { Node } from '@xyflow/react';
import { ProcessFlowPart } from 'process-flow-lib';
import { diagramSlice, keyboardDeleteNode, getDefaultDiagramData } from '../components/Diagram/diagramReducer';
import { getHasSources, getHasTargets } from '../components/Diagram/FlowUtils';
import { makeIntakeNode, makeSystemNode, makeEdge } from '../__fixtures__/builders';

// * covers a crash reported after deleting nodes connected to an intake, then clicking its
// * outgoing handle: getHasSources/getHasTargets read edge.target/source.diagramNodeId off a
// * dangling edge left pointing at the just-deleted node
describe('keyboardDeleteNode removes connected edges', () => {
  it('strips edges referencing the deleted node, matching deleteNodeReducer', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeSystemNode('b') as Node<ProcessFlowPart>;

    const edgeSourceA = makeEdge('source', 'a', 100);
    const edgeSourceB = makeEdge('source', 'b', 100);

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA, nodeB],
      edges: [edgeSourceA, edgeSourceB],
    };

    const result = diagramSlice.reducer(state, keyboardDeleteNode(nodeA));

    expect(result.edges.find((e) => e.id === edgeSourceA.id)).toBeUndefined();
    expect(result.edges.find((e) => e.id === edgeSourceB.id)).toBeDefined();
  });
});

describe('getHasSources/getHasTargets tolerate a dangling edge', () => {
  it('does not throw when an edge points at a node no longer present, and ignores that edge', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodes = [source];
    const danglingEdge = makeEdge('source', 'deleted-node', 100);

    expect(() => getHasSources([danglingEdge], nodes, source)).not.toThrow();
    expect(getHasSources([danglingEdge], nodes, source)).toBe(false);

    const danglingIncomingEdge = makeEdge('deleted-node', 'source', 100);
    expect(() => getHasTargets([danglingIncomingEdge], nodes, source)).not.toThrow();
    expect(getHasTargets([danglingIncomingEdge], nodes, source)).toBe(false);
  });
});
