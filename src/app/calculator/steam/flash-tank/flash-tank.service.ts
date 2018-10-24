import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Validators, FormBuilder, FormGroup } from '../../../../../node_modules/@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlashTankInput } from '../../../shared/models/steam/steam-inputs';
import { SteamService } from '../steam.service';

@Injectable()
export class FlashTankService {
  flashTankInput: FlashTankInput;

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initForm(settings: Settings): FormGroup {
    let ranges: FlashTankRanges = this.getRangeValues(settings, 0);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletWaterPressure: ['', [Validators.required, Validators.min(ranges.inletWaterPressureMin), Validators.max(ranges.inletWaterPressureMax)]],
      thermodynamicQuantity: [1, [Validators.required]],
      quantityValue: ['', [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletWaterMassFlow: ['', [Validators.required, Validators.min(ranges.inletWaterMassFlowMin)]],
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
      inletWaterMassFlow: [inputObj.inletWaterMassFlow, [Validators.required, Validators.min(ranges.inletWaterMassFlowMin)]],
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
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, thermodynamicQuantity);
    let ranges: FlashTankRanges = {
      inletWaterPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      inletWaterPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      quantityValueMin: quantityMinMax.min,
      quantityValueMax: quantityMinMax.max,
      inletWaterMassFlowMin: 0,
      inletWaterMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      tankPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      tankPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3))
    }
    return ranges;
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