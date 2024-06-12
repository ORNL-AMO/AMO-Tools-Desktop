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


  export interface FlowDiagramData {
    nodes: any,
    edges: any,
  }


  export interface WaterDiagramOption {
    display: string,
    id: number,
  }
