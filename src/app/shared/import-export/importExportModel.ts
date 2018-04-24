import { Settings } from "../models/settings";
import { Assessment } from "../models/assessment";
import { Directory } from "../models/directory";
import { Calculator } from "../models/calculators";

export interface ImportExportAssessment {
    settings: Settings;
    assessment: Assessment;
    calculator?: Calculator;
}

export interface ImportExportDirectory {
    settings: Settings,
    directory: Directory,
    calculator?: Array<Calculator>
}

export interface ImportExportData {
    directories: Array<ImportExportDirectory>,
    assessments: Array<ImportExportAssessment>,
    calculators?: Array<Calculator>,
    origin?: string
}