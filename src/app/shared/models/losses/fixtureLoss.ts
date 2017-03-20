export interface FixtureLoss {
    inputs?: {
        specificHeat?: number,
        feedRate?: number,
        initialTemperature?: number,
        finalTemperature?: number,
        correctionFactor?: number
    },
    outputs?: {
        heatLoss?: number
    }
}