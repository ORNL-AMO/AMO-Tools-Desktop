import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { DeaeratorInput } from '../../../shared/models/steam/steam-inputs';
import { SteamService } from '../steam.service';

@Injectable()
export class DeaeratorService {
  deaeratorInput: DeaeratorInput;

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initForm(settings: Settings): FormGroup {
    let ranges: DeaeratorRanges = this.getRangeValues(settings, 2, 1);
    let tmpForm: FormGroup = this.formBuilder.group({
      deaeratorPressure: ['', [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      ventRate: ['', [Validators.required, Validators.min(ranges.ventRateMin), Validators.max(ranges.ventRateMax)]],
      feedwaterMassFlow: ['', [Validators.required, Validators.min(ranges.feedwaterMassFlowMin)]],
      waterPressure: ['', [Validators.required, Validators.min(ranges.waterPressureMin), Validators.max(ranges.waterPressureMax)]],
      waterThermodynamicQuantity: [1, [Validators.required]],
      waterQuantityValue: ['', [Validators.required, Validators.min(ranges.waterQuantityValueMin), Validators.max(ranges.waterQuantityValueMax)]],
      steamPressure: ['', [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      steamThermodynamicQuantity: [2, [Validators.required]],
      steamQuantityValue: ['', [Validators.required, Validators.min(ranges.steamQuantityValueMin), Validators.max(ranges.steamQuantityValueMax)]]
    })
    return tmpForm;
  }

  getFormFromObj(inputObj: DeaeratorInput, settings: Settings): FormGroup {
    let ranges: DeaeratorRanges = this.getRangeValues(settings, inputObj.steamThermodynamicQuantity, inputObj.waterThermodynamicQuantity);
    let tmpForm: FormGroup = this.formBuilder.group({
      deaeratorPressure: [inputObj.deaeratorPressure, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      ventRate: [inputObj.ventRate, [Validators.required, Validators.min(ranges.ventRateMin), Validators.max(ranges.ventRateMax)]],
      feedwaterMassFlow: [inputObj.feedwaterMassFlow, [Validators.required, Validators.min(ranges.feedwaterMassFlowMin)]],
      waterPressure: [inputObj.waterPressure, [Validators.required, Validators.min(ranges.waterPressureMin), Validators.max(ranges.waterPressureMax)]],
      waterThermodynamicQuantity: [1, [Validators.required]],
      waterQuantityValue: [inputObj.waterQuantityValue, [Validators.required, Validators.min(ranges.waterQuantityValueMin), Validators.max(ranges.waterQuantityValueMax)]],
      steamPressure: [inputObj.steamPressure, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      steamThermodynamicQuantity: [2, [Validators.required]],
      steamQuantityValue: [inputObj.steamQuantityValue, [Validators.required, Validators.min(ranges.steamQuantityValueMin), Validators.max(ranges.steamQuantityValueMax)]]
    })
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): DeaeratorInput {
    let input: DeaeratorInput = {
      deaeratorPressure: form.controls.deaeratorPressure.value,
      ventRate: form.controls.ventRate.value,
      feedwaterMassFlow: form.controls.feedwaterMassFlow.value,
      waterPressure: form.controls.waterPressure.value,
      waterThermodynamicQuantity: form.controls.waterThermodynamicQuantity.value,
      waterQuantityValue: form.controls.waterQuantityValue.value,
      steamPressure: form.controls.steamPressure.value,
      steamThermodynamicQuantity: form.controls.steamThermodynamicQuantity.value,
      steamQuantityValue: form.controls.steamQuantityValue.value
    }
    return input;
  }

  getRangeValues(settings: Settings, steamThermodynamicQuantity: number, waterThermodynamicQuantity: number): DeaeratorRanges {
    let steamQuantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, steamThermodynamicQuantity);
    let waterQuantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, waterThermodynamicQuantity);
    let ranges: DeaeratorRanges = {
      deaeratorPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      deaeratorPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      ventRateMin: 0,
      ventRateMax: 10,
      feedwaterMassFlowMin: 0,
      feedwaterMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      waterPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      waterPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      waterQuantityValueMin: waterQuantityMinMax.min,
      waterQuantityValueMax: waterQuantityMinMax.max,
      steamPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      steamPressureMax: Number(this.convertUnitsService.value(22064 ).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      steamQuantityValueMin: steamQuantityMinMax.min,
      steamQuantityValueMax: steamQuantityMinMax.max
    }
    return ranges;
  }
}


export interface DeaeratorRanges {
  deaeratorPressureMin: number;
  deaeratorPressureMax: number;
  ventRateMin: number;
  ventRateMax: number;
  feedwaterMassFlowMin: number;
  feedwaterMassFlowMax: number;
  waterPressureMin: number;
  waterPressureMax: number;
  waterQuantityValueMin: number;
  waterQuantityValueMax: number;
  steamPressureMin: number;
  steamPressureMax: number;
  steamQuantityValueMin: number;
  steamQuantityValueMax: number;
}