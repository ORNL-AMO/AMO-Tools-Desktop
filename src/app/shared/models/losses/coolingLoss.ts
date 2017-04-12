export interface CoolingLoss {
    coolingLossType?: string,
    gasCoolingLoss?: GasCoolingLoss,
    liquidCoolingLoss?: LiquidCoolingLoss,
    waterCoolingLoss?: WaterCoolingLoss,
}

export interface LiquidCoolingLoss {
    flowRate?: number,
    density?: number,
    initialTemperature?: number,
    outletTemperature?: number,
    specificHeat?: number,
    correctionFactor?: number,
    heatLoss?: number
}

export interface GasCoolingLoss {
    flowRate?: number,
    initialTemperature?: number,
    finalTemperature?: number,
    specificHeat?: number,
    correctionFactor?: number,
    heatLoss?: number
}


export interface WaterCoolingLoss {
    flowRate?: number,
    initialTemperature?: number,
    outletTemperature?: number,
    correctionFactor?: number,
    heatLoss?: number
}