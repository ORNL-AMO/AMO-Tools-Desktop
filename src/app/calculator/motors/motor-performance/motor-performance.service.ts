import { Injectable } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PsatService } from '../../../psat/psat.service';

@Injectable()
export class MotorPerformanceService {
  motorPerformanceInputs: MotorPerformanceInputs;
  constructor(private formBuilder: FormBuilder, private psatService: PsatService) { }

  initFormFromPsat(psat: PSAT):FormGroup{
    return this.formBuilder.group({
      frequency: [this.psatService.getLineFreqFromEnum(psat.inputs.line_frequency), [Validators.required]],
      horsePower: [psat.inputs.motor_rated_power.toString(), [Validators.required]],
      motorRPM: [psat.inputs.motor_rated_speed, [Validators.required]],
      efficiencyClass: [this.psatService.getEfficiencyClassFromEnum(psat.inputs.efficiency_class), [Validators.required]],
      motorVoltage: [psat.inputs.motor_rated_voltage, [Validators.required]],
      fullLoadAmps: [psat.inputs.motor_rated_fla, [Validators.required]],
      sizeMargin: [psat.inputs.margin, [Validators.required]],
      efficiency: [psat.inputs.efficiency, [Validators.min(0), Validators.max(100)]]
    });
  }

  initForm():FormGroup{
   return this.formBuilder.group({
      frequency: [this.psatService.getLineFreqFromEnum(0), [Validators.required]],
      horsePower: ['200', [Validators.required]],
      motorRPM: [1780, [Validators.required]],
      efficiencyClass: [this.psatService.getEfficiencyClassFromEnum(1), [Validators.required]],
      motorVoltage: [460, [Validators.required]],
      fullLoadAmps: [225.4, [Validators.required]],
      sizeMargin: [1, [Validators.required]],
      efficiency: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  initFormFromObj(inputs: MotorPerformanceInputs):FormGroup{
    return this.formBuilder.group({
      frequency: [inputs.frequency, [Validators.required]],
      horsePower: [inputs.horsePower, [Validators.required]],
      motorRPM: [inputs.motorRPM, [Validators.required]],
      efficiencyClass: [inputs.efficiencyClass, [Validators.required]],
      motorVoltage: [inputs.motorVoltage, [Validators.required]],
      fullLoadAmps: [inputs.fullLoadAmps, [Validators.required]],
      sizeMargin: [inputs.sizeMargin, [Validators.required]],
      efficiency: [inputs.efficiency, [Validators.min(0), Validators.max(100)]]
    })
  }

  getObjFromForm(form: FormGroup): MotorPerformanceInputs{
    return {
      frequency: form.controls.frequency.value,
      horsePower: form.controls.horsePower.value,
      motorRPM: form.controls.motorRPM.value,
      efficiencyClass: form.controls.efficiencyClass.value,
      motorVoltage: form.controls.motorVoltage.value,
      fullLoadAmps: form.controls.fullLoadAmps.value,
      sizeMargin: form.controls.sizeMargin.value,
      efficiency: form.controls.efficiency.value,
    }
  }
}


export interface MotorPerformanceInputs{
  frequency: string,
  horsePower: string,
  motorRPM: number,
  efficiencyClass: string,
  motorVoltage: number,
  fullLoadAmps: number,
  sizeMargin: number,
  efficiency: number,
}