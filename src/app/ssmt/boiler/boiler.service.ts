import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { BoilerInput, SSMT, SteamPropertiesValidationRanges } from '../../shared/models/steam/ssmt';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { SteamService } from '../../calculator/steam/steam.service';
import { SaturatedPropertiesInput, SteamPressureOrTemp, SteamQuality } from '../../shared/models/steam/steam-inputs';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { SaturatedPropertiesOutput } from '../../shared/models/steam/steam-outputs';
import { roundVal } from '../../shared/helperFunctions';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class BoilerService {
private readonly BOILER_PRESSURE_EXCLUSIVE_MIN_PSIG = -14.696;
private readonly SATURATED_BOILER_PRESSURE_MAX_PSIG = 3185.415389;
private readonly SUPERHEATED_BOILER_PRESSURE_MAX_PSIG = 14489.072078;
  
  private readonly STEAM_TEMPERATURE_MIN_F = 32;
  private readonly SUPERHEATED_STEAM_TEMPERATURE_MAX_F = 1472;
  private readonly SATURATED_STEAM_TEMPERATURE_MAX_F = 705.1;

  private readonly baselineSaturatedPropertiesOutput = new BehaviorSubject<SaturatedPropertiesOutput>(undefined);
  readonly baselineSaturatedPropertiesOutput$ = this.baselineSaturatedPropertiesOutput.asObservable();

  private readonly modificationSaturatedPropertiesOutput = new BehaviorSubject<SaturatedPropertiesOutput>(undefined);
  readonly modificationSaturatedPropertiesOutput$ = this.modificationSaturatedPropertiesOutput.asObservable();

  constructor(private formBuilder: UntypedFormBuilder, private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  initEmptyForm(settings: Settings) {
    let tmpRanges: BoilerRanges = this.getRanges(settings);
    
    const form = this.formBuilder.group({
      fuelType: [1, Validators.required],
      fuel: [1, Validators.required],
      combustionEfficiency: [85, [Validators.required, Validators.min(50), Validators.max(100)]],
      blowdownRate: ['', [Validators.required, Validators.min(0), Validators.max(25)]],
      blowdownFlashed: [false, [Validators.required]],
      preheatMakeupWater: [false, [Validators.required]],
      steamQuality: [SteamQuality.SATURATED, [Validators.required]],
      pressureOrTemperature: [SteamPressureOrTemp.PRESSURE, [Validators.required]],
      saturatedPressure: ['', [Validators.required]],
      steamTemperature: ['', [Validators.required]],
      deaeratorVentRate: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      deaeratorPressure: ['', [Validators.required, Validators.min(tmpRanges.deaeratorPressureMin), Validators.max(tmpRanges.deaeratorPressureMax)]],
      approachTemperature: ['', [Validators.min(0.000005)]],
      blowdownConductivity: [''],
      feedwaterConductivity: [''],
      sendBlowdownToDeaerator: [false]
    });

    this.setSaturatedBoilerPressureValidators(form, settings);

    return form;
  }

  initFormFromBoilerInput(obj: BoilerInput, settings: Settings): UntypedFormGroup {
    let tmpRanges: BoilerRanges = this.getRanges(settings);

    let approachTempValidators: Array<ValidatorFn> = [];
    if (obj.preheatMakeupWater) {
      approachTempValidators = [Validators.min(0.000005), Validators.required];
    }
    
    let form: UntypedFormGroup = this.formBuilder.group({
      fuelType: [obj.fuelType, Validators.required],
      fuel: [obj.fuel, Validators.required],
      combustionEfficiency: [obj.combustionEfficiency, [Validators.required, Validators.min(50), Validators.max(100)]],
      blowdownRate: [obj.blowdownRate, [Validators.required, Validators.min(0), Validators.max(25)]],
      blowdownFlashed: [obj.blowdownFlashed, [Validators.required]],
      preheatMakeupWater: [obj.preheatMakeupWater, [Validators.required]],
      steamQuality: [obj.steamQuality, [Validators.required]],
      pressureOrTemperature: [obj.pressureOrTemperature, [Validators.required]],
      saturatedPressure: [obj.saturatedPressure, [Validators.required]],
      steamTemperature: [obj.steamTemperature, [Validators.required]],
      deaeratorVentRate: [obj.deaeratorVentRate, [Validators.required, Validators.min(0), Validators.max(10)]],
      deaeratorPressure: [obj.deaeratorPressure, [Validators.required, Validators.min(tmpRanges.deaeratorPressureMin), Validators.max(tmpRanges.deaeratorPressureMax)]],
      approachTemperature: [obj.approachTemperature, approachTempValidators],
      blowdownConductivity: [obj.blowdownConductivity],
      feedwaterConductivity: [obj.feedwaterConductivity],
      sendBlowdownToDeaerator: [obj.sendBlowdownToDeaerator]
    });

    this.setPressureAndTemperatureValidators(form, settings);

    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
  }

  updateFormAndRelatedState(form: UntypedFormGroup, ssmt: SSMT, settings: Settings, isBaseline: boolean) {
    let calculatedBoilerInput: BoilerInput = form.getRawValue();
    this.setBoilerRelatedSSMTFields(calculatedBoilerInput, ssmt, settings, isBaseline);

    if (form.controls.steamQuality.value === SteamQuality.SATURATED) {
      if (form.controls.pressureOrTemperature.value === SteamPressureOrTemp.PRESSURE) {
        form.controls.steamTemperature.patchValue(calculatedBoilerInput.steamTemperature);
      } else {
        form.controls.saturatedPressure.patchValue(calculatedBoilerInput.saturatedPressure);
      }
    }
    this.setPressureAndTemperatureValidators(form, settings, isBaseline);
  }

  setPressureAndTemperatureValidators(form: UntypedFormGroup, settings: Settings, isBaseline: boolean = true) {
    const steamQualityControl = form.controls.steamQuality;
    const pressureOrTemperatureControl = form.controls.pressureOrTemperature;
    const steamTemperatureControl = form.controls.steamTemperature;
    const saturatedPressureControl = form.controls.saturatedPressure;

    const saturatedPropertiesInput: SaturatedPropertiesInput = {
      saturatedPressure: saturatedPressureControl.value,
      saturatedTemperature: steamTemperatureControl.value
    }

    const saturatedPropertiesOutput: SaturatedPropertiesOutput = this.steamService.saturatedProperties(saturatedPropertiesInput, SteamPressureOrTemp.PRESSURE, settings);
    if (steamQualityControl.value === SteamQuality.SUPERHEATED) {
      this.setSuperheatedBoilerPressureValidators(form, settings);
      this.setSuperheatedTemperatureValidators(form, settings, saturatedPropertiesOutput);
    } else if (steamQualityControl.value === SteamQuality.SATURATED) {
      if (isBaseline) {
        this.baselineSaturatedPropertiesOutput.next(saturatedPropertiesOutput);
      } else {
        this.modificationSaturatedPropertiesOutput.next(saturatedPropertiesOutput);
      }

      if (pressureOrTemperatureControl.value === SteamPressureOrTemp.PRESSURE) {
        this.setSaturatedBoilerPressureValidators(form, settings);
        steamTemperatureControl.clearValidators();
      } else if (pressureOrTemperatureControl.value === SteamPressureOrTemp.TEMPERATURE) {
        this.setSaturatedTemperatureValidators(form, settings);
        saturatedPressureControl.clearValidators();
      }
    }
  }


  setSaturatedTemperatureValidators(form: UntypedFormGroup, settings: Settings) {
    let temperatureMin: number = this.STEAM_TEMPERATURE_MIN_F;
    let temperatureMax: number = this.SATURATED_STEAM_TEMPERATURE_MAX_F;
     if (settings.steamTemperatureMeasurement !== 'F') {
        temperatureMin = this.convertUnitsService.value(temperatureMin).from('F').to(settings.steamTemperatureMeasurement);
        temperatureMax = this.convertUnitsService.value(temperatureMax).from('F').to(settings.steamTemperatureMeasurement);
      }
      form.controls.steamTemperature.setValidators([Validators.required, Validators.min(temperatureMin), Validators.max(temperatureMax)]);
    form.controls.steamTemperature.updateValueAndValidity();
  }

    setSuperheatedBoilerPressureValidators(form: UntypedFormGroup, settings: Settings) {
    let pressureExclusiveMin: number = this.BOILER_PRESSURE_EXCLUSIVE_MIN_PSIG;
    let pressureMax: number = this.SUPERHEATED_BOILER_PRESSURE_MAX_PSIG;
    if (settings.steamPressureMeasurement !== 'psig') {
      pressureExclusiveMin = this.convertUnitsService.value(pressureExclusiveMin).from('psig').to(settings.steamPressureMeasurement);
      pressureMax = this.convertUnitsService.value(pressureMax).from('psig').to(settings.steamPressureMeasurement);
    }

    form.controls.saturatedPressure.setValidators([Validators.required, GreaterThanValidator.greaterThan(pressureExclusiveMin), Validators.max(pressureMax)]);
    form.controls.saturatedPressure.updateValueAndValidity();
  }

  setSuperheatedTemperatureValidators(form: UntypedFormGroup, settings: Settings, saturatedPropertiesOutput?: SaturatedPropertiesOutput) {
    let temperatureMin: number = this.STEAM_TEMPERATURE_MIN_F;
    let temperatureMax: number = this.SUPERHEATED_STEAM_TEMPERATURE_MAX_F;
     if (settings.steamTemperatureMeasurement !== 'F') {
        temperatureMin = this.convertUnitsService.value(temperatureMin).from('F').to(settings.steamTemperatureMeasurement);
        temperatureMax = this.convertUnitsService.value(temperatureMax).from('F').to(settings.steamTemperatureMeasurement);
      }
      let validators = [Validators.required, Validators.min(temperatureMin), Validators.max(temperatureMax)];

      // * steamTemperature can't be calculated ((will be NAN)) for reference when saturatedPressure is at min
      if (!form.get('saturatedPressure').errors?.greaterThan && !isNaN(saturatedPropertiesOutput.saturatedTemperature)) {
        validators.push(GreaterThanValidator.greaterThan(roundVal(saturatedPropertiesOutput.saturatedTemperature, 1)));
      }
      form.controls.steamTemperature.setValidators(validators);
    form.controls.steamTemperature.updateValueAndValidity();
  }

  setSaturatedBoilerPressureValidators(form: UntypedFormGroup, settings: Settings) {
    let pressureExclusiveMin: number = this.BOILER_PRESSURE_EXCLUSIVE_MIN_PSIG;
    let pressureMax: number = this.SATURATED_BOILER_PRESSURE_MAX_PSIG;
    if (settings.steamPressureMeasurement !== 'psig') {
      pressureExclusiveMin = this.convertUnitsService.value(pressureExclusiveMin).from('psig').to(settings.steamPressureMeasurement);
      pressureMax = this.convertUnitsService.value(pressureMax).from('psig').to(settings.steamPressureMeasurement);
    }

    form.controls.saturatedPressure.setValidators([Validators.required, GreaterThanValidator.greaterThan(pressureExclusiveMin), Validators.max(pressureMax)]);
    form.controls.saturatedPressure.updateValueAndValidity();
  }

   /**
  * Updates related SSMT fields on separate forms
 * 
 * Header pressure should be set from either the user entered boiler pressure, or the output pressure from saturated properties using boiler fields as input. 
 * boiler temperature will be shown as a result on the highest pressure header form
 */
  setBoilerRelatedSSMTFields(boilerInput: BoilerInput, ssmt: SSMT, settings: Settings, isBaseline: boolean) {
    let saturatedPropertiesOutput: SaturatedPropertiesOutput;
    if (boilerInput.steamQuality === SteamQuality.SATURATED) {
      const input: SaturatedPropertiesInput = {
        saturatedTemperature: boilerInput.steamTemperature,
        saturatedPressure: boilerInput.saturatedPressure,
      };

      saturatedPropertiesOutput = this.steamService.saturatedProperties(input, boilerInput.pressureOrTemperature, settings);
      if (boilerInput.pressureOrTemperature === SteamPressureOrTemp.PRESSURE) {
        boilerInput.steamTemperature = roundVal(saturatedPropertiesOutput.saturatedTemperature, 0);
      } else {
        boilerInput.saturatedPressure = saturatedPropertiesOutput.saturatedPressure;
      }

      if (ssmt.headerInput && ssmt.headerInput.highPressureHeader) {
        ssmt.headerInput.highPressureHeader.pressure = saturatedPropertiesOutput.saturatedPressure;
      }
    } else {
      if (ssmt.headerInput && ssmt.headerInput.highPressureHeader) {
        ssmt.headerInput.highPressureHeader.pressure = boilerInput.saturatedPressure;
      }
    }

    if (isBaseline) {
      this.baselineSaturatedPropertiesOutput.next(saturatedPropertiesOutput);
    } else {
      this.modificationSaturatedPropertiesOutput.next(saturatedPropertiesOutput);
    }
  }

  initializeSSMTCalculatedFields(boilerInput: BoilerInput, ssmt: SSMT, settings: Settings, isBaseline: boolean) {
    if (!this.baselineSaturatedPropertiesOutput.getValue()) {
      this.setBoilerRelatedSSMTFields(boilerInput, ssmt, settings, isBaseline);
    }
    if (!this.modificationSaturatedPropertiesOutput.getValue()) {
      this.modificationSaturatedPropertiesOutput.next(this.baselineSaturatedPropertiesOutput.getValue());
    }
  }

  setDefaultModificationSaturatedPropertiesOutput() {
    if (!this.modificationSaturatedPropertiesOutput.getValue()) {
      this.modificationSaturatedPropertiesOutput.next(this.baselineSaturatedPropertiesOutput.getValue());
    }
  }

  initObjFromForm(form: UntypedFormGroup): BoilerInput {
    return {
      fuelType: form.controls.fuelType.value,
      fuel: form.controls.fuel.value,
      combustionEfficiency: form.controls.combustionEfficiency.value,
      blowdownRate: form.controls.blowdownRate.value,
      blowdownFlashed: form.controls.blowdownFlashed.value,
      preheatMakeupWater: form.controls.preheatMakeupWater.value,
      steamQuality: form.controls.steamQuality.value,
      pressureOrTemperature: form.controls.pressureOrTemperature.value,
      saturatedPressure: form.controls.saturatedPressure.value,
      steamTemperature: form.controls.steamTemperature.value,
      deaeratorVentRate: form.controls.deaeratorVentRate.value,
      deaeratorPressure: form.controls.deaeratorPressure.value,
      approachTemperature: form.controls.approachTemperature.value,
      blowdownConductivity: form.controls.blowdownConductivity.value,
      feedwaterConductivity: form.controls.feedwaterConductivity.value,
      sendBlowdownToDeaerator: form.controls.sendBlowdownToDeaerator.value
    };
  }

  getRanges(settings: Settings): BoilerRanges {
    let tmpSteamTemperatureMin: number = this.convertUnitsService.value(0).from('F').to(settings.steamTemperatureMeasurement);
    tmpSteamTemperatureMin = this.convertUnitsService.roundVal(tmpSteamTemperatureMin, 0);
    let tmpSteamTemperatureMax: number = this.convertUnitsService.value(1472).from('F').to(settings.steamTemperatureMeasurement);
    tmpSteamTemperatureMax = this.convertUnitsService.roundVal(tmpSteamTemperatureMax, 0);

    let boilerPressureExclusiveMin: number = this.convertUnitsService.value(this.BOILER_PRESSURE_EXCLUSIVE_MIN_PSIG).from('psig').to(settings.steamPressureMeasurement);
    boilerPressureExclusiveMin = this.convertUnitsService.roundVal(boilerPressureExclusiveMin, 0);
    // * Starting value assumes Saturated conditions 
    let boilerPressureMax: number = this.convertUnitsService.value(this.SATURATED_BOILER_PRESSURE_MAX_PSIG).from('psig').to(settings.steamPressureMeasurement);
    boilerPressureMax = this.convertUnitsService.roundVal(boilerPressureMax, 0);

    return {
      steamTemperatureMin: tmpSteamTemperatureMin,
      steamTemperatureMax: tmpSteamTemperatureMax,
      deaeratorPressureMin: boilerPressureExclusiveMin,
      deaeratorPressureMax: boilerPressureMax
    };
  }


  isBoilerValid(boilerInput: BoilerInput, settings: Settings): boolean {
    if (boilerInput) {
      let form: UntypedFormGroup = this.initFormFromBoilerInput(boilerInput, settings);
      return form.valid;
    } else {
      return false;
    }
  }

  checkBoilerWarnings(boilerForm: UntypedFormGroup, ssmt: SSMT, settings: Settings): BoilerWarnings {
    return {
      approachTemperature: this.checkApproachTempWarning(boilerForm, ssmt, settings)
    };
  }


  checkApproachTempWarning(boilerForm: UntypedFormGroup, ssmt: SSMT, settings: Settings) {
    let warning = null;
    if (boilerForm.controls.preheatMakeupWater.value == true) {
      let pressure: number;
      let saturatedTemperature: number;
      let headerType: string;

      if (boilerForm.controls.blowdownFlashed.value == false) {
        headerType = 'high';
        if (ssmt.headerInput.highPressureHeader) {
          pressure = ssmt.headerInput.highPressureHeader.pressure;
        } else if (ssmt.headerInput.highPressure) {
          pressure = ssmt.headerInput.highPressure.pressure;
        }
      } else if (boilerForm.controls.blowdownFlashed.value == true) {
        headerType = 'low';
        if (ssmt.headerInput.lowPressureHeader) {
          pressure = ssmt.headerInput.lowPressureHeader.pressure;
        } else if (ssmt.headerInput.lowPressure) {
          pressure = ssmt.headerInput.lowPressure.pressure;
        }
      }
      
      if (pressure) {
        saturatedTemperature = this.steamService.saturatedProperties({ saturatedPressure: pressure }, 0, settings).saturatedTemperature;
        saturatedTemperature = this.convertUnitsService.roundVal(saturatedTemperature, 0);
        let maxValue = saturatedTemperature - ssmt.generalSteamOperations.makeUpWaterTemperature;
        if (boilerForm.controls.approachTemperature.value > maxValue) {
          warning = `Approach temperature must be less than the difference between the temperature into the heat exchanger (Saturation temperature of ${headerType} pressure header) and the makeup water temperature (${maxValue}`;
        }
      }
    }
    return warning;
  }

}

export interface BoilerRanges {
  steamTemperatureMin: number;
  steamTemperatureMax: number;
  deaeratorPressureMin: number;
  deaeratorPressureMax: number;
}


export interface BoilerWarnings {
  approachTemperature?: string;
  makeUpWaterTemperature?: string;
  headerPressure?: string;
}