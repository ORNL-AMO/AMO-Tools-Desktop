import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';
import { FieldMeasurementsOptions, FluidPropertiesOptions, NameplateDataOptions, PumpInventoryData, PumpItem, PumpMotorPropertiesOptions, PumpProperties, PumpPropertiesOptions, PumpPropertyDisplayOptions, PumpStatusOptions, SystemPropertiesOptions } from '../pump-inventory';
import { SettingsLabelPipe } from '../../shared/shared-pipes/settings-label.pipe';


@Injectable()
export class PumpInventorySummaryService {


  constructor(private settingsLabelPipe: SettingsLabelPipe) {
  }

  getAllPumps(inventoryData: PumpInventoryData): Array<PumpItem> {
    let allPumps: Array<PumpItem> = _.flatMap(inventoryData.departments, (department) => { return department.catalog });
    return allPumps;
  }


  getFields(displayOptions: PumpPropertyDisplayOptions, settings: Settings): Array<PumpField> {
    let fields: Array<PumpField> = [{
      display: 'Name',
      value: 'name',
      group: 'nameplateData'
    }, {
      display: 'Department',
      value: 'department',
      group: 'nameplateData'
    }];
    //nameplate
    let nameplateFields: Array<PumpField> = this.getNameplateDataFields(displayOptions.nameplateDataOptions, settings);
    fields = fields.concat(nameplateFields);
    let pumpPropertiesFields: Array<PumpField> = this.getPumpPropertiesFields(displayOptions.pumpPropertiesOptions, settings);
    fields = fields.concat(pumpPropertiesFields);
    let fluidPropertiesFields: Array<PumpField> = this.getFluidPropertiesFields(displayOptions.fluidPropertiesOptions, settings);
    fields = fields.concat(fluidPropertiesFields);
    let fieldMeasurementFields: Array<PumpField> = this.getFieldMeasurementsFields(displayOptions.fieldMeasurementOptions, settings);
    fields = fields.concat(fieldMeasurementFields);
    let pumpMotorPropertiesFields: Array<PumpField> = this.getPumpMotorFields(displayOptions.pumpMotorPropertiesOptions, settings);
    fields = fields.concat(pumpMotorPropertiesFields);
    let pumpStatusFields: Array<PumpField> = this.getPumpStatusFields(displayOptions.pumpStatusOptions, settings);
    fields = fields.concat(pumpStatusFields);
    let systemPropertiesFields: Array<PumpField> = this.getSystemPropertiesFields(displayOptions.systemPropertiesOptions, settings);
    fields = fields.concat(systemPropertiesFields);
    return fields;
  }

  getNameplateDataFields(nameplateDataOptions: NameplateDataOptions, settings: Settings): Array<PumpField> {
    let fields: Array<PumpField> = [];
    if (nameplateDataOptions.manufacturer) {
      fields.push({ display: 'Manufacturer', value: 'manufacturer', group: 'nameplateData' });
    }
    if (nameplateDataOptions.model) {
      fields.push({ display: 'Model', value: 'model', group: 'nameplateData' });
    }
    if (nameplateDataOptions.serialNumber) {
      fields.push({ display: 'Serial Number', value: 'serialNumber', group: 'nameplateData' });
    }
    return fields;
  }

  getPumpPropertiesFields(pumpPropertiesOptions: PumpPropertiesOptions, settings: Settings): Array<PumpField> {

    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.pumpEquipment : PumpSummaryUnitsMetric.pumpEquipment; 
    let designFlowUnits = this.settingsLabelPipe.transform(settings.fanFlowRate);
    let fields: Array<PumpField> = [];
    
    if (pumpPropertiesOptions.pumpType) {
      fields.push({display: 'Pump Type', value: 'pumpType', group: 'pumpEquipment',  unit: undefined});
    } 
    if (pumpPropertiesOptions.shaftOrientation) {
      fields.push({display: 'Shaft Orientation', value: 'shaftOrientation', group: 'pumpEquipment', unit: undefined});
    } 
    if (pumpPropertiesOptions.shaftSealType) {
      fields.push({display: 'Shaft Seal Type', value: 'shaftSealType', group: 'pumpEquipment', unit: undefined});
    } 
    if (pumpPropertiesOptions.numStages) {
      fields.push({display: 'Number of Stages', value: 'numStages', group: 'pumpEquipment', unit: undefined});
    } 
    if (pumpPropertiesOptions.inletDiameter) {
      fields.push({display: 'Inlet Diameter', value: 'inletDiameter', group: 'pumpEquipment', unit: units.inletDiameter});
    } 
    if (pumpPropertiesOptions.outletDiameter) {
      fields.push({display: 'Outlet Diameter', value: 'outletDiameter', group: 'pumpEquipment', unit: units.outletDiameter});
    }
    if (pumpPropertiesOptions.maxWorkingPressure) {
      fields.push({display: 'Max Working Pressure', value: 'maxWorkingPressure', group: 'pumpEquipment', unit: units.maxWorkingPressure});
    }
    if (pumpPropertiesOptions.maxAmbientTemperature) {
      fields.push({display: 'Max Ambient Temperature', value: 'maxAmbientTemperature', group: 'pumpEquipment', unit: units.maxAmbientTemperature});
    } 
    if (pumpPropertiesOptions.maxSuctionLift) {
      fields.push({display: 'Max Suction Lift', value: 'maxSuctionLift', group: 'pumpEquipment', unit: units.maxSuctionLift});
    } 
    if (pumpPropertiesOptions.displacement) {
      fields.push({display: 'Displacement', value: 'displacement', group: 'pumpEquipment', unit: units.displacement});
    } 
    if (pumpPropertiesOptions.startingTorque) {
      fields.push({display: 'Starting Torque', value: 'startingTorque', group: 'pumpEquipment', unit: units.startingTorque});
    }
    if (pumpPropertiesOptions.ratedSpeed) {
      fields.push({display: 'Rated Speed', value: 'ratedSpeed', group: 'pumpEquipment', unit: units.ratedSpeed});
    } 
    if (pumpPropertiesOptions.impellerDiameter) {
      fields.push({display: 'Impeller Diameter', value: 'impellerDiameter', group: 'pumpEquipment', unit: units.impellerDiameter});
    } 
    if (pumpPropertiesOptions.minFlowSize) {
      fields.push({display: 'Min Flow Size', value: 'minFlowSize', group: 'pumpEquipment', unit: units.minFlowSize});
    } 
    if (pumpPropertiesOptions.pumpSize) {
      fields.push({display: 'Pump Size', value: 'pumpSize', group: 'pumpEquipment', unit: units.pumpSize});
    } 
    if (pumpPropertiesOptions.designHead) {
      fields.push({display: 'Design Head', value: 'designHead', group: 'pumpEquipment', unit: units.designHead});
    }
    if (pumpPropertiesOptions.designFlow) {
      fields.push({display: 'Design Flow', value: 'designFlow', group: 'pumpEquipment', unit: designFlowUnits});
    }
    if (pumpPropertiesOptions.designEfficiency) {
      fields.push({display: 'Design Efficiency', value: 'designEfficiency', group: 'pumpEquipment', unit: units.designEfficiency});
    }
    
    return fields;
  }

  getFluidPropertiesFields(fluidPropertiesOptions: FluidPropertiesOptions, settings: Settings): Array<PumpField> {
    let fields: Array<PumpField> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.fluid : PumpSummaryUnitsMetric.fluid; 

    if (fluidPropertiesOptions.fluidType) {
      fields.push({display: 'Fluid Type', value: 'fluidType', group: 'fluid'});
    } 
    if (fluidPropertiesOptions.fluidDensity) {
      fields.push({display: 'Fluid Density', value: 'fluidDensity', group: 'fluid', unit: units.fluidDensity});
    } 

    return fields;
  }

  getFieldMeasurementsFields(fieldMeasurementOptions: FieldMeasurementsOptions, settings: Settings): Array<PumpField> {
    let fields: Array<PumpField> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.fieldMeasurements : PumpSummaryUnitsMetric.fieldMeasurements; 

    if (fieldMeasurementOptions.pumpSpeed) {
      fields.push({display: 'Pump Speed', value: 'pumpSpeed', group: 'fieldMeasurements', unit: units.pumpSpeed});
    } 
    if (fieldMeasurementOptions.yearlyOperatingHours) {
      fields.push({display: 'Yearly Operating Hours', value: 'yearlyOperatingHours', group: 'fieldMeasurements'});
    }
    if (fieldMeasurementOptions.staticSuctionHead) {
      fields.push({display: 'Static Suction Head', value: 'staticSuctionHead', group: 'fieldMeasurements', unit: units.staticSuctionHead});
    } 
    if (fieldMeasurementOptions.staticDischargeHead) {
      fields.push({display: 'Static Discharge Head', value: 'staticDischargeHead', group: 'fieldMeasurements', unit: units.staticDischargeHead});
    } 
    if (fieldMeasurementOptions.efficiency) {
      fields.push({display: 'Efficiency', value: 'efficiency', group: 'fieldMeasurements', unit: units.efficiency});
    } 
    if (fieldMeasurementOptions.assessmentDate) {
      fields.push({display: 'Assessment Date', value: 'assessmentDate', group: 'fieldMeasurements'});
    } 
    if (fieldMeasurementOptions.operatingFlowRate) {
      fields.push({display: 'Operating Flow Rate', value: 'operatingFlowRate', group: 'fieldMeasurements', unit: units.operatingFlowRate});
    } 
    if (fieldMeasurementOptions.operatingHead) {
      fields.push({display: 'Operating Head', value: 'operatingHead', group: 'fieldMeasurements', unit: units.operatingHead});
    } 
    if (fieldMeasurementOptions.operatingHours) {
      fields.push({display: 'Operating Hours', value: 'operatingHours', group: 'fieldMeasurements'});
    } 

    return fields;
  }

     getPumpMotorFields(pumpMotorProperties: PumpMotorPropertiesOptions, settings: Settings): Array<PumpField> {
      let fields: Array<PumpField> = [];

      let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.pumpMotor : PumpSummaryUnitsMetric.pumpMotor; 
      if (pumpMotorProperties.motorRPM) {
        fields.push({display: 'Motor RPM', value: 'motorRPM', group: 'pumpMotor', unit: units.motorRPM});
      } 
      if (pumpMotorProperties.lineFrequency) {
        fields.push({display: 'Line Frequency', value: 'lineFrequency', group: 'pumpMotor', unit: undefined});
      }
      if (pumpMotorProperties.motorRatedPower) {
        fields.push({display: 'Motor Rated Power', value: 'motorRatedPower', group: 'pumpMotor', unit: units.motorRatedPower});
      } 
      if (pumpMotorProperties.motorEfficiencyClass) {
        fields.push({display: 'Motor Efficiency Class', value: 'motorEfficiencyClass', group: 'pumpMotor', unit: undefined});
      } 
      if (pumpMotorProperties.motorRatedVoltage) {
        fields.push({display: 'Motor Rated Voltage', value: 'motorRatedVoltage', group: 'pumpMotor', unit: units.motorRatedVoltage});
      } 
      if (pumpMotorProperties.motorFullLoadAmps) {
        fields.push({display: 'Motor Full Load Amps', value: 'motorFullLoadAmps', group: 'pumpMotor', unit: units.motorFullLoadAmps});
      } 
      if (pumpMotorProperties.motorEfficiency) {
        fields.push({display: 'Motor Efficiency', value: 'motorEfficiency', group: 'pumpMotor', unit: units.motorEfficiency});
      } 
      return fields;
    }

  getPumpStatusFields(pumpStatusOptions: PumpStatusOptions, settings: Settings): Array<PumpField> {
    let fields: Array<PumpField> = [];
    if (pumpStatusOptions.status) {
      fields.push({ display: 'Status', value: 'status', group: 'pumpStatus' });
    }
    if (pumpStatusOptions.priority) {
      fields.push({ display: 'Priority', value: 'priority', group: 'pumpStatus' });
    }
    if (pumpStatusOptions.yearInstalled) {
      fields.push({ display: 'Year Installed', value: 'yearInstalled', group: 'pumpStatus' });
    }
    return fields;
  }

  getSystemPropertiesFields(systemPropertiesOptions: SystemPropertiesOptions, settings: Settings): Array<PumpField> {
    let fields: Array<PumpField> = [];
    let units = settings.unitsOfMeasure === 'Imperial'? PumpSummaryUnitsImperial.systemProperties : PumpSummaryUnitsMetric.systemProperties; 

    if (systemPropertiesOptions.driveType) {
      fields.push({ display: 'Drive Type', value: 'driveType', group: 'systemProperties' });
    }
    if (systemPropertiesOptions.flangeConnectionClass) {
      fields.push({ display: 'Flange Connection Class', value: 'flangeConnectionClass', group: 'systemProperties' });
    }
    if (systemPropertiesOptions.flangeConnectionSize) {
      fields.push({ display: 'Flange Connection Size', value: 'flangeConnectionSize', group: 'systemProperties', unit: units.flangeConnectionSize});
    }
    if (systemPropertiesOptions.componentId) {
      fields.push({ display: 'Component Id', value: 'componentId', group: 'systemProperties' });
    }
    if (systemPropertiesOptions.system) {
      fields.push({ display: 'System', value: 'system', group: 'systemProperties' });
    }
    if (systemPropertiesOptions.location) {
      fields.push({ display: 'Location', value: 'location', group: 'systemProperties' });
    }
    return fields;
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


// units for getFields and getPumpData in summary
export const PumpSummaryUnitsImperial = {
  fieldMeasurements: {
      pumpSpeed: 'rpm',
      staticSuctionHead: 'ft',
      staticDischargeHead: 'ft',
      efficiency: '%',
      operatingFlowRate: 'gpm',
      operatingHead: 'ft',
      measuredPower: 'A',
      measuredCurrent: 'kW',
      measuredVoltage: 'V',
  },
  fluid: {
      fluidDensity: 'lb/ft<sup>3</sup>'
  },
  pumpEquipment: {
      inletDiameter: 'ft',
      outletDiameter: 'ft',
      maxWorkingPressure: 'psig',
      maxAmbientTemperature: '&#8457;',
      maxSuctionLift: 'ft',
      displacement: '%',
      startingTorque: 'ft-lb',
      ratedSpeed: 'rpm',
      impellerDiameter: 'ft',
      minFlowSize: 'gpm',
      pumpSize: 'ft',
      designHead: 'ft',
      designFlow: undefined,
      designEfficiency: '%',
  },
  pumpMotor: {
      motorRPM: 'rpm',
      motorRatedPower: 'hp',
      motorRatedVoltage: 'V',
      motorFullLoadAmps: 'A',
      motorEfficiency: '%',
  },
  systemProperties: {
      flangeConnectionSize: 'in',
  }
}

export const PumpSummaryUnitsMetric = {
  fieldMeasurements: {
      pumpSpeed: 'rpm',
      staticSuctionHead: 'm',
      staticDischargeHead: 'm',
      efficiency: '%',
      operatingFlowRate: 'm3/hr',
      operatingHead: 'm',
      measuredPower: 'A',
      measuredCurrent: 'kW',
      measuredVoltage: 'V',
  },
  fluid: {
      fluidDensity: 'kg/m<sup>3</sup>'
  },
  pumpEquipment: {
      inletDiameter: 'm',
      outletDiameter: 'm',
      maxWorkingPressure: 'Pa',
      maxAmbientTemperature: '&#8451;',
      maxSuctionLift: 'm',
      displacement: '%',
      startingTorque: 'N-m',
      ratedSpeed: 'rpm',
      impellerDiameter: 'm',
      minFlowSize: 'gpm',
      pumpSize: 'm',
      designHead: 'm',
      designFlow: undefined,
      designEfficiency: '%',
  },
  pumpMotor: {
      motorRPM: 'rpm',
      motorRatedPower: 'kW',
      motorRatedVoltage: 'V',
      motorFullLoadAmps: 'A',
      motorEfficiency: '%',
  },
  systemProperties: {
      flangeConnectionSize: 'mm',
  }
}