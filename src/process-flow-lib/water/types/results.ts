import { ProcessFlowNodeType } from "./diagram";

export interface SystemAnnualSummaryResults {
    id?: string,
    name?: string,
    sourceWaterIntake: number,
    dischargeWater: number,
    directCostPerYear: number,
    directCostPerUnit: number,
    trueCostPerYear: number,
    trueCostPerUnit: number,
    trueOverDirectResult: number,
}

export interface PlantSystemSummaryResults extends SystemAnnualSummaryResults {
    allSystemResults: SystemAnnualSummaryResults[],
}

// * Annual Results
export interface ExecutiveSummaryResults {
    totalSourceWaterIntake: number;
    totalPerProductionUnit: number;
    directCost: number;
    trueCost: number;
    trueCostPerProductionUnit: number;
    trueOverDirectResult: number;
}

export interface PlantResults {
    trueCostOfSystems: TrueCostOfSystems;
    plantSystemSummaryResults: PlantSystemSummaryResults;
    costComponentsTotalsMap: Record<string, BlockCosts>;
    flowAttributionMap: Record<string, ComponentAttribution>;
}

export interface ConnectedCost {
  name: string,
  componentType: ProcessFlowNodeType,
  selfTotalCost: number,
  selfTotalFlow: number,
  cost: number,
  flow: number,
  destinationCost?: number,
  fractionSelfTotalFlowToTarget?: number,
  sourceId: string,
  targetId: string,
  sourceName: string,
  targetName: string,
}

export interface TrueCostOfSystems {
  [systemId: string]: SystemTrueCostContributions
}

// each property = total cost * flow fraction for all connected to system
export interface SystemTrueCostContributions {
  intake: number,
  discharge: number,
  thirdParty: number
  treatment: number,
  wasteTreatment: number,
  systemPumpAndMotorEnergy: number,
  heatEnergyWastewater: number,
  total: number
}

export interface RecycledFlowData {
  recycledSourceName: string;
  recycledDestinationId: string;
  recycledDestinationName: string;
}

/**
 * Block costs represent the total cost center for each non-system node/component. Costs are deducted and attributed to each system based on flow proportions.
 * 
 * Example value representing Sand Filtration (Waste Water Treatment) block costs 
 * {
 *   "name": "Sand Filtration",
 *   "totalBlockCost": 12000,
 *   "totalInflow": 12,
 *   "unpaidCostRemaining": 12000,
 *   "unpaidInflowRemaining": 12
    * }
 */
export interface BlockCosts { 
  name: string, 
  processComponentType: ProcessFlowNodeType,
  totalBlockCost: number, 
  totalInflow?: number, 
  totalOutflow?: number, 
  unpaidInflowRemaining: number, 
  unpaidCostRemaining: number 
}




// * Cost Components - nodes that carry block costs that then get attributed to systems depending on flow responsibility and proportions

/**
 * Represented system costs/flows from a given cost component
 */
export interface ComponentAttribution {
  flowValue: number;
  systemId: string;
  systemName: string;
  flowEdgeId: string;
  flowEdgeDescription: string;
  flowAttributionFraction: {
    default: number;
    adjusted?: number;
  }
  costAttributedToSystem: number;
  costComponentId: string;
}


export type SystemToCostComponentAttributionMap = Record<string, {
  name: string,
  componentAttribution?: Record<string, ComponentAttribution>;
}>;

export interface CostComponentSummary {
  id: string;
  name: string;
  total: number;
  processComponentType: ProcessFlowNodeType;
  componentTypeLabel: string;
  status: 'adjusted' | 'default';
}
