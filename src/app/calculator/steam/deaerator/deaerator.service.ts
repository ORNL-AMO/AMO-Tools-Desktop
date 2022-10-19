import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { DeaeratorInput } from '../../../shared/models/steam/steam-inputs';
import { SteamService } from '../steam.service';

@Injectable()
export class DeaeratorService {
  deaeratorInput: DeaeratorInput;

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initForm(settings: Settings): UntypedFormGroup {
    let tmpDeaeratorPressure = 14;
    let tmpFeedwaterMassFlow = 400;
    let tmpWaterPressure = 14;
    let tmpWaterQuantityValue = 98;
    let tmpSteamPressure = 20;
    let tmpSteamQuantityValue = 260;
    if (settings.steamPressureMeasurement !== 'psig') {
      tmpDeaeratorPressure = Math.round(this.convertUnitsService.value(tmpDeaeratorPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
      tmpWaterPressure = Math.round(this.convertUnitsService.value(tmpWaterPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
      tmpSteamPressure = Math.round(this.convertUnitsService.value(tmpSteamPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
    }
    if (settings.steamMassFlowMeasurement !== 'klb') {
      tmpFeedwaterMassFlow = Math.round(this.convertUnitsService.value(tmpFeedwaterMassFlow).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
    }
    if (settings.steamTemperatureMeasurement !== 'F') {
      tmpWaterQuantityValue = Math.round(this.convertUnitsService.value(tmpWaterQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
      tmpSteamQuantityValue = Math.round(this.convertUnitsService.value(tmpSteamQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
    }
    let ranges: DeaeratorRanges = this.getRangeValues(settings, 0, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      deaeratorPressure: [tmpDeaeratorPressure, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      ventRate: [0.1, [Validators.required, Validators.min(ranges.ventRateMin), Validators.max(ranges.ventRateMax)]],
      feedwaterMassFlow: [tmpFeedwaterMassFlow, [Validators.required, Validators.min(ranges.feedwaterMassFlowMin)]],
      waterPressure: [tmpWaterPressure, [Validators.required, Validators.min(ranges.waterPressureMin), Validators.max(ranges.waterPressureMax)]],
      waterThermodynamicQuantity: [0, [Validators.required]],
      waterQuantityValue: [tmpWaterQuantityValue, [Validators.required, Validators.min(ranges.waterQuantityValueMin), Validators.max(ranges.waterQuantityValueMax)]],
      steamPressure: [tmpSteamPressure, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      steamThermodynamicQuantity: [0, [Validators.required]],
      steamQuantityValue: [tmpSteamQuantityValue, [Validators.required, Validators.min(ranges.steamQuantityValueMin), Validators.max(ranges.steamQuantityValueMax)]]
    });
    return tmpForm;
  }

  resetForm(settings: Settings): UntypedFormGroup {
    let ranges: DeaeratorRanges = this.getRangeValues(settings, 0, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      deaeratorPressure: [0, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      ventRate: [0, [Validators.required, Validators.min(ranges.ventRateMin), Validators.max(ranges.ventRateMax)]],
      feedwaterMassFlow: [0, [Validators.required, Validators.min(ranges.feedwaterMassFlowMin)]],
      waterPressure: [0, [Validators.required, Validators.min(ranges.waterPressureMin), Validators.max(ranges.waterPressureMax)]],
      waterThermodynamicQuantity: [0, [Validators.required]],
      waterQuantityValue: [0, [Validators.required, Validators.min(ranges.waterQuantityValueMin), Validators.max(ranges.waterQuantityValueMax)]],
      steamPressure: [0, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      steamThermodynamicQuantity: [0, [Validators.required]],
      steamQuantityValue: [0, [Validators.required, Validators.min(ranges.steamQuantityValueMin), Validators.max(ranges.steamQuantityValueMax)]]
    });
    return tmpForm;
  }

  getFormFromObj(inputObj: DeaeratorInput, settings: Settings): UntypedFormGroup {
    let ranges: DeaeratorRanges = this.getRangeValues(settings, inputObj.steamThermodynamicQuantity, inputObj.waterThermodynamicQuantity);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      deaeratorPressure: [inputObj.deaeratorPressure, [Validators.required, Validators.min(ranges.deaeratorPressureMin), Validators.max(ranges.deaeratorPressureMax)]],
      ventRate: [inputObj.ventRate, [Validators.required, Validators.min(ranges.ventRateMin), Validators.max(ranges.ventRateMax)]],
      feedwaterMassFlow: [inputObj.feedwaterMassFlow, [Validators.required, Validators.min(ranges.feedwaterMassFlowMin)]],
      waterPressure: [inputObj.waterPressure, [Validators.required, Validators.min(ranges.waterPressureMin), Validators.max(ranges.waterPressureMax)]],
      waterThermodynamicQuantity: [inputObj.waterThermodynamicQuantity, [Validators.required]],
      waterQuantityValue: [inputObj.waterQuantityValue, [Validators.required, Validators.min(ranges.waterQuantityValueMin), Validators.max(ranges.waterQuantityValueMax)]],
      steamPressure: [inputObj.steamPressure, [Validators.required, Validators.min(ranges.steamPressureMin), Validators.max(ranges.steamPressureMax)]],
      steamThermodynamicQuantity: [inputObj.steamThermodynamicQuantity, [Validators.required]],
      steamQuantityValue: [inputObj.steamQuantityValue, [Validators.required, Validators.min(ranges.steamQuantityValueMin), Validators.max(ranges.steamQuantityValueMax)]]
    });
    return tmpForm;
  }

  getObjFromForm(form: UntypedFormGroup): DeaeratorInput {
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
    };
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
      steamPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      steamQuantityValueMin: steamQuantityMinMax.min,
      steamQuantityValueMax: steamQuantityMinMax.max
    };
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
