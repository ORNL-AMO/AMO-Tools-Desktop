
export interface ProcessCoolingAssessment {
    name?: string;
    setupDone: boolean
    selectedModificationId?: string
    existingDataUnits?: string;
    selected?: boolean;
    systemBasics: ProcessCoolingSystemBasics,
    systemInformation: any,
    inventory: Array<ChillerInventoryItem>,
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
    fuelCost: number,
    location: number,
    numberOfChillers: number,
    waterSupplyTemperature: number,
    condenserCoolingMethod: CoolingMethodString,
    notes: string
}


export interface ProcessCoolingAssessmentResults {

}

export interface ChillerInventoryItem {
    itemId: string;
    name: string;
    description?: string;
    modifiedDate: Date;
}

export type CoolingMethodString = 'air' | 'water' ;