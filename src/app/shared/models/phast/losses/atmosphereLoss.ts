export interface AtmosphereLoss {
    atmosphereGas?: string,
    specificHeat?: number,
    inletTemperature?: number,
    outletTemperature?: number,
    flowRate?: number,
    correctionFactor?: number,
    heatLoss?: number
}