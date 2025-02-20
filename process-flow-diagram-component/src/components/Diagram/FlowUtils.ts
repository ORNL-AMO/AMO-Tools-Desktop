import { Connection, Edge, MarkerType, Node, ReactFlowInstance, addEdge } from "reactflow";
import { edgeTypes, nodeTypes } from "./FlowTypes";
import { CustomEdgeData, getNewNode, getNewNodeId, getNewProcessComponent, ProcessFlowPart, UserDiagramOptions, WaterProcessComponentType, DiagramSettings, FlowDiagramData, DiagramCalculatedData, NodeFlowData } from "../../../../src/process-flow-types/shared-process-flow-types";
import { DefaultEdgeOptions, EdgeTypes } from "@xyflow/react";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";
import { NodeFlowProperty } from "./diagramReducer";

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

export const getNodeFlowTotals = (connectedEdges: Edge[], nodes: Node[], selectedNodeId: string) => {
  let totalCalculatedSourceFlow = 0;
  let totalCalculatedDischargeFlow = 0;
  connectedEdges.map((edge: Edge<CustomEdgeData>) => {
    const { source, target } = getEdgeSourceAndTarget(edge, nodes);
    if (selectedNodeId === target.diagramNodeId) {
      totalCalculatedSourceFlow += edge.data.flowValue;
    } else if (selectedNodeId === source.diagramNodeId) {
      totalCalculatedDischargeFlow += edge.data.flowValue;
    }
  });

  return { totalCalculatedSourceFlow, totalCalculatedDischargeFlow };
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


export const getDefaultNodeFromType = (nodeType: WaterProcessComponentType): Node => {
  const newProcessComponent = getNewProcessComponent(nodeType);
    const newNode: Node = getNewNode(nodeType, newProcessComponent);
    return newNode;
}


/**
* edge ids are not gauranteed to be unique. They only include nodeid-nodeid. source and target handles must be looked at to identify uniqueness of edge 
* 
*/
export const getEdgeFromConnection = (
  connectedParams: Connection | Edge, 
  userDiagramOptions: UserDiagramOptions,
  ) => {
    connectedParams = connectedParams as Edge;
    if (connectedParams.source === connectedParams.target) {
      connectedParams.type = 'selfconnecting';
    }

    if (userDiagramOptions.directionalArrowsVisible) {
      connectedParams.markerEnd = {
        type: MarkerType.ArrowClosed,
        width: 25,
        height: 25
      }
    }
  
    connectedParams.data = {
      flowValue: 0,
    }
  
    if (connectedParams.style === undefined) {
      connectedParams.style = {
        stroke: '#6c757d',
        strokeWidth: userDiagramOptions.strokeWidth
      }
    }

    return connectedParams;
}


export const getEdgeSourceAndTarget = (edge: Edge, nodes: Node[]) => {
  let target: ProcessFlowPart;
  let source: ProcessFlowPart;

  nodes.forEach((node: Node) => {
    if (node.id === edge.source) {
      source = node.data;
    }
    if (node.id === edge.target) {
      target = node.data;
    }
  });

  return { source, target };

}

export const createNewNode = (nodeType: WaterProcessComponentType, position: { x: number, y: number }) => {
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
    // ( debugging )
    // newProcessComponent.name = newProcessComponent.diagramNodeId;
    newNode = getNewNode(nodeType, newProcessComponent, position);
  }
  newNode.type = getAdaptedTypeString(newNode.type);
  return newNode;
}

export const getAdaptedTypeString = (nodeType: string) => {
  let adaptedString: string;
  console.log(nodeType);
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
    case 'splitter-node':
      adaptedString = 'splitterNode'
      break;
    case 'splitter-node-4':
      adaptedString = 'splitterNodeFour'
      break;
    case 'splitter-node-8':
      adaptedString = 'splitterNodeEight'
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


export const formatDecimalPlaces = (value: number | string, decimalPlaces: number) => {
  return Number(value).toFixed(decimalPlaces);
}

export const formatNumberValue = (value: number | string, places: number): number | string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (!Number.isInteger(Number(value))) {
    value = Number(formatDecimalPlaces(value, places));
  }
  return value;
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

export const getNodeTotalFlow = (flowProperty: NodeFlowProperty, calculatedNode: NodeFlowData, nodes: Node<ProcessFlowPart>[], nodeId?: string) => {
   const selectedNode: Node<ProcessFlowPart> = nodes.find((node: Node<ProcessFlowPart>) => node.id === nodeId);
   if (selectedNode.data.userEnteredData[flowProperty] !== undefined) {
     return selectedNode.data.userEnteredData[flowProperty];
   } else if (calculatedNode) {
     return calculatedNode[flowProperty];
   } else {
     return 0;
   }
}

