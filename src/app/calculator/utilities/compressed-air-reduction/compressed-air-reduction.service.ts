import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirReductionData, CompressedAirFlowMeterMethodData, BagMethodData, PressureMethodData, CompressedAirOtherMethodData, CompressorElectricityData, CompressedAirReductionResults, CompressedAirReductionInput, CompressedAirReductionResult } from '../../../shared/models/standalone';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { OperatingHours } from '../../../shared/models/operations';

@Injectable()
export class CompressedAirReductionService {

  baselineData: Array<CompressedAirReductionData>;
  modificationData: Array<CompressedAirReductionData>;
  operatingHours: OperatingHours;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }


  initObject(index: number, settings: Settings, operatingHours: OperatingHours): CompressedAirReductionData {
    let defaultFlowMeterObj: CompressedAirFlowMeterMethodData = {
      meterReading: 0.2
    };
    let defaultBagMethodObj: BagMethodData = {
      height: 8,
      diameter: 12,
      fillTime: 80
    };
    let defaultPressureMethodObj: PressureMethodData = {
      nozzleType: 0,
      numberOfNozzles: 3,
      supplyPressure: 80
    };
    let defaultOtherMethodObj: CompressedAirOtherMethodData = {
      consumption: 1750
    };
    let defaultCompressorElectricityObj: CompressorElectricityData = {
      compressorControl: 0,
      compressorControlAdjustment: 25,
      compressorSpecificPowerControl: 0,
      compressorSpecificPower: 0.16
    };
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let obj: CompressedAirReductionData = {
      name: 'Equipment #' + (index + 1),
      hoursPerYear: hoursPerYear,
      utilityType: 0,
      utilityCost: settings && settings.compressedAirCost ? settings.compressedAirCost : 0.12,
      compressedAirCost: settings && settings.compressedAirCost ? settings.compressedAirCost : 0.12,
      electricityCost: settings && settings.electricityCost ? settings.electricityCost : 0.066,
      measurementMethod: 0,
      flowMeterMethodData: defaultFlowMeterObj,
      bagMethodData: defaultBagMethodObj,
      pressureMethodData: defaultPressureMethodObj,
      otherMethodData: defaultOtherMethodObj,
      compressorElectricityData: defaultCompressorElectricityObj,
      units: 1
    };
    return obj;
  }

  getFormFromObj(inputObj: CompressedAirReductionData, index: number, isBaseline): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [inputObj.name, [Validators.required]],
      hoursPerYear: [inputObj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [{ value: inputObj.utilityType, disabled: (index != 0 || !isBaseline) }],
      measurementMethod: [inputObj.measurementMethod],

      // flow meter method data
      meterReading: [inputObj.flowMeterMethodData.meterReading],

      // bag method data
      height: [inputObj.bagMethodData.height],
      diameter: [inputObj.bagMethodData.diameter],
      fillTime: [inputObj.bagMethodData.fillTime],

      // orifice/pressure method data
      nozzleType: [inputObj.pressureMethodData.nozzleType],
      supplyPressure: [inputObj.pressureMethodData.supplyPressure],
      numberOfNozzles: [inputObj.pressureMethodData.numberOfNozzles],

      // offsheet / other data
      consumption: [inputObj.otherMethodData.consumption],

      // compressor electricity data
      compressedAirCost: [inputObj.compressedAirCost],
      electricityCost: [inputObj.electricityCost],
      compressorControl: [inputObj.compressorElectricityData.compressorControl],
      compressorControlAdjustment: [inputObj.compressorElectricityData.compressorControlAdjustment],
      compressorSpecificPowerControl: [inputObj.compressorElectricityData.compressorSpecificPowerControl],
      compressorSpecificPower: [inputObj.compressorElectricityData.compressorSpecificPower],

      units: [inputObj.units]
    });
    form = this.setValidators(form);
    return form;
  }

  setValidators(form: FormGroup): FormGroup {
    form.controls.units.setValidators([Validators.required, Validators.min(0)]);
    switch (form.controls.measurementMethod.value) {
      case 0:
        form.controls.meterReading.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 1:
        form.controls.height.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
        form.controls.diameter.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
        form.controls.fillTime.setValidators([Validators.required, GreaterThanValidator.greaterThan(0)]);
        break;
      case 2:
        form.controls.nozzleType.setValidators([Validators.required]);
        form.controls.supplyPressure.setValidators([Validators.required, Validators.min(0)]);
        form.controls.numberOfNozzles.setValidators([Validators.required, Validators.min(1)]);
        break;
      case 3:
        form.controls.consumption.setValidators([Validators.required, Validators.min(0)]);
        form.controls.units.clearValidators();
        break;
    }
    if (form.controls.utilityType.value == 0) {
      form.controls.compressedAirCost.setValidators([Validators.required, Validators.min(0)]);
    }
    else if (form.controls.utilityType.value == 1) {
      form.controls.electricityCost.setValidators([Validators.required, Validators.min(0)]);
      form.controls.compressorControl.setValidators([Validators.required]);
      if (form.controls.compressorControl.value == 8) {
        form.controls.compressorControlAdjustment.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      }
      if (form.controls.compressorSpecificPowerControl.value == 4) {
        form.controls.compressorSpecificPower.setValidators([Validators.required, Validators.min(0)]);
      }
    }
    return form;
  }

  getObjFromForm(form: FormGroup): CompressedAirReductionData {
    let flowMeterObj: CompressedAirFlowMeterMethodData = {
      meterReading: form.controls.meterReading.value
    };
    let bagMethodObj: BagMethodData = {
      height: form.controls.height.value,
      diameter: form.controls.diameter.value,
      fillTime: form.controls.fillTime.value
    };
    let pressureMethodObj: PressureMethodData = {
      nozzleType: form.controls.nozzleType.value,
      numberOfNozzles: form.controls.numberOfNozzles.value,
      supplyPressure: form.controls.supplyPressure.value
    };
    let otherMethodObj: CompressedAirOtherMethodData = {
      consumption: form.controls.consumption.value
    };
    let compressorElectricityObj: CompressorElectricityData = {
      compressorControl: form.controls.compressorControl.value,
      compressorControlAdjustment: form.controls.compressorControlAdjustment.value,
      compressorSpecificPowerControl: form.controls.compressorSpecificPowerControl.value,
      compressorSpecificPower: form.controls.compressorSpecificPower.value
    }
    let obj: CompressedAirReductionData = {
      name: form.controls.name.value,
      hoursPerYear: form.controls.hoursPerYear.value,
      utilityType: form.controls.utilityType.value,
      utilityCost: form.controls.utilityType.value === 0 ? form.controls.compressedAirCost.value : form.controls.electricityCost.value,
      compressedAirCost: form.controls.compressedAirCost.value,
      electricityCost: form.controls.electricityCost.value,
      measurementMethod: form.controls.measurementMethod.value,
      flowMeterMethodData: flowMeterObj,
      bagMethodData: bagMethodObj,
      pressureMethodData: pressureMethodObj,
      otherMethodData: otherMethodObj,
      compressorElectricityData: compressorElectricityObj,
      units: form.controls.units.value
    };
    return obj;
  }

  getResults(settings: Settings, baseline: Array<CompressedAirReductionData>, modification?: Array<CompressedAirReductionData>): CompressedAirReductionResults {
    let baselineInpCpy: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify(baseline));
    let baselineResults: CompressedAirReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: CompressedAirReductionResult;
    let annualEnergySavings: number = 0;
    let annualCostSavings: number = 0;
    let flowRateReduction: number = 0;
    let annualConsumptionReduction: number = 0;
    if (modification) {
      let modificationInpCpy: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }
    let compressedAirReductionResults: CompressedAirReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: annualEnergySavings,
      annualFlowRateReduction: flowRateReduction,
      annualConsumptionReduction: annualConsumptionReduction
    }
    if (modificationResults) {
      if (baselineInpCpy[0].utilityType == 0) {
        //use consumption reduction to energy use..
        compressedAirReductionResults.baselineResults.energyUse = compressedAirReductionResults.baselineResults.consumption;
        compressedAirReductionResults.modificationResults.energyUse = compressedAirReductionResults.modificationResults.consumption;
      }

      compressedAirReductionResults.annualEnergySavings = baselineResults.energyUse - modificationResults.energyUse;
      compressedAirReductionResults.annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
      compressedAirReductionResults.annualFlowRateReduction = baselineResults.flowRate - modificationResults.flowRate;
      compressedAirReductionResults.annualConsumptionReduction = baselineResults.consumption - modificationResults.consumption;
    }
    return compressedAirReductionResults;
  }

  calculate(input: Array<CompressedAirReductionData>, settings: Settings): CompressedAirReductionResult {
    let inputArray: Array<CompressedAirReductionData> = this.convertInputs(input, settings);
    let inputObj: CompressedAirReductionInput = {
      compressedAirReductionInputVec: inputArray
    };
    let results: CompressedAirReductionResult = this.standaloneService.compressedAirReduction(inputObj);
    results = this.convertResults(results, settings);
    return results;
  }

  calculateIndividualEquipment(input: CompressedAirReductionData, settings: Settings) {
    let inputArray: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertInputs(inputArray, settings);
    let inputObj: CompressedAirReductionInput = {
      compressedAirReductionInputVec: inputArray
    };
    let results: CompressedAirReductionResult = this.standaloneService.compressedAirReduction(inputObj);
    results = this.convertResults(results, settings);
    return results;
  }

  convertInputs(inputArray: Array<CompressedAirReductionData>, settings: Settings): Array<CompressedAirReductionData> {
    // need to loop through for conversions prior to calculation
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].flowMeterMethodData.meterReading = this.convertUnitsService.value(inputArray[i].flowMeterMethodData.meterReading).from('m3').to('ft3');
        inputArray[i].bagMethodData.height = this.convertUnitsService.value(inputArray[i].bagMethodData.height).from('cm').to('in');
        inputArray[i].bagMethodData.diameter = this.convertUnitsService.value(inputArray[i].bagMethodData.diameter).from('cm').to('in');
        inputArray[i].pressureMethodData.supplyPressure = this.convertUnitsService.value(inputArray[i].pressureMethodData.supplyPressure).from('barg').to('psig');
        inputArray[i].otherMethodData.consumption = this.convertUnitsService.value(inputArray[i].otherMethodData.consumption).from('m3').to('ft3');
        let conversionHelper = this.convertUnitsService.value(1).from('m3').to('ft3');
        inputArray[i].compressorElectricityData.compressorSpecificPower = inputArray[i].compressorElectricityData.compressorSpecificPower / conversionHelper;
        if (inputArray[i].utilityType == 0) {
          inputArray[i].compressedAirCost = inputArray[i].compressedAirCost / conversionHelper;
          inputArray[i].utilityCost = inputArray[i].compressedAirCost;
        }
        else {
          inputArray[i].utilityCost = inputArray[i].electricityCost;
        }
      }
    } else {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].otherMethodData.consumption = inputArray[i].otherMethodData.consumption * 1000;
      }
    }
    return inputArray;
  }

  convertResults(results: CompressedAirReductionResult, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      results.flowRate = this.convertUnitsService.value(results.flowRate).from('ft3').to('m3');
      results.singleNozzeFlowRate = this.convertUnitsService.value(results.singleNozzeFlowRate).from('ft3').to('m3');
      results.consumption = this.convertUnitsService.value(results.consumption).from('ft3').to('m3');
    } else if (settings.unitsOfMeasure == 'Imperial') {
      results.consumption = results.consumption / 1000;
    }
    return results;
  }
}
