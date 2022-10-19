import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { FixtureLoss } from '../../../shared/models/phast/losses/fixtureLoss';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class FixtureFormService {

  constructor(private formBuilder: UntypedFormBuilder) {}


  initForm(lossNum?: number): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'materialName': [1, Validators.required],
      'feedRate': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'initialTemp': ['', Validators.required],
      'finalTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'specificHeat': ['', [Validators.required, Validators.min(0)]],
      'name': ['Loss #' + lossNum],
      'specificHeatLiquid': [''],
      'meltingPoint': [''],
      'latentHeat': ['']
    });

    if (!lossNum) {
      formGroup.addControl('availableHeat', new UntypedFormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new UntypedFormControl(8760, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new UntypedFormControl('Fuel', [Validators.required]));
      formGroup.addControl('fuelCost', new UntypedFormControl(''));
    }

    return formGroup;
  }

  getFormFromLoss(loss: FixtureLoss, inAssessment = true): UntypedFormGroup {
    let formGroup = this.formBuilder.group({
      'materialName': [loss.materialName, Validators.required],
      'feedRate': [loss.feedRate, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'initialTemp': [loss.initialTemperature, Validators.required],
      'finalTemp': [loss.finalTemperature, Validators.required],
      'correctionFactor': [loss.correctionFactor, Validators.required],
      'specificHeat': [loss.specificHeat, [Validators.required, Validators.min(0)]],
      'name': [loss.name],
      'specificHeatLiquid': [loss.specificHeatLiquid],
      'meltingPoint': [loss.meltingPoint],
      'latentHeat': [loss.latentHeat]
    });

    if (!inAssessment) {
      formGroup.addControl('availableHeat', new UntypedFormControl(loss.availableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new UntypedFormControl(loss.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new UntypedFormControl(loss.energySourceType, [Validators.required]));
      formGroup.addControl('fuelCost', new UntypedFormControl(loss.fuelCost));
    }

    return formGroup;
  }

  getLossFromForm(form: UntypedFormGroup): FixtureLoss {
    let tmpLoss: FixtureLoss = {
      specificHeat: form.controls.specificHeat.value,
      feedRate: form.controls.feedRate.value,
      initialTemperature: form.controls.initialTemp.value,
      finalTemperature: form.controls.finalTemp.value,
      correctionFactor: form.controls.correctionFactor.value,
      materialName: form.controls.materialName.value,
      name: form.controls.name.value,
      specificHeatLiquid: form.controls.specificHeatLiquid.value,
      meltingPoint: form.controls.meltingPoint.value,
      latentHeat: form.controls.latentHeat.value
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

  checkWarnings(loss: FixtureLoss): { specificHeatWarning: string, feedRateWarning: string } {
    return {
      specificHeatWarning: this.checkSpecificHeat(loss),
      feedRateWarning: this.checkFeedRate(loss)
    };
  }

  checkSpecificHeat(loss: FixtureLoss): string {
    if (loss.specificHeat < 0) {
      return 'Average Specific Heat of Material must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkFeedRate(loss: FixtureLoss): string {
    if (loss.feedRate < 0) {
      return 'Fixture Feed Rate must be greater than 0';
    } else {
      return null;
    }
  }

}
