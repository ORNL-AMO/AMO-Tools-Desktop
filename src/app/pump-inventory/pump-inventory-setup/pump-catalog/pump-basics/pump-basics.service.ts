import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PumpItem } from '../../../pump-inventory';

@Injectable()
export class PumpBasicsService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromPumpItem(pumpItem: PumpItem): FormGroup {
    return this.formBuilder.group({
      name: [pumpItem.name],
      description: [pumpItem.description],
    });
  }

  updatepumpItemFromForm(form: FormGroup, pumpItem: PumpItem): PumpItem {
    pumpItem.name = form.controls.name.value
    pumpItem.description = form.controls.description.value
    return pumpItem;
  }
}
