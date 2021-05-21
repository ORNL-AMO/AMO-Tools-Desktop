export interface EnrichmentInput {
    inputData: EnrichmentInputData,
    adapter?: SuiteInputAdapter 
}

export interface EnrichmentOutput {
    outputData: EnrichmentOutputData,
    inputData?: EnrichmentInputData
}

export interface EnrichmentInputData {
    name: string,
    isBaseline?: boolean,
    operatingHours: number;
    o2CombAir: number;
    flueGasTemp: number;
    o2FlueGas: number;
    combAirTemp: number;
    fuelConsumption?: number;
    fuelCost: number;
}

export interface EnrichmentOutputData {
    name?: string,
    isBaseline?: boolean;
    availableHeatInput: number;
    annualFuelCost: number;
    fuelConsumption: number;
    fuelSavings: number;
    annualCostSavings?: number;
}

export interface RawO2Output {
    annualFuelCost?: number;
    availableHeatInput: number;
    availableHeatEnriched: number;
    annualFuelCostEnriched?: number;
    fuelConsumption?: number;
    fuelConsumptionEnriched: number;
    fuelSavingsEnriched: number;
    annualCostSavings?: number;
}

export interface SuiteInputAdapter extends O2Enrichment{}
// Legacy interface
export interface O2Enrichment {
    // 'Enriched' are modification values
    operatingHours: number;
    operatingHoursEnriched: number;
    o2CombAir: number;
    o2CombAirEnriched: number;
    flueGasTemp: number;
    flueGasTempEnriched: number;
    o2FlueGas: number;
    o2FlueGasEnriched: number;
    combAirTemp: number;
    combAirTempEnriched: number;
    fuelConsumption: number;
    fuelCost: number;
    fuelCostEnriched: number;
    fuelSavings?: number
}


export interface O2EnrichmentMinMax {
    o2CombAirMax: number;
    o2CombAirModificationMin: number;
    o2CombAirModificationMax: number;
    flueGasTempMin: number;
    flueGasTempMax: number;
    flueGasTempModificationMin: number;
    flueGasTempModificationMax: number;
    o2FlueGasMin: number;
    o2FlueGasMax: number;
    o2FlueGasModificationMin: number;
    o2FlueGasModificationMax: number;
    combAirTempMin: number;
    combAirTempMax: number;
    combAirTempModificationMin: number;
    combAirTempModificationMax: number;
  }