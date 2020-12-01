export interface FlueGas {
    flueGasType?: string;
    flueGasByVolume?: FlueGasByVolume;
    flueGasByMass?: FlueGasByMass;
    name?: string;
}

export interface FlueGasByMass {
    hoursPerYear?: number;
    gasTypeId?: number;
    fuelCost?: number;
    flueGasTemperature?: number;
    oxygenCalculationMethod?: string;
    excessAirPercentage?: number;
    o2InFlueGas?: number;
    combustionAirTemperature?: number;
    fuelTemperature?: number;
    ashDischargeTemperature?: number;
    moistureInAirComposition?: number;
    unburnedCarbonInAsh?: number;
    carbon?: number;
    hydrogen?: number;
    sulphur?: number;
    inertAsh?: number;
    o2?: number;
    moisture?: number;
    nitrogen?: number;
    heatInput?: number;
}

export interface FlueGasByVolume {
    hoursPerYear?: number;
    gasTypeId?: number;
    fuelCost?: number;
    flueGasTemperature?: number;
    oxygenCalculationMethod?: string;
    excessAirPercentage?: number;
    o2InFlueGas?: number;
    combustionAirTemperature?: number;
    fuelTemperature?: number;
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
    heatInput?: number;
}


export interface FlueGasOutput {
    baseline: FlueGasResult
    modification?: FlueGasResult,
    fuelSavings: number;
    costSavings: number;
}

export interface FlueGasResult {
    availableHeat?: number;
    availableHeatError?: string;
    flueGasLosses?: number;
    fuelUse?: number;
    fuelCost?: number;
    grossLoss?: number;
  }
  

  export interface FlueGasWarnings {
    moistureInAirCompositionWarning?: string;
    unburnedCarbonInAshWarning?: string;
    combustionAirTempWarning?: string;
    excessAirWarning?: string;
    o2Warning?: string;
    flueGasTemp?: string;
  }
  