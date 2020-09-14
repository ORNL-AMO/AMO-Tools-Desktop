import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirReductionData, CompressedAirFlowMeterMethodData, BagMethodData, PressureMethodData, CompressedAirOtherMethodData, CompressorElectricityData, CompressedAirReductionResults, CompressedAirReductionInput, CompressedAirReductionResult } from '../../../shared/models/standalone';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';
import { OperatingHours } from '../../../shared/models/operations';
import { ConvertCompressedAirReductionService } from './convert-compressed-air-reduction.service';

@Injectable()
export class CompressedAirReductionService {

  baselineData: Array<CompressedAirReductionData>;
  modificationData: Array<CompressedAirReductionData>;
  operatingHours: OperatingHours;
  constructor(private formBuilder: FormBuilder, private convertCompressedAirReductionService: ConvertCompressedAirReductionService, private standaloneService: StandaloneService) { }


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
      compressorControl: 0,
      compressorControlAdjustment: 25,
      compressorSpecificPowerControl: 0,
      compressorSpecificPower: 0.16
    };
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let utilityCost: number = settings && settings.electricityCost ? settings.electricityCost : 0.066;
    if(utilityType == 0){
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
      utilityType: 0,
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
        compressorControl: 0,
        compressorControlAdjustment: 0,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 0
      },
      units: 1
    };
    if (settings.unitsOfMeasure != 'Imperial') {
      defaultData = this.convertCompressedAirReductionService.convertDefaultData(defaultData);
    }
    return defaultData;
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
    let inputArray: Array<CompressedAirReductionData> = this.convertCompressedAirReductionService.convertInputs(input, settings);
    console.log(settings.unitsOfMeasure);
    console.log(inputArray);
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
