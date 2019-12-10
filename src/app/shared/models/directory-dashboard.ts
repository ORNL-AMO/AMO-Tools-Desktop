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
}

export interface FilterDashboardBy {
    showPumps: boolean,
    showFans: boolean,
    showSteam: boolean,
    showTreasureHunt: boolean,
    showSubFolders: boolean,
    showPreAssessments: boolean,
    showPhast: boolean
}
