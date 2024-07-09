import { Edge, MarkerType, Node, ReactFlowInstance, addEdge } from "reactflow";
import { nodeTypes } from "./FlowTypes";
import { getNewNode, getNewNodeId, getNewProcessComponent } from "../../../../src/process-flow-types/shared-process-flow-types";

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
    // todo 6876 assign class highlighting new node
}

export const setDroppedNode = (event, reactFlowInstance: ReactFlowInstance, setNodes) => {
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
        type: getAdaptedTypeString(nodeType),
        position: position,
        className: nodeType,
        data: {}
      };
    } else {
      const newProcessComponent = getNewProcessComponent(nodeType);
      newNode = getNewNode(nodeType, newProcessComponent, position);
      newNode.type = getAdaptedTypeString(newNode.type);  
    }

    setNodes((nds) => {
      return nds.concat(newNode)
    });
  }

export const setCustomEdges = (params, setEdges) => {
  setEdges((eds) => {
    params = params as Edge;
    if (params.source === params.target) {
      params.type = 'selfconnecting';
    }
    params.markerEnd = { 
      type: MarkerType.ArrowClosed,
      width: 25,
      height: 25
    }
    return addEdge(params, eds);
  })
  }


export const getAdaptedTypeString = (nodeType: string) => {
    let adaptedString: string;
    switch (nodeType) {
        case 'water-intake':
            adaptedString = 'waterIntake';
            break;
        case 'process-use':
            adaptedString = 'processUse'
            break;
        case 'water-discharge':
            adaptedString = 'waterDischarge'
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
          adaptedString = 'default'
    }

    if (adaptedString !== 'default' && !nodeTypes[adaptedString]) {
        throw new Error('ProcessFlowNodeType string must be adapted to fit nodeTypes (custom React-Flow NodeTypes)');
    }
    return adaptedString;
}
