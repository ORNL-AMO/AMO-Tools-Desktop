export interface EnergyInputExhaustGasLoss {
    id?: string;
    heatLoss?: number;
    excessAir?: number;
    combustionAirTemp?: number;
    exhaustGasTemp?: number;
    totalHeatInput?: number;
    otherLosses?: number;
    availableHeat?: number;
    electricalHeaterEfficiency?: number;
    name?: string;
}
