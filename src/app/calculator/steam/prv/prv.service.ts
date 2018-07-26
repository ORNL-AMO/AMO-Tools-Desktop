import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '../../../../../node_modules/@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { PrvInput } from '../../../shared/models/steam';

@Injectable()
export class PrvService {
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initInletForm(settings: Settings): FormGroup {
    let ranges: PrvRanges = this.getRangeValues(settings, 2);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletPressure: ['', [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [2, [Validators.required]],
      quantityValue: ['', [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: ['', [Validators.required, Validators.min(ranges.inletMassFlowMin), Validators.max(ranges.inletMassFlowMax)]],
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
      inletMassFlow: [inputObj.inletMassFlow, [Validators.required, Validators.min(ranges.inletMassFlowMin), Validators.max(ranges.inletMassFlowMax)]],
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
      feedwaterThermodynamicQuantity: [inputObj.feedwaterThermodynamicQuantity],
      feedwaterQuantityValue: [inputObj.feedwaterQuantityValue, [Validators.required, Validators.min(ranges.feedwaterQuantityValueMin), Validators.max(ranges.feedwaterQuantityValueMax)]],
      desuperheatingTemp: [inputObj.desuperheatingTemp, [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)]],
    })
    return tmpForm;
  }


  getObjFromForm(inletForm: FormGroup, feedwaterForm?: FormGroup): PrvInput {
    let feedwaterPressure: number;
    let feedwaterThermodynamicQuantity: number;
    let feedwaterQuantityValue: number;
    let desuperheatingTemp: number;
    if (feedwaterForm) {
      feedwaterPressure = feedwaterForm.controls.thermodynamicQuantity.value;
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
    let quantityMinMax: { min: number, max: number } = this.getQuantityRange(settings, thermodynamicQuantity);

    let ranges: PrvRanges = {
      inletPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      inletPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      quantityValueMin: quantityMinMax.min,
      quantityValueMax: quantityMinMax.max,
      inletMassFlowMin: 0,
      inletMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      outletPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      outletPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0))

    }
    return ranges;
  }

  getFeedwaterRangeValues(settings: Settings, feedwaterThermodynamicQuantity: number): FeedwaterRanges {
    let feedwaterMinMax: { min: number, max: number } = this.getQuantityRange(settings, feedwaterThermodynamicQuantity);
    let ranges: FeedwaterRanges = {
      feedwaterPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      feedwaterPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      feedwaterQuantityValueMin: feedwaterMinMax.min,
      feedwaterQuantityValueMax: feedwaterMinMax.max,
      desuperheatingTempMin: Number(this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement).toFixed(0)),
      desuperheatingTempMax: Number(this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement).toFixed(0))
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

