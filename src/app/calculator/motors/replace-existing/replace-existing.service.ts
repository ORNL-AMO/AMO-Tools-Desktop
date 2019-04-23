import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ReplaceExistingData, ReplaceExistingResults } from '../../../shared/models/calculators';

@Injectable()
export class ReplaceExistingService {
  
  replaceExistingData: ReplaceExistingData;
  constructor(private formBuilder: FormBuilder) { }

  initForm(): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      operatingHours: [5200, [Validators.required, Validators.min(0)]],
      motorSize: [150, [Validators.required, Validators.min(0)]],
      load: [75, [Validators.required, Validators.min(0), Validators.max(100)]],
      electricityCost: [0.12, [Validators.required, Validators.min(0)]],
      newEfficiency: [96, [Validators.required, Validators.min(0), Validators.max(100)]],
      existingEfficiency: [96, [Validators.required, Validators.min(0), Validators.max(100)]],
      purchaseCost: [1300, [Validators.required, Validators.min(0)]]
    });
    return tmpForm;
  }

  getFormFromObj(inputObj: ReplaceExistingData): FormGroup {
    let tmpForm: FormGroup = this.formBuilder.group({
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0)]],
      motorSize: [inputObj.motorSize, [Validators.required, Validators.min(0)]],
      load: [inputObj.load, [Validators.required, Validators.min(0), Validators.max(100)]],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
      newEfficiency: [inputObj.newEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      existingEfficiency: [inputObj.existingEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      purchaseCost: [inputObj.purchaseCost, [Validators.required, Validators.min(0)]]
    });
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): ReplaceExistingData {
    return {
      operatingHours: form.controls.operatingHours.value,
      motorSize: form.controls.motorSize.value,
      existingEfficiency: form.controls.existingEfficiency.value,
      load: form.controls.load.value,
      electricityCost: form.controls.electricityCost.value,
      newEfficiency: form.controls.newEfficiency.value,
      purchaseCost: form.controls.purchaseCost.value
    };
  }

  initReplaceExistingData(): ReplaceExistingData {
    return {
      operatingHours: 5200,
      motorSize: 150,
      load: 75,
      electricityCost: 0.12,
      existingEfficiency: 92,
      newEfficiency: 96,
      purchaseCost: 13000
    };
  }

  getResults(inputs: ReplaceExistingData): ReplaceExistingResults {
    let results: ReplaceExistingResults = {
      existingEnergyUse: 0,
      newEnergyUse: 0,
      existingEnergyCost: 0,
      newEnergyCost: 0,
      annualEnergySavings: 0,
      costSavings: 0,
      simplePayback: 0
    };

    results.existingEnergyUse = this.getExistingEnergyUse(inputs);
    results.newEnergyUse = this.getNewEnergyUse(inputs);
    results.existingEnergyCost = this.getExistingEnergyCost(inputs, results);
    results.newEnergyCost = this.getNewEnergyCost(inputs, results);
    results.annualEnergySavings = this.getAnnualEnergySavings(results);
    results.costSavings = this.getCostSavings(inputs, results);
    results.simplePayback = this.getSimplePayback(inputs, results);

    return results;
  }

  getExistingEnergyUse(inputs: ReplaceExistingData): number {
    return .746 * inputs.motorSize * inputs.load * inputs.operatingHours * (1 / inputs.existingEfficiency);
  }
  getNewEnergyUse(inputs: ReplaceExistingData): number {
    return .746 * inputs.motorSize * inputs.load * inputs.operatingHours * (1 / inputs.newEfficiency);
  }
  getExistingEnergyCost(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return results.existingEnergyUse * inputs.electricityCost;
  }
  getNewEnergyCost(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return results.newEnergyUse * inputs.electricityCost;
  }
  getAnnualEnergySavings(results: ReplaceExistingResults): number {
    return results.existingEnergyUse - results.newEnergyUse;
  }
  getCostSavings(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return inputs.electricityCost * results.annualEnergySavings;
  }
  getSimplePayback(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return inputs.purchaseCost / results.costSavings;
  }

  //may want to add percent savings as a result. talk to kristina first
}
