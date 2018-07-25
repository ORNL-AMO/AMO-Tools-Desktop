import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HeatLossInput } from '../../../shared/models/steam';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Injectable()
export class HeatLossService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initForm(settings: Settings): FormGroup {
    let ranges: HeatLossRanges = this.getRangeValues(settings, 0);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletPressure: [2.418, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]], //0 is TEMPERATURE
      quantityValue: [521, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: [5434, [Validators.required, Validators.min(ranges.inletMassFlowMin), Validators.max(ranges.inletMassFlowMax)]],
      percentHeatLoss: [2.44, [Validators.required, Validators.min(ranges.percentHeatLossMin), Validators.max(ranges.percentHeatLossMax)]]
    })
    return tmpForm;
  }

  getFormFromObj(inputObj: HeatLossInput, settings: Settings): FormGroup {
    let ranges: HeatLossRanges = this.getRangeValues(settings, inputObj.thermodynamicQuantity);
    let tmpForm: FormGroup = this.formBuilder.group({
      inletPressure: [inputObj.inletPressure, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [inputObj.thermodynamicQuantity], //0 is TEMPERATURE
      quantityValue: [inputObj.quantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: [inputObj.inletMassFlow, [Validators.required, Validators.min(ranges.inletMassFlowMin), Validators.max(ranges.inletMassFlowMax)]],
      percentHeatLoss: [inputObj.percentHeatLoss, [Validators.required, Validators.min(ranges.percentHeatLossMin), Validators.max(ranges.percentHeatLossMax)]]
    })
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): HeatLossInput {
    let input: HeatLossInput = {
      inletPressure: form.controls.inletPressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      inletMassFlow: form.controls.inletMassFlow.value,
      percentHeatLoss: form.controls.percentHeatLoss.value,
    }
    return input;
  }

  getRangeValues(settings: Settings, thermodynamicQuantity: number): HeatLossRanges {
    let quantityMinMax: {min: number, max: number} = this.getQuantityRange(settings, thermodynamicQuantity);
    let ranges: HeatLossRanges = {
      inletPressureMin: Number(this.convertUnitsService.value(-14.5).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      inletPressureMax: Number(this.convertUnitsService.value(14489).from('psi').to(settings.steamPressureMeasurement).toFixed(0)),
      quantityValueMin: quantityMinMax.min,
      quantityValueMax: quantityMinMax.max,
      inletMassFlowMin: 0,
      inletMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      percentHeatLossMin: 0,
      percentHeatLossMax: 10
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

export interface HeatLossRanges {
  inletPressureMin: number;
  inletPressureMax: number;
  quantityValueMin: number;
  quantityValueMax: number;
  inletMassFlowMin: number;
  inletMassFlowMax: number;
  percentHeatLossMin: number;
  percentHeatLossMax: number;
}
