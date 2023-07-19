import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NameplateData } from '../../../pump-inventory';

@Injectable()
export class NameplateDataCatalogService {


  constructor(private formBuilder: FormBuilder) { }

  getFormFromNameplateData(nameplateData: NameplateData): FormGroup {
    return this.formBuilder.group({
      manufacturer: [nameplateData.manufacturer],
      model: [nameplateData.model],
      serialNumber: [nameplateData.serialNumber],
     });
  }

  updateNameplateDataFromForm(form: FormGroup, nameplateData: NameplateData): NameplateData {
    nameplateData.manufacturer = form.controls.manufacturer.value;
    nameplateData.model = form.controls.model.value;
    nameplateData.serialNumber = form.controls.serialNumber.value;
    return nameplateData;
  }
}
