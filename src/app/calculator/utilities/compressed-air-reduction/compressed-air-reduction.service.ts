import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirReductionData, CompressedAirFlowMeterMethodData, BagMethodData, PressureMethodData, CompressedAirOtherMethodData, CompressorElectricityData, CompressedAirReductionResults, CompressedAirReductionInput, CompressedAirReductionResult } from '../../../shared/models/standalone';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class CompressedAirReductionService {

  baselineData: Array<CompressedAirReductionData>;
  modificationData: Array<CompressedAirReductionData>;

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  resetData(settings: Settings) {
    this.baselineData = new Array<CompressedAirReductionData>();
    this.modificationData = new Array<CompressedAirReductionData>();

    this.baselineData.push(this.initObject(0, settings));
  }

  getEquipmentName(index: number, isBaseline: boolean) {
    try {
      return isBaseline ? this.baselineData[index].name !== null ? this.baselineData[index].name : 'Equipment #' + (index + 1) : this.modificationData[index].name !== null ? this.modificationData[index].name : 'Equipment #' + (index + 1);
    }
    catch {
      return 'Equipment #' + (index + 1);
    }
  }

  saveEquipmentName(name: string, index: number, isBaseline: boolean) {
    isBaseline ? this.baselineData[index] = this.baselineData[index]
      : this.modificationData[index] = this.modificationData[index];
  }

  initObject(index: number, settings?: Settings): CompressedAirReductionData {
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
      compressorControlAdjustment: 0.25,
      compressorSpecificPowerControl: 0,
      compressorSpecificPower: 0.21
    };
    let obj: CompressedAirReductionData = {
      name: 'Equipment #' + (index + 1),
      hoursPerYear: 8640,
      utilityType: 0,
      utilityCost: settings && settings.electricityCost ? settings.electricityCost : 0.12,
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

  getFormFromObj(inputObj: CompressedAirReductionData): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      name: [inputObj.name, [Validators.required]],
      hoursPerYear: [inputObj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [inputObj.utilityType],
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
      utilityCost: [inputObj.utilityCost],
      compressorControl: [inputObj.compressorElectricityData.compressorControl],
      compressorControlAdjustment: [inputObj.compressorElectricityData.compressorControlAdjustment],
      compressorSpecificPowerControl: [inputObj.compressorElectricityData.compressorSpecificPowerControl],
      compressorSpecificPower: [inputObj.compressorElectricityData.compressorSpecificPower],

      units: [inputObj.units, [Validators.required, Validators.min(1)]]
    });
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

    if (inputObj.utilityType == 1) {
      form.controls.utilityCost.setValidators([Validators.required, Validators.min(0)]);
      form.controls.compressorControl.setValidators([Validators.required]);
      if (inputObj.compressorElectricityData.compressorControl == 8) {
        form.controls.compressorControlAdjustment.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      }
      if (inputObj.compressorElectricityData.compressorSpecificPowerControl == 4) {
        form.controls.compressorSpecificPower.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
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
      utilityCost: form.controls.utilityCost.value,
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

  addBaselineEquipment(index: number, settings?: Settings) {
    if (this.baselineData === null || this.baselineData === undefined) {
      this.baselineData = new Array<CompressedAirReductionData>();
    }
    this.baselineData.push(this.initObject(index, settings ? settings : null));
  }

  removeBaselineEquipment(index: number) {
    this.baselineData.splice(index, 1);
  }

  createModification() {
    this.modificationData = new Array<CompressedAirReductionData>();
    for (let i = 0; i < this.baselineData.length; i++) {
      this.modificationData.push(this.baselineData[i]);
    }
  }

  addModificationEquipment(index: number, settings?: Settings) {
    if (this.modificationData === null || this.modificationData === undefined) {
      this.modificationData = new Array<CompressedAirReductionData>();
    }
    this.modificationData.push(this.initObject(index, settings ? settings : null));
  }

  removeModificationEquipment(index: number) {
    this.modificationData.splice(index, 1);
  }

  initModificationData() {
    if (this.modificationData === undefined || this.modificationData === null) {
      this.modificationData = new Array<CompressedAirReductionData>();
    }
  }

  updateBaselineDataArray(baselineForms: Array<FormGroup>): void {
    for (let i = 0; i < this.baselineData.length; i++) {
      this.baselineData[i] = this.getObjFromForm(baselineForms[i]);
    }
  }

  updateModificationDataArray(modificationForms: Array<FormGroup>): void {
    for (let i = 0; i < this.modificationData.length; i++) {
      this.modificationData[i] = this.getObjFromForm(modificationForms[i]);
    }
  }

  getResults(settings: Settings, baseline: Array<CompressedAirReductionData>, modification?: Array<CompressedAirReductionData>): CompressedAirReductionResults {
    let baselineResults: CompressedAirReductionResult = this.calculate(baseline, settings);
    let modificationResults: CompressedAirReductionResult;
    let annualEnergySavings: number = 0;
    let annualCostSavings: number = 0;
    let flowRateReduction: number = 0;
    let annualConsumptionReduction: number = 0;
    if (modification) {
      modificationResults = this.calculate(modification, settings);
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
    return results;
  }

  calculateIndividualEquipment(input: CompressedAirReductionData, settings: Settings) {
    let inputArray: Array<CompressedAirReductionData> = [input];
    inputArray = this.convertInputs(inputArray, settings);
    let inputObj: CompressedAirReductionInput = {
      compressedAirReductionInputVec: inputArray
    };
    let results: CompressedAirReductionResult = this.standaloneService.compressedAirReduction(inputObj);
    return results;
  }

  convertInputs(inputArray: Array<CompressedAirReductionData>, settings: Settings): Array<CompressedAirReductionData> {
    // need to loop through for conversions prior to calculation
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].flowMeterMethodData.meterReading = this.convertUnitsService.value(inputArray[i].flowMeterMethodData.meterReading).from('m3').to('f3');
        inputArray[i].bagMethodData.height = this.convertUnitsService.value(inputArray[i].bagMethodData.height).from('cm').to('in');
        inputArray[i].bagMethodData.diameter = this.convertUnitsService.value(inputArray[i].bagMethodData.diameter).from('cm').to('in');
        inputArray[i].pressureMethodData.supplyPressure = this.convertUnitsService.value(inputArray[i].pressureMethodData.supplyPressure).from('barg').to('psig');
        inputArray[i].otherMethodData.consumption = this.convertUnitsService.value(inputArray[i].otherMethodData.consumption).from('m3').to('ft3');
        let conversionHelper = this.convertUnitsService.value(1).from('m3').to('f3');
        inputArray[i].compressorElectricityData.compressorSpecificPower = inputArray[i].compressorElectricityData.compressorSpecificPower / conversionHelper;
      }
    }
    return inputArray;
  }
}
