import { TrueCostOfSystems } from "../logic/results";

export interface SystemAnnualSummaryResults {
    id?: string,
    name?: string,
    sourceWaterIntake: number,
    dischargeWater: number,
    directCostPerYear: number,
    directCostPerUnit: number,
    trueCostPerYear: number,
    trueCostPerUnit: number,
    trueOverDirectResult: number,
}

export interface PlantSystemSummaryResults extends SystemAnnualSummaryResults {
    allSystemResults: SystemAnnualSummaryResults[],
}

// * Annual Results
export interface ExecutiveSummaryResults {
    totalSourceWaterIntake: number;
    totalPerProductionUnit: number;
    directCost: number;
    trueCost: number;
    trueCostPerProductionUnit: number;
    trueOverDirectResult: number;
}

export interface PlantResults {
    trueCostOfSystems: TrueCostOfSystems;
    plantSystemSummaryResults: PlantSystemSummaryResults;
}