export interface AtmosphereLoss {
    atmosphereGas?: number,
    specificHeat?: number,
    inletTemperature?: number,
    outletTemperature?: number,
    flowRate?: number,
    correctionFactor?: number,
    heatLoss?: number,
    name?: string
}