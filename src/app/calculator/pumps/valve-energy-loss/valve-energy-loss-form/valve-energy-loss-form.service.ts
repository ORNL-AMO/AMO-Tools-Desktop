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
      'downstreamPressure': [inputs.downstreamPressure, [Validators.required, Validators.min(0), Validators.max(inputs.upstreamDiameter)]],
      'downstreamDiameter': [inputs.downstreamDiameter],
      'downstreamHeight': [inputs.downstreamHeight, Validators.required],
      'pipeSizeFactor': [inputs.pipeSizeFactor],
    });
    return formGroup;
  }

  getObjFromForm(formGroup: UntypedFormGroup): ValveEnergyLossInputs {
    let inputs: ValveEnergyLossInputs = {
      hoursOperation: formGroup['hoursOperation'].value,
      electricalRate: formGroup['electricalRate'].value,
      efficiencyPump: formGroup['efficiencyPump'].value,
      efficiencyMotor: formGroup['efficiencyMotor'].value,
      SG: formGroup['SG'].value,
      flowRate: formGroup['flowRate'].value,
      upstreamPressure: formGroup['upstreamPressure'].value,
      upstreamDiameter: formGroup['upstreamDiameter'].value,
      upstreamHeight: formGroup['upstreamHeight'].value,
      valveDiameter: formGroup['valveDiameter'].value,
      downstreamPressure: formGroup['downstreamPressure'].value,
      downstreamDiameter: formGroup['downstreamDiameter'].value,
      downstreamHeight: formGroup['downstreamHeight'].value,
      pipeSizeFactor: formGroup['pipeSizeFactor'].value,
    };
    return inputs;
  }


}
