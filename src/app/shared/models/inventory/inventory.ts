import { MotorInventoryData } from "../../../motor-inventory/motor-inventory";
import { BatchAnalysisSettings } from "../../../motor-inventory/batch-analysis/batch-analysis.service";
import { PumpInventoryData } from "../../../pump-inventory/pump-inventory";

export interface InventoryItem {
    id?: number,
    directoryId?: number,
    motorInventoryData?: MotorInventoryData,
    pumpInventoryData?: PumpInventoryData,
    batchAnalysisSettings?: BatchAnalysisSettings,
    createdDate?: Date,
    modifiedDate?: Date,
    type: string,
    name: string,
    selected?: boolean,
    appVersion?: string,
    isExample?: boolean
}