import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FanMotor } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
declare var psatAddon: any;

@Injectable()
export class FullLoadAmpsService {

  fullLoadAmpsInputs: BehaviorSubject<FanMotor>;
  fullLoadAmpsOutputs: BehaviorSubject<FanMotor>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.fullLoadAmpsInputs = new BehaviorSubject<FanMotor>(undefined);
    this.fullLoadAmpsOutputs = new BehaviorSubject<FanMotor>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>('default');
   }

  getFormFromObj(obj: FanMotor): FormGroup {
    let specifiedEfficiencyValidators: Array<ValidatorFn> = this.getEfficiencyValidators(obj.efficiencyClass);
    let form: FormGroup = this.formBuilder.group({
      lineFrequency: [obj.lineFrequency],
      motorRatedPower: [obj.motorRatedPower],
      motorRpm: [obj.motorRpm],
      efficiencyClass: [obj.efficiencyClass],
      specifiedEfficiency: [obj.specifiedEfficiency, specifiedEfficiencyValidators],
      motorRatedVoltage: [obj.motorRatedVoltage],
      fullLoadAmps: [obj.fullLoadAmps]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }


  getEfficiencyValidators(effClass: number): Array<ValidatorFn> {
    if (effClass === 3) {
      return [Validators.required, Validators.min(0), Validators.max(100)];
    } else {
      return [];
    }
  }

  getObjFromForm(form: FormGroup): FanMotor {
    let obj: FanMotor = {
      lineFrequency: form.controls.lineFrequency.value,
      motorRatedPower: form.controls.motorRatedPower.value,
      motorRpm: form.controls.motorRpm.value,
      efficiencyClass: form.controls.efficiencyClass.value,
      specifiedEfficiency: form.controls.specifiedEfficiency.value,
      motorRatedVoltage: form.controls.motorRatedVoltage.value,
      fullLoadAmps: form.controls.fullLoadAmps.value
    };
    return obj;
  }

  isFanMotorValid(obj: FanMotor): boolean {
    let form: FormGroup = this.getFormFromObj(obj);
    return form.valid;
  }

  estFLA(
    horsePower: number,
    motorRPM: number,
    frequency: number,
    efficiencyClass: number,
    efficiency: number,
    motorVoltage: number,
    settings: Settings
  ) {
    if (settings.powerMeasurement != 'hp') {
      // horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
    if (motorRPM > 0) {
      let inputs: any = {
        motor_rated_power: horsePower,
        motor_rated_speed: motorRPM,
        line_frequency: frequency,
        efficiency_class: efficiencyClass,
        efficiency: efficiency,
        motor_rated_voltage: motorVoltage
      }
      return this.roundVal(psatAddon.estFLA(inputs), 2);
    } else {
      return 0;
    }

  }
  roundVal(val: number, digits: number) {
    return Number(val.toFixed(digits))
  }

  generateExampleData(settings: Settings){
    let defaultData: FanMotor = {
      lineFrequency: 60,
      motorRatedPower: 600,
      motorRpm: 1180,
      efficiencyClass: 1,
      specifiedEfficiency: 100,
      motorRatedVoltage: 470,
      fullLoadAmps: 683.25
    };
    this.fullLoadAmpsInputs.next(defaultData);
  }

  initDefualtEmptyInputs(settings: Settings){
    let emptyInput = this.getFLAEmptyInputs(settings);
    this.fullLoadAmpsInputs.next(emptyInput);
  }

  initDefualtEmptyOutputs(){

  }

  getFLAEmptyInputs(settings: Settings){
    let emptyInput: FanMotor = {
      lineFrequency: 50,
      motorRatedPower: 0,
      motorRpm: 0,
      efficiencyClass: 0,
      specifiedEfficiency: 0,
      motorRatedVoltage: 0,
      fullLoadAmps: 0
    };
    return emptyInput;
  }
  
}
