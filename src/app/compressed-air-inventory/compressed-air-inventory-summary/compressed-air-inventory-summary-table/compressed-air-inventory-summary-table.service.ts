import { Injectable } from '@angular/core';
import { CompressedAirInventorySummaryService, CompressorSummaryUnitsImperial, CompressorSummaryUnitsMetric } from '../compressed-air-inventory-summary.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirControlsProperties, CompressedAirControlsPropertiesOptions, CompressedAirDesignDetailsProperties, CompressedAirDesignDetailsPropertiesOptions, CompressedAirInventoryData, CompressedAirItem, CompressedAirMotorProperties, CompressedAirMotorPropertiesOptions, CompressedAirPerformancePointsProperties, CompressedAirPerformancePointsPropertiesOptions, CompressedAirPropertyDisplayOptions, CompressorTypeOptions, ControlTypes, FieldMeasurements, FieldMeasurementsOptions, NameplateData, NameplateDataOptions } from '../../compressed-air-inventory';

@Injectable()
export class CompressedAirInventorySummaryTableService {

  constructor(private compressedAirInventorySummaryService: CompressedAirInventorySummaryService) { }

  getInventorySummaryData(compressedAirInventoryData: CompressedAirInventoryData, settings: Settings): InventorySummaryData {
    let compressedAirData: Array<Array<SummaryCompressedAirData>> = new Array();
    let fields: Array<CompressedAirField> = this.compressedAirInventorySummaryService.getFields(compressedAirInventoryData.displayOptions, settings);
    compressedAirInventoryData.systems.forEach(system => {
      system.catalog.forEach(item => {
        let itemData = this.getCompressedAirData(item, system.name, compressedAirInventoryData.displayOptions, settings);
        compressedAirData.push(itemData);
      });
    });
    return {
      fields: fields,
      compressedAirData: compressedAirData
    }
  }

  getCompressedAirData(item: CompressedAirItem, systemName: string, displayOptions: CompressedAirPropertyDisplayOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = new Array();
    compressedAirData = [{ value: item.name, fieldStr: 'name' }, { value: systemName, fieldStr: 'systemName' }];
    let nameplateData = this.getNameplateData(item.nameplateData, displayOptions.nameplateDataOptions, settings);
    compressedAirData = compressedAirData.concat(nameplateData);
    let controlProperties = this.getControlsPropertiesData(item.compressedAirControlsProperties, displayOptions.compressedAirControlsPropertiesOptions);
    compressedAirData = compressedAirData.concat(controlProperties);
    let fieldMeasurements = this.getFieldMeasurementsData(item.fieldMeasurements, displayOptions.fieldMeasurementsOptions, settings);
    compressedAirData = compressedAirData.concat(fieldMeasurements);
    let motorProperties = this.getMotorPropertiesData(item.compressedAirMotor, displayOptions.compressedAirMotorPropertiesOptions, settings);
    compressedAirData = compressedAirData.concat(motorProperties);
    let designDetailsProperties = this.getDesignDetailsData(item.compressedAirDesignDetailsProperties, displayOptions.compressedAirDesignDetailsPropertiesOptions, settings);
    compressedAirData = compressedAirData.concat(designDetailsProperties);

    return compressedAirData;
  }

  //nameplate data
  getNameplateData(nameplateData: NameplateData, nameplateDataOptions: NameplateDataOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    let units = settings.unitsOfMeasure === 'Imperial' ? CompressorSummaryUnitsImperial.nameplateData : CompressorSummaryUnitsMetric.nameplateData;
    if (nameplateDataOptions.compressorType) {
      let compressorType = CompressorTypeOptions.find(type => type.value == nameplateData.compressorType).label;
      compressedAirData.push({ value: compressorType, fieldStr: 'compressorType' });
    }
    if (nameplateDataOptions.fullLoadOperatingPressure) {
      compressedAirData.push({ value: nameplateData.fullLoadOperatingPressure, fieldStr: 'fullLoadOperatingPressure', unit: units.fullLoadOpPressure });
    }
    if (nameplateDataOptions.fullLoadRatedCapacity) {
      compressedAirData.push({ value: nameplateData.fullLoadRatedCapacity, fieldStr: 'fullLoadRatedCapacity', unit: units.ratedCapFullLoad });
    }
    if (nameplateDataOptions.totalPackageInputPower) {
      compressedAirData.push({ value: nameplateData.totalPackageInputPower, fieldStr: 'totalPackageInputPower', unit: units.totalInputPower });
    }
    return compressedAirData;
  }

  getFieldMeasurementsData(fieldMeasurements: FieldMeasurements, fieldMeasurementsOptions: FieldMeasurementsOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    let units = settings.unitsOfMeasure === 'Imperial' ? CompressorSummaryUnitsImperial.fieldMeasurements : CompressorSummaryUnitsMetric.fieldMeasurements;
    if (fieldMeasurementsOptions.yearlyOperatingHours) {
      compressedAirData.push({ value: fieldMeasurements.yearlyOperatingHours, fieldStr: 'yearlyOperatingHours', unit: units.opHours });
    }

    return compressedAirData;
  }

  getMotorPropertiesData(motorProperties: CompressedAirMotorProperties, motorPropertiesOptions: CompressedAirMotorPropertiesOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? CompressorSummaryUnitsImperial.motor : CompressorSummaryUnitsMetric.motor;
    if (motorPropertiesOptions.motorPower) {
      compressedAirData.push({ value: motorProperties.motorPower, fieldStr: 'motorPower', unit: units.motorPower });
    }
    if (motorPropertiesOptions.motorFullLoadAmps) {
      compressedAirData.push({ value: motorProperties.motorFullLoadAmps, fieldStr: 'motorFullLoadAmps', unit: units.motorFullLoadAmps });
    }


    return compressedAirData;
  }

  getControlsPropertiesData(controlsProperties: CompressedAirControlsProperties, controlsPropertiesOptions: CompressedAirControlsPropertiesOptions): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];

    if (controlsPropertiesOptions.controlType) {
      let controlType = ControlTypes.find(type => type.value == controlsProperties.controlType).label;
      compressedAirData.push({ value: controlType, fieldStr: 'controlType' });
    }
    return compressedAirData;
  }

  getDesignDetailsData(designDetailsProperties: CompressedAirDesignDetailsProperties, designDetailsPropertiesOptions: CompressedAirDesignDetailsPropertiesOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? CompressorSummaryUnitsImperial.designDetails : CompressorSummaryUnitsMetric.designDetails;
    if (designDetailsPropertiesOptions.inputPressure) {
      compressedAirData.push({ value: designDetailsProperties.inputPressure, fieldStr: 'motorInputPressure', unit: units.inletPressure });
    }
    if (designDetailsPropertiesOptions.designEfficiency) {
      compressedAirData.push({ value: designDetailsProperties.designEfficiency, fieldStr: 'motorDesignEfficiency', unit: units.designEfficiency });
    }
    if (designDetailsPropertiesOptions.serviceFactor) {
      compressedAirData.push({ value: designDetailsProperties.serviceFactor, fieldStr: 'motorServiceFactor' });
    }

    return compressedAirData;
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