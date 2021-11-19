import { Injectable } from '@angular/core';
import { CompressedAirPressureReductionData, CompressedAirPressureReductionResult, CompressedAirPressureReductionResults, CompressedAirPressureReductionInput } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
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
      powerType: 'Measured',
      hoursPerYear: hoursPerYear,
      electricityCost: electricityCost,
      compressorPower: 0,
      pressure: 0,
      proposedPressure: 0,
      pressureRated: 0,
      atmosphericPressure: 0
    };
    return obj;
  }

  getFormFromObj(inputObj: CompressedAirPressureReductionData, index: number, isBaseline: boolean): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [inputObj.name, [Validators.required]],
      powerType: [inputObj.powerType],
      hoursPerYear: [inputObj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      electricityCost: [inputObj.electricityCost, [Validators.required, Validators.min(0)]],
      compressorPower: [inputObj.compressorPower],
      pressure: [inputObj.pressure],
      proposedPressure: [inputObj.proposedPressure],
      pressureRated: [inputObj.pressureRated],
      atmosphericPressure: [inputObj.atmosphericPressure]
    });
    form = this.setValidators(form, isBaseline);
    return form;
  }

  setValidators(form: FormGroup, isBaseline: boolean): FormGroup {
    if (isBaseline) {
      form.controls.compressorPower.setValidators([Validators.required, Validators.min(0)]);
      form.controls.pressure.setValidators([Validators.required, Validators.min(0)]);
      form.controls.pressureRated.setValidators([Validators.required, Validators.min(0)]);
      form.controls.atmosphericPressure.setValidators([Validators.required, Validators.min(0)]);
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
      powerType: form.controls.powerType.value,
      isBaseline: isBaseline,
      hoursPerYear: form.controls.hoursPerYear.value,
      electricityCost: form.controls.electricityCost.value,
      compressorPower: form.controls.compressorPower.value,
      pressure: form.controls.pressure.value,
      proposedPressure: form.controls.proposedPressure.value,
      pressureRated: form.controls.pressureRated.value,
      atmosphericPressure: form.controls.atmosphericPressure.value
    };
    return obj;
  }


  getResults(settings: Settings, baseline: Array<CompressedAirPressureReductionData>, modification?: Array<CompressedAirPressureReductionData>) {
    let baselineInpCpy: Array<CompressedAirPressureReductionData> = JSON.parse(JSON.stringify(baseline));
    let baselineResults: CompressedAirPressureReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: CompressedAirPressureReductionResult = {
      energyUse: 0,
      energyCost: 0
    };
    if (modification) {
      let modificationInpCpy: Array<CompressedAirPressureReductionData> = JSON.parse(JSON.stringify(modification));
      if (modificationInpCpy.length > 0) {
        modificationInpCpy[0].pressure = modificationInpCpy[0].proposedPressure;
      }
      modificationResults = this.calculate(modificationInpCpy, settings);
    } else {
      modificationResults = baselineResults;
    }
    let compressedAirPressureReductionResults: CompressedAirPressureReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualEnergySavings: 0,
      annualCostSavings: 0
    };

    if (modificationResults) {
      compressedAirPressureReductionResults.annualEnergySavings = baselineResults.energyUse - modificationResults.energyUse;
      compressedAirPressureReductionResults.annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
    }
    return compressedAirPressureReductionResults;
  }

  calculate(input: Array<CompressedAirPressureReductionData>, settings: Settings): CompressedAirPressureReductionResult {
    let inputArray = this.convertInputs(input, settings);
    let inputObj: CompressedAirPressureReductionInput = {
      compressedAirPressureReductionInputVec: inputArray
    };
    let results: CompressedAirPressureReductionResult = this.standaloneService.compressedAirPressureReduction(inputObj);
    return results;
  }

  calculateIndividualEquipment(input: CompressedAirPressureReductionData, settings: Settings) {
    let inputArray: Array<CompressedAirPressureReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertInputs(inputArray, settings);
    let inputObj: CompressedAirPressureReductionInput = {
      compressedAirPressureReductionInputVec: inputArray
    };
    let results: CompressedAirPressureReductionResult = this.standaloneService.compressedAirPressureReduction(inputObj);
    return results;
  }

  convertInputs(inputArray: Array<CompressedAirPressureReductionData>, settings: Settings): Array<CompressedAirPressureReductionData> {
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].pressureRated = this.convertUnitsService.value(inputArray[i].pressureRated).from('barg').to('psig');
        inputArray[i].atmosphericPressure = this.convertUnitsService.value(inputArray[i].atmosphericPressure).from('bara').to('psia');
        inputArray[i].pressure = this.convertUnitsService.value(inputArray[i].pressure).from('barg').to('psig');
        inputArray[i].proposedPressure = this.convertUnitsService.value(inputArray[i].proposedPressure).from('barg').to('psig');
      }
    }
    return inputArray;
  }

  generateExample(settings: Settings, isBaseline: boolean): CompressedAirPressureReductionData {
    let proposedPressure: number = 90;
    let pressure: number = 100;

    let pressureRated: number = 100;
    let atmosphericPressure: number = 14.7;

    if (settings.unitsOfMeasure != 'Imperial') {
      proposedPressure = this.convertUnitsService.value(proposedPressure).from('psig').to('barg');
      proposedPressure = Number(proposedPressure.toFixed(3));
      pressure = this.convertUnitsService.value(pressure).from('psig').to('barg');
      pressure = Number(pressure.toFixed(3));

      pressureRated = this.convertUnitsService.value(pressureRated).from('psig').to('barg');
      pressureRated = Number(pressureRated.toFixed(3));

      atmosphericPressure = this.convertUnitsService.value(atmosphericPressure).from('psia').to('bara');
      atmosphericPressure = Number(atmosphericPressure.toFixed(3));
    }
    let exampleData: CompressedAirPressureReductionData = {
      name: 'Equipment #1',
      powerType: 'Measured',
      isBaseline: isBaseline,
      hoursPerYear: 8760,
      electricityCost: .066,
      compressorPower: 200,
      pressure: pressure,
      proposedPressure: proposedPressure,
      pressureRated: pressureRated,
      atmosphericPressure: atmosphericPressure
    }
    return exampleData;
  }
}
