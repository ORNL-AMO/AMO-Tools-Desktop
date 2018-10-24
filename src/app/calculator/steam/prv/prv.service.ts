import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '../../../../../node_modules/@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { PrvInput } from '../../../shared/models/steam/steam-inputs';
import { SteamService } from '../steam.service';

@Injectable()
export class PrvService {
  prvInput: PrvInput;
  isSuperHeating: boolean;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initInletForm(settings: Settings): FormGroup {
    let ranges: PrvRanges = this.getRangeValues(settings, 2);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletPressure: ['', [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [2, [Validators.required]],
      quantityValue: ['', [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: ['', [Validators.required, Validators.min(ranges.inletMassFlowMin)]],
      outletPressure: ['', [Validators.required, Validators.min(ranges.outletPressureMin), Validators.max(ranges.outletPressureMax)]],
    })
    return tmpForm;
  }

  getInletFormFromObj(inputObj: PrvInput, settings: Settings): FormGroup {
    let ranges: PrvRanges = this.getRangeValues(settings, inputObj.thermodynamicQuantity);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletPressure: [inputObj.inletPressure, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [inputObj.thermodynamicQuantity],
      quantityValue: [inputObj.quantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: [inputObj.inletMassFlow, [Validators.required, Validators.min(ranges.inletMassFlowMin)]],
      outletPressure: [inputObj.outletPressure, [Validators.required, Validators.min(ranges.outletPressureMin), Validators.max(ranges.outletPressureMax)]],
    })
    return tmpForm;
  }

  initFeedwaterForm(settings: Settings): FormGroup {
    let ranges: FeedwaterRanges = this.getFeedwaterRangeValues(settings, 2);
    let tmpForm: FormGroup = this.formBuilder.group({
      feedwaterPressure: ['', [Validators.required, Validators.min(ranges.feedwaterPressureMin), Validators.max(ranges.feedwaterPressureMax)]],
      feedwaterThermodynamicQuantity: [2, Validators.required],
      feedwaterQuantityValue: ['', [Validators.required, Validators.min(ranges.feedwaterQuantityValueMin), Validators.max(ranges.feedwaterQuantityValueMax)]],
      desuperheatingTemp: ['', [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)]],
    })
    return tmpForm;
  }

  getFeedwaterFormFromObj(inputObj: PrvInput, settings: Settings): FormGroup {
    let ranges: FeedwaterRanges = this.getFeedwaterRangeValues(settings, inputObj.thermodynamicQuantity);
    let tmpForm: FormGroup = this.formBuilder.group({
      feedwaterPressure: [inputObj.feedwaterPressure, [Validators.required, Validators.min(ranges.feedwaterPressureMin), Validators.max(ranges.feedwaterPressureMax)]],
      feedwaterThermodynamicQuantity: [inputObj.feedwaterThermodynamicQuantity || 2],
      feedwaterQuantityValue: [inputObj.feedwaterQuantityValue, [Validators.required, Validators.min(ranges.feedwaterQuantityValueMin), Validators.max(ranges.feedwaterQuantityValueMax)]],
      desuperheatingTemp: [inputObj.desuperheatingTemp, [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)]],
    })
    return tmpForm;
  }


  getObjFromForm(inletForm: FormGroup, feedwaterForm: FormGroup, isSuperHeating: boolean): PrvInput {
    let feedwaterPressure: number;
    let feedwaterThermodynamicQuantity: number;
    let feedwaterQuantityValue: number;
    let desuperheatingTemp: number;
    if (isSuperHeating) {
      feedwaterPressure = feedwaterForm.controls.feedwaterPressure.value;
      feedwaterThermodynamicQuantity = feedwaterForm.controls.feedwaterThermodynamicQuantity.value;
      feedwaterQuantityValue = feedwaterForm.controls.feedwaterQuantityValue.value;
      desuperheatingTemp = feedwaterForm.controls.desuperheatingTemp.value;
    }
    let input: PrvInput = {
      inletPressure: inletForm.controls.inletPressure.value,
      thermodynamicQuantity: inletForm.controls.thermodynamicQuantity.value,
      quantityValue: inletForm.controls.quantityValue.value,
      inletMassFlow: inletForm.controls.inletMassFlow.value,
      outletPressure: inletForm.controls.outletPressure.value,
      feedwaterPressure: feedwaterPressure,
      feedwaterThermodynamicQuantity: feedwaterThermodynamicQuantity,
      feedwaterQuantityValue: feedwaterQuantityValue,
      desuperheatingTemp: desuperheatingTemp
    }
    return input;
  }

  getRangeValues(settings: Settings, thermodynamicQuantity: number): PrvRanges {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, thermodynamicQuantity);

    let ranges: PrvRanges = {
      inletPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      inletPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      quantityValueMin: quantityMinMax.min,
      quantityValueMax: quantityMinMax.max,
      inletMassFlowMin: 0,
      inletMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      outletPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      outletPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3))
    }
    return ranges;
  }

  getFeedwaterRangeValues(settings: Settings, feedwaterThermodynamicQuantity: number): FeedwaterRanges {
    let feedwaterMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, feedwaterThermodynamicQuantity);
    let ranges: FeedwaterRanges = {
      feedwaterPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      feedwaterPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      feedwaterQuantityValueMin: feedwaterMinMax.min,
      feedwaterQuantityValueMax: feedwaterMinMax.max,
      desuperheatingTempMin: Number(this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement).toFixed(0)),
      desuperheatingTempMax: Number(this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement).toFixed(0))
    }
    return ranges;
  }

}

export interface PrvRanges {
  inletPressureMin: number;
  inletPressureMax: number;
  quantityValueMin: number;
  quantityValueMax: number;
  inletMassFlowMin: number;
  inletMassFlowMax: number;
  outletPressureMin: number;
  outletPressureMax: number;
}


export interface FeedwaterRanges {
  feedwaterPressureMin: number;
  feedwaterPressureMax: number;
  feedwaterQuantityValueMin: number;
  feedwaterQuantityValueMax: number;
  desuperheatingTempMin: number;
  desuperheatingTempMax: number;
}

