import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { DeaeratorInput } from '../../../shared/models/steam';

@Injectable()
export class DeaeratorService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initForm(settings: Settings): FormGroup {
    let ranges: DeaeratorRanges = this.getRangeValues(settings, 2, 1);
    let tmpForm: FormGroup = this.formBuilder.group({
      deaeratorPressure: ['', [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      ventRate: ['', [Validators.required, Validators.min(ranges.ventRateMin), Validators.max(ranges.ventRateMax)]],
      feedwaterMassFlow: ['', [Validators.required, Validators.min(ranges.feedwaterMassFlowMin), Validators.max(ranges.feedwaterMassFlowMax)]],
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
      feedwaterMassFlow: [inputObj.feedwaterMassFlow, [Validators.required, Validators.min(ranges.feedwaterMassFlowMin), Validators.max(ranges.feedwaterMassFlowMax)]],
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
    let steamQuantityMinMax: { min: number, max: number } = this.getQuantityRange(settings, steamThermodynamicQuantity);
    let waterQuantityMinMax: { min: number, max: number } = this.getQuantityRange(settings, waterThermodynamicQuantity);
    let ranges: DeaeratorRanges = {
      deaeratorPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      deaeratorPressureMax: Number(this.convertUnitsService.value(3185.4).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      ventRateMin: 0,
      ventRateMax: 10,
      feedwaterMassFlowMin: 0,
      feedwaterMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      waterPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      waterPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      waterQuantityValueMin: waterQuantityMinMax.min,
      waterQuantityValueMax: waterQuantityMinMax.max,
      steamPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      steamPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      steamQuantityValueMin: steamQuantityMinMax.min,
      steamQuantityValueMax: steamQuantityMinMax.max
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