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

  private readonly baselineSaturatedPropertiesOutput = new BehaviorSubject<SaturatedPropertiesOutput>(undefined);
  readonly baselineSaturatedPropertiesOutput$ = this.baselineSaturatedPropertiesOutput.asObservable();

  private readonly modificationSaturatedPropertiesOutput = new BehaviorSubject<SaturatedPropertiesOutput>(undefined);
  readonly modificationSaturatedPropertiesOutput$ = this.modificationSaturatedPropertiesOutput.asObservable();

  constructor(private formBuilder: UntypedFormBuilder, private steamService: SteamService, private convertUnitsService: ConvertUnitsService) { }

  initEmptyForm(settings: Settings) {
    let tmpRanges: BoilerRanges = this.getRanges(settings);
    
    const form = this.formBuilder.group({
      'fuelType': [1, Validators.required],
      'fuel': [1, Validators.required],
      'combustionEfficiency': [85, [Validators.required, Validators.min(50), Validators.max(100)]],
      'blowdownRate': ['', [Validators.required, Validators.min(0), Validators.max(25)]],
      'blowdownFlashed': [false, [Validators.required]],
      'preheatMakeupWater': [false, [Validators.required]],
      'steamQuality': [SteamQuality.SATURATED, [Validators.required]],
      'pressureOrTemperature': [SteamPressureOrTemp.TEMPERATURE, [Validators.required]],
      'saturatedPressure': ['', [Validators.required]],
      'steamTemperature': ['', [Validators.required, Validators.min(tmpRanges.steamTemperatureMin), Validators.max(tmpRanges.steamTemperatureMax)]],
      'deaeratorVentRate': ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      'deaeratorPressure': ['', [Validators.required, Validators.min(tmpRanges.deaeratorPressureMin), Validators.max(tmpRanges.deaeratorPressureMax)]],
      'approachTemperature': ['', [Validators.min(0.000005)]],
      'blowdownConductivity': [''],
      'feedwaterConductivity': ['']
    });

    this.setSteamTemperatureValidators(form, settings);

    return form;
  }

  initFormFromBoilerInput(obj: BoilerInput, settings: Settings): UntypedFormGroup {
    let tmpRanges: BoilerRanges = this.getRanges(settings);

    let approachTempValidators: Array<ValidatorFn> = [];
    if (obj.preheatMakeupWater) {
      approachTempValidators = [Validators.min(0.000005), Validators.required];
    }
    
    let form: UntypedFormGroup = this.formBuilder.group({
      'fuelType': [obj.fuelType, Validators.required],
      'fuel': [obj.fuel, Validators.required],
      'combustionEfficiency': [obj.combustionEfficiency, [Validators.required, Validators.min(50), Validators.max(100)]],
      'blowdownRate': [obj.blowdownRate, [Validators.required, Validators.min(0), Validators.max(25)]],
      'blowdownFlashed': [obj.blowdownFlashed, [Validators.required]],
      'preheatMakeupWater': [obj.preheatMakeupWater, [Validators.required]],
      'steamQuality': [obj.steamQuality, [Validators.required]],
      'pressureOrTemperature': [obj.pressureOrTemperature, [Validators.required]],
      'saturatedPressure': [obj.saturatedPressure, [Validators.required]],
      'steamTemperature': [obj.steamTemperature, [Validators.required]],
      'deaeratorVentRate': [obj.deaeratorVentRate, [Validators.required, Validators.min(0), Validators.max(10)]],
      'deaeratorPressure': [obj.deaeratorPressure, [Validators.required, Validators.min(tmpRanges.deaeratorPressureMin), Validators.max(tmpRanges.deaeratorPressureMax)]],
      'approachTemperature': [obj.approachTemperature, approachTempValidators],
      'blowdownConductivity': [obj.blowdownConductivity],
      'feedwaterConductivity': [obj.feedwaterConductivity]
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
    this.setPressureAndTemperatureValidators(form, settings);
  }

  setPressureAndTemperatureValidators(form: UntypedFormGroup, settings: Settings) {
    const steamQualityControl = form.controls.steamQuality;
    const pressureOrTemperatureControl = form.controls.pressureOrTemperature;
    const steamTemperatureControl = form.controls.steamTemperature;
    const saturatedPressureControl = form.controls.saturatedPressure;

    const saturatedPropertiesInput: SaturatedPropertiesInput = {
     saturatedPressure: saturatedPressureControl.value,
     saturatedTemperature: steamQualityControl.value
   }
    const saturatedPropertiesOutput: SaturatedPropertiesOutput = this.steamService.saturatedProperties(saturatedPropertiesInput, pressureOrTemperatureControl.value, settings);

    if (steamQualityControl.value === SteamQuality.SUPERHEATED) {
      this.setSaturatedPressureValidators(form, settings, saturatedPropertiesOutput);
      this.setSteamTemperatureValidators(form, settings, saturatedPropertiesOutput);

    } else if (steamQualityControl.value === SteamQuality.SATURATED) {
      if (pressureOrTemperatureControl.value === SteamPressureOrTemp.PRESSURE) {
        this.setSaturatedPressureValidators(form, settings, saturatedPropertiesOutput);
        steamTemperatureControl.clearValidators();
      } else if (pressureOrTemperatureControl.value === SteamPressureOrTemp.TEMPERATURE) {
        this.setSteamTemperatureValidators(form, settings, saturatedPropertiesOutput);
        saturatedPressureControl.clearValidators();
      }
    }
      
    saturatedPressureControl.updateValueAndValidity();
    steamTemperatureControl.updateValueAndValidity();
  }

  setSteamTemperatureValidators(form: UntypedFormGroup, settings: Settings, saturatedPropertiesOutput?: SaturatedPropertiesOutput) {
    const validRanges: BoilerRanges = this.getRanges(settings);
    if (form.controls.steamQuality.value === SteamQuality.SATURATED) {
      // * use constant of temprature output from steam critical pressure at 3185.415 psig - per expert review
      let temperatureMax: number = 705.1;
      if (settings.steamTemperatureMeasurement !== 'F') {
        temperatureMax = this.convertUnitsService.value(temperatureMax).from('F').to(settings.steamTemperatureMeasurement);
      }
      form.controls.steamTemperature.setValidators([Validators.required, Validators.min(roundVal(saturatedPropertiesOutput.saturatedTemperature, 4)), Validators.max(temperatureMax)]);
    } else  {
      form.controls.steamTemperature.setValidators([Validators.required, Validators.min(validRanges.steamTemperatureMin), Validators.max(validRanges.steamTemperatureMax)]);
    }

    form.controls.steamTemperature.updateValueAndValidity();
  }

  setSaturatedPressureValidators(form: UntypedFormGroup, settings: Settings, saturatedPropertiesOutput?: SaturatedPropertiesOutput) {
    // todo what is 0
    const validRanges: SteamPropertiesValidationRanges = this.steamService.getSteamPropertiesValidationRanges(0, settings);
    if (form.controls.steamQuality.value === SteamQuality.SATURATED) {
      // * use constant steam critical pressure as 3185.415 psig - per expert review
      let pressureMax: number = 3185.415;
      // * 0 psia
      let pressureMin: number = 0;
      if (settings.steamPressureMeasurement !== 'psig') {
        pressureMax = this.convertUnitsService.value(pressureMax).from('psig').to(settings.steamPressureMeasurement);
      }
      if (settings.steamPressureMeasurement !== 'psia') {
        pressureMin = this.convertUnitsService.value(pressureMin).from('psia').to(settings.steamPressureMeasurement);
      }
      form.controls.saturatedPressure.setValidators([Validators.required, Validators.min(pressureMin), Validators.max(pressureMax)]);
    } else if (form.controls.steamQuality.value === SteamQuality.SUPERHEATED) {
      let minPressure: number = validRanges.minPressure;
      if (saturatedPropertiesOutput && saturatedPropertiesOutput.saturatedTemperature > minPressure) {
        minPressure = roundVal(saturatedPropertiesOutput.saturatedTemperature, 2);
      }
      form.controls.saturatedPressure.setValidators([Validators.required, GreaterThanValidator.greaterThan(minPressure), Validators.max(validRanges.maxPressure)]);
    }

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
        boilerInput.steamTemperature = saturatedPropertiesOutput.saturatedTemperature;
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
      feedwaterConductivity: form.controls.feedwaterConductivity.value
    };
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

    return {
      steamTemperatureMin: tmpSteamTemperatureMin,
      steamTemperatureMax: tmpSteamTemperatureMax,
      deaeratorPressureMin: tmpDeaeratorPressureMin,
      deaeratorPressureMax: tmpDeaeratorPressureMax
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