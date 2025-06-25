
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
    compressorChillerType: number; 
    fullLoadEfficiency: number;
    chillerCapacity: number;
    isValid?: boolean;
}

export enum CompressorChillerTypeEnum {
    CENTRIFUGAL = 0,
    RECIPROCATING = 1,
    //helical rotary
    HELICAL = 2,
}

export const CompressorChillerTypes =
{
    [CompressorChillerTypeEnum.CENTRIFUGAL]: 'Centrifugal',
    [CompressorChillerTypeEnum.RECIPROCATING]: 'Reciprocating',
    [CompressorChillerTypeEnum.HELICAL]: 'Helical Rotary'
}

export type CoolingMethodString = 'air' | 'water' ;
export type CompressorChillerType = 'centrifugal' | 'reciprocating' | 'helical-rotary';