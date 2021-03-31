export interface WaterHeatingInput {
    operatingHours: number,
    fuelCost: number,
    fuelCostBoiler: number,
    effBoiler: number,
    waterCost: number,
    treatCost: number,
    pressureSteamIn: number,
    flowSteamRate: number,
    hxEffectiveness: number,
    temperatureWaterIn: number,
    pressureWaterOut: number,
    flowWaterRate: number,
    effWaterHeater: number,
    heatingValueGas: number,
    tempMakeupWater: number,
    presMakeupWater: number
}

export interface WaterHeatingOutput {
    enthalpySteamIn: number,
    bpTempWaterOut: number,
    tempWaterOut: number
    enthalpySteamOut: number,
    enthalpyMakeupWater: number,
    flowByPassSteam: number
    bpTempWarningFlag: boolean

    energySavingsDWH: number,
    energySavingsBoiler: number,
    energySavingsTotal: number,
    waterSavings: number,

    costSavings: number,
    costSavingsBoiler: number,
    costSavingsWNT: number
}
