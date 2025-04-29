import { Edge, Node } from "@xyflow/react";
import { CustomEdgeData } from "./water/types/diagram";

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
  
// export const getSiblings = (nodeId: string, graph: GraphIndex): string[] => {
//     const parents = graph.parentMap[nodeId] || [];
  
//     const siblingSet = new Set<string>();
  
//     for (const parent of parents) {
//       const children = graph.childMap[parent] || [];
//       for (const child of children) {
//         if (child !== nodeId) siblingSet.add(child);
//       }
//     }
  
//     return [...siblingSet];
//   }
  




