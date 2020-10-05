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
