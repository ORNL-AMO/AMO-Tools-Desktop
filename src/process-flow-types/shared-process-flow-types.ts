import { DefaultEdgeOptions, Edge, Node } from '@xyflow/react';
import { CSSProperties } from 'react';

// ! duplicated definition in water-assessment.ts
export interface WaterTreatment extends ProcessFlowPart {
  treatmentType: number,
  customTreatmentType: string,
  cost: number,
  name: string,
  flowValue: number
}
// ! duplicated definition in water-assessment.ts
export interface WasteWaterTreatment extends ProcessFlowPart {
  treatmentType: number,
  customTreatmentType: string,
  cost: number,
  name: string,
  flowValue: number
}



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

export interface FlowDiagramData {
  nodes: Node[],
  edges: Edge[],
  userDiagramOptions: UserDiagramOptions,
  nodeCalculatedDataMap: Record<string, NodeCalculatedData>
}

export interface UserDiagramOptions {
  edgeThickness: number,
  edgeType: string,
  showFlowValues?: boolean,
  minimapVisible: boolean,
  controlsVisible: boolean,
  directionalArrowsVisible: boolean,
  flowLabelSize: number,
  edgeOptions: DefaultEdgeOptions
}


export interface NodeCalculatedData {
  totalSourceFlow: number,
  totalDischargeFlow: number,
  // * summing node total divided by active handle connections
  summingFlowEvenlyDivided?: number,
}

export interface WaterDiagramOption {
  display: string,
  id: number,
}

/**
* Respresents a diagram node. is extended by types which hold assessment data
* @property createdByAssessment If WaterProcessComponent properties have been initialized - assessment form properties etc...
*/
export interface ProcessFlowPart extends Record<string, unknown> {
  name: string,
  userEnteredData: {
    totalSourceFlow: number,
    totalDischargeFlow: number,
  },
  processComponentType: ProcessFlowNodeType,
  className: ProcessFlowPartStyleClass,
  isValid: boolean,
  createdByAssessment: boolean,
  // * id for diagram targetting/sourcing
  diagramNodeId?: string,
  modifiedDate?: Date,
  handles: Handles,
  disableInflowConnections?: boolean,
  disableOutflowConnections?: boolean,
  summingTargets?: Array<string>;
  setManageDataId?: (id: number) => void;
  openEditData?: (boolean) => void;
  processComponentContext?: any;
}

export interface CustomEdgeData extends Record<string, unknown> {
  flowValue: number,
  hasOwnEdgeType: string,
}

// * patches v11 -> v12 typing changes
// todo this type needs to duplicate ProcessFlowPart - how to merge types
export type DiagramNode = Node<{
  name: string,
  userEnteredData: {
    totalSourceFlow: number,
    totalDischargeFlow: number,
  },
  processComponentType: ProcessFlowNodeType,
  className: ProcessFlowPartStyleClass,
  isValid: boolean,
  createdByAssessment: boolean,
  diagramNodeId?: string,
  disableInflowConnections?: boolean,
  disableOutflowConnections?: boolean,
  modifiedDate?: Date,
  handles?: Handles,
  summingTargets?: Array<string>;
  setManageDataId?: (id: string) => void;
  openEditData?: (boolean) => void;
  processComponentContext?: any;
}, 'processFlowPart'>;

export interface HandleOption {
  id: string,
  visible: boolean,
}
// * union future diagram types into ProcessFlowNodeType
export type ProcessFlowNodeType = WaterProcessComponentType | undefined;
export type WaterProcessComponentType = 'water-intake' | 'water-discharge' | 'water-using-system' | 'summing-node' | 'water-treatment' | 'waste-water-treatment' | 'known-loss';
export type ProcessFlowPartStyleClass = WaterProcessComponentType;

export const CustomNodeStyleMap: Record<WaterProcessComponentType, CSSProperties> = {
  'water-intake': {
    backgroundColor: '#75a1ff',
    color: "#ffffff"
  },
  'water-discharge': {
    backgroundColor: '#7f7fff',
    color: "#ffffff"
  },
  'water-using-system': {
    backgroundColor: '#00bbff',
    color: "#ffffff"
  },
  'summing-node': {
    // backgroundColor: '#75a1ff',
    // color: "#ffffff"
  },
  'water-treatment': {
    backgroundColor: '#009386',
    color: "#ffffff"
  },
  'waste-water-treatment': {
    backgroundColor: '#e28000',
    color: "#ffffff"
  },
  'known-loss': {
    backgroundColor: '#fff',
    color: "#000"
  }
};

// =============================
// todo break into utils

export function getNewIdString() {
  return Math.random().toString(36).substring(2, 9);
}

export interface Handles {
  inflowHandles?: {
    a: boolean,
    b: boolean,
    c: boolean,
    d: boolean,
  },
  outflowHandles?: {
    e: boolean,
    f: boolean,
    g: boolean,
    h: boolean,
  }
}

const getDefaultHandles = (): Handles => {
  return {
    inflowHandles: {
      a: true,
      b: true,
      c: false,
      d: false,
    },
    outflowHandles: {
      e: true,
      f: true,
      g: false,
      h: false,
    }
  }
}



// * Assign innate behaviors and context for Diagram parts
export const processFlowDiagramParts: ProcessFlowPart[] = [
  {
    processComponentType: 'water-intake',
    name: 'Intake Source',
    className: 'water-intake',
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    disableInflowConnections: true,
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'water-using-system',
    name: 'Water Using System',
    className: 'water-using-system',
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'water-discharge',
    name: 'Discharge Outlet',
    className: 'water-discharge',
    disableOutflowConnections: true,
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'water-treatment',
    name: 'Water Treatment',
    className: 'water-treatment',
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'waste-water-treatment',
    name: 'Waste Treatment',
    className: 'waste-water-treatment',
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'known-loss',
    name: 'Known Loss',
    className: 'known-loss',
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'summing-node',
    name: 'Summing Connector',
    className: 'summing-node',
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: {
      inflowHandles: {
        a: true,
        b: true,
        c: true,
        d: true,
      },
      outflowHandles: {
        e: true,
        f: true,
        g: true,
        h: true,
      }
    }
  }
];


export const getComponentNameFromType = (componentType) => {
  let component = processFlowDiagramParts.find(part => part.processComponentType === componentType);
  return component ? component.name : '';
}

export const getNewProcessComponent = (processComponentType): ProcessFlowPart => {
  let diagramComponent: ProcessFlowPart = processFlowDiagramParts.find(part => part.processComponentType === processComponentType);
  let newProcessComponent: ProcessFlowPart = {
    processComponentType: diagramComponent.processComponentType,
    createdByAssessment: false,
    name: diagramComponent.name,
    className: diagramComponent.className,
    isValid: diagramComponent.isValid,
    disableInflowConnections: diagramComponent.disableInflowConnections,
    disableOutflowConnections: diagramComponent.disableOutflowConnections,
    userEnteredData: {
      totalDischargeFlow: diagramComponent.totalDischargeFlow as number,
      totalSourceFlow: diagramComponent.totalSourceFlow as number
    },
    diagramNodeId: getNewNodeId(),
    modifiedDate: new Date(),
    handles: { ...diagramComponent.handles }
  };

  return newProcessComponent;
}


export const getNewNodeId = () => {
  let nodeId = `n_${getNewIdString()}`;
  return nodeId;
}


export const getNewNode = (nodeType: WaterProcessComponentType, newProcessComponent: ProcessFlowPart, position?: { x: number, y: number }): Node => {
  const newNode: Node = {
    id: newProcessComponent.diagramNodeId,
    type: nodeType,
    position: position,
    className: newProcessComponent.className,
    data: newProcessComponent,
    style: CustomNodeStyleMap[nodeType]
  };

  return newNode;
}

