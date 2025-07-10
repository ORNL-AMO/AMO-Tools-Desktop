import { Injectable } from '@angular/core';
import { CompressedAirInventorySummaryService } from '../compressed-air-inventory-summary.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirControlsProperties, CompressedAirControlsPropertiesOptions, CompressedAirDesignDetailsProperties, CompressedAirDesignDetailsPropertiesOptions, CompressedAirInventoryData, CompressedAirItem, CompressedAirMotorProperties, CompressedAirMotorPropertiesOptions, CompressedAirPerformancePointsProperties, CompressedAirPerformancePointsPropertiesOptions, CompressedAirPropertyDisplayOptions, NameplateData, NameplateDataOptions } from '../../compressed-air-inventory';

@Injectable()
export class CompressedAirInventorySummaryTableService {

  constructor(private compressedAirInventorySummaryService: CompressedAirInventorySummaryService) { }

  getInventorySummaryData(compressedAirInventoryData: CompressedAirInventoryData, settings: Settings): InventorySummaryData {
    let compressedAirData: Array<Array<SummaryCompressedAirData>> = new Array();
    // let fields: Array<PumpField>;
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
    // pumpData = [{ value: pumpItem.name, fieldStr: 'name' }, { value: systemName, fieldStr: 'systemName' }];
    // let nameplateData = this.getNameplateData(pumpItem.nameplateData, displayOptions.nameplateDataOptions);
    // pumpData = pumpData.concat(nameplateData);
    // let pumpProperties = this.getPumpPropertiesData(pumpItem.pumpEquipment, displayOptions.pumpPropertiesOptions, settings);
    // pumpData = pumpData.concat(pumpProperties);
    // let fluidProperties = this.getFluidPropertiesData(pumpItem.fluid, displayOptions.fluidPropertiesOptions, settings);
    // pumpData = pumpData.concat(fluidProperties);
    // let fieldMeasurements = this.getFieldMeasurementsData(pumpItem.fieldMeasurements, displayOptions.fieldMeasurementOptions, settings);
    // pumpData = pumpData.concat(fieldMeasurements);
    // let pumpMotorProperties = this.getPumpMotorData(pumpItem.pumpMotor, displayOptions.pumpMotorPropertiesOptions, settings);
    // pumpData = pumpData.concat(pumpMotorProperties);
    // let pumpStatus = this.getPumpStatusData(pumpItem.pumpStatus, displayOptions.pumpStatusOptions);
    // pumpData = pumpData.concat(pumpStatus);
    // let systemProperties = this.getSystemPropertiesData(pumpItem.systemProperties, displayOptions.systemPropertiesOptions, settings);
    // pumpData = pumpData.concat(systemProperties);

    return compressedAirData;
  }

  //nameplate data
  getNameplateData(nameplateData: NameplateData, nameplateDataOptions: NameplateDataOptions): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    if (nameplateDataOptions.compressorType) {
      compressedAirData.push({ value: nameplateData.compressorType, fieldStr: 'compressorType' });
    }
    if (nameplateDataOptions.fullLoadOperatingPressure) {
      compressedAirData.push({ value: nameplateData.fullLoadOperatingPressure, fieldStr: 'fullLoadOperatingPressure' });
    }
    if (nameplateDataOptions.fullLoadRatedCapacity) {
      compressedAirData.push({ value: nameplateData.fullLoadRatedCapacity, fieldStr: 'fullLoadRatedCapacity' });
    }
    if (nameplateDataOptions.totalPackageInputPower) {
      compressedAirData.push({ value: nameplateData.totalPackageInputPower, fieldStr: 'totalPackageInputPower' });
    }
    return compressedAirData;
  }

  getMotorPropertiesData(motorProperties: CompressedAirMotorProperties, motorPropertiesOptions: CompressedAirMotorPropertiesOptions, settings: Settings): Array<SummaryCompressedAirData> {
    //let units = settings.unitsOfMeasure === 'Imperial' ? PumpSummaryUnitsImperial.pumpEquipment : PumpSummaryUnitsMetric.pumpEquipment;

    let compressedAirData: Array<SummaryCompressedAirData> = [];
    // if (pumpPropertiesOptions.pumpType) {
    //   pumpData.push({ value: pumpProperties.pumpType, fieldStr: 'pumpType', pipe: 'pumpType' });
    // }
    // if (pumpPropertiesOptions.shaftOrientation) {
    //   pumpData.push({ value: pumpProperties.shaftOrientation, fieldStr: 'shaftOrientation', pipe: 'shaftOrientation' });
    // }
    // if (pumpPropertiesOptions.shaftSealType) {
    //   pumpData.push({ value: pumpProperties.shaftSealType, fieldStr: 'shaftSealType', pipe: 'shaftSealType' });
    // }
   

    return compressedAirData;
  }

  getControlsPropertiesData(controlsProperties: CompressedAirControlsProperties, controlsPropertiesOptions: CompressedAirControlsPropertiesOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    // let units = settings.unitsOfMeasure === 'Imperial' ? PumpSummaryUnitsImperial.fluid : PumpSummaryUnitsMetric.fluid;

    // if (fluidPropertiesOptions.fluidType) {
    //   pumpData.push({ value: fluidProperties.fluidType, fieldStr: 'fluidType' });
    // }
    // if (fluidPropertiesOptions.fluidDensity) {
    //   pumpData.push({ value: fluidProperties.fluidDensity, fieldStr: 'fluidDensity', unit: units.fluidDensity });
    // }

    return compressedAirData;
  }

  getDesignDetailsData(designDetailsProperties: CompressedAirDesignDetailsProperties, designDetailsPropertiesOptions: CompressedAirDesignDetailsPropertiesOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    // let units = settings.unitsOfMeasure === 'Imperial' ? PumpSummaryUnitsImperial.fieldMeasurements : PumpSummaryUnitsMetric.fieldMeasurements;

    // if (fieldMeasurementsOptions.pumpSpeed) {
    //   pumpData.push({ value: fieldMeasurements.pumpSpeed, fieldStr: 'pumpSpeed', unit: units.pumpSpeed });
    // }
    

    return compressedAirData;
  }

  getPerformancePointsData(performancePointsProperties: CompressedAirPerformancePointsProperties, performancePointsPropertiesOptions: CompressedAirPerformancePointsPropertiesOptions, settings: Settings): Array<SummaryCompressedAirData> {
    let compressedAirData: Array<SummaryCompressedAirData> = [];
    // let units = settings.unitsOfMeasure === 'Imperial' ? PumpSummaryUnitsImperial.pumpMotor : PumpSummaryUnitsMetric.pumpMotor;

    // if (pumpMotorPropertiesOptions.motorRPM) {
    //   pumpData.push({ value: pumpMotor.motorRPM, fieldStr: 'motorRPM', unit: units.motorRPM });
    // }
    // if (pumpMotorPropertiesOptions.lineFrequency) {
    //   pumpData.push({ value: pumpMotor.lineFrequency, fieldStr: 'lineFrequency' });
    // }

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