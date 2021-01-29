export interface OpeningLoss {
    numberOfOpenings?: number;
    emissivity?: number;
    thickness?: number;
    ambientTemperature?: number;
    insideTemperature?: number;
    percentTimeOpen?: number;
    viewFactor?: number;
    openingType?: string;
    lengthOfOpening?: number;
    heightOfOpening?: number;
    openingTotalArea?: number;
    heatLoss?: number;
    name?: string;
    fuelCost?: number;
    hoursPerYear?: number;
    energySourceType?: string;
    availableHeat?: number;
}

export interface QuadOpeningLoss {
    emissivity?: number;
    length?: number;
    width?: number;
    thickness?: number;
    ratio?: number;
    ambientTemperature?: number;
    insideTemperature?: number;
    percentTimeOpen?: number;
    viewFactor?: number;
}

export interface CircularOpeningLoss {
    emissivity?: number;
    diameter?: number;
    thickness?: number;
    ratio?: number;
    ambientTemperature?: number;
    insideTemperature?: number;
    percentTimeOpen?: number;
    viewFactor?: number;
}


export interface ViewFactorInput {
    openingShape?: number,
    thickness?: number,
    length?: number,
    width?: number,
    diameter?: number
}

export interface OpeningLossOutput {
    baseline: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<OpeningLossResults>},
    modification?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<OpeningLossResults>},
    fuelSavings: number;
    costSavings: number;
    energyUnit?: string;
  }
  
  export interface OpeningLossResults {
    fuelUse?: number;
    fuelCost?: number;
    openingLoss?: number;
    grossLoss?: number;
    energyUnit?: string;
  }