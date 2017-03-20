export interface WallLoss {
  inputs?: {
    surfaceArea?: number,
    ambientTemperature?: number,
    surfaceTemperature?: number,
    windVelocity?: number,
    surfaceEmissivity?: number,
    conditionFactor?: number,
    correctionFactor?: number
  },
  outputs?: {
    heatLoss?: number
  }
}