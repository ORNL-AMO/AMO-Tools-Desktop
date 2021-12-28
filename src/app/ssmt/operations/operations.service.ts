import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { SSMT, GeneralSteamOperations } from '../../shared/models/steam/ssmt';
import { OperatingHours, OperatingCosts } from '../../shared/models/operations';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { SteamService } from '../../calculator/steam/steam.service';
import { BoilerWarnings } from '../boiler/boiler.service';

@Injectable()
export class OperationsService {

  constructor(private formBuilder: FormBuilder, private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  getForm(ssmt: SSMT, settings: Settings): FormGroup {
    let makeupWaterTempMin: number = this.convertUnitsService.value(40).from('F').to(settings.steamTemperatureMeasurement);
    let makeupWaterTempMax: number = this.convertUnitsService.value(160).from('F').to(settings.steamTemperatureMeasurement);
    makeupWaterTempMin = this.convertUnitsService.roundVal(makeupWaterTempMin, 1);
    makeupWaterTempMax = this.convertUnitsService.roundVal(makeupWaterTempMax, 1);

    let form: FormGroup = this.formBuilder.group({
      sitePowerImport: [ssmt.generalSteamOperations.sitePowerImport, [Validators.required]],
      makeUpWaterTemperature: [ssmt.generalSteamOperations.makeUpWaterTemperature, [Validators.required, Validators.min(makeupWaterTempMin)]],
      fuelCost: [ssmt.operatingCosts.fuelCost, [Validators.required, Validators.min(.00000001)]],
      electricityCost: [ssmt.operatingCosts.electricityCost, [Validators.required, Validators.min(.0000001)]],
      makeUpWaterCost: [ssmt.operatingCosts.makeUpWaterCost, [Validators.required, Validators.min(.0000001)]],
      hoursPerYear: [ssmt.operatingHours.hoursPerYear, [Validators.required, Validators.min(1), Validators.max(8760)]],
      implementationCosts: [ssmt.operatingCosts.implementationCosts, Validators.min(0)]
    })
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  getOperationsDataFromForm(form: FormGroup): { operatingHours: OperatingHours, operatingCosts: OperatingCosts, generalSteamOperations: GeneralSteamOperations } {
    let operatingHours: OperatingHours = {
      hoursPerYear: form.controls.hoursPerYear.value
    }

    let operatingCosts: OperatingCosts = {
      fuelCost: form.controls.fuelCost.value,
      electricityCost: form.controls.electricityCost.value,
      makeUpWaterCost: form.controls.makeUpWaterCost.value,
      implementationCosts: form.controls.implementationCosts.value
    }

    let generalSteamOperations: GeneralSteamOperations = {
      sitePowerImport: form.controls.sitePowerImport.value,
      makeUpWaterTemperature: form.controls.makeUpWaterTemperature.value
    }
    return {
      operatingHours: operatingHours,
      operatingCosts: operatingCosts,
      generalSteamOperations: generalSteamOperations
    }
  }

  checkOperationsWarnings(operationsForm: FormGroup, ssmt: SSMT, settings: Settings): BoilerWarnings {
    return {
      makeUpWaterTemperature: this.checkMakeupWaterTemperatureWarnings(operationsForm, ssmt, settings)
    };
  }

  checkMakeupWaterTemperatureWarnings(formGroup: FormGroup, ssmt: SSMT, settings: Settings) {
    let warning = null;
    if (ssmt.boilerInput && ssmt.boilerInput.preheatMakeupWater == true) {
      let pressure: number;
      let saturatedTemperature: number;

      if (ssmt.boilerInput.blowdownFlashed == false) {
        if (ssmt.headerInput.highPressureHeader) {
          pressure = ssmt.headerInput.highPressureHeader.pressure;
        } else if (ssmt.headerInput.highPressure) {
          pressure = ssmt.headerInput.highPressure.pressure;
        }
      } else if (ssmt.boilerInput.blowdownFlashed == true) {
        if (ssmt.headerInput.lowPressureHeader) {
          pressure = ssmt.headerInput.lowPressureHeader.pressure;
        } else if (ssmt.headerInput.lowPressure) {
          pressure = ssmt.headerInput.lowPressure.pressure;
        }
      }
      
      if (pressure) {
        saturatedTemperature = this.steamService.saturatedProperties({ saturatedPressure: pressure }, 0, settings).saturatedTemperature;
        saturatedTemperature = this.convertUnitsService.roundVal(saturatedTemperature, 0);
        let maxValue = saturatedTemperature - formGroup.controls.makeUpWaterTemperature.value;
        if (ssmt.boilerInput.approachTemperature > maxValue) {
          warning = `This value may need to be adjusted to be able to use a heat exchanger to pre-heat makeup water.`;
        }
      }
    }
    return warning;
  }

}
