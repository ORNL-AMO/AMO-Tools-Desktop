import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ValveEnergyLossInputs } from '../../../../shared/models/calculators';

@Injectable()
export class ValveEnergyLossFormService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  initForm(): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'hoursOperation': [0, [Validators.required, Validators.min(0), Validators.max(8760)]],
      'electricalRate': [0, [Validators.required, Validators.min(0)]],
      'efficiencyPump': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'efficiencyMotor': [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      'SG': [0, [Validators.required, Validators.max(7), Validators.min(0.9999)]],
      'flowRate': [0, [Validators.required, Validators.min(0)]],
      'upstreamPressure': [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
      'upstreamDiameter': [0],
      'upstreamHeight': [0, Validators.required],
      'valveDiameter': [0],
      'downstreamPressure': [0, [Validators.required, Validators.min(0), Validators.max(1000)]],
      'downstreamDiameter': [0],
      'downstreamHeight': [0, Validators.required],
      'pipeSizeFactor': [0],
    });
    return formGroup;
  }


  getFormFromObj(inputs: ValveEnergyLossInputs): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'hoursOperation': [inputs.hoursOperation, [Validators.required, Validators.min(0), Validators.max(8760)]],
      'electricalRate': [inputs.electricalRate, [Validators.required, Validators.min(0)]],
      'efficiencyPump': [inputs.efficiencyPump, [Validators.required, Validators.min(0), Validators.max(100)]],
      'efficiencyMotor': [inputs.efficiencyMotor, [Validators.required, Validators.min(0), Validators.max(100)]],
      'SG': [inputs.SG, [Validators.required, Validators.max(7), Validators.min(0.9999)]],
      'flowRate': [inputs.flowRate, [Validators.required, Validators.min(0)]],
      'upstreamPressure': [inputs.upstreamPressure, [Validators.required, Validators.min(0), Validators.max(1000)]],
      'upstreamDiameter': [inputs.upstreamDiameter],
      'upstreamHeight': [inputs.upstreamHeight, Validators.required],
      'valveDiameter': [inputs.valveDiameter],
      'downstreamPressure': [inputs.downstreamPressure, [Validators.required, Validators.min(0), Validators.max(inputs.upstreamPressure)]],
      'downstreamDiameter': [inputs.downstreamDiameter],
      'downstreamHeight': [inputs.downstreamHeight, Validators.required],
      'pipeSizeFactor': [inputs.pipeSizeFactor],
    });
    return formGroup;
  }

  getObjFromForm(form: UntypedFormGroup): ValveEnergyLossInputs {
    let inputs: ValveEnergyLossInputs = {
      hoursOperation: form.controls.hoursOperation.value,
      electricalRate: form.controls.electricalRate.value,
      efficiencyPump: form.controls.efficiencyPump.value,
      efficiencyMotor: form.controls.efficiencyMotor.value,
      SG: form.controls.SG.value,
      flowRate: form.controls.flowRate.value,
      upstreamPressure: form.controls.upstreamPressure.value,
      upstreamDiameter: form.controls.upstreamDiameter.value,
      upstreamHeight: form.controls.upstreamHeight.value,
      valveDiameter: form.controls.valveDiameter.value,
      downstreamPressure: form.controls.downstreamPressure.value,
      downstreamDiameter: form.controls.downstreamDiameter.value,
      downstreamHeight: form.controls.downstreamHeight.value,
      pipeSizeFactor: form.controls.pipeSizeFactor.value,
    };
    return inputs;
  }

  setValidators(formGroup: UntypedFormGroup): UntypedFormGroup {
    formGroup.controls.downstreamPressure.setValidators([Validators.required, Validators.min(0), Validators.max(formGroup.controls.upstreamPressure.value)]);
    formGroup.controls.downstreamPressure.updateValueAndValidity();
    return formGroup;
  }


}
