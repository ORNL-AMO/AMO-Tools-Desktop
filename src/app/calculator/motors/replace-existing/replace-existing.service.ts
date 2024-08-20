import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ReplaceExistingData, ReplaceExistingResults } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { Co2SavingsData } from '../../utilities/co2-savings/co2-savings.service';

@Injectable()
export class ReplaceExistingService {

  replaceExistingData: ReplaceExistingData;
  operatingHours: OperatingHours;
  constructor(private formBuilder: UntypedFormBuilder, 
    private assessmentCo2Service: AssessmentCo2SavingsService, private convertUnitsService: ConvertUnitsService) { }

  initForm(settings: Settings, operatingHours: number): UntypedFormGroup {
    let obj: ReplaceExistingData = this.initReplaceExistingData(settings, operatingHours);
    let tmpForm: UntypedFormGroup = this.getFormFromObj(obj);
    return tmpForm;
  }

  getFormFromObj(inputObj: ReplaceExistingData): UntypedFormGroup {
    let tmpForm: UntypedFormGroup = this.formBuilder.group({
      operatingHours: [inputObj.operatingHours, [Validators.required, Validators.min(0)]],
      motorSize: [inputObj.motorSize, [Validators.required, Validators.min(0)]],
      load: [inputObj.load, [Validators.required, Validators.min(0), Validators.max(100)]],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
      newEfficiency: [inputObj.newEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      existingEfficiency: [inputObj.existingEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      purchaseCost: [inputObj.purchaseCost, [Validators.required, Validators.min(0)]],
      rewindEfficiencyLoss: [inputObj.rewindEfficiencyLoss, [Validators.required, Validators.min(0), Validators.max(100)]],
      rewindCost: [inputObj.rewindCost, [Validators.required, Validators.min(0)]]
    });
    return tmpForm;
  }

  getObjFromForm(form: UntypedFormGroup): ReplaceExistingData {
    return {
      operatingHours: form.controls.operatingHours.value,
      motorSize: form.controls.motorSize.value,
      existingEfficiency: form.controls.existingEfficiency.value,
      load: form.controls.load.value,
      electricityCost: form.controls.electricityCost.value,
      newEfficiency: form.controls.newEfficiency.value,
      purchaseCost: form.controls.purchaseCost.value,
      rewindCost: form.controls.rewindCost.value,
      rewindEfficiencyLoss: form.controls.rewindEfficiencyLoss.value
    };
  }

  initReplaceExistingData(settings: Settings, operatingHours: number): ReplaceExistingData {
    let motorSize: number = 150;
    if (settings.unitsOfMeasure != 'Imperial') {
      motorSize = 100;
    }
    return {
      operatingHours: operatingHours,
      motorSize: motorSize,
      load: 75,
      electricityCost: settings.electricityCost,
      existingEfficiency: 92,
      newEfficiency: 96,
      purchaseCost: 13000,
      rewindCost: 8000,
      rewindEfficiencyLoss: 1
    };
  }

  resetReplaceExistingData(settings: Settings, operatingHours: number): ReplaceExistingData {
    return {
      operatingHours: operatingHours,
      motorSize: 0,
      load: 0,
      electricityCost: settings.electricityCost,
      existingEfficiency: 0,
      newEfficiency: 0,
      purchaseCost: 0,
      rewindCost: 0,
      rewindEfficiencyLoss: 0
    };
  }

  getResults(inputs: ReplaceExistingData, settings: Settings, co2SavingsData?: Co2SavingsData): ReplaceExistingResults {
    let inputCpy: ReplaceExistingData = JSON.parse(JSON.stringify(inputs));
    let results: ReplaceExistingResults = {
      existingEnergyUse: 0,
      existingEmissionOutput: 0,
      newEnergyUse: 0,
      newEnergyCost: 0,
      existingEnergyCost: 0,
      newEmissionOutput: 0,
      annualEnergySavings: 0,
      costSavings: 0,
      simplePayback: 0,
      percentSavings: 0,
      rewoundEnergyUse: 0,
      rewoundEmissionOutput: 0,
      rewoundEnergyCost: 0,
      incrementalSunkCost: inputCpy.rewindCost,
      incrementalAnnualEnergySavings: 0,
      incrementalCostDifference: 0,
      incrementalEnergyCostSavings: 0,
      incrementalSimplePayback: 0
    };
    if (settings.unitsOfMeasure != 'Imperial') {
      inputCpy.motorSize = this.convertUnitsService.value(inputCpy.motorSize).from('kW').to('hp');
    }
    results.existingEnergyUse = this.getExistingEnergyUse(inputCpy);
    results.newEnergyUse = this.getNewEnergyUse(inputCpy);
    results.existingEnergyCost = this.getExistingEnergyCost(inputCpy, results);
    results.newEnergyCost = this.getNewEnergyCost(inputCpy, results);
    results.annualEnergySavings = this.getAnnualEnergySavings(results);
    results.costSavings = this.getCostSavings(inputCpy, results);
    results.simplePayback = this.getSimplePayback(inputCpy, results);
    results.rewoundEnergyUse = this.getRewoundEnergyUse(inputCpy);
    results.rewoundEnergyCost = this.getRewoundEnergyCost(inputCpy, results);
    results.percentSavings = this.getPercentSavings(results);
    results.incrementalAnnualEnergySavings = this.getIncrementalAnnualEnergySavings(results);
    results.incrementalCostDifference = this.getIncrementalCostDifference(inputCpy);
    results.incrementalEnergyCostSavings = this.getIncrementalEnergyCostSavings(results, inputCpy);
    results.incrementalSimplePayback = this.getIncrementalSimplePayback(results);
    results = this.setCo2SavingsEmissionsResult(co2SavingsData, results, settings);
    return results;
  }

  setCo2SavingsEmissionsResult(co2SavingsData: Co2SavingsData, results: ReplaceExistingResults, settings: Settings): ReplaceExistingResults {
    results.existingEmissionOutput = undefined;
    results.rewoundEmissionOutput = undefined;
    results.newEmissionOutput = undefined;
    if (co2SavingsData) {
      co2SavingsData.electricityUse = results.existingEnergyUse;
      results.existingEmissionOutput = this.assessmentCo2Service.getCo2EmissionsResult(co2SavingsData, settings);
      results.existingEmissionOutput /= 1000;

      co2SavingsData.electricityUse = results.rewoundEnergyUse;
      results.rewoundEmissionOutput = this.assessmentCo2Service.getCo2EmissionsResult(co2SavingsData, settings);
      results.rewoundEmissionOutput /= 1000;

      co2SavingsData.electricityUse = results.newEnergyUse;
      results.newEmissionOutput = this.assessmentCo2Service.getCo2EmissionsResult(co2SavingsData, settings);
      results.newEmissionOutput /= 1000;
    }
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

  getRewoundEnergyUse(inputs: ReplaceExistingData): number {
    return 0.746 * inputs.motorSize * (inputs.load / 100) * inputs.operatingHours * (100 / (inputs.existingEfficiency - inputs.rewindEfficiencyLoss));
  }
  getRewoundEnergyCost(inputs: ReplaceExistingData, results: ReplaceExistingResults): number {
    return results.rewoundEnergyUse * inputs.electricityCost;
  }

  //may want to add percent savings as a result. talk to kristina first
  getPercentSavings(results: ReplaceExistingResults): number {
    return ((results.existingEnergyCost - results.newEnergyCost) / results.existingEnergyCost) * 100;
  }

  //incrementalResults
  getIncrementalAnnualEnergySavings(results: ReplaceExistingResults): number {
    return results.rewoundEnergyUse - results.newEnergyUse;
  }
  getIncrementalCostDifference(inputs: ReplaceExistingData): number {
    return inputs.purchaseCost - inputs.rewindCost;
  }
  getIncrementalEnergyCostSavings(results: ReplaceExistingResults, inputs: ReplaceExistingData): number {
    return results.incrementalAnnualEnergySavings * inputs.electricityCost;
  }
  getIncrementalSimplePayback(results: ReplaceExistingResults): number {
    return results.incrementalCostDifference / results.incrementalEnergyCostSavings;
  }
}
