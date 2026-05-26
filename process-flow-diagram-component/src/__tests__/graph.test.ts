import { describe, it, expect } from 'vitest';
import {
  createGraphIndex,
  getAllDownstreamEdgePaths,
  getAllUpstreamEdgePaths,
} from 'process-flow-lib';
import {
  makeIntakeNode,
  makeSystemNode,
  makeDischargeNode,
  makeEdge,
} from '../__fixtures__/builders';

// Nodes and edges shared across graph utility tests
const intake = makeIntakeNode('intake');
const system = makeSystemNode('system');
const discharge = makeDischargeNode('discharge');

const e1 = makeEdge('intake', 'system', 100);
const e2 = makeEdge('system', 'discharge', 80);

const linearNodes = [intake, system, discharge];
const linearEdges = [e1, e2];

describe('createGraphIndex', () => {
  it('builds child map entries for each edge source', () => {
    const graph = createGraphIndex(linearNodes, linearEdges);
    expect(graph.childMap['intake']).toContain('system');
    expect(graph.childMap['system']).toContain('discharge');
  });

  it('builds parent map entries for each edge target', () => {
    const graph = createGraphIndex(linearNodes, linearEdges);
    expect(graph.parentMap['system']).toContain('intake');
    expect(graph.parentMap['discharge']).toContain('system');
  });

  it('maps every edge ID to its edge object', () => {
    const graph = createGraphIndex(linearNodes, linearEdges);
    expect(graph.edgeMap[e1.id]).toBeDefined();
    expect(graph.edgeMap[e1.id].source).toBe('intake');
    expect(graph.edgeMap[e1.id].target).toBe('system');
    expect(graph.edgeMap[e2.id]).toBeDefined();
  });

  it('groups edges by both their source and target node', () => {
    const graph = createGraphIndex(linearNodes, linearEdges);
    const edgesAtSystem = graph.edgesByNode['system'];
    const edgeIds = edgesAtSystem.map((e) => e.id);
    expect(edgeIds).toContain(e1.id);
    expect(edgeIds).toContain(e2.id);
  });

  it('populates nodeMap with all nodes', () => {
    const graph = createGraphIndex(linearNodes, linearEdges);
    expect(graph.nodeMap?.['intake']).toBeDefined();
    expect(graph.nodeMap?.['system']).toBeDefined();
    expect(graph.nodeMap?.['discharge']).toBeDefined();
  });
});

describe('getAllDownstreamEdgePaths', () => {
  it('returns one path containing the single edge for a two-node graph', () => {
    const graph = createGraphIndex([intake, system], [e1]);
    const paths = getAllDownstreamEdgePaths('intake', graph);
    expect(paths).toHaveLength(1);
    expect(paths[0]).toEqual([e1.id]);
  });

  it('returns one path for a linear three-node graph', () => {
    const graph = createGraphIndex(linearNodes, linearEdges);
    const paths = getAllDownstreamEdgePaths('intake', graph);
    expect(paths).toHaveLength(1);
    expect(paths[0]).toEqual([e1.id, e2.id]);
  });

  it('returns two paths when a node branches to two children', () => {
    const sysA = makeSystemNode('sysA');
    const sysB = makeSystemNode('sysB');
    const eA = makeEdge('intake', 'sysA', 60);
    const eB = makeEdge('intake', 'sysB', 40);
    const graph = createGraphIndex([intake, sysA, sysB], [eA, eB]);

    const paths = getAllDownstreamEdgePaths('intake', graph);
    expect(paths).toHaveLength(2);
    const flatIds = paths.map((p) => p[0]);
    expect(flatIds).toContain(eA.id);
    expect(flatIds).toContain(eB.id);
  });
});

describe('getAllUpstreamEdgePaths', () => {
  it('returns one path containing the single edge for a two-node graph', () => {
    const graph = createGraphIndex([system, discharge], [e2]);
    const paths = getAllUpstreamEdgePaths('discharge', graph);
    expect(paths).toHaveLength(1);
    expect(paths[0]).toEqual([e2.id]);
  });

  it('returns one path for a linear three-node graph starting at the leaf', () => {
    const graph = createGraphIndex(linearNodes, linearEdges);
    const paths = getAllUpstreamEdgePaths('discharge', graph);
    expect(paths).toHaveLength(1);
    expect(paths[0]).toEqual([e2.id, e1.id]);
  });

  it('returns two paths when a node has two parents', () => {
    const sysA = makeSystemNode('sysA');
    const sysB = makeSystemNode('sysB');
    const eA = makeEdge('sysA', 'discharge', 60);
    const eB = makeEdge('sysB', 'discharge', 40);
    const graph = createGraphIndex([sysA, sysB, discharge], [eA, eB]);

    const paths = getAllUpstreamEdgePaths('discharge', graph);
    expect(paths).toHaveLength(2);
    const flatIds = paths.map((p) => p[0]);
    expect(flatIds).toContain(eA.id);
    expect(flatIds).toContain(eB.id);
  });
});
