import { Injectable } from "@angular/core";
import { SettingsLabelPipe } from "../../shared/shared-pipes/settings-label.pipe";
import { CompressedAirControlsPropertiesOptions, CompressedAirDesignDetailsPropertiesOptions, CompressedAirInventoryData, CompressedAirItem, CompressedAirMotorPropertiesOptions, CompressedAirPropertyDisplayOptions, FieldMeasurementsOptions, NameplateDataOptions } from "../compressed-air-inventory";
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

  getFields(displayOptions: CompressedAirPropertyDisplayOptions, settings: Settings): Array<CompressedAirField> {
    let fields: Array<CompressedAirField> = [{
      display: 'Name',
      value: 'name',
      group: 'nameplateData'
    }, {
      display: 'System',
      value: 'system',
      group: 'nameplateData'
    }];
    //nameplate
    let nameplateFields: Array<CompressedAirField> = this.getNameplateDataFields(displayOptions.nameplateDataOptions, settings);
    fields = fields.concat(nameplateFields);
    let controlFields: Array<CompressedAirField> = this.getControlsPropertiesFields(displayOptions.compressedAirControlsPropertiesOptions, settings);
    fields = fields.concat(controlFields);
    let fieldMeasurementFields: Array<CompressedAirField> = this.getFieldMeasurementsFields(displayOptions.fieldMeasurementsOptions, settings);
    fields = fields.concat(fieldMeasurementFields);
    let motorPropertiesFields: Array<CompressedAirField> = this.getMotorFields(displayOptions.compressedAirMotorPropertiesOptions, settings);
    fields = fields.concat(motorPropertiesFields);
    let designDetailsPropertiesFields: Array<CompressedAirField> = this.getDesignDetailsFields(displayOptions.compressedAirDesignDetailsPropertiesOptions, settings);
    fields = fields.concat(designDetailsPropertiesFields);
    return fields;
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

  getFieldMeasurementsFields(fieldMeasurementsOptions: FieldMeasurementsOptions, settings: Settings): Array<CompressedAirField> {
    let fields: Array<CompressedAirField> = [];
    if (fieldMeasurementsOptions.yearlyOperatingHours) {
      fields.push({ display: 'Yearly Operating Hours', value: 'yearlyOperatingHours', group: 'fieldMeasurements' });
    }
    return fields;
  }

  getMotorFields(compressedAirMotorPropertiesOptions: CompressedAirMotorPropertiesOptions, settings: Settings): Array<CompressedAirField> {
    let fields: Array<CompressedAirField> = [];
    if (compressedAirMotorPropertiesOptions.motorPower) {
      fields.push({ display: 'Motor Power', value: 'motorPower', group: 'compressedAirMotorProperties' });
    }
    if (compressedAirMotorPropertiesOptions.motorFullLoadAmps) {
      fields.push({ display: 'Motor Full Load Amps', value: 'motorFullLoadAmps', group: 'compressedAirMotorProperties' });
    }
    return fields;
  }

  getControlsPropertiesFields(compressedAirControlsPropertiesOptions: CompressedAirControlsPropertiesOptions, settings: Settings): Array<CompressedAirField> {
    let fields: Array<CompressedAirField> = [];
    if (compressedAirControlsPropertiesOptions.controlType) {
      fields.push({ display: 'Control Type', value: 'controlType', group: 'compressedAirControlsProperties' });
    }
    return fields;
  }

  getDesignDetailsFields(compressedAirDesignDetailsPropertiesOptions: CompressedAirDesignDetailsPropertiesOptions, settings: Settings): Array<CompressedAirField> {
    let fields: Array<CompressedAirField> = [];
    if (compressedAirDesignDetailsPropertiesOptions.inputPressure) {
      fields.push({ display: 'Design Inlet Pressure', value: 'designInletPressure', group: 'compressedAirDesignDetails' });
    }
    if (compressedAirDesignDetailsPropertiesOptions.designEfficiency) {
      fields.push({ display: 'Motor Design Efficiency', value: 'motorDesignEfficiency', group: 'compressedAirDesignDetails' });
    }
    if (compressedAirDesignDetailsPropertiesOptions.serviceFactor) {
      fields.push({ display: 'Motor Service Factor', value: 'motorServiceFactor', group: 'compressedAirDesignDetails' });
    }
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