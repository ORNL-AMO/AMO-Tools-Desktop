import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PsatService } from '../../../psat/psat.service';
import { FanMotor } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class FullLoadAmpsService {

  fullLoadAmpsInputs: BehaviorSubject<FanMotor>;
  fullLoadAmpsResult: BehaviorSubject<number>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  constructor(private formBuilder: FormBuilder, private psatService: PsatService) { 
    // Behavior subjects must be instantiated with some value
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.fullLoadAmpsInputs = new BehaviorSubject<FanMotor>(undefined);
    this.fullLoadAmpsResult = new BehaviorSubject<number>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
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
      fullLoadAmps: undefined,
    };
    return obj;
  }

  isFanMotorValid(obj: FanMotor): boolean {
    let form: FormGroup = this.getFormFromObj(obj);
    return form.valid;
  }

  estimateFullLoadAmps(settings: Settings) {
    let flaInput = this.fullLoadAmpsInputs.getValue();
    let tmpEfficiency: number;
    
    if (flaInput.efficiencyClass !== 3) {
      tmpEfficiency = flaInput.efficiencyClass;
    } else {
      tmpEfficiency = flaInput.specifiedEfficiency;
    }

    // TODO 
    let fullLoadAmpsResult = this.psatService.estFLA(
      flaInput.motorRatedPower,
      flaInput.motorRpm,
      flaInput.lineFrequency,
      flaInput.efficiencyClass,
      tmpEfficiency,
      flaInput.motorRatedVoltage,
      settings
    );

    this.fullLoadAmpsResult.next(fullLoadAmpsResult);
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

    // TODO Do we need to convert the example?
    this.fullLoadAmpsInputs.next(defaultData);
  }

  initDefualtEmptyInputs(settings: Settings){
    let emptyInput: FanMotor = {
      lineFrequency: 50,
      motorRatedPower: 0,
      motorRpm: 0,
      efficiencyClass: 0,
      specifiedEfficiency: 0,
      motorRatedVoltage: 0,
      fullLoadAmps: 0
    };
    this.fullLoadAmpsInputs.next(emptyInput);
  }

  initDefualtEmptyOutputs(){
    this.fullLoadAmpsResult.next(undefined);
  }
  
}
