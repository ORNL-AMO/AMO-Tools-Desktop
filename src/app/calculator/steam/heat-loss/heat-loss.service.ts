import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { HeatLossInput } from '../../../shared/models/steam/steam-inputs';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SteamService } from '../steam.service';

@Injectable()
export class HeatLossService {
  heatLossInput: HeatLossInput;

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initForm(settings: Settings): UntypedFormGroup {
    let tmpInletPressure = 653;
    let tmpQuantityValue = 1121.9;
    let tmpInletMassFlow = 13.6;
    let tmpPercentHeatLoss = 8.47;
    if (settings.steamPressureMeasurement !== 'psig') {
      tmpInletPressure = Math.round(this.convertUnitsService.value(tmpInletPressure).from('psig').to(settings.steamPressureMeasurement) * 100) / 100;
    }
    if (settings.steamTemperatureMeasurement !== 'F') {
      tmpQuantityValue = Math.round(this.convertUnitsService.value(tmpQuantityValue).from('F').to(settings.steamTemperatureMeasurement) * 100) / 100;
    }
    if (settings.steamMassFlowMeasurement !== 'klb') {
      tmpInletMassFlow = Math.round(this.convertUnitsService.value(tmpInletMassFlow).from('klb').to(settings.steamMassFlowMeasurement) * 100) / 100;
    }
    let ranges: HeatLossRanges = this.getRangeValues(settings, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      inletPressure: [tmpInletPressure, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]], //0 is TEMPERATURE
      quantityValue: [tmpQuantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: [tmpInletMassFlow, [Validators.required, Validators.min(ranges.inletMassFlowMin)]],
      percentHeatLoss: [tmpPercentHeatLoss, [Validators.required, Validators.min(ranges.percentHeatLossMin), Validators.max(ranges.percentHeatLossMax)]]
    });
    return tmpForm;
  }
  resetForm(settings: Settings): UntypedFormGroup {
    let ranges: HeatLossRanges = this.getRangeValues(settings, 0);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      inletPressure: [0, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [0, [Validators.required]], //0 is TEMPERATURE
      quantityValue: [0, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: [0, [Validators.required, Validators.min(ranges.inletMassFlowMin)]],
      percentHeatLoss: [0, [Validators.required, Validators.min(ranges.percentHeatLossMin), Validators.max(ranges.percentHeatLossMax)]]
    });
    return tmpForm;
  }

  getFormFromObj(inputObj: HeatLossInput, settings: Settings): UntypedFormGroup {
    let ranges: HeatLossRanges = this.getRangeValues(settings, inputObj.thermodynamicQuantity);
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      inletPressure: [inputObj.inletPressure, [Validators.required, Validators.min(ranges.inletPressureMin), Validators.max(ranges.inletPressureMax)]],
      thermodynamicQuantity: [inputObj.thermodynamicQuantity], //0 is TEMPERATURE
      quantityValue: [inputObj.quantityValue, [Validators.required, Validators.min(ranges.quantityValueMin), Validators.max(ranges.quantityValueMax)]],
      inletMassFlow: [inputObj.inletMassFlow, [Validators.required, Validators.min(ranges.inletMassFlowMin)]],
      percentHeatLoss: [inputObj.percentHeatLoss, [Validators.required, Validators.min(ranges.percentHeatLossMin), Validators.max(ranges.percentHeatLossMax)]]
    });
    return tmpForm;
  }

  getObjFromForm(form: UntypedFormGroup): HeatLossInput {
    let input: HeatLossInput = {
      inletPressure: form.controls.inletPressure.value,
      thermodynamicQuantity: form.controls.thermodynamicQuantity.value,
      quantityValue: form.controls.quantityValue.value,
      inletMassFlow: form.controls.inletMassFlow.value,
      percentHeatLoss: form.controls.percentHeatLoss.value || 0,
    }
    return input;
  }

  getRangeValues(settings: Settings, thermodynamicQuantity: number): HeatLossRanges {
    let quantityMinMax: { min: number, max: number } = this.steamService.getQuantityRange(settings, thermodynamicQuantity);
    let ranges: HeatLossRanges = {
      inletPressureMin: Number(this.convertUnitsService.value(1).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      inletPressureMax: Number(this.convertUnitsService.value(22064).from('kPaa').to(settings.steamPressureMeasurement).toFixed(3)),
      quantityValueMin: quantityMinMax.min,
      quantityValueMax: quantityMinMax.max,
      inletMassFlowMin: 0,
      inletMassFlowMax: Number(this.convertUnitsService.value(10000).from('klb').to(settings.steamMassFlowMeasurement).toFixed(0)),
      percentHeatLossMin: 0,
      percentHeatLossMax: 10
    };
    return ranges;
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
