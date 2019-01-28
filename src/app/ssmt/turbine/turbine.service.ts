import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { TurbineInput, PressureTurbine, CondensingTurbine, HeaderInput } from '../../shared/models/steam/ssmt';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class TurbineService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initTurbineInputObj(): TurbineInput {
    return {
      condensingTurbine: undefined,
      highToLowTurbine: undefined,
      highToMediumTurbine: undefined,
      mediumToLowTurbine: undefined
    }
  }

  initCondensingTurbineObj(): CondensingTurbine {
    return {
      isentropicEfficiency: undefined,
      generationEfficiency: undefined,
      condenserPressure: undefined,
      operationType: 0,
      operationValue: undefined,
      useTurbine: false
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

  initCondensingTurbineForm(settings: Settings): FormGroup {
    let tmpCondensingPressureMin: number = this.convertUnitsService.value(.2).from('psia').to(settings.steamVacuumPressure);
    tmpCondensingPressureMin = this.convertUnitsService.roundVal(tmpCondensingPressureMin, 1);
    let tmpCondensingPressureMax: number = this.convertUnitsService.value(14.6).from('psia').to(settings.steamVacuumPressure);
    tmpCondensingPressureMax = this.convertUnitsService.roundVal(tmpCondensingPressureMax, 1);
    let tmpOperationValueRanges: { min: number, max: number } = this.getCondensingOperationRange(0);
    return this.formBuilder.group({
      isentropicEfficiency: [, [Validators.required, Validators.min(20), Validators.max(100)]],
      generationEfficiency: [, [Validators.required, Validators.min(50), Validators.max(100)]],
      condenserPressure: [, [Validators.required, Validators.min(tmpCondensingPressureMin), Validators.max(tmpCondensingPressureMax)]],
      operationType: [0, Validators.required],
      operationValue: [, [Validators.required, Validators.min(tmpOperationValueRanges.min), Validators.max(tmpOperationValueRanges.max)]], //min/max for fixed flow,
      useTurbine: [false, Validators.required]
    })
  }

  getCondensingFormFromObj(obj: CondensingTurbine, settings: Settings): FormGroup {
    let tmpCondensingPressureMin: number = this.convertUnitsService.value(.2).from('psia').to(settings.steamVacuumPressure);
    tmpCondensingPressureMin = this.convertUnitsService.roundVal(tmpCondensingPressureMin, 1);
    let tmpCondensingPressureMax: number = this.convertUnitsService.value(14.6).from('psia').to(settings.steamVacuumPressure);
    tmpCondensingPressureMax = this.convertUnitsService.roundVal(tmpCondensingPressureMax, 1);
    let tmpOperationValueRanges: { min: number, max: number } = this.getCondensingOperationRange(obj.operationType);
    let form: FormGroup = this.formBuilder.group({
      isentropicEfficiency: [obj.isentropicEfficiency, [Validators.required, Validators.min(20), Validators.max(100)]],
      generationEfficiency: [obj.generationEfficiency, [Validators.required, Validators.min(50), Validators.max(100)]],
      condenserPressure: [obj.condenserPressure, [Validators.required, Validators.min(tmpCondensingPressureMin), Validators.max(tmpCondensingPressureMax)]],
      operationType: [obj.operationType, Validators.required],
      operationValue: [obj.operationValue, [Validators.required, Validators.min(tmpOperationValueRanges.min), Validators.max(tmpOperationValueRanges.max)]],
      useTurbine: [obj.useTurbine, Validators.required]
    })
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  getCondensingOperationRange(operationType: number): { min: number, max: number } {
    if (operationType == 0) {
      return {
        min: 0,
        max: 10000
      }
    } else if (operationType == 1) {
      return {
        min: 0,
        max: undefined
      }
    }
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

  initPressureForm(): FormGroup {
    let operationValidators: { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } = this.getPressureOperationValueRanges();
    let form: FormGroup = this.formBuilder.group({
      isentropicEfficiency: [, [Validators.required, Validators.min(20), Validators.max(100)]],
      generationEfficiency: [, [Validators.required, Validators.min(50), Validators.max(100)]],
      operationType: [0, Validators.required],
      operationValue1: [, operationValidators.operationValue1Validators],
      operationValue2: [, operationValidators.operationValue2Validators],
      useTurbine: [false, Validators.required]
    })
    return form;
  }

  getPressureFormFromObj(obj: PressureTurbine): FormGroup {
    let operationValidators: { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } = this.getPressureOperationValueRanges(obj);
    let form: FormGroup = this.formBuilder.group({
      isentropicEfficiency: [obj.isentropicEfficiency, [Validators.required, Validators.min(20), Validators.max(100)]],
      generationEfficiency: [obj.generationEfficiency, [Validators.required, Validators.min(50), Validators.max(100)]],
      operationType: [obj.operationType, Validators.required],
      operationValue1: [obj.operationValue1, operationValidators.operationValue1Validators],
      operationValue2: [obj.operationValue2, operationValidators.operationValue2Validators],
      useTurbine: [obj.useTurbine, Validators.required]
    })
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  getPressureOperationValueRanges(obj?: PressureTurbine): { operationValue1Validators: Array<ValidatorFn>, operationValue2Validators: Array<ValidatorFn> } {
    let operationValue1Validators: Array<ValidatorFn>;
    let operationValue2Validators: Array<ValidatorFn>;
    if (obj) {
      let value1Max: number = obj.operationValue2 || 10000;
      let value2Min: number = obj.operationValue1 || 1;
      if (obj.operationType == 0) {
        //steam flow
        operationValue1Validators = [Validators.required, Validators.min(1), Validators.max(10000)];
        operationValue2Validators = [];
      } else if (obj.operationType == 1) {
        //power generation
        operationValue1Validators = [Validators.required, Validators.min(0)];
        operationValue2Validators = [];
      } else if (obj.operationType == 2) {
        //balance header    
        operationValue1Validators = [];
        operationValue2Validators = [];
      } else if (obj.operationType == 3) {
        //power range
        operationValue1Validators = [Validators.required, Validators.min(0), Validators.max(value1Max)];
        operationValue2Validators = [Validators.required, Validators.min(value2Min), Validators.max(10000)];
      } else if (obj.operationType == 4) {
        //flow range
        operationValue1Validators = [Validators.required, Validators.min(0), Validators.max(value1Max)];
        operationValue2Validators = [Validators.required, Validators.min(value2Min), Validators.max(10000)];
      }
    } else {
      operationValue1Validators = [Validators.required, Validators.min(1), Validators.max(10000)];
      operationValue2Validators = [];
    }
    return {
      operationValue1Validators: operationValue1Validators,
      operationValue2Validators: operationValue2Validators
    }
  }

  getPressureTurbineFromForm(form: FormGroup): PressureTurbine {
    return {
      isentropicEfficiency: form.controls.isentropicEfficiency.value,
      generationEfficiency: form.controls.generationEfficiency.value,
      operationType: form.controls.operationType.value,
      operationValue1: form.controls.operationValue1.value,
      operationValue2: form.controls.operationValue2.value,
      useTurbine: form.controls.useTurbine.value
    }
  }

  isTurbineValid(obj: TurbineInput, headerObj: HeaderInput, settings: Settings) {
    if (obj) {
      let condensingTurbineValid: boolean = true;
      let highToLowTurbineValid: boolean = true;
      let highToMediumTurbineValid: boolean = true;
      let mediumToLowTurbineValid: boolean = true;
      if (obj.condensingTurbine) {
        if (obj.condensingTurbine.useTurbine && headerObj.numberOfHeaders >= 1) {
          let tmpForm: FormGroup = this.getCondensingFormFromObj(obj.condensingTurbine, settings);
          if (tmpForm.invalid) {
            condensingTurbineValid = false;
          }
        }
      }
      if (obj.highToLowTurbine) {
        if (obj.highToLowTurbine.useTurbine && headerObj.numberOfHeaders >= 2) {
          let tmpForm: FormGroup = this.getPressureFormFromObj(obj.highToLowTurbine);
          if (tmpForm.invalid) {
            highToLowTurbineValid = false;
          }
        }
      }
      if (obj.highToMediumTurbine) {
        if (obj.highToMediumTurbine.useTurbine && headerObj.numberOfHeaders >= 3) {
          let tmpForm: FormGroup = this.getPressureFormFromObj(obj.highToMediumTurbine);
          if (tmpForm.invalid) {
            highToMediumTurbineValid = false;
          }
        }
      }
      if (obj.mediumToLowTurbine) {
        if (obj.mediumToLowTurbine.useTurbine && headerObj.numberOfHeaders >= 3) {
          let tmpForm: FormGroup = this.getPressureFormFromObj(obj.mediumToLowTurbine);
          if (tmpForm.invalid) {
            mediumToLowTurbineValid = false;
          }
        }
      }
      if (condensingTurbineValid && highToLowTurbineValid && highToMediumTurbineValid && mediumToLowTurbineValid) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}