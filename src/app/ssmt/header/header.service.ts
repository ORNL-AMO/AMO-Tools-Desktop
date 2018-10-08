import { Injectable } from '@angular/core';
import { HeaderInput, HeaderNotHighestPressure, HeaderWithHighestPressure } from '../../shared/models/steam/ssmt';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class HeaderService {

  constructor(private formBuilder: FormBuilder) { }

  initHeaderDataObj(): HeaderInput {
    return {
      numberOfHeaders: 1,
      highPressure: {
        pressure: undefined,
        processSteamUsage: undefined,
        condensationRecoveryRate: undefined,
        heatLoss: undefined,
        condensateReturnTemperature: undefined,
        flashCondensateReturn: false
      },
      mediumPressure:{
        pressure: undefined,
        processSteamUsage: undefined,
        condensationRecoveryRate: undefined,
        heatLoss: undefined,
        flashCondensateIntoHeader: undefined,
        desuperheatSteamIntoNextHighest: undefined,
        desuperheatSteamTemperature: undefined
      },
      lowPressure: {
        pressure: undefined,
        processSteamUsage: undefined,
        condensationRecoveryRate: undefined,
        heatLoss: undefined,
        flashCondensateIntoHeader: undefined,
        desuperheatSteamIntoNextHighest: undefined,
        desuperheatSteamTemperature: undefined
      }
    }
  }

  initHighestPressureHeaderFormFromObj(obj: HeaderWithHighestPressure): FormGroup {
    return this.formBuilder.group({
      pressure: [obj.pressure, Validators.required],
      processSteamUsage: [obj.processSteamUsage, Validators.required],
      condensationRecoveryRate: [obj.condensationRecoveryRate, Validators.required],
      heatLoss: [obj.heatLoss, Validators.required],
      condensateReturnTemperature: [obj.condensateReturnTemperature, Validators.required],
      flashCondensateReturn: [obj.flashCondensateReturn, Validators.required]
    })
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

  initHeaderFormFromObj(obj: HeaderNotHighestPressure): FormGroup {
    return this.formBuilder.group({
      pressure: [obj.pressure, Validators.required],
      processSteamUsage: [obj.processSteamUsage, Validators.required],
      condensationRecoveryRate: [obj.condensationRecoveryRate, Validators.required],
      heatLoss: [obj.heatLoss, Validators.required],
      flashCondensateIntoHeader: [obj.flashCondensateIntoHeader, Validators.required],
      desuperheatSteamIntoNextHighest: [obj.desuperheatSteamIntoNextHighest, Validators.required],
      desuperheatSteamTemperature: [obj.desuperheatSteamTemperature, Validators.required],
    })
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
}
