import { Edge, Node } from '@xyflow/react';

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
    isValid: boolean,
    assessmentId?: number,
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

 /**
 * Respresents a diagram node. is extended by Water Process Component types which hold assessment data
 * @param hasAssessmentData If WaterProcessComponent properties have been initialized - assessment form properties etc...
 */
  export interface ProcessFlowPart extends Record<string, unknown>{
    name: string,
    processComponentType: ProcessFlowNodeType,
    className: ProcessFlowPartStyleClass,
    isValid: boolean,
    hasAssessmentData: boolean,
    // * id for diagram targetting/sourcing
    diagramNodeId?: string,
    modifiedDate?: Date,
    splitterTargets?: Array<string>;
    // todo this will hold any contextual data about connections to other parts, etc
    processComponentContext?: any;
  }
  
  // * union future diagram types into ProcessFlowNodeType
  export type ProcessFlowNodeType = WaterProcessComponentType | undefined;
  export type WaterProcessComponentType = 'water-intake' | 'water-discharge' | 'water-using-system' | 'splitter-node' | 'water-treatment' | 'waste-water-treatment';
  export type ProcessFlowPartStyleClass = WaterProcessComponentType;

  export interface EdgeData {
    color: string
  }

  // =============================
// todo break into utils

  export function getNewIdString() {
    return Math.random().toString(36).substr(2, 9);
}
  
  // * Assign innate behaviors and context for Diagram parts
  export const processFlowDiagramParts: ProcessFlowPart[] = [
    {
      processComponentType: 'water-intake',
      name: 'Intake Source',
      className: 'water-intake',
      isValid: true,
      hasAssessmentData: false,
    },
    {
      processComponentType: 'water-using-system',
      name: 'Water Using System',
      className: 'water-using-system',
      isValid: true,
      hasAssessmentData: false,
    },
    {
      processComponentType: 'water-discharge',
      name: 'Discharge Outlet',
      className: 'water-discharge',
      isValid: true,
      hasAssessmentData: false,
    },
    {
      processComponentType: 'water-treatment',
      name: 'Water Treatment',
      className: 'water-treatment',
      isValid: true,
      hasAssessmentData: false,
    },
    {
      processComponentType: 'waste-water-treatment',
      name: 'Waste Water Treatment',
      className: 'waste-water-treatment',
      isValid: true,
      hasAssessmentData: false,
    },
    // {
    //   processComponentType: 'splitter-node',
    //   name: 'Junction Connector',
    //   className: 'splitter-node',
    //   isValid: true,
    // }
  ];


export const getComponentNameFromType = (componentType) => {
  let component = processFlowDiagramParts.find(part => part.processComponentType === componentType);
  return component? component.name : '';
}

export const getNewProcessComponent = (processComponentType): ProcessFlowPart => {
  let diagramComponent: ProcessFlowPart = processFlowDiagramParts.find(part => part.processComponentType === processComponentType);
  let newProcessComponent: ProcessFlowPart = {
    processComponentType: diagramComponent.processComponentType,
    hasAssessmentData: false,
    name: diagramComponent.name,
    className: diagramComponent.className,
    isValid: diagramComponent.isValid,
    diagramNodeId: getNewNodeId(),
    modifiedDate: new Date(),
  };

  return newProcessComponent;
}


export const getNewNodeId = () => {
  let nodeId = `dndnode_${getNewIdString()}`;
  return nodeId;
}


export const getNewNode = (nodeType: WaterProcessComponentType, newProcessComponent: ProcessFlowPart, position?: {x: number, y: number}): Node => {
  const newNode: Node = {
    id: newProcessComponent.diagramNodeId,
    type: nodeType,
    position: position,
    className: newProcessComponent.className,
    data: newProcessComponent
  };

  return newNode;
}

