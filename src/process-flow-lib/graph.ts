import { Edge, Node } from "@xyflow/react";
import { CustomEdgeData } from "./water/types/diagram";
import { RecycledFlowData } from "./water/logic/results";

export interface NodeGraphIndex {
  // nodeId, nodeId
  parentMap: Record<string, string[]>;
  // nodeId, nodeId
  childMap: Record<string, string[]>;
  // nodeId, nodeId
  siblingMap: Record<string, string[]>;
  // edgeId, edge
  edgeMap: Record<string, Edge<CustomEdgeData>>;
  // nodeId, edge[]
  edgesByNode: Record<string, Edge<CustomEdgeData>[]>;
}

export const createGraphIndex = (nodes: Node[], edges: Edge<CustomEdgeData>[]) => {
  const graph: NodeGraphIndex = {
    parentMap: {},
    childMap: {},
    siblingMap: {},
    edgeMap: {},
    edgesByNode: {},
  }

  for (const edge of edges) {
    const { source, target } = edge;

    // parent -> child
    graph.childMap[source] = [...(graph.childMap[source] || []), target];
    graph.parentMap[target] = [...(graph.parentMap[target] || []), source];

    // edges by node
    graph.edgesByNode[source] = [...(graph.edgesByNode[source] || []), edge];
    graph.edgesByNode[target] = [...(graph.edgesByNode[target] || []), edge];

    // edge map
    graph.edgeMap[edge.id] = edge;
  }

  return graph;
}


// todo combine below two methods, diff == maps
export const getAncestors = (nodeId: string, graph: NodeGraphIndex): string[] => {
  const visited = new Set<string>();
  const stack = [...(graph.parentMap[nodeId] || [])];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (!visited.has(current)) {
      visited.add(current);
      stack.push(...(graph.parentMap[current] || []));
    }
  }

  return [...visited];
}


export const getDescendants = (nodeId: string, graph: NodeGraphIndex): string[] => {
  const visited = new Set<string>();
  const stack = [...(graph.childMap[nodeId] || [])];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (!visited.has(current)) {
      visited.add(current);
      stack.push(...(graph.childMap[current] || []));
    }
  }

  return [...visited];
}


export const getDescendantsDFS = (
  nodeId: string,
  graph: NodeGraphIndex,
  searchDescendantId?: string
): string[] => {
  const visited = new Set<string>();
  const result: string[] = [];
  let found = false;

  const dfs = (current: string) => {
    if (!visited.has(current) && !found) {
      visited.add(current);
      result.push(current);
      if (current === searchDescendantId) {
        found = true;
        return;
      }
      for (const child of graph.childMap[current] || []) {
        dfs(child);
      }
    }
  };

  dfs(nodeId);
  return result;
};


export const getAncestorPathToNode = (
  nodeId: string,
  graph: NodeGraphIndex,
  searchAncestorId?: string
): string[] => {
  const visited = new Set<string>();
  const path: string[] = [];

  const dfs = (current: string): boolean => {
    if (visited.has(current)) {
      return false;
    }
    
    visited.add(current);
    path.push(current);
    
    if (current === searchAncestorId) {
      return true;
    }
    
    // Try each parent path
    for (const parent of graph.parentMap[current] || []) {
      if (dfs(parent)) {
        return true; 
      }
    }
    
    path.pop();
    return false;
  };

  dfs(nodeId);
  return path;
};

export const getAncestorTreatmentChain = (
  nodeId: string,
  graph: NodeGraphIndex,
  nodeMap: Record<string, Node>,
  processComponentType: string
): string[] => {
  const visited = new Set<string>();
  const path: string[] = [];

  const dfs = (current: string): boolean => {
    if (visited.has(current)) {
      return false;
    }

    visited.add(current);

    const node = nodeMap[current] as Node | undefined;
    if (!node || node.data.processComponentType !== processComponentType) {
      return true;
    }

    path.push(current);

    for (const parent of graph.parentMap[current] || []) {
      if (dfs(parent)) {
        return true;
      }
    }

    path.pop();
    return false;
  };

  dfs(nodeId);
  return path;
};

// todo combine with getancestorTreatmentChain, abstract graph child/parent map
export const getDescendantTreatmentChain = (
  nodeId: string,
  graph: NodeGraphIndex,
  nodeMap: Record<string, Node>,
  processComponentType: string
): string[] => {
  const visited = new Set<string>();
  const path: string[] = [];

  const dfs = (current: string): boolean => {
    if (visited.has(current)) {
      return false;
    }

    visited.add(current);

    const node = nodeMap[current] as Node | undefined;
    if (!node || node.data.processComponentType !== processComponentType) {
      return true;
    }

    path.push(current);

    for (const child of graph.childMap[current] || []) {
      if (dfs(child)) {
        return true;
      }
    }

    path.pop();
    return false;
  };

  dfs(nodeId);
  return path;
};

export const getDescendantHasSystem = (
  nodeId: string,
  graph: NodeGraphIndex,
  nodeMap: Record<string, Node>,
): boolean => {
  for (const childId of graph.childMap[nodeId] || []) {
    const childNode = nodeMap[childId] as Node | undefined;
    if (childNode && childNode.data.processComponentType === 'water-using-system') {
      return true;
    }
  }
  return false;
};