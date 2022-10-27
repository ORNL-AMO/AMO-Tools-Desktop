import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PSAT } from '../../../shared/models/psat';
import { FSAT } from '../../../shared/models/fans';

@Injectable()
export class NemaEnergyEfficiencyService {
  nemaInputs: NemaInputs;
  constructor(private formBuilder: UntypedFormBuilder) { }

  initForm(): UntypedFormGroup {
    return this.formBuilder.group({
      frequency: [60, [Validators.required]],
      horsePower: [200, [Validators.required]],
      efficiencyClass: [0, [Validators.required]],
      motorRPM: [1200, [Validators.required]],
      efficiency: ['', [Validators.min(1), Validators.max(100)]]
    });
  }
  resetForm(): UntypedFormGroup {
    return this.formBuilder.group({
      frequency: [60, [Validators.required]],
      horsePower: [0, [Validators.required]],
      efficiencyClass: [0, [Validators.required]],
      motorRPM: [0, [Validators.required]],
      efficiency: ['', [Validators.min(1), Validators.max(100)]]
    });
  }

  initFormFromPsat(psat: PSAT): UntypedFormGroup {
    return this.formBuilder.group({
      frequency: [psat.inputs.line_frequency, [Validators.required]],
      horsePower: [psat.inputs.motor_rated_power, [Validators.required, Validators.min(0)]],
      efficiencyClass: [psat.inputs.efficiency_class, [Validators.required]],
      motorRPM: [psat.inputs.motor_rated_speed, [Validators.required]],
      efficiency: [psat.inputs.efficiency, [Validators.min(1), Validators.max(100)]]
    });
  }

  initFormFromFsat(fsat: FSAT): UntypedFormGroup {
    return this.formBuilder.group({
      frequency: [fsat.fanMotor.lineFrequency, [Validators.required]],
      horsePower: [fsat.fanMotor.motorRatedPower, [Validators.required, Validators.min(0)]],
      efficiencyClass: [fsat.fanMotor.efficiencyClass, [Validators.required]],
      motorRPM: [fsat.fanMotor.motorRpm, [Validators.required]],
      efficiency: [fsat.fanMotor.specifiedEfficiency, [Validators.min(1), Validators.max(100)]]
    });
  }

  initFormFromObj(obj: NemaInputs): UntypedFormGroup {
    return this.formBuilder.group({
      frequency: [obj.frequency, [Validators.required]],
      horsePower: [obj.horsePower, [Validators.required]],
      efficiencyClass: [obj.efficiencyClass, [Validators.required]],
      motorRPM: [obj.motorRPM, [Validators.required]],
      efficiency: [obj.efficiency, [Validators.min(1), Validators.max(100)]]
    });
  }

  getObjFromForm(form: UntypedFormGroup): NemaInputs {
    return {
      frequency: form.controls.frequency.value,
      horsePower: form.controls.horsePower.value,
      efficiencyClass: form.controls.efficiencyClass.value,
      motorRPM: form.controls.motorRPM.value,
      efficiency: form.controls.efficiency.value
    };
  }
}

export interface NemaInputs {
  frequency: number;
  horsePower: number;
  efficiencyClass: number;
  motorRPM: number;
  efficiency: number;
}
