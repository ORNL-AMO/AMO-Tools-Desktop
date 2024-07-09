import { ProcessFlowPart } from "../../../process-flow-types/shared-process-flow-types";

export interface WaterAssessment {
    name?: string;
    existingDataUnits?: string;
    modifications: Array<Modification>;
    selected?: boolean;
    systemBasics: WaterSystemBasics,
    intakeSources?: IntakeSource[],
    waterUsingSystems?: WaterUsingSystem[],
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


export interface WaterAssessmentResults {}

export interface IntakeSource extends ProcessFlowPart {
    sourceType: string,
    annualUse: number
}

export interface DischargeOutlet extends ProcessFlowPart {
    sourceType: string,
    annualUse: number
}

export interface WaterUsingSystem extends ProcessFlowPart {
    systemType: string,
    
}

export type WaterProcessComponent = IntakeSource | WaterUsingSystem;


export interface WaterBalanceResults {
    sourceWater: number,
    recirculatedWater: number,
    grossWaterUse: number,
}

export interface ProcessUse  {
    waterRequired: number,
    waterConsumed: number,
    waterLossInput: number,
    hoursPerYear: number,
    // annual production units
    annualProduction: number
    fractionGrossWaterRecirculated: number,
}

export interface ProcessUseResults {
    grossWaterUse: number,
    waterConsumed: number,
    waterLoss: number,
    recirculatedWater: number,
    incomingWater: number,
    wasteDischargedAndRecycledOther: number,
}


export interface CoolingTower {
    hoursPerYear: number,
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

export interface BoilerWater {
    hoursPerYear: number,
    power: number
    loadFactor: number,
    steamPerPower: number,
    feedwaterConductivity: number,
    makeupConductivity: number,
    blowdownConductivity: number,
}

export interface BoilerWaterResults {
    cyclesOfConcentration: number,
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


export interface HeatEnergyInputs {
    incomingTemp: number,
    outgoingTemp: number,
    heaterEfficiency: number,
    heatingFuelType: string,
    wasteWaterDischarge: number
}

export interface HeatEnergyResults {
    heatEnergy: number,
    
}

export interface MotorEnergy {
    numberUnits: number,
    hoursPerYear: number,
    ratedPower: number,
    systemEfficiency: string,
}

export interface MotorEnergyResults {
    energyUse: number,
}