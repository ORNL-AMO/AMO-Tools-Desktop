import { MotorInventoryData } from "../../../motor-inventory/motor-inventory";

export interface InventoryItem {
    id?: number,
    directoryId?: number,
    motorInventoryData?: MotorInventoryData,
    createdDate?: Date,
    modifiedDate?: Date,
    type: string,
    name: string,
    selected?: boolean,
    appVersion?: string,
    isExample?: boolean
}