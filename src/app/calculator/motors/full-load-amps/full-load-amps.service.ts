import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PsatService } from '../../../psat/psat.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FanMotor } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class FullLoadAmpsService {

  fullLoadAmpsInputs: BehaviorSubject<FanMotor>;
  fullLoadAmpsResult: BehaviorSubject<number>;
  resetData: BehaviorSubject<boolean>;
  generateExample: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;

  constructor(private formBuilder: FormBuilder, private psatService: PsatService, private convertUnitsService: ConvertUnitsService) {
    this.resetData = new BehaviorSubject<boolean>(undefined);
    this.fullLoadAmpsInputs = new BehaviorSubject<FanMotor>(undefined);
    this.fullLoadAmpsResult = new BehaviorSubject<number>(undefined);
    this.generateExample = new BehaviorSubject<boolean>(undefined);
    this.currentField = new BehaviorSubject<string>('default');
  }

  getFormFromObj(obj: FanMotor): FormGroup {
    let specifiedEfficiencyValidators: Array<ValidatorFn> = this.getEfficiencyValidators(obj.efficiencyClass);
    let form: FormGroup = this.formBuilder.group({
      lineFrequency: [obj.lineFrequency, Validators.required],
      motorRatedPower: [obj.motorRatedPower, Validators.required],
      motorRpm: [obj.motorRpm, Validators.required],
      efficiencyClass: [obj.efficiencyClass, Validators.required],
      specifiedEfficiency: [obj.specifiedEfficiency, specifiedEfficiencyValidators],
      motorRatedVoltage: [obj.motorRatedVoltage, Validators.required],
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

  changeEfficiencyClass(form: FormGroup) {
    let tmpEfficiencyValidators: Array<ValidatorFn> = this.getEfficiencyValidators(form.controls.efficiencyClass.value);
    form.controls.efficiencyClass.setValidators(tmpEfficiencyValidators);
    form.controls.efficiencyClass.reset(form.controls.efficiencyClass.value);
    form.controls.efficiencyClass.markAsDirty();
    return form;
  }


  roundVal(val: number, digits: number) {
    return Number(val.toFixed(digits))
  }

  generateExampleData(settings: Settings) {
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

  initDefualtEmptyInputs(settings: Settings) {
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

  initDefualtEmptyOutputs() {
    this.fullLoadAmpsResult.next(undefined);
  }


  checkMotorWarnings(motor: FanMotor, settings: Settings): FLAMotorWarnings {
    let efficiencyError: string = null;
    if (motor.efficiencyClass === 3) {
      efficiencyError = this.checkEfficiency(motor);
    }
    let warnings: FLAMotorWarnings ={
      rpmError: this.checkMotorRpm(motor),
      voltageError: this.checkMotorVoltage(motor),
      flaError: this.checkFLA(motor, settings),
      efficiencyError: efficiencyError,
      ratedPowerError: this.checkRatedPower(motor, settings)
    };

    return warnings;
  }

  checkEfficiency(motor: FanMotor) {
    if (motor.specifiedEfficiency) {
      if (motor.specifiedEfficiency > 100) {
        return "Unrealistic efficiency, cannot be greater than 100%";
      }
      else if (motor.specifiedEfficiency === 0) {
        return "Cannot have 0% efficiency";
      }
      else if (motor.specifiedEfficiency < 0) {
        return "Cannot have negative efficiency";
      } else {
        return null;
      }
    }
    else {
      return null;
    }
  }

  checkMotorVoltage(motor: FanMotor) {
    if (motor.motorRatedVoltage < 208) {
      return "Voltage must be greater than 208";
    } else if (motor.motorRatedVoltage > 15180) {
      return "Voltage must be less than 15,180";
    } else {
      return null;
    }
  }

  checkMotorRpm(motor: FanMotor) {
    let range: { min: number, max: number } = this.getMotorRpmMinMax(motor.lineFrequency, motor.efficiencyClass);
    if (motor.motorRpm < range.min) {
      return 'Motor RPM too small for selected efficiency class';
    } else if (motor.motorRpm > range.max) {
      return 'Motor RPM too large for selected efficiency class';
    } else {
      return null;
    }
  }

  getMotorRpmMinMax(lineFreqEnum: number, effClass: number): { min: number, max: number } {
    let rpmRange = {
      min: 1,
      max: 3600
    };
    if (lineFreqEnum === 0 && (effClass === 0 || effClass === 1)) { // if 60Hz and Standard or Energy Efficiency
      rpmRange.min = 540;
      rpmRange.max = 3600;
    } else if (lineFreqEnum === 1 && (effClass === 0 || effClass === 1)) { // if 50Hz and Standard or Energy Efficiency
      rpmRange.min = 450;
      rpmRange.max = 3300;
    } else if (lineFreqEnum === 0 && effClass === 2) { // if 60Hz and Premium Efficiency
      rpmRange.min = 1080;
      rpmRange.max = 3600;
    } else if (lineFreqEnum === 1 && effClass === 2) { // if 50Hz and Premium Efficiency
      rpmRange.min = 900;
      rpmRange.max = 3000;
    }
    return rpmRange;
  }

  checkFLA(motor: FanMotor, settings: Settings) {
    if (
      motor.motorRatedPower &&
      motor.motorRpm &&
      motor.lineFrequency &&
      motor.efficiencyClass &&
      motor.motorRatedVoltage
    ) {
      if (!motor.specifiedEfficiency) {
        motor.specifiedEfficiency = motor.efficiencyClass;
      }
      let estEfficiency = this.psatService.estFLA(
        motor.motorRatedPower,
        motor.motorRpm,
        motor.lineFrequency,
        motor.efficiencyClass,
        motor.specifiedEfficiency,
        motor.motorRatedVoltage,
        settings
      );

      // Keep - may use min/max in the future
      // let flaMax = estEfficiency * 1.05;
      // let flaMin = estEfficiency * .95;
      // if (fsat.fanMotor.fullLoadAmps < flaMin) {
      //   return 'Value should be greater than ' + Math.round(flaMin) + ' A';
      // } else if (fsat.fanMotor.fullLoadAmps > flaMax) {
      //   return 'Value should be less than ' + Math.round(flaMax) + ' A';
      // } else {
      // return null;

      let limit = .05;
      let percentDifference = Math.abs(motor.fullLoadAmps - estEfficiency) / estEfficiency;
      if (percentDifference > limit) {
        return `Value is greater than ${limit * 100}% different from estimated FLA (${Math.round(estEfficiency)} A). Consider using the 'Estimate Full-Load Amps' button.`;
      }
      return null;
    } else {
      return null;
    }
  }

  checkRatedPower(motor: FanMotor, settings: Settings) {
    let tmpVal = motor.motorRatedPower;
    let min: number = 5;
    let max: number = 10000;
    if (tmpVal < this.convertUnitsService.value(min).from('hp').to(settings.fanPowerMeasurement)) {
      return 'Rated motor power is too small.';
    } else if (tmpVal > this.convertUnitsService.value(max).from('hp').to(settings.fanPowerMeasurement)) {
      return 'Rated motor power is too large.';
    } else {
      return null;
    }
  }

}

export interface FLAMotorWarnings {
  rpmError: string;
  voltageError: string;
  flaError: string;
  efficiencyError: string;
  ratedPowerError: string;
}
