import { BoilerWater, BoilerWaterResults, CoolingTower, CoolingTowerResults, CoolingTowerTotalResults, HeatEnergy, HeatEnergyResults, KitchenRestroom, KitchenRestroomResults, Landscaping, LandscapingResults, MotorEnergy, MotorEnergyResults, ProcessFlowPart, ProcessUse, ProcessUseResults, ProcessUseTotalResults } from "../../../process-flow-types/shared-process-flow-types";

export interface WaterAssessment {
    name?: string;
    existingDataUnits?: string;
    modifications: Array<Modification>;
    selected?: boolean;
    systemBasics: WaterSystemBasics,
    intakeSources?: IntakeSource[],
    waterUsingSystems?: WaterUsingSystem[],
    waterTreatments?: WaterTreatment[],
    wasteWaterTreatments?: WasteWaterTreatment[],
    dischargeOutlets?: DischargeOutlet[],
    knownLosses?: KnownLoss[],
    diagramWaterSystemFlows?: DiagramWaterSystemFlows[]
    setupDone: boolean
}

export interface Modification {
    name: string,
    modificationId: string,
    notes?: string
}

export interface WaterSystemBasics {
    utilityType: string,
    electricityCost: number,
    conductivityUnit: string,
    notes: string
}


export enum WaterSystemTypeEnum {
    PROCESS = 0,
    COOLINGTOWER = 1,
    BOILER = 2,
    KITCHEN = 3,
    LANDSCAPING = 4
}

// export interface WaterAssessmentResults {
//     aggregatedSystemResults: AggregatedSystemResults
// }

export interface SystemBalanceResults {
    id?: string,
    name?: string,
    incomingWater: number,
    outgoingWater: number,
    waterBalance: number,
    percentIncomingWater: number,
    percentTotalBalance: number,
}

export interface WaterBalanceResults extends SystemBalanceResults {
    allSystemBalanceResults: SystemBalanceResults[]
}

export interface AggregatedSystemResults {
    ProcessUseTotalResults: ProcessUseTotalResults,
    CoolingTowerTotalResults: CoolingTowerTotalResults,
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

/**
* Component water flow connections - used to populate water-using-system and other components
* @property id - diagramNodeId
* @property sourceFlows - source from plant-level source, i.e. IntakeSource (or IntakeSource --> WT)
* @property recycledSourceFlows - source from another Water Using System.
* @property recirculatedFlows - source from self
* @property dischargeFlows - discharges to platn-level outlet, i.e. DischargeOutlet (or WWT --> DichargeOutlet).
* @property recycledDischargeFlows - discharges to another WaterUsingSystem. 
* @property knownLossFlows - discharges to known loss, flow loss (this is 'water in product')
*/
export interface DiagramWaterSystemFlows {
    id: string,
    componentName: string,
    sourceWater: {
        total: number,
        flows: FlowData[]
    },
    recycledSourceWater: {
        total: number,
        flows: FlowData[]
    },
    recirculatedWater: {
        total: number,
        flows: FlowData[]
    },
    dischargeWater: {
        total: number,
        flows: FlowData[]
    },
    dischargeWaterRecycled: {
        total: number,
        flows: FlowData[]
    },
    knownLosses: {
        total: number,
        flows: FlowData[]
    },
    waterInProduct: {
        total: number,
        flows: FlowData[]
    },
}

export interface WaterSystemFlows {
    sourceWater: number,
    recycledSourceWater: number,
    recirculatedWater: number,
    dischargeWater: number,
    dischargeWaterRecycled: number,
    knownLosses: number,
    waterInProduct: number,
}
export type ConnectedFlowType = keyof WaterSystemFlows;

export interface FlowData {
    source: string,
    target: string,
    flowValue: number,
}

// * Plant level intakes AND system level intakes
// * IMPORTANT Partial - use in WaterUsingSystem without type check for diagram component properties
export interface IntakeSource extends Partial<ProcessFlowPart> {
    sourceType: number,
    annualUse: number,
    addedMotorEnergy?: MotorEnergy[],
    monthlyFlow?: MonthlyFlowData[];
}

export interface MonthlyFlowData {
    month: string,
    flow: number
  }

// * Plant level discharge
export interface DischargeOutlet extends ProcessFlowPart {
    outletType: number,
    annualUse: number,
    monthlyFlow?: MonthlyFlowData[],
    addedMotorEnergy: MotorEnergy[]
}


export interface WaterUsingSystem extends ProcessFlowPart {
    isValid: boolean,
    hoursPerYear: number,
    systemType: number,
    waterFlows: WaterSystemFlows;
    userDiagramFlowOverrides?: WaterSystemFlows;
    processUse?: ProcessUse,
    coolingTower?: CoolingTower,
    boilerWater?: BoilerWater,
    intakeSources: IntakeSource[],
    heatEnergy?: HeatEnergy,
    kitchenRestroom?: KitchenRestroom,
    landscaping?: Landscaping,
    addedMotorEnergy: MotorEnergy[],
}

// ! duplicated definition in shared-process-flow-types
export interface WasteWaterTreatment extends ProcessFlowPart {
    treatmentType: number,
    customTreatmentType: string,
    cost: number,
    name: string,
    flowValue: number 
}

// ! duplicated definition in shared-process-flow-types
export interface WaterTreatment extends ProcessFlowPart {
    treatmentType: number,
    customTreatmentType: string,
    cost: number,
    name: string,
    flowValue: number
}

export interface KnownLoss extends ProcessFlowPart {
    lossType: string,
    flowValue: number,
}



/**
 * Wrapper type for use in shared logic/components that come from ProcessFlowPart
*/
export type WaterProcessComponent = IntakeSource | DischargeOutlet | WaterUsingSystem | WaterTreatment | WasteWaterTreatment | KnownLoss;
/**
* wrapper type for water systems 
*/
export type WaterSystemTypeData = ProcessUse | CoolingTower | BoilerWater | KitchenRestroom | Landscaping;

