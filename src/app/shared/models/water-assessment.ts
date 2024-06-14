import { ProcessFlowPart } from "../../../process-flow-types/shared-process-flow-types";

export interface WaterAssessment {
    name?: string;
    existingDataUnits?: string;
    modifications: Array<Modification>;
    selected?: boolean;
    systemBasics: WaterSystemBasics,
    intakeSources?: IntakeSource[],
    processUses?: ProcessUse[],
    dischargeOutlets?: DischargeOutlet[],
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
    notes: string
}

export interface IntakeSource extends ProcessFlowPart {}
export interface ProcessUse extends ProcessFlowPart {}
export interface DischargeOutlet extends ProcessFlowPart {}

// export interface WaterSystemPart {
//     // dataId differentiate between diagram id
//     dataId: string,
// }

export interface WaterAssessmentResults {
    
}