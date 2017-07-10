export interface EfficiencyImprovementInputs {
    currentFlueGasOxygen: number,
    newFlueGasOxygen: number,
    currentFlueGasTemp: number,
    newFlueGasTemp: number,
    currentCombustionAirTemp: number,
    newCombustionAirTemp: number,
    currentEnergyInput: number
}

export interface EfficiencyImprovementOutputs {
    currentAvailableHeat: number,
    currentExcessAir: number,
    newAvailableHeat: number,
    newEnergyInput: number,
    newExcessAir: number,
    newFuelSavings: number
}