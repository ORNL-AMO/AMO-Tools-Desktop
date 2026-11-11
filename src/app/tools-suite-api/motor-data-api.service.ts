import { Injectable } from '@angular/core';
import { SuiteDbMotor } from '../shared/models/materials';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { type DefaultData, type MotorData, type MotorDataV } from 'measur-tools-suite';

@Injectable({
  providedIn: 'root'
})
export class MotorDataApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  getMotors(): Array<SuiteDbMotor> {
    let DefaultData: DefaultData = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
    let suiteDefaultMaterials: MotorDataV = DefaultData.getMotorData();

    let defaultMotors: Array<SuiteDbMotor> = [];
    for (let i: number = 0; i < suiteDefaultMaterials.size(); i++) {
      let wasmClass: MotorData = suiteDefaultMaterials.get(i);
      let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(wasmClass);
      defaultMotors.push(suiteDbMotor);
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
    return defaultMotors;
  }

  getSuiteDbMotorFromWASM(suiteDbMotorPointer: MotorData): SuiteDbMotor {
    let lineFrequency: number = this.suiteApiHelperService.getLineFrequencyFromSuiteEnumValue(suiteDbMotorPointer.getLineFrequency());
    let efficiencyClass: number = suiteDbMotorPointer.getEfficiencyClass();

    let suiteDbMotor: SuiteDbMotor = {
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
