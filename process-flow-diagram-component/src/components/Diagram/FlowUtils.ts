import { edgeTypes, nodeTypes } from "./FlowTypes";
import { CustomEdgeData, ProcessFlowPart, UserDiagramOptions, WaterProcessComponentType, DiagramSettings, FlowDiagramData, DiagramCalculatedData, NodeFlowData, ProcessUse } from "../../../../src/process-flow-types/shared-process-flow-types";
import { DefaultEdgeOptions, EdgeTypes, ReactFlowInstance, Node, Edge, Connection, MarkerType } from "@xyflow/react";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import { NodeFlowProperty } from "./diagramReducer";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";
import { MAX_FLOW_DECIMALS } from "../../../../src/process-flow-types/shared-process-flow-constants";
import { getNewNode, getNewNodeId, getNewProcessComponent } from "../../../../src/process-flow-types/shared-process-flow-logic";

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

// export const updateNodeCalculatedDataMap = (
//   node: Node, 
//   nodes: Node[], 
//   nodeEdges: Edge[], 
// ) => {
//   const flowContext: FlowContext = useContext<FlowContext>(FlowContext);
//   let nodeCalculatedDataMap: Record<string, NodeCalculatedData> = {
//               ...flowContext.nodeCalculatedDataMap,
//           }

//   const { sourceCalculatedTotalFlow, dischargeCalculatedTotalFlow} = getNodeFlowTotals(nodeEdges, nodes, node.id);
//   let calculatedData = { ...nodeCalculatedDataMap[node.id] };
//   if (node.data.processComponentType === 'water-intake') {
//     console.log(`${nodeCalculatedDataMap.name} ==== updateNodeCalculatedDataMap intake`, node, nodes, nodeEdges, nodeCalculatedDataMap);
//     calculatedData.totalDischargeFlow = dischargeCalculatedTotalFlow;
//   } else if (node.data.processComponentType === 'water-discharge') {
//     console.log(`${nodeCalculatedDataMap.name} ==== updateNodeCalculatedDataMap discharge`, node, nodes, nodeEdges, nodeCalculatedDataMap);
//     calculatedData.totalSourceFlow = sourceCalculatedTotalFlow;
//   }
//   calculatedData.name = node.data.name;
//   nodeCalculatedDataMap[node.id] = calculatedData;
//   console.log(`${nodeCalculatedDataMap.name} ==== updated data map`, nodeCalculatedDataMap);
//   flowContext.setNodeCalculatedData(nodeCalculatedDataMap);
// }

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

export const getKnownLossComponentTotals = (dischargeEdges: Edge[], nodes: Node[], selectedNodeId: string) => {
  let totalKnownLosses = 0;
  dischargeEdges.forEach((edge: Edge<CustomEdgeData>) => {
    const { source, target } = getEdgeSourceAndTarget(edge, nodes);
    if (target.processComponentType === 'known-loss' && selectedNodeId === source.diagramNodeId) { 
      totalKnownLosses += edge.data.flowValue;
    }
  });
  return totalKnownLosses;
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

  const newProcessComponent = getNewProcessComponent(nodeType);
  let newNode: Node = getNewNode(nodeType, newProcessComponent, position);
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
      flowValue: null,
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
      source = node.data as ProcessFlowPart;
    }
    if (node.id === edge.target) {
      target = node.data  as ProcessFlowPart;
    }
  });

  return { source, target };

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
    // ( debugging )
    // newProcessComponent.name = newProcessComponent.diagramNodeId;
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


/**
 * Retrieve user input total flow, otherwise calculated total flow
 */
export const getNodeTotalFlow = (flowProperty: NodeFlowProperty, calculatedNode: NodeFlowData, nodes: Node<ProcessFlowPart>[], nodeId?: string) => {
   const selectedNode: Node<ProcessFlowPart> = nodes.find((node: Node<ProcessFlowPart>) => node.id === nodeId);
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