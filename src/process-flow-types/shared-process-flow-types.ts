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

  