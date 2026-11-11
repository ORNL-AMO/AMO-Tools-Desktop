import { describe, it, expect } from 'vitest';
import { Node } from '@xyflow/react';
import { getDefaultSettings, getDefaultUserDiagramOptions, ProcessFlowPart } from 'process-flow-lib';
import {
  diagramSlice,
  setEdgeFlowConfidence,
  setNodeFlowConfidence,
  setEdgeStrokeColor,
  sourceFlowValueChange,
  dischargeFlowValueChange,
  totalFlowChange,
  sumTotalFlowChange,
  distributeTotalSourceFlow,
  diagramInitialized,
  diagramOptionsChange,
  getDefaultDiagramData,
  edgesChangeFromPropagation,
} from '../components/Diagram/diagramReducer';
import { makeIntakeNode, makeSystemNode, makeDischargeNode, makeEdge } from '../__fixtures__/builders';

describe('setEdgeFlowConfidence', () => {
  it('sets confidence on the targeted edge only, without touching its style', () => {
    const edgeA = makeEdge('intake', 'system', 100);
    const edgeB = makeEdge('system', 'discharge', 80);
    const state = { ...getDefaultDiagramData(), edges: [edgeA, edgeB] };

    const result = diagramSlice.reducer(state, setEdgeFlowConfidence({ edgeId: edgeA.id, confidence: 'metered' }));

    expect(result.edges.find((e) => e.id === edgeA.id).data.confidence).toBe('metered');
    expect(result.edges.find((e) => e.id === edgeB.id).data.confidence).toBe('estimated');
    expect(result.edges.find((e) => e.id === edgeA.id).style).toEqual(edgeA.style);
  });
});

describe('setNodeFlowConfidence', () => {
  it('sets confidence on the targeted node/flowProperty only', () => {
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system');
    const state = { ...getDefaultDiagramData(), nodes: [intake, system] };

    const result = diagramSlice.reducer(state, setNodeFlowConfidence({ nodeId: 'intake', flowProperty: 'totalSourceFlow', confidence: 'metered' }));

    const updatedIntake = result.nodes.find((n) => n.id === 'intake') as Node<ProcessFlowPart>;
    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedIntake.data.flowConfidence.totalSourceFlow).toBe('metered');
    expect(updatedIntake.data.flowConfidence.totalDischargeFlow).toBe('estimated');
    expect(updatedSystem.data.flowConfidence.totalSourceFlow).toBe('estimated');
  });
});

describe('setEdgeStrokeColor', () => {
  it('flags the edge as having a manual color override', () => {
    const edge = makeEdge('intake', 'system', 100);
    edge.style = { stroke: '#000000' };
    const state = { ...getDefaultDiagramData(), edges: [edge], selectedDataId: edge.id };

    const result = diagramSlice.reducer(state, setEdgeStrokeColor({ color: '#ff0000' }));

    const updatedEdge = result.edges.find((e) => e.id === edge.id);
    expect(updatedEdge.style.stroke).toBe('#ff0000');
    expect(updatedEdge.data.hasManualColorOverride).toBe(true);
  });
});

describe('confidence persists through recalculation', () => {
  it('sourceFlowValueChange does not reset an edge already marked metered', () => {
    const edge = makeEdge('intake', 'system', 100);
    edge.data.confidence = 'metered';
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system');
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge], selectedDataId: 'system' };

    const result = diagramSlice.reducer(state, sourceFlowValueChange({ sourceEdgeId: edge.id, flowValue: 42 }));

    const updatedEdge = result.edges.find((e) => e.id === edge.id);
    expect(updatedEdge.data.flowValue).toBe(42);
    expect(updatedEdge.data.confidence).toBe('metered');
  });

  it('sourceFlowValueChange downgrades a calculated edge to estimated and mirrors to an untouched total', () => {
    const edge = makeEdge('intake', 'system', 100);
    edge.data.confidence = 'calculated';
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    system.data.flowConfidence.totalSourceFlow = 'calculated';
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge], selectedDataId: 'system' };

    const result = diagramSlice.reducer(state, sourceFlowValueChange({ sourceEdgeId: edge.id, flowValue: 42 }));

    expect(result.edges.find((e) => e.id === edge.id).data.confidence).toBe('estimated');
    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedSystem.data.flowConfidence.totalSourceFlow).toBe('estimated');
  });

  it('sourceFlowValueChange voids a touched total to estimated when editing any edge on its side', () => {
    const edge = makeEdge('intake', 'system', 100);
    edge.data.confidence = 'calculated';
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    system.data.flowConfidence.totalSourceFlow = 'metered';
    system.data.flowTotalTouched.totalSourceFlow = true;
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge], selectedDataId: 'system' };

    const result = diagramSlice.reducer(state, sourceFlowValueChange({ sourceEdgeId: edge.id, flowValue: 42 }));

    expect(result.edges.find((e) => e.id === edge.id).data.confidence).toBe('estimated');
    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedSystem.data.flowConfidence.totalSourceFlow).toBe('estimated');
    expect(updatedSystem.data.flowTotalTouched.totalSourceFlow).toBe(false);
  });

  it('sourceFlowValueChange voids a touched total even when the edited edge was not previously calculated', () => {
    const edge = makeEdge('intake', 'system', 100);
    edge.data.confidence = 'metered';
    const intake = makeIntakeNode('intake');
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    system.data.flowConfidence.totalSourceFlow = 'metered';
    system.data.flowTotalTouched.totalSourceFlow = true;
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge], selectedDataId: 'system' };

    const result = diagramSlice.reducer(state, sourceFlowValueChange({ sourceEdgeId: edge.id, flowValue: 42 }));

    // * the edited edge's own confidence is untouched by this rule - only edges that were
    // * already 'calculated' get downgraded on edit - but the touched total still voids
    expect(result.edges.find((e) => e.id === edge.id).data.confidence).toBe('metered');
    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedSystem.data.flowConfidence.totalSourceFlow).toBe('estimated');
    expect(updatedSystem.data.flowTotalTouched.totalSourceFlow).toBe(false);
  });

  it('sourceFlowValueChange voids a touched total even when the node has multiple source edges (only one edited)', () => {
    const intake = makeIntakeNode('intake');
    const intake2 = makeIntakeNode('intake2');
    const edge = makeEdge('intake', 'system', 100);
    const edge2 = makeEdge('intake2', 'system', 50);
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    system.data.flowConfidence.totalSourceFlow = 'metered';
    system.data.flowTotalTouched.totalSourceFlow = true;
    const state = { ...getDefaultDiagramData(), nodes: [intake, intake2, system], edges: [edge, edge2], selectedDataId: 'system' };

    const result = diagramSlice.reducer(state, sourceFlowValueChange({ sourceEdgeId: edge.id, flowValue: 42 }));

    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedSystem.data.flowConfidence.totalSourceFlow).toBe('estimated');
    expect(updatedSystem.data.flowTotalTouched.totalSourceFlow).toBe(false);
    // * the other, untouched-by-this-edit source edge is unaffected
    expect(result.edges.find((e) => e.id === edge2.id).data.flowValue).toBe(50);
  });

  it('dischargeFlowValueChange downgrades a calculated edge to estimated and mirrors to an untouched total', () => {
    const edge = makeEdge('system', 'discharge', 100);
    edge.data.confidence = 'calculated';
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    system.data.flowConfidence.totalDischargeFlow = 'calculated';
    const discharge = makeDischargeNode('discharge');
    const state = { ...getDefaultDiagramData(), nodes: [system, discharge], edges: [edge], selectedDataId: 'system' };

    const result = diagramSlice.reducer(state, dischargeFlowValueChange({ dischargeEdgeId: edge.id, flowValue: 42 }));

    expect(result.edges.find((e) => e.id === edge.id).data.confidence).toBe('estimated');
    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedSystem.data.flowConfidence.totalDischargeFlow).toBe('estimated');
  });
});

describe('flowTotalTouched tracking', () => {
  it('setNodeFlowConfidence marks the total as touched', () => {
    const intake = makeIntakeNode('intake') as Node<ProcessFlowPart>;
    const state = { ...getDefaultDiagramData(), nodes: [intake] };

    const result = diagramSlice.reducer(state, setNodeFlowConfidence({ nodeId: 'intake', flowProperty: 'totalDischargeFlow', confidence: 'metered' }));

    const updated = result.nodes.find((n) => n.id === 'intake') as Node<ProcessFlowPart>;
    expect(updated.data.flowTotalTouched.totalDischargeFlow).toBe(true);
    expect(updated.data.flowTotalTouched.totalSourceFlow).toBe(false);
  });

  it('totalFlowChange marks the total as touched', () => {
    const intake = makeIntakeNode('intake') as Node<ProcessFlowPart>;
    const state = { ...getDefaultDiagramData(), nodes: [intake], selectedDataId: 'intake' };

    const result = diagramSlice.reducer(state, totalFlowChange({ flowProperty: 'totalDischargeFlow', totalFlow: 100 }));

    const updated = result.nodes.find((n) => n.id === 'intake') as Node<ProcessFlowPart>;
    expect(updated.data.flowTotalTouched.totalDischargeFlow).toBe(true);
  });

  it('sumTotalFlowChange and distributeTotalSourceFlow do not mark the total as touched', () => {
    const intake = makeIntakeNode('intake') as Node<ProcessFlowPart>;
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    const edge = makeEdge('intake', 'system', 100);
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge], selectedDataId: 'system' };

    const summed = diagramSlice.reducer(state, sumTotalFlowChange({ flowProperty: 'totalSourceFlow', relatedEdges: [edge] }));
    const summedSystem = summed.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(summedSystem.data.flowTotalTouched.totalSourceFlow).toBe(false);

    const distributed = diagramSlice.reducer(summed, distributeTotalSourceFlow(100));
    const distributedSystem = distributed.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(distributedSystem.data.flowTotalTouched.totalSourceFlow).toBe(false);
  });
});

describe('setEdgeFlowConfidence mirrors a sole edge to its untouched total', () => {
  it('mirrors metered onto both endpoints\' totals when each has only this one edge', () => {
    const intake = makeIntakeNode('intake') as Node<ProcessFlowPart>;
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    const edge = makeEdge('intake', 'system', 100);
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge] };

    const result = diagramSlice.reducer(state, setEdgeFlowConfidence({ edgeId: edge.id, confidence: 'metered' }));

    const updatedIntake = result.nodes.find((n) => n.id === 'intake') as Node<ProcessFlowPart>;
    const updatedSystem = result.nodes.find((n) => n.id === 'system') as Node<ProcessFlowPart>;
    expect(updatedIntake.data.flowConfidence.totalDischargeFlow).toBe('metered');
    expect(updatedSystem.data.flowConfidence.totalSourceFlow).toBe('metered');
  });

  it('does not mirror onto an already-touched total', () => {
    const intake = makeIntakeNode('intake') as Node<ProcessFlowPart>;
    intake.data.flowTotalTouched.totalDischargeFlow = true;
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    const edge = makeEdge('intake', 'system', 100);
    const state = { ...getDefaultDiagramData(), nodes: [intake, system], edges: [edge] };

    const result = diagramSlice.reducer(state, setEdgeFlowConfidence({ edgeId: edge.id, confidence: 'metered' }));

    const updatedIntake = result.nodes.find((n) => n.id === 'intake') as Node<ProcessFlowPart>;
    expect(updatedIntake.data.flowConfidence.totalDischargeFlow).toBe('estimated');
  });

  it('does not mirror when the node has more than one edge on that side', () => {
    const intake = makeIntakeNode('intake') as Node<ProcessFlowPart>;
    const system = makeSystemNode('system') as Node<ProcessFlowPart>;
    const discharge = makeDischargeNode('discharge') as Node<ProcessFlowPart>;
    const edge = makeEdge('intake', 'system', 60);
    const otherEdge = makeEdge('intake', 'discharge', 40);
    const state = { ...getDefaultDiagramData(), nodes: [intake, system, discharge], edges: [edge, otherEdge] };

    const result = diagramSlice.reducer(state, setEdgeFlowConfidence({ edgeId: edge.id, confidence: 'metered' }));

    const updatedIntake = result.nodes.find((n) => n.id === 'intake') as Node<ProcessFlowPart>;
    expect(updatedIntake.data.flowConfidence.totalDischargeFlow).toBe('estimated');
  });
});

describe('edgesChangeFromPropagation sets calculated confidence', () => {
  it('sets downstream edges to calculated, leaves the seed edge untouched, mirrors single-edge-side totals to their edge, and sets many-edge-side totals to calculated', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;
    const nodeC = makeDischargeNode('c') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 50);
    const edgeAC = makeEdge('a', 'c', 50);

    seedEdge.data.confidence = 'metered';
    edgeAB.data.confidence = 'estimated';
    edgeAC.data.confidence = 'estimated';

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA, nodeB, nodeC],
      edges: [seedEdge, edgeAB, edgeAC],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100, [edgeAB.id]: 50, [edgeAC.id]: 50 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    // * seed edge keeps its own prior confidence; downstream edges written by the cascade become calculated
    expect(result.edges.find((e) => e.id === seedEdge.id).data.confidence).toBe('metered');
    expect(result.edges.find((e) => e.id === edgeAB.id).data.confidence).toBe('calculated');
    expect(result.edges.find((e) => e.id === edgeAC.id).data.confidence).toBe('calculated');

    const updatedSource = result.nodes.find((n) => n.id === 'source') as Node<ProcessFlowPart>;
    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    const updatedB = result.nodes.find((n) => n.id === 'b') as Node<ProcessFlowPart>;
    const updatedC = result.nodes.find((n) => n.id === 'c') as Node<ProcessFlowPart>;

    // * source's discharge side and a's source side each have only the seed edge - mirror its (unchanged) confidence
    expect(updatedSource.data.flowConfidence.totalDischargeFlow).toBe('metered');
    expect(updatedA.data.flowConfidence.totalSourceFlow).toBe('metered');
    // * a's discharge side has 2 edges (b, c) - unconditionally becomes calculated, touched reset to false
    expect(updatedA.data.flowConfidence.totalDischargeFlow).toBe('calculated');
    expect(updatedA.data.flowTotalTouched.totalDischargeFlow).toBe(false);
    // * b's and c's source sides each have only their one calculated edge - mirror it
    expect(updatedB.data.flowConfidence.totalSourceFlow).toBe('calculated');
    expect(updatedC.data.flowConfidence.totalSourceFlow).toBe('calculated');
  });

  it('voids a touched single-edge-side total to estimated when the cascade writes its edge, regardless of the edge\'s prior confidence', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 100);

    seedEdge.data.confidence = 'estimated';
    // * edgeAB was already estimated (not metered) before the cascade - the touched-total voiding
    // * rule doesn't care what the edge's prior confidence was, only that the cascade wrote it
    edgeAB.data.confidence = 'estimated';
    nodeA.data.flowConfidence.totalDischargeFlow = 'metered';
    nodeA.data.flowTotalTouched.totalDischargeFlow = true;

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA],
      edges: [seedEdge, edgeAB],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 100, [edgeAB.id]: 100 },
      startingNodeId: 'source',
      initialEdgeId: seedEdge.id,
    }));

    expect(result.edges.find((e) => e.id === seedEdge.id).data.confidence).toBe('estimated');
    expect(result.edges.find((e) => e.id === edgeAB.id).data.confidence).toBe('calculated');

    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    expect(updatedA.data.flowConfidence.totalDischargeFlow).toBe('estimated');
    expect(updatedA.data.flowTotalTouched.totalDischargeFlow).toBe(false);
  });

  it('voids a touched many-edge-side total to estimated instead of calculated', () => {
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;
    const nodeC = makeDischargeNode('c') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('a', 'b', 50);
    const edgeAC = makeEdge('a', 'c', 50);

    nodeA.data.flowConfidence.totalDischargeFlow = 'metered';
    nodeA.data.flowTotalTouched.totalDischargeFlow = true;

    const state = {
      ...getDefaultDiagramData(),
      nodes: [nodeA, nodeB, nodeC],
      edges: [seedEdge, edgeAC],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 50, [edgeAC.id]: 50 },
      startingNodeId: 'a',
      initialEdgeId: seedEdge.id,
    }));

    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    expect(updatedA.data.flowConfidence.totalDischargeFlow).toBe('estimated');
    expect(updatedA.data.flowTotalTouched.totalDischargeFlow).toBe(false);
  });

  it('an untouched many-edge total becomes estimated when the seed arrow (still estimated) feeds it directly', () => {
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;
    const nodeC = makeDischargeNode('c') as Node<ProcessFlowPart>;

    // the seed IS one of a's discharge edges this time (propagate was clicked on a->b directly)
    const seedEdge = makeEdge('a', 'b', 50);
    const edgeAC = makeEdge('a', 'c', 50);
    seedEdge.data.confidence = 'estimated';

    const state = {
      ...getDefaultDiagramData(),
      nodes: [nodeA, nodeB, nodeC],
      edges: [seedEdge, edgeAC],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 50, [edgeAC.id]: 50 },
      startingNodeId: 'a',
      initialEdgeId: seedEdge.id,
    }));

    // seed keeps its own confidence (estimated); edgeAC becomes calculated
    expect(result.edges.find((e) => e.id === seedEdge.id).data.confidence).toBe('estimated');
    expect(result.edges.find((e) => e.id === edgeAC.id).data.confidence).toBe('calculated');

    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    // * least-confident of {estimated, calculated} is estimated
    expect(updatedA.data.flowConfidence.totalDischargeFlow).toBe('estimated');
  });

  it('an untouched many-edge total becomes calculated when the seed arrow (still metered) feeds it directly', () => {
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;
    const nodeC = makeDischargeNode('c') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('a', 'b', 50);
    const edgeAC = makeEdge('a', 'c', 50);
    seedEdge.data.confidence = 'metered';

    const state = {
      ...getDefaultDiagramData(),
      nodes: [nodeA, nodeB, nodeC],
      edges: [seedEdge, edgeAC],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [seedEdge.id]: 50, [edgeAC.id]: 50 },
      startingNodeId: 'a',
      initialEdgeId: seedEdge.id,
    }));

    // seed keeps its own confidence (metered); edgeAC becomes calculated
    expect(result.edges.find((e) => e.id === seedEdge.id).data.confidence).toBe('metered');
    expect(result.edges.find((e) => e.id === edgeAC.id).data.confidence).toBe('calculated');

    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    // * least-confident of {metered, calculated} is calculated - metered doesn't win here
    expect(updatedA.data.flowConfidence.totalDischargeFlow).toBe('calculated');
  });

  it('drops a metered single-edge-side total to estimated when the cascade downgrades its sole edge from metered to calculated, even when the total is touched', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;

    const seedEdge = makeEdge('source', 'a', 100);
    seedEdge.data.confidence = 'metered';
    nodeA.data.flowConfidence.totalSourceFlow = 'metered';
    nodeA.data.flowTotalTouched.totalSourceFlow = true;

    // seedEdge is a's sole source edge, but it's not the seed of THIS cascade run - the cascade
    // originates further upstream and writes through it, so it downgrades from metered to calculated
    const upstreamSeed = makeEdge('upstream', 'source', 100);
    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA],
      edges: [upstreamSeed, seedEdge],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [upstreamSeed.id]: 100, [seedEdge.id]: 100 },
      startingNodeId: 'upstream',
      initialEdgeId: upstreamSeed.id,
    }));

    expect(result.edges.find((e) => e.id === seedEdge.id).data.confidence).toBe('calculated');
    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    expect(updatedA.data.flowConfidence.totalSourceFlow).toBe('estimated');
    expect(updatedA.data.flowTotalTouched.totalSourceFlow).toBe(false);
  });

  it('still mirrors calculated onto an untouched single-edge-side total when the edge was not previously metered', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;

    const upstreamSeed = makeEdge('upstream', 'source', 100);
    const edge = makeEdge('source', 'a', 100);
    edge.data.confidence = 'estimated';
    nodeA.data.flowConfidence.totalSourceFlow = 'estimated';

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA],
      edges: [upstreamSeed, edge],
    };

    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [upstreamSeed.id]: 100, [edge.id]: 100 },
      startingNodeId: 'upstream',
      initialEdgeId: upstreamSeed.id,
    }));

    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    expect(updatedA.data.flowConfidence.totalSourceFlow).toBe('calculated');
  });

  it('leaves a node\'s untouched side alone when the cascade only writes edges on its other side (pass-through node)', () => {
    const source = makeIntakeNode('source') as Node<ProcessFlowPart>;
    const nodeA = makeSystemNode('a') as Node<ProcessFlowPart>;
    const nodeB = makeDischargeNode('b') as Node<ProcessFlowPart>;

    // a's source edge already has a real value, so the cascade only writes a's discharge edge
    const seedEdge = makeEdge('source', 'a', 100);
    const edgeAB = makeEdge('a', 'b', 100);
    seedEdge.data.confidence = 'metered';
    nodeA.data.flowConfidence.totalSourceFlow = 'estimated';
    nodeA.data.flowTotalTouched.totalSourceFlow = true;

    const state = {
      ...getDefaultDiagramData(),
      nodes: [source, nodeA, nodeB],
      edges: [seedEdge, edgeAB],
    };

    // only edgeAB is in flowUpdates - the cascade never touched seedEdge/a's source side in this batch
    const result = diagramSlice.reducer(state, edgesChangeFromPropagation({
      flowUpdates: { [edgeAB.id]: 100 },
      startingNodeId: 'a',
      initialEdgeId: edgeAB.id,
    }));

    const updatedA = result.nodes.find((n) => n.id === 'a') as Node<ProcessFlowPart>;
    // * a's source side received no written edge in this batch - left exactly as it was, touched flag intact
    expect(updatedA.data.flowConfidence.totalSourceFlow).toBe('estimated');
    expect(updatedA.data.flowTotalTouched.totalSourceFlow).toBe(true);
  });
});

describe('flow confidence migration', () => {
  it('stamps default estimated confidence onto edges and nodes missing the field (legacy saved diagrams)', () => {
    // simulates a diagram saved before this feature shipped - data shapes intentionally
    // omit `confidence`/`flowConfidence` and are cast past the type system for that reason.
    const legacyEdge = {
      id: 'xy-edge__intakee-systema',
      source: 'intake',
      target: 'system',
      sourceHandle: 'e',
      targetHandle: 'a',
      data: {
        flowValue: 10,
        hasOwnEdgeType: '',
        edgeDescription: 'intake-system',
      },
    } as any;

    const legacyNode = {
      id: 'intake',
      type: 'water-intake',
      position: { x: 0, y: 0 },
      data: {
        name: 'intake',
        processComponentType: 'water-intake',
        className: 'water-intake',
        cost: 0,
        isValid: true,
        createdByAssessment: false,
        diagramNodeId: 'intake',
        handles: {},
        userEnteredData: {},
      },
    } as any;

    const legacyDiagramData = {
      name: 'legacy diagram',
      nodes: [legacyNode],
      edges: [legacyEdge],
      diagramFlowErrors: {},
      userDiagramOptions: getDefaultUserDiagramOptions(),
      settings: getDefaultSettings(),
      calculatedData: { nodes: {} },
      recentNodeColors: [],
      recentEdgeColors: [],
    } as any;

    const state = getDefaultDiagramData();
    const result = diagramSlice.reducer(state, diagramInitialized({
      diagramData: legacyDiagramData,
      parentContainer: { height: 100, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    expect(result.edges[0].data.confidence).toBe('estimated');
    expect(result.edges[0].data.hasManualColorOverride).toBe(false);
    expect((result.nodes[0].data as any).flowConfidence).toEqual({ totalSourceFlow: 'estimated', totalDischargeFlow: 'estimated' });
    expect((result.nodes[0].data as any).flowTotalTouched).toEqual({ totalSourceFlow: false, totalDischargeFlow: false });
  });

  it('infers hasManualColorOverride from a saved stroke that differs from the old default, rather than defaulting to false', () => {
    const legacyNode = {
      id: 'intake',
      type: 'water-intake',
      position: { x: 0, y: 0 },
      data: {
        name: 'intake',
        processComponentType: 'water-intake',
        className: 'water-intake',
        cost: 0,
        isValid: true,
        createdByAssessment: false,
        diagramNodeId: 'intake',
        handles: {},
        userEnteredData: {},
      },
    } as any;

    const customColorEdge = {
      id: 'xy-edge__intakee-systema',
      source: 'intake',
      target: 'system',
      sourceHandle: 'e',
      targetHandle: 'a',
      style: { stroke: '#ff0000' },
      data: {
        flowValue: 10,
        hasOwnEdgeType: '',
        edgeDescription: 'intake-system',
      },
    } as any;

    const defaultColorEdge = {
      id: 'xy-edge__intakef-systemb',
      source: 'intake',
      target: 'system',
      sourceHandle: 'f',
      targetHandle: 'b',
      style: { stroke: '#6c757d' },
      data: {
        flowValue: 10,
        hasOwnEdgeType: '',
        edgeDescription: 'intake-system-2',
      },
    } as any;

    const legacyDiagramData = {
      name: 'legacy diagram',
      nodes: [legacyNode],
      edges: [customColorEdge, defaultColorEdge],
      diagramFlowErrors: {},
      userDiagramOptions: getDefaultUserDiagramOptions(),
      settings: getDefaultSettings(),
      calculatedData: { nodes: {} },
      recentNodeColors: [],
      recentEdgeColors: [],
    } as any;

    const state = getDefaultDiagramData();
    const result = diagramSlice.reducer(state, diagramInitialized({
      diagramData: legacyDiagramData,
      parentContainer: { height: 100, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    expect(result.edges.find((e) => e.id === customColorEdge.id).data.hasManualColorOverride).toBe(true);
    expect(result.edges.find((e) => e.id === defaultColorEdge.id).data.hasManualColorOverride).toBe(false);
  });
});

describe('edge coloring options (colorEdgesByConfidence / estimatedFlowColor / meteredFlowColor)', () => {
  it('diagramInitialized stamps all 3 fields onto a diagram whose saved userDiagramOptions predates them, so later diagramOptionsChange dispatches actually apply', () => {
    // Regression test: diagramOptionsChangeReducer only sets a field `if (optionsProp in state.diagramOptions)`.
    // A legacy userDiagramOptions object (saved before this feature shipped) never had these keys at all,
    // so without stamping them in diagramInitializedReducer, every dispatch below would silently no-op.
    const legacyUserDiagramOptions = {
      strokeWidth: 2,
      edgeType: 'smoothstep',
      minimapVisible: false,
      controlsVisible: true,
      directionalArrowsVisible: true,
      showFlowLabels: true,
      flowLabelSize: 1,
      animated: false,
      // * intentionally no colorEdgesByConfidence/estimatedFlowColor/meteredFlowColor keys
    } as any;

    const legacyDiagramData = {
      name: 'legacy diagram',
      nodes: [],
      edges: [],
      diagramFlowErrors: {},
      userDiagramOptions: legacyUserDiagramOptions,
      settings: getDefaultSettings(),
      calculatedData: { nodes: {} },
      recentNodeColors: [],
      recentEdgeColors: [],
    } as any;

    let state = diagramSlice.reducer(getDefaultDiagramData(), diagramInitialized({
      diagramData: legacyDiagramData,
      parentContainer: { height: 100, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    expect('colorEdgesByConfidence' in state.diagramOptions).toBe(true);
    expect('estimatedFlowColor' in state.diagramOptions).toBe(true);
    expect('meteredFlowColor' in state.diagramOptions).toBe(true);
    expect(state.diagramOptions.colorEdgesByConfidence).toBe(false);

    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'colorEdgesByConfidence', updatedValue: true }));
    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: '#ff9900' }));
    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'meteredFlowColor', updatedValue: '#00cc44' }));

    expect(state.diagramOptions.colorEdgesByConfidence).toBe(true);
    expect(state.diagramOptions.estimatedFlowColor).toBe('#ff9900');
    expect(state.diagramOptions.meteredFlowColor).toBe('#00cc44');
  });

  it('resets a custom color back to undefined (default theme color) via diagramOptionsChange', () => {
    let state = diagramSlice.reducer(getDefaultDiagramData(), diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: '#ff9900' }));
    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'meteredFlowColor', updatedValue: '#00cc44' }));

    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'estimatedFlowColor', updatedValue: undefined }));

    expect(state.diagramOptions.estimatedFlowColor).toBeUndefined();
    expect(state.diagramOptions.meteredFlowColor).toBe('#00cc44');
  });
});

describe('flowConfidenceEnabled (master feature toggle)', () => {
  it('diagramInitialized stamps the field as true onto a diagram whose saved userDiagramOptions predates it, so the feature stays on for existing diagrams', () => {
    const legacyUserDiagramOptions = {
      strokeWidth: 2,
      edgeType: 'smoothstep',
      minimapVisible: false,
      controlsVisible: true,
      directionalArrowsVisible: true,
      showFlowLabels: true,
      flowLabelSize: 1,
      animated: false,
      // * intentionally no flowConfidenceEnabled key
    } as any;

    const legacyDiagramData = {
      name: 'legacy diagram',
      nodes: [],
      edges: [],
      diagramFlowErrors: {},
      userDiagramOptions: legacyUserDiagramOptions,
      settings: getDefaultSettings(),
      calculatedData: { nodes: {} },
      recentNodeColors: [],
      recentEdgeColors: [],
    } as any;

    const state = diagramSlice.reducer(getDefaultDiagramData(), diagramInitialized({
      diagramData: legacyDiagramData,
      parentContainer: { height: 100, headerHeight: 0, footerHeight: 0 },
      assessmentId: undefined,
    }));

    expect('flowConfidenceEnabled' in state.diagramOptions).toBe(true);
    expect(state.diagramOptions.flowConfidenceEnabled).toBe(true);
  });

  it('toggles off and back on via diagramOptionsChange', () => {
    let state = diagramSlice.reducer(getDefaultDiagramData(), diagramOptionsChange({ optionsProp: 'flowConfidenceEnabled', updatedValue: false }));
    expect(state.diagramOptions.flowConfidenceEnabled).toBe(false);

    state = diagramSlice.reducer(state, diagramOptionsChange({ optionsProp: 'flowConfidenceEnabled', updatedValue: true }));
    expect(state.diagramOptions.flowConfidenceEnabled).toBe(true);
  });
});
