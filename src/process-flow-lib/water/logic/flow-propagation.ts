import { Edge } from "@xyflow/react";
import { CustomEdgeData } from "../types/diagram";

// * a Metered edge is a real, user-vouched-for measurement - the cascade conserves it rather
// * than overwriting it like every other (estimated/calculated) edge
const isMetered = (edge: Edge<CustomEdgeData>): boolean => edge.data.confidence === 'metered';

/**
 * "Set all flow values to end of path" - starting from `edge`, splits its flow value across
 * each downstream node's outgoing edges, recursing to the ends of the graph. Every outgoing edge
 * is overwritten with an even split of that node's inflow, EXCEPT an edge the user has explicitly
 * locked to Metered - that edge (and the path past it) is left untouched, and its value is
 * conserved against the total so the remaining edges only split what's left. A node whose
 * outgoing edges are all Metered is left alone entirely. Two branches that reconverge on a
 * shared downstream node (e.g. two systems feeding one shared treatment node) have their flows
 * summed at that node rather than the later branch overwriting the earlier one.
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
    // carries the flow forward regardless of its own value or confidence, it's not a sibling to
    // weigh against
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

    const meteredEdges = outgoingEdges.filter(isMetered);
    const splitEdges = outgoingEdges.filter(edge => !isMetered(edge));

    if (splitEdges.length === 0) {
      // every outgoing edge is a locked measurement - nothing for this cascade to overwrite here
      pathNodes.delete(nodeId);
      return;
    }

    const meteredFlow = meteredEdges.reduce((sum, edge) => sum + (edge.data.flowValue ?? 0), 0);
    const flowPerEdge = (totalInflow - meteredFlow) / splitEdges.length;

    splitEdges.forEach(edge => {
      flowUpdates[edge.id] = flowPerEdge;
      // continue propagation from next node
      traverse(edge.target, flowPerEdge);
    });

    pathNodes.delete(nodeId);
  };

  traverse(currentNodeId, inputFlow, edge);
  return flowUpdates;
};
