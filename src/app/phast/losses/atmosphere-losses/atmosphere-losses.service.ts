import { Injectable } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';

@Injectable()
export class AtmosphereLossesService {

  constructor(private formBuilder: UntypedFormBuilder) {
  }

  //get empty atmosphere form
  initForm(lossNum: number): UntypedFormGroup {
    return this.formBuilder.group({
      'atmosphereGas': ['', Validators.required],
      'specificHeat': ['', Validators.required],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'flowRate': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'name': ['Loss #' + lossNum]
    });
  }

  //get form from object
  getAtmosphereForm(loss: AtmosphereLoss): UntypedFormGroup {
    return this.formBuilder.group({
      'atmosphereGas': [loss.atmosphereGas, Validators.required],
      'specificHeat': [loss.specificHeat, Validators.required],
      'inletTemp': [loss.inletTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'flowRate': [loss.flowRate, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
      'name': [loss.name]
    });
  }

  getLossFromForm(form: UntypedFormGroup): AtmosphereLoss {
    let tmpLoss: AtmosphereLoss = {
      atmosphereGas: form.controls.atmosphereGas.value,
      specificHeat: form.controls.specificHeat.value,
      inletTemperature: form.controls.inletTemp.value,
      outletTemperature: form.controls.outletTemp.value,
      flowRate: form.controls.flowRate.value,
      correctionFactor: form.controls.correctionFactor.value,
      name: form.controls.name.value
    };
    return tmpLoss;
  }


  checkWarnings(loss: AtmosphereLoss): AtmosphereLossWarnings {
    return {
      specificHeatWarning: this.checkSpecificHeat(loss),
      flowRateWarning: this.checkFlowRate(loss),
      temperatureWarning: this.checkTempError(loss)
    };
  }

  checkTempError(loss: AtmosphereLoss): string {
    if (loss.inletTemperature > loss.outletTemperature) {
      return 'Inlet temperature is greater than outlet temperature';
    } else {
      return null;
    }
  }
  checkSpecificHeat(loss: AtmosphereLoss) {
    if (loss.specificHeat < 0) {
      return 'Specific Heat must be greater than 0';
    } else {
      return null;
    }
  }
  checkFlowRate(loss: AtmosphereLoss): string {
    if (loss.flowRate < 0) {
      return 'Flow Rate must be greater than 0';
    } else {
      return null;
    }
  }

  checkWarningsExist(warnings: AtmosphereLossWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
}

export interface AtmosphereLossWarnings {
  specificHeatWarning: string;
  flowRateWarning: string;
  temperatureWarning: string;
}
