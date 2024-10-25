import { Connection, Edge, MarkerType, Node, ReactFlowInstance, addEdge } from "reactflow";
import { edgeTypes, nodeTypes } from "./FlowTypes";
import { getNewNode, getNewNodeId, getNewProcessComponent, ProcessFlowPart, UserDiagramOptions } from "../../../../src/process-flow-types/shared-process-flow-types";
import { DefaultEdgeOptions, EdgeTypes } from "@xyflow/react";
import BezierDiagramEdge from "../Edges/BezierDiagramEdge";
import StraightDiagramEdge from "../Edges/StraightDiagramEdge";
import StepDiagramEdge from "../Edges/StepDiagramEdge";
import SmoothStepDiagramEdge from "../Edges/SmoothStepDiagramEdge";

export const getRandomCoordinates = (height: number, width: number): {x: number, y: number} => {
    const screenWidth = window.innerWidth;
    const screenHeight = height;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    
    // Generate random coordinates within the visible area
    const randomX = Math.random() * screenWidth + scrollX;
    const randomY = Math.random() * screenHeight + scrollY;
    return {x: randomX, y: randomY};
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
      newProcessComponent.setManageDataId = setManageDataId;
      newProcessComponent.openEditData = setIsDrawerOpen;
      newNode = getNewNode(nodeType, newProcessComponent, position);
    }
    newNode.type = getAdaptedTypeString(newNode.type);  

    setNodes((nds) => {
      return nds.concat(newNode)
    });
  }

 /**
 * edge ids are not gauranteed to be unique. They only include nodeid-nodeid. source and target handles must be looked at to identify uniqueness of edge 
 * 
 */
export const setCustomEdges = (setEdges, connectedParams: Connection | Edge, diagramOptions: UserDiagramOptions) => {
  setEdges((eds) => {
    connectedParams = connectedParams as Edge;
    if (connectedParams.source === connectedParams.target) {
      connectedParams.type = 'selfconnecting';
    }

    if (diagramOptions.directionalArrowsVisible) {
      connectedParams.markerEnd = {
        type: MarkerType.ArrowClosed,
        width: 25,
        height: 25
      }
    }

    connectedParams.data = {
      flowValue: 0
    }

    if (connectedParams.style === undefined) {
      connectedParams.style = {
        stroke: '#6c757d',
        strokeWidth: diagramOptions.edgeThickness
      }
    }

    return addEdge(connectedParams, eds);
  })
}

export const changeExistingEdgesType = (setEdges, diagramEdgeType: string) => {
  setEdges((eds) => {
    return eds.map((edge: Edge) => {
      if (edge.source !== edge.target) {
        edge.type = diagramEdgeType;
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

  return {source, target};

}

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
    case 'splitter-node':
      adaptedString = 'splitterNode'
      break;
    case 'splitter-node-4':
      adaptedString = 'splitterNodeFour'
      break;
    case 'splitter-node-8':
      adaptedString = 'splitterNodeEight'
      break;
    default:
      console.log('No nodeType string detected - using default')
      adaptedString = 'default'
  }

  if (adaptedString !== 'default' && !nodeTypes[adaptedString]) {
    throw new Error('ProcessFlowNodeType string must be adapted to fit nodeTypes (custom React-Flow NodeTypes)');
  }
  return adaptedString;
}


export const getEdgeDefaultOptions = (): DefaultEdgeOptions => {
  return {
    animated: true,
    type: 'default',
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
    edgeType: 'default',
    minimapVisible: false,
    controlsVisible: true,
    directionalArrowsVisible: true,
  }
}
