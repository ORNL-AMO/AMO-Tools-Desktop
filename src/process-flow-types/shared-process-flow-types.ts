import { DefaultEdgeOptions, Edge, Node } from '@xyflow/react';
import { CSSProperties } from 'react';

export interface WaterTreatment extends ProcessFlowPart {
  treatmentType: number,
  customTreatmentType: string,
  cost: number,
  name: string,
  flowValue: number
}

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

export interface DiagramCalculatedData {
  nodes: {
    [nodeId: string]: NodeFlowData
  }
}

export interface WaterSystemResults {
  grossWaterUse: number,
  processUseResults?: ProcessUseResults,
  coolingTowerResults?: CoolingTowerResults,
  boilerWaterResults?: BoilerWaterResults,
  kitchenRestroomResults?: KitchenRestroomResults,
  landscapingResults?: LandscapingResults,
  heatEnergyResults?: HeatEnergyResults,
  motorEnergyResults?: MotorEnergyResults[]
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
  userEnteredData: NodeFlowData,
  processComponentType: ProcessFlowNodeType,
  className: ProcessFlowPartStyleClass,
  systemType?: number,
  isValid: boolean,
  inSystemTreatment?: WaterTreatment[],
  createdByAssessment: boolean,
  // * id for diagram targetting/sourcing
  diagramNodeId?: string,
  modifiedDate?: Date,
  handles: Handles,
  disableInflowConnections?: boolean,
  disableOutflowConnections?: boolean,
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
  systemType?: number,
  className: ProcessFlowPartStyleClass,
  isValid: boolean,
  inSystemTreatment?: WaterTreatment[],
  createdByAssessment: boolean,
  diagramNodeId?: string,
  disableInflowConnections?: boolean,
  disableOutflowConnections?: boolean,
  modifiedDate?: Date,
  handles?: Handles,
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
    backgroundColor: '#93e200',
    color: "#000"
  },
  'known-loss': {
    backgroundColor: '#fff',
    color: "#000"
  }
};

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



// * Water System Types
export interface ProcessUse  {
  hoursPerYear?: number
  waterRequiredMetric: number,
  waterRequiredMetricValue: number,
  waterConsumedMetric: number,
  waterConsumedMetricValue: number,
  waterLossMetric: number,
  waterLossMetricValue: number,
  annualProduction: number,
  fractionGrossWaterRecirculated: number,
}

// * grossWaterUse, waterConsumed, waterLoss are added on MEASUR side
export interface ProcessUseResults {
  grossWaterUse: number,
  waterConsumed: number,
  waterLoss: number,
  recirculatedWater: number,
  incomingWater: number,
  wasteDischargedAndRecycledOther: number,
}


export interface ProcessUseTotalResults {
  processUseResults: ProcessUseResults[],
  grossWaterUse: number,
  waterConsumed: number,
  waterLoss: number,
  recirculatedWater: number,
  incomingWater: number,
  wasteDischargedAndRecycledOther: number,
}

export interface CoolingTower {
  hoursPerYear?: number
  tonnage: number
  loadFactor: number,
  evaporationRateDegree: number,
  temperatureDrop: number,
  makeupConductivity: number,
  blowdownConductivity: number,
}

export interface CoolingTowerResults {
  grossWaterUse: number,
  evaporationLoss: number,
  cycleOfConcentration: number,
  makeupWater: number,
  blowdownLoss: number,
}

export interface CoolingTowerTotalResults {
  coolingTowerResults: CoolingTowerResults[],
  grossWaterUse: number,
  evaporationLoss: number,
  cycleOfConcentration: number,
  makeupWater: number,
  blowdownLoss: number,
}

export interface BoilerWater {
  hoursPerYear?: number,
  power: number
  loadFactor: number,
  steamPerPower: number,
  feedwaterConductivity: number,
  makeupConductivity: number,
  blowdownConductivity: number,
}

export interface BoilerWaterResults {
  cycleOfConcentration: number,
  grossWaterUse: number,
  makeupWater: number,
  blowdownLoss: number,
  steamLoss: number,
  condensateReturn: number,
  rateOfRecirculation: number,
}


export interface KitchenRestroom {
  hoursPerYear?: number,
  employeeCount: number,
  workdaysPerYear: number,
  dailyUsePerEmployee: number
}

export interface KitchenRestroomResults {
  grossWaterUse: number
}

export interface Landscaping {
  hoursPerYear?: number,
  areaIrrigated: number,
  yearlyInchesIrrigated: number,
}

export interface LandscapingResults {
  grossWaterUse: number
}


export interface HeatEnergy {
  hoursPerYear?: number,
  incomingTemp: number,
  outgoingTemp: number,
  heaterEfficiency: number,
  heatingFuelType: number,
  wasteWaterDischarge: number
}

export interface HeatEnergyResults {
  heatEnergy: number,
  
}

export interface MotorEnergy {
  name: string,
  numberUnits: number,
  hoursPerYear: number,
  loadFactor: number,
  ratedPower: number,
  systemEfficiency: number,
}

export interface MotorEnergyResults {
  energyUse: number,
}

