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
    flowConfidence: Record<NodeFlowProperty, FlowConfidence>,
    flowTotalTouched: Record<NodeFlowProperty, boolean>,
  }

  export type FlowConfidence = 'estimated' | 'metered' | 'calculated';

  export interface CustomEdgeData extends Record<string, unknown> {
    flowValue: number,
    hasOwnEdgeType: string,
    edgeDescription: string,
    confidence: FlowConfidence,
    hasManualColorOverride?: boolean,
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
    flowConfidence?: Record<NodeFlowProperty, FlowConfidence>,
    flowTotalTouched?: Record<NodeFlowProperty, boolean>,
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
      e?: boolean,
      f?: boolean,
      g?: boolean,
      h?: boolean,
    },
    outflowHandles?: {
      e: boolean,
      f: boolean,
      g: boolean,
      h: boolean,
      i?: boolean,
      j?: boolean,
      k?: boolean,
      l?: boolean,
    }
  }
  
  
  export interface FlowDiagramData {
    name: string,
    meta?: DiagramMetaData,
    nodes: Node[],
    edges: Edge[],
    diagramFlowErrors: DiagramFlowErrors,
    userDiagramOptions: UserDiagramOptions,
    settings: DiagramSettings,
    calculatedData: DiagramCalculatedData,
    recentNodeColors: string[];
    recentEdgeColors: string[];
    diagramNotes?: string;
  }

  export interface DiagramMetaData {
    version: string,
    upgrades?: DiagramUpgrade[],
  }

  export interface DiagramUpgrade {
    fromVersion: string,
    toVersion: string,
    upgradeDate: string,
  };
  
  export type DiagramFlowErrors = Record<string, ComponentFlowErrors>;

  export type ComponentFlowErrors = {
    source?: FlowErrors,
    discharge?: FlowErrors
  }
  
  export type FlowErrors = {
    totalFlow?: string | number;
    flows?: (string | number)[],
    knownLosses?: string,
    level: ValidationLevel | undefined,
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
    paletteColors?: string[],
    // * undefined is treated as false (off) so pre-existing saved diagrams don't need a migration
    colorEdgesByConfidence?: boolean,
    // * undefined is treated as true (on) so pre-existing saved diagrams keep showing it without a migration
    showFlowConfidenceOnLabel?: boolean,
    estimatedFlowColor?: string,
    meteredFlowColor?: string,
    calculatedFlowColor?: string,
    // * master switch for the whole Estimated/Metered feature - undefined is treated as true (on)
    // * so pre-existing saved diagrams keep showing it without a migration
    flowConfidenceEnabled?: boolean,
  }
  
  
  export interface DiagramSettings {
    flowDecimalPrecision: number,
    unitsOfMeasure: string,
    electricityCost: number,
    fuelCost: number,
    conductivityUnit: string,
  }
  
  
  export interface NodeFlowData {
    name?: string,
    totalSourceFlow?: number,
    totalDischargeFlow?: number,
    totalKnownLosses?: number,
    waterInProduct?: number,
    intakeUnaccounted?: number,
    dischargeUnaccounted?: number,
  }

  
export type NodeFlowProperty = keyof Pick<NodeFlowData, 'totalSourceFlow' | 'totalDischargeFlow'>;

  export const getDefaultFlowConfidence = (): Record<NodeFlowProperty, FlowConfidence> => ({
    totalSourceFlow: 'estimated',
    totalDischargeFlow: 'estimated',
  });

  export const getDefaultFlowTotalTouched = (): Record<NodeFlowProperty, boolean> => ({
    totalSourceFlow: false,
    totalDischargeFlow: false,
  });

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
  