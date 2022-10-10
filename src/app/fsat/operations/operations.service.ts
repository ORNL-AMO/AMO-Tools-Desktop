import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FieldData, FSAT, FsatOperations, FsatInput} from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getFormFromObj(obj: FsatOperations): UntypedFormGroup {
    if (!obj.operatingHours && obj.operatingFraction) {
      obj.operatingHours = obj.operatingFraction * 8760;
    }
    let form: UntypedFormGroup = this.formBuilder.group({
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

  getObjFromForm(form: UntypedFormGroup): FsatOperations {
    let newData: FsatOperations = {
      operatingHours: form.controls.operatingHours.value,
      cost: form.controls.cost.value
    };
    return newData;
  }

  isOperationsDataValid(obj: FsatOperations): boolean {
    let form: UntypedFormGroup = this.getFormFromObj(obj);
    return form.valid;
  }
}
