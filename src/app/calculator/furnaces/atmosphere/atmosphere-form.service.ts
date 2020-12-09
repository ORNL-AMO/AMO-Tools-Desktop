import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AtmosphereLoss } from '../../../shared/models/phast/losses/atmosphereLoss';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class AtmosphereFormService {

  constructor(private formBuilder: FormBuilder) {}
  initForm(lossNum?: number): FormGroup {
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
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new FormControl(8760, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new FormControl('Fuel', [Validators.required]));
      formGroup.addControl('fuelCost', new FormControl(''));
    }

    return formGroup;
  }

  getAtmosphereForm(loss: AtmosphereLoss, inAssessment: boolean = true): FormGroup {
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
      formGroup.addControl('availableHeat', new FormControl(loss.availableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new FormControl(loss.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new FormControl(loss.energySourceType, [Validators.required]));
      formGroup.addControl('fuelCost', new FormControl(loss.fuelCost));
    }
    
    // formGroup = this.setInletTemperatureValidators(formGroup);
    return formGroup;
  }

  getLossFromForm(form: FormGroup): AtmosphereLoss {
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

  // setInletTemperatureValidators(formGroup: FormGroup) {
  //   let inletTemp = formGroup.controls.inletTemp.value;
  //   if (inletTemp) {
  //     formGroup.controls.inletTemp.setValidators([Validators.required, Validators.max(formGroup.controls.outletTemp.value)]);
  //     formGroup.controls.inletTemp.updateValueAndValidity();
  //     formGroup.controls.inletTemp.markAsDirty();
  //   }
  //   return formGroup;
  // }


  checkWarnings(loss: AtmosphereLoss): AtmosphereLossWarnings {
    return {
      // specificHeatWarning: this.checkSpecificHeat(loss),
      // flowRateWarning: this.checkFlowRate(loss),
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

}

export interface AtmosphereLossWarnings {
  temperatureWarning: string;
}
