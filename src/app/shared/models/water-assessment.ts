import { ProcessFlowPart } from "../../../process-flow-types/shared-process-flow-types";

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
    notes: string
}


export enum WaterSystemTypeEnum {
    PROCESS = 0,
    COOLINGTOWER = 1,
    BOILER = 2,
    KITCHEN = 3,
    LANDSCAPING = 4
}

export interface WaterAssessmentResults {
    waterBalance: WaterBalanceResults,
    aggregatedSystemResults: AggregatedSystemResults
}

export interface WaterBalanceResults {
    sourceWater: number,
    recirculatedWater: number,
    grossWaterUse: number,
}

export interface AggregatedSystemResults {
    processUseAggregatedResults: ProcessUseAggregatedResults,
    coolingtowerAggregatedResults: CoolingTowerAggregatedResults,
}

export interface WaterSystemResults {
    grossWaterUse: number,
    waterBalance: WaterBalanceResults,
    processUseResults?: ProcessUseResults,
    coolingTowerResults?: CoolingTowerResults,
    boilerWaterResults?: BoilerWaterResults,
    kitchenRestroomResults?: KitchenRestroomResults,
    landscapingResults?: LandscapingResults,
    heatEnergyResults?: HeatEnergyResults,
    motorEnergyResults?: MotorEnergyResults[]
}

// * Plant level intakes AND system level intakes
// * IMPORTANT Partial - use in WaterUsingSystem without type check for diagram component properties
export interface IntakeSource extends Partial<ProcessFlowPart> {
    sourceType: number,
    annualUse: number
}

// * Plant level discharge
export interface DischargeOutlet extends ProcessFlowPart {
    outletType: number,
    annualUse: number
}

export interface WaterUsingSystem extends ProcessFlowPart {
    isValid: boolean,
    hoursPerYear: number,
    systemType: number,
    sourceWater: number,
    recycledWater: number,
    recirculatedWater: number,
    dischargeWater: number,
    dischargeWaterRecycled: number,
    knownLosses: number,
    waterInProduct: number,
    processUse?: ProcessUse,
    coolingTower?: CoolingTower,
    boilerWater?: BoilerWater,
    intakeSources: IntakeSource[],
    heatEnergy?: HeatEnergy,
    kitchenRestroom?: KitchenRestroom,
    landscaping?: Landscaping,
    addedMotorEquipment: MotorEnergy[],
}

export interface WasteWaterTreatment extends ProcessFlowPart {
    flowPercent: number
}

export interface WaterTreatment extends ProcessFlowPart {
    treatmentType: number,
    customType: string,
    cost: number,
    flowValue: number
}


export type WaterProcessComponent = IntakeSource | DischargeOutlet | WaterUsingSystem | WaterTreatment | WasteWaterTreatment;

export type WaterSystemTypeData = ProcessUse | CoolingTower | BoilerWater | KitchenRestroom | Landscaping;

export enum FlowMetric {
    ANNUAL = 0,
    HOURLY = 1,
    INTENSITY = 2,
    FRACTION_GROSS = 3,
    FRACTION_INCOMING = 4
}

export interface ProcessUse  {
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

export interface ProcessUseAggregatedResults {
    processUseResults: ProcessUseResults[],
    grossWaterUse: number,
    waterConsumed: number,
    waterLoss: number,
    recirculatedWater: number,
    incomingWater: number,
    wasteDischargedAndRecycledOther: number,
}

export interface CoolingTower {
    // hoursPerYear: number,
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

export interface CoolingTowerAggregatedResults {
    coolingTowerResults: CoolingTowerResults[],
    grossWaterUse: number,
    evaporationLoss: number,
    cycleOfConcentration: number,
    makeupWater: number,
    blowdownLoss: number,
}

export interface BoilerWater {
    // hoursPerYear: number,
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
    employeeCount: number,
    workdaysPerYear: number,
    dailyUsePerEmployee: number
}

export interface KitchenRestroomResults {
    grossWaterUse: number
}

export interface Landscaping {
    areaIrrigated: number,
    yearlyInchesIrrigated: number,
}

export interface LandscapingResults {
    grossWaterUse: number
}


export interface HeatEnergy {
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