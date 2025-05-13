import { Node, Edge } from "@xyflow/react";
import { WaterTreatment } from "./water-components";

/**
* Respresents a diagram node. is extended by types which hold assessment data
* @property createdByAssessment If WaterProcessComponent properties have been initialized - assessment form properties etc...
*/
export interface ProcessFlowPart extends Record<string, unknown> {
    name: string,
    userEnteredData: NodeFlowData,
    processComponentType: ProcessFlowNodeType,
    systemType?: number,
    treatmentType?: number,
    customTreatmentType?: string,
    cost: number,
    className: ProcessFlowPartStyleClass,
    isValid: boolean,
    inSystemTreatment?: WaterTreatment[],
    createdByAssessment: boolean,
    // * id for diagram targetting/sourcing
    diagramNodeId?: string,
    modifiedDate?: Date,
    handles: Handles,
    disableInflowConnections?: boolean,
    disableOutflowConnections?: boolean,
  }
  
  export interface CustomEdgeData extends Record<string, unknown> {
    flowValue: number,
    hasOwnEdgeType: string,
  }
  
  // * patches v11 -> v12 typing changes
  // todo this type needs to duplicate ProcessFlowPart - how to merge types
  export type DiagramNode = Node<{
    name: string,
    userEnteredData: NodeFlowData,
    processComponentType: ProcessFlowNodeType,
    systemType?: number,
    treatmentType?: number,
    customTreatmentType?: string,
    cost?: number,
    className: ProcessFlowPartStyleClass,
    isValid: boolean,
    inSystemTreatment?: WaterTreatment[],
    createdByAssessment: boolean,
    diagramNodeId?: string,
    modifiedDate?: Date,
    handles?: Handles,
    disableInflowConnections?: boolean,
    disableOutflowConnections?: boolean,
  }, 'processFlowPart'>;
  
  export interface HandleOption {
    id: string,
    visible: boolean,
  }
  // * union future diagram types into ProcessFlowNodeType
  export type ProcessFlowNodeType = WaterProcessComponentType | undefined;
  export type WaterProcessComponentType = 'water-intake' | 'water-discharge' | 'water-using-system' | 'summing-node' | 'water-treatment' | 'waste-water-treatment' | 'known-loss';
  export type ProcessFlowPartStyleClass = WaterProcessComponentType;
  
  
  // =============================
  // todo break into utils
  
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
  
  
  export interface FlowDiagramData {
    nodes: Node[],
    edges: Edge[],
    nodeErrors: NodeErrors,
    userDiagramOptions: UserDiagramOptions,
    settings: DiagramSettings,
    calculatedData: DiagramCalculatedData,
    recentNodeColors: string[];
    recentEdgeColors: string[];
  }
  
  export type NodeErrors = Record<string, NodeFlowTypeErrors>; 
  
  export type NodeFlowTypeErrors = {
    source?: FlowErrors,
    discharge?: FlowErrors
  }
  
  export type FlowErrors = { 
    totalFlow?: string | number; 
    flows?: (string | number)[], 
    level: ValidationLevel, 
  }
  export type ValidationLevel = 'error' | 'warning'
  export type FlowType = 'source' | 'discharge';
  
  export interface UserDiagramOptions {
    strokeWidth: number,
    edgeType: string,
    showFlowLabels?: boolean,
    minimapVisible: boolean,
    controlsVisible: boolean,
    directionalArrowsVisible: boolean,
    flowLabelSize: number,
    animated: boolean,
  }
  
  
  export interface DiagramSettings {
    flowDecimalPrecision: number,
    unitsOfMeasure: string,
    electricityCost: number,
    conductivityUnit: string,
  }
  
  
  export interface NodeFlowData {
    name?: string,
    totalSourceFlow?: number,
    totalDischargeFlow?: number,
    totalKnownLosses?: number,
    waterInProduct?: number,
    // * summing node total divided by active handle connections
    summingFlowEvenlyDivided?: number,
  }

  
export type NodeFlowProperty = keyof Pick<NodeFlowData, 'totalSourceFlow' | 'totalDischargeFlow'>;
  
  export interface DiagramCalculatedData {
    nodes: {
      [nodeId: string]: NodeFlowData
    }
  }
  
  
  export interface WaterDiagramOption {
    display: string,
    id: number,
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
  