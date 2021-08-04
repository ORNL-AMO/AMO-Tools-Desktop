export interface FixtureLoss {
    specificHeat?: number;
    feedRate?: number;
    initialTemperature?: number;
    finalTemperature?: number;
    correctionFactor?: number;
    materialName?: number;
    heatLoss?: number;
    name?: string;
    availableHeat?: number;
    hoursPerYear?: number;
    fuelCost?: number;
    energySourceType?: string;
}

export interface FixtureLossOutput {
    baseline?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<FixtureLossResults>},
    modification?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<FixtureLossResults>}
    energyUnit?: string;
    fuelSavings?: number;
    costSavings?: number;
  }
  
  export interface FixtureLossResults {
    fuelUse?: number;
    fuelCost?: number;
    fixtureLoss?: number;
    grossLoss?: number;
    energyUnit?: string; 
  }
  