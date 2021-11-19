import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SSMT, GeneralSteamOperations } from '../../shared/models/steam/ssmt';
import { OperatingHours, OperatingCosts } from '../../shared/models/operations';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Injectable()
export class OperationsService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

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
    form = this.setMakeUpTempValidators(form, ssmt);
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

  setMakeUpTempValidators(formGroup: FormGroup, ssmt: SSMT) {
    // method to check for valid input
    let pressure: number;
    let approachTemp = ssmt.boilerInput.approachTemperature;
    let makeUpWaterTemperature = ssmt.generalSteamOperations.makeUpWaterTemperature;


    if (ssmt.boilerInput.blowdownFlashed == false) {
      // Double check if highPressureHeader or high pressure
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

    if (approachTemp && pressure != undefined) { 
      let tempValue = pressure - makeUpWaterTemperature;   
      formGroup.controls.makeUpWaterTemperature.setValidators([Validators.required, Validators.max(tempValue),Validators.min(0.000005)]);
      formGroup.controls.makeUpWaterTemperature.markAsDirty();
      formGroup.controls.makeUpWaterTemperature.updateValueAndValidity();
    }
    return formGroup;
  }

}
