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

    let defaultMakeupWaterTemp: number = this.convertUnitsService.value(70).from('F').to(settings.steamTemperatureMeasurement);
    defaultMakeupWaterTemp = this.convertUnitsService.roundVal(defaultMakeupWaterTemp, 0);

    let form: FormGroup = this.formBuilder.group({
      sitePowerImport: [ssmt.generalSteamOperations.sitePowerImport, [Validators.required]],
      makeUpWaterTemperature: [ssmt.generalSteamOperations.makeUpWaterTemperature || defaultMakeupWaterTemp, [Validators.required, Validators.min(makeupWaterTempMin), Validators.max(makeupWaterTempMax)]],
      fuelCost: [ssmt.operatingCosts.fuelCost || settings.fuelCost, [Validators.required, Validators.min(.00000001)]],
      electricityCost: [ssmt.operatingCosts.electricityCost || settings.electricityCost, [Validators.required, Validators.min(.0000001)]],
      makeUpWaterCost: [ssmt.operatingCosts.makeUpWaterCost || 0.0025, [Validators.required, Validators.min(.0000001)]],
      weeksPerYear: [ssmt.operatingHours.weeksPerYear],
      daysPerWeek: [ssmt.operatingHours.daysPerWeek],
      shiftsPerDay: [ssmt.operatingHours.shiftsPerDay],
      hoursPerShift: [ssmt.operatingHours.hoursPerShift],
      hoursPerYear: [ssmt.operatingHours.hoursPerYear, [Validators.required, Validators.min(1), Validators.max(8760)]],
    })
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  getOperationsDataFromForm(form: FormGroup): { operatingHours: OperatingHours, operatingCosts: OperatingCosts, generalSteamOperations: GeneralSteamOperations } {
    let operatingHours: OperatingHours = {
      weeksPerYear: form.controls.weeksPerYear.value,
      daysPerWeek: form.controls.daysPerWeek.value,
      shiftsPerDay: form.controls.shiftsPerDay.value,
      hoursPerShift: form.controls.hoursPerShift.value,
      hoursPerYear: form.controls.hoursPerYear.value
    }

    let operatingCosts: OperatingCosts = {
      fuelCost: form.controls.fuelCost.value,
      electricityCost: form.controls.electricityCost.value,
      makeUpWaterCost: form.controls.makeUpWaterCost.value
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
}
