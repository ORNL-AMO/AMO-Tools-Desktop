export interface CoolingLoss {
    coolingLossType?: string,
    gasCoolingLoss?: GasCoolingLoss,
    liquidCoolingLoss?: LiquidCoolingLoss,
    heatLoss?: number,
    name?: string,
    coolingMedium?: string
}

export interface LiquidCoolingLoss {
    flowRate?: number,
    density?: number,
    initialTemperature?: number,
    outletTemperature?: number,
    specificHeat?: number,
    correctionFactor?: number,
}

export interface GasCoolingLoss {
    flowRate?: number,
    initialTemperature?: number,
    finalTemperature?: number,
    specificHeat?: number,
    correctionFactor?: number,
    gasDensity?: number
}
