import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FieldData, FSAT } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getFormFromObj(obj: FieldData): FormGroup {
    if (!obj.operatingHours && obj.operatingFraction) {
      obj.operatingHours = obj.operatingFraction * 8760;
    }
    let form: FormGroup = this.formBuilder.group({
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      
      cost: [obj.cost, [Validators.required, Validators.min(0)]],
    });
    for (let key in form.controls) {
      if (form.controls[key].value) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getHoursFromForm(form: FormGroup): number {
    let newData: number = form.controls.operatingHours.value;
    return newData;
  }

  getCostFromForm(form: FormGroup): number {
    let newData: number = form.controls.cost.value;
    return newData;
  }

  isOperationsDataValid(obj: FieldData): boolean {
    let form: FormGroup = this.getFormFromObj(obj);
    return form.valid;
  }

}
