import { Edge } from "@xyflow/react";
import { CustomEdgeData } from "../types/diagram";

// * an edge with no real value yet - matches the "unset" definition DischargeFlowForm.tsx
// * already uses to gate its propagate button (0 counts as unset, not a real recorded flow)
const isFlowUnset = (flowValue: number | null | undefined): boolean =>
  flowValue === null || flowValue === undefined || flowValue === 0;

/**
 * "Set all flow values to end of path" - starting from `edge`, splits its flow value across
 * each downstream node's outgoing edges, recursing to the ends of the graph. Edges that already
 * carry a real flow value are left untouched; only the remaining flow (total minus whatever the
 * already-filled siblings account for) is split across the edges still unset at that node. A
 * node whose outgoing edges are all already filled is left alone entirely. Two branches that
 * reconverge on a shared downstream node (e.g. two systems feeding one shared treatment node)
 * have their flows summed at that node rather than the later branch overwriting the earlier one.
 * @returns map of edgeId -> new flow value for every edge the cascade touched
 */
export const calculateFlowPropagation = (
  currentNodeId: string,
  edge: Edge<CustomEdgeData>,
  edges: Edge<CustomEdgeData>[]
): Record<string, number> => {
  const flowUpdates: Record<string, number> = {};
  const pathNodes = new Set<string>();
  const nodeInflow: Record<string, number> = {};
  const inputFlow = edge.data.flowValue || 0;

  const traverse = (nodeId: string, flow: number, initialEdge?: Edge<CustomEdgeData>): void => {
    // Skip recycled flows
    if (pathNodes.has(nodeId)) {
      return;
    }
    pathNodes.add(nodeId);

    // On the first call, the seed edge is the one the user clicked propagate on - it always
    // carries the flow forward regardless of its own value, it's not a sibling to weigh against
    if (initialEdge) {
      flowUpdates[initialEdge.id] = flow;
      traverse(initialEdge.target, flow);
      pathNodes.delete(nodeId);
      return;
    }

    // A reconverging branch reaches this node in a separate traverse() call (pathNodes only
    // guards against cycles within a single branch, not repeat arrivals from different branches),
    // so accumulate rather than overwrite - the branch that arrives last re-splits downstream
    // edges using the full combined total.
    nodeInflow[nodeId] = (nodeInflow[nodeId] ?? 0) + flow;
    const totalInflow = nodeInflow[nodeId];

    const outgoingEdges = edges.filter(edge => edge.source === nodeId);

    if (outgoingEdges.length === 0) {
      pathNodes.delete(nodeId);
      return;
    }

    const unsetEdges = outgoingEdges.filter(edge => isFlowUnset(edge.data.flowValue));
    const setEdges = outgoingEdges.filter(edge => !isFlowUnset(edge.data.flowValue));

    if (unsetEdges.length === 0) {
      // every outgoing edge already has a real value - nothing for this cascade to populate here
      pathNodes.delete(nodeId);
      return;
    }

    const sumOfSetEdges = setEdges.reduce((sum, edge) => sum + (edge.data.flowValue ?? 0), 0);
    const remainingFlow = totalInflow - sumOfSetEdges;
    const flowPerEdge = remainingFlow / unsetEdges.length;

    unsetEdges.forEach(edge => {
      flowUpdates[edge.id] = flowPerEdge;
      // continue propagation from next node
      traverse(edge.target, flowPerEdge);
    });

    pathNodes.delete(nodeId);
  };

  traverse(currentNodeId, inputFlow, edge);
  return flowUpdates;
};
