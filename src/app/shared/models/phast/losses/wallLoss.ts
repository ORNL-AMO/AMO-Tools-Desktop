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
  fuelCost?: number;
  hoursPerYear?: number;
  energySourceType?: string;
}

export interface WallLossOutput {
  baseline: WallLossResults,
  modification?: WallLossResults
  energyUnit?: string;
  fuelSavings: number;
  costSavings: number;
}

export interface WallLossResults {
  fuelUse?: number;
  fuelCost?: number;
  wallLoss?: number;
  grossLoss?: number;
}
