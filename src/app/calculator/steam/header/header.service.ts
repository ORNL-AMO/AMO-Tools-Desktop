import { Injectable } from '@angular/core';
import { SteamService } from '../steam.service';
import { Settings } from '../../../shared/models/settings';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { HeaderInput, HeaderInputObj } from '../../../shared/models/steam/steam-inputs';

@Injectable()
export class HeaderService {
  headerInput: HeaderInput;
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initHeaderForm(settings: Settings): UntypedFormGroup {
    let tmpHeaderPressure = 357.2;
    if (settings.steamPressureMeasurement !== 'psig') {
      tmpHeaderPressure = Math.round(this.convertUnitsService.value(357.2).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
    }
    let ranges: { min: number, max: number } = this.getPressureRangeValues(settings);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      headerPressure: [tmpHeaderPressure, [Validators.required, Validators.min(ranges.min), Validators.max(ranges.max)]],
      numInlets: [3, [Validators.required]]
    });
    return tmpForm;
  }

  resetHeaderForm(settings: Settings): UntypedFormGroup {
    let ranges: { min: number, max: number } = this.getPressureRangeValues(settings);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      headerPressure: ['', [Validators.required, Validators.min(ranges.min), Validators.max(ranges.max)]],
      numInlets: [0, [Validators.required]]
    });
    return tmpForm;
  }

  resetInletForm(settings: Settings): UntypedFormGroup {
    let ranges: InletRanges = this.getInletRangeValues(settings, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      pressure: [0, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]],
      quantityValue: [0, [Validators.required, Validators.min(ranges.quantityMin), Validators.max(ranges.quantityMax)]],
      massFlow: [0, [Validators.required, Validators.min(ranges.massFlowMin)]]
    });
    return tmpForm;
  }

  initInletForm(settings: Settings): Array<UntypedFormGroup> {
    let tmpPressure1 = 586.9;
    let tmpPressure2 = 529.3;
    let tmpPressure3 = 583.7;
    let tmpQuantityValue1 = 108.2;
    let tmpQuantityValue2 = 351.4;
    let tmpQuantityValue3 = 468;
    let tmpMassFlow1 = 83.9;
    let tmpMassFlow2 = 73.9;
    let tmpMassFlow3 = 39.2;
    if (settings.steamPressureMeasurement !== 'psig') {
      tmpPressure1 = Math.round(this.convertUnitsService.value(tmpPressure1).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
      tmpPressure2 = Math.round(this.convertUnitsService.value(tmpPressure2).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
      tmpPressure3 = Math.round(this.convertUnitsService.value(tmpPressure3).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
    }
    if (settings.steamTemperatureMeasurement !== 'F') {
      tmpQuantityValue1 = Math.round(this.convertUnitsService.value(tmpQuantityValue1).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
      tmpQuantityValue2 = Math.round(this.convertUnitsService.value(tmpQuantityValue2).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
      tmpQuantityValue3 = Math.round(this.convertUnitsService.value(tmpQuantityValue3).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
    }
    if (settings.steamMassFlowMeasurement !== 'klb') {
      tmpMassFlow1 = Math.round(this.convertUnitsService.value(tmpMassFlow1).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
      tmpMassFlow2 = Math.round(this.convertUnitsService.value(tmpMassFlow2).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
      tmpMassFlow3 = Math.round(this.convertUnitsService.value(tmpMassFlow3).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
    }
    let inletForms = new Array<UntypedFormGroup>();
    let ranges: InletRanges = this.getInletRangeValues(settings, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      pressure: [tmpPressure1, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]],
      quantityValue: [tmpQuantityValue1, [Validators.required, Validators.min(ranges.quantityMin), Validators.max(ranges.quantityMax)]],
      massFlow: [tmpMassFlow1, [Validators.required, Validators.min(ranges.massFlowMin)]]
    });
    inletForms.push(tmpForm);
    tmpForm = this.formBuilder.group({
      pressure: [tmpPressure2, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]],
      quantityValue: [tmpQuantityValue2, [Validators.required, Validators.min(ranges.quantityMin), Validators.max(ranges.quantityMax)]],
      massFlow: [tmpMassFlow2, [Validators.required, Validators.min(ranges.massFlowMin)]]
    });
    inletForms.push(tmpForm);
    tmpForm = this.formBuilder.group({
      pressure: [tmpPressure3, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]],
      quantityValue: [tmpQuantityValue3, [Validators.required, Validators.min(ranges.quantityMin), Validators.max(ranges.quantityMax)]],
      massFlow: [tmpMassFlow3, [Validators.required, Validators.min(ranges.massFlowMin)]]
    });
    inletForms.push(tmpForm);
    return inletForms;
  }

  getHeaderFormFromObj(inputObj: HeaderInput, settings: Settings): UntypedFormGroup {
    let ranges: { min: number, max: number } = this.getPressureRangeValues(settings);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      headerPressure: [inputObj.headerPressure, [Validators.required, Validators.min(ranges.min), Validators.max(ranges.max)]],
      numInlets: [inputObj.numberOfInlets]
    });
    return tmpForm;
  }

  getInletFormFromObj(inputObj: HeaderInputObj, settings: Settings): UntypedFormGroup {
    let ranges: InletRanges = this.getInletRangeValues(settings, inputObj.thermodynamicQuantity);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      pressure: [inputObj.pressure, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      thermodynamicQuantity: [inputObj.thermodynamicQuantity, [Validators.required]],
      quantityValue: [inputObj.quantityValue, [Validators.required, Validators.min(ranges.quantityMin), Validators.max(ranges.quantityMax)]],
      massFlow: [inputObj.massFlow, [Validators.required, Validators.min(ranges.massFlowMin)]]
    });
    return tmpForm;
  }

  getObjFromForm(headerForm: UntypedFormGroup, inletForms: Array<UntypedFormGroup>): HeaderInput {
    let input: HeaderInput = {
      headerPressure: headerForm.controls.headerPressure.value,
      inlets: new Array<HeaderInputObj>(),
      numberOfInlets: headerForm.controls.numInlets.value
    };
    inletForms.forEach(form => {
      let tmpObj: HeaderInputObj = this.getInletObjFromForm(form);
      input.inlets.push(tmpObj);
    });
    return input;
  }

  getInletObjFromForm(form: UntypedFormGroup): HeaderInputObj {
    return {
      pressure: form.controls.pressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      massFlow: form.controls.massFlow.value
    };
  }

  getInletRangeValues(settings: Settings, thermodynamicQuantity: number): InletRanges {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, thermodynamicQuantity);
    let ranges: InletRanges = {
      pressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      pressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      quantityMin: quantityMinMax.min,
      quantityMax: quantityMinMax.max,
      massFlowMin: 0,
      massFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0))
    };
    return ranges;
  }

  getPressureRangeValues(settings: Settings): { min: number, max: number } {
    let min: number = Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3));
    let max: number = Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3));
    return { min: min, max: max };
  }
}

export interface InletRanges {
  pressureMin: number;
  pressureMax: number;
  quantityMin: number;
  quantityMax: number;
  massFlowMin: number;
  massFlowMax: number;
}
