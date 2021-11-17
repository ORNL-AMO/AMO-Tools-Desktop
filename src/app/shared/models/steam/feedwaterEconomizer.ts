export interface FeedwaterEconomizerInput {
    operatingHours: number,
    fuelCost: number,
    materialTypeId: number,
    oxygenCalculationMethod: string,
    flueGasTemperature: number,
    fuelTemp: number,
    fuelTempF?: number,
    flueGasO2: number,
    excessAir: number,
    combustionAirTemperature: number,
    moistureInCombustionAir: number,
    ambientAirTemperature: number,
    energyRateInput: number,
    steamPressure: number,
    steamCondition: number,
    steamTemperature: number,
    feedWaterTemperature: number,
    percBlowdown: number,
    hxEfficiency: number,
    higherHeatingVal: number,
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

export interface FeedwaterEconomizerSuiteInput {
    tempFlueGas: number, 
    percO2: number, 
    tempCombAir: number, 
    tempAmbientAir: number,
    moistCombAir: number, 
    ratingBoiler: number, 
    prSteam: number, 
    condSteam: number, 
    tempSteam: number, 
    tempFW: number, 
    percBlowDown: number, 
    effHX: number, 
    opHours: number, 
    costFuel: number, 
    hhvFuel: number,
    fuelTempF: number,
    CH4: number,
    C2H6: number,
    N2: number,
    H2: number,
    C3H8: number,
    C4H10_CnH2n: number,
    H2O: number,
    CO: number,
    CO2: number,
    SO2: number,
    O2: number,
    substance: string,
}

export interface FeedwaterEconomizerOutput {
    effBoiler: number; 
    tempSteamSat: number; 
    enthalpySteam: number; 
    enthalpyFW: number; 
    flowSteam: number; 
    flowFW: number; 
    flowFlueGas: number; 
    heatCapacityFG: number; 
    specHeatFG: number; 
    heatCapacityFW: number; 
    specHeatFW: number; 
    ratingHeatRecFW: number; 
    tempFlueGasOut: number; 
    tempFWOut: number; 
    energySavingsBoiler: number; 
    costSavingsBoiler: number;
    energySavedTotal: number
}