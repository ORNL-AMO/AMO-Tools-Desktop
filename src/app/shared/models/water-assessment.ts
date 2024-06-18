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

export interface IntakeSource extends WaterProcessComponent {}
export interface ProcessUse extends WaterProcessComponent {}
export interface DischargeOutlet extends WaterProcessComponent {}
export interface WaterProcessComponent extends ProcessFlowPart {}

export interface WaterAssessmentResults {}