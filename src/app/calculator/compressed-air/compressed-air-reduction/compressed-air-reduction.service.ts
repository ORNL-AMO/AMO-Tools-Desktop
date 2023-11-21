import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirReductionData, CompressedAirFlowMeterMethodData, BagMethodData, PressureMethodData, CompressedAirOtherMethodData, CompressorElectricityData, CompressedAirReductionResults, CompressedAirReductionInput, CompressedAirReductionResult } from '../../../shared/models/standalone';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertCompressedAirReductionService } from './convert-compressed-air-reduction.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CompressedAirReductionService {

  baselineData: Array<CompressedAirReductionData>;
  modificationData: Array<CompressedAirReductionData>;
  compressedAirResults: BehaviorSubject<CompressedAirReductionResults>;
  operatingHours: OperatingHours;
  constructor(private formBuilder: UntypedFormBuilder, private convertCompressedAirReductionService: ConvertCompressedAirReductionService, private standaloneService: StandaloneService) {
    this.compressedAirResults = new BehaviorSubject<CompressedAirReductionResults>(undefined);
   }


  initObject(index: number, settings: Settings, operatingHours: OperatingHours, utilityType?: number): CompressedAirReductionData {
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
      compressorControl: 8,
      compressorControlAdjustment: 25,
      compressorSpecificPowerControl: 0,
      compressorSpecificPower: 16
    };
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let utilityCost: number = settings && settings.electricityCost ? settings.electricityCost : 0.066;
    if (utilityType == 0) {
      utilityCost = settings && settings.compressedAirCost ? settings.compressedAirCost : 0.12;
    }


    let obj: CompressedAirReductionData = {
      name: 'Equipment #' + (index + 1),
      hoursPerYear: hoursPerYear,
      utilityType: utilityType ? utilityType : 0,
      utilityCost: utilityCost,
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
    if (settings.unitsOfMeasure != 'Imperial') {
      obj = this.convertCompressedAirReductionService.convertDefaultData(obj);
    }
    return obj;
  }

  generateExample(settings: Settings, isBaseline: boolean): CompressedAirReductionData {
    let meterReading: number = .2;
    if (!isBaseline) {
      meterReading = .1
    }
    let defaultData: CompressedAirReductionData = {
      name: 'Equipment #1',
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: settings && settings.compressedAirCost ? settings.compressedAirCost : 0.12,
      compressedAirCost: settings && settings.compressedAirCost ? settings.compressedAirCost : 0.12,
      electricityCost: settings && settings.electricityCost ? settings.electricityCost : 0.066,
      measurementMethod: 0,
      flowMeterMethodData: {
        meterReading: meterReading
      },
      bagMethodData: {
        height: 0,
        diameter: 0,
        fillTime: 0
      },
      pressureMethodData: {
        nozzleType: 0,
        numberOfNozzles: 0,
        supplyPressure: 0
      },
      otherMethodData: {
        consumption: 0
      },
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      },
      units: 1
    };
    if (settings.unitsOfMeasure != 'Imperial') {
      defaultData = this.convertCompressedAirReductionService.convertDefaultData(defaultData);
    }
    return defaultData;
  }

  getFormFromObj(inputObj: CompressedAirReductionData, index: number, isBaseline): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
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
    if(!isBaseline){
      form.controls.compressorControl.disable();
      form.controls.compressorControlAdjustment.disable();
      form.controls.compressorSpecificPowerControl.disable();
    }
    return form;
  }

  setValidators(form: UntypedFormGroup): UntypedFormGroup {
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

  getObjFromForm(form: UntypedFormGroup): CompressedAirReductionData {
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

  calculateResults(settings: Settings, baseline: Array<CompressedAirReductionData>, modification?: Array<CompressedAirReductionData>) {
    let results: CompressedAirReductionResults = {
      baselineResults: [],
      modificationResults: [],
      baselineAggregateResults: undefined,
      modificationAggregateResults: undefined,
      annualCostSavings: 0,
      annualEnergySavings: 0,
      annualFlowRateReduction: 0,
      annualConsumptionReduction: 0
    }
    let baselineInpCpy: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify(baseline));
    let modificationInpCpy: Array<CompressedAirReductionData>;

    results.baselineAggregateResults = this.calculate(baselineInpCpy, settings);
    if (modification) {
      modificationInpCpy = JSON.parse(JSON.stringify(modification));
      results.modificationAggregateResults = this.calculate(modificationInpCpy, settings);
    } else {
      results.modificationAggregateResults = results.baselineAggregateResults;
    }

    results = this.buildIndividualResults(baselineInpCpy, modificationInpCpy, results, settings);

    if (baselineInpCpy.length != 0 && baselineInpCpy[0].utilityType == 0) {
      results.baselineAggregateResults.energyUse = results.baselineAggregateResults.consumption;
      results.modificationAggregateResults.energyUse = results.modificationAggregateResults.consumption;
    }
    results.annualCostSavings = (results.baselineAggregateResults.energyCost - results.modificationAggregateResults.energyCost) * (baselineInpCpy[0].compressorElectricityData.compressorControlAdjustment / 100);
    results.annualFlowRateReduction = results.baselineAggregateResults.flowRate - results.modificationAggregateResults.flowRate;
    results.annualConsumptionReduction = results.baselineAggregateResults.consumption - results.modificationAggregateResults.consumption;
    // overwrite estimated energyUse value originally set in suite results
    results.modificationAggregateResults.energyUse = results.baselineAggregateResults.energyUse - results.annualEnergySavings;
    results.modificationAggregateResults.energyCost = results.baselineAggregateResults.energyCost - results.annualCostSavings;
    this.compressedAirResults.next(results);
  }

  buildIndividualResults(baselineInpCpy: Array<CompressedAirReductionData>, modificationInpCpy: Array<CompressedAirReductionData>, results: CompressedAirReductionResults, settings: Settings) {
    baselineInpCpy.forEach((input, index) => {
      let baselineResult: CompressedAirReductionResult = this.calculateIndividualEquipment(input, settings);
      let modResult: CompressedAirReductionResult;
      if (modificationInpCpy && modificationInpCpy[index]) {
        modResult = this.calculateIndividualEquipment(modificationInpCpy[index], settings);
      } else {
        modResult = baselineResult;
      }
      if (input.utilityType == 0) {
        baselineResult.energyUse = baselineResult.consumption;
        modResult.energyUse = modResult.consumption;
      }

      let controlAdjustedSavings: number = (baselineResult.energyUse - modResult.energyUse) * (input.compressorElectricityData.compressorControlAdjustment / 100);
      modResult.energyUse = baselineResult.energyUse - controlAdjustedSavings;
      results.baselineResults.push(baselineResult);
      results.modificationResults.push(modResult);
      results.annualEnergySavings += controlAdjustedSavings;
    });

    return results;
  }

  calculate(input: Array<CompressedAirReductionData>, settings: Settings): CompressedAirReductionResult {
    let inputCopy: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify(input));
    let inputArray: Array<CompressedAirReductionData> = this.convertCompressedAirReductionService.convertInputs(inputCopy, settings);
    let inputObj: CompressedAirReductionInput = {
      compressedAirReductionInputVec: inputArray
    };
    let results: CompressedAirReductionResult = this.standaloneService.compressedAirReduction(inputObj);
    results = this.convertCompressedAirReductionService.convertResults(results, settings);
    return results;
  }

  calculateIndividualEquipment(input: CompressedAirReductionData, settings: Settings) {
    let inputArray: Array<CompressedAirReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertCompressedAirReductionService.convertInputs(inputArray, settings);
    let inputObj: CompressedAirReductionInput = {
      compressedAirReductionInputVec: inputArray
    };
    let results: CompressedAirReductionResult = this.standaloneService.compressedAirReduction(inputObj);
    results = this.convertCompressedAirReductionService.convertResults(results, settings);
    return results;
  }
}
