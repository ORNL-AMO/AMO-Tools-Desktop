import { Co2SavingsData } from "../../calculator/utilities/co2-savings/co2-savings.service";
import { SavingsOpportunity } from "./explore-opps";

export interface WasteWater {
    baselineData: WasteWaterData,
    modifications?: Array<WasteWaterData>,
    systemBasics: SystemBasics,
    setupDone?: boolean,
    existingDataUnits?: string
}

export interface WasteWaterOperations {
    MaxDays: number,
    TimeIncrement?: number,
    operatingMonths: number,
    EnergyCostUnit: number
}

export interface SystemBasics {
    equipmentNotes?: string
}

export interface WasteWaterData {
    activatedSludgeData: ActivatedSludgeData,
    aeratorPerformanceData: AeratorPerformanceData,
    name: string,
    id: string,
    outputs?: WasteWaterResults,
    valid?: WasteWaterValid,
    exploreOpportunities?: boolean,
    exploreAeratorPerformance?: SavingsOpportunity,
    exploreAeratorUpgrade?: SavingsOpportunity,
    exploreReduceOxygen?: SavingsOpportunity,
    exploreMLSS?: SavingsOpportunity,
    exploreVOLR?: SavingsOpportunity,
    exploreRAS?: SavingsOpportunity,
    operations?: WasteWaterOperations,
    co2SavingsData?: Co2SavingsData,
}

export interface ActivatedSludgeData {
    Temperature: number,
    So: number,
    isUserDefinedSo: boolean,
    influentCBODBefore : number,
    clarifierEfficiency: number,
    Volume: number,
    FlowRate: number,
    InertVSS: number,
    OxidizableN: number,
    Biomass: number,
    InfluentTSS: number,
    InertInOrgTSS: number,
    EffluentTSS: number,
    RASTSS: number,
    MLSSpar: number,
    FractionBiomass: number,
    BiomassYeild: number,
    HalfSaturation: number,
    MicrobialDecay: number,
    MaxUtilizationRate: number,
    CalculateGivenSRT: boolean,
    DefinedSRT: number
}

export interface AeratorPerformanceData {
    OperatingDO: number,
    Alpha: number,
    Beta: number,
    SOTR: number,
    Aeration: number,
    Elevation: number,
    OperatingTime: number,
    TypeAerators: number,
    Aerator: string,
    Speed: number,
    AnoxicZoneCondition: boolean
}


export interface WasteWaterResults {
    TotalAverageDailyFlowRate: number,
    VolumeInService: number,
    InfluentBOD5Concentration: number,
    InfluentBOD5MassLoading: number,
    SecWWOxidNLoad: number,
    SecWWTSSLoad: number,
    FM_ratio: number,
    SolidsRetentionTime: number,
    MLSS: number,
    MLVSS: number,
    TSSSludgeProduction: number,
    TSSInActivatedSludgeEffluent: number,
    TotalOxygenRequirements: number,
    TotalOxygenReqWDenit: number,
    TotalOxygenSupplied: number,
    MixingIntensityInReactor: number,
    RASFlowRate: number,
    RASRecyclePercentage: number,
    WASFlowRate: number,
    RASTSSConcentration: number,
    TotalSludgeProduction: number,
    ReactorDetentionTime: number,
    VOLR: number,
    EffluentCBOD5: number,
    EffluentTSS: number,
    EffluentAmmonia_N: number,
    EffluentNO3_N: number,
    EffluentNO3_N_W_Denit: number,
    AeEnergy: number,
    AeEnergyAnnual: number,
    AeCost: number,
    FieldOTR: number,
    co2EmissionsOutput: number,
    co2EmissionsSavings: number,
    costSavings: number,
    energySavings: number,
    percentCostSavings: number,
    calculationsTable: Array<Array<number>>,
    calculationsTableMapped: Array<CalculationsTableRow>
}

export interface CalculationsTableRow {
    index: number,
    Se: number,
    HeterBio: number,
    CellDeb: number,
    InterVes: number,
    MLVSS: number,
    MLSS: number,
    BiomassProd: number,
    SludgeProd: number,
    SolidProd: number,
    Effluent: number,
    InertWaste: number,
    OxygenRqd: number,
    FlowMgd: number,
    NRemoved: number,
    NRemovedMgl: number,
    NitO2Dem: number,
    O2Reqd: number,
    EffNH3N: number,
    EffNo3N: number,
    TotalO2Rqd: number,
    WAS: number,
    EstimatedEff: number,
    EstimRas: number,
    FmRatio: number,
    Diff_MLSS: number,
    SRT: number
}


export interface WasteWaterTreatmentInputData {
    Temperature: number,
    So: number,
    isUserDefinedSo: boolean,
    influentCBODBefore: number,
    clarifierEfficiency: number,
    Volume: number,
    FlowRate: number,
    InertVSS: number,
    OxidizableN: number,
    Biomass: number,
    InfluentTSS: number,
    InertInOrgTSS: number,
    EffluentTSS: number,
    RASTSS: number,
    MLSSpar: number,
    FractionBiomass: number,
    BiomassYeild: number,
    HalfSaturation: number,
    MicrobialDecay: number,
    MaxUtilizationRate: number,
    MaxDays: number,
    TimeIncrement: number,
    OperatingDO: number,
    Alpha: number,
    Beta: number,
    SOTR: number,
    Aeration: number,
    Elevation: number,
    OperatingTime: number,
    TypeAerators: number,
    Speed: number,
    EnergyCostUnit: number,
    DefinedSRT?: number

}

export interface WasteWaterValid {
    isValid: boolean,
    activatedSludgeValid: boolean,
    aeratorPerformanceValid: boolean,
    operationsValid: boolean
}

export interface StatePointAnalysisInput {
    sviValue: number;
    sviParameter: number;
    numberOfClarifiers: number;
    areaOfClarifier: number;
    diameter: number;
    isUserDefinedArea: boolean;
    MLSS: number;
    influentFlow: number;
    rasFlow: number;
    sludgeSettlingVelocity: number;
}

export interface StatePointAnalysisOutput {
    baseline: StatePointAnalysisResults,
    modification: StatePointAnalysisResults,
    sviParameterName?: string
}

export interface StatePointAnalysisResults {
    SurfaceOverflow: number;
    AppliedSolidsLoading: number;
    TotalAreaClarifier: number;
    RasConcentration: number;
    UnderFlowRateX2: number;
    UnderFlowRateY1: number;
    OverFlowRateX2: number;
    OverFlowRateY2: number;
    StatePointX: number;
    StatePointY: number;
    graphData?: Array<Array<number>>;
}