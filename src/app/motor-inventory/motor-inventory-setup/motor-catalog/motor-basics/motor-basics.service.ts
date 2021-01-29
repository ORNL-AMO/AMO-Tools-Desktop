import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MotorItem } from '../../../motor-inventory';

@Injectable()
export class MotorBasicsService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromMotorItem(motorItem: MotorItem): FormGroup {
    return this.formBuilder.group({
      name: [motorItem.name],
      description: [motorItem.description],
    });
  }

  updateMotorItemFromForm(form: FormGroup, motorItem: MotorItem): MotorItem {
    motorItem.name = form.controls.name.value
    motorItem.description = form.controls.description.value
    return motorItem;
  }
}
