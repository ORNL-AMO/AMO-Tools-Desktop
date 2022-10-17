import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { WaterHeatingInput } from '../../../shared/models/steam/waterHeating';

@Injectable()
export class WaterHeatingFormService {


  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { }

  getWaterHeatingForm(inputObj: WaterHeatingInput, settings: Settings): UntypedFormGroup {
    let minMakeupWater: number = 32;
    let maxMakeupWater: number = 200;
    if (settings.unitsOfMeasure != 'Imperial') {
      minMakeupWater = this.convertUnitsService.value(minMakeupWater).from('F').to('C');
      minMakeupWater = Math.round(minMakeupWater);
      maxMakeupWater = this.convertUnitsService.value(maxMakeupWater).from('F').to('C');
      maxMakeupWater = Math.round(maxMakeupWater);
    }

    let form: UntypedFormGroup = this.formBuilder.group({
      boilerUtilityType: [inputObj.boilerUtilityType],
      hxUtilityType: [{value: inputObj.hxUtilityType, disabled: true}],
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost: [inputObj.fuelCost, [Validators.required, Validators.min(0)]],
      fuelCostBoiler: [inputObj.fuelCostBoiler, [Validators.required, Validators.min(0)]],
      effBoiler: [inputObj.effBoiler, [Validators.required, Validators.min(0), Validators.max(100)]],
      waterCost: [inputObj.waterCost, [Validators.required, Validators.min(0)]],
      treatCost: [inputObj.treatCost, [Validators.required, Validators.min(0)]],
      pressureSteamIn: [inputObj.pressureSteamIn, [Validators.required, Validators.min(0)]],
      flowSteamRate: [inputObj.flowSteamRate, [Validators.required, Validators.min(0)]],
      temperatureWaterIn: [inputObj.temperatureWaterIn, Validators.required],
      pressureWaterOut: [inputObj.pressureWaterOut, [Validators.required, Validators.min(0)]],
      flowWaterRate: [inputObj.flowWaterRate, [Validators.required, Validators.min(0)]],
      effWaterHeater: [inputObj.effWaterHeater, [Validators.required, Validators.min(0), Validators.max(100)]],
      tempMakeupWater: [inputObj.tempMakeupWater, [Validators.required, Validators.min(minMakeupWater), Validators.max(maxMakeupWater)]],
      presMakeupWater: [inputObj.presMakeupWater, [Validators.required, Validators.min(0)]]
    });

    return form;
  }

  getWaterHeatingInput(form: UntypedFormGroup): WaterHeatingInput {
    let obj: WaterHeatingInput = {
      boilerUtilityType: form.controls.boilerUtilityType.value,
      hxUtilityType: form.controls.hxUtilityType.value,
      operatingHours: form.controls.operatingHours.value,
      fuelCost: form.controls.fuelCost.value,
      fuelCostBoiler: form.controls.fuelCostBoiler.value,
      effBoiler: form.controls.effBoiler.value,
      waterCost: form.controls.waterCost.value,
      treatCost: form.controls.treatCost.value,
      pressureSteamIn: form.controls.pressureSteamIn.value,
      flowSteamRate: form.controls.flowSteamRate.value,
      temperatureWaterIn: form.controls.temperatureWaterIn.value,
      pressureWaterOut: form.controls.pressureWaterOut.value,
      flowWaterRate: form.controls.flowWaterRate.value,
      effWaterHeater: form.controls.effWaterHeater.value,
      tempMakeupWater: form.controls.tempMakeupWater.value,
      presMakeupWater: form.controls.presMakeupWater.value
    };
    return obj;
  }

  checkWarnings(form: UntypedFormGroup, settings: Settings): WaterHeatingWarnings {
    return {
      temperatureWaterIn: this.checkTempInWarning(form, settings),
      tempMakeupWater: this.checkMakeupWater(form, settings)
    }
  }

  checkTempInWarning(form: UntypedFormGroup, settings: Settings): string {
    if (form.value.temperatureWaterIn) {
      let minWaterTempIn: number = 32;
      if (settings.unitsOfMeasure != 'Imperial') {
        minWaterTempIn = this.convertUnitsService.value(minWaterTempIn).from('F').to('C');
        minWaterTempIn = Math.round(minWaterTempIn);
      }
      if (form.value.temperatureWaterIn < minWaterTempIn) {
        return `Water HX Inlet Temperature should be ${minWaterTempIn} or greater`;
      }
    }
    return null;
  }

  checkMakeupWater(form: UntypedFormGroup, settings: Settings): string {
    if (form.value.tempMakeupWater) {
      let minMakeupWater: number = 50;
      let maxMakeupWater: number = 100;
      if (settings.unitsOfMeasure != 'Imperial') {
        minMakeupWater = this.convertUnitsService.value(minMakeupWater).from('F').to('C');
        minMakeupWater = Math.round(minMakeupWater);
        maxMakeupWater = this.convertUnitsService.value(maxMakeupWater).from('F').to('C');
        maxMakeupWater = Math.round(maxMakeupWater);
      }
      if (form.value.tempMakeupWater < minMakeupWater || form.value.tempMakeupWater > maxMakeupWater) {
        return `Make up water sourced from municipal water should be between ${minMakeupWater} and ${maxMakeupWater}`;
      }
    } 
    return null;
  }
}

export interface WaterHeatingWarnings {
  temperatureWaterIn: string,
  tempMakeupWater: string,
}