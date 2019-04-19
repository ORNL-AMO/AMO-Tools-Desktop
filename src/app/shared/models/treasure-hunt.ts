import { LightingReplacementData } from "./lighting";
import { OperatingHours } from "./operations";

export interface TreasureHunt {
    name: string,
    lightingReplacements?: Array<LightingReplacementTreasureHunt>;
    opportunitySheets?: Array<OpportunitySheet>;
    operatingHours?: OperatingHours;
    currentEnergyUsage?: EnergyUsage
}

export interface EnergyUsage {
    electricityUsage: number,
    electricityCosts: number,
    naturalGasUsage: number,
    naturalGasCosts: number,
    otherFuelUsage: number,
    otherFuelCosts: number,
}

export interface OpportunitySheet {
    name: string,
    equipment: string,
    description: string,
    originator?: string,
    date: Date,
    plant?: string,
    businessUnits?: string,
    opportunityCost: OpportunityCost,
    baselineEnergyUseItems?: Array<EnergyUseItem>,
    modificationEnergyUseItems?: Array<EnergyUseItem>,
    selected?: boolean
}

export interface EnergyUseItem {
    type: string, 
    amount: number
}

export interface OpportunityCost {
    engineeringServices?: number,
    material?: number,
    labor?: number
    otherCosts?: Array<OtherCostItem>,
    costDescription?: string
    additionalSavings?: OtherCostItem
}

export interface OtherCostItem {
    cost?: number,
    description?: string
}


export interface LightingReplacementTreasureHunt {
    baseline: Array<LightingReplacementData>;
    modifications?: Array<LightingReplacementData>;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
    baselineElectricityCost?: number,
    modificationElectricityCost?: number
}

export interface OpportunitySheetResults {
    electricityResults: OpportunitySheetResult,
    gasResults: OpportunitySheetResult,
    compressedAirResults: OpportunitySheetResult,
    otherFuelResults: OpportunitySheetResult,
    steamResults: OpportunitySheetResult,
    waterResults: OpportunitySheetResult,
    wasteWaterResults: OpportunitySheetResult,
    totalEnergySavings: number,
    totalCostSavings: number
}


export interface OpportunitySheetResult {
    baselineEnergyUse: number,
    baselineEnergyCost: number,
    modificationEnergyUse: number,
    modificationEnergyCost: number,
    energySavings: number,
    energyCostSavings: number
}