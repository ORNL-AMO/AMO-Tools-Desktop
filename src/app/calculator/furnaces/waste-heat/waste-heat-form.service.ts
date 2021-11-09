import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { WasteHeatInput, WasteHeatWarnings } from '../../../shared/models/phast/wasteHeat';
import { Settings } from '../../../shared/models/settings';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class WasteHeatFormService {


  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getWasteHeatForm(inputObj: WasteHeatInput, settings: Settings): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      oppHours: [inputObj.oppHours, [Validators.required, Validators.max(8760)]],
      cost: [inputObj.cost, Validators.required],
      availableHeat: [inputObj.availableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]],
      heatInput: [inputObj.heatInput, Validators.required],
      hxEfficiency: [inputObj.hxEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      chillerInTemperature: [inputObj.chillerInTemperature, Validators.required],
      chillerOutTemperature: [inputObj.chillerOutTemperature, Validators.required],
      copChiller: [inputObj.copChiller, Validators.required],
      chillerEfficiency: [inputObj.chillerEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      copCompressor: [inputObj.copCompressor, Validators.required]
    });

    form = this.setChillerTempValidators(form, settings);

    return form;
  }

  getWasteHeatInput(form: FormGroup): WasteHeatInput {
    let obj: WasteHeatInput = {
      oppHours: form.controls.oppHours.value,
      cost: form.controls.cost.value,
      availableHeat: form.controls.availableHeat.value,
      heatInput: form.controls.heatInput.value,
      hxEfficiency: form.controls.hxEfficiency.value,
      chillerInTemperature: form.controls.chillerInTemperature.value,
      chillerOutTemperature: form.controls.chillerOutTemperature.value,
      copChiller: form.controls.copChiller.value,
      chillerEfficiency: form.controls.chillerEfficiency.value,
      copCompressor: form.controls.copCompressor.value
    };
    return obj;
  }

  setChillerTempValidators(formGroup: FormGroup, settings: Settings) {
    let chillerTempMin: number = 33;
    let chillerTempMax: number = 211;

    if (settings.unitsOfMeasure == 'Metric') {
      chillerTempMin = this.convertUnitsService.value(chillerTempMin).from('F').to('C');
      chillerTempMin = Math.round(chillerTempMin);

      chillerTempMax = this.convertUnitsService.value(chillerTempMax).from('F').to('C');
      chillerTempMax = Math.round(chillerTempMax);
    };

    formGroup.controls.chillerInTemperature.setValidators([Validators.required, Validators.min(chillerTempMin), Validators.max(chillerTempMax)]);
    formGroup.controls.chillerInTemperature.updateValueAndValidity();

    let chillerOutTemperature = formGroup.controls.chillerOutTemperature.value;
    if (chillerOutTemperature) {
      formGroup.controls.chillerOutTemperature.setValidators([Validators.required, Validators.min(chillerTempMin), Validators.max(formGroup.controls.chillerInTemperature.value)]);
    } else {
      formGroup.controls.chillerOutTemperature.setValidators([Validators.required, Validators.min(chillerTempMin), Validators.max(chillerTempMax)]);
    }
    formGroup.controls.chillerOutTemperature.updateValueAndValidity();

    return formGroup;
  }


  checkWasteHeatWarnings(wasteHeat: WasteHeatInput): WasteHeatWarnings {
    return {
      exchangeEfficiencyWarning: this.checkExchangerEfficiencyWarning(wasteHeat),
      chillerEfficiencyWarning: this.checkChillerEfficiencyWarning(wasteHeat),
    };
  }

  checkExchangerEfficiencyWarning(wasteHeat: WasteHeatInput): string {
    if (wasteHeat.hxEfficiency && wasteHeat.hxEfficiency < 50) {
      return 'Proposed Heat Exchanger Effectiveness is usually greater than 50%.';
    } else {
      return null;
    }
  }

  checkChillerEfficiencyWarning(wasteHeat: WasteHeatInput): string {
    if (wasteHeat.chillerEfficiency && (wasteHeat.chillerEfficiency < 80 || wasteHeat.chillerEfficiency > 95)) {
      return 'Chiller Efficiency is usually between 80 % and 95%';
    } else {
      return null;
    }
  }



}
