// * passed down to diagram
export interface ProcessFlowParentState {
    context: string;
    parentContainer: {
      height: number,
      headerHeight: number;
      footerHeight: number;
    };
    waterProcess?: WaterProcess;
  }
  
  // * passed up from diagram
  export interface ProcessFlowDiagramState {
    context: string;
    waterProcess?: WaterProcess;
  }
  
  export interface ProcessFlowDiagramEventDetail {
    processFlowParentState: {
      test: boolean, name: string
    }
  }
  
  export interface ParentContainerDimensions {
    height: number,
    headerHeight: number;
    footerHeight: number;
  }

  export interface WaterProcess {
    id: number;
    name: string;
    isValid: boolean,
    directoryId: number
  }