export interface WasteWater {
    baselineData: WastewWaterData,
    modifications?: Array<WastewWaterData>
   

}

export interface WastewWaterData {
    activatedSludgeData: ActivatedSludgeData,
    aeratorPerformanceData: AeratorPerformanceData,
    MaxDays: number,
    TimeIncrement: number,
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