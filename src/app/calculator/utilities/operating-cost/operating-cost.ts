export interface OperatingCost {
    steamSelect?: boolean;
    fuelSelect?: boolean;
    electricitySelect?: boolean;
    fuel: Array<fuelType>;
    electricity: Array<electricityType>;
    steam: Array<steamType>;
}

export interface fuelType {
    fuelName: string;
    fuelFrac: number;
    fuelCost: number;
}

export interface steamType {
    steamName: string;
    steamFrac: number;
    steamCost: number;
}

export interface electricityType {
    electricityName: string;
    electricityFrac: number;
    electricityCost: number;
}

export interface OperatingCostResult {
    sumNet: OperatingCostResult;
    sumFuel: OperatingCostResult;
    sumSteam: OperatingCostResult;
    sumElectricity: OperatingCostResult;
}

export interface OperatingCostResult {
    sumCost: number;
}