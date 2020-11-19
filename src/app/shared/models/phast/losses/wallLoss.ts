export interface WallLoss {
  name?: string;
  surfaceArea?: number;
  ambientTemperature?: number;
  surfaceTemperature?: number;
  windVelocity?: number;
  surfaceEmissivity?: number;
  surfaceShape?: number;
  conditionFactor?: number;
  correctionFactor?: number;
  heatLoss?: number;
  availableHeat?: number;
  id?: any;
}

export interface WallLossOutput {
  baseline: WallLossResults,
  modification?: WallLossResults
}

export interface WallLossResults {
  wallLoss?: number;
  grossLoss?: number;
}
