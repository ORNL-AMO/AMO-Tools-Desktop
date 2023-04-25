import { Injectable } from '@angular/core';
import { FieldMeasurements, FluidProperties, PumpInventoryData, PumpMotorProperties, PumpProperties, PumpStatus, SystemProperties } from './pump-inventory';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class ConvertPumpInventoryService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertInventoryData(pumpInventoryData: PumpInventoryData, oldSettings: Settings, newSettings: Settings): PumpInventoryData {
    pumpInventoryData.departments.forEach(department => {
      department.catalog.forEach(pumpItem => {
        pumpItem.fieldMeasurements = this.convertFieldMeasurements(pumpItem.fieldMeasurements, oldSettings, newSettings);
        pumpItem.fluid = this.convertFluid(pumpItem.fluid, oldSettings, newSettings);
        pumpItem.pumpEquipment = this.convertEquipment(pumpItem.pumpEquipment, oldSettings, newSettings);
        pumpItem.pumpMotor = this.convertPumpMotor(pumpItem.pumpMotor, oldSettings, newSettings);
        pumpItem.systemProperties = this.convertPumpSystem(pumpItem.systemProperties, oldSettings, newSettings);
      });
    });
    return pumpInventoryData;
  }


  convertFieldMeasurements(fieldMeasurements: FieldMeasurements, oldSettings: Settings, newSettings: Settings): FieldMeasurements {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      fieldMeasurements.staticSuctionHead = this.convertUnitsService.value(fieldMeasurements.staticSuctionHead).from('m').to('ft');
      fieldMeasurements.staticDischargeHead = this.convertUnitsService.value(fieldMeasurements.staticDischargeHead).from('m').to('ft');
      fieldMeasurements.operatingFlowRate = this.convertUnitsService.value(fieldMeasurements.operatingFlowRate).from('m3/h').to('gpm');
      fieldMeasurements.operatingHead = this.convertUnitsService.value(fieldMeasurements.operatingHead).from('m').to('ft');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      fieldMeasurements.staticSuctionHead = this.convertUnitsService.value(fieldMeasurements.staticSuctionHead).from('ft').to('m');
      fieldMeasurements.staticDischargeHead = this.convertUnitsService.value(fieldMeasurements.staticDischargeHead).from('ft').to('m');
      fieldMeasurements.operatingFlowRate = this.convertUnitsService.value(fieldMeasurements.operatingFlowRate).from('gpm').to('m3/h');
      fieldMeasurements.operatingHead = this.convertUnitsService.value(fieldMeasurements.operatingHead).from('ft').to('m');
    }
    fieldMeasurements.staticSuctionHead = this.convertUnitsService.roundVal(fieldMeasurements.staticSuctionHead, 2);
    fieldMeasurements.staticDischargeHead = this.convertUnitsService.roundVal(fieldMeasurements.staticDischargeHead, 2);
    fieldMeasurements.operatingFlowRate = this.convertUnitsService.roundVal(fieldMeasurements.operatingFlowRate, 2);
    fieldMeasurements.operatingHead = this.convertUnitsService.roundVal(fieldMeasurements.operatingHead, 2);
    return fieldMeasurements;
  }

   convertFluid(fluid: FluidProperties, oldSettings: Settings, newSettings: Settings): FluidProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      fluid.fluidDensity = this.convertUnitsService.value(fluid.fluidDensity).from('kgNm3').to('lbscf');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      fluid.fluidDensity = this.convertUnitsService.value(fluid.fluidDensity).from('lbscf').to('kgNm3');
    }
    fluid.fluidDensity = this.convertUnitsService.roundVal(fluid.fluidDensity, 2);
    return fluid;
  }

  convertEquipment(pumpEquipment: PumpProperties, oldSettings: Settings, newSettings: Settings): PumpProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      pumpEquipment.inletDiameter = this.convertUnitsService.value(pumpEquipment.inletDiameter).from('m').to('ft');
      pumpEquipment.outletDiameter = this.convertUnitsService.value(pumpEquipment.outletDiameter).from('m').to('ft');
      pumpEquipment.maxWorkingPressure = this.convertUnitsService.value(pumpEquipment.maxWorkingPressure).from('Pa').to('psig');
      pumpEquipment.maxAmbientTemperature = this.convertUnitsService.value(pumpEquipment.maxAmbientTemperature).from('C').to('F');
      pumpEquipment.maxSuctionLift = this.convertUnitsService.value(pumpEquipment.maxSuctionLift).from('m').to('ft');
      pumpEquipment.startingTorque = this.convertUnitsService.value(pumpEquipment.startingTorque).from('Nm').to('lbft');
      pumpEquipment.impellerDiameter = this.convertUnitsService.value(pumpEquipment.impellerDiameter).from('m').to('ft');
      pumpEquipment.pumpSize = this.convertUnitsService.value(pumpEquipment.pumpSize).from('m').to('ft');
      pumpEquipment.designHead = this.convertUnitsService.value(pumpEquipment.designHead).from('m').to('ft');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      pumpEquipment.inletDiameter = this.convertUnitsService.value(pumpEquipment.inletDiameter).from('ft').to('m');
      pumpEquipment.outletDiameter = this.convertUnitsService.value(pumpEquipment.outletDiameter).from('ft').to('m');
      pumpEquipment.maxWorkingPressure = this.convertUnitsService.value(pumpEquipment.maxWorkingPressure).from('psig').to('Pa');
      pumpEquipment.maxAmbientTemperature = this.convertUnitsService.value(pumpEquipment.maxAmbientTemperature).from('F').to('C');
      pumpEquipment.maxSuctionLift = this.convertUnitsService.value(pumpEquipment.maxSuctionLift).from('ft').to('m');
      pumpEquipment.startingTorque = this.convertUnitsService.value(pumpEquipment.startingTorque).from('lbft').to('Nm');
      pumpEquipment.impellerDiameter = this.convertUnitsService.value(pumpEquipment.impellerDiameter).from('ft').to('m');
      pumpEquipment.pumpSize = this.convertUnitsService.value(pumpEquipment.pumpSize).from('ft').to('m');
      pumpEquipment.designHead = this.convertUnitsService.value(pumpEquipment.designHead).from('ft').to('m');
    }
    pumpEquipment.inletDiameter = this.convertUnitsService.roundVal(pumpEquipment.inletDiameter, 2)
    pumpEquipment.outletDiameter = this.convertUnitsService.roundVal(pumpEquipment.outletDiameter, 2)
    pumpEquipment.maxWorkingPressure = this.convertUnitsService.roundVal(pumpEquipment.maxWorkingPressure, 2)
    pumpEquipment.maxAmbientTemperature = this.convertUnitsService.roundVal(pumpEquipment.maxAmbientTemperature, 2)
    pumpEquipment.maxSuctionLift = this.convertUnitsService.roundVal(pumpEquipment.maxSuctionLift, 2)
    pumpEquipment.startingTorque = this.convertUnitsService.roundVal(pumpEquipment.startingTorque, 2)
    pumpEquipment.impellerDiameter = this.convertUnitsService.roundVal(pumpEquipment.impellerDiameter, 2)
    pumpEquipment.pumpSize = this.convertUnitsService.roundVal(pumpEquipment.pumpSize, 2)
    pumpEquipment.designHead = this.convertUnitsService.roundVal(pumpEquipment.designHead, 2)
    
    return pumpEquipment;
  }

  convertPumpMotor(motor: PumpMotorProperties, oldSettings: Settings, newSettings: Settings): PumpMotorProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      motor.motorRatedPower = this.convertUnitsService.value(motor.motorRatedPower).from('kW').to('hp');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      motor.motorRatedPower = this.convertUnitsService.value(motor.motorRatedPower).from('hp').to('kW');
    }
    motor.motorRatedPower = this.convertUnitsService.roundVal(motor.motorRatedPower, 2);
    return motor;
  }

  convertPumpSystem(pumpSystem: SystemProperties, oldSettings: Settings, newSettings: Settings): SystemProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      pumpSystem.flangeConnectionSize = this.convertUnitsService.value(pumpSystem.flangeConnectionSize).from('mm').to('in');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      pumpSystem.flangeConnectionSize = this.convertUnitsService.value(pumpSystem.flangeConnectionSize).from('in').to('mm');
    }
    pumpSystem.flangeConnectionSize = this.convertUnitsService.roundVal(pumpSystem.flangeConnectionSize, 2);
    return pumpSystem;
  }
}
