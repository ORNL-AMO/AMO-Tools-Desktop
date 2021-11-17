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
    operations?: WasteWaterOperations
}

export interface ActivatedSludgeData {
    Temperature: number,
    So: number,
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