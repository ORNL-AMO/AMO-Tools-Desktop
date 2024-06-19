import { Edge, Node } from 'reactflow';


// * passed down to diagram
export interface ProcessFlowParentState {
    context: string;
    parentContainer: {
      height: number,
      headerHeight: number;
      footerHeight: number;
    };
    waterDiagram?: WaterDiagram;
  }

  export interface ParentContainerDimensions {
    height: number,
    headerHeight: number;
    footerHeight: number;
  }
  
  // * passed up from diagram
  export interface ProcessFlowDiagramState {
    context?: string;
    waterDiagram?: WaterDiagram;
    flowDiagramData: FlowDiagramData;
  }
  

  export interface WaterDiagram {
    id?: number;
    assessmentId?: number,
    directoryId?: number,
    name: string;
    modifiedDate: Date,
    isValid: boolean,
    flowDiagramData: FlowDiagramData
  }

// * nodes/edges at reactflow/dist nodes.d.ts and edges.d.ts
  export interface FlowDiagramData {
    nodes: Node[],
    edges: Edge[],
  }


  export interface WaterDiagramOption {
    display: string,
    id: number,
  }


  export interface ProcessFlowPart {
    name: string,
    processComponentType: ProcessFlowNodeType,
    className: ProcessFlowPartStyleClass,
    isValid: boolean,
    // * id for diagram targetting/sourcing
    diagramNodeId?: string,
    modifiedDate?: Date,
    // todo this will hold any contextual data about connections to other parts, etc
    processComponentContext?: any;
  }
  
  export type ProcessFlowNodeType = WaterProcessComponentType | undefined;
  export type ProcessFlowPartStyleClass = 'water-intake' | 'water-discharge' | 'process-use';
  export type WaterProcessComponentType = 'waterIntake' | 'waterDischarge' | 'processUse'

  

  // =============================
// todo break into utils

  export function getNewIdString() {
    return Math.random().toString(36).substr(2, 9);
}
  
  // * Assign innate behaviors and context for Diagram parts
  export const processFlowDiagramParts: ProcessFlowPart[] = [
    {
      processComponentType: "waterIntake",
      name: 'Water Intake',
      className: 'water-intake',
      isValid: true,
    },
    {
      processComponentType: "processUse",
      name: 'Process Use',
      className: 'process-use',
      isValid: true,
    },
    {
      processComponentType: "waterDischarge",
      name: 'Water Discharge',
      className: 'water-discharge',
      isValid: true,
    }
  ];


export const getNewProcessComponent = (processComponentType): ProcessFlowPart => {
  let diagramComponent: ProcessFlowPart = processFlowDiagramParts.find(part => part.processComponentType === processComponentType);
  let newProcessComponent = {
    processComponentType: diagramComponent.processComponentType,
    name: diagramComponent.name,
    className: diagramComponent.className,
    isValid: diagramComponent.isValid,
    diagramNodeId: getNewNodeId(),
    modifiedDate: new Date()
  };

  return newProcessComponent;
}


export const getNewNodeId = () => {
  let nodeId = `dndnode_${getNewIdString()}`;
  return nodeId;
}


export const getNewNode = (type: any, newProcessComponent: ProcessFlowPart, position?: {x: number, y: number}): Node => {
  const newNode: Node = {
    id: newProcessComponent.diagramNodeId,
    type,
    position,
    className: newProcessComponent.className,
    data: newProcessComponent
  };

  return newNode;
}

