import { Calculator } from "./calculators";
import { Directory } from "./directory";
import { Assessment } from "./assessment";
import { InventoryItem } from "./inventory/inventory";
import { Diagram } from "./diagram";

export interface DirectoryItem {
    calculator?: Calculator;
    calculatorIndex?: number;
    subDirectory?: Directory;
    assessment?: Assessment;
    inventoryItem?: InventoryItem,
    diagram?: Diagram;
    type: string;
    isShown: boolean;
    createdDate: Date,
    modifiedDate: Date,
    name: string,
    assessmentType?: string
}

export interface FilterDashboardBy {
    showAll: boolean,
    showPumps: boolean,
    showFans: boolean,
    showSteam: boolean,
    showTreasureHunt: boolean,
    showSubFolders: boolean,
    showPreAssessments: boolean,
    showPhast: boolean,
    showMotorInventory: boolean,
    showWasteWater: boolean,
    showCompressedAir: boolean,
    showDiagrams: boolean
}


export interface ShowPreAssessmentModalState 
{ index: number, isNew: boolean, subDirectoryId?: number }