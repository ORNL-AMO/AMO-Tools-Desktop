import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { FieldData, FSAT, FsatOperations, FsatInput} from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getFormFromObj(obj: FsatOperations): FormGroup {
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

  getObjFromForm(form: FormGroup): FsatOperations {
    let newData: FsatOperations = {
      operatingHours: form.controls.operatingHours.value,
      cost: form.controls.cost.value
    };
    return newData;
  }

  isOperationsDataValid(obj: FsatOperations): boolean {
    let form: FormGroup = this.getFormFromObj(obj);
    return form.valid;
  }
  
  // getFsatInputsFromForm(form: FormGroup, fsatInputs: FsatInput): FsatInput {
  //   return fsatInputs;
  // }

}
