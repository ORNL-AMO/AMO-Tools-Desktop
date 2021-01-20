import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StatePointAnalysisInput } from '../../../shared/models/waste-water';

@Injectable()
export class StatePointAnalysisFormService {

  constructor(private formBuilder: FormBuilder) { }

  getEmptyForm(): FormGroup {
    let formGroup: FormGroup = this.formBuilder.group({
      sviValue: [0, [Validators.required, Validators.min(0)]],
      sviParameter: [1, [Validators.required, Validators.min(0)]],
      numberOfClarifiers: [0, [Validators.required, Validators.min(0)]],
      areaOfClarifier: [0, [Validators.required, Validators.min(0)]],
      MLSS: [0, [Validators.required, Validators.min(0)]],
      influentFlow: [0, [Validators.required, Validators.min(0)]],
      rasFlow: [0, [Validators.required, Validators.min(0)]],
      sludgeSettlingVelocity: [1, [Validators.required, Validators.min(0)]],
    });
    return formGroup;
  }

  getFormFromInput(input: StatePointAnalysisInput): FormGroup {
    let formGroup: FormGroup = this.formBuilder.group({
      sviValue: [input.sviValue, [Validators.required, Validators.min(0)]],
      sviParameter: [input.sviParameter, [Validators.required, Validators.min(0)]],
      numberOfClarifiers: [input.numberOfClarifiers, [Validators.required, Validators.min(0)]],
      areaOfClarifier: [input.areaOfClarifier, [Validators.required, Validators.min(0)]],
      MLSS: [input.MLSS, [Validators.required, Validators.min(0)]],
      influentFlow: [input.influentFlow, [Validators.required, Validators.min(0)]],
      rasFlow: [input.rasFlow, [Validators.required, Validators.min(0)]],
      sludgeSettlingVelocity: [input.sludgeSettlingVelocity, [Validators.required, Validators.min(0)]],
    });
    return formGroup;
  }

  
  getInputFromForm(form: FormGroup): StatePointAnalysisInput {
    let input: StatePointAnalysisInput = {
      sviValue: form.controls.sviValue.value,
      sviParameter: form.controls.sviParameter.value,
      numberOfClarifiers: form.controls.numberOfClarifiers.value,
      areaOfClarifier: form.controls.areaOfClarifier.value,
      MLSS: form.controls.MLSS.value,
      influentFlow: form.controls.influentFlow.value,
      rasFlow: form.controls.rasFlow.value,
      sludgeSettlingVelocity: form.controls.sludgeSettlingVelocity.value,
    };
    return input;
  }
}
