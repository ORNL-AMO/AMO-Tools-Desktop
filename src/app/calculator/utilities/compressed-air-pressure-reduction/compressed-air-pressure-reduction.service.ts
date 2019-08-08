import { Injectable } from '@angular/core';
import { CompressedAirPressureReductionData, CompressedAirPressureReductionResult, CompressedAirPressureReductionResults, CompressedAirPressureReductionInput } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class CompressedAirPressureReductionService {

  baselineData: Array<CompressedAirPressureReductionData>;
  modificationData: Array<CompressedAirPressureReductionData>;
  operatingHours: OperatingHours;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }


  initObject(index: number, settings: Settings, isBaseline: boolean, operatingHours: OperatingHours): CompressedAirPressureReductionData {
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let electricityCost: number = 0.12;
    if (settings) {
      electricityCost = settings.electricityCost;
    }
    let obj: CompressedAirPressureReductionData = {
      name: 'Equipment #' + (index + 1),
      isBaseline: isBaseline,
      hoursPerYear: hoursPerYear,
      electricityCost: electricityCost,
      compressorPower: 0,
      pressure: 0,
      proposedPressure: 0
    };
    return obj;
  }

  getFormFromObj(inputObj: CompressedAirPressureReductionData, index: number, isBaseline: boolean): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [inputObj.name, [Validators.required]],
      hoursPerYear: [inputObj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
      compressorPower: [inputObj.compressorPower],
      pressure: [inputObj.pressure],
      proposedPressure: [inputObj.proposedPressure]
    });
    form = this.setValidators(form, isBaseline);
    return form;
  }

  setValidators(form: FormGroup, isBaseline: boolean): FormGroup {
    if (isBaseline) {
      form.controls.compressorPower.setValidators([Validators.required, Validators.min(0)]);
      form.controls.pressure.setValidators([Validators.required, Validators.min(0)]);
    }
    else {
      form.controls.compressorPower.disable();
      form.controls.proposedPressure.setValidators([Validators.required, Validators.min(0)]);
    }
    return form;
  }

  //may need some editing to accomodate specific functionality with proposed pressure
  getObjFromForm(form: FormGroup, isBaseline: boolean): CompressedAirPressureReductionData {
    let obj: CompressedAirPressureReductionData = {
      name: form.controls.name.value,
      isBaseline: isBaseline,
      hoursPerYear: form.controls.hoursPerYear.value,
      electricityCost: form.controls.electricityCost.value,
      compressorPower: form.controls.compressorPower.value,
      pressure: form.controls.pressure.value,
      proposedPressure: form.controls.proposedPressure.value
    };
    return obj;
  }


  getResults(settings: Settings, baseline: Array<CompressedAirPressureReductionData>, modification?: Array<CompressedAirPressureReductionData>) {
    let baselineInpCpy: Array<CompressedAirPressureReductionData> = JSON.parse(JSON.stringify(baseline));
    let baselineResults: CompressedAirPressureReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: CompressedAirPressureReductionResult;
    let annualEnergySavings: number = 0;
    let annualCostSavings: number = 0;

    if (modification) {
      let modificationInpCpy: Array<CompressedAirPressureReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }

    let waterReductionResults: CompressedAirPressureReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualEnergySavings: annualEnergySavings,
      annualCostSavings: annualCostSavings
    };

    if (modificationResults) {
      waterReductionResults.annualEnergySavings = baselineResults.energyUse - modificationResults.energyUse;
      waterReductionResults.annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
    }
    return waterReductionResults;
  }

  calculate(input: Array<CompressedAirPressureReductionData>, settings: Settings): CompressedAirPressureReductionResult {
    let inputArray = this.convertInputs(input, settings);
    let inputObj: CompressedAirPressureReductionInput = {
      compressedAirPressureReductionInputVec: inputArray
    };
    let results: CompressedAirPressureReductionResult = this.standaloneService.compressedAirPressureReduction(inputObj);
    results = this.convertResults(results, settings);
    return results;
  }

  calculateIndividualEquipment(input: CompressedAirPressureReductionData, settings: Settings) {
    let inputArray: Array<CompressedAirPressureReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertInputs(inputArray, settings);
    let inputObj: CompressedAirPressureReductionInput = {
      compressedAirPressureReductionInputVec: inputArray
    };
    let results: CompressedAirPressureReductionResult = this.standaloneService.compressedAirPressureReduction(inputObj);
    results = this.convertResults(results, settings);
    return results;
  }

  convertInputs(inputArray: Array<CompressedAirPressureReductionData>, settings: Settings): Array<CompressedAirPressureReductionData> {
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].pressure = this.convertUnitsService.value(inputArray[i].pressure).from(settings.pressureMeasurement).to('psig');
        inputArray[i].proposedPressure = this.convertUnitsService.value(inputArray[i].proposedPressure).from(settings.pressureMeasurement).to('psig');
      }
    }
    return inputArray;
  }

  convertResults(results: CompressedAirPressureReductionResult, settings: Settings): CompressedAirPressureReductionResult {
    // if (settings.unitsOfMeasure == 'Metric') {
    //   results.waterUse = this.convertUnitsService.value(results.waterUse).from('gal').to('L');
    // } else if (settings.unitsOfMeasure == 'Imperial') {
    //   results.waterUse = results.waterUse / 1000;
    // }
    return results;
  }
}
