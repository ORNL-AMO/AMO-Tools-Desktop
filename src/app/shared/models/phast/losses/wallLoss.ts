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
  baseline: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<WallLossResult>},
  modification?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<WallLossResult>},
  energyUnit?: string;
  fuelSavings: number;
  costSavings: number;
}

export interface WallLossResult {
  fuelUse?: number;
  fuelCost?: number;
  wallLoss?: number;
  grossLoss?: number;
  energyUnit?: string;
}
