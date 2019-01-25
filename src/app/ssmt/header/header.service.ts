import { Injectable } from '@angular/core';
import { HeaderInput, HeaderNotHighestPressure, HeaderWithHighestPressure } from '../../shared/models/steam/ssmt';
import { FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class HeaderService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }

  initHeaderDataObj(): HeaderInput {
    return {
      numberOfHeaders: 1,
      highPressure: undefined
    }
  }

  initHighestPressureHeaderForm(settings: Settings) {
    let ranges: HeaderRanges = this.getRanges(settings);
    return this.formBuilder.group({
      pressure: [undefined, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      processSteamUsage: [undefined, [Validators.required, Validators.min(0), Validators.max(1000)]],
      condensationRecoveryRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [undefined, [Validators.required, Validators.min(0), Validators.max(10)]],
      condensateReturnTemperature: [undefined, [Validators.required, Validators.min(ranges.condensateReturnTempMin), Validators.max(ranges.condensateReturnTempMax)]],
      flashCondensateReturn: [false, Validators.required]
    })
  }

  getHighestPressureHeaderFormFromObj(obj: HeaderWithHighestPressure, settings: Settings): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings);
    let form: FormGroup = this.formBuilder.group({
      pressure: [obj.pressure, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      processSteamUsage: [obj.processSteamUsage, [Validators.required, Validators.min(0), Validators.max(1000)]],
      condensationRecoveryRate: [obj.condensationRecoveryRate, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [obj.heatLoss, [Validators.required, Validators.min(0), Validators.max(10)]],
      condensateReturnTemperature: [obj.condensateReturnTemperature, [Validators.required, Validators.min(ranges.condensateReturnTempMin), Validators.max(ranges.condensateReturnTempMax)]],
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
    }
  }

  initHeaderForm(settings: Settings): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings);
    return this.formBuilder.group({
      pressure: [undefined, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      processSteamUsage: [undefined, [Validators.required, Validators.min(0), Validators.max(1000)]],
      condensationRecoveryRate: [undefined, [Validators.required, Validators.min(0), Validators.max(100)]],
      heatLoss: [undefined, [Validators.required, Validators.min(0), Validators.max(10)]],
      flashCondensateIntoHeader: [false, Validators.required],
      desuperheatSteamIntoNextHighest: [false, Validators.required],
      desuperheatSteamTemperature: [undefined, [Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)]],
    })
  }

  getHeaderFormFromObj(obj: HeaderNotHighestPressure, settings: Settings): FormGroup {
    let ranges: HeaderRanges = this.getRanges(settings)
    let tmpDesuperheatSteamTemperatureValidators: Array<ValidatorFn>;
    if(obj.desuperheatSteamIntoNextHighest){
      tmpDesuperheatSteamTemperatureValidators = [Validators.required, Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)]
    }else{
      tmpDesuperheatSteamTemperatureValidators = [Validators.min(ranges.desuperheatingTempMin), Validators.max(ranges.desuperheatingTempMax)]
    }
    let form: FormGroup = this.formBuilder.group({
      pressure: [obj.pressure, [Validators.required, Validators.min(ranges.pressureMin), Validators.max(ranges.pressureMax)]],
      processSteamUsage: [obj.processSteamUsage, [Validators.required, Validators.min(0), Validators.max(1000)]],
      condensationRecoveryRate: [obj.condensationRecoveryRate, [Validators.required, Validators.min(0), Validators.max(1000)]],
      heatLoss: [obj.heatLoss, [Validators.required, Validators.min(0), Validators.max(10)]],
      flashCondensateIntoHeader: [obj.flashCondensateIntoHeader, Validators.required],
      desuperheatSteamIntoNextHighest: [obj.desuperheatSteamIntoNextHighest, Validators.required],
      desuperheatSteamTemperature: [obj.desuperheatSteamTemperature, tmpDesuperheatSteamTemperatureValidators],
    })
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
      desuperheatSteamTemperature: form.controls.desuperheatSteamTemperature.value
    }
  }

  getHeaderLabel(index: number, numberOfHeaders: number): string {
    //index is 0 indexed
    if (index == 0) {
      return 'High Pressure';
    }
    else {
      if (index == numberOfHeaders - 1) {
        return 'Low Pressure';
      } else {
        if (numberOfHeaders == 3) {
          if (index == 1) {
            return 'Medium Pressure';
          }
        } else if (numberOfHeaders == 4) {
          if (index == 1) {
            return 'Medium High Pressure';
          } else if (index == 2) {
            return 'Medium Low Pressure';
          }
        } else if (numberOfHeaders == 5) {
          if (index == 1) {
            return 'Medium High Pressure';
          } else if (index == 2) {
            return 'Medium Pressure';
          } else if (index == 3) {
            return 'Medium Low Pressure';
          }
        }
      }
    }
  }

  getRanges(settings: Settings, pressureMin?: number, pressureMax?: number): HeaderRanges {
    let tmpPressureMin: number = this.convertUnitsService.value(-14.5).from('psia').to(settings.steamPressureMeasurement);
    let tmpPressureMax: number = this.convertUnitsService.value(3185).from('psia').to(settings.steamPressureMeasurement);
    if (pressureMin > tmpPressureMin) {
      tmpPressureMin = pressureMin;
    }
    if (pressureMax < tmpPressureMax) {
      tmpPressureMax = pressureMax;
    }
    tmpPressureMax = this.convertUnitsService.roundVal(tmpPressureMax, 0);
    tmpPressureMin = this.convertUnitsService.roundVal(tmpPressureMin, 0);

    let tmpCondensateReturnTempMin: number = this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement);
    tmpCondensateReturnTempMin = this.convertUnitsService.roundVal(tmpCondensateReturnTempMin, 0);

    //TODO: find out what "Boiling point at combined header pressure" means and use it.
    let tmpCondensateReturnTempMax: number = 100000000;

    let tmpDesuperheatingTempMin: number = this.convertUnitsService.value(32).from('F').to(settings.steamTemperatureMeasurement);
    tmpDesuperheatingTempMin = this.convertUnitsService.roundVal(tmpDesuperheatingTempMin, 0);

    let tmpDesuperheatingTempMax: number = this.convertUnitsService.value(1472).from('F').to(settings.temperatureMeasurement);
    tmpDesuperheatingTempMax = this.convertUnitsService.roundVal(tmpDesuperheatingTempMax, 0);
    return {
      pressureMin: tmpPressureMin,
      pressureMax: tmpPressureMax,
      condensateReturnTempMin: tmpCondensateReturnTempMin,
      condensateReturnTempMax: tmpCondensateReturnTempMax,
      desuperheatingTempMin: tmpDesuperheatingTempMin,
      desuperheatingTempMax: tmpDesuperheatingTempMax
    }
  }


  isHeaderValid(obj: HeaderInput, settings: Settings): boolean {
    if (obj) {
      let isHighPressureHeaderValid: boolean = true;
      let isMediumPressureHeaderValid: boolean = true;
      let isLowPressureHeaderValid: boolean = true;
      if (obj.highPressure) {
        let tmpHighPressureFrom: FormGroup = this.getHighestPressureHeaderFormFromObj(obj.highPressure, settings);
        if (tmpHighPressureFrom.status == 'INVALID') {
          isHighPressureHeaderValid = false;
        }
      } else {
        isHighPressureHeaderValid = false;
      }

      if (obj.numberOfHeaders > 1) {
        if (obj.lowPressure) {
          let tmpLowPressureHeaderForm: FormGroup = this.getHeaderFormFromObj(obj.lowPressure, settings);
          if (tmpLowPressureHeaderForm.status == 'INVALID') {
            isLowPressureHeaderValid = false;
          }
        }
        else {
          isLowPressureHeaderValid = false;
        }
      }

      if (obj.numberOfHeaders == 3) {
        if (obj.mediumPressure) {
          let tmpMediumHeaderForm: FormGroup = this.getHeaderFormFromObj(obj.mediumPressure, settings);
          if (tmpMediumHeaderForm.status == 'INVALID') {
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
}


export interface HeaderRanges {
  pressureMin: number,
  pressureMax: number,
  condensateReturnTempMin: number,
  condensateReturnTempMax: number,
  desuperheatingTempMin: number,
  desuperheatingTempMax: number
}