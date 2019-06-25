import { Injectable } from '@angular/core';
import { WaterReductionData, VolumeMeterMethodData, MeteredFlowMethodData, BucketMethodData, WaterOtherMethodData, WaterReductionResult, WaterReductionInput, WaterReductionResults } from '../../../shared/models/standalone';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class WaterReductionService {

  baselineData: Array<WaterReductionData>;
  modificationData: Array<WaterReductionData>;

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  initObject(index: number, settings: Settings, isWastewater: boolean, operatingHours: OperatingHours): WaterReductionData {
    let defaultVolumeMeterMethodData: VolumeMeterMethodData = {
      initialMeterReading: 4235,
      finalMeterReading: 5842,
      elapsedTime: 15
    };
    let defaultMeteredFlowMethod: MeteredFlowMethodData = {
      meterReading: 100
    };
    let defaultBucketMethodData: BucketMethodData = {
      bucketVolume: 10,
      bucketFillTime: 20
    };
    let defaultOtherMethodData: WaterOtherMethodData = {
      consumption: 15000
    };

    let hoursPerYear: number = 8736;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let waterCost: number = 0.12;
    if (settings) {
      if (isWastewater) {
        waterCost = settings.waterWasteCost;
      }
      else {
        waterCost = settings.waterCost;
      }
    }
    let obj: WaterReductionData = {
      name: 'Equipment #' + (index + 1),
      hoursPerYear: hoursPerYear,
      waterCost: waterCost,
      measurementMethod: 0,
      volumeMeterMethodData: defaultVolumeMeterMethodData,
      meteredFlowMethodData: defaultMeteredFlowMethod,
      bucketMethodData: defaultBucketMethodData,
      otherMethodData: defaultOtherMethodData
    };
    return obj;
  }

  getFormFromObj(inputObj: WaterReductionData, index: number, isBaseline): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [inputObj.name, [Validators.required]],
      hoursPerYear: [inputObj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      waterCost: [inputObj.waterCost, [Validators.required, Validators.min(0)]],
      measurementMethod: [inputObj.measurementMethod],

      //volume meter method data
      initialMeterReading: [inputObj.volumeMeterMethodData.initialMeterReading],
      finalMeterReading: [inputObj.volumeMeterMethodData.finalMeterReading],
      elapsedTime: [inputObj.volumeMeterMethodData.elapsedTime],

      //metered flow method data
      meterReading: [inputObj.meteredFlowMethodData.meterReading],

      //bucket method data
      bucketVolume: [inputObj.bucketMethodData.bucketVolume],
      bucketFillTime: [inputObj.bucketMethodData.bucketFillTime],

      //water other method data
      consumption: [inputObj.otherMethodData.consumption]
    });
    form = this.setValidators(form);

    return form;
  }

  setValidators(form: FormGroup): FormGroup {
    switch (form.controls.measurementMethod.value) {
      case 0:
        form.controls.initialMeterReading.setValidators([Validators.required, Validators.min(0)]);
        form.controls.finalMeterReading.setValidators([Validators.required, Validators.min(0)]);
        form.controls.elapsedTime.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 1:
        form.controls.meterReading.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 2:
        form.controls.bucketVolume.setValidators([Validators.required, Validators.min(0)]);
        form.controls.bucketFillTime.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 3:
        form.controls.consumption.setValidators([Validators.required, Validators.min(0)]);
        break;
    }
    return form;
  }

  getObjFromForm(form: FormGroup): WaterReductionData {
    let volumeMeterMethodData: VolumeMeterMethodData = {
      initialMeterReading: form.controls.initialMeterReading.value,
      finalMeterReading: form.controls.finalMeterReading.value,
      elapsedTime: form.controls.elapsedTime.value
    };
    let meteredFlowMethodData: MeteredFlowMethodData = {
      meterReading: form.controls.meterReading.value
    };
    let bucketMethodData: BucketMethodData = {
      bucketVolume: form.controls.bucketVolume.value,
      bucketFillTime: form.controls.bucketFillTime.value
    };
    let otherMethodData: WaterOtherMethodData = {
      consumption: form.controls.consumption.value
    };
    let obj: WaterReductionData = {
      name: form.controls.name.value,
      hoursPerYear: form.controls.hoursPerYear.value,
      waterCost: form.controls.waterCost.value,
      measurementMethod: form.controls.measurementMethod.value,
      volumeMeterMethodData: volumeMeterMethodData,
      meteredFlowMethodData: meteredFlowMethodData,
      bucketMethodData: bucketMethodData,
      otherMethodData: otherMethodData
    };
    return obj;
  }

  getResults(settings: Settings, baseline: Array<WaterReductionData>, modification?: Array<WaterReductionData>) {
    let baselineInpCpy: Array<WaterReductionData> = JSON.parse(JSON.stringify(baseline));
    let baselineResults: WaterReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: WaterReductionResult;
    let annualWaterSavings: number = 0;
    let annualCostSavings: number = 0;

    if (modification) {
      let modificationInpCpy: Array<WaterReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }

    if (modificationResults) {
      annualWaterSavings = baselineResults.waterUse - modificationResults.waterUse;
      annualCostSavings = baselineResults.waterCost - modificationResults.waterCost;
    }
    let waterReductionResults: WaterReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualWaterSavings: annualWaterSavings,
      annualCostSavings: annualCostSavings
    };
    return waterReductionResults;
  }

  calculate(input: Array<WaterReductionData>, settings: Settings): WaterReductionResult {
    let inputArray: Array<WaterReductionData>;
    let inputObj: WaterReductionInput = {
      waterReductionInputVec: inputArray
    };
    let results: WaterReductionResult = this.standaloneService.waterReduction(inputObj);
    results = this.convertResults(results, settings);
    return results;
  }

  calculateIndividualEquipment(input: WaterReductionData, settings: Settings) {
    let inputArray: Array<WaterReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertInputs(inputArray, settings);
    let inputObj: WaterReductionInput = {
      waterReductionInputVec: inputArray
    };
    let results: WaterReductionResult = this.standaloneService.waterReduction(inputObj);
    results = this.convertResults(results, settings);
    return results;
  }

  convertInputs(inputArray: Array<WaterReductionData>, settings: Settings): Array<WaterReductionData> {
    if (settings.unitsOfMeasure == 'Metric') {
      let gallonConversionHelper = this.convertUnitsService.value(1).from('L').to('gal');
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].waterCost = inputArray[i].waterCost / gallonConversionHelper;
        inputArray[i].volumeMeterMethodData.initialMeterReading = this.convertUnitsService.value(inputArray[i].volumeMeterMethodData.initialMeterReading).from('L').to('gal');
        inputArray[i].volumeMeterMethodData.finalMeterReading = this.convertUnitsService.value(inputArray[i].volumeMeterMethodData.finalMeterReading).from('L').to('gal');
        inputArray[i].meteredFlowMethodData.meterReading = this.convertUnitsService.value(inputArray[i].meteredFlowMethodData.meterReading).from('L').to('gal');
        inputArray[i].bucketMethodData.bucketVolume = this.convertUnitsService.value(inputArray[i].bucketMethodData.bucketVolume).from('L').to('gal');
        inputArray[i].otherMethodData.consumption = this.convertUnitsService.value(inputArray[i].otherMethodData.consumption).from('L').to('gal');
      }
    }
    return inputArray;
  }

  convertResults(results: WaterReductionResult, settings: Settings): WaterReductionResult {
    if (settings.unitsOfMeasure == 'Metric') {
      results.waterUse = this.convertUnitsService.value(results.waterUse).from('gal').to('L');
    }
    return results;
  }



}
