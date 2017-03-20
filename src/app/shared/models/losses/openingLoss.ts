export interface OpeningLoss {
    inputs?: {
        emessivity?: number,
        diameterWidth?: number,
        thickness?: number,
        ratio?: number,
        ambientTemperature?: number,
        insideTemperature?: number,
        percentTimeOpen?: number,
        viewFactor?: number
    },
    outputs?: {
        heatLoss?: number
    }
}