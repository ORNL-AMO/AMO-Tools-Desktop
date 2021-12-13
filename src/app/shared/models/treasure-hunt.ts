import { LightingReplacementData } from "./lighting";
import { OperatingHours } from "./operations";
import { ReplaceExistingData, MotorDriveInputs } from "./calculators";
import { NaturalGasReductionData, ElectricityReductionData, CompressedAirReductionData, WaterReductionData, CompressedAirPressureReductionData, SteamReductionData, PipeInsulationReductionInput, TankInsulationReductionInput, AirLeakSurveyInput } from "./standalone";
import { WallLoss } from "./phast/losses/wallLoss";
import { FlueGas } from "./phast/losses/flueGas";
import { EnergyData } from "./phast/losses/chargeMaterial";
import { LeakageLoss } from "./phast/losses/leakageLoss";
import { WasteHeatInput } from "./phast/wasteHeat";
import { OpeningLoss } from "./phast/losses/openingLoss";
import { AirHeatingInput } from "./phast/airHeating";
import { HeatCascadingInput } from "./phast/heatCascading";
import { WaterHeatingInput } from "./steam/waterHeating";
import { FlueGasEnergyData } from "../../calculator/furnaces/flue-gas/energy-form.service";
import { FeedwaterEconomizerInput } from "./steam/feedwaterEconomizer";
import { CondensingEconomizerInput } from "./steam/condensingEconomizer";

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
    pipeInsulationReductions?: Array<PipeInsulationReductionTreasureHunt>;
    tankInsulationReductions?: Array<TankInsulationReductionTreasureHunt>;
    airLeakSurveys?: Array<AirLeakSurveyTreasureHunt>;
    wasteHeatReductions?: Array<WasteHeatTreasureHunt>;
    airHeatingOpportunities?: Array<AirHeatingTreasureHunt>;
    wallLosses?: Array<WallLossTreasureHunt>;
    leakageLosses?: Array<LeakageLossTreasureHunt>;
    flueGasLosses?: Array<FlueGasTreasureHunt>;
    openingLosses?: Array<OpeningLossTreasureHunt>;
    heatCascadingOpportunities?: Array<HeatCascadingTreasureHunt>;
    condensingEconomizerOpportunities?: Array<CondensingEconTreasureHunt>;
    waterHeatingOpportunities?: Array<WaterHeatingTreasureHunt>;
    operatingHours?: OperatingHours;
    currentEnergyUsage?: EnergyUsage;
    existingDataUnits?: string;
    setupDone: boolean;
}

export enum Treasure {
    lightingReplacement = 'lighting-replacement',
    opportunitySheet = 'opportunity-sheet',
    replaceExisting = 'replace-existing',
    motorDrive = 'motor-drive',
    naturalGasReduction = 'natural-gas-reduction',
    electricityReduction = 'electricity-reduction',
    compressedAir = 'compressed-air-reduction',
    compressedAirPressure = 'compressed-air-pressure-reduction',
    waterReduction = 'water-reduction',
    steamReduction = 'steam-reduction',
    pipeInsulation = 'pipe-insulation-reduction',
    tankInsulation = 'tank-insulation-reduction',
    airLeak = 'air-leak-survey',
    wallLoss = 'wall-loss',
    airHeating = 'air-heating',
    flueGas = 'flue-gas',
    leakageLoss = 'leakage-loss',
    wasteHeat = 'waste-heat',
    openingLoss = 'opening-loss',
    heatCascading = 'heat-cascading',
    waterHeating = 'water-heating',
    feedwaterEconomizer = 'feedWaterEconomizer',
    condensingEconomizer = 'condensing-economizer',
}

export interface FilterOption {
    value: string,
    selected: boolean, 
    numCalcs: number, 
    display: string 
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
    waterCO2OutputRate?: number,
    wasteWaterUsage: number,
    wasteWaterCosts: number,
    wasteWaterUsed: boolean,
    wasteWaterCO2OutputRate?: number,
    compressedAirUsage: number,
    compressedAirCosts: number,
    compressedAirUsed: boolean,
    compressedAirCO2OutputRate?: number,
    steamUsage: number,
    steamCosts: number
    steamUsed: boolean,
    steamCO2OutputRate?: number,
}

export interface OpportunitySheet extends TreasureHuntOpportunity {
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
    labor?: number,
    implementationEffort?: number,
    otherCosts?: Array<OtherCostItem>,
    costDescription?: string
    additionalSavings?: OtherCostItem,
    additionalAnnualSavings?: OtherCostItem
}

export interface OtherCostItem {
    cost?: number,
    description?: string
}


export interface SteamReductionTreasureHunt extends TreasureHuntOpportunity {
    baseline: Array<SteamReductionData>;
    modification: Array<SteamReductionData>;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}

export interface ReplaceExistingMotorTreasureHunt extends TreasureHuntOpportunity {
    replaceExistingData?: ReplaceExistingData;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}


export interface LightingReplacementTreasureHunt extends TreasureHuntOpportunity {
    baseline: Array<LightingReplacementData>;
    modifications?: Array<LightingReplacementData>;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
    baselineElectricityCost?: number;
    modificationElectricityCost?: number;
}


export interface NaturalGasReductionTreasureHunt extends TreasureHuntOpportunity{
    baseline: Array<NaturalGasReductionData>;
    modification: Array<NaturalGasReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface ElectricityReductionTreasureHunt extends TreasureHuntOpportunity{
    baseline: Array<ElectricityReductionData>;
    modification: Array<ElectricityReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface CompressedAirReductionTreasureHunt extends TreasureHuntOpportunity{
    baseline: Array<CompressedAirReductionData>;
    modification: Array<CompressedAirReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface CompressedAirPressureReductionTreasureHunt extends TreasureHuntOpportunity{
    baseline: Array<CompressedAirPressureReductionData>;
    modification: Array<CompressedAirPressureReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface PipeInsulationReductionTreasureHunt extends TreasureHuntOpportunity{
    baseline: PipeInsulationReductionInput;
    modification: PipeInsulationReductionInput;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface TankInsulationReductionTreasureHunt extends TreasureHuntOpportunity {
    baseline: TankInsulationReductionInput;
    modification: TankInsulationReductionInput;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface WaterReductionTreasureHunt extends TreasureHuntOpportunity{
    baseline: Array<WaterReductionData>;
    modification: Array<WaterReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface WastewaterReductionTreasureHunt extends TreasureHuntOpportunity{
    baseline: Array<WaterReductionData>;
    modification: Array<WaterReductionData>;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface AirLeakSurveyTreasureHunt extends TreasureHuntOpportunity {
    airLeakSurveyInput: AirLeakSurveyInput,
}

export interface WasteHeatTreasureHunt extends TreasureHuntOpportunity {
    inputData: WasteHeatInput;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface AirHeatingTreasureHunt extends TreasureHuntOpportunity {
    inputData: AirHeatingInput;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface WallLossTreasureHunt extends TreasureHuntOpportunity {
    baseline: Array<WallLoss>;
    modification: Array<WallLoss>;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface LeakageLossTreasureHunt extends TreasureHuntOpportunity {
    baseline: Array<LeakageLoss>;
    modification: Array<LeakageLoss>;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface FlueGasTreasureHunt extends TreasureHuntOpportunity {
    baseline: FlueGas;
    modification: FlueGas;
    baselineEnergyData: FlueGasEnergyData;
    modificationEnergyData: FlueGasEnergyData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface OpeningLossTreasureHunt extends TreasureHuntOpportunity {
    baseline: Array<OpeningLoss>;
    modification: Array<OpeningLoss>;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface HeatCascadingTreasureHunt extends TreasureHuntOpportunity {
    inputData: HeatCascadingInput;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface WaterHeatingTreasureHunt extends TreasureHuntOpportunity {
    inputData: WaterHeatingInput;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface FeedwaterEconomizerTreasureHunt extends TreasureHuntOpportunity {
    inputData: FeedwaterEconomizerInput;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface CondensingEconTreasureHunt extends TreasureHuntOpportunity {
    inputData: CondensingEconomizerInput;
    energySourceData: EnergySourceData;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}


export interface EnergySourceData {
    energySourceType: string,
    fuelCost?: {
        baseline: number,
        modification: number
    }
    unit: string
}

export interface TreasureHuntOpportunity {
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
    // opportunityType == calculator selector/name
    opportunityType: string;
    opportunityIndex?: number;
}

export interface TreasureHuntOpportunityResults {
    costSavings: number,
    energySavings: number,
    baselineCost: number,
    modificationCost: number,
    utilityType: string,
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

export interface MotorDriveInputsTreasureHunt extends TreasureHuntOpportunity{
    motorDriveInputs?: MotorDriveInputs;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}

export interface TreasureHuntResults {
    totalSavings: number;
    percentSavings: number;
    totalBaselineCost: number;
    totalModificationCost: number;
    totalAdditionalSavings: number,

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
    hasMixed?: boolean,
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
    modificationCost: number,
    team: string,
    equipment: string,
    owner: string
}


export interface SavingsItem { 
    savings: number, 
    currentCost: number,
    newCost: number, 
    label: string 
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
    pipeInsulationReductions?: Array<PipeInsulationReductionTreasureHunt>;
    tankInsulationReductions?: Array<TankInsulationReductionTreasureHunt>;
    airLeakSurveys?: Array<AirLeakSurveyTreasureHunt>;
    openingLosses?: Array<OpeningLossTreasureHunt>;
    airHeatingOpportunities?: Array<AirHeatingTreasureHunt>;
    wallLosses?: Array<WallLossTreasureHunt>;
    leakageLosses?: Array<LeakageLossTreasureHunt>;
    flueGasLosses?: Array<FlueGasTreasureHunt>;
    wasteHeatReductions?: Array<WasteHeatTreasureHunt>;
    heatCascadingOpportunities?: Array<HeatCascadingTreasureHunt>;
    waterHeatingOpportunities?: Array<WaterHeatingTreasureHunt>;
}