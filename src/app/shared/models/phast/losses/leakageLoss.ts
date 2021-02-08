export interface LeakageLoss {
    draftPressure?: number;
    openingArea?: number;
    leakageGasTemperature?: number;
    ambientTemperature?: number;
    coefficient?: number;
    specificGravity?: number;
    correctionFactor?: number;
    heatLoss?: number;
    name?: string;
    energySourceType?: string,
    fuelCost?: number,
    hoursPerYear?: number
    availableHeat?: number
}


export interface LeakageLossOutput {
    baseline?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<LeakageLossResults>},
    modification?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<LeakageLossResults>}
    energyUnit?: string;
    fuelSavings?: number;
    costSavings?: number;
  }
  
  export interface LeakageLossResults {
    fuelUse?: number;
    fuelCost?: number;
    leakageLoss?: number;
    grossLoss?: number;
    energyUnit?: string; 
  }
  