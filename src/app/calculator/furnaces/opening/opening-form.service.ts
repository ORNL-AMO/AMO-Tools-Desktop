import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CircularOpeningLoss, OpeningLoss, QuadOpeningLoss, ViewFactorInput } from '../../../shared/models/phast/losses/openingLoss';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class OpeningFormService {
  constructor(private formBuilder: FormBuilder) {
  }

  initForm(lossNum?: number): FormGroup {
    let formGroup =  this.formBuilder.group({
      'numberOfOpenings': [1, [Validators.required, Validators.min(0)]],
      'openingType': ['Round', Validators.required],
      'wallThickness': ['', [Validators.required, Validators.min(0)]],
      'lengthOfOpening': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'heightOfOpening': ['', [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'viewFactor': ['', [Validators.required, Validators.min(0)]],
      'insideTemp': ['', Validators.required],
      'ambientTemp': ['', Validators.required],
      'percentTimeOpen': ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      'emissivity': [0.9, [Validators.required, Validators.min(0), Validators.max(1)]],
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

  getFormFromLoss(loss: OpeningLoss, inAssessment = true): FormGroup {
    let formGroup = this.formBuilder.group({
      'numberOfOpenings': [loss.numberOfOpenings, [Validators.required, Validators.min(0)]],
      'openingType': [loss.openingType, Validators.required],
      'wallThickness': [loss.thickness, [Validators.required, Validators.min(0)]],
      'lengthOfOpening': [loss.lengthOfOpening, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'heightOfOpening': [loss.heightOfOpening, [Validators.required, GreaterThanValidator.greaterThan(0)]],
      'viewFactor': [loss.viewFactor, [Validators.required, Validators.min(0)]],
      'insideTemp': [loss.insideTemperature, Validators.required],
      'ambientTemp': [loss.ambientTemperature, Validators.required],
      'percentTimeOpen': [loss.percentTimeOpen, [Validators.required, Validators.min(0), Validators.max(100)]],
      'emissivity': [loss.emissivity, [Validators.required, Validators.min(0), Validators.max(1)]],
      'name': [loss.name]
    });

    if (!inAssessment) {
      formGroup.addControl('availableHeat', new FormControl(loss.availableHeat, [Validators.required, GreaterThanValidator.greaterThan(0), Validators.max(100)]));
      formGroup.addControl('hoursPerYear', new FormControl(loss.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]));
      formGroup.addControl('energySourceType', new FormControl(loss.energySourceType, [Validators.required]));
      formGroup.addControl('fuelCost', new FormControl(loss.fuelCost));
    }

    formGroup = this.setValidators(formGroup);
    return formGroup
  }

  getLossFromForm(form: FormGroup): OpeningLoss {
    let openingLoss: OpeningLoss = {
      numberOfOpenings: form.controls.numberOfOpenings.value,
      emissivity: form.controls.emissivity.value,
      thickness: form.controls.wallThickness.value,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value,
      openingType: form.controls.openingType.value,
      lengthOfOpening: form.controls.lengthOfOpening.value,
      heightOfOpening: form.controls.heightOfOpening.value,
      name: form.controls.name.value
    };

    // In standalone
    if (form.controls.availableHeat) {
      openingLoss.energySourceType = form.controls.energySourceType.value,
      openingLoss.hoursPerYear = form.controls.hoursPerYear.value,
      openingLoss.fuelCost = form.controls.fuelCost.value
      openingLoss.availableHeat = form.controls.availableHeat.value
    }

    return openingLoss;
  }

  
  setValidators(formGroup: FormGroup): FormGroup {
    formGroup = this.setAmbientTempValidators(formGroup);
    return formGroup;
  }

  setAmbientTempValidators(formGroup: FormGroup) {
    let ambientTemp = formGroup.controls.ambientTemp.value;
    if (ambientTemp) {
      formGroup.controls.ambientTemp.setValidators([Validators.required, Validators.max(formGroup.controls.insideTemp.value)]);
      formGroup.controls.ambientTemp.updateValueAndValidity();
      formGroup.controls.ambientTemp.markAsDirty();
    }
    return formGroup;
  }

  getViewFactorInput(input: FormGroup): ViewFactorInput {
    if (input.controls.openingType.value === 'Round') {
      return {
        openingShape: 0,
        thickness: input.controls.wallThickness.value,
        diameter: input.controls.lengthOfOpening.value
      };
    }
    return {
      openingShape: 1,
      thickness: input.controls.wallThickness.value,
      length: input.controls.lengthOfOpening.value,
      width: input.controls.heightOfOpening.value
    };
  }

  getQuadLossFromForm(form: FormGroup): QuadOpeningLoss {
    const ratio = Math.min(form.controls.lengthOfOpening.value, form.controls.heightOfOpening.value) / form.controls.wallThickness.value;
    let quadOpeningLoss: QuadOpeningLoss = {
      emissivity: form.controls.emissivity.value,
      length: form.controls.lengthOfOpening.value,
      width: form.controls.heightOfOpening.value,
      thickness: form.controls.wallThickness.value,
      ratio: ratio,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value
    };

    return quadOpeningLoss;
  }

  getCircularLossFromForm(form: FormGroup): CircularOpeningLoss {
    const ratio = form.controls.lengthOfOpening.value / form.controls.wallThickness.value;
    let circularOpeningLoss: CircularOpeningLoss = {
      emissivity: form.controls.emissivity.value,
      diameter: form.controls.lengthOfOpening.value,
      thickness: form.controls.wallThickness.value,
      ratio: ratio,
      ambientTemperature: form.controls.ambientTemp.value,
      insideTemperature: form.controls.insideTemp.value,
      percentTimeOpen: form.controls.percentTimeOpen.value,
      viewFactor: form.controls.viewFactor.value
    };

    return circularOpeningLoss;
  }

}
