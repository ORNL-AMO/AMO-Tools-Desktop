import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FlueGasByVolume, MaterialInputProperties } from '../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../shared/models/settings';
import { FeedwaterEconomizerInput } from '../../../shared/models/steam/feedwaterEconomizer';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { SteamService } from '../steam.service';

@Injectable()
export class FeedwaterEconomizerFormService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService,
    private steamService: SteamService) { }

  getFeedwaterEconomizerForm(inputObj: FeedwaterEconomizerInput, settings: Settings): FormGroup {
    let steamTemperatureValidators: Array<ValidatorFn> = this.getSteamTemperatureValidators(inputObj.steamCondition, settings);


    let form: FormGroup = this.formBuilder.group({
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]],
      fuelCost: [inputObj.fuelCost, [Validators.required, Validators.min(0)]],
      flueGasTemperature: [inputObj.flueGasTemperature, Validators.required],
      fuelTemp: [inputObj.fuelTemp, Validators.required],
      materialTypeId: [inputObj.materialTypeId],
      oxygenCalculationMethod: [inputObj.oxygenCalculationMethod, Validators.required],
      flueGasO2: [inputObj.flueGasO2, Validators.required],
      excessAir: [inputObj.excessAir, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      combustionAirTemperature: [inputObj.combustionAirTemperature, Validators.required],
      ambientAirTemperature: [inputObj.ambientAirTemperature, Validators.required],
      moistureInCombustionAir: [inputObj.moistureInCombustionAir, [Validators.required, Validators.min(0), Validators.max(100)]],
      energyRateInput: [inputObj.energyRateInput, [Validators.required, Validators.min(0)]],
      steamPressure: [inputObj.steamPressure, [Validators.required, Validators.min(0)]],
      steamCondition: [inputObj.steamCondition],
      steamTemperature: [inputObj.steamTemperature, steamTemperatureValidators],
      feedWaterTemperature: [inputObj.feedWaterTemperature, this.getTemperatureValidators(32, settings)],
      percBlowdown: [inputObj.percBlowdown, [Validators.required, Validators.min(0)]],
      hxEfficiency: [inputObj.hxEfficiency, [Validators.required, Validators.min(0)]],
      higherHeatingVal: [inputObj.higherHeatingVal, Validators.required],
      CH4: [inputObj.CH4, Validators.required],
      C2H6: [inputObj.C2H6, Validators.required],
      N2: [inputObj.N2, Validators.required],
      H2: [inputObj.H2, Validators.required],
      C3H8: [inputObj.C3H8, Validators.required],
      C4H10_CnH2n: [inputObj.C4H10_CnH2n, Validators.required],
      H2O: [inputObj.H2O, Validators.required],
      CO: [inputObj.CO, Validators.required],
      CO2: [inputObj.CO2, Validators.required],
      SO2: [inputObj.SO2, Validators.required],
      O2: [inputObj.O2, Validators.required],

    });

    return form;
  }

  getSteamTemperatureValidators(steamCondition: number, settings: Settings): Array<ValidatorFn> {
    let steamTemperatureValidators: Array<ValidatorFn> = [];
    if (steamCondition == 0) {
      //TODO: CONVERT CALCULATOR TO USE STEAM UNITS..
      if (settings.unitsOfMeasure == 'Metric') {
        settings.steamTemperatureMeasurement = 'C';
      } else {
        settings.steamTemperatureMeasurement = 'F';
      }
      let tempRanges: { min: number, max: number } = this.steamService.getQuantityRange(settings, 0);
      steamTemperatureValidators = [Validators.min(tempRanges.min), Validators.max(tempRanges.max), Validators.required];
    }
    return steamTemperatureValidators;
  }

  getTemperatureValidators(tempMin: number, settings: Settings): Array<ValidatorFn> {
    let minTempConverted: number;
    if (settings.unitsOfMeasure != 'Imperial') {
      tempMin = this.convertUnitsService.value(tempMin).from('F').to('C');
      tempMin = Math.round(tempMin);
    }
    minTempConverted = tempMin;
    return [Validators.required, Validators.min(minTempConverted)];
  }

  getFeedwaterEconomizerInput(form: FormGroup): FeedwaterEconomizerInput {
    let obj: FeedwaterEconomizerInput = {
      operatingHours: form.controls.operatingHours.value,
      fuelCost: form.controls.fuelCost.value,
      materialTypeId: form.controls.materialTypeId.value,
      oxygenCalculationMethod: form.controls.oxygenCalculationMethod.value,
      flueGasTemperature: form.controls.flueGasTemperature.value,
      flueGasO2: form.controls.flueGasO2.value,
      excessAir: form.controls.excessAir.value,
      combustionAirTemperature: form.controls.combustionAirTemperature.value,
      ambientAirTemperature: form.controls.ambientAirTemperature.value,
      fuelTemp: form.controls.fuelTemp.value,
      moistureInCombustionAir: form.controls.moistureInCombustionAir.value,
      energyRateInput: form.controls.energyRateInput.value,
      steamPressure: form.controls.steamPressure.value,
      steamCondition: form.controls.steamCondition.value,
      steamTemperature: form.controls.steamTemperature.value,
      feedWaterTemperature: form.controls.feedWaterTemperature.value,
      percBlowdown: form.controls.percBlowdown.value,
      hxEfficiency: form.controls.hxEfficiency.value,
      higherHeatingVal: form.controls.higherHeatingVal.value,
      CH4: form.controls.CH4.value,
      C2H6: form.controls.C2H6.value,
      N2: form.controls.N2.value,
      H2: form.controls.H2.value,
      C3H8: form.controls.C3H8.value,
      C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
      H2O: form.controls.H2O.value,
      CO: form.controls.CO.value,
      CO2: form.controls.CO2.value,
      SO2: form.controls.SO2.value,
      O2: form.controls.O2.value
    };
    return obj;
  }

  getMaterialInputProperties(form: FormGroup): MaterialInputProperties {
    let input: MaterialInputProperties;
    input = {
      CH4: form.controls.CH4.value,
      C2H6: form.controls.C2H6.value,
      N2: form.controls.N2.value,
      H2: form.controls.H2.value,
      C3H8: form.controls.C3H8.value,
      C4H10_CnH2n: form.controls.C4H10_CnH2n.value,
      H2O: form.controls.H2O.value,
      CO: form.controls.CO.value,
      CO2: form.controls.CO2.value,
      SO2: form.controls.SO2.value,
      O2: form.controls.O2.value,
      o2InFlueGas: form.controls.flueGasO2.value,
      excessAir: form.controls.excessAir.value
    };

    return input;
  }

  checkWarnings(form: FormGroup, settings: Settings): FeedwaterEconomizerWarnings {
    if (form) {
      return {
        moistureInCombustionAir: this.checkMoistureInCombustionAir(form),
        percBlowdown: this.checkBlowdown(form),
        hxEfficiency: this.checkHxEfficiency(form),
        flueGasTemp: this.checkFlueGasTemp(form.controls.flueGasTemperature.value, settings),
        o2Warning: this.checkO2Warning(form)
      }
    } else {
      return {
        moistureInCombustionAir: null,
        percBlowdown: null,
        hxEfficiency: null,
        flueGasTemp: null,
        o2Warning: null
      }
    }
  }

  checkFlueGasTemp(flueGasTemperature: number, settings: Settings) {
    let flueGasTempMin: number = 212;
    if (settings.unitsOfMeasure == 'Metric') {
      flueGasTempMin = 100;
    }
    if (flueGasTemperature && flueGasTemperature < flueGasTempMin) {
      return `Flue Gas Temperature less than ${flueGasTempMin}, gases may be condensing in the
                flue and calculated efficiency may not be valid.`
    } else {
      return null;
    }
  }

  checkMoistureInCombustionAir(form: FormGroup): string {
    if (form.value.moistureInCombustionAir) {
      if (form.value.moistureInCombustionAir > 1) {
        return `Moisture In Combustion Air is usually 1 or lower`;
      }
    }
    return null;
  }

  checkBlowdown(form: FormGroup): string {
    if (form.value.percBlowdown) {
      if (form.value.percBlowdown > 20) {
        return `Boiler Blowdown Percentage of Feedwater is usually 20 or lower`;
      }
    }
    return null;
  }

  checkHxEfficiency(form: FormGroup): string {
    if (form.value.hxEfficiency) {
      if (form.value.hxEfficiency < 40 || form.value.hxEfficiency > 65) {
        return `Heat Exchanger Effectiveness is usually between 40 and 65`;
      }
    }
    return null;
  }

  checkO2Warning(form: FormGroup): string {
    if (form.controls.flueGasO2.value < 0 || form.controls.flueGasO2.value >= 21) {
      return 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
    } else {
      return null;
    }
  }

}

export interface FeedwaterEconomizerWarnings {
  moistureInCombustionAir: string,
  percBlowdown: string,
  hxEfficiency: string,
  o2Warning: string,
  flueGasTemp: string
}