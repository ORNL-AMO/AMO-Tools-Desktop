export interface EnergyEquivalencyElectric {
    fuelFiredEfficiency: number,
    electricallyHeatedEfficiency: number,
    fuelFiredHeatInput: number
}

export interface EnergyEquivalencyFuel {
    electricallyHeatedEfficiency: number,
    fuelFiredEfficiency: number,
    electricalHeatInput: number
}

export interface EnergyEquivalencyFuelOutput {
    fuelFiredHeatInput: number
}

export interface EnergyEquivalencyElectricOutput {
    electricalHeatInput: number
}