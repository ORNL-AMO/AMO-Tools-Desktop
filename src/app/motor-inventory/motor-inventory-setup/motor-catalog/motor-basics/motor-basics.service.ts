import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MotorItem } from '../../../motor-inventory';

@Injectable()
export class MotorBasicsService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromMotorItem(motorItem: MotorItem): UntypedFormGroup {
    return this.formBuilder.group({
      name: [motorItem.name],
      description: [motorItem.description],
    });
  }

  updateMotorItemFromForm(form: UntypedFormGroup, motorItem: MotorItem): MotorItem {
    motorItem.name = form.controls.name.value
    motorItem.description = form.controls.description.value
    return motorItem;
  }
}
