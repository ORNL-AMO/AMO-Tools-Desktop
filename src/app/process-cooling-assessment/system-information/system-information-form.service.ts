import { Injectable } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { Operations } from '../../shared/models/process-cooling-assessment';

@Injectable()
export class SystemInformationFormService {

  constructor(private formBuilder: FormBuilder) { }

  getOperationsForm(operations: Operations): FormGroup<OperationsForm> {
    return this.formBuilder.group({
      annualOperatingHours: [operations.annualOperatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost: [operations.fuelCost, [Validators.required, Validators.min(0)]],
      electricityCost: [operations.electricityCost, [Validators.required, Validators.min(0)]],
      zipcode: [operations.zipcode, Validators.required],
      chilledWaterSupplyTemp: [operations.chilledWaterSupplyTemp, Validators.required],
      condenserCoolingMethod: [operations.condenserCoolingMethod, Validators.required],
    });
  }

  // * spread all current values of operations and then apply the new values from the form, 
  // * since it is only a partial object
   getOperations(formValue: Partial<Operations>, currentOperations: Operations): Operations {
    return {
      ...currentOperations,
      ...formValue,
    };
  }
}

export interface OperationsForm {
  annualOperatingHours: FormControl<number>;
  fuelCost: FormControl<number>;
  electricityCost: FormControl<number>;
  zipcode: FormControl<number>;
  chilledWaterSupplyTemp: FormControl<number>;
  condenserCoolingMethod: FormControl<number>;
}
