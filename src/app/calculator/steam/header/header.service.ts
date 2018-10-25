import { Injectable } from '@angular/core';
import { SteamService } from '../steam.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { HeaderInput, HeaderInputObj } from '../../../shared/models/steam/steam-inputs';

@Injectable()
export class HeaderService {
  headerInput: HeaderInput;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initHeaderForm(settings: Settings): FormGroup {
    let ranges: { min: number, max: number } = this.getPressureRangeValues(settings);
    let tmpForm: FormGroup = this.formBuilder.group({
      headerPressure: ['', [Validators.required, Validators.min(ranges.min), Validators.max(ranges.max)]],
      numInlets: [3, [Validators.required]]
    });
    return tmpForm;
  }

  initInletForm(settings: Settings): FormGroup {
    let ranges: InletRanges = this.getInletRangeValues(settings, 0);
    let tmpForm: FormGroup = this.formBuilder.group({
      pressure: ['', [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]],
      quantityValue: ['', [Validators.required, Validators.min(ranges.quantityMin), Validators.max(ranges.quantityMax)]],
      massFlow: ['', [Validators.required, Validators.min(ranges.massFlowMin)]]
    })
    return tmpForm;
  }

  getHeaderFormFromObj(inputObj: HeaderInput, settings: Settings): FormGroup {
    let ranges: { min: number, max: number } = this.getPressureRangeValues(settings);
    let tmpForm: FormGroup = this.formBuilder.group({
      headerPressure: [inputObj.headerPressure, [Validators.required, Validators.min(ranges.min), Validators.max(ranges.max)]],
      numInlets: [inputObj.numberOfInlets]
    });
    return tmpForm;
  }

  getInletFormFromObj(inputObj: HeaderInputObj, settings: Settings): FormGroup {
    let ranges: InletRanges = this.getInletRangeValues(settings, inputObj.thermodynamicQuantity);
    let tmpForm: FormGroup = this.formBuilder.group({
      pressure: [inputObj.pressure, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      thermodynamicQuantity: [inputObj.thermodynamicQuantity, [Validators.required]],
      quantityValue: [inputObj.quantityValue, [Validators.required, Validators.min(ranges.quantityMin), Validators.max(ranges.quantityMax)]],
      massFlow: [inputObj.massFlow, [Validators.required, Validators.min(ranges.massFlowMin)]]
    })
    return tmpForm;
  }

  getObjFromForm(headerForm: FormGroup, inletForms: Array<FormGroup>): HeaderInput {
    let input: HeaderInput = {
      headerPressure: headerForm.controls.headerPressure.value,
      inlets: new Array<HeaderInputObj>(),
      numberOfInlets: headerForm.controls.numInlets.value
    }
    inletForms.forEach(form => {
      let tmpObj: HeaderInputObj = this.getInletObjFromForm(form);
      input.inlets.push(tmpObj)
    })
    return input;
  }

  getInletObjFromForm(form: FormGroup): HeaderInputObj {
    return {
      pressure: form.controls.pressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      massFlow: form.controls.massFlow.value
    }
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
    }
    return ranges;
  }

  getPressureRangeValues(settings: Settings): { min: number, max: number } {
    let min: number = Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3));
    let max: number = Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3));
    return { min: min, max: max };
  }
}

export interface InletRanges {
  pressureMin: number,
  pressureMax: number,
  quantityMin: number,
  quantityMax: number,
  massFlowMin: number,
  massFlowMax: number
}
