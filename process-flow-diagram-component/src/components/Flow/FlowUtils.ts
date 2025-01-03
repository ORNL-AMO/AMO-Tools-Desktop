import { Connection, Edge, MarkerType, Node, ReactFlowInstance, addEdge } from "reactflow";
import { edgeTypes, nodeTypes } from "./FlowTypes";
import { CustomEdgeData, NodeCalculatedData, getNewNode, getNewNodeId, getNewProcessComponent, ProcessFlowPart, UserDiagramOptions, WaterProcessComponentType } from "../../../../src/process-flow-types/shared-process-flow-types";
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
  let calculatedData: NodeCalculatedData = { ...nodeCalculatedDataMap[node.id] };
  if (node.data.processComponentType === 'water-intake') {
    calculatedData.totalDischargeFlow = dischargeCalculatedTotalFlow;
  } else if (node.data.processComponentType === 'water-discharge') {
    calculatedData.totalSourceFlow = sourceCalculatedTotalFlow;
  } else if (node.data.processComponentType === 'summing-node') {
    calculatedData.totalSourceFlow = sourceCalculatedTotalFlow;
    // todo add in edge id's?
    const dividedTargetConnections: number = nodeEdges.filter(edge => edge.source === node.id).length;
    calculatedData.summingFlowEvenlyDivided = sourceCalculatedTotalFlow / dividedTargetConnections;
  }
  nodeCalculatedDataMap[node.id] = calculatedData;
  console.log('updated nodeDataMap', nodeCalculatedDataMap);
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

export const setDroppedNode = (event, reactFlowInstance: ReactFlowInstance, setNodes, setManageDataId, setIsDrawerOpen) => {
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
  // if (nodeType.includes('summing-node')) {
  //   newNode = {
  //     id: getNewNodeId(),
  //     type: nodeType,
  //     position: position,
  //     className: nodeType,
  //     data: {}
  //   };
  // } else {
  //   const newProcessComponent = getNewProcessComponent(nodeType);
  //   newProcessComponent.setManageDataId = setManageDataId;
  //   newProcessComponent.openEditData = setIsDrawerOpen;
  //   newNode = getNewNode(nodeType, newProcessComponent, position);
  // }
  const newProcessComponent = getNewProcessComponent(nodeType);
  if (!nodeType.includes('summing-node')) {
    newProcessComponent.setManageDataId = setManageDataId;
    newProcessComponent.openEditData = setIsDrawerOpen;
  }
  newNode = getNewNode(nodeType, newProcessComponent, position);
  newNode.type = getAdaptedTypeString(newNode.type);

  setNodes((nds) => {
    return nds.concat(newNode)
  });
}


export const getDefaultNodeFromType = (nodeType: WaterProcessComponentType, setManageDataId, setIsDrawerOpen): Node => {
  const newProcessComponent = getNewProcessComponent(nodeType);
    newProcessComponent.setManageDataId = setManageDataId;
    newProcessComponent.openEditData = setIsDrawerOpen;
    const newNode: Node = getNewNode(nodeType, newProcessComponent);
    return newNode;
}


/**
* edge ids are not gauranteed to be unique. They only include nodeid-nodeid. source and target handles must be looked at to identify uniqueness of edge 
* 
*/
export const setCustomEdges = (setEdges, connectedParams: Connection | Edge, diagramOptions: UserDiagramOptions) => {
  setEdges((eds) => {
    connectedParams = connectedParams as Edge;
    setCustomEdgeDefaults(connectedParams, diagramOptions);
    return addEdge(connectedParams, eds);
  })
}

export const setCustomEdgeDefaults = (edge: Edge, userDiagramOptions: UserDiagramOptions) => {
  if (edge.source === edge.target) {
    edge.type = 'selfconnecting';
  }
  if (userDiagramOptions.directionalArrowsVisible) {
    edge.markerEnd = {
      type: MarkerType.ArrowClosed,
      width: 25,
      height: 25
    }
  }

  edge.data = {
    flowValue: 0
  }

  if (edge.style === undefined) {
    edge.style = {
      stroke: '#6c757d',
      strokeWidth: userDiagramOptions.edgeThickness
    }
  }
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
