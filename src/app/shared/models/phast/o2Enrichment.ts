export interface EnrichmentInput {
    inputData: EnrichmentInputData,
    adapter?: SuiteInputAdapter 
}

export interface EnrichmentOutput {
    outputData: EnrichmentOutputData,
    inputData?: EnrichmentInputData
}

// Input Display model
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

// Output Display Model
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
    annualFuelCost: number;
    availableHeatInput: number;
    availableHeatEnriched: number;
    annualFuelCostEnriched: number;
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
}

