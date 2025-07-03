import { Injectable } from "@angular/core";
import { SettingsLabelPipe } from "../../shared/shared-pipes/settings-label.pipe";
import { CompressedAirInventoryData, CompressedAirItem } from "../compressed-air-inventory";
import _ from "lodash";

@Injectable()
export class CompressedAirSummaryService {

    constructor(private settingsLabelPipe: SettingsLabelPipe) {
    }

    getAllCompressors(inventoryData: CompressedAirInventoryData): Array<CompressedAirItem> {
        let allCompressors: Array<CompressedAirItem> = _.flatMap(inventoryData.systems, (system) => { return system.catalog });
        return allCompressors;
    }

}



export interface InventorySummaryData {
    fields: Array<CompressedAirField>,
    compressedAirData: Array<Array<SummaryCompressedAirData>>
}

export interface CompressedAirField {
    display: string,
    value: string,
    group: string,
    unit?: string
}

export interface SummaryCompressedAirData {
    fieldStr: string,
    value: number | string | Date,
    pipe?: string,
    unit?: string
}