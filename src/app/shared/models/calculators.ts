import { PreAssessment } from "../../calculator/furnaces/pre-assessment/pre-assessment";

export interface Calculator {
    directoryId?: number,
    id?: number,
    name?: string,
    type?: string,
    preAssessments?: Array<PreAssessment>
}