import { LightingReplacementData } from "./lighting";
import { OperatingHours } from "./operations";
import { ReplaceExistingData, MotorDriveInputs } from "./calculators";
import { NaturalGasReductionData, ElectricityReductionData, CompressedAirReductionData, WaterReductionData, CompressedAirPressureReductionData, SteamReductionData } from "./standalone";

export interface TreasureHunt {
    name: string,
    lightingReplacements?: Array<LightingReplacementTreasureHunt>;
    opportunitySheets?: Array<OpportunitySheet>;
    replaceExistingMotors?: Array<ReplaceExistingMotorTreasureHunt>;
    motorDrives?: Array<MotorDriveInputsTreasureHunt>;
    naturalGasReductions?: Array<NaturalGasReductionTreasureHunt>;
    electricityReductions?: Array<ElectricityReductionTreasureHunt>;
    compressedAirReductions?: Array<CompressedAirReductionTreasureHunt>;
    compressedAirPressureReductions?: Array<CompressedAirPressureReductionTreasureHunt>;
    waterReductions?: Array<WaterReductionTreasureHunt>;
    steamReductions?: Array<SteamReductionTreasureHunt>;
    operatingHours?: OperatingHours;
    currentEnergyUsage?: EnergyUsage;
    setupDone: boolean;
}

export interface EnergyUsage {
    electricityUsage: number,
    electricityCosts: number,
    electricityUsed: boolean,
    naturalGasUsage: number,
    naturalGasCosts: number,
    naturalGasUsed: boolean,
    otherFuelUsage: number,
    otherFuelCosts: number,
    otherFuelUsed: boolean,
    waterUsage: number,
    waterCosts: number,
    waterUsed: boolean,
    wasteWaterUsage: number,
    wasteWaterCosts: number,
    wasteWaterUsed: boolean,
    compressedAirUsage: number,
    compressedAirCosts: number,
    compressedAirUsed: boolean,
    steamUsage: number,
    steamCosts: number
    steamUsed: boolean,
}

export interface OpportunitySheet {
    name: string,
    equipment: string,
    description: string,
    originator?: string,
    date: Date,
    owner?: string,
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

export interface SteamReductionTreasureHunt {
    baseline: Array<SteamReductionData>;
    modification: Array<SteamReductionData>;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}

export interface ReplaceExistingMotorTreasureHunt {
    replaceExistingData?: ReplaceExistingData;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}


export interface LightingReplacementTreasureHunt {
    baseline: Array<LightingReplacementData>;
    modifications?: Array<LightingReplacementData>;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
    baselineElectricityCost?: number;
    modificationElectricityCost?: number;
}


export interface NaturalGasReductionTreasureHunt {
    baseline: Array<NaturalGasReductionData>;
    modification: Array<NaturalGasReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface ElectricityReductionTreasureHunt {
    baseline: Array<ElectricityReductionData>;
    modification: Array<ElectricityReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface CompressedAirReductionTreasureHunt {
    baseline: Array<CompressedAirReductionData>;
    modification: Array<CompressedAirReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface CompressedAirPressureReductionTreasureHunt {
    baseline: Array<CompressedAirPressureReductionData>;
    modification: Array<CompressedAirPressureReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}


export interface WaterReductionTreasureHunt {
    baseline: Array<WaterReductionData>;
    modification: Array<WaterReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface WastewaterReductionTreasureHunt {
    baseline: Array<WaterReductionData>;
    modification: Array<WaterReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
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
    totalCostSavings: number,
    totalImplementationCost: number
}

export interface OpportunitySheetResult {
    baselineEnergyUse: number,
    baselineEnergyCost: number,
    baselineItems: number,
    modificationEnergyUse: number,
    modificationEnergyCost: number,
    modificationItems: number,
    energySavings: number,
    energyCostSavings: number,
}

export interface MotorDriveInputsTreasureHunt{
    motorDriveInputs?: MotorDriveInputs;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}

export interface TreasureHuntResults {
    totalSavings: number;
    percentSavings: number;
    totalBaselineCost: number;
    totalModificationCost: number;

    totalImplementationCost?: number,
    paybackPeriod?: number,

    electricity: UtilityUsageData,
    naturalGas: UtilityUsageData,
    water: UtilityUsageData,
    wasteWater: UtilityUsageData,
    otherFuel: UtilityUsageData,
    compressedAir: UtilityUsageData,
    steam: UtilityUsageData,
    other: UtilityUsageData,
    opportunitySummaries: Array<OpportunitySummary>,
    hasMixed?: boolean
}

export interface OpportunitySummary {
    opportunityName: string,
    utilityType: string,
    costSavings: number,
    totalCost: number,
    totalEnergySavings: number,
    payback: number,
    opportunityCost: OpportunityCost,
    mixedIndividualResults?: Array<OpportunitySummary>,
    selected: boolean,
    baselineCost: number,
    modificationCost: number
}

export interface UtilityUsageData {
    baselineEnergyUsage: number,
    baselineEnergyCost: number,
    modifiedEnergyUsage: number,
    modifiedEnergyCost: number,
    energySavings: number,
    costSavings: number,
    implementationCost?: number,
    paybackPeriod?: number,
    percentSavings: number,
    hasMixed?: boolean
}


export interface OpportunitiesPaybackDetails {
    lessThanOneYear: { numOpportunities: number, totalSavings: number };
    oneToTwoYears: { numOpportunities: number, totalSavings: number };
    twoToThreeYears: { numOpportunities: number, totalSavings: number };
    moreThanThreeYears: { numOpportunities: number, totalSavings: number };
    totals: { numOpportunities: number, totalSavings: number };
}

export interface ImportExportOpportunities {
    lightingReplacements?: Array<LightingReplacementTreasureHunt>;
    opportunitySheets?: Array<OpportunitySheet>;
    replaceExistingMotors?: Array<ReplaceExistingMotorTreasureHunt>;
    motorDrives?: Array<MotorDriveInputsTreasureHunt>;
    naturalGasReductions?: Array<NaturalGasReductionTreasureHunt>;
    electricityReductions?: Array<ElectricityReductionTreasureHunt>;
    compressedAirReductions?: Array<CompressedAirReductionTreasureHunt>;
    waterReductions?: Array<WaterReductionTreasureHunt>;
    compressedAirPressureReductions?: Array<CompressedAirPressureReductionTreasureHunt>;
    steamReductions?: Array<SteamReductionTreasureHunt>;
}