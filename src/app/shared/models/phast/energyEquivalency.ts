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