import { MotorInventoryData } from "../../../motor-inventory/motor-inventory";
import { BatchAnalysisSettings } from "../../../motor-inventory/batch-analysis/batch-analysis.service";

export interface InventoryItem {
    id?: number,
    directoryId?: number,
    motorInventoryData?: MotorInventoryData,
    batchAnalysisSettings?: BatchAnalysisSettings,
    createdDate?: Date,
    modifiedDate?: Date,
    type: string,
    name: string,
    selected?: boolean,
    appVersion?: string,
    isExample?: boolean
}