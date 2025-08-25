import { Injectable } from '@angular/core';
import { SuiteDbMotor } from '../shared/models/materials';
import { SuiteApiHelperService } from './suite-api-helper.service';
declare var Module: any;

@Injectable({
  providedIn: 'root'
})
export class MotorDataApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService
  ) { }

  getMotors(): Array<SuiteDbMotor> {
    let DefaultData = new Module.DefaultData();
    let suiteDefaultMaterials = DefaultData.getMotorData();

    let defaultMotors: Array<SuiteDbMotor> = [];
    for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
      let wasmClass = suiteDefaultMaterials.get(i);
      let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(wasmClass);
      defaultMotors.push(suiteDbMotor);
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
    return defaultMotors;
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
}
