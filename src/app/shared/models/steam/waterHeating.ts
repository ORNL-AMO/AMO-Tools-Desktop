import { OpportunityUtilityType } from "../treasure-hunt"

export interface WaterHeatingInput {
    operatingHours: number,
    boilerUtilityType?: OpportunityUtilityType,
    hxUtilityType?: string,
    fuelCost: number,
    fuelCostBoiler: number,
    effBoiler: number,
    waterCost: number,
    treatCost: number,
    pressureSteamIn: number,
    flowSteamRate: number,
    temperatureWaterIn: number,
    pressureWaterOut: number,
    flowWaterRate: number,
    effWaterHeater: number,
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
    bpTempWarningFlag: boolean,

    heatGainRate: number,
    energySavedDWH: number,
    energySavedBoiler: number,
    energySavedTotal: number,
    waterSaved: number,

    costSavingsTotal: number,
    costSavingsBoiler: number,
    costSavingsWNT: number,
    costSavingsDWH: number,
}
