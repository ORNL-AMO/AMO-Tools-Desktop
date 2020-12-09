export interface AtmosphereLoss {
    atmosphereGas?: number;
    specificHeat?: number;
    inletTemperature?: number;
    outletTemperature?: number;
    flowRate?: number;
    correctionFactor?: number;
    heatLoss?: number;
    name?: string;
    energySourceType?: string,
    fuelCost?: number,
    hoursPerYear?: number
    availableHeat?: number
}


export interface AtmosphereLossOutput {
    baseline?: AtmosphereLossResults,
    modification?: AtmosphereLossResults
    energyUnit?: string;
    fuelSavings?: number;
    costSavings?: number;
  }
  
  export interface AtmosphereLossResults {
    fuelUse?: number;
    fuelCost?: number;
    atmosphereLoss?: number;
    grossLoss?: number;
  }
  