import { Injectable } from '@angular/core';
import { PsatInputs } from '../../shared/models/psat';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ValidatorFn } from '@angular/forms';

@Injectable()
export class PumpFluidService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromObj(psatInputs: PsatInputs): UntypedFormGroup {
    let specifiedPumpEfficiencyValidators: Array<ValidatorFn> = this.getSpecifiedPumpEfficiencyValidators(psatInputs.pump_style);
    let specifiedDriveEfficiencyValidators: Array<ValidatorFn> = this.getSpecifiedDriveEfficiency(psatInputs.drive);
    let form: UntypedFormGroup = this.formBuilder.group({
      pumpType: [psatInputs.pump_style, Validators.required],
      specifiedPumpEfficiency: [psatInputs.pump_specified, specifiedPumpEfficiencyValidators],
      pumpRPM: [psatInputs.pump_rated_speed, Validators.required],
      drive: [psatInputs.drive, Validators.required],
      specifiedDriveEfficiency: [psatInputs.specifiedDriveEfficiency, specifiedDriveEfficiencyValidators],
      fluidType: [psatInputs.fluidType, Validators.required],
      fluidTemperature: [psatInputs.fluidTemperature, Validators.required],
      gravity: [psatInputs.specific_gravity, [Validators.required, Validators.min(0)]],
      viscosity: [psatInputs.kinematic_viscosity, [Validators.required, Validators.min(0)]],
      stages: [psatInputs.stages, [Validators.required, Validators.min(1)]]
    })
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getSpecifiedPumpEfficiencyValidators(pumpStyle: number): Array<ValidatorFn> {
    if (pumpStyle == 11) {
      return [Validators.required, Validators.min(0), Validators.max(100)];
    } else {
      return [];
    }
  }

  getSpecifiedDriveEfficiency(driveType: number): Array<ValidatorFn> {
    if (driveType == 4) {
      return [Validators.required, Validators.min(0), Validators.max(100)];
    } else {
      return [];
    }
  }

  updateSpecifiedPumpEfficiency(form: UntypedFormGroup): UntypedFormGroup {
    let specifiedPumpEfficiencyValidators: Array<ValidatorFn> = this.getSpecifiedPumpEfficiencyValidators(form.controls.pumpType.value);
    form.controls.specifiedPumpEfficiency.setValidators(specifiedPumpEfficiencyValidators);
    form.controls.specifiedPumpEfficiency.reset(form.controls.specifiedPumpEfficiency.value);
    if (form.controls.specifiedPumpEfficiency.value) {
      form.controls.specifiedPumpEfficiency.markAsDirty();
    }
    return form;
  }

  updateSpecifiedDriveEfficiency(form: UntypedFormGroup): UntypedFormGroup {
    let specifiedDriveEfficiencyValidators: Array<ValidatorFn> = this.getSpecifiedDriveEfficiency(form.controls.drive.value);
    form.controls.specifiedDriveEfficiency.setValidators(specifiedDriveEfficiencyValidators);
    form.controls.specifiedDriveEfficiency.reset(form.controls.specifiedDriveEfficiency.value);
    if (form.controls.specifiedDriveEfficiency.value) {
      form.controls.specifiedDriveEfficiency.markAsDirty();
    }
    return form;
  }

  getPsatInputsFromForm(form: UntypedFormGroup, psatInputs: PsatInputs): PsatInputs {
    psatInputs.pump_style = form.controls.pumpType.value;
    psatInputs.pump_specified = form.controls.specifiedPumpEfficiency.value;
    psatInputs.pump_rated_speed = form.controls.pumpRPM.value;
    psatInputs.drive = form.controls.drive.value;
    psatInputs.specifiedDriveEfficiency = form.controls.specifiedDriveEfficiency.value;
    psatInputs.fluidType = form.controls.fluidType.value;
    psatInputs.fluidTemperature = form.controls.fluidTemperature.value;
    psatInputs.specific_gravity = form.controls.gravity.value;
    psatInputs.kinematic_viscosity = form.controls.viscosity.value;
    psatInputs.stages = form.controls.stages.value;
    return psatInputs;

  }
}
