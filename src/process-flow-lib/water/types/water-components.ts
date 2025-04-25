import { ProcessFlowPart } from "./diagram";

/**
 * Wrapper type for use in shared logic/components that come from ProcessFlowPart
*/
export type WaterProcessComponent = IntakeSource | DischargeOutlet | WaterUsingSystem | WaterTreatment | WasteWaterTreatment | KnownLoss;
/**
* wrapper type for water systems 
*/
export type WaterSystemTypeData = ProcessUse | CoolingTower | BoilerWater | KitchenRestroom | Landscaping;

export interface WaterTreatment extends ProcessFlowPart {
    treatmentType: number,
    customTreatmentType: string,
    cost: number,
    name: string,
    flowValue: number
}

export interface WasteWaterTreatment extends WaterTreatment { }


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



export enum WaterSystemTypeEnum {
    PROCESS = 0,
    COOLINGTOWER = 1,
    BOILER = 2,
    KITCHEN = 3,
    LANDSCAPING = 4
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




export interface KnownLoss extends ProcessFlowPart {
    lossType: string,
    flowValue: number,
}


export interface WaterUsingSystem extends ProcessFlowPart {
    isValid: boolean,
    hoursPerYear: number,
    systemType: number,
    systemFlowTotals: WaterSystemFlowsTotals;
    userDiagramFlowOverrides?: WaterSystemFlowsTotals;
    processUse?: ProcessUse,
    coolingTower?: CoolingTower,
    boilerWater?: BoilerWater,
    intakeSources: IntakeSource[],
    heatEnergy?: HeatEnergy,
    kitchenRestroom?: KitchenRestroom,
    landscaping?: Landscaping,
    addedMotorEnergy: MotorEnergy[],
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

// * Water System Types
export interface ProcessUse {
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


export interface SystemBalanceResults {
    id?: string,
    name?: string,
    incomingWater: number,
    outgoingWater: number,
    waterBalance: number,
    totalKnownLosses: number,
    estimatedUnknownLosses: number,
    percentIncomingWater: number,
    percentTotalBalance: number,
}

export interface WaterBalanceResults extends SystemBalanceResults {
    allSystemBalanceResults: SystemBalanceResults[],
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
export interface ComponentEdgeFlowData {
    id: string,
    componentName: string,
    sourceWater: {
        total: number,
        flows: EdgeFlowData[]
    },
    recirculatedWater: {
        total: number,
        flows: EdgeFlowData[]
    },
    dischargeWater: {
        total: number,
        flows: EdgeFlowData[]
    },
    knownLosses: {
        total: number,
        flows: EdgeFlowData[]
    },
    waterInProduct: {
        total: number,
        flows: EdgeFlowData[]
    },
}

// todo may possibly be changed to Pick source/discharge only
export type ComponentFlowType = keyof Omit<ComponentEdgeFlowData, 'id' | 'componentName'>;

export interface WaterSystemFlowsTotals {
    sourceWater: number,
    recirculatedWater: number,
    dischargeWater: number,
    knownLosses: number,
    waterInProduct: number,
}
export type ConnectedFlowType = keyof WaterSystemFlowsTotals;


export interface EdgeFlowData {
    source: string,
    target: string,
    flowValue: number,
    diagramEdgeId: string
}
