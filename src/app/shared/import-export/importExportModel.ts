import { Settings } from "../models/settings";
import { Assessment } from "../models/assessment";
import { Directory } from "../models/directory";
import { Calculator } from "../models/calculators";

export interface ImportExportModel {
    settings: Settings;
    assessment?: Assessment;
    directory: Directory;
    calculator?: Calculator;
}