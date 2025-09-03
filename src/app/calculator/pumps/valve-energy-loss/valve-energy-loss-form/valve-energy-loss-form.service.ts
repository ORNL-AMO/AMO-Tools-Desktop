import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ValveEnergyLossInputs } from '../../../../shared/models/calculators';

@Injectable()
export class ValveEnergyLossFormService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  initForm(): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'hoursOperation': [0],
      'electricalRate': [0],
      'efficiencyPump': [0],
      'efficiencyMotor': [0],
      'SG': [0],
      'flowRate': [0],
      'upstreamPressure': [0],
      'upstreamDiameter': [0],
      'upstreamHeight': [0],
      'valveDiameter': [0],
      'downstreamPressure': [0],
      'downstreamDiameter': [0],
      'downstreamHeight': [0],
      'pipeSizeFactor': [0],
    });
    return formGroup;
  }


  getFormFromObj(inputs: ValveEnergyLossInputs): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'hoursOperation': [inputs.hoursOperation],
      'electricalRate': [inputs.electricalRate],
      'efficiencyPump': [inputs.efficiencyPump],
      'efficiencyMotor': [inputs.efficiencyMotor],
      'SG': [inputs.SG],
      'flowRate': [inputs.flowRate],
      'upstreamPressure': [inputs.upstreamPressure],
      'upstreamDiameter': [inputs.upstreamDiameter],
      'upstreamHeight': [inputs.upstreamHeight],
      'valveDiameter': [inputs.valveDiameter],
      'downstreamPressure': [inputs.downstreamPressure],
      'downstreamDiameter': [inputs.downstreamDiameter],
      'downstreamHeight': [inputs.downstreamHeight],
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
