export interface FlueGas {
    flueGasType?: string,
    flueGasByVolume?: FlueGasByVolume,
    flueGasByMass?: FlueGasByMass
}

export interface FlueGasByMass {
    gasTypeId?: number,
    flueGasTemperature?: number,
    oxygenCalculationMethod?: string,
    excessAirPercentage?: number,
    o2InFlueGas?: number,
    combustionAirTemperature?: number,
    fuelTemperature?: number,
    ashDischargeTemperature?: number,
    moistureInAirComposition?: number,
    unburnedCarbonInAsh?: number,
    carbon?: number,
    hydrogen?: number,
    sulphur?: number,
    inertAsh?: number,
    o2?: number,
    moisture?: number,
    nitrogen?: number
}

export interface FlueGasByVolume {
    gasTypeId?: number,
    flueGasTemperature?: number,
    oxygenCalculationMethod?: string,
    excessAirPercentage?: number,
    o2InFlueGas?: number,
    combustionAirTemperature?: number,
    fuelTemperature?: number,
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
    O2?: number
}
