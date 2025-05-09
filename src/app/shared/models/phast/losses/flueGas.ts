export interface FlueGas {
    flueGasType?: string;
    flueGasByVolume?: FlueGasByVolume;
    flueGasByMass?: FlueGasByMass;
    name?: string;
}

export interface AvailableHeatData {
    availableHeat: number,
    higherHeatingValue: number;
}

export interface FlueGasByMass {
    gasTypeId?: number;
    flueGasTemperature?: number;
    oxygenCalculationMethod?: 'Oxygen in Flue Gas' | 'Excess Air';
    excessAirPercentage?: number;
    o2InFlueGas?: number;
    ambientAirTemp?: number;
    //ambientAirTempF suite name for ambientAirTemp
    ambientAirTempF?: number;
    combustionAirTemperature?: number;
    fuelTemperature?: number;
    ashDischargeTemperature?: number;
    moistureInAirCombustion?: number;
    //combAirMoisturePerc suite name for moistureInAirCombustion
    combAirMoisturePerc?: number;
    unburnedCarbonInAsh?: number;
    carbon?: number;
    hydrogen?: number;
    sulphur?: number;
    inertAsh?: number;
    o2?: number;
    moisture?: number;
    nitrogen?: number;
    heatInput?: number;
    heatingValue?: number;
}

export interface FlueGasByVolume {
    gasTypeId?: number;
    utilityType?: string;
    flueGasTemperature?: number;
    ambientAirTemp?: number;
    //ambientAirTempF suite name for ambientAirTemp
    ambientAirTempF?: number;
    oxygenCalculationMethod?:  'Oxygen in Flue Gas' | 'Excess Air';
    excessAirPercentage?: number;
    o2InFlueGas?: number;
    //flueGasO2Percentage suite name for o2InFlueGas
    flueGasO2Percentage?: number;
    combustionAirTemperature?: number;
    moistureInAirCombustion?: number;
    //combAirMoisturePerc suite name for moistureInAirCombustion
    combAirMoisturePerc?: number;
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
    heatingValue?: number;
    heatingValueVolume?: number;
    specificGravity?: number;
}

export interface FlueGasByVolumeSuiteResults {
    flueGasO2: number,
    excessAir: number,
    availableHeat: number,
}

export interface FlueGasHeatingValue {
    heatingValue: number;
    heatingValueVolume: number;
    specificGravity: number;
}

export interface MaterialInputProperties {
    CH4?: number,
    C2H6?: number,
    N2?: number,
    H2?: number,
    C3H8?: number,
    C4H10_CnH2n?: number,
    H2O?: number,
    CO?: number,
    CO2?: number,
    SO2?: number,
    O2?: number,
    carbon?: number,
    hydrogen?: number,
    sulphur?: number,
    inertAsh?: number,
    o2?: number,
    moisture?: number,
    nitrogen?: number,
    o2InFlueGas?: number,
    excessAir?: number,
    moistureInAirCombustion?: number
}


export interface FlueGasOutput {
    baseline: FlueGasResult
    modification?: FlueGasResult,
    fuelSavings: number;
    costSavings: number;
}

export interface FlueGasResult {
    calculatedFlueGasO2?: number;
    calculatedExcessAir?: number;
    availableHeat?: number;
    heatInput?: number;
    availableHeatError?: string;
    flueGasLosses?: number;
    fuelUse?: number;
    fuelCost?: number;
    grossLoss?: number;
    energyUnit?: string;
  }
  

  export interface FlueGasWarnings {
    moistureInAirCombustionWarning?: string;
    unburnedCarbonInAshWarning?: string;
    combustionAirTempWarning?: string;
    excessAirWarning?: string;
    o2Warning?: string;
    flueGasTemp?: string;
  }
  