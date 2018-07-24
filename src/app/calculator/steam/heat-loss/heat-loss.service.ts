import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HeatLossInput } from '../../../shared/models/steam';

@Injectable()
export class HeatLossService {

  constructor(private formBuilder: FormBuilder) { }

  initForm(): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      inletPressure: [2.418, Validators.required],
      thermodynamicQuantity: [0, Validators.required], //0 is TEMPERATURE
      quantityValue: [521, Validators.required],
      inletMassFlow: [5434, Validators.required],
      percentHeatLoss: [2.44, Validators.required]
    })
    return tmpForm;
  }

  getFormFromObj(inputObj: HeatLossInput): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      inletPressure: [inputObj.inletPressure, Validators.required],
      thermodynamicQuantity: [inputObj.thermodynamicQuantity, Validators.required], //0 is TEMPERATURE
      quantityValue: [inputObj.quantityValue, Validators.required],
      inletMassFlow: [inputObj.inletMassFlow, Validators.required],
      percentHeatLoss: [inputObj.percentHeatLoss, Validators.required]
    })
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): HeatLossInput {
    let input: HeatLossInput = {
      inletPressure: form.controls.inletPressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      inletMassFlow: form.controls.inletMassFlow.value,
      percentHeatLoss: form.controls.percentHeatLoss.value,
    }
    return input;
  }
}
