import { ComponentEdgeFlowData, DischargeOutlet, IntakeSource, KnownLoss, WasteWaterTreatment, WaterTreatment, WaterUsingSystem } from "./water-components";

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
    componentEdgeFlowData?: ComponentEdgeFlowData[],
    connectedNodesMap?: Record<string, string>,
    setupDone: boolean
}

export interface Modification {
    name: string,
    modificationId: string,
    notes?: string
}

export interface WaterSystemBasics {
    utilityType: string,
    electricityCost: number,
    conductivityUnit: string,
    notes: string
}







