import type { PayloadAction } from '@reduxjs/toolkit';
import { Edge, Node } from '@xyflow/react';
import {
  CustomEdgeData,
  MAX_FLOW_DECIMALS,
  NodeFlowProperty,
  ProcessFlowPart,
  getNodeFlowTotals,
} from 'process-flow-lib';
import { ensureFlowTotalTouched, getNodeSourceEdges, getNodeTargetEdges, setCalculatedNodeDataProperty, formatDecimalPlaces, formatNumberValue, downgradeCalculatedEdgeOnManualEdit, voidTouchedTotalOnEdit, getLeastConfidentFlowConfidence } from './FlowUtils';
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
  ensureFlowTotalTouched(updateNode.data)[flowProperty] = true;
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

  const selectedNode = state.nodes.find((node: Node<ProcessFlowPart>) => node.id === state.selectedDataId) as Node<ProcessFlowPart> | undefined;
  voidTouchedTotalOnEdit(selectedNode, 'totalSourceFlow');
  downgradeCalculatedEdgeOnManualEdit(sourceEdge, selectedNode, 'totalSourceFlow');

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
  const selectedNode = state.nodes.find((node: Node<ProcessFlowPart>) => node.id === state.selectedDataId) as Node<ProcessFlowPart> | undefined;

  let dividedTotalFlow = totalFlowValue / componentSourceEdges.length;
  dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
    if (componentSourceEdgeIds.includes(edge.id)) {
      edge.data.flowValue = dividedTotalFlow;
      downgradeCalculatedEdgeOnManualEdit(edge, selectedNode, 'totalSourceFlow');
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

  const selectedNode = state.nodes.find((node: Node<ProcessFlowPart>) => node.id === state.selectedDataId) as Node<ProcessFlowPart> | undefined;
  voidTouchedTotalOnEdit(selectedNode, 'totalDischargeFlow');
  downgradeCalculatedEdgeOnManualEdit(dischargeEdge, selectedNode, 'totalDischargeFlow');

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
  const selectedNode = state.nodes.find((node: Node<ProcessFlowPart>) => node.id === state.selectedDataId) as Node<ProcessFlowPart> | undefined;

  let dividedTotalFlow = totalFlowValue / componentDischargeEdges.length;
  dividedTotalFlow = Number(formatDecimalPlaces(dividedTotalFlow, MAX_FLOW_DECIMALS));
  state.edges = state.edges.map((edge: Edge<CustomEdgeData>) => {
    if (componentDischargeEdgesIds.includes(edge.id)) {
      edge.data.flowValue = dividedTotalFlow;
      downgradeCalculatedEdgeOnManualEdit(edge, selectedNode, 'totalDischargeFlow');
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
  // * every edge the cascade writes a value into becomes 'calculated' - the seed edge itself
  // * (the flow the user is pushing from) keeps its own prior confidence untouched.
  // * Tracked as two separate sets (not one shared set) so we know exactly which SIDE of each
  // * node received a written edge - a pass-through node can appear via only one of its two
  // * sides, and a shared set can't distinguish that when re-deriving total confidence below.
  const dischargeTouchedNodeIds = new Set<string>(); // node's outgoing/discharge side got a written edge
  const sourceTouchedNodeIds = new Set<string>(); // node's incoming/source side got a written edge

  const updatedEdges: Edge<CustomEdgeData>[] = state.edges.map((edge: Edge<CustomEdgeData>) => {
    const newFlow = flowUpdates[edge.id];
    if (newFlow !== undefined) {
      edge.data.flowValue = newFlow;
      if (edge.id !== initialEdgeId) {
        edge.data.confidence = 'calculated';
      }
      dischargeTouchedNodeIds.add(edge.source);
      sourceTouchedNodeIds.add(edge.target);
    }
    return edge;
  }) as Edge<CustomEdgeData>[];

  // * group once so applyCascadeSideConfidence and the totals loop below don't each re-filter
  // * the full edge array per touched node - outgoingEdgesByNode mirrors getNodeTargetEdges
  // * (keyed by edge.source), incomingEdgesByNode mirrors getNodeSourceEdges (keyed by edge.target)
  const outgoingEdgesByNode = new Map<string, Edge<CustomEdgeData>[]>();
  const incomingEdgesByNode = new Map<string, Edge<CustomEdgeData>[]>();
  updatedEdges.forEach((edge) => {
    outgoingEdgesByNode.set(edge.source, [...(outgoingEdgesByNode.get(edge.source) ?? []), edge]);
    incomingEdgesByNode.set(edge.target, [...(incomingEdgesByNode.get(edge.target) ?? []), edge]);
  });

  const applyCascadeSideConfidence = (
    touchedNodeIds: Set<string>,
    flowProperty: NodeFlowProperty,
    sideEdgesByNode: Map<string, Edge<CustomEdgeData>[]>
  ) => {
    touchedNodeIds.forEach((nodeId) => {
      const node = state.nodes.find(n => n.id === nodeId) as Node<ProcessFlowPart> | undefined;
      if (!node) {
        return;
      }
      if (ensureFlowTotalTouched(node.data)[flowProperty]) {
        voidTouchedTotalOnEdit(node, flowProperty);
        return;
      }
      // * untouched: the total takes on the least-confident arrow on this side. Applies equally
      // * to a single-edge side (the trivial one-arrow case) and a many-edge side.
      const sideEdges = sideEdgesByNode.get(nodeId) ?? [];
      node.data.flowConfidence[flowProperty] = getLeastConfidentFlowConfidence(sideEdges);
    });
  };

  applyCascadeSideConfidence(dischargeTouchedNodeIds, 'totalDischargeFlow', outgoingEdgesByNode);
  applyCascadeSideConfidence(sourceTouchedNodeIds, 'totalSourceFlow', incomingEdgesByNode);

  // * recompute calculated totals for every node the cascade touched, same as the
  // * single-edit path (populateConnectedInflowTotalsAndFlows/populateConnectedOutflowTotalsAndFlows) -
  // * a node with a userEnteredData override still displays that override (see getNodeTotalFlow)
  const affectedNodeIds = new Set<string>([...dischargeTouchedNodeIds, ...sourceTouchedNodeIds]);
  affectedNodeIds.forEach((nodeId) => {
    const connectedEdges = [...(incomingEdgesByNode.get(nodeId) ?? []), ...(outgoingEdgesByNode.get(nodeId) ?? [])];
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
