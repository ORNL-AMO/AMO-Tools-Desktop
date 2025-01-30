import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NameplateData } from '../../../compressed-air-inventory';

@Injectable()
export class NameplateDataCatalogService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromNameplateData(nameplateData: NameplateData): FormGroup {
    return this.formBuilder.group({
      compressorType: [nameplateData.compressorType, Validators.required],
      fullLoadOperatingPressure: [nameplateData.fullLoadOperatingPressure, [Validators.required, Validators.min(0)]],
      fullLoadRatedCapacity: [nameplateData.fullLoadRatedCapacity, [Validators.required, Validators.min(0)]],
      totalPackageInputPower: [nameplateData.totalPackageInputPower, Validators.required],
    });
  }

  updateNameplateDataFromForm(form: FormGroup, nameplateData: NameplateData): NameplateData {
    nameplateData.compressorType = form.controls.compressorType.value;
    nameplateData.fullLoadOperatingPressure = form.controls.fullLoadOperatingPressure.value;
    nameplateData.fullLoadRatedCapacity = form.controls.fullLoadRatedCapacity.value;
    nameplateData.totalPackageInputPower = form.controls.totalPackageInputPower.value;
    return nameplateData;
  }
}