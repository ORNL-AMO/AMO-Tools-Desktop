export interface EfficiencyImprovement {
    baseline: EfficiencyImprovementInputData;
    modification?: EfficiencyImprovementInputData;
    results?: EfficiencyImprovementResults;
}

export interface EfficiencyImprovementInputData {
    annualOperatingHours: number;
    fuelType: string;
    utilityCost: number;
    operatingHours: number;
    flueGasOxygen: number;
    //excessAir: number;
    flueGasTemp: number;
    combustionAirTemp: number;
    energyInput?: number;
}

export interface EfficiencyImprovementResults {
    baselineAvailableHeat: number;
    baselineHeatInput: number;
    baselineEnergyCost: number;

    modificationAvailableHeat: number;
    modificationHeatInput: number;
    modificationEnergyCost: number;

    annualEnergySavings: number;
    annualCostSavings: number;
    
    baselineExcessAir: number;
    modificationExcessAir: number;
    modificationEnergyInput: number;
}

export interface EfficiencyImprovementInputs {
    currentOperatingHours: number;
    newOperatingHours: number;
    currentFlueGasOxygen: number;
    newFlueGasOxygen: number;
    currentFlueGasTemp: number;
    newFlueGasTemp: number;
    currentCombustionAirTemp: number;
    newCombustionAirTemp: number;
    currentEnergyInput: number;
    currentO2CombAir?: number;
    newO2CombAir?: number;
    fuelCost?: number;
}

export interface EfficiencyImprovementOutputs {
    currentAvailableHeat: number;
    currentExcessAir: number;
    newAvailableHeat: number;
    newEnergyInput: number;
    newExcessAir: number;
    newFuelSavings: number;
}
