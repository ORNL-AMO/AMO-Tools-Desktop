import { DiagramCalculatedData } from "./diagram";
import { DiagramWaterSystemFlows, DischargeOutlet, IntakeSource, KnownLoss, WasteWaterTreatment, WaterTreatment, WaterUsingSystem } from "./water-components";

export interface WaterAssessment {
    name?: string;
    existingDataUnits?: string;
    modifications: Array<Modification>;
    selected?: boolean;
    systemBasics: WaterSystemBasics,
    intakeSources?: IntakeSource[],
    waterUsingSystems?: WaterUsingSystem[],
    waterTreatments?: WaterTreatment[],
    wasteWaterTreatments?: WasteWaterTreatment[],
    dischargeOutlets?: DischargeOutlet[],
    knownLosses?: KnownLoss[],
    diagramWaterSystemFlows?: DiagramWaterSystemFlows[],
    connectedNodesMap?: Record<string, string>,
    calculatedData?: DiagramCalculatedData,
    setupDone: boolean
}

export interface Modification {
    name: string,
    modificationId: string,
    notes?: string
}

export interface WaterSystemBasics {
    utilityType: string,
    fuelCost: number,
    electricityCost: number,
    conductivityUnit: string,
    productionUnit: string,
    annualProduction: number,
    notes: string
}

export interface WaterResults {
    executiveSummary: ExecutiveSummaryReport,
    systemSummary: SystemSummaryReport,
}

export interface ExecutiveSummaryReport {
}

export interface SystemSummaryReport {

}





