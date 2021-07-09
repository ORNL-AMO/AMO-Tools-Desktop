export interface OperatingCost {
    steamSelect?: boolean;
    fuelSelect?: boolean;
    electricitySelect?: boolean;
    fuel: Array<FuelType>;
    // casing was mismatched here
    electricity: Array<ElectricityType>;
    steam: Array<SteamType>;
}

// Pascal Case for typescript
export interface FuelType {
    fuelName: string;
    fuelFrac: number;
    fuelCost: number;
}

export interface SteamType {
    steamName: string;
    steamFrac: number;
    steamCost: number;
}

export interface ElectricityType {
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