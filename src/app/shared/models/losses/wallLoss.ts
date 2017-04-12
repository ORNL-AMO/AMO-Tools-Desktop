export interface WallLoss {
  surfaceArea?: number,
  ambientTemperature?: number,
  surfaceTemperature?: number,
  windVelocity?: number,
  surfaceEmissivity?: number,
  surfaceShape?: string,
  conditionFactor?: number,
  correctionFactor?: number,
  heatLoss?: number
}