import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OperationData } from '../../../motor-inventory';

@Injectable()
export class OperationsDataService {

  constructor(private formBuilder: FormBuilder) { }

  getFormFromOperationData(operationData: OperationData): FormGroup {
    return this.formBuilder.group({
      location: [operationData.location],
      annualOperatingHours: [operationData.annualOperatingHours, [Validators.min(0), Validators.max(8760)]],
      averageLoadFactor: [operationData.averageLoadFactor, [Validators.min(0), Validators.max(100)]],
      utilizationFactor: [operationData.utilizationFactor, [Validators.min(0), Validators.max(100)]],
      efficiencyAtAverageLoad: [operationData.efficiencyAtAverageLoad, [Validators.min(0), Validators.max(100)]],
      powerFactorAtLoad: [operationData.powerFactorAtLoad, [Validators.min(0), Validators.max(100)]],
    });
  }

  updateOperationDataFromForm(form: FormGroup, operationData: OperationData): OperationData {
    operationData.location = form.controls.location.value;
    operationData.annualOperatingHours = form.controls.annualOperatingHours.value;
    operationData.averageLoadFactor = form.controls.averageLoadFactor.value;
    operationData.utilizationFactor = form.controls.utilizationFactor.value;
    operationData.efficiencyAtAverageLoad = form.controls.efficiencyAtAverageLoad.value;
    operationData.powerFactorAtLoad = form.controls.powerFactorAtLoad.value;
    return operationData;
  }
}
