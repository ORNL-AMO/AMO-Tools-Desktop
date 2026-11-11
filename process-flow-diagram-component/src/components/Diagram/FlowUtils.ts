import { edgeTypes, nodeTypes } from "./FlowTypes";
import { DefaultEdgeOptions, EdgeTypes, ReactFlowInstance, Node, Edge, Connection, MarkerType } from "@xyflow/react";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";
import { CustomEdgeData, DiagramCalculatedData, getNewProcessComponent, getNewNode, WaterProcessComponentType, UserDiagramOptions, ProcessFlowPart, getNewNodeId, FlowDiagramData, NodeFlowData, MAX_FLOW_DECIMALS, getEdgeSourceAndTarget, NodeFlowProperty, FlowConfidence, getDefaultFlowTotalTouched } from "process-flow-lib";

export const getRandomCoordinates = (height: number, width: number): { x: number, y: number } => {
  const screenWidth = window.innerWidth;
  const screenHeight = height;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Generate random coordinates within the visible area
  const randomX = Math.random() * screenWidth + scrollX;
  const randomY = Math.random() * screenHeight + scrollY;
  return { x: randomX, y: randomY };
}

export const updateAssessmentCreatedNodes = (reactFlowInstance: ReactFlowInstance, staleNodes: Array<Node>, clientHeight: number) => {
  staleNodes = staleNodes.map((node: Node) => {
    if (!node.position) {
      setNodeFallbackPosition(reactFlowInstance, node, clientHeight);
    }

    node.type = getAdaptedTypeString(node.type)
    return node;
  });
  return staleNodes;
}

export const setCalculatedNodeDataProperty = (calculatedData: DiagramCalculatedData, nodeId: string, flowProperty: NodeFlowProperty, value: number) => {
  if (calculatedData.nodes[nodeId]) {
    calculatedData.nodes[nodeId][flowProperty] = value;
  } else {
    calculatedData.nodes[nodeId] = {
      [flowProperty]: value
    }
  }
}
/**
   * Mimick random drop point for nodes in the connected diagram parent (MEASUR assessment or other)
   * @param clientHeight parent height
   */
const setNodeFallbackPosition = (reactFlowInstance: ReactFlowInstance, node: Node, clientHeight: number) => {
  const screenPoint = getRandomCoordinates(clientHeight, undefined);
  const position = reactFlowInstance.screenToFlowPosition({
    x: screenPoint.x,
    y: screenPoint.y,
  });
  node.position = position;
}


export const getHasSources = (connectedEdges: Edge[], nodes: Node[], selectedNode: Node) => {
    return connectedEdges.some((edge: Edge) => {
        const { target } = getEdgeSourceAndTarget(edge, nodes);
        // * target is undefined for a dangling edge left pointing at a since-deleted node
        return target !== undefined && selectedNode.id === target.diagramNodeId;
    });
}

export const getHasTargets = (connectedEdges: Edge[], nodes: Node[], selectedNode: Node) => {
    return connectedEdges.some((edge: Edge) => {
         const { source } = getEdgeSourceAndTarget(edge, nodes);
         // * source is undefined for a dangling edge left pointing at a since-deleted node
         return source !== undefined && selectedNode.id === source.diagramNodeId;
     });
}

export const createNewNode = (nodeType: WaterProcessComponentType, position: { x: number, y: number }, existingNames?: string[]) => {
  let newNode: Node;
  if (nodeType.includes('splitter-node')) {
    newNode = {
      id: getNewNodeId(),
      type: nodeType,
      position: position,
      className: nodeType,
      data: {}
    };
  } else {
    const newProcessComponent = getNewProcessComponent(nodeType);
    newNode = getNewNode(nodeType, newProcessComponent, position);
  }

  newNode.type = getAdaptedTypeString(newNode.type);
  newNode = getUniqueName(newNode, existingNames);
  return newNode;
}

/**
   * Differentiate names quickly for debugging
   */
const getUniqueName = (newNode, existingNames, attempt = 1) => {
  const baseName = newNode.data.name.replace(/\s\(\d+\)$/, ""); 
  const newName = attempt === 1 ? baseName : `${baseName} (${attempt})`;
  if (!existingNames.includes(newName)) {
      newNode.data.name = newName;
      return newNode;
  }
  return getUniqueName(newNode, existingNames, attempt + 1);
};


export const getAdaptedTypeString = (nodeType: string) => {
  let adaptedString: string;
  switch (nodeType) {
    case 'water-intake':
      adaptedString = 'waterIntake';
      break;
    case 'water-using-system':
      adaptedString = 'waterUsingSystem'
      break;
    case 'water-discharge':
      adaptedString = 'waterDischarge'
      break;
    case 'water-treatment':
      adaptedString = 'waterTreatment'
      break;
    case 'waste-water-treatment':
      adaptedString = 'wasteWaterTreatment'
      break;
    case 'summing-node':
      adaptedString = 'summingNode'
      break;
    case 'known-loss':
      adaptedString = 'knownLoss'
      break;
    default:
      console.warn('No nodeType string detected - using default')
      adaptedString = 'default'
  }

  if (adaptedString !== 'default' && !nodeTypes[adaptedString]) {
    throw new Error('ProcessFlowNodeType string must be camelCased and added to custom NodeTypes object definition');
  }
  return adaptedString;
}


export const getEdgeDefaultOptions = (): DefaultEdgeOptions => {
  return {
    animated: true,
    type: 'smoothstep',
  }
};

export const getEdgeTypesFromString = (newDefaultType: string, currentEdgeTypes?: EdgeTypes): EdgeTypes => {
  if (!currentEdgeTypes) {
    currentEdgeTypes = edgeTypes;
  }

  switch (newDefaultType) {
    case 'bezier':
      currentEdgeTypes.default = BezierDiagramEdge;
      break;
    case 'straight':
      currentEdgeTypes.default = StraightDiagramEdge;
      break;
    case 'step':
      currentEdgeTypes.default = StepDiagramEdge;
      break;
    case 'smoothstep':
      currentEdgeTypes.default = SmoothStepDiagramEdge;
      break;
    default:
      currentEdgeTypes.default = BezierDiagramEdge;
  }

  return currentEdgeTypes;
};


export const formatDecimalPlaces = (value: number | string, decimalPlaces: number): number => {
  return Number(Number(value).toFixed(decimalPlaces));
}

export const formatNumberValue = (value: number | string, places: number): number | string => {
  if (value === undefined || value === null) {
    return '';
  }

  const numericValue = Number(value);

  if (isNaN(numericValue) || !isFinite(numericValue)) {
    return 0;
  }

  if (!Number.isInteger(numericValue)) {
    return Number(formatDecimalPlaces(numericValue, places));
  }
  
  return numericValue;
}

export const formatDataForMEASUR = (diagramData: FlowDiagramData): FlowDiagramData => {
  const processedNodes = diagramData.nodes.map((node: Node<ProcessFlowPart>) => {
    return {
      ...node,
      data: {
        ...node.data,
        modifiedDate: new Date().toISOString()
      }
    }
  });
  diagramData.nodes = processedNodes;
  return diagramData;
}

export const getNodeSourceEdges = (edges: Edge[], nodeId: string) => edges.filter((edge) => edge.target === nodeId);
export const getNodeTargetEdges = (edges: Edge[], nodeId: string) => edges.filter((edge) => edge.source === nodeId);

/**
 * Lazily initializes a node's flowTotalTouched map and returns it, so callers that need to
 * write into it don't each repeat the same undefined check.
 */
export const ensureFlowTotalTouched = (data: ProcessFlowPart): Record<NodeFlowProperty, boolean> => {
  if (!data.flowTotalTouched) {
    data.flowTotalTouched = getDefaultFlowTotalTouched();
  }
  return data.flowTotalTouched;
};

/**
 * A node's SOLE connected edge on a side mirrors its confidence onto that side's total,
 * unless the total has been independently touched by the user (explicit toggle or direct
 * value entry).
 */
export const mirrorSingleEdgeConfidenceToTotal = (
  node: Node<ProcessFlowPart>,
  flowProperty: NodeFlowProperty,
  edge: Edge<CustomEdgeData>
): void => {
  if (!node.data.flowTotalTouched?.[flowProperty]) {
    node.data.flowConfidence[flowProperty] = edge.data.confidence;
  }
};

/**
 * Editing a 'calculated' edge's value downgrades it to 'estimated' (edges already
 * estimated/metered are left alone). Mirrors the downgrade to the node's total for that side
 * too, unless the total has been independently touched.
 */
export const downgradeCalculatedEdgeOnManualEdit = (
  edge: Edge<CustomEdgeData>,
  node: Node<ProcessFlowPart> | undefined,
  flowProperty: NodeFlowProperty
): void => {
  if (edge.data.confidence !== 'calculated') {
    return;
  }
  edge.data.confidence = 'estimated';
  if (node && !node.data.flowTotalTouched?.[flowProperty]) {
    node.data.flowConfidence[flowProperty] = 'estimated';
  }
};

// * least-confident to most-confident: a touched total that's now stale needs to fall back to
// * the bottom of this scale, and an untouched total's confidence is the least-confident value
// * among all its arrows.
const FLOW_CONFIDENCE_RANK: Record<FlowConfidence, number> = { estimated: 0, calculated: 1, metered: 2 };

/**
 * An untouched total's confidence is the least-confident state among every arrow feeding that
 * side - a cascade's seed arrow keeps its own real confidence, every other arrow it writes
 * becomes 'calculated', and any arrow the cascade didn't touch at all keeps its own real
 * confidence too. A single-edge side is just the trivial one-arrow case of this same rule.
 */
export const getLeastConfidentFlowConfidence = (edges: Edge<CustomEdgeData>[]): FlowConfidence => {
  if (edges.length === 0) {
    return 'estimated';
  }
  return edges.reduce<FlowConfidence>(
    (worst, edge) => FLOW_CONFIDENCE_RANK[edge.data.confidence] < FLOW_CONFIDENCE_RANK[worst] ? edge.data.confidence : worst,
    'metered'
  );
};

/**
 * A touched total represents a specific number the user vouched for directly. Any edit to any
 * arrow on that side - a manual edit or a cascade - means that vouched-for number no longer
 * reflects what's actually there, so it voids back to 'estimated' and stops counting as touched.
 * No-op if the total isn't touched.
 */
export const voidTouchedTotalOnEdit = (node: Node<ProcessFlowPart> | undefined, flowProperty: NodeFlowProperty): void => {
  if (!node?.data.flowTotalTouched?.[flowProperty]) {
    return;
  }
  node.data.flowConfidence[flowProperty] = 'estimated';
  node.data.flowTotalTouched[flowProperty] = false;
};

/**
 * Retrieve user input total flow, otherwise calculated total flow
 */
export const getNodeTotalFlow = (flowProperty: NodeFlowProperty, calculatedNode: NodeFlowData, nodes: Node<ProcessFlowPart>[], nodeId?: string) => {
   const selectedNode: Node<ProcessFlowPart> = nodes.find((node: Node<ProcessFlowPart>) => node.id === nodeId);
   if (!selectedNode) {
     return null;
   }
   if (selectedNode.data.userEnteredData[flowProperty] !== undefined) {
     return selectedNode.data.userEnteredData[flowProperty];
   } else if (calculatedNode) {
     return calculatedNode[flowProperty];
   } else {
     return null;
   }
}

export const getFlowValueFromPercent = (flowValue: number, totalFlow: number) => {
  let flowValueConverted = (flowValue / 100) * totalFlow;
  flowValueConverted = Number(formatDecimalPlaces(flowValueConverted, MAX_FLOW_DECIMALS));
  return flowValueConverted;
}

export const getFlowValuePercent = (flowValue: number, totalFlow: number) => {
  let flowValueConverted = (flowValue / totalFlow) * 100;
  flowValueConverted = Number(formatDecimalPlaces(flowValueConverted, MAX_FLOW_DECIMALS));
  return flowValueConverted;
}

export const getFlowDisplayValues = (componentEdges: Edge<CustomEdgeData>[]) => {
  return componentEdges.map((edge: Edge<CustomEdgeData>) => {
    let flowValue: number | string = edge.data.flowValue ?? '';
    return flowValue;
  });
}