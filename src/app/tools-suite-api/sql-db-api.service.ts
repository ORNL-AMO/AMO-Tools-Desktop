import { Injectable } from '@angular/core';
import { SuiteDbMotor } from '../shared/models/materials';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
declare var dbInstance: any;
@Injectable()
export class SqlDbApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService
  ) { }

  selectMotors(): Array<SuiteDbMotor> {
    try {
      let suiteDbMotors: Array<SuiteDbMotor> = new Array();
      let items = dbInstance.getMotorData();
      for (let index = 0; index < items.size(); index++) {
        let suiteDbMotorPointer = items.get(index);
        let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(suiteDbMotorPointer);
        suiteDbMotors.push(suiteDbMotor);
        suiteDbMotorPointer.delete();
      }
      items.delete();
      return suiteDbMotors;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getSuiteDbMotorFromWASM(suiteDbMotorPointer): SuiteDbMotor {
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyFromSuiteEnumValue(suiteDbMotorPointer.getLineFrequency().value);
    let efficiencyClass = suiteDbMotorPointer.getEfficiencyClass().value;

    let suiteDbMotor = {
      id: suiteDbMotorPointer.getId(),
      catalog: suiteDbMotorPointer.getCatalog(),
      efficiencyClass: efficiencyClass,
      hp: suiteDbMotorPointer.getHp(),
      lineFrequency: lineFrequency,
      enclosureType: suiteDbMotorPointer.getEnclosureType(),
      nemaTable: suiteDbMotorPointer.getNemaTable(),
      nominalEfficiency: suiteDbMotorPointer.getNominalEfficiency(),
      poles: suiteDbMotorPointer.getPoles(),
      synchronousSpeed: suiteDbMotorPointer.getSynchronousSpeed(),
      voltageLimit: suiteDbMotorPointer.getVoltageLimit()
    };

    return suiteDbMotor;
  }


  selectMotorById(id: number): SuiteDbMotor {
    try {
      let suiteDbMotorPointer = dbInstance.getMotorDataById(id);
      let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(suiteDbMotorPointer);
      suiteDbMotorPointer.delete();
      return suiteDbMotor;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertMotor(motor: SuiteDbMotor): boolean {
    try {
      let MotorData = this.getMotorData(motor);
      dbInstance.insertMotorData(MotorData);
      MotorData.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateMotor(motor: SuiteDbMotor): boolean {
    try {
      let MotorData = this.getMotorData(motor);
      dbInstance.updateMotorData(MotorData);
      MotorData.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getMotorData(motor: SuiteDbMotor) {
    let efficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(motor.efficiencyClass);
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(motor.lineFrequency);
    let MotorData = new Module.MotorData(
      motor.hp,
      motor.synchronousSpeed,
      motor.poles,
      motor.nominalEfficiency,
      efficiencyClass,
      motor.nemaTable,
      motor.enclosureType,
      lineFrequency,
      motor.voltageLimit,
      motor.catalog

    );
    if (motor.id !== undefined) {
      MotorData.setId(motor.id);
    }
    return MotorData;
  }

  deleteMotor(id: number): boolean {
    try {
      let success = dbInstance.deleteMotorData(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
