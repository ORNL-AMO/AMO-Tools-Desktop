import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { BoilerInput } from '../../shared/models/steam/ssmt';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class BoilerService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initForm(settings: Settings) {
    let tmpRanges: BoilerRanges = this.getRanges(settings);

    // let defaultApproachTemp: number = this.convertUnitsService.value(20).from('F').to(settings.steamTemperatureMeasurement);
    // defaultApproachTemp = this.convertUnitsService.roundVal(defaultApproachTemp, 0);

    return this.formBuilder.group({
      'fuelType': [1, Validators.required],
      'fuel': [1, Validators.required],
      'combustionEfficiency': [80, [Validators.required, Validators.min(50), Validators.max(100)]],
      'blowdownRate': [0, [Validators.required, Validators.min(0), Validators.max(25)]],
      'blowdownFlashed': [0, [Validators.required]],
      'preheatMakeupWater': [0, [Validators.required]],
      'steamTemperature': ['', [Validators.required, Validators.min(tmpRanges.steamTemperatureMin), Validators.max(tmpRanges.steamTemperatureMax)]],
      'deaeratorVentRate': ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      'deaeratorPressure': ['', [Validators.required, Validators.min(tmpRanges.deaeratorPressureMin), Validators.max(tmpRanges.deaeratorPressureMax)]],
      'approachTemperature': ['', [Validators.min(tmpRanges.approachTempMin)]]
    })
  }

  initFormFromObj(obj: BoilerInput, settings: Settings): FormGroup {
    let tmpRanges: BoilerRanges = this.getRanges(settings);

    let approachTempValidators: Array<ValidatorFn> = [];
    if(obj.preheatMakeupWater){
      approachTempValidators = [Validators.min(tmpRanges.approachTempMin), Validators.required];
    }
    let form: FormGroup = this.formBuilder.group({
      'fuelType': [obj.fuelType, Validators.required],
      'fuel': [obj.fuel, Validators.required],
      'combustionEfficiency': [obj.combustionEfficiency, [Validators.required, Validators.min(50), Validators.max(100)]],
      'blowdownRate': [obj.blowdownRate, [Validators.required, Validators.min(0), Validators.max(25)]],
      'blowdownFlashed': [obj.blowdownFlashed, [Validators.required]],
      'preheatMakeupWater': [obj.preheatMakeupWater, [Validators.required]],
      'steamTemperature': [obj.steamTemperature, [Validators.required, Validators.min(tmpRanges.steamTemperatureMin), Validators.max(tmpRanges.steamTemperatureMax)]],
      'deaeratorVentRate': [obj.deaeratorVentRate, [Validators.required, Validators.min(0), Validators.max(10)]],
      'deaeratorPressure': [obj.deaeratorPressure, [Validators.required, Validators.min(tmpRanges.deaeratorPressureMin), Validators.max(tmpRanges.deaeratorPressureMax)]],
      'approachTemperature': [obj.approachTemperature, approachTempValidators]
    })
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  initObjFromForm(form: FormGroup): BoilerInput {
    return {
      fuelType: form.controls.fuelType.value,
      fuel: form.controls.fuel.value,
      combustionEfficiency: form.controls.combustionEfficiency.value,
      blowdownRate: form.controls.blowdownRate.value,
      blowdownFlashed: form.controls.blowdownFlashed.value,
      preheatMakeupWater: form.controls.preheatMakeupWater.value,
      steamTemperature: form.controls.steamTemperature.value,
      deaeratorVentRate: form.controls.deaeratorVentRate.value,
      deaeratorPressure: form.controls.deaeratorPressure.value,
      approachTemperature: form.controls.approachTemperature.value
    }
  }

  getRanges(settings: Settings): BoilerRanges {
    //TODO: Use "Saturation Temp @ HP" ?
    let tmpSteamTemperatureMin: number = this.convertUnitsService.value(0).from('F').to(settings.steamTemperatureMeasurement);
    tmpSteamTemperatureMin = this.convertUnitsService.roundVal(tmpSteamTemperatureMin, 0);
    let tmpSteamTemperatureMax: number = this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement);
    tmpSteamTemperatureMax = this.convertUnitsService.roundVal(tmpSteamTemperatureMax, 0);

    let tmpDeaeratorPressureMin: number = this.convertUnitsService.value(-14.5).from('psia').to(settings.steamPressureMeasurement);
    tmpDeaeratorPressureMin = this.convertUnitsService.roundVal(tmpDeaeratorPressureMin, 0);
    let tmpDeaeratorPressureMax: number = this.convertUnitsService.value(3185).from('psia').to(settings.steamPressureMeasurement);
    tmpDeaeratorPressureMax = this.convertUnitsService.roundVal(tmpDeaeratorPressureMax, 0);

    let tmpApproachTempMin: number = this.convertUnitsService.value(0).from('F').to(settings.steamTemperatureMeasurement);
    tmpApproachTempMin = this.convertUnitsService.roundVal(tmpApproachTempMin, 0);
    return {
      steamTemperatureMin: tmpSteamTemperatureMin,
      steamTemperatureMax: tmpSteamTemperatureMax,
      deaeratorPressureMin: tmpDeaeratorPressureMin,
      deaeratorPressureMax: tmpDeaeratorPressureMax,
      approachTempMin: tmpApproachTempMin
    }
  }

  isBoilerValid(obj: BoilerInput, settings: Settings): boolean {
    if (obj) {
      let form: FormGroup = this.initFormFromObj(obj, settings);
      if (form.status == 'VALID') {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}



export interface BoilerRanges {
  steamTemperatureMin: number,
  steamTemperatureMax: number,
  deaeratorPressureMin: number,
  deaeratorPressureMax: number,
  approachTempMin: number
}