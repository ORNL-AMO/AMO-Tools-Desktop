import { Injectable } from "@angular/core";
import { SettingsLabelPipe } from "../../shared/shared-pipes/settings-label.pipe";
import { CompressedAirInventoryData, CompressedAirItem, CompressedAirPropertyDisplayOptions, NameplateDataOptions } from "../compressed-air-inventory";
import _ from "lodash";
import { Settings } from "../../shared/models/settings";

@Injectable()
export class CompressedAirInventorySummaryService {

  constructor(private settingsLabelPipe: SettingsLabelPipe) {
  }

  getAllCompressors(inventoryData: CompressedAirInventoryData): Array<CompressedAirItem> {
    let allCompressors: Array<CompressedAirItem> = _.flatMap(inventoryData.systems, (system) => { return system.catalog });
    return allCompressors;
  }

  getNameplateDataFields(nameplateDataOptions: NameplateDataOptions, settings: Settings): Array<CompressedAirField> {
    let fields: Array<CompressedAirField> = [];
    if (nameplateDataOptions.compressorType) {
      fields.push({ display: 'Compressor Type', value: 'compressorType', group: 'nameplateData' });
    }
    if (nameplateDataOptions.fullLoadOperatingPressure) {
      fields.push({ display: 'Full Load Operating Pressure', value: 'fullLoadOperatingPressure', group: 'nameplateData' });
    }
    if (nameplateDataOptions.fullLoadRatedCapacity) {
      fields.push({ display: 'Rated Capacity at Full Load Pressure', value: 'fullLoadRatedCapacity', group: 'nameplateData' });
    }
    if (nameplateDataOptions.totalPackageInputPower) {
      fields.push({ display: 'Total Package Input Power', value: 'totalPackageInputPower', group: 'nameplateData' });
    }
    return fields;
  }

  getFields(displayOptions: CompressedAirPropertyDisplayOptions, settings: Settings): Array<CompressedAirField> {
    let fields: Array<CompressedAirField> = [{
      display: 'Name',
      value: 'name',
      group: 'nameplateData'
    }, {
      display: 'Department',
      value: 'department',
      group: 'nameplateData'
    }];
    //nameplate
    let nameplateFields: Array<CompressedAirField> = this.getNameplateDataFields(displayOptions.nameplateDataOptions, settings);
    fields = fields.concat(nameplateFields);
    // let pumpPropertiesFields: Array<CompressedAirField> = this.getPumpPropertiesFields(displayOptions.pumpPropertiesOptions, settings);
    // fields = fields.concat(pumpPropertiesFields);
    // let fluidPropertiesFields: Array<CompressedAirField> = this.getFluidPropertiesFields(displayOptions.fluidPropertiesOptions, settings);
    // fields = fields.concat(fluidPropertiesFields);
    // let fieldMeasurementFields: Array<CompressedAirField> = this.getFieldMeasurementsFields(displayOptions.fieldMeasurementOptions, settings);
    // fields = fields.concat(fieldMeasurementFields);
    // let pumpMotorPropertiesFields: Array<CompressedAirField> = this.getPumpMotorFields(displayOptions.pumpMotorPropertiesOptions, settings);
    // fields = fields.concat(pumpMotorPropertiesFields);
    // let pumpStatusFields: Array<CompressedAirField> = this.getPumpStatusFields(displayOptions.pumpStatusOptions, settings);
    // fields = fields.concat(pumpStatusFields);
    // let systemPropertiesFields: Array<CompressedAirField> = this.getSystemPropertiesFields(displayOptions.systemPropertiesOptions, settings);
    // fields = fields.concat(systemPropertiesFields);
    return fields;
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