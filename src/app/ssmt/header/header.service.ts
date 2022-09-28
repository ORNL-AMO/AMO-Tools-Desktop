import { Injectable, Input } from '@angular/core';
import { HeaderInput, HeaderNotHighestPressure, HeaderWithHighestPressure, BoilerInput, SSMT } from '../../shared/models/steam/ssmt';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { SteamService } from '../../calculator/steam/steam.service';
import { SaturatedPropertiesOutput } from '../../shared/models/steam/steam-outputs';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { LessThanValidator } from '../../shared/validators/less-than';

@Injectable()
export class HeaderService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initHeaderDataObj(): HeaderInput {
    return {
      numberOfHeaders: 1,
      highPressureHeader: undefined
    };
  }

  initHighestPressureHeaderForm(settings: Settings, boilerInput: BoilerInput, pressureMin?: number): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings, pressureMin, undefined);
    let form: FormGroup = this.formBuilder.group({
      pressure: [undefined, [Validators.required, LessThanValidator.lessThan(ranges.pressureMax), this.boilerTempValidator(boilerInput.steamTemperature, settings)]],
      processSteamUsage: [undefined, [Validators.required, Validators.min(ranges.processUsageMin)]],
      condensationRecoveryRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [.1, [Validators.required, Validators.min(0), Validators.max(10)]],
      condensateReturnTemperature: [undefined, [Validators.required, Validators.min(ranges.condensateReturnTempMin)]],
      flashCondensateReturn: [false, Validators.required],
    });

    form.controls.pressure.addValidators(this.getPressureMinValidators(pressureMin, boilerInput.deaeratorPressure, ranges, settings));
    form.controls.pressure.updateValueAndValidity()

    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
    return form;

  }

  getHighestPressureHeaderFormFromObj(obj: HeaderWithHighestPressure, settings: Settings, boilerInput: BoilerInput, pressureMin?: number): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings, pressureMin, undefined);
    let form: FormGroup = this.formBuilder.group({
      pressure: [obj.pressure, [Validators.required, LessThanValidator.lessThan(ranges.pressureMax), this.boilerTempValidator(boilerInput.steamTemperature, settings)]],
      processSteamUsage: [obj.processSteamUsage, [Validators.required, Validators.min(ranges.processUsageMin)]],
      condensationRecoveryRate: [obj.condensationRecoveryRate, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [obj.heatLoss, [Validators.required, Validators.min(0), Validators.max(10)]],
      condensateReturnTemperature: [obj.condensateReturnTemperature, [Validators.required, Validators.min(ranges.condensateReturnTempMin)]],
      flashCondensateReturn: [obj.flashCondensateReturn, Validators.required]
    });

    form.controls.pressure.addValidators(this.getPressureMinValidators(pressureMin, boilerInput.deaeratorPressure, ranges, settings));
    form.controls.pressure.updateValueAndValidity()
    
    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getHighestPressureObjFromForm(form: FormGroup): HeaderWithHighestPressure {
    return {
      pressure: form.controls.pressure.value,
      processSteamUsage: form.controls.processSteamUsage.value,
      condensationRecoveryRate: form.controls.condensationRecoveryRate.value,
      heatLoss: form.controls.heatLoss.value,
      condensateReturnTemperature: form.controls.condensateReturnTemperature.value,
      flashCondensateReturn: form.controls.flashCondensateReturn.value
    };
  }

  initHeaderForm(settings: Settings, useBaselineProcessSteamUsage: boolean, pressureMin: number, pressureMax: number, deaeratorPressure?: number): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings, undefined, pressureMin, pressureMax);
    let form: FormGroup = this.formBuilder.group({
      pressure: [undefined, [Validators.required, GreaterThanValidator.greaterThan(ranges.pressureMin), LessThanValidator.lessThan(ranges.pressureMax)]],
      processSteamUsage: [undefined, [Validators.required, Validators.min(ranges.processUsageMin)]],
      condensationRecoveryRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [.1, [Validators.required, Validators.min(0), Validators.max(10)]],
      flashCondensateIntoHeader: [false, Validators.required],
      desuperheatSteamIntoNextHighest: [false, Validators.required],
      desuperheatSteamTemperature: [undefined, [Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)]],
      useBaselineProcessSteamUsage: [useBaselineProcessSteamUsage]
    });

    form.controls.pressure.addValidators(this.getPressureMinValidators(pressureMin, deaeratorPressure, ranges, settings));
    form.controls.pressure.updateValueAndValidity()

    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getHeaderFormFromObj(obj: HeaderNotHighestPressure, settings: Settings, pressureMin: number, pressureMax: number, deaeratorPressure?: number): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings, pressureMin, pressureMax, obj.pressure);
    let tmpDesuperheatSteamTemperatureValidators: Array<ValidatorFn>;
    if (obj.desuperheatSteamIntoNextHighest) {
      tmpDesuperheatSteamTemperatureValidators = [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
    } else {
      tmpDesuperheatSteamTemperatureValidators = [Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
    }

    let form: FormGroup = this.formBuilder.group({
      pressure: [obj.pressure, [Validators.required]],
      processSteamUsage: [obj.processSteamUsage, [Validators.required, Validators.min(ranges.processUsageMin)]],
      condensationRecoveryRate: [obj.condensationRecoveryRate, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [obj.heatLoss, [Validators.required, Validators.min(0), Validators.max(10)]],
      flashCondensateIntoHeader: [obj.flashCondensateIntoHeader, Validators.required],
      desuperheatSteamIntoNextHighest: [obj.desuperheatSteamIntoNextHighest, Validators.required],
      desuperheatSteamTemperature: [obj.desuperheatSteamTemperature, tmpDesuperheatSteamTemperatureValidators],
      useBaselineProcessSteamUsage: [obj.useBaselineProcessSteamUsage]
    });

    form.controls.pressure.addValidators(this.getPressureMinValidators(pressureMin, deaeratorPressure, ranges, settings));
    form.controls.pressure.updateValueAndValidity()
    // only add validation if pressureMin/Max constraint fields have value
    if (pressureMax != undefined) {
      form.controls.pressure.addValidators(LessThanValidator.lessThan(ranges.pressureMax))
    }

    for (let key in form.controls) {
      if (form.controls[key]) {
        form.controls[key].markAsDirty();
      }
    }
    return form;
  }

  getPressureMinValidators(pressureMin: number, deaeratorPressure: number, ranges: HeaderRanges, settings: Settings): Array<ValidatorFn> {
    let validators: Array<ValidatorFn> = [];
    if (pressureMin != undefined && deaeratorPressure != undefined) {
      if (Math.max(pressureMin, deaeratorPressure) === pressureMin) {
        validators.push(GreaterThanValidator.greaterThan(ranges.pressureMin));
      } else {
        validators.push(this.deaeratorPressureValidator(deaeratorPressure, settings))
      }
    } else if (pressureMin != undefined) {
      validators.push(GreaterThanValidator.greaterThan(ranges.pressureMin));
    } else if (deaeratorPressure != undefined) {
      validators.push(this.deaeratorPressureValidator(deaeratorPressure, settings))
    }
    
    return validators;
  }

  initHeaderObjFromForm(form: FormGroup): HeaderNotHighestPressure {
    return {
      pressure: form.controls.pressure.value,
      processSteamUsage: form.controls.processSteamUsage.value,
      condensationRecoveryRate: form.controls.condensationRecoveryRate.value,
      heatLoss: form.controls.heatLoss.value,
      flashCondensateIntoHeader: form.controls.flashCondensateIntoHeader.value,
      desuperheatSteamIntoNextHighest: form.controls.desuperheatSteamIntoNextHighest.value,
      desuperheatSteamTemperature: form.controls.desuperheatSteamTemperature.value,
      useBaselineProcessSteamUsage: form.controls.useBaselineProcessSteamUsage.value
    };
  }

  getRanges(settings: Settings, pressureMin?: number, pressureMax?: number, headerPressure?: number): HeaderRanges {
    let tmpPressureMin: number = this.convertUnitsService.value(-14.5).from('psia').to(settings.steamPressureMeasurement);
    let tmpPressureMax: number = this.convertUnitsService.value(3185).from('psia').to(settings.steamPressureMeasurement);
    if (pressureMin > tmpPressureMin) {
      tmpPressureMin = pressureMin;
    }
    if (pressureMax < tmpPressureMax) {
      tmpPressureMax = pressureMax;
    }
    tmpPressureMax = this.convertUnitsService.roundVal(tmpPressureMax, 5);
    tmpPressureMin = this.convertUnitsService.roundVal(tmpPressureMin, 5);

    let tmpCondensateReturnTempMin: number = this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement);
    tmpCondensateReturnTempMin = this.convertUnitsService.roundVal(tmpCondensateReturnTempMin, 3);
    let tmpDesuperheatingTempMin: number = this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement);

    if (headerPressure) {
      tmpDesuperheatingTempMin = this.steamService.saturatedProperties(
        {
          saturatedPressure: headerPressure
        },
        0,
        settings
      ).saturatedTemperature;
    }
    tmpDesuperheatingTempMin = this.convertUnitsService.roundVal(tmpDesuperheatingTempMin, 1);
    let tmpDesuperheatingTempMax: number = this.convertUnitsService.value(1472).from('F').to(settings.temperatureMeasurement);
    tmpDesuperheatingTempMax = this.convertUnitsService.roundVal(tmpDesuperheatingTempMax, 1);


    // let tmpProcessUsageMin: number = this.convertUnitsService.value(0).from('klb').to(settings.steamMassFlowMeasurement);
    // tmpProcessUsageMin = this.convertUnitsService.roundVal(tmpProcessUsageMin, 0);
    let tmpProcessUsageMin: number = 0;
    let tmpProcessUsageMax: number = this.convertUnitsService.value(1000).from('klb').to(settings.steamMassFlowMeasurement);
    tmpProcessUsageMax = this.convertUnitsService.roundVal(tmpProcessUsageMax, 0);

    return {
      pressureMin: tmpPressureMin,
      pressureMax: tmpPressureMax,
      condensateReturnTempMin: tmpCondensateReturnTempMin,
      desuperheatingTempMin: tmpDesuperheatingTempMin,
      desuperheatingTempMax: tmpDesuperheatingTempMax,
      processUsageMax: tmpProcessUsageMax,
      processUsageMin: tmpProcessUsageMin
    };
  }

  isHeaderValid(headerInput: HeaderInput, ssmt: SSMT, settings: Settings, boilerInput: BoilerInput): boolean {
    let isHeaderValid: boolean;
    if (headerInput && headerInput.highPressureHeader) {
      isHeaderValid = true;
      let isHighPressureHeaderValid: boolean = true;
      let isMediumPressureHeaderValid: boolean = true;
      let isLowPressureHeaderValid: boolean = true;
      let highPressureMin: number;

      if (headerInput.numberOfHeaders == 2 && headerInput.lowPressureHeader) {
        let lowPressureMax: number = headerInput.highPressureHeader.pressure;
        isLowPressureHeaderValid = this.getHeaderFormFromObj(headerInput.lowPressureHeader, settings, undefined, lowPressureMax, ssmt.boilerInput.deaeratorPressure).valid;
        highPressureMin = headerInput.lowPressureHeader.pressure;
      } else if (headerInput.numberOfHeaders == 3 && headerInput.lowPressureHeader && headerInput.mediumPressureHeader) {
        let lowPressureMax: number = headerInput.mediumPressureHeader.pressure;
        isLowPressureHeaderValid = this.getHeaderFormFromObj(headerInput.lowPressureHeader, settings, undefined, lowPressureMax, ssmt.boilerInput.deaeratorPressure).valid;
        
        let mediumPressureMax: number = headerInput.highPressureHeader.pressure;
        isMediumPressureHeaderValid = this.getHeaderFormFromObj(headerInput.mediumPressureHeader, settings, headerInput.lowPressureHeader.pressure, mediumPressureMax, ssmt.boilerInput.deaeratorPressure).valid;
        highPressureMin = headerInput.mediumPressureHeader.pressure;
      }
      isHighPressureHeaderValid = this.getHighestPressureHeaderFormFromObj(headerInput.highPressureHeader, settings, boilerInput, highPressureMin).valid;

      isHeaderValid = isHighPressureHeaderValid && isMediumPressureHeaderValid && isLowPressureHeaderValid;
   
    } 
    return isHeaderValid;
  }

  deaeratorPressureValidator(deaeratorPressure: number, settings: Settings): ValidatorFn {
    return (valueControl: AbstractControl): { [key: string]: { val: number } } => {
      if (valueControl.value !== '' && valueControl.value !== null) {
        try {
          // Need conversion?
          if (valueControl.value > deaeratorPressure) {
            return undefined;
          }
        }
        catch (e) {
          console.log(e);
          return {
            deaeratorPressure: { val: deaeratorPressure }
          };
        }
        return {
          deaeratorPressure: { val: deaeratorPressure }
        };
      }
      else {
        return undefined;
      }
    };
  }


  boilerTempValidator(boilerTemp: number, settings: Settings): ValidatorFn {
    return (valueControl: AbstractControl): { [key: string]: { val: number } } => {
      if (valueControl.value !== '' && valueControl.value !== null) {
        let saturatedProperties: SaturatedPropertiesOutput = this.steamService.saturatedProperties(
          {
            saturatedPressure: valueControl.value
          },
          0,
          settings
        )
        try {
          if (saturatedProperties.saturatedTemperature < boilerTemp) {
            return undefined;
          }
        }
        catch (e) {
          console.log(e);
          return {
            boilerTemp: { val: saturatedProperties.saturatedTemperature }
          };
        }
        return {
          boilerTemp: { val: saturatedProperties.saturatedTemperature }
        };
      }
      else {
        return undefined;
      }
    };
  }

  checkHeaderWarnings(ssmt: SSMT, pressureLevel: string, settings: Settings): HeaderWarnings {
    let condensateReturnTemperature: string;
    if (pressureLevel == 'highPressure') {
      condensateReturnTemperature = this.checkReturnCondensateTemperature(ssmt, settings);
    }
    return {
      headerPressure: this.checkHeaderPressure(ssmt, pressureLevel, settings),
      condensateReturnTemperature: condensateReturnTemperature
    };
  }


  checkHeaderPressure(ssmt: SSMT, pressureLevel: string, settings: Settings): string {
    let warning: string = null;
    if (pressureLevel && pressureLevel !== 'mediumPressure'
      && ssmt && ssmt.boilerInput.blowdownFlashed != undefined) {

      if (ssmt.boilerInput.preheatMakeupWater == true) {
        let pressure: number;
        let saturatedTemperature: number;
        let headerType: string;

        if (ssmt.boilerInput.blowdownFlashed == false && pressureLevel === 'highPressure') {
          headerType = 'high';
          let hasHeaderInputs: boolean = ssmt.headerInput.highPressureHeader !== undefined && ssmt.headerInput.highPressure !== undefined && ssmt.headerInput.lowPressureHeader !== undefined && ssmt.headerInput.lowPressure !== undefined;
          if (hasHeaderInputs) {
            if (ssmt.headerInput.highPressureHeader.pressure) {
              pressure = ssmt.headerInput.highPressureHeader.pressure;
            } else if (ssmt.headerInput.highPressure) {
              pressure = ssmt.headerInput.highPressure.pressure;
            }
          }
        } else if (ssmt.boilerInput.blowdownFlashed == true && pressureLevel == 'lowPressure') {
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
          if (ssmt.boilerInput.approachTemperature > maxValue) {
            warning = `Approach temperature must less than the difference between the temperature into the heat exchanger (Saturation temperature of ${headerType} pressure header) and the makeup water temperature (${maxValue})`;
          }
        }
      }
    }
    return warning;
  }

  checkReturnCondensateTemperature(ssmt: SSMT, settings: Settings): string {
    let warning: string = null;
    let lowPressureHeaderPressure: number;
    if (ssmt.headerInput.numberOfHeaders == 1 && ssmt.headerInput.highPressureHeader) {
      lowPressureHeaderPressure = ssmt.headerInput.highPressureHeader.pressure;
    } else if (ssmt.headerInput.lowPressureHeader) {
      lowPressureHeaderPressure = ssmt.headerInput.lowPressureHeader.pressure;
    }
    let tmpCondensateReturnTempMax: number;
    if (lowPressureHeaderPressure != undefined) {
      let satPropertiesOutput: SaturatedPropertiesOutput = this.steamService.saturatedProperties(
        {
          saturatedPressure: lowPressureHeaderPressure
        },
        0,
        settings
      );
      tmpCondensateReturnTempMax = this.convertUnitsService.roundVal(satPropertiesOutput.saturatedTemperature, 0);
    }
    if (tmpCondensateReturnTempMax != undefined) {
      if (tmpCondensateReturnTempMax && ssmt.headerInput.highPressureHeader && ssmt.headerInput.highPressureHeader.condensateReturnTemperature) {
        if (ssmt.headerInput.highPressureHeader.condensateReturnTemperature > tmpCondensateReturnTempMax) {
          warning = 'Value should be lower than saturation temperature at lowest pressure header. ' + tmpCondensateReturnTempMax;
        }
      }
    }
    return warning;
  }

}


export interface HeaderRanges {
  pressureMin: number;
  pressureMax: number;
  condensateReturnTempMin: number;
  desuperheatingTempMin: number;
  desuperheatingTempMax: number;
  processUsageMin: number;
  processUsageMax: number;
}

export interface HeaderWarnings {
  headerPressure?: string,
  condensateReturnTemperature?: string
}