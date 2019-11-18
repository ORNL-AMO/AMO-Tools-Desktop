export interface O2Enrichment {
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

export interface O2EnrichmentOutput {
    availableHeatEnriched: number;
    availableHeatInput: number;
    fuelConsumptionEnriched: number;
    fuelSavingsEnriched: number;
    annualFuelCost: number;
    annualFuelCostEnriched: number;
}
