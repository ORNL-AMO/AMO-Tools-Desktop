export interface AtmosphereLoss {
    atmosphereGas?: string,
    specificHeat?: number,
    initialTemperature?: number,
    finalTemperature?: number,
    flowRate?: number,
    correctionFactor?: number
}