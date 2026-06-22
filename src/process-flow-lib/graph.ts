
import { Edge, Node } from "@xyflow/react";
import { CustomEdgeData } from "./water/types/diagram";
import { getEdgeDescription } from "./water/logic/water-components";

export interface NodeGraphIndex {
  // nodeId, nodeId
  parentMap: Record<string, string[]>;
  // nodeId, nodeId
  childMap: Record<string, string[]>;
  // edgeId, edge
  edgeMap: Record<string, Edge<CustomEdgeData>>;
  // nodeId, edge[]
  edgesByNode: Record<string, Edge<CustomEdgeData>[]>;
  // nodeId, node
  nodeMap?: Record<string, Node>;
  // Keyed by the owning water-using system's node ID. Populated when an RO water treatment diagram configuration is met
  roSingleSystemIndex?: Record<string, { intakeNodes: Node[], treatmentNode: Node, roRejectDischargeNode: Node, wasteTreatmentNode?: Node }>;
}

export const createGraphIndex = (nodes: Node[], edges: Edge<CustomEdgeData>[]) => {
  const graph: NodeGraphIndex = {
    parentMap: {},
    childMap: {},
    edgeMap: {},
    edgesByNode: {},
  }

  for (const edge of edges) {
    const { source, target } = edge;

    graph.childMap[source] = [...(graph.childMap[source] || []), target];
    graph.parentMap[target] = [...(graph.parentMap[target] || []), source];

    graph.edgesByNode[source] = [...(graph.edgesByNode[source] || []), edge];
    graph.edgesByNode[target] = [...(graph.edgesByNode[target] || []), edge];

    graph.edgeMap[edge.id] = {
      ...edge,
      data: {
        ...edge.data,
        edgeDescription: getEdgeDescription(edge, graph)
      }
    };

    graph.nodeMap = {};
    for (const node of nodes) {
      graph.nodeMap[node.id] = node;
    }
  }

  return graph;
}


export const getAllUpstreamEdgePaths = (
  nodeId: string,
  graph: NodeGraphIndex
): string[][] => {
  const allPaths: string[][] = [];
  const path: string[] = [];

  const dfs = (current: string) => {
    const parents = graph.parentMap[current] || [];
    if (parents.length === 0) {
      allPaths.push([...path]);
    } else {
      for (const parent of parents) {
        // Find the edge id connecting parent -> current
        const edges = graph.edgesByNode[current] || [];
        const edge = edges.find(e => e.source === parent && e.target === current);
        if (edge) {
          path.push(edge.id);
          dfs(parent);
          path.pop();
        }
      }
    }
  };

  dfs(nodeId);
  return allPaths;
};


export const getAllDownstreamEdgePaths = (
  nodeId: string,
  graph: NodeGraphIndex
): string[][] => {
  const allPaths: string[][] = [];
  const path: string[] = [];

  const dfs = (current: string) => {
    const children = graph.childMap[current] || [];
    if (children.length === 0) {
      allPaths.push([...path]);
    } else {
      for (const child of children) {
        // Find the edge id connecting current -> child
        const edges = graph.edgesByNode[current] || [];
        const edge = edges.find(e => e.source === current && e.target === child);
        if (edge) {
          path.push(edge.id);
          dfs(child);
          path.pop();
        }
      }
    }
  };

  dfs(nodeId);
  return allPaths;
};

export const getEdgeSourceTarget = (
  edgeId: string,
  graph: NodeGraphIndex
): { source: string; target: string } | undefined => {
  const edge = graph.edgeMap[edgeId];
  if (!edge) return undefined;
  return { source: edge.source, target: edge.target };
};

export const buildROSingleSystemIndex = (graph: NodeGraphIndex): void => {
  graph.roSingleSystemIndex = {};

  if (!graph.nodeMap) return;

  const traverseSubtree = (startNodeId: string): {
    waterUsingSystems: string[],
    waterDischarges: string[],
    wasteTreatments: string[]
  } => {
    const result = { waterUsingSystems: [] as string[], waterDischarges: [] as string[], wasteTreatments: [] as string[] };
    const visited = new Set<string>();
    const stack = [startNodeId];
    while (stack.length > 0) {
      const nodeId = stack.pop()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      const node = graph.nodeMap![nodeId];
      if (!node) continue;
      const type = (node.data as any).processComponentType;
      if (type === 'water-using-system') result.waterUsingSystems.push(nodeId);
      if (type === 'water-discharge') result.waterDischarges.push(nodeId);
      if (type === 'waste-water-treatment') result.wasteTreatments.push(nodeId);
      for (const childId of (graph.childMap[nodeId] || [])) {
        if (!visited.has(childId)) stack.push(childId);
      }
    }
    return result;
  };

  for (const [nodeId, node] of Object.entries(graph.nodeMap)) {
    const data = node.data as any;
    if (data.processComponentType !== 'water-treatment' || data.treatmentType !== 6) continue;

    // Criterion 2: exactly two immediate children downstream of the RO node
    const roChildren = graph.childMap[nodeId] || [];
    if (roChildren.length !== 2) continue;

    const subtrees = roChildren.map(childId => traverseSubtree(childId));

    // Criteria 3 & 4: identify which subtree is the product path and which is the reject path
    let productSubtree: ReturnType<typeof traverseSubtree> | undefined;
    let rejectSubtree: ReturnType<typeof traverseSubtree> | undefined;

    for (let i = 0; i < 2; i++) {
      const st = subtrees[i];
      const isProductCandidate = st.waterUsingSystems.length === 1 && st.waterDischarges.length === 1;
      const isRejectCandidate = st.waterUsingSystems.length === 0 && st.waterDischarges.length === 1 && st.wasteTreatments.length <= 1;
      if (isProductCandidate && !productSubtree) {
        productSubtree = st;
      } else if (isRejectCandidate && !rejectSubtree) {
        rejectSubtree = st;
      }
    }

    if (!productSubtree || !rejectSubtree) continue;

    // Criterion 5: exactly one water-intake upstream of the RO node
    const foundIntakes: string[] = [];
    const upstreamVisited = new Set<string>();
    const upstreamStack = [nodeId];
    while (upstreamStack.length > 0) {
      const curId = upstreamStack.pop()!;
      if (upstreamVisited.has(curId)) continue;
      upstreamVisited.add(curId);
      const curNode = graph.nodeMap![curId];
      if (!curNode) continue;
      if ((curNode.data as any).processComponentType === 'water-intake') foundIntakes.push(curId);
      for (const parentId of (graph.parentMap[curId] || [])) {
        if (!upstreamVisited.has(parentId)) upstreamStack.push(parentId);
      }
    }
    if (foundIntakes.length < 1) continue;

    // Criterion 5b: each upstream intake must feed exclusively into the RO subtree
    const exclusiveIntakes = foundIntakes.filter(intakeId =>
      (graph.childMap[intakeId] || []).every(childId => upstreamVisited.has(childId))
    );
    if (exclusiveIntakes.length !== foundIntakes.length) continue;

    const productSystemId = productSubtree.waterUsingSystems[0];
    const rejectDischargeId = rejectSubtree.waterDischarges[0];
    const wasteTreatmentId = rejectSubtree.wasteTreatments[0];

    // Criterion 6: exclusive WWT guard — every parent of the reject-path WWT must be the RO node or the product-path system
    if (wasteTreatmentId) {
      const wwtParents = graph.parentMap[wasteTreatmentId] || [];
      const allowedParents = new Set([nodeId, productSystemId]);
      if (wwtParents.some(parentId => !allowedParents.has(parentId))) continue;
    }

    graph.roSingleSystemIndex[productSystemId] = {
      intakeNodes: foundIntakes.map(id => graph.nodeMap![id]),
      treatmentNode: node,
      roRejectDischargeNode: graph.nodeMap![rejectDischargeId],
      wasteTreatmentNode: wasteTreatmentId ? graph.nodeMap![wasteTreatmentId] : undefined,
    };
  }
};
