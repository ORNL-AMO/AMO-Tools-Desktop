import type { PayloadAction } from '@reduxjs/toolkit';
import { Edge, Node } from '@xyflow/react';
import {
  CustomEdgeData,
  FlowConfidence,
  MAX_FLOW_DECIMALS,
  NodeFlowProperty,
  ProcessFlowPart,
  getNodeFlowTotals,
} from 'process-flow-lib';
import { getNodeSourceEdges, getNodeTargetEdges, setCalculatedNodeDataProperty, formatDecimalPlaces, formatNumberValue } from './FlowUtils';
import { EstimatedFlowResults } from '../Forms/WaterSystemEstimation/SystemEstimationFormUtils';
import type { DiagramState } from './diagramReducer';

/**
 * All state changes for "a flow value gets calculated or populated from a user event" (see
 * flow-calculation-requirements.md items A-I)
 */

export const totalFlowChangeReducer = (state: DiagramState, action: PayloadAction<{ flowProperty: NodeFlowProperty, totalFlow: number }>) => {
  const { flowProperty, totalFlow } = action.payload;
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((node: Node<ProcessFlowPart>) => state.selectedDataId === node.id) as Node<ProcessFlowPart>;
  updateNode.data.userEnteredData[flowProperty] = totalFlow;
}

export const sumTotalFlowChangeReducer = (state: DiagramState, action: PayloadAction<{ flowProperty: NodeFlowProperty, relatedEdges: Edge<CustomEdgeData>[] }>) => {
  const { flowProperty, relatedEdges } = action.payload;
  const updateNode: Node<ProcessFlowPart> = state.nodes.find((node: Node<ProcessFlowPart>) => state.selectedDataId === node.id) as Node<ProcessFlowPart>;
  const currentTotalFlow = updateNode.data.userEnteredData[flowProperty];

  const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(relatedEdges, state.nodes, state.selectedDataId);
  const sumAllFlows = flowProperty === 'totalSourceFlow' ? totalCalculatedSourceFlow : totalCalculatedDischargeFlow;
  updateNode.data.userEnteredData[flowProperty] = sumAllFlows ?? currentTotalFlow;
}

/**
 * Updates a node source edge flow value, updates the calculated node total flow, and propogates changes to connected inflow nodes and edges.
 */
export const sourceFlowValueChangeReducer = (state: DiagramState, action: PayloadAction<{ sourceEdgeId: string, flowValue: number }>) => {
  const { sourceEdgeId, flowValue } = action.payload;
  const sourceEdge: Edge<CustomEdgeData> = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === sourceEdgeId) as Edge<CustomEdgeData>;
  sourceEdge.data.flowValue = flowValue;

  const sourceEdges: Edge<CustomEdgeData>[] = getNodeSourceEdges(state.edges, state.selectedDataId) as Edge<CustomEdgeData>[];
  const { totalCalculatedSourceFlow } = getNodeFlowTotals(sourceEdges, state.nodes, state.selectedDataId);

  setCalculatedNodeDataProperty(state.calculatedData, state.selectedDataId, 'totalSourceFlow', totalCalculatedSourceFlow);
  populateConnectedInflowTotalsAndFlows(state, sourceEdges);
}

/**
 * Distributes a total flow value evenly across all source edges of the selected node. Propogates changes to connected inflow nodes and edges.
 */
export const distributeTotalSourceFlowReducer = (state: DiagramState, action: PayloadAction<number>) => {
  const totalFlowValue = action.payload;
  const componentSourceEdges: Edge<CustomEdgeData>[] = getNodeSourceEdges(state.edges, state.selectedDataId) as Edge<CustomEdgeData>[];
  const componentSourceEdgeIds: string[] = componentSourceEdges.map((edge: Edge<CustomEdgeData>) => edge.id);

  let dividedTotalFlow = totalFlowValue / componentSourceEdges.length;
  dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
    if (componentSourceEdgeIds.includes(edge.id)) {
      edge.data.flowValue = dividedTotalFlow;
    }
    return edge;
  });
  populateConnectedInflowTotalsAndFlows(state, componentSourceEdges);
}

/**
 * Updates a node discharge edge flow value, updates the calculated node total flow, and propogates changes to connected outflow nodes and edges.
 */
export const dischargeFlowValueChangeReducer = (state: DiagramState, action: PayloadAction<{ dischargeEdgeId: string, flowValue: number }>) => {
  const { dischargeEdgeId, flowValue } = action.payload;
  const dischargeEdge: Edge<CustomEdgeData> = state.edges.find((edge: Edge<CustomEdgeData>) => edge.id === dischargeEdgeId) as Edge<CustomEdgeData>;
  dischargeEdge.data.flowValue = flowValue;

  const dischargeEdges: Edge<CustomEdgeData>[] = getNodeTargetEdges(state.edges, state.selectedDataId) as Edge<CustomEdgeData>[];
  const { totalCalculatedDischargeFlow } = getNodeFlowTotals(dischargeEdges, state.nodes, state.selectedDataId);

  setCalculatedNodeDataProperty(state.calculatedData, state.selectedDataId, 'totalDischargeFlow', totalCalculatedDischargeFlow);
  populateConnectedOutflowTotalsAndFlows(state, dischargeEdges);
}

/**
 * Distributes a total flow value evenly across all discharge edges of the selected node. Propogates changes to connected outflow nodes and edges.
 */
export const distributeTotalDischargeFlowReducer = (state: DiagramState, action: PayloadAction<number>) => {
  const totalFlowValue = action.payload;
  const componentDischargeEdges: Edge<CustomEdgeData>[] = getNodeTargetEdges(state.edges, state.selectedDataId) as Edge<CustomEdgeData>[];
  const componentDischargeEdgesIds = componentDischargeEdges.map((edge: Edge<CustomEdgeData>) => edge.id);

  let dividedTotalFlow = totalFlowValue / componentDischargeEdges.length;
  dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
    if (componentDischargeEdgesIds.includes(edge.id)) {
      edge.data.flowValue = dividedTotalFlow;
    }
    return edge;
  });

  populateConnectedOutflowTotalsAndFlows(state, componentDischargeEdges);
}

export const applyEstimatedFlowResultsReducer = (state: DiagramState, action: PayloadAction<EstimatedFlowResults>) => {
  const { totalSourceFlow, totalDischargeFlow, knownLosses, waterInProduct } = action.payload;
  const updateNode = state.nodes.find((n: Node<ProcessFlowPart>) => n.data.diagramNodeId === state.selectedDataId) as Node<ProcessFlowPart | undefined>;
  if (updateNode) {
    // * NAN not serializable, causing maximum call stack exceeded - should fix in estimate components once validation/precision is known
    updateNode.data.userEnteredData.totalSourceFlow = Number(formatNumberValue(totalSourceFlow, 3));
    updateNode.data.userEnteredData.totalDischargeFlow = Number(formatNumberValue(totalDischargeFlow, 3));
    updateNode.data.userEnteredData.totalKnownLosses = Number(formatNumberValue(knownLosses, 3));
    updateNode.data.userEnteredData.waterInProduct = Number(formatNumberValue(waterInProduct, 3));
  }
}

/**
 * @param action  Map of edgeId to flow value>
 * @
 */
export const edgesChangeFromPropagationReducer = (state: DiagramState, action: PayloadAction<{
  flowUpdates: Record<string, number>,
  startingNodeId: string,
  initialEdgeId: string
}>) => {
  const { flowUpdates, initialEdgeId } = action.payload;
  // * downstream edges inherit the seed edge's own confidence, whatever it is (metered or estimated) -
  // * only the seed edge itself keeps its exact prior confidence untouched
  const seedEdge = state.edges.find(edge => edge.id === initialEdgeId) as Edge<CustomEdgeData>;
  const seedConfidence: FlowConfidence = seedEdge.data.confidence;
  const affectedNodeIds = new Set<string>();
  const updatedEdges: Edge<CustomEdgeData>[] = state.edges.map((edge) => {
    const newFlow = flowUpdates[edge.id];
    if (newFlow !== undefined) {
      edge.data.flowValue = newFlow;
      if (edge.id !== initialEdgeId) {
        edge.data.confidence = seedConfidence;
      }
      affectedNodeIds.add(edge.source);
      affectedNodeIds.add(edge.target);
    }
    return edge;
  }) as Edge<CustomEdgeData>[];

  // * a node's total confidence is 'metered' only when every one of its connected edges (not just
  // * the ones touched by this propagation batch) is metered, otherwise 'estimated'
  affectedNodeIds.forEach((nodeId) => {
    const node = state.nodes.find(n => n.id === nodeId) as Node<ProcessFlowPart> | undefined;
    if (!node) {
      return;
    }
    const outgoingEdges = getNodeTargetEdges(updatedEdges, nodeId);
    if (outgoingEdges.length) {
      node.data.flowConfidence.totalDischargeFlow = outgoingEdges.every(edge => edge.data.confidence === 'metered') ? 'metered' : 'estimated';
    }
    const incomingEdges = getNodeSourceEdges(updatedEdges, nodeId);
    if (incomingEdges.length) {
      node.data.flowConfidence.totalSourceFlow = incomingEdges.every(edge => edge.data.confidence === 'metered') ? 'metered' : 'estimated';
    }
  });

  // * recompute calculated totals for every node the cascade touched, same as the
  // * single-edit path (populateConnectedInflowTotalsAndFlows/populateConnectedOutflowTotalsAndFlows) -
  // * a node with a userEnteredData override still displays that override (see getNodeTotalFlow)
  affectedNodeIds.forEach((nodeId) => {
    const connectedEdges = [...getNodeSourceEdges(updatedEdges, nodeId), ...getNodeTargetEdges(updatedEdges, nodeId)];
    const { totalCalculatedSourceFlow, totalCalculatedDischargeFlow } = getNodeFlowTotals(connectedEdges, state.nodes, nodeId);
    setCalculatedNodeDataProperty(state.calculatedData, nodeId, 'totalSourceFlow', totalCalculatedSourceFlow);
    setCalculatedNodeDataProperty(state.calculatedData, nodeId, 'totalDischargeFlow', totalCalculatedDischargeFlow);
  });

  state.edges = updatedEdges;
};

/**
 * update calculated total flow values for inflow connected nodes
 */
const populateConnectedInflowTotalsAndFlows = (state: DiagramState, sourceEdges: Edge<CustomEdgeData>[]) => {
  const sourceNodeIds: string[] = sourceEdges.map((edge: Edge<CustomEdgeData>) => edge.source);
  state.nodes.forEach((node: Node<ProcessFlowPart>) => {
    if (sourceNodeIds.includes(node.id)) {
      const nodeDischargeEdges = getNodeTargetEdges(state.edges, node.id);
      const { totalCalculatedDischargeFlow } = getNodeFlowTotals(nodeDischargeEdges, state.nodes, node.id);
      setCalculatedNodeDataProperty(state.calculatedData, node.id, 'totalDischargeFlow', totalCalculatedDischargeFlow);
    }
  });
}

/**
 * update calculated total flow values for outflow connected nodes
 */
const populateConnectedOutflowTotalsAndFlows = (state: DiagramState, dischargeEdges: Edge<CustomEdgeData>[]) => {
  const dischargeNodeIds: string[] = dischargeEdges.map((edge: Edge<CustomEdgeData>) => edge.target);
  state.nodes.forEach((node: Node<ProcessFlowPart>) => {
    if (dischargeNodeIds.includes(node.id)) {
      const nodeSourceEdges = getNodeSourceEdges(state.edges, node.id);
      const { totalCalculatedSourceFlow } = getNodeFlowTotals(nodeSourceEdges, state.nodes, node.id);
      setCalculatedNodeDataProperty(state.calculatedData, node.id, 'totalSourceFlow', totalCalculatedSourceFlow);
    }
  });
}
