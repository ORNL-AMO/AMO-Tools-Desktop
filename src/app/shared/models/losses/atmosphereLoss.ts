export interface AtmosphereLoss {
    inputs?: {
        baseline?: {
            atmosphereGas?: string,
            specificHeat?: number,
            initialTemperature?: number,
            finalTemperature?: number,
            flowRate?: number,
            correctionFactor?: number
        },
        modified?: {
            atmosphereGas?: string,
            specificHeat?: number,
            initialTemperature?: number,
            finalTemperature?: number,
            flowRate?: number,
            correctionFactor?: number
        }
    },
    outputs?: {
        heatLoss?: number
    }
}