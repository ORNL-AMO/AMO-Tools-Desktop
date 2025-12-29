
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
