import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PumpStatus } from '../../../pump-inventory';

@Injectable()
export class PumpStatusCatalogService {


  constructor(private formBuilder: FormBuilder) { }

  getFormFromPumpStatus(pumpStatus: PumpStatus): FormGroup {
    return this.formBuilder.group({
      status: [pumpStatus.status],
      priority: [pumpStatus.priority],
      yearInstalled: [pumpStatus.yearInstalled],
     });
  }

  updatePumpStatusFromForm(form: FormGroup, pumpStatus: PumpStatus): PumpStatus {
    pumpStatus.status = form.controls.status.value;
    pumpStatus.priority = form.controls.priority.value;
    pumpStatus.yearInstalled = form.controls.yearInstalled.value;
    return pumpStatus;
  }
}
