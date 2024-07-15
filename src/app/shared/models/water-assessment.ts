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
    systemType: number,
    sourceWater: number,
    recycledWater: number,
    recirculatedWater: number,
    intakeSources: IntakeSource[],
    heatEnergy?: HeatEnergy,
    addedMotorEquipment: MotorEnergy[],
}

export type WaterProcessComponent = IntakeSource | DischargeOutlet | WaterUsingSystem;


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

// * grossWaterUse, waterConsumed, waterLoss are added on MEASUR side
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