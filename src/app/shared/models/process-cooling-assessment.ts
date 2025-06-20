
export interface ProcessCoolingAssessment {
    name?: string;
    setupDone: boolean
    selectedModificationId?: string
    existingDataUnits?: string;
    selected?: boolean;
    systemBasics: ProcessCoolingSystemBasics,
    systemInformation: any,
    inventory: Array<any>,
    modifications: Array<Modification>;
}

export interface Modification {
    name: string,
    modificationId: string,
    notes?: string
}

export interface ProcessCoolingSystemBasics {
    utilityType: string,
    electricityCost: number,
    notes: string
}


export interface ProcessCoolingAssessmentResults {

}