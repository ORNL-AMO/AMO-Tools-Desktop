export interface CoolingLoss {
    coolingLossType?: string;
    gasCoolingLoss?: GasCoolingLoss;
    liquidCoolingLoss?: LiquidCoolingLoss;
    // coolingData?: CoolingLossData;
    heatLoss?: number;
    name?: string;
    coolingMedium?: string;
}
//added both outlet and final for comparisons. 
//liquid  uses finalTemperature
//gas uses outlet
export interface LiquidCoolingLoss {
    flowRate?: number;
    density?: number;
    initialTemperature?: number;
    outletTemperature?: number;
    finalTemperature?: number;
    specificHeat?: number;
    correctionFactor?: number;
}

export interface GasCoolingLoss {
    flowRate?: number;
    gasDensity?: number;
    initialTemperature?: number;
    finalTemperature?: number;
    outletTemperature?: number;
    specificHeat?: number;
    correctionFactor?: number;
}

// export interface CoolingLossData {
//     coolingMediumType: string;
//     coolingMedium?: string,
//     name?: string,
//     flowRate?: number;
//     initialTemperature?: number;
//     // final temperature used in calculation for liquid
//     finalTemperature?: number;
//     outletTemperature?: number;
//     specificHeat?: number;
//     correctionFactor?: number;
//     // density == lliquid density
//     density?: number;
//     gasDensity?: number;
//     fuelCost?: number;
//     hoursPerYear?: number;
//     energySourceType?: string;
//     availableHeat?: number;
// }

export interface CoolingLossOutput {
    baseline: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<CoolingLossResults>},
    modification?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<CoolingLossResults>},
    fuelSavings: number;
    costSavings: number;
    energyUnit?: string;
  }
  
  export interface CoolingLossResults {
    fuelUse?: number;
    fuelCost?: number;
    coolingLoss?: number;
    grossLoss?: number;
    energyUnit?: string;
  }