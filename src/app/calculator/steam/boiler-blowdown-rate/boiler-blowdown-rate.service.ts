import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { BehaviorSubject } from 'rxjs';
import { SteamService } from '../steam.service';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

@Injectable()
export class BoilerBlowdownRateService {

  baselineInputs: BehaviorSubject<BoilerBlowdownRateInputs>;
  modificationInputs: BehaviorSubject<BoilerBlowdownRateInputs>;
  setForms: BehaviorSubject<boolean>;
  currentField: BehaviorSubject<string>;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) {
    this.baselineInputs = new BehaviorSubject<BoilerBlowdownRateInputs>(undefined);
    this.modificationInputs = new BehaviorSubject<BoilerBlowdownRateInputs>(undefined);
    this.setForms = new BehaviorSubject<boolean>(true);
    this.currentField = new BehaviorSubject<string>('default');
  }

  getDefaultInputs(): BoilerBlowdownRateInputs {
    return {
      steamFlow: 0,
      steamTemperature: 0,
      feedwaterConductivity: 0,
      blowdownConductivity: 0,
      makeupWaterTemperature: 0,
      fuelCost: 0,
      waterCost: 0,
      operatingHours: 0
    }
  }

  getFormFromObj(obj: BoilerBlowdownRateInputs, settings: Settings): FormGroup {
    let ranges: BoilerBlowdownRateRanges = this.getRanges(settings);
    let form: FormGroup = this.formBuilder.group({
      steamFlow: [obj.steamFlow, [Validators.required, Validators.min(0), Validators.max(ranges.steamFlowMax)]],
      steamTemperature: [obj.steamTemperature, [Validators.required, Validators.min(ranges.steamTempMin), Validators.max(ranges.steamTempMax)]],
      feedwaterConductivity: [obj.feedwaterConductivity, [Validators.required, Validators.min(0), Validators.max(9000)]],
      blowdownConductivity: [obj.blowdownConductivity, [Validators.required, Validators.min(0), Validators.max(9000)]],
      makeupWaterTemperature: [obj.makeupWaterTemperature, [Validators.required, Validators.min(ranges.makeupWaterMin), Validators.max(ranges.makeupWaterMax)]],
      fuelCost: [obj.fuelCost, [Validators.required, Validators.min(0)]],
      waterCost: [obj.waterCost, [Validators.required, Validators.min(0)]],
      operatingHours: [obj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]]
    });
    return form;
  }

  getObjFromForm(form: FormGroup): BoilerBlowdownRateInputs {
    let obj: BoilerBlowdownRateInputs = {
      steamFlow: form.controls.steamFlow.value,
      steamTemperature: form.controls.steamTemperature.value,
      feedwaterConductivity: form.controls.feedwaterConductivity.value,
      blowdownConductivity: form.controls.blowdownConductivity.value,
      makeupWaterTemperature: form.controls.makeupWaterTemperature.value,
      fuelCost: form.controls.fuelCost.value,
      waterCost: form.controls.waterCost.value,
      operatingHours: form.controls.operatingHours.value
    }
    return obj;
  }

  getRanges(settings: Settings): BoilerBlowdownRateRanges {
    let steamFlowMax: number = this.convertUnitsService.value(100000).from('klb').to(settings.steamMassFlowMeasurement);
    steamFlowMax = this.convertUnitsService.roundVal(steamFlowMax, 0);
    let steamTempMax: number = this.convertUnitsService.value(1073.15).from('K').to(settings.steamTemperatureMeasurement);
    steamTempMax = this.convertUnitsService.roundVal(steamTempMax, 0);
    let steamTempMin: number = this.convertUnitsService.value(273.15).from('K').to(settings.steamTemperatureMeasurement);
    steamTempMin = this.convertUnitsService.roundVal(steamTempMin, 0);
    let makeupWaterMin: number = this.convertUnitsService.value(277.6).from('K').to(settings.steamTemperatureMeasurement);
    makeupWaterMin = this.convertUnitsService.roundVal(makeupWaterMin, 0);
    let makeupWaterMax: number = this.convertUnitsService.value(344.3).from('K').to(settings.steamTemperatureMeasurement);
    makeupWaterMax = this.convertUnitsService.roundVal(makeupWaterMax, 0);
    return {
      steamFlowMax: steamFlowMax,
      steamTempMax: steamTempMax,
      steamTempMin: steamTempMin,
      makeupWaterMin: makeupWaterMin,
      makeupWaterMax: makeupWaterMax
    }
  }

  calculateResults(inputs: BoilerBlowdownRateInputs, settings: Settings): BoilerBlowdownRateResults {
    let blowdownRate: number = this.calculateBlowdownRate(inputs.feedwaterConductivity, inputs.blowdownConductivity);
    let blowdownEnthalpy: number = this.calculateBlowdownEnthalpy(inputs.steamTemperature, settings);
    let makeupWaterProperties: { enthalpy: number, specificVolume: number } = this.calculateMakeupWaterProperties(inputs.makeupWaterTemperature, settings);
    let boilerFuelCost: number = this.calculateBoilerFuelCost(blowdownRate, blowdownEnthalpy, makeupWaterProperties.enthalpy, inputs);
    let makeupWaterCost: number = this.calculateWaterCost(inputs, blowdownRate, makeupWaterProperties.specificVolume);
    return {
      blowdownRate: blowdownRate,
      boilerFuelCost: boilerFuelCost,
      makeupWaterCost: makeupWaterCost,
      totalCost: boilerFuelCost + makeupWaterCost
    }
  }

  calculateBlowdownRate(feedwaterConductivity: number, blowdownConductivity: number): number {
    return feedwaterConductivity / (blowdownConductivity - feedwaterConductivity);
  }

  calculateBlowdownEnthalpy(steamTemp: number, settings: Settings): number {
    return this.steamService.saturatedProperties({ saturatedTemperature: steamTemp }, 1, settings).gasEnthalpy;
  }

  calculateMakeupWaterProperties(makeupWaterTemp: number, settings: Settings): { enthalpy: number, specificVolume: number } {
    let properties: SteamPropertiesOutput = this.steamService.steamProperties({
      thermodynamicQuantity: 0,
      pressure: .101325,
      quantityValue: makeupWaterTemp
    }, settings);
    return { enthalpy: properties.specificEnthalpy, specificVolume: properties.specificVolume };
  }

  calculateBoilerFuelCost(blowdownRate: number, blowdownEnthalpy: number, makeupWaterEnthalpy: number, inputs: BoilerBlowdownRateInputs): number {
    return blowdownRate * inputs.steamFlow * (blowdownEnthalpy - makeupWaterEnthalpy) * inputs.operatingHours * inputs.fuelCost / 1000;

  }

  calculateWaterCost(inputs: BoilerBlowdownRateInputs, blowdownRate: number, makeupWaterSpecificVolume: number): number {
    return (inputs.steamFlow / (1 - blowdownRate)) * inputs.operatingHours * inputs.waterCost / makeupWaterSpecificVolume;
  }
}

export interface BoilerBlowdownRateInputs {
  steamFlow: number,
  steamTemperature: number,
  feedwaterConductivity: number,
  blowdownConductivity: number,
  makeupWaterTemperature: number,
  fuelCost: number,
  waterCost: number,
  operatingHours: number
}


export interface BoilerBlowdownRateRanges {
  steamFlowMax: number;
  steamTempMax: number;
  steamTempMin: number;
  makeupWaterMin: number;
  makeupWaterMax: number;
}

export interface BoilerBlowdownRateResults {
  blowdownRate: number;
  boilerFuelCost: number;
  makeupWaterCost: number;
  totalCost: number;
}