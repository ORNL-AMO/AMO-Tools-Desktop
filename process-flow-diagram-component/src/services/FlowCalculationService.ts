import { diagramSlice } from "../components/Diagram/diagramReducer";
import { RootState } from "../components/Diagram/store";
import { CustomEdgeData, getConnectionFromEdgeId, ProcessFlowPart } from "process-flow-lib";
import { Edge } from "@xyflow/react";

export class FlowCalculationService {
  constructor(private store) {}

  /**
   * Propagates flow value from starting node to end of path
   */
  propagateFlowFromNode(nodeId: string, edge: Edge<CustomEdgeData>): void {
    const state: RootState = this.store.getState();
    const { nodes, edges } = state.diagram;

    const sourceNode = nodes.find(node => node.id === nodeId);
    console.log('sourceNode, inputFlow', sourceNode, edge.data.flowValue || 0);
    const flowUpdates: Record<string, number> = this.calculateFlowPropagation(nodeId, edge, edges);
    console.log('flow updates', flowUpdates);
    this.store.dispatch(diagramSlice.actions.edgesChangeFromPropagation({
      flowUpdates,
      startingNodeId: nodeId,
    }));

    // debugging path
    Object.entries(flowUpdates).forEach(([connectionId, flow]) => {
        const { source, target, sourceHandle, targetHandle } = getConnectionFromEdgeId(connectionId);
        const sourceNode = nodes.find(node => node.id === source);
        const targetNode = nodes.find(node => node.id === target);
        const sourceName = sourceNode?.data.name || source;
        const targetName = targetNode?.data.name || target;
        console.log(`Flow from ${sourceName} to ${targetName}: ${flow}`);
    });

  }

  /**
   * 
   * @returns Map of updated edges and their new flow values
   */
  private calculateFlowPropagation(
    currentNodeId: string, 
    edge: Edge<CustomEdgeData>,
    edges: any[]
  ): Record<string, number> {
    const flowUpdates: Record<string, number> = {};
    const pathNodes = new Set<string>();
    const inputFlow = edge.data.flowValue || 0;

    const traverse = (nodeId: string, flow: number, initialEdge?: Edge<CustomEdgeData>): void => {
      // Skip recycled flows
      if (pathNodes.has(nodeId)) {
        return; 
      }

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
  }

}