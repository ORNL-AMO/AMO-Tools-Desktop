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
    systemAttributionMap: SystemAttributionMap;
}

export interface SystemTrueCostData {
  label: string,
  connectionCostByType: Array<string>,
  unit: string,
}


export interface TrueCostOfSystems {
  [systemId: string]: SystemTrueCostContributions
}


export interface CostComponentMap {
  [costComponentId: string]: CostComponentPathData;
}

export interface CostComponentPathData {
    blockCosts: BlockCostsV2;
    // edge id, id list
    upstreamPathsByEdgeId?: string[][];
    downstreamPathsByEdgeId?: string[][];
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

export interface BlockCostsV2 { 
  name: string, 
  processComponentType: ProcessFlowNodeType,
  totalBlockCost: number, 
  totalFlow?: number, 
}



// * Cost Components - nodes that carry block costs that then get attributed to systems depending on flow responsibility and proportions

export interface SystemAttributionMap {
  [systemId: string]: Record<string, CostComponentAttribution>;
}

export interface CostComponentAttribution {
  name: string;
  componentId: string;
  totalAttribution: AttributionFraction;
  componentPathAttribution: PathAttribution[];
}

export interface AttributionFraction {
    default: number;
    adjusted?: number;
  }

export interface PathAttribution {
  edgeId: string;
  edgeDescription: string;
  attribution: number
}


/**
 * Represents a cost from a connected cost component (ex. intake, discharge, treatment etc)
 */
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


export interface CostComponentSummary {
  id: string;
  name: string;
  total: number;
  processComponentType: ProcessFlowNodeType;
  componentTypeLabel: string;
  status: 'adjusted' | 'default';
}
