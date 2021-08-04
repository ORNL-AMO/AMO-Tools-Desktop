import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LeakageLoss } from '../../../shared/models/phast/losses/leakageLoss';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class LeakageFormService {

  constructor(private formBuilder: FormBuilder) {
  }
  initForm(lossNum?: number): FormGroup {
    let formGroup = this.formBuilder.group({
      draftPressure: ['', Validators.required],
      openingArea: ['', [Validators.required, Validators.min(0)]],
      leakageGasTemperature: ['', Validators.required],
      ambientTemperature: ['', Validators.required],
      coefficient: [.8052, Validators.required],
      specificGravity: [1.0, [Validators.required, Validators.min(0)]],
      correctionFactor: [1.0, Validators.required],
      name: ['Loss #' + lossNum]
    });

    if (!lossNum) {
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new FormControl(8760, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new FormControl('Fuel', [Validators.required]));
      formGroup.addControl('fuelCost', new FormControl(''));
    }

    return formGroup;
  }

  initFormFromLoss(loss: LeakageLoss, inAssessment: boolean = true): FormGroup {
    let formGroup = this.formBuilder.group({
      draftPressure: [loss.draftPressure, Validators.required],
      openingArea: [loss.openingArea, [Validators.required, Validators.min(0)]],
      leakageGasTemperature: [loss.leakageGasTemperature, Validators.required],
      ambientTemperature: [loss.ambientTemperature, Validators.required],
      coefficient: [loss.coefficient, Validators.required],
      specificGravity: [loss.specificGravity, [Validators.required, Validators.min(0)]],
      correctionFactor: [loss.correctionFactor, Validators.required],
      name: [loss.name]
    });

    if (!inAssessment) {
      formGroup.addControl('availableHeat', new FormControl(loss.availableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new FormControl(loss.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new FormControl(loss.energySourceType, [Validators.required]));
      formGroup.addControl('fuelCost', new FormControl(loss.fuelCost));
    }
    
    return formGroup;
  }

  initLossFromForm(form: FormGroup): LeakageLoss {
    let tmpLoss: LeakageLoss = {
      draftPressure: form.controls.draftPressure.value,
      openingArea: form.controls.openingArea.value,
      leakageGasTemperature: form.controls.leakageGasTemperature.value,
      ambientTemperature: form.controls.ambientTemperature.value,
      coefficient: form.controls.coefficient.value,
      specificGravity: form.controls.specificGravity.value,
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

  checkLeakageWarnings(loss: LeakageLoss): LeakageWarnings {
    return {
      openingAreaWarning: this.checkOpeningArea(loss),
      specificGravityWarning: this.checkSpecificGravity(loss),
      temperatureWarning: this.checkTemperature(loss)
    };
  }
  
  // used in explore opps
  checkOpeningArea(loss: LeakageLoss): string {
    if (loss.openingArea < 0) {
      return 'Opening Area must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkSpecificGravity(loss: LeakageLoss): string {
    if (loss.specificGravity < 0) {
      return 'Specific Gravity of Flue Gas must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkTemperature(loss: LeakageLoss): string {
    if (loss.ambientTemperature > loss.leakageGasTemperature) {
      return "Ambient Temperature shouldn't be greater than Temperature of Leaking Gases";
    } else {
      return null;
    }
  }

  checkWarningsExist(warnings: LeakageWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
}


export interface LeakageWarnings {
  openingAreaWarning: string;
  specificGravityWarning: string;
  temperatureWarning: string;
}
