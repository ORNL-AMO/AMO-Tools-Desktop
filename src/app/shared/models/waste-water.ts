export interface WasteWater {
    baselineData: WasteWaterData,
    modifications?: Array<WasteWaterData>,
    systemBasics: SystemBasics
}

export interface SystemBasics {
    MaxDays: number,
    TimeIncrement: number,
    equipmentNotes: string
}

export interface WasteWaterData {
    activatedSludgeData: ActivatedSludgeData,
    aeratorPerformanceData: AeratorPerformanceData,
    name: string,
    id: string
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
    Speed: number,
    EnergyCostUnit: number,
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
     AeCost: number,
     FieldOTR: number
}