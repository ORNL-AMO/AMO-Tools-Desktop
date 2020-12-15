import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { WallLoss } from '../../../shared/models/phast/losses/wallLoss';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class WallFormService {

  constructor(private formBuilder: FormBuilder) { }

  initForm(lossNum?: number): FormGroup {
    let lossNumber = lossNum? lossNum : 1;
    let formGroup = this.formBuilder.group({
      'surfaceArea': ['', [Validators.required, Validators.min(0)]],
      'avgSurfaceTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'correctionFactor': [1.0, Validators.required],
      'windVelocity': [0, [Validators.required, Validators.min(0)]],
      'surfaceShape': [3, Validators.required],
      'conditionFactor': [1.394, Validators.required],
      'surfaceEmissivity': [0.9, [Validators.required, Validators.min(0), Validators.max(1)]],
      'name': ['Loss #' + lossNumber]
    });

    if (!lossNum) {
      formGroup.addControl('availableHeat', new FormControl(100, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new FormControl(8760, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new FormControl('Fuel', [Validators.required]));
      formGroup.addControl('fuelCost', new FormControl(''));
    }

    return formGroup;
  }

  getWallLossForm(wallLoss: WallLoss, inAssessment = true): FormGroup {
    let formGroup = this.formBuilder.group({
      'surfaceArea': [wallLoss.surfaceArea, [Validators.required, Validators.min(0)]],
      'avgSurfaceTemp': [wallLoss.surfaceTemperature, Validators.required],
      'ambientTemp': [wallLoss.ambientTemperature, Validators.required],
      'correctionFactor': [wallLoss.correctionFactor, Validators.required],
      'windVelocity': [wallLoss.windVelocity, [Validators.required, Validators.min(0)]],
      'conditionFactor': [wallLoss.conditionFactor, Validators.required],
      'surfaceEmissivity': [wallLoss.surfaceEmissivity, [Validators.required, Validators.min(0), Validators.max(1)]],
      'surfaceShape': [wallLoss.surfaceShape],
      'name': [wallLoss.name],
    });

    if (!inAssessment) {
      formGroup.addControl('availableHeat', new FormControl(wallLoss.availableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new FormControl(wallLoss.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new FormControl(wallLoss.energySourceType, [Validators.required]));
      formGroup.addControl('fuelCost', new FormControl(wallLoss.fuelCost));
    }

    formGroup = this.setValidators(formGroup);
    return formGroup;
  }

  getWallLossFromForm(wallLossForm: FormGroup): WallLoss {
    let tmpWallLoss: WallLoss = {
      surfaceArea: wallLossForm.controls.surfaceArea.value,
      ambientTemperature: wallLossForm.controls.ambientTemp.value,
      surfaceTemperature: wallLossForm.controls.avgSurfaceTemp.value,
      windVelocity: wallLossForm.controls.windVelocity.value,
      surfaceEmissivity: wallLossForm.controls.surfaceEmissivity.value,
      surfaceShape: wallLossForm.controls.surfaceShape.value,
      conditionFactor: wallLossForm.controls.conditionFactor.value,
      correctionFactor: wallLossForm.controls.correctionFactor.value,
      availableHeat: wallLossForm.controls.availableHeat? wallLossForm.controls.availableHeat.value : 0,
      name: wallLossForm.controls.name.value
    };
    // In standalone
    if (wallLossForm.controls.availableHeat) {
      tmpWallLoss.energySourceType = wallLossForm.controls.energySourceType.value,
      tmpWallLoss.hoursPerYear = wallLossForm.controls.hoursPerYear.value,
      tmpWallLoss.fuelCost = wallLossForm.controls.fuelCost.value
      tmpWallLoss.availableHeat = wallLossForm.controls.availableHeat.value
    }

    return tmpWallLoss;
  }

  setValidators(formGroup: FormGroup): FormGroup {
    formGroup = this.setSurfaceTemperatureValidators(formGroup);
    return formGroup;
  }

  setSurfaceTemperatureValidators(formGroup: FormGroup) {
    let avgSurfaceTemp = formGroup.controls.avgSurfaceTemp.value;
    if (avgSurfaceTemp) {
      formGroup.controls.avgSurfaceTemp.setValidators([Validators.required, Validators.min(formGroup.controls.ambientTemp.value)]);
      formGroup.controls.avgSurfaceTemp.updateValueAndValidity();
      formGroup.controls.avgSurfaceTemp.markAsDirty();
    }
    return formGroup;
  }

  checkWarnings(loss: WallLoss): WallLossWarnings {
    return {
      windVelocityWarning: this.checkWindVelocity(loss),
      surfaceAreaWarning: this.checkSurfaceArea(loss),
      surfaceTempWarning: this.checkTemperature(loss),
      emissivityWarning: this.checkSurfaceEmissivity(loss)
    };
  }

  checkWindVelocity(loss: WallLoss): string {
    if (loss.windVelocity < 0) {
      return 'Wind Velocity must be equal or greater than 0';
    } else {
      return null;
    }
  }
  checkSurfaceArea(loss: WallLoss): string {
    if (loss.surfaceArea < 0) {
      return 'Total Outside Surface Area must be equal or greater than 0';
    } else {
      return null;
    }
  }
  checkTemperature(loss: WallLoss): string {
    if (loss.surfaceTemperature < loss.ambientTemperature) {
      return 'Surface temperature is lower than ambient temperature';
    } else {
      return null;
    }

  }
  checkSurfaceEmissivity(loss: WallLoss): string {
    if (loss.surfaceEmissivity > 1 || loss.surfaceEmissivity < 0) {
      return 'Surface emissivity must be between 0 and 1';
    } else {
      return null;
    }
  }
  checkWarningsExist(warnings: WallLossWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }
}

export interface WallLossWarnings {
  windVelocityWarning: string;
  surfaceAreaWarning: string;
  surfaceTempWarning: string;
  emissivityWarning: string;
}
