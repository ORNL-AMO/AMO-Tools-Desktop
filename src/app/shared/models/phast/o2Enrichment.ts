export interface O2Enrichment {
    // 'Enriched' are modification values
    name?: string,
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

export interface EnrichmentInput {
    name?: string,
    operatingHours: number;
    o2CombAir: number;
    flueGasTemp: number;
    o2FlueGas: number;
    combAirTemp: number;
    fuelConsumption: number;
    fuelCost: number;
}

export interface O2EnrichmentOutput {
    name?: string;
    annualFuelCost: number;
    availableHeatInput: number;
    availableHeatEnriched: number;
    annualFuelCostEnriched: number;
    fuelConsumptionEnriched: number;
    fuelSavingsEnriched: number;
    annualCostSavings?: number;
}
