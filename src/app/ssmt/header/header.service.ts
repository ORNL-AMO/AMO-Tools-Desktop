import { Injectable, Input } from '@angular/core';
import { HeaderInput, HeaderNotHighestPressure, HeaderWithHighestPressure, BoilerInput, SSMT } from '../../shared/models/steam/ssmt';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { SteamService } from '../../calculator/steam/steam.service';
import { SaturatedPropertiesOutput } from '../../shared/models/steam/steam-outputs';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { LessThanValidator } from '../../shared/validators/less-than';
import { BoilerWarnings } from '../boiler/boiler.service';

@Injectable()
export class HeaderService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private steamService: SteamService) { }

  initHeaderDataObj(): HeaderInput {
    return {
      numberOfHeaders: 1,
      highPressureHeader: undefined
    };
  }

  initHighestPressureHeaderForm(settings: Settings, boilerInput: BoilerInput, minPressure?: number): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings, minPressure, undefined);

    let form: FormGroup = this.formBuilder.group({
      pressure: [undefined, [Validators.required, GreaterThanValidator.greaterThan(ranges.pressureMin), LessThanValidator.lessThan(ranges.pressureMax), this.boilerTempValidator(boilerInput.steamTemperature, settings)]],
      processSteamUsage: [undefined, [Validators.required, Validators.min(ranges.processUsageMin)]],
      condensationRecoveryRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [.1, [Validators.required, Validators.min(0), Validators.max(10)]],
      condensateReturnTemperature: [undefined, [Validators.required, Validators.min(ranges.condensateReturnTempMin)]],
      flashCondensateReturn: [false, Validators.required],
    });
    return form;

  }

  getHighestPressureHeaderFormFromObj(obj: HeaderWithHighestPressure, settings: Settings, boilerInput: BoilerInput, minPressure?: number): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings, minPressure, undefined);
    let form: FormGroup = this.formBuilder.group({
      pressure: [obj.pressure, [Validators.required, GreaterThanValidator.greaterThan(ranges.pressureMin), LessThanValidator.lessThan(ranges.pressureMax), this.boilerTempValidator(boilerInput.steamTemperature, settings)]],
      processSteamUsage: [obj.processSteamUsage, [Validators.required, Validators.min(ranges.processUsageMin)]],
      condensationRecoveryRate: [obj.condensationRecoveryRate, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [obj.heatLoss, [Validators.required, Validators.min(0), Validators.max(10)]],
      condensateReturnTemperature: [obj.condensateReturnTemperature, [Validators.required, Validators.min(ranges.condensateReturnTempMin)]],
      flashCondensateReturn: [obj.flashCondensateReturn, Validators.required]
    });
    for (let key in form.controls) {
      form.controls[key].markAsDirty();
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

  initHeaderForm(settings: Settings, useBaselineProcessSteamUsage: boolean, pressureMin?: number, pressureMax?: number): FormGroup {
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
    return form;
  }

  getHeaderFormFromObj(obj: HeaderNotHighestPressure, settings: Settings, pressureMin: number, pressureMax: number): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings, pressureMin, pressureMax, obj.pressure);
    let tmpDesuperheatSteamTemperatureValidators: Array<ValidatorFn>;
    if (obj.desuperheatSteamIntoNextHighest) {
      tmpDesuperheatSteamTemperatureValidators = [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
    } else {
      tmpDesuperheatSteamTemperatureValidators = [Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)];
    }

    let form: FormGroup = this.formBuilder.group({
      pressure: [obj.pressure, [Validators.required, GreaterThanValidator.greaterThan(ranges.pressureMin), LessThanValidator.lessThan(ranges.pressureMax)]],
      processSteamUsage: [obj.processSteamUsage, [Validators.required, Validators.min(ranges.processUsageMin)]],
      condensationRecoveryRate: [obj.condensationRecoveryRate, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [obj.heatLoss, [Validators.required, Validators.min(0), Validators.max(10)]],
      flashCondensateIntoHeader: [obj.flashCondensateIntoHeader, Validators.required],
      desuperheatSteamIntoNextHighest: [obj.desuperheatSteamIntoNextHighest, Validators.required],
      desuperheatSteamTemperature: [obj.desuperheatSteamTemperature, tmpDesuperheatSteamTemperatureValidators],
      useBaselineProcessSteamUsage: [obj.useBaselineProcessSteamUsage]
    });

    for (let key in form.controls) {
      form.controls[key].markAsDirty();
    }
    return form;
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

    //return condensate max = saturated temp at dearator pressures
    // let tmpCondensateReturnTempMax: number = 1000000;
    // if (lowPressureHeaderPressure != undefined) {
    //   let satPropertiesOutput: SaturatedPropertiesOutput = this.steamService.saturatedProperties(
    //     {
    //       saturatedPressure: lowPressureHeaderPressure
    //     },
    //     0,
    //     settings
    //   );
    //   tmpCondensateReturnTempMax = this.convertUnitsService.roundVal(satPropertiesOutput.saturatedTemperature, 0);
    // }
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
      // condensateReturnTempMax: tmpCondensateReturnTempMax,
      desuperheatingTempMin: tmpDesuperheatingTempMin,
      desuperheatingTempMax: tmpDesuperheatingTempMax,
      processUsageMax: tmpProcessUsageMax,
      processUsageMin: tmpProcessUsageMin
    };
  }


  isHeaderValid(obj: HeaderInput, ssmt: SSMT, settings: Settings, boilerInput: BoilerInput): boolean {
    if (obj) {
      let isHighPressureHeaderValid: boolean = true;
      let isMediumPressureHeaderValid: boolean = true;
      let isLowPressureHeaderValid: boolean = true;
      if (obj.highPressureHeader) {
        let minPressure: number;
        if (obj.numberOfHeaders == 1) {
          minPressure = boilerInput.deaeratorPressure;
        }
        let tmpHighPressureFrom: FormGroup = this.getHighestPressureHeaderFormFromObj(obj.highPressureHeader, settings, boilerInput, minPressure);
        if (tmpHighPressureFrom.status === 'INVALID') {
          isHighPressureHeaderValid = false;
        }
      } else {
        isHighPressureHeaderValid = false;
      }

      if (obj.numberOfHeaders > 1) {
        if (obj.lowPressureHeader) {
          let pressureMax: number;
          if (obj.numberOfHeaders == 3 && obj.mediumPressureHeader) {
            pressureMax = obj.mediumPressureHeader.pressure;
          } else if (obj.highPressureHeader) {
            pressureMax = obj.highPressureHeader.pressure;
          }
          if (pressureMax) {
            let tmpLowPressureHeaderForm: FormGroup = this.getHeaderFormFromObj(obj.lowPressureHeader, settings, boilerInput.deaeratorPressure, pressureMax);
            if (tmpLowPressureHeaderForm.status === 'INVALID') {
              isLowPressureHeaderValid = false;
            }
          } else {
            isLowPressureHeaderValid = false;
          }
        }
        else {
          isLowPressureHeaderValid = false;
        }
      }

      if (obj.numberOfHeaders === 3) {
        if (obj.mediumPressureHeader && obj.highPressureHeader && obj.lowPressureHeader) {
          let pressureMax: number = obj.highPressureHeader.pressure;
          let pressureMin: number = obj.lowPressureHeader.pressure;

          let tmpMediumHeaderForm: FormGroup = this.getHeaderFormFromObj(obj.mediumPressureHeader, settings, pressureMin, pressureMax);
          if (tmpMediumHeaderForm.status === 'INVALID') {
            isMediumPressureHeaderValid = false;
          }
        } else {
          isMediumPressureHeaderValid = false;
        }
      }

      if (isHighPressureHeaderValid && isMediumPressureHeaderValid && isLowPressureHeaderValid) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
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
  // condensateReturnTempMax: number;
  desuperheatingTempMin: number;
  desuperheatingTempMax: number;
  processUsageMin: number;
  processUsageMax: number;
}

export interface HeaderWarnings {
  headerPressure?: string,
  condensateReturnTemperature?: string
}