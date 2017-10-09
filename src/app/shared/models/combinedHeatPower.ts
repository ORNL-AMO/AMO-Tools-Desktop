export interface CombinedHeatPower {
    annualOperatingHours: number,
    annualElectricityConsumption: number,
    annualThermalDemand: number,
    boilerThermalFuelCosts: number,
    avgElectricityCosts: number,
    option: number,
    boilerThermalFuelCostsCHPcase: number,
    CHPfuelCosts: number,
    percentAvgkWhElectricCostAvoidedOrStandbyRate: number,
    displacedThermalEfficiency: number,
    chpAvailability: number,
    thermalUtilization: number
}

export interface CombinedHeatPowerOutput {
    annualOperationSavings: number,
    totalInstalledCostsPayback: number,
    simplePayback: number,
    fuelCosts: number,
    thermalCredit: number,
    incrementalOandM: number,
    totalOperatingCosts: number
}