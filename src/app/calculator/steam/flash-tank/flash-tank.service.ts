import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Validators, FormBuilder, FormGroup } from '../../../../../node_modules/@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlashTankInput } from '../../../shared/models/steam';

@Injectable()
export class FlashTankService {
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initForm(settings: Settings): FormGroup {
    let ranges: FlashTankRanges = this.getRangeValues(settings, 0);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletWaterPressure: ['', [Validators.required, Validators.min(ranges.inletWaterPressureMin), Validators.max(ranges.inletWaterPressureMax)]],
      thermodynamicQuantity: [1, [Validators.required]],
      quantityValue: ['', [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletWaterMassFlow: ['', [Validators.required, Validators.min(ranges.inletWaterMassFlowMin), Validators.max(ranges.inletWaterMassFlowMax)]],
      tankPressure: ['', [Validators.required, Validators.min(ranges.tankPressureMin), Validators.max(ranges.tankPressureMax)]]
    })
    return tmpForm;
  }

  getFormFromObj(inputObj: FlashTankInput, settings: Settings): FormGroup {
    let ranges: FlashTankRanges = this.getRangeValues(settings, inputObj.thermodynamicQuantity);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletWaterPressure: [inputObj.inletWaterPressure, [Validators.required, Validators.min(ranges.inletWaterPressureMin), Validators.max(ranges.inletWaterPressureMax)]],
      thermodynamicQuantity: [inputObj.thermodynamicQuantity],
      quantityValue: [inputObj.quantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletWaterMassFlow: [inputObj.inletWaterMassFlow, [Validators.required, Validators.min(ranges.inletWaterMassFlowMin), Validators.max(ranges.inletWaterMassFlowMax)]],
      tankPressure: [inputObj.tankPressure, [Validators.required, Validators.min(ranges.tankPressureMin), Validators.max(ranges.tankPressureMax)]]
    })
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): FlashTankInput {
    let input: FlashTankInput = {
      inletWaterPressure: form.controls.inletWaterPressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      inletWaterMassFlow: form.controls.inletWaterMassFlow.value,
      tankPressure: form.controls.tankPressure.value,
    }
    return input;
  }

  getRangeValues(settings: Settings, thermodynamicQuantity: number): FlashTankRanges {
    let quantityMinMax: {min: number, max: number} = this.getQuantityRange(settings, thermodynamicQuantity);
    let ranges: FlashTankRanges = {
      inletWaterPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      inletWaterPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      quantityValueMin: quantityMinMax.min,
      quantityValueMax: quantityMinMax.max,
      inletWaterMassFlowMin: 0,
      inletWaterMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      tankPressureMin: -14.5,
      tankPressureMax: 3185
    }
    return ranges;
  }


  getQuantityRange(settings: Settings, thermodynamicQuantity: number): { min: number, max: number } {
    let _min: number = 0;
    let _max: number = 1;
    //temp
    if (thermodynamicQuantity == 0) {
      _min = Number(this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement).toFixed(0));
    } 
    //enthalpy
    else if (thermodynamicQuantity == 1) {
      _min = Number(this.convertUnitsService.value(50).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(3700).from('kJkg').to(settings.steamSpecificEnthalpyMeasurement).toFixed(0));
    } 
    //entropy
    else if (thermodynamicQuantity == 2) {
      _min = Number(this.convertUnitsService.value(0).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
      _max = Number(this.convertUnitsService.value(6.52).from('kJkgK').to(settings.steamSpecificEntropyMeasurement).toFixed(0));
    }
    return { min: _min, max: _max };
  }
}

export interface FlashTankRanges {
  inletWaterPressureMin: number;
  inletWaterPressureMax: number;
  quantityValueMin: number;
  quantityValueMax: number;
  inletWaterMassFlowMin: number;
  inletWaterMassFlowMax: number;
  tankPressureMin: number;
  tankPressureMax: number;
}