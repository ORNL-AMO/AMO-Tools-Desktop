import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { StatePointAnalysisInput } from '../../../shared/models/waste-water';

@Injectable()
export class StatePointAnalysisFormService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getEmptyForm(): UntypedFormGroup {
    let formGroup: UntypedFormGroup = this.formBuilder.group({
      sviValue: [0, [Validators.required, Validators.min(0)]],
      sviParameter: [1, [Validators.required, Validators.min(0)]],
      numberOfClarifiers: [0, [Validators.required, Validators.min(0)]],
      areaOfClarifier: [0, [Validators.required, Validators.min(0)]],
      diameter: [0, [Validators.required, Validators.min(0)]],
      isUserDefinedArea: [true],
      MLSS: [0, [Validators.required, Validators.min(0)]],
      influentFlow: [0, [Validators.required, Validators.min(0)]],
      rasFlow: [0, [Validators.required, Validators.min(0)]],
      sludgeSettlingVelocity: [1, [Validators.required, Validators.min(0)]],
    });
    return formGroup;
  }

  getFormFromInput(input: StatePointAnalysisInput, updatedBaselineInput?: StatePointAnalysisInput): UntypedFormGroup {
    let sviValue: number = input.sviValue;
    let sviParameter: number = input.sviParameter;
    let numberOfClarifiers: number = input.numberOfClarifiers;
    let areaOfClarifier: number = input.areaOfClarifier;
    let diameter: number = input.diameter;
    let isUserDefinedArea: boolean = input.isUserDefinedArea;
    let mlss: number = input.MLSS;
    let sludgeSettlingVelocity: number = input.sludgeSettlingVelocity;

    if (updatedBaselineInput) {
      sviValue = updatedBaselineInput.sviValue;
      sviParameter = updatedBaselineInput.sviParameter;
      numberOfClarifiers = updatedBaselineInput.numberOfClarifiers;
      areaOfClarifier = updatedBaselineInput.areaOfClarifier;
      diameter = updatedBaselineInput.diameter;
      isUserDefinedArea = updatedBaselineInput.isUserDefinedArea;
      mlss = updatedBaselineInput.MLSS;
      sludgeSettlingVelocity = updatedBaselineInput.sludgeSettlingVelocity;
    }

    let formGroup: UntypedFormGroup = this.formBuilder.group({
      sviValue: [sviValue, [Validators.required, Validators.min(0)]],
      sviParameter: [sviParameter, [Validators.required, Validators.min(0)]],
      numberOfClarifiers: [numberOfClarifiers, [Validators.required, Validators.min(0)]],
      areaOfClarifier: [areaOfClarifier, [Validators.required, Validators.min(0)]],
      diameter: [diameter, [Validators.required, Validators.min(0)]],
      isUserDefinedArea: [isUserDefinedArea],
      MLSS: [mlss, [Validators.required, Validators.min(0)]],
      influentFlow: [input.influentFlow, [Validators.required, Validators.min(0)]],
      rasFlow: [input.rasFlow, [Validators.required, Validators.min(0)]],
      sludgeSettlingVelocity: [sludgeSettlingVelocity, [Validators.required, Validators.min(0)]],
    });
    return formGroup;
  }

  
  getInputFromForm(form: UntypedFormGroup): StatePointAnalysisInput {
    let input: StatePointAnalysisInput = {
      sviValue: form.controls.sviValue.value,
      sviParameter: form.controls.sviParameter.value,
      numberOfClarifiers: form.controls.numberOfClarifiers.value,
      areaOfClarifier: form.controls.areaOfClarifier.value,
      diameter: form.controls.diameter.value,
      isUserDefinedArea: form.controls.isUserDefinedArea.value,
      MLSS: form.controls.MLSS.value,
      influentFlow: form.controls.influentFlow.value,
      rasFlow: form.controls.rasFlow.value,
      sludgeSettlingVelocity: form.controls.sludgeSettlingVelocity.value,
    };
    return input;
  }
}
