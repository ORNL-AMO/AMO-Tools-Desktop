export interface WallLoss {
  inputs?: {
    baseline?: {
      surfaceArea?: number,
      ambientTemperature?: number,
      surfaceTemperature?: number,
      windVelocity?: number,
      surfaceEmissivity?: number,
      surfaceShape?: string,
      conditionFactor?: number,
      correctionFactor?: number
    },
    modified?: {
      surfaceArea?: number,
      ambientTemperature?: number,
      surfaceTemperature?: number,
      windVelocity?: number,
      surfaceEmissivity?: number,
      surfaceShape?: string,
      conditionFactor?: number,
      correctionFactor?: number
    }
  },
  outputs?: {
    heatLoss?: number
  }
}