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
import { Co2SavingsData } from "../../calculator/utilities/co2-savings/co2-savings.service";
import { ChillerPerformanceInput, CoolingTowerBasinInput, CoolingTowerData, CoolingTowerFanInput } from "./chillers";
import { ChillerStagingInput } from "./chillers";
import { WeatherBinsInput } from "../../calculator/utilities/weather-bins/weather-bins.service";
import { ExistingIntegrationData } from "../assessment-integration/assessment-integration.service";
import { BoilerBlowdownRateInputs } from "../../calculator/steam/boiler-blowdown-rate/boiler-blowdown-rate.service";
import { PowerFactorCorrectionInputs } from "../../calculator/utilities/power-factor-correction/power-factor-correction.service";
import { ImportExportTypes } from "../import-export/import.service";

export interface TreasureHunt {
    name: string,
    lightingReplacements?: Array<LightingReplacementTreasureHunt>;
    opportunitySheets?: Array<OpportunitySheet>;
    assessmentOpportunities?: Array<AssessmentOpportunity>;
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
    coolingTowerMakeupOpportunities?: Array<CoolingTowerMakeupWaterTreasureHunt>;
    chillerStagingOpportunities?: Array<ChillerStagingTreasureHunt>;
    chillerPerformanceOpportunities?: Array<ChillerPerformanceTreasureHunt>;
    coolingTowerFanOpportunities?: Array<CoolingTowerFanTreasureHunt>;
    coolingTowerBasinOpportunities?: Array<CoolingTowerBasinTreasureHunt>;
    boilerBlowdownRateOpportunities?: Array<BoilerBlowdownRateTreasureHunt>;    
    powerFactorCorrectionOpportunities?: Array<PowerFactorCorrectionTreasureHunt>;
    operatingHours?: OperatingHours;
    currentEnergyUsage?: EnergyUsage;
    existingDataUnits?: string;
    setupDone: boolean;
}

export interface OpportunityForFiltering {
    iconString: string;
    iconClass: string;
    imageSizeClass: string;
    iconCalcType: string;
    opportunityType: string;
    utilityType: string[];
    name: string;
    description: string;
}

export const opportunities: OpportunityForFiltering[] = [
    // ...existing code...
    // For each opportunity, add 'All' to the utilityType array
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/electricity-reduction-icon.png',
        iconClass: 'calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'utility',
        opportunityType: 'electricity-reduction',
        utilityType: ['All', 'Electricity'],
        name: 'Electricity Reduction',
        description: 'This calculator is used to quantify the energy savings associated with reducing electricity usage.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/power-factor-correction-icon.png',
        iconClass: 'calc-icon utility-calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'utility',
        opportunityType: 'power-factor-correction',
        utilityType: ['All', 'Electricity'],
        name: 'Power Factor Correction',
        description: 'This calculator is used to identify the capacitance (in kVAR) required for improving the power factor to the proposed level'
    },
    {
        iconString: 'assets/images/calculator-icons/motor-icons/replace.png',
        iconClass: 'motor-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'motor',
        opportunityType: 'replace-existing',
        utilityType: ['All', 'Electricity'],
        name: 'Replace Existing Motor',
        description: 'This calculator calculates the energy savings, cost savings, and payback period for replacing an existing motor with a higher efficiency motor.'
    },
    {
        iconString: 'assets/images/calculator-icons/motor-icons/motor-drive.png',
        iconClass: 'motor-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'motor',
        opportunityType: 'motor-drive',
        utilityType: ['All', 'Electricity'],
        name: 'Upgrade Motor Drive',
        description: 'The Motor Drive Calculator compares the annual energy cost of three motor drives: V-belt drive, Notched V-Belt drive, and Synchronous Belt Drive.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/lighting-replacement-icon.png',
        iconClass: 'lighting-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'lighting',
        opportunityType: 'lighting-replacement',
        utilityType: ['All', 'Electricity'],
        name: 'Lighting Replacement',
        description: 'The calculator is designed to quantify the energy savings associated with lighting opportunities.'
    },
    {
        iconString: 'assets/images/calculator-icons/furnace-icons/waste-heat-icon.png',
        iconClass: 'ph-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'process heating',
        opportunityType: 'waste-heat',
        utilityType: ['All', 'Other Fuel', 'Electricity'],
        name: 'Waste Heat',
        description: 'Calculate energy savings from using exhaust gas (waste) heat to provide energy for an absorption chiller in place of a compressor.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/natural-gas-reduction-icon.png',
        iconClass: 'calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'utility',
        opportunityType: 'natural-gas-reduction',
        utilityType: ['All', 'Natural Gas'],
        name: 'Natural Gas Reduction',
        description: 'This calculator is used to quantify the energy savings associated with reducing natural gas usage.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/steam-reduction-icon.png',
        iconClass: 'calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'steam',
        opportunityType: 'steam-reduction',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Other Fuel'],
        name: 'Steam Reduction',
        description: 'This calculator is used to quantify the energy savings associated with reducing steam use.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/pipe-ins.png',
        iconClass: 'steam-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'steam',
        opportunityType: 'pipe-insulation-reduction',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Pipe Insulation',
        description: 'This calculator is used to quantify the energy savings associated with insulating hot pipes.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/tank-ins.png',
        iconClass: 'steam-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'steam',
        opportunityType: 'tank-insulation-reduction',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Tank Insulation',
        description: 'This calculator is used to quantify the energy savings associated with insulating hot tanks.'
    },
    {
        iconString: 'assets/images/calculator-icons/furnace-icons/fluegas.png',
        iconClass: 'ph-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'process heating',
        opportunityType: 'flue-gas',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Flue Gas',
        description: 'Determine the amount of heat lost in the furnace flue gas'
    },
    {
        iconString: 'assets/images/calculator-icons/furnace-icons/opening.png',
        iconClass: 'ph-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'process heating',
        opportunityType: 'opening-loss',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Opening Loss',
        description: 'Estimates losses due to openings in the heating system.'
    },
    {
        iconString: 'assets/images/calculator-icons/furnace-icons/wall-loss.png',
        iconClass: 'ph-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'process heating',
        opportunityType: 'wall-loss',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Wall Loss',
        description: 'This calculator can be used to calculate fuel savings due to changes in wall insulation for a heating system.'
    },
    {
        iconString: 'assets/images/calculator-icons/furnace-icons/leakage.png',
        iconClass: 'ph-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'process heating',
        opportunityType: 'leakage-loss',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Leakage Loss',
        description: 'Estimates losses due to gases leaking out of or into the furnace.'
    },
    {
        iconString: 'assets/images/calculator-icons/furnace-icons/heat-cascading.png',
        iconClass: 'ph-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'process heating',
        opportunityType: 'heat-cascading',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Heat Cascading',
        description: 'This calculator can be used to estimate energy and related cost savings when exhaust gases from a higher temperature (primary) process heating equipment is used to supply heat to lower temperature (secondary) process heating equipment.'
    },
    {
        iconString: 'assets/images/calculator-icons/furnace-icons/air-heating-icon.png',
        iconClass: 'ph-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'process heating',
        opportunityType: 'air-heating',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Electricity', 'Other Fuel'],
        name: 'Air Heating using Flue Gas',
        description: 'This calculator can be used to estimate maximum air flow that can be heated by using exhaust gas heat of flue gases from a furnace, oven, or boiler'
    },
    {
        iconString: 'assets/images/calculator-icons/steam-icons/water-heating-icon.png',
        iconClass: 'steam-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'steam',
        opportunityType: 'water-heating',
        utilityType: ['All', 'Steam', 'Natural Gas', 'Other Fuel'],
        name: 'Vent Steam to Heat Water',
        description: 'This calculator is used to calculate energy and related energy cost saving when vent stream is used to heat water using a steam to liquid heat exchanger.'
    },
    {
        iconString: 'assets/images/calculator-icons/steam-icons/blowdown-rate.png',
        iconClass: 'steam-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'steam',
        opportunityType: 'boiler-blowdown-rate',
        utilityType: ['All', 'Water', 'Natural Gas', 'Other Fuel'],
        name: 'Boiler Blowdown Rate',
        description: 'Calculate the blowdown rate of a boiler.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/compressed-air-reduction-icon.png',
        iconClass: 'calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'compressed Air',
        opportunityType: 'compressed-air-reduction',
        utilityType: ['All', 'Electricity', 'Compressed Air'],
        name: 'Compressed Air Reduction',
        description: 'This calculator is used to quantify the energy savings associated with reducing compressed air usage.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/compressed-air-pressure-reduction-icon.png',
        iconClass: 'ca-calc-icon',
        imageSizeClass: 'calc-img th-calc-img',
        iconCalcType: 'compressed Air',
        opportunityType: 'compressed-air-pressure-reduction',
        utilityType: ['All', 'Electricity'],
        name: 'Compressed Air Pressure Reduction',
        description: 'This calculator is used to quantify the energy savings associated with reducing compressed air system pressure.'
    },
    {
        iconString: 'assets/images/calculator-icons/compressed-air-icons/CAleak-icon.png',
        iconClass: 'ca-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'compressed Air',
        opportunityType: 'air-leak-survey',
        utilityType: ['All', 'Electricity', 'Compressed Air'],
        name: 'Compressed Air - Leak Survey',
        description: 'Used to quantify the energy savings associated with reducing compressed air leaks.'
    },
    {
        iconString: 'assets/images/calculator-icons/utilities-icons/water-reduction-icon.png',
        iconClass: 'calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'utility',
        opportunityType: 'water-reduction',
        utilityType: ['All', 'Waste Water', 'Water'],
        name: 'Water Reduction',
        description: 'This calculator is used to quantify the energy savings associated with reducing water usage and wastewater disposal.'
    },
    {
        iconString: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-makeup-water.png',
        iconClass: 'process-cooling-calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'process cooling',
        opportunityType: 'cooling-tower-makeup',
        utilityType: ['All', 'Water', 'Natural Gas', 'Other Fuel'],
        name: 'Cooling Tower Makeup Water',
        description: 'Analyze cooling tower water consumption.'
    },
    {
        iconString: 'assets/images/calculator-icons/process-cooling-icons/chiller-staging.png',
        iconClass: 'process-cooling-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'process cooling',
        opportunityType: 'chiller-staging',
        utilityType: ['All', 'Electricity'],
        name: 'Chiller Staging',
        description: 'This calculator is used to analyze the impact of chiller staging on energy performance of chilled water systems.'
    },
    {
        iconString: 'assets/images/calculator-icons/process-cooling-icons/chiller-performance.png',
        iconClass: 'process-cooling-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'process cooling',
        opportunityType: 'chiller-performance',
        utilityType: ['All', 'Electricity'],
        name: 'Chiller Performance',
        description: 'This calculator is used to analyze the impact of chiller operating parameters on energy performance.'
    },
    {
        iconString: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-fan.png',
        iconClass: 'process-cooling-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'process cooling',
        opportunityType: 'cooling-tower-fan',
        utilityType: ['All', 'Electricity'],
        name: 'Cooling Tower Fan Energy',
        description: 'This calculator is used to calculate cooling tower fan energy consumption.'
    },
    {
        iconString: 'assets/images/calculator-icons/process-cooling-icons/cooling-tower-basin-heater.png',
        iconClass: 'process-cooling-calc-icon',
        imageSizeClass: 'calc-img th-calc-img-w',
        iconCalcType: 'process cooling',
        opportunityType: 'cooling-tower-basin',
        utilityType: ['All', 'Electricity'],
        name: 'Cooling Tower Basin Heater Energy',
        description: 'This calculator is used to analyze basin heater energy consumption.'
    },
    {
        iconString: 'assets/images/calculator-icons/opportunity-sheet-icon.png',
        iconClass: 'calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'utility',
        opportunityType: 'opportunity-sheet',
        utilityType: ['All', 'Mixed'],
        name: 'Custom Savings Opportunity',
        description: 'This calculator provides a space to add a Treasure Hunt Opportunity without using a calculator (such as after having done off-sheet calculations). Enter Baseline and Modification Utility use to calculate savings.'
    },
    {
        iconString: 'assets/images/app-icon.png',
        iconClass: 'calc-icon',
        imageSizeClass: 'calc-img',
        iconCalcType: 'utility',
        opportunityType: 'assessment-opportunity',
        utilityType: ['All', 'Mixed'],
        name: 'Assessment Opportunity',
        description: 'Create a Treasure Hunt Opportunity from an existing assessment. Baseline and Modification Utility use will be used to calculate savings.'
    }
];

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
    coolingTowerMakeup = 'cooling-tower-makeup',
    chillerStaging = 'chiller-staging',
    chillerPerformance = 'chiller-performance',
    coolingTowerFan = 'cooling-tower-fan',
    coolingTowerBasin = 'cooling-tower-basin',
    assessmentOpportunity ='assessment-opportunity',
    boilerBlowdownRate = 'boiler-blowdown-rate',
    powerFactorCorrection = 'power-factor-correction'
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
    electricityCO2SavingsData?: Co2SavingsData,
    naturalGasUsage: number,
    naturalGasCosts: number,
    naturalGasUsed: boolean,
    naturalGasCO2SavingsData?: Co2SavingsData,
    otherFuelUsage: number,
    otherFuelCosts: number,
    otherFuelUsed: boolean,
    otherFuelCO2SavingsData?: Co2SavingsData,
    otherFuelMixedCO2SavingsData?: Array<Co2SavingsData>,
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
    steamCO2OutputRate?: number
}

export interface TreasureHuntCo2EmissionsResults {
    electricityCO2CurrentUse?: number,
    electricityCO2ProjectedUse?: number,
    electricityCO2Savings?: number,
    
    naturalGasCO2CurrentUse?: number,
    naturalGasCO2ProjectedUse?: number,
    naturalGasCO2Savings?: number,
    
    otherFuelCO2CurrentUse?: number,
    otherFuelCO2ProjectedUse?: number,
    otherFuelCO2Savings?: number,
    
    waterCO2CurrentUse?: number,
    waterCO2ProjectedUse?: number,
    waterCO2Savings?: number,
    
    wasteWaterCO2CurrentUse?: number,
    wasteWaterCO2ProjectedUse?: number,
    wasteWaterCO2Savings?: number,
    
    compressedAirCO2CurrentUse?: number,
    compressedAirCO2ProjectedUse?: number,
    compressedAirCO2Savings?: number,
    
    steamCO2CurrentUse?: number,
    steamCO2ProjectedUse?: number,
    steamCO2Savings?: number,
  
    totalCO2CurrentUse?: number,
    totalCO2ProjectedUse?: number,
    totalCO2Savings?: number,
    
  }

export interface OpportunitySheet extends TreasureHuntOpportunity {
    name: string,
    equipment: string,
    description: string,
    originator?: string,
    date: Date,
    owner?: string,
    businessUnits?: string,
    iconString?: string,
    opportunityCost: OpportunityCost,
    baselineEnergyUseItems?: Array<EnergyUseItem>,
    modificationEnergyUseItems?: Array<EnergyUseItem>,
    selected?: boolean
}

export interface AssessmentOpportunity extends TreasureHuntOpportunity {
    name: string,
    existingIntegrationData: ExistingIntegrationData,
    equipment: string,
    description: string,
    originator?: string,
    date: Date,
    owner?: string,
    iconString?: string,
    businessUnits?: string,
    opportunityCost: OpportunityCost,
    baselineEnergyUseItems?: Array<EnergyUseItem>,
    modificationEnergyUseItems?: Array<EnergyUseItem>,
    selected?: boolean,
}



export interface UtilityTypeTreasureHuntEmissions {
    electricityEmissions: number,
    naturalGasEmissions: number,
    otherFuelEmissions: number,
    waterEmissions: number,
    wasteWaterEmissions: number,
    compressedAirEmissions: number,
    steamEmissions: number,
}
export interface EnergyUseItem {
    type: string, 
    amount: number,
    integratedUnit?: string,
    integratedEmissionRate?: number,
    integratedEnergyCost?: number
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

export interface CoolingTowerMakeupWaterTreasureHunt extends TreasureHuntOpportunity{
    baseline: Array<CoolingTowerData>;
    modification: Array<CoolingTowerData>;
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

export interface PowerFactorCorrectionTreasureHunt extends TreasureHuntOpportunity {
    inputData: PowerFactorCorrectionInputs;
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}



export interface EnergySourceData {
    energySourceType: OpportunityUtilityType,
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
    utilityType: OpportunityUtilityType,
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

export interface AssessmentOpportunityResults {
    electricityResults: AssessmentOpportunityResult,
    gasResults: AssessmentOpportunityResult,
    compressedAirResults: AssessmentOpportunityResult,
    otherFuelResults: AssessmentOpportunityResult,
    steamResults: AssessmentOpportunityResult,
    waterResults: AssessmentOpportunityResult,
    wasteWaterResults: AssessmentOpportunityResult,
    totalEnergySavings: number,
    totalCostSavings: number,
    totalImplementationCost: number
}

export interface AssessmentOpportunityResult {
    baselineEnergyUse: number,
    baselineEnergyCost: number,
    baselineItems: number,
    modificationEnergyUse: number,
    modificationEnergyCost: number,
    modificationItems: number,
    energySavings: number,
    energyCostSavings: number,
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

export interface ChillerStagingTreasureHunt extends TreasureHuntOpportunity {
    chillerStagingData?: ChillerStagingInput;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}

export interface ChillerPerformanceTreasureHunt extends TreasureHuntOpportunity {
    chillerPerformanceData?: ChillerPerformanceInput;
    opportunitySheet?: OpportunitySheet
    selected?: boolean;
}

export interface CoolingTowerFanTreasureHunt extends TreasureHuntOpportunity {
    coolingTowerFanData?: CoolingTowerFanInput;    
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface CoolingTowerBasinTreasureHunt extends TreasureHuntOpportunity {
    coolingTowerBasinData?: CoolingTowerBasinInput;  
    weatherData?: WeatherBinsInput;  
    opportunitySheet?: OpportunitySheet;
    selected?: boolean;
}

export interface BoilerBlowdownRateTreasureHunt extends TreasureHuntOpportunity {
    baseline: BoilerBlowdownRateInputs;
    modification: BoilerBlowdownRateInputs;
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
    totalAdditionalImplementationCost?: number,
    totalAdditionalPayback?: number,

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
    co2EmissionsResults?: TreasureHuntCo2EmissionsResults,
}

export interface OpportunitySummary {
    opportunityName: string,
    isAssessmentOpportunity?: boolean,
    utilityType: OpportunityUtilityType,
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

//TODO: WHAT IS OTHER?
export type OpportunityUtilityType = 'Electricity' | 'Natural Gas' | 'Water' | 'Waste Water' | 'Other Fuel' | 'Compressed Air' | 'Steam' | 'Mixed' | 'Other';


export interface SavingsItem { 
    savings: number, 
    currentCost: number,
    currentEnergyUse?: number,
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
    origin?: ImportExportTypes;
    lightingReplacements?: Array<LightingReplacementTreasureHunt>;
    opportunitySheets?: Array<OpportunitySheet>;
    assessmentOpportunities?: Array<AssessmentOpportunity>;
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
    coolingTowerMakeupOpportunities?: Array<CoolingTowerMakeupWaterTreasureHunt>;
    chillerStagingOpportunities?: Array<ChillerStagingTreasureHunt>;
    chillerPerformanceOpportunities?: Array<ChillerPerformanceTreasureHunt>;
    coolingTowerFanOpportunities?: Array<CoolingTowerFanTreasureHunt>;
    coolingTowerBasinOpportunities?: Array<CoolingTowerBasinTreasureHunt>;
    boilerBlowdownRateOpportunities?: Array<BoilerBlowdownRateTreasureHunt>;
    powerFactorCorrectionOpportunities?: Array<PowerFactorCorrectionTreasureHunt>;
}