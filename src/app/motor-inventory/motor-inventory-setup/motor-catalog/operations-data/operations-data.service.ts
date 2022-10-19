import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OperationData } from '../../../motor-inventory';

@Injectable()
export class OperationsDataService {

  constructor(private formBuilder: UntypedFormBuilder) { }

  getFormFromOperationData(operationData: OperationData): UntypedFormGroup {
    return this.formBuilder.group({
      location: [operationData.location],
      annualOperatingHours: [operationData.annualOperatingHours, [Validators.min(0), Validators.max(8760)]],
      averageLoadFactor: [operationData.averageLoadFactor, [Validators.min(0), Validators.max(100)]],
      utilizationFactor: [operationData.utilizationFactor, [Validators.min(0), Validators.max(100)]],
      efficiencyAtAverageLoad: [operationData.efficiencyAtAverageLoad, [Validators.min(0), Validators.max(100)]],
      powerFactorAtLoad: [operationData.powerFactorAtLoad, [Validators.min(0), Validators.max(100)]],
      currentAtLoad: [operationData.currentAtLoad, [Validators.min(0)]]
    });
  }

  updateOperationDataFromForm(form: UntypedFormGroup, operationData: OperationData): OperationData {
    operationData.location = form.controls.location.value;
    operationData.annualOperatingHours = form.controls.annualOperatingHours.value;
    operationData.averageLoadFactor = form.controls.averageLoadFactor.value;
    operationData.utilizationFactor = form.controls.utilizationFactor.value;
    operationData.efficiencyAtAverageLoad = form.controls.efficiencyAtAverageLoad.value;
    operationData.powerFactorAtLoad = form.controls.powerFactorAtLoad.value;
    operationData.currentAtLoad = form.controls.currentAtLoad.value;
    return operationData;
  }
}
