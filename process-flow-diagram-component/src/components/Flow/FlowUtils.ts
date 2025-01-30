import { Connection, Edge, MarkerType, Node, ReactFlowInstance, addEdge } from "reactflow";
import { edgeTypes, nodeTypes } from "./FlowTypes";
import { CustomEdgeData, NodeCalculatedData, getNewNode, getNewNodeId, getNewProcessComponent, ProcessFlowPart, UserDiagramOptions, WaterProcessComponentType, DiagramSettings } from "../../../../src/process-flow-types/shared-process-flow-types";
import { DefaultEdgeOptions, EdgeTypes, useHandleConnections } from "@xyflow/react";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";

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

export const updateStaleNodes = (reactFlowInstance: ReactFlowInstance, staleNodes: Array<Node>, clientHeight: number) => {
  staleNodes = staleNodes.map((node: Node) => {
    if (!node.position) {
      setNodeFallbackPosition(reactFlowInstance, node, clientHeight);
    }

    node.type = getAdaptedTypeString(node.type)
    return node;
  });
  return staleNodes;
}

export const updateNodeCalculatedDataMap = (
  node: Node, 
  nodes: Node[], 
  nodeEdges: Edge[], 
  nodeCalculatedDataMap: Record<string, NodeCalculatedData>,
  setNodeCalculatedData: (updatedData: Record<string, NodeCalculatedData>) => void
) => {
  const {
    sourceCalculatedTotalFlow,
    dischargeCalculatedTotalFlow
  } = getNodeFlowTotals(nodeEdges, nodes, node.id);
  let calculatedData = { ...nodeCalculatedDataMap[node.id] };
  if (node.data.processComponentType === 'water-intake') {
    calculatedData.totalDischargeFlow = dischargeCalculatedTotalFlow;
  } else if (node.data.processComponentType === 'water-discharge') {
    calculatedData.totalSourceFlow = sourceCalculatedTotalFlow;
  }
  nodeCalculatedDataMap[node.id] = calculatedData;
  setNodeCalculatedData(nodeCalculatedDataMap);
}

export const getNodeFlowTotals = (connectedEdges: Edge[], nodes: Node[], selectedNodeId: string) => {
  let sourceCalculatedTotalFlow = 0;
  let dischargeCalculatedTotalFlow = 0;
  connectedEdges.map((edge: Edge<CustomEdgeData>) => {
    const { source, target } = getEdgeSourceAndTarget(edge, nodes);
    if (selectedNodeId === target.diagramNodeId) {
      sourceCalculatedTotalFlow += edge.data.flowValue;
    } else if (selectedNodeId === source.diagramNodeId) {
      dischargeCalculatedTotalFlow += edge.data.flowValue;
    }
  });

  return { sourceCalculatedTotalFlow, dischargeCalculatedTotalFlow };
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

export const setDroppedNode = (event, 
  reactFlowInstance: ReactFlowInstance, 
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>) => {
  event.preventDefault();
  const nodeType = event.dataTransfer.getData('application/reactflow');
  if (typeof nodeType === 'undefined' || !nodeType) {
    return;
  }
  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

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

  setNodes((nds) => {
    return nds.concat(newNode)
  });
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
export const setCustomEdges = (setEdges: React.Dispatch<React.SetStateAction<Edge[]>>, 
  connectedParams: Connection | Edge, 
  userDiagramOptions: UserDiagramOptions,
  ) => {
  setEdges((eds: Edge[]) => {
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
        strokeWidth: userDiagramOptions.edgeThickness
      }
    }

    return addEdge(connectedParams, eds);
  })
}

export const changeExistingEdgesType = (setEdges, diagramEdgeType: string) => {
  setEdges((eds) => {
    return eds.map((edge: Edge<CustomEdgeData>) => {
      // * ignore self-connecting
      if (edge.source !== edge.target) {
        if (edge.data.hasOwnEdgeType !== undefined) {
          edge.type = edge.data.hasOwnEdgeType;
        } else {
          edge.type = diagramEdgeType;
        }
      }
      return edge;
    });
  });
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
  const newEdgeTypes: EdgeTypes = {
    ...currentEdgeTypes
  }
  switch (newDefaultType) {
    case 'bezier':
      newEdgeTypes.default = BezierDiagramEdge;
      break;
    case 'straight':
      newEdgeTypes.default = StraightDiagramEdge;
      break;
    case 'step':
      newEdgeTypes.default = StepDiagramEdge;
      break;
    case 'smoothstep':
      newEdgeTypes.default = SmoothStepDiagramEdge;
      break;
    default:
      newEdgeTypes.default = BezierDiagramEdge;
  }

  return newEdgeTypes;
};

export const getDefaultUserDiagramOptions = (): UserDiagramOptions => {
  return {
    edgeThickness: 2,
    edgeType: 'smoothstep',
    minimapVisible: false,
    controlsVisible: true,
    directionalArrowsVisible: true,
    showFlowValues: false,
    flowLabelSize: 1,
    edgeOptions: {
      animated: true,
      type: 'smoothstep',
    }
  }
}

export const getDefaultSettings = (): DiagramSettings => {
  return {
    unitsOfMeasure: 'Imperial',
    flowDecimalPrecision: 2
  }
}

export const getDefaultColorPalette = () => {
  return ['#75a1ff', '#7f7fff', '#00bbff', '#009386', '#e28000'];
}


export const formatDecimalPlaces = (value: number | string, decimalPlaces: number) => {
  return Number(value).toFixed(decimalPlaces);
}

export const formatNumberValue = (value: number | string, places: number): number | string => {
  if (value === undefined || value === null) {
    return '';
  }
  if (!Number.isInteger(Number(value))) {
    value = formatDecimalPlaces(value, places);
  }
  return value;
}