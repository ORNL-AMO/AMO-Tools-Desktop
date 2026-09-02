import { Edge, Node } from "@xyflow/react";
import { CustomEdgeData, ProcessFlowPart } from "../types/diagram";

export const getEdgeSourceAndTarget = (edge: Edge, nodes: Node[]) => {
  let target: ProcessFlowPart;
  let source: ProcessFlowPart;

  nodes.forEach((node: Node) => {
    if (node.id === edge.source) {
      source = node.data as ProcessFlowPart;
    }
    if (node.id === edge.target) {
      target = node.data as ProcessFlowPart;
    }
  });

  return { source, target };
}

export const getNodeFlowTotals = (connectedEdges: Edge[], nodes: Node[], selectedNodeId: string) => {
  let totalCalculatedSourceFlow = 0;
  let totalCalculatedDischargeFlow = 0;
  connectedEdges.map((edge: Edge<CustomEdgeData>) => {
    const { source, target } = getEdgeSourceAndTarget(edge, nodes);
    if (selectedNodeId === target?.diagramNodeId) {
      totalCalculatedSourceFlow += edge.data.flowValue ?? 0;
    } else if (selectedNodeId === source?.diagramNodeId) {
      totalCalculatedDischargeFlow += edge.data.flowValue ?? 0;
    }
  });

  return { totalCalculatedSourceFlow, totalCalculatedDischargeFlow };
}
