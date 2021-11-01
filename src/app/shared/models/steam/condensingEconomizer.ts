export interface CondensingEconomizerInput {
    operatingHours: number,
    fuelCost: number,
    materialTypeId: number,
    oxygenCalculationMethod: string,
    flueGasTemperature: number,
    modifiedFlueGasTemperature: number,
    combustionAirTemperature: number,
    fuelTemp: number,
    flueGasO2: number,
    ambientAirTemperature: number,
    moistureInCombustionAir: number,
    heatInput: number
    excessAir: number,
    substance: string,
    CH4: number;
    C2H6: number;
    N2: number;
    H2: number;
    C3H8: number;
    C4H10_CnH2n: number;
    H2O: number;
    CO: number;
    CO2: number;
    SO2: number;
    O2: number;
}

export interface CondensingEconomizerSuiteInput {
    heatInput: number, 
    tempFlueGasInF: number, 
    tempFlueGasOutF: number, 
    tempCombAirF: number, 
    fuelTempF: number, 
    percO2: number, 
    ambientAirTempF: number, 
    moistCombAir: number,
    substance?: string,
    CH4?: number;
    C2H6?: number;
    N2?: number;
    H2?: number;
    C3H8?: number;
    C4H10_CnH2n?: number;
    H2O?: number;
    CO?: number;
    CO2?: number;
    SO2?: number;
    O2?: number;
}

export interface CondensingEconomizerOutput { 
    costSavings?: number;
    energySavings?: number,
    
    excessAir: number,
    flowFlueGas: number,
    specHeat: number,
    fracCondensed: number,
    effThermal: number,
    effThermalLH: number,
    effLH: number,
    heatRecovery: number,
    heatRecoveryAnnual: number,
    sensibleHeatRecovery: number,
    sensibleHeatRecoveryAnnual: number,
    totalHeatRecovery?: number,
    annualHeatRecovery?: number,
}

