import { Injectable } from '@angular/core';
import { ReplaceExistingData, ReplaceExistingResults } from './replace-existing.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Injectable()
export class ReplaceExistingService {
  replaceExistingData: ReplaceExistingData = {
    operatingHours: 5200,
    motorSize: 150,
    load: 75,
    electricityCost: 0.12,
    existingEfficiency: 92,
    newEfficiency: 96,
    purchaseCost: 13000
  };
  constructor(private formBuilder: FormBuilder) { }

  initForm(isReplacementMotor: boolean): FormGroup {
    if (isReplacementMotor) {
      let tmpForm: FormGroup = this.formBuilder.group({
        operatingHours: [5200, [Validators.required, Validators.min(0)]],
        motorSize: [150, [Validators.required, Validators.min(0)]],
        load: [75, [Validators.required, Validators.min(0), Validators.max(100)]],
        electricityCost: [0.12, [Validators.required, Validators.min(0)]],
        newEfficiency: [96, [Validators.required, Validators.min(0), Validators.max(100)]],
        purchaseCost: [1300, [Validators.required, Validators.min(0)]]
      });
      tmpForm.controls.operatingHours.disable();
      tmpForm.controls.motorSize.disable();
      tmpForm.controls.load.disable();
      tmpForm.controls.electricityCost.disable();
      return tmpForm;
    }
    else {
      let tmpForm: FormGroup = this.formBuilder.group({
        operatingHours: [5200, [Validators.required, Validators.min(0)]],
        motorSize: [150, [Validators.required, Validators.min(0)]],
        load: [75, [Validators.required, Validators.min(0), Validators.max(100)]],
        electricityCost: [0.12, [Validators.required, Validators.min(0)]],
        existingEfficiency: [92, [Validators.required, Validators.min(0), Validators.max(100)]]
      });
      return tmpForm;
    }
  }

  getFormFromObj(inputObj: ReplaceExistingData, isReplacementMotor: boolean): FormGroup {
    if (isReplacementMotor) {
      let tmpForm: FormGroup = this.formBuilder.group({
        operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0)]],
        motorSize: [inputObj.motorSize, [Validators.required, Validators.min(0)]],
        load: [inputObj.load, [Validators.required, Validators.min(0), Validators.max(100)]],
        electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
        newEfficiency: [inputObj.newEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
        purchaseCost: [inputObj.purchaseCost, [Validators.required, Validators.min(0)]]
      });
      tmpForm.controls.operatingHours.disable();
      tmpForm.controls.motorSize.disable();
      tmpForm.controls.load.disable();
      tmpForm.controls.electricityCost.disable();
      return tmpForm;
    }
    else {
      let tmpForm: FormGroup = this.formBuilder.group({
        operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0)]],
        motorSize: [inputObj.motorSize, [Validators.required, Validators.min(0)]],
        existingEfficiency: [inputObj.existingEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
        load: [inputObj.load, [Validators.required, Validators.min(0), Validators.max(100)]],
        electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
      });
      return tmpForm;
    }
  }

  getObjFromForm(form: FormGroup, isReplacementMotor: boolean): ReplaceExistingData {
    this.replaceExistingData = {
      operatingHours: isReplacementMotor ? null : form.controls.operatingHours.value,
      motorSize: isReplacementMotor ? null : form.controls.motorSize.value,
      existingEfficiency: isReplacementMotor ? null : form.controls.existingEfficiency.value,
      load: isReplacementMotor ? null : form.controls.load.value,
      electricityCost: isReplacementMotor ? null : form.controls.electricityCost.value,
      newEfficiency: isReplacementMotor ? form.controls.newEfficiency.value : null,
      purchaseCost: isReplacementMotor ? form.controls.purchaseCost.value : null
    }
    return this.replaceExistingData;
  }

  initReplaceExistingData(): ReplaceExistingData {
    this.replaceExistingData = {
      operatingHours: 5200,
      motorSize: 150,
      load: 75,
      electricityCost: 0.12,
      existingEfficiency: 92,
      newEfficiency: 96,
      purchaseCost: 13000
    };
    return this.replaceExistingData;
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
