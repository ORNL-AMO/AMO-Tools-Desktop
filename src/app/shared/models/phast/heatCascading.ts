export interface HeatCascadingInput {
    utilityType?: string,
    priFiringRate: number,
    priExhaustTemperature: number,
    priExhaustO2: number,
    priCombAirTemperature: number,
    priOpHours: number,
    fuelHV: number,
    fuelTempF: number, 
    ambientAirTempF: number, 
    combAirMoisturePerc: number
    

    secFiringRate: number,
    secExhaustTemperature: number,
    secExhaustO2: number,
    secCombAirTemperature: number,
    secAvailableHeat: number,
    secOpHours: number,
    fuelCost: number,
    
    // Gas fuel element properties
    materialTypeId: number,
    gasFuelType: boolean,
    substance: string,
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

export interface FlueGasModalData {
    calculatedAvailableHeat: number,
    fuelTempF: number, 
    ambientAirTempF: number, 
    combAirMoisturePerc: number
}

export interface HeatCascadingOutput {
    priFlueVolume: number,
    hxEnergyRate: number,
    eqEnergSupply: number,
    effOppHours: number,

    priExcessAir: number,
	priAvailableHeat: number,
	secExcessAir: number,
	secAvailableHeat: number,

    energySavings: number,
    hourlySavings: number,
    costSavings: number
    baselineEnergy?: number,
    modificationEnergy?: number
}

