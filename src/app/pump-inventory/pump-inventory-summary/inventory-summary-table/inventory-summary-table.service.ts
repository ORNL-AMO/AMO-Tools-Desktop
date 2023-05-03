import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FieldMeasurements, FieldMeasurementsOptions, FluidProperties, FluidPropertiesOptions, NameplateData, NameplateDataOptions, PumpInventoryData, PumpItem, PumpMotorProperties, PumpMotorPropertiesOptions, PumpProperties, PumpPropertiesOptions, PumpPropertyDisplayOptions, PumpStatus, PumpStatusOptions, SystemProperties, SystemPropertiesOptions } from '../../pump-inventory';
import { PumpInventorySummaryService, PumpSummaryUnitsImperial, PumpSummaryUnitsMetric } from '../pump-inventory-summary.service';

@Injectable()
export class InventorySummaryTableService {

  constructor(private pumpInventorySummaryService: PumpInventorySummaryService) { }

  getInventorySummaryData(pumpInventoryData: PumpInventoryData, settings: Settings): InventorySummaryData {
    let pumpData: Array<Array<SummaryPumpData>> = new Array();
    // let fields: Array<PumpField>;
    let fields: Array<PumpField> = this.pumpInventorySummaryService.getFields(pumpInventoryData.displayOptions, settings);
    pumpInventoryData.departments.forEach(department => {
      department.catalog.forEach(pumpItem => {
        let pumpItemData = this.getPumpData(pumpItem, department.name, pumpInventoryData.displayOptions, settings);
        pumpData.push(pumpItemData);
      });
    });
    return {
      fields: fields,
      pumpData: pumpData
    }
  }

  getPumpData(pumpItem: PumpItem, departmentName: string, displayOptions: PumpPropertyDisplayOptions, settings: Settings): Array<SummaryPumpData> {
    let pumpData: Array<SummaryPumpData> = new Array();
    pumpData = [{ value: pumpItem.name, fieldStr: 'name' }, { value: departmentName, fieldStr: 'departmentName' }];
    let nameplateData = this.getNameplateData(pumpItem.nameplateData, displayOptions.nameplateDataOptions);
    pumpData = pumpData.concat(nameplateData);
    let pumpProperties = this.getPumpPropertiesData(pumpItem.pumpEquipment, displayOptions.pumpPropertiesOptions, settings);
    pumpData = pumpData.concat(pumpProperties);
    let fluidProperties = this.getFluidPropertiesData(pumpItem.fluid, displayOptions.fluidPropertiesOptions, settings);
    pumpData = pumpData.concat(fluidProperties);
    let fieldMeasurements = this.getFieldMeasurementsData(pumpItem.fieldMeasurements, displayOptions.fieldMeasurementOptions, settings);
    pumpData = pumpData.concat(fieldMeasurements);
    let pumpMotorProperties = this.getPumpMotorData(pumpItem.pumpMotor, displayOptions.pumpMotorPropertiesOptions, settings);
    pumpData = pumpData.concat(pumpMotorProperties);
    let pumpStatus = this.getPumpStatusData(pumpItem.pumpStatus, displayOptions.pumpStatusOptions);
    pumpData = pumpData.concat(pumpStatus);
    let systemProperties = this.getSystemPropertiesData(pumpItem.systemProperties, displayOptions.systemPropertiesOptions, settings);
    pumpData = pumpData.concat(systemProperties);

    return pumpData;
  }

   //nameplate data
   getNameplateData(nameplateData: NameplateData, nameplateDataOptions: NameplateDataOptions): Array<SummaryPumpData> {
    let pumpData: Array<SummaryPumpData> = [];
    if (nameplateDataOptions.manufacturer) {
      pumpData.push({ value: nameplateData.manufacturer, fieldStr: 'manufacturer' });
    }
    if (nameplateDataOptions.model) {
      pumpData.push({ value: nameplateData.model, fieldStr: 'model' });
    }
    if (nameplateDataOptions.serialNumber) {
      pumpData.push({ value: nameplateData.serialNumber, fieldStr: 'serialNumber' });
    }
    
    return pumpData;
  }

  getPumpPropertiesData(pumpProperties: PumpProperties, pumpPropertiesOptions: PumpPropertiesOptions, settings: Settings): Array<SummaryPumpData> {
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.pumpEquipment : PumpSummaryUnitsMetric.pumpEquipment; 

    let pumpData: Array<SummaryPumpData> = [];
    if (pumpPropertiesOptions.pumpType) {
      pumpData.push({ value: pumpProperties.pumpType, fieldStr: 'pumpType', pipe: 'pumpType' });
    } 
    if (pumpPropertiesOptions.shaftOrientation) {
      pumpData.push({ value: pumpProperties.shaftOrientation, fieldStr: 'shaftOrientation', pipe: 'shaftOrientation' });
    } 
    if (pumpPropertiesOptions.shaftSealType) {
      pumpData.push({ value: pumpProperties.shaftSealType, fieldStr: 'shaftSealType', pipe: 'shaftSealType' });
    } 
    if (pumpPropertiesOptions.numStages) {
      pumpData.push({ value: pumpProperties.numStages, fieldStr: 'numStages' });
    } 
    if (pumpPropertiesOptions.inletDiameter) {
      pumpData.push({ value: pumpProperties.inletDiameter, fieldStr: 'inletDiameter', unit: units.inletDiameter });
    } 
    if (pumpPropertiesOptions.outletDiameter) {
      pumpData.push({ value: pumpProperties.outletDiameter, fieldStr: 'outletDiameter', unit: units.outletDiameter });
    }
    if (pumpPropertiesOptions.maxWorkingPressure) {
      pumpData.push({ value: pumpProperties.maxWorkingPressure, fieldStr: 'maxWorkingPressure', unit: units.maxWorkingPressure });
    }
    if (pumpPropertiesOptions.maxAmbientTemperature) {
      pumpData.push({ value: pumpProperties.maxAmbientTemperature, fieldStr: 'maxAmbientTemperature', unit: units.maxAmbientTemperature });
    } 
    if (pumpPropertiesOptions.maxSuctionLift) {
      pumpData.push({ value: pumpProperties.maxSuctionLift, fieldStr: 'maxSuctionLift', unit: units.maxSuctionLift });
    } 
    if (pumpPropertiesOptions.displacement) {
      pumpData.push({ value: pumpProperties.displacement, fieldStr: 'displacement', unit: units.displacement });
    } 
    if (pumpPropertiesOptions.startingTorque) {
      pumpData.push({ value: pumpProperties.startingTorque, fieldStr: 'startingTorque', unit: units.startingTorque });
    }
    if (pumpPropertiesOptions.ratedSpeed) {
      pumpData.push({ value: pumpProperties.ratedSpeed, fieldStr: 'ratedSpeed', unit: units.ratedSpeed });
    } 
    if (pumpPropertiesOptions.impellerDiameter) {
      pumpData.push({ value: pumpProperties.impellerDiameter, fieldStr: 'impellerDiameter', unit: units.impellerDiameter });
    } 
    if (pumpPropertiesOptions.minFlowSize) {
      pumpData.push({ value: pumpProperties.minFlowSize, fieldStr: 'minFlowSize', unit: units.minFlowSize });
    } 
    if (pumpPropertiesOptions.pumpSize) {
      pumpData.push({ value: pumpProperties.pumpSize, fieldStr: 'pumpSize', unit: units.pumpSize });
    } 
    if (pumpPropertiesOptions.designHead) {
      pumpData.push({ value: pumpProperties.designHead, fieldStr: 'designHead', unit: units.designHead });
    }
    if (pumpPropertiesOptions.designFlow) {
      pumpData.push({ value: pumpProperties.designFlow, fieldStr: 'designFlow', unit: units.designFlow });
    }
    if (pumpPropertiesOptions.designEfficiency) {
      pumpData.push({ value: pumpProperties.designEfficiency, fieldStr: 'designEfficiency', unit: units.designEfficiency });
    }
    
    return pumpData;
  }

  getFluidPropertiesData(fluidProperties: FluidProperties, fluidPropertiesOptions: FluidPropertiesOptions,  settings: Settings): Array<SummaryPumpData> {
    let pumpData: Array<SummaryPumpData> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.fluid : PumpSummaryUnitsMetric.fluid; 

    if (fluidPropertiesOptions.fluidType) {
      pumpData.push({ value: fluidProperties.fluidType, fieldStr: 'fluidType' });
    } 
    if (fluidPropertiesOptions.fluidDensity) {
      pumpData.push({ value: fluidProperties.fluidDensity, fieldStr: 'fluidDensity', unit: units.fluidDensity });
    } 

    return pumpData;
  }

  getFieldMeasurementsData(fieldMeasurements: FieldMeasurements, fieldMeasurementsOptions: FieldMeasurementsOptions,  settings: Settings): Array<SummaryPumpData> {
    let pumpData: Array<SummaryPumpData> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.fieldMeasurements : PumpSummaryUnitsMetric.fieldMeasurements; 

    if (fieldMeasurementsOptions.pumpSpeed) {
      pumpData.push({ value: fieldMeasurements.pumpSpeed, fieldStr: 'pumpSpeed', unit: units.pumpSpeed });
    } 
    if (fieldMeasurementsOptions.yearlyOperatingHours) {
      pumpData.push({ value: fieldMeasurements.yearlyOperatingHours, fieldStr: 'yearlyOperatingHours' });
    } 
    if (fieldMeasurementsOptions.staticSuctionHead) {
      pumpData.push({ value: fieldMeasurements.staticSuctionHead, fieldStr: 'staticSuctionHead', unit: units.staticSuctionHead });
    } 
    if (fieldMeasurementsOptions.staticDischargeHead) {
      pumpData.push({ value: fieldMeasurements.staticDischargeHead, fieldStr: 'staticDischargeHead', unit: units.staticDischargeHead });
    } 
    if (fieldMeasurementsOptions.efficiency) {
      pumpData.push({ value: fieldMeasurements.efficiency, fieldStr: 'efficiency', unit: units.efficiency });
    }
    if (fieldMeasurementsOptions.assessmentDate) {
      pumpData.push({ value: fieldMeasurements.assessmentDate, fieldStr: 'assessmentDate' });
    }
    if (fieldMeasurementsOptions.operatingFlowRate) {
      pumpData.push({ value: fieldMeasurements.operatingFlowRate, fieldStr: 'operatingFlowRate', unit: units.operatingFlowRate });
    }
    if (fieldMeasurementsOptions.operatingHead) {
      pumpData.push({ value: fieldMeasurements.operatingHead, fieldStr: 'operatingHead', unit: units.operatingHead });
    }
    if (fieldMeasurementsOptions.operatingHours) {
      pumpData.push({ value: fieldMeasurements.operatingHours.hoursPerYear, fieldStr: 'operatingHours' });
    }

    return pumpData;
  }

  getPumpMotorData(pumpMotor: PumpMotorProperties, pumpMotorPropertiesOptions: PumpMotorPropertiesOptions,  settings: Settings): Array<SummaryPumpData> {
    let pumpData: Array<SummaryPumpData> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.pumpMotor : PumpSummaryUnitsMetric.pumpMotor; 

    if (pumpMotorPropertiesOptions.motorRPM) {
      pumpData.push({ value: pumpMotor.motorRPM, fieldStr: 'motorRPM', unit: units.motorRPM });
    } 
    if (pumpMotorPropertiesOptions.lineFrequency) {
      pumpData.push({ value: pumpMotor.lineFrequency, fieldStr: 'lineFrequency' });
    } 
    if (pumpMotorPropertiesOptions.motorRatedPower) {
      pumpData.push({ value: pumpMotor.motorRatedPower, fieldStr: 'motorRatedPower', unit: units.motorRatedPower });
    } 
    if (pumpMotorPropertiesOptions.motorEfficiencyClass) {
      pumpData.push({ value: pumpMotor.motorEfficiencyClass, fieldStr: 'motorEfficiencyClass', pipe: 'motorEfficiencyClass' });
    } 
    if (pumpMotorPropertiesOptions.motorRatedVoltage) {
      pumpData.push({ value: pumpMotor.motorRatedVoltage, fieldStr: 'motorRatedVoltage', unit: units.motorRatedVoltage });
    }
    if (pumpMotorPropertiesOptions.motorFullLoadAmps) {
      pumpData.push({ value: pumpMotor.motorFullLoadAmps, fieldStr: 'motorFullLoadAmps', unit: units.motorFullLoadAmps });
    }
    if (pumpMotorPropertiesOptions.motorEfficiency) {
      pumpData.push({ value: pumpMotor.motorEfficiency, fieldStr: 'motorEfficiency', unit: units.motorEfficiency });
    }

    return pumpData;
  }

  getSystemPropertiesData(systemProperties: SystemProperties, systemPropertiesOptions: SystemPropertiesOptions,  settings: Settings): Array<SummaryPumpData> {
    let pumpData: Array<SummaryPumpData> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.systemProperties : PumpSummaryUnitsMetric.systemProperties; 

    if (systemPropertiesOptions.driveType) {
      pumpData.push({ value: systemProperties.driveType, fieldStr: 'driveType', pipe: 'driveType' });
    } 
    if (systemPropertiesOptions.flangeConnectionClass) {
      pumpData.push({ value: systemProperties.flangeConnectionClass, fieldStr: 'flangeConnectionClass' });
    } 
    if (systemPropertiesOptions.flangeConnectionSize) {
      pumpData.push({ value: systemProperties.flangeConnectionSize, fieldStr: 'flangeConnectionSize', unit: units.flangeConnectionSize });
    } 
    if (systemPropertiesOptions.componentId) {
      pumpData.push({ value: systemProperties.componentId, fieldStr: 'componentId' });
    } 
    if (systemPropertiesOptions.system) {
      pumpData.push({ value: systemProperties.system, fieldStr: 'system' });
    }
    if (systemPropertiesOptions.location) {
      pumpData.push({ value: systemProperties.location, fieldStr: 'location' });
    }

    return pumpData;
  }

  getPumpStatusData(pumpStatus: PumpStatus, pumpStatusOptions: PumpStatusOptions): Array<SummaryPumpData> {
    let pumpData: Array<SummaryPumpData> = [];
    if (pumpStatusOptions.status) {
      pumpData.push({ value: pumpStatus.status, fieldStr: 'status', pipe: 'statusType' });
    }
    if (pumpStatusOptions.priority) {
      pumpData.push({ value: pumpStatus.priority, fieldStr: 'priority', pipe: 'priorityType' });
    }
    if (pumpStatusOptions.yearInstalled) {
      pumpData.push({ value: pumpStatus.yearInstalled, fieldStr: 'yearInstalled' });
    }
    
    return pumpData;
  }

}




export interface InventorySummaryData {
  fields: Array<PumpField>,
  pumpData: Array<Array<SummaryPumpData>>
}

export interface PumpField {
  display: string,
  value: string,
  group: string,
  unit?: string
}

export interface SummaryPumpData {
  fieldStr: string,
  value: number | string | Date,
  pipe?: string,
  unit?: string
}
