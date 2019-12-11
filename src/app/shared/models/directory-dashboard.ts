import { Calculator } from "./calculators";
import { Directory } from "./directory";
import { Assessment } from "./assessment";

export interface DirectoryItem {
    calculator?: Calculator;
    calculatorIndex?: number;
    subDirectory?: Directory;
    assessment?: Assessment;
    type: string;
    isShown: boolean;
    createdDate: Date,
    modifiedDate: Date,
    name: string
}

export interface FilterDashboardBy {
    showAll: boolean,
    showPumps: boolean,
    showFans: boolean,
    showSteam: boolean,
    showTreasureHunt: boolean,
    showSubFolders: boolean,
    showPreAssessments: boolean,
    showPhast: boolean
}
