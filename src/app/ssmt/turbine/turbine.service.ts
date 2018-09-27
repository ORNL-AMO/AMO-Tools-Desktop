import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurbineInput, PressureTurbine, CondensingTurbine } from '../../shared/models/ssmt';

@Injectable()
export class TurbineService {

  constructor(private formBuilder: FormBuilder) { }

  initTurbineInputObj(): TurbineInput {
    return {
      condensingTurbine: {
        isentropicEfficiency: undefined,
        generationEfficiency: undefined,
        condenserPressure: undefined,
        operationType: 0,
        operationValue: undefined,
        useTurbine: true
      },
      highToLowTurbine: this.initPressureTurbine(),
      highToMediumTurbine: this.initPressureTurbine(),
      mediumToLowTurbine: this.initPressureTurbine()
    }
  }

  initPressureTurbine(): PressureTurbine {
    return {
      isentropicEfficiency: undefined,
      generationEfficiency: undefined,
      operationType: 0,
      operationValue1: undefined,
      operationValue2: undefined,
      useTurbine: false
    }
  }

  initCondensingFormFromObj(obj: CondensingTurbine): FormGroup {
    return this.formBuilder.group({
      isentropicEfficiency: [obj.isentropicEfficiency, Validators.required],
      generationEfficiency: [obj.generationEfficiency, Validators.required],
      condenserPressure: [obj.condenserPressure, Validators.required],
      operationType: [obj.operationType, Validators.required],
      operationValue: [obj.operationValue, Validators.required],
      useTurbine: [obj.useTurbine, Validators.required]
    })
  }

  getCondensingTurbineFromForm(form: FormGroup): CondensingTurbine {
    return {
      isentropicEfficiency: form.controls.isentropicEfficiency.value,
      generationEfficiency: form.controls.generationEfficiency.value,
      condenserPressure: form.controls.condenserPressure.value,
      operationType: form.controls.operationType.value,
      operationValue: form.controls.operationValue.value,
      useTurbine: form.controls.useTurbine.value
    }
  }

  initPressureFormFromObj(obj: PressureTurbine): FormGroup {
    return this.formBuilder.group({
      isentropicEfficiency: [obj.isentropicEfficiency, Validators.required],
      generationEfficiency: [obj.generationEfficiency, Validators.required],
      operationType: [obj.operationType, Validators.required],
      operationValue1: [obj.operationValue1, Validators.required],
      operationValue2: [obj.operationValue2, Validators.required],
      useTurbine: [obj.useTurbine, Validators.required]
    })
  }

  getPressureTurbineFromForm(form: FormGroup): PressureTurbine {
    return {
      isentropicEfficiency: form.controls.useTurbine.value,
      generationEfficiency: form.controls.generationEfficiency.value,
      operationType: form.controls.operationType.value,
      operationValue1: form.controls.operationValue1.value,
      operationValue2: form.controls.operationValue2.value,
      useTurbine: form.controls.useTurbine.value
    }
  }


}
