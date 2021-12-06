import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PsatInputs } from '../../shared/models/psat';
@Injectable({
  providedIn: 'root'
})
export class PumpOperationsService {
    constructor(private formBuilder: FormBuilder) { }

  getFormFromObj(psatInputs: PsatInputs, isBaseline: boolean, isWhatIfScenario?: boolean): FormGroup {
    if (!psatInputs.operating_hours && psatInputs.operating_fraction) {
      psatInputs.operating_hours = psatInputs.operating_fraction * 8760;
    }

    let form: FormGroup = this.formBuilder.group({
      operatingHours: [psatInputs.operating_hours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      costKwHr: [psatInputs.cost_kw_hour, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }


  getPsatInputsFromForm(form: FormGroup, psatInputs: PsatInputs): PsatInputs {
    psatInputs.operating_hours = form.controls.operatingHours.value;
    psatInputs.cost_kw_hour = form.controls.costKwHr.value;
    return psatInputs;

  }
}
