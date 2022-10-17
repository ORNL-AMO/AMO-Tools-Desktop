import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class AtmosphereFormService {

  constructor(private formBuilder: UntypedFormBuilder) {}
  initForm(lossNum?: number): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'atmosphereGas': ['', Validators.required],
      'specificHeat': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'inletTemp': ['', Validators.required],
      'outletTemp': ['', Validators.required],
      'flowRate': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'correctionFactor': [1.0, Validators.required],
      'name': ['Loss #' + lossNum]
    });

    if (!lossNum) {
      formGroup.addControl('availableHeat', new UntypedFormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new UntypedFormControl(8760, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new UntypedFormControl('Fuel', [Validators.required]));
      formGroup.addControl('fuelCost', new UntypedFormControl(''));
    }

    return formGroup;
  }

  getAtmosphereForm(loss: AtmosphereLoss, inAssessment: boolean = true): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'atmosphereGas': [loss.atmosphereGas, Validators.required],
      'specificHeat': [loss.specificHeat, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'inletTemp': [loss.inletTemperature, Validators.required],
      'outletTemp': [loss.outletTemperature, Validators.required],
      'flowRate': [loss.flowRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'correctionFactor': [loss.correctionFactor, Validators.required],
      'name': [loss.name]
    });

    if (!inAssessment) {
      formGroup.addControl('availableHeat', new UntypedFormControl(loss.availableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new UntypedFormControl(loss.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new UntypedFormControl(loss.energySourceType, [Validators.required]));
      formGroup.addControl('fuelCost', new UntypedFormControl(loss.fuelCost));
    }
    
    return formGroup;
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

    // In standalone
    if (form.controls.availableHeat) {
      tmpLoss.energySourceType = form.controls.energySourceType.value,
      tmpLoss.hoursPerYear = form.controls.hoursPerYear.value,
      tmpLoss.fuelCost = form.controls.fuelCost.value
      tmpLoss.availableHeat = form.controls.availableHeat.value
    }

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