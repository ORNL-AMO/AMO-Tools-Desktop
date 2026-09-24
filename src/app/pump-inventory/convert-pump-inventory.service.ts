import { Injectable } from '@angular/core';
import { FieldMeasurements, FluidProperties, PumpInventoryData, PumpMotorProperties, PumpProperties, SystemProperties } from './pump-inventory';
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
      fieldMeasurements.staticSuctionHead = this.convertVal(fieldMeasurements.staticSuctionHead, 'm', 'ft');
      fieldMeasurements.staticDischargeHead = this.convertVal(fieldMeasurements.staticDischargeHead, 'm', 'ft');
      fieldMeasurements.operatingFlowRate = this.convertVal(fieldMeasurements.operatingFlowRate, 'm3/h', 'gpm');
      fieldMeasurements.operatingHead = this.convertVal(fieldMeasurements.operatingHead, 'm', 'ft');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      fieldMeasurements.staticSuctionHead = this.convertVal(fieldMeasurements.staticSuctionHead, 'ft', 'm');
      fieldMeasurements.staticDischargeHead = this.convertVal(fieldMeasurements.staticDischargeHead, 'ft', 'm');
      fieldMeasurements.operatingFlowRate = this.convertVal(fieldMeasurements.operatingFlowRate, 'gpm', 'm3/h');
      fieldMeasurements.operatingHead = this.convertVal(fieldMeasurements.operatingHead, 'ft', 'm');
    }
    fieldMeasurements.staticSuctionHead = this.roundVal(fieldMeasurements.staticSuctionHead, 2);
    fieldMeasurements.staticDischargeHead = this.roundVal(fieldMeasurements.staticDischargeHead, 2);
    fieldMeasurements.operatingFlowRate = this.roundVal(fieldMeasurements.operatingFlowRate, 2);
    fieldMeasurements.operatingHead = this.roundVal(fieldMeasurements.operatingHead, 2);
    return fieldMeasurements;
  }

   convertFluid(fluid: FluidProperties, oldSettings: Settings, newSettings: Settings): FluidProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      fluid.fluidDensity = this.convertVal(fluid.fluidDensity, 'kgNm3', 'lbscf');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      fluid.fluidDensity = this.convertVal(fluid.fluidDensity, 'lbscf', 'kgNm3');
    }
    fluid.fluidDensity = this.roundVal(fluid.fluidDensity, 2);
    return fluid;
  }

  convertEquipment(pumpEquipment: PumpProperties, oldSettings: Settings, newSettings: Settings): PumpProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      pumpEquipment.inletDiameter = this.convertVal(pumpEquipment.inletDiameter, 'cm', 'in');
      pumpEquipment.outletDiameter = this.convertVal(pumpEquipment.outletDiameter, 'cm', 'in');
      pumpEquipment.maxWorkingPressure = this.convertVal(pumpEquipment.maxWorkingPressure, 'Pa', 'psig');
      pumpEquipment.maxAmbientTemperature = this.convertVal(pumpEquipment.maxAmbientTemperature, 'C', 'F');
      pumpEquipment.maxSuctionLift = this.convertVal(pumpEquipment.maxSuctionLift, 'm', 'ft');
      pumpEquipment.startingTorque = this.convertVal(pumpEquipment.startingTorque, 'Nm', 'lbft');
      pumpEquipment.impellerDiameter = this.convertVal(pumpEquipment.impellerDiameter, 'm', 'in');
      pumpEquipment.pumpSize = this.convertVal(pumpEquipment.pumpSize, 'm', 'ft');
      pumpEquipment.designHead = this.convertVal(pumpEquipment.designHead, 'm', 'ft');
      pumpEquipment.designDifferentialPressure = this.convertVal(pumpEquipment.designDifferentialPressure, 'Pa', 'psi');

      pumpEquipment.minFlowSize = this.convertVal(pumpEquipment.minFlowSize, 'm3/min', 'gpm');
      pumpEquipment.designFlow = this.convertVal(pumpEquipment.designFlow, 'm3/h', 'gpm');

    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      pumpEquipment.inletDiameter = this.convertVal(pumpEquipment.inletDiameter, 'in', 'cm');
      pumpEquipment.outletDiameter = this.convertVal(pumpEquipment.outletDiameter, 'in', 'cm');
      pumpEquipment.maxWorkingPressure = this.convertVal(pumpEquipment.maxWorkingPressure, 'psig', 'Pa');
      pumpEquipment.maxAmbientTemperature = this.convertVal(pumpEquipment.maxAmbientTemperature, 'F', 'C');
      pumpEquipment.maxSuctionLift = this.convertVal(pumpEquipment.maxSuctionLift, 'ft', 'm');
      pumpEquipment.startingTorque = this.convertVal(pumpEquipment.startingTorque, 'lbft', 'Nm');
      pumpEquipment.impellerDiameter = this.convertVal(pumpEquipment.impellerDiameter, 'in', 'm');
      pumpEquipment.pumpSize = this.convertVal(pumpEquipment.pumpSize, 'ft', 'm');
      pumpEquipment.designHead = this.convertVal(pumpEquipment.designHead, 'ft', 'm');
      pumpEquipment.designDifferentialPressure = this.convertVal(pumpEquipment.designDifferentialPressure, 'psi', 'Pa');

      pumpEquipment.minFlowSize = this.convertVal(pumpEquipment.minFlowSize, 'gpm', 'm3/min');
      pumpEquipment.designFlow = this.convertVal(pumpEquipment.designFlow, 'gpm', 'm3/h');

    }
    pumpEquipment.inletDiameter = this.roundVal(pumpEquipment.inletDiameter, 2);
    pumpEquipment.outletDiameter = this.roundVal(pumpEquipment.outletDiameter, 2);
    pumpEquipment.maxWorkingPressure = this.roundVal(pumpEquipment.maxWorkingPressure, 2);
    pumpEquipment.maxAmbientTemperature = this.roundVal(pumpEquipment.maxAmbientTemperature, 2);
    pumpEquipment.maxSuctionLift = this.roundVal(pumpEquipment.maxSuctionLift, 2);
    pumpEquipment.startingTorque = this.roundVal(pumpEquipment.startingTorque, 2);
    pumpEquipment.impellerDiameter = this.roundVal(pumpEquipment.impellerDiameter, 2);
    pumpEquipment.pumpSize = this.roundVal(pumpEquipment.pumpSize, 2);
    pumpEquipment.designHead = this.roundVal(pumpEquipment.designHead, 2);
    pumpEquipment.designDifferentialPressure = this.roundVal(pumpEquipment.designDifferentialPressure, 2);
    pumpEquipment.minFlowSize = this.roundVal(pumpEquipment.minFlowSize, 2);
    pumpEquipment.designFlow = this.roundVal(pumpEquipment.designFlow, 2);

    return pumpEquipment;
  }

  convertPumpMotor(motor: PumpMotorProperties, oldSettings: Settings, newSettings: Settings): PumpMotorProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      motor.motorRatedPower = this.convertVal(motor.motorRatedPower, 'kW', 'hp');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      motor.motorRatedPower = this.convertVal(motor.motorRatedPower, 'hp', 'kW');
    }
    motor.motorRatedPower = this.roundVal(motor.motorRatedPower, 2);
    return motor;
  }

  convertPumpSystem(pumpSystem: SystemProperties, oldSettings: Settings, newSettings: Settings): SystemProperties {
    if (oldSettings.unitsOfMeasure == 'Metric' && newSettings.unitsOfMeasure == 'Imperial') {
      pumpSystem.flangeConnectionSize = this.convertVal(pumpSystem.flangeConnectionSize, 'mm', 'in');
    } else if (oldSettings.unitsOfMeasure == 'Imperial' && newSettings.unitsOfMeasure == 'Metric') {
      pumpSystem.flangeConnectionSize = this.convertVal(pumpSystem.flangeConnectionSize, 'in', 'mm');
    }
    pumpSystem.flangeConnectionSize = this.roundVal(pumpSystem.flangeConnectionSize, 2);
    return pumpSystem;
  }

  private convertVal(val: number, from: string, to: string): number {
    if (val === null || val === undefined) {
      return val;
    }
    return this.convertUnitsService.value(val).from(from).to(to);
  }

  private roundVal(val: number, digits: number): number {
    if (val === null || val === undefined) {
      return val;
    }
    return this.convertUnitsService.roundVal(val, digits);
  }
}
