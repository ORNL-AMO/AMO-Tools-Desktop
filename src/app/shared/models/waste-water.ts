export interface WasteWater {
    baselineData: WastewWaterData,
    modifications?: Array<WastewWaterData>,
    modelingOptions: ModelingOptions
}

export interface ModelingOptions {
    MaxDays: number,
    TimeIncrement: number,
}

export interface WastewWaterData {
    activatedSludgeData: ActivatedSludgeData,
    aeratorPerformanceData: AeratorPerformanceData,
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