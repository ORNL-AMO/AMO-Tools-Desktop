import { Edge } from "@xyflow/react";
import { CustomEdgeData } from "../types/diagram";

/**
 * "Set all flow values to end of path" - starting from `edge`, splits its flow value evenly
 * across each downstream node's outgoing edges, recursing to the ends of the graph.
 * @returns map of edgeId -> new flow value for every edge the cascade touched
 */
export const calculateFlowPropagation = (
  currentNodeId: string,
  edge: Edge<CustomEdgeData>,
  edges: Edge<CustomEdgeData>[]
): Record<string, number> => {
  const flowUpdates: Record<string, number> = {};
  const pathNodes = new Set<string>();
  const inputFlow = edge.data.flowValue || 0;

  const traverse = (nodeId: string, flow: number, initialEdge?: Edge<CustomEdgeData>): void => {
    // Skip recycled flows
    if (pathNodes.has(nodeId)) {
      return;
    }
    pathNodes.add(nodeId);

    // If this is the first call and initialEdge is provided, only use that edge
    let outgoingEdges: Edge<CustomEdgeData>[];
    if (initialEdge) {
      outgoingEdges = [initialEdge];
    } else {
      outgoingEdges = edges.filter(edge => edge.source === nodeId);
    }

    if (outgoingEdges.length === 0) {
      pathNodes.delete(nodeId);
      return;
    }

    // Split flow evenly among all outgoing connections
    const flowPerEdge = flow / outgoingEdges.length;

    outgoingEdges.forEach(edge => {
      flowUpdates[edge.id] = flowPerEdge;
      // continue propagation from next node
      traverse(edge.target, flowPerEdge);
    });

    pathNodes.delete(nodeId);
  };

  traverse(currentNodeId, inputFlow, edge);
  return flowUpdates;
};
