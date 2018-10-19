import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TurbineInput, PressureTurbine, CondensingTurbine } from '../../shared/models/steam/ssmt';
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

  initCondensingTurbine(settings: Settings): FormGroup {
    //TODO: from = 'psia'
    let tmpCondensingPressureMin: number = this.convertUnitsService.value(.2).from('psi').to(settings.steamPressureMeasurement);
    tmpCondensingPressureMin = this.convertUnitsService.roundVal(tmpCondensingPressureMin, 0);
    let tmpCondensingPressureMax: number = this.convertUnitsService.value(14.6).from('psi').to(settings.steamPressureMeasurement);
    tmpCondensingPressureMax = this.convertUnitsService.roundVal(tmpCondensingPressureMax, 0);
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
    //TODO: from = 'psia'
    let tmpCondensingPressureMin: number = this.convertUnitsService.value(.2).from('psi').to(settings.steamPressureMeasurement);
    tmpCondensingPressureMin = this.convertUnitsService.roundVal(tmpCondensingPressureMin, 0);
    let tmpCondensingPressureMax: number = this.convertUnitsService.value(14.6).from('psi').to(settings.steamPressureMeasurement);
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

  initPressureForm(settings: Settings): FormGroup {
    let operationValidators: { quantityValue1Validators: Array<Validators>, quantityValue2Validators: Array<Validators> } = this.getPressureOperationValueRanges();
    let form: FormGroup = this.formBuilder.group({
      isentropicEfficiency: [, [Validators.required, Validators.min(20), Validators.max(100)]],
      generationEfficiency: [, [Validators.required, Validators.min(50), Validators.max(100)]],
      operationType: [0, Validators.required],
      operationValue1: [, operationValidators.quantityValue1Validators],
      operationValue2: [, operationValidators.quantityValue2Validators],
      useTurbine: [false, Validators.required]
    })
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  getPressureFormFromObj(obj: PressureTurbine): FormGroup {
    let operationValidators: { quantityValue1Validators: Array<Validators>, quantityValue2Validators: Array<Validators> } = this.getPressureOperationValueRanges(obj);
    return this.formBuilder.group({
      isentropicEfficiency: [obj.isentropicEfficiency, [Validators.required, Validators.min(20), Validators.max(100)]],
      generationEfficiency: [obj.generationEfficiency, [Validators.required, Validators.min(50), Validators.max(100)]],
      operationType: [obj.operationType, Validators.required],
      operationValue1: [obj.operationValue1, operationValidators.quantityValue1Validators],
      operationValue2: [obj.operationValue2, operationValidators.quantityValue2Validators],
      useTurbine: [obj.useTurbine, Validators.required]
    })
  }

  getPressureOperationValueRanges(obj?: PressureTurbine): { quantityValue1Validators: Array<Validators>, quantityValue2Validators: Array<Validators> } {
    let quantityValue1Validators: Array<Validators>;
    let quantityValue2Validators: Array<Validators>;
    if (obj) {
      let value1Max: number = obj.operationValue2 || 10000;
      let value2Min: number = obj.operationValue1 || 1;
      if (obj.operationType == 0) {
        //steam flow
        quantityValue1Validators = [Validators.required, Validators.min(1), Validators.max(10000)];
        quantityValue2Validators = [];
      } else if (obj.operationType == 1) {
        //power generation
        quantityValue1Validators = [Validators.required, Validators.min(0)];
        quantityValue2Validators = [];
      } else if (obj.operationType == 2) {
        //balance header    
        quantityValue1Validators = [];
        quantityValue2Validators = [];
      } else if (obj.operationType == 3) {
        //power range
        quantityValue1Validators = [Validators.required, Validators.min(0), Validators.max(value1Max)];
        quantityValue2Validators = [Validators.required, Validators.min(value2Min), Validators.max(10000)];
      } else if (obj.operationType == 4) {
        //flow range
        quantityValue1Validators = [Validators.required, Validators.min(0), Validators.max(value1Max)];
        quantityValue2Validators = [Validators.required, Validators.min(value2Min), Validators.max(10000)];
      }
    } else {
      quantityValue1Validators = [Validators.required, Validators.min(1), Validators.max(10000)];
      quantityValue2Validators = [];
    }
    return {
      quantityValue1Validators: quantityValue1Validators,
      quantityValue2Validators: quantityValue2Validators
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
}