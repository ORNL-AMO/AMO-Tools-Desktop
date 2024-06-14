import { CSSProperties, ReactNode } from "react";
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
    nodeType: ProcessFlowPartNode,
    defaultLabel: string,
    className: ProcessFlowPartStyleClass,
    // todo this will hold any contextual data about connections to other parts, etc
    partContext?: any;
  }
  
  export type ProcessFlowPartNode = 'waterIntake' | 'waterDischarge' | 'processUse'
  export type ProcessFlowPartStyleClass = 'water-intake' | 'water-discharge' | 'process-use';
