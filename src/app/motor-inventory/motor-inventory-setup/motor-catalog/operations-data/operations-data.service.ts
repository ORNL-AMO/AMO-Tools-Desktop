import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OperationData } from '../../../motor-inventory';

@Injectable()
export class OperationsDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromOperationData(operationData: OperationData): FormGroup {
    return this.formBuilder.group({
      ratedSpeed: [operationData.ratedSpeed],
      location: [operationData.location],
      annualOperatingHours: [operationData.annualOperatingHours],
      averageLoadFactor: [operationData.averageLoadFactor],
      utilizationFactor: [operationData.utilizationFactor],
      percentLoad: [operationData.percentLoad],
      powerFactorAtLoad: [operationData.powerFactorAtLoad],
    });
  }

  updateOperationDataFromForm(form: FormGroup, operationData: OperationData): OperationData {
    operationData.ratedSpeed = form.controls.frameNumber.value;
    operationData.location = form.controls.location.value;
    operationData.annualOperatingHours = form.controls.annualOperatingHours.value;
    operationData.averageLoadFactor = form.controls.averageLoadFactor.value;
    operationData.utilizationFactor = form.controls.utilizationFactor.value;
    operationData.percentLoad = form.controls.percentLoad.value;
    operationData.powerFactorAtLoad = form.controls.powerFactorAtLoad.value;
    return operationData;
  }
}
