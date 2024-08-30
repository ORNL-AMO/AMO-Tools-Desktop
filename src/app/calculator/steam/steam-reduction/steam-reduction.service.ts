import { Injectable } from '@angular/core';
import { SteamReductionData, FlowMeterMethodData, SteamFlowMeterMethodData, SteamMassFlowNameplateData, SteamMassFlowMeasuredData, SteamMassFlowMethodData, SteamOtherMethodData, SteamReductionResults, SteamReductionResult, SteamReductionInput } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class SteamReductionService {

  baselineData: Array<SteamReductionData>;
  modificationData: Array<SteamReductionData>;
  operatingHours: OperatingHours;

  constructor(private fb: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

  initObject(index: number, settings: Settings, operatingHours: OperatingHours, utilityType: number, steamCost: number, naturalGasCost: number, otherCost: number): SteamReductionData {
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let utilityCost: number;
    if (utilityType == 0) {
      utilityCost = steamCost;
    } else if (utilityType == 1) {
      utilityCost = naturalGasCost;
    } else {
      utilityCost = otherCost;
    }
    let pressure: number;
    if (settings.unitsOfMeasure == 'Imperial') {
      pressure = 100;
    } else if (settings.unitsOfMeasure == 'Metric') {
      pressure = 0.790801;
    } else {
      pressure = 0;
    }
    let defaultSteamReduction: SteamReductionData = {
      name: "Equipment #" + (index + 1),
      hoursPerYear: hoursPerYear,
      utilityType: utilityType,
      utilityCost: utilityCost,
      steamUtilityCost: steamCost,
      naturalGasUtilityCost: naturalGasCost,
      otherUtilityCost: otherCost,
      measurementMethod: 0,
      systemEfficiency: 100,
      pressure: pressure,
      boilerEfficiency: 75,
      steamVariableOption: 0,
      steamVariable: 548.33,
      feedWaterTemperature: 50,
      flowMeterMethodData: {
        flowRate: 50000
      },
      airMassFlowMethodData: {
        isNameplate: false,
        massFlowMeasuredData: {
          areaOfDuct: 2,
          airVelocity: 5
        },
        massFlowNameplateData: {
          flowRate: 400
        },
        inletTemperature: 75,
        outletTemperature: 500
      },
      waterMassFlowMethodData: {
        isNameplate: true,
        massFlowMeasuredData: {
          areaOfDuct: 50,
          airVelocity: 1000
        },
        massFlowNameplateData: {
          flowRate: 2.5
        },
        inletTemperature: 75,
        outletTemperature: 500
      },
      otherMethodData: {
        consumption: 400000
      },
      units: 1

    }
    return defaultSteamReduction;
  }

  emptyObject(index: number, settings: Settings, operatingHours: OperatingHours, utilityType: number, steamCost: number, naturalGasCost: number, otherCost: number): SteamReductionData {
    let hoursPerYear: number = 8760;
    if (operatingHours) {
      hoursPerYear = operatingHours.hoursPerYear;
    }
    let utilityCost: number;
    if (utilityType == 0) {
      utilityCost = steamCost;
    } 
    let pressure: number;
    if (settings.unitsOfMeasure == 'Imperial') {
      pressure = 100;
    } else if (settings.unitsOfMeasure == 'Metric') {
      pressure = 100;
    } else {
      pressure = 100;
    }
    let defaultSteamReduction: SteamReductionData = {
      name: "Equipment #" + (index + 1),
      hoursPerYear: hoursPerYear,
      utilityType: utilityType,
      utilityCost: utilityCost,
      steamUtilityCost: steamCost,
      naturalGasUtilityCost: naturalGasCost,
      otherUtilityCost: otherCost,
      measurementMethod: 0,
      systemEfficiency: 100,
      pressure: pressure,
      boilerEfficiency: 100,
      steamVariableOption: 0,
      steamVariable: 75,
      feedWaterTemperature: 75,
      flowMeterMethodData: {
        flowRate: 0
      },
      airMassFlowMethodData: {
        isNameplate: false,
        massFlowMeasuredData: {
          areaOfDuct: 2,
          airVelocity: 5
        },
        massFlowNameplateData: {
          flowRate: 400
        },
        inletTemperature: 75,
        outletTemperature: 500
      },
      waterMassFlowMethodData: {
        isNameplate: true,
        massFlowMeasuredData: {
          areaOfDuct: 50,
          airVelocity: 1000
        },
        massFlowNameplateData: {
          flowRate: 2.5
        },
        inletTemperature: 75,
        outletTemperature: 500
      },
      otherMethodData: {
        consumption: 400000
      },
      units: 1

    }
    return defaultSteamReduction;
  }

  getFormFromObj(obj: SteamReductionData, index: number, isBaseline: boolean, settings: Settings): UntypedFormGroup {
    //if utilityType 0 = steam, utilityType 1 = naturalGas, utilityType 2 = other
    let utilityCost: number = obj.steamUtilityCost;
    if (obj.utilityType == 1) {
      utilityCost = obj.naturalGasUtilityCost
    } else if (obj.utilityType == 2) {
      utilityCost = obj.otherUtilityCost;
    }
    let tempMin: number = 0;
    let steamVariableMin: number = 0;
    if (settings.unitsOfMeasure == 'Imperial') {
      tempMin = 32;
      steamVariableMin = 32;
    } else if (settings.unitsOfMeasure == 'Metric') {
      tempMin = 0;
      steamVariableMin = 0;
    }

    if (obj.steamVariableOption != 0){
      steamVariableMin = 0;
    }

    let form: UntypedFormGroup = this.fb.group({
      name: [obj.name, Validators.required],
      operatingHours: [obj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [{ value: obj.utilityType, disabled: (index != 0 || !isBaseline) }],
      utilityCost: [{ value: utilityCost, disabled: (index != 0 || !isBaseline) }, [Validators.required, Validators.min(0)]],
      measurementMethod: [obj.measurementMethod],
      systemEfficiency: [obj.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      pressure: [obj.pressure, [Validators.required, Validators.min(0)]],
      boilerEfficiency: [obj.boilerEfficiency, [Validators.required, Validators.min(0)]],
      steamVariableOption: [obj.steamVariableOption, [Validators.required, Validators.min(0)]],
      steamVariable: [obj.steamVariable, [Validators.required, Validators.min(steamVariableMin)]],
      feedWaterTemperature: [obj.feedWaterTemperature, [Validators.required, Validators.min(tempMin)]],

      //flow meter method
      flowMeterFlowRate: [obj.flowMeterMethodData.flowRate],

      //air mass flow method data
      airIsNameplate: [obj.airMassFlowMethodData.isNameplate],
      airNameplateFlowRate: [obj.airMassFlowMethodData.massFlowNameplateData.flowRate],
      airMeasuredAreaOfDuct: [obj.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct],
      airMeasuredAirVelocity: [obj.airMassFlowMethodData.massFlowMeasuredData.airVelocity],
      airInletTemperature: [obj.airMassFlowMethodData.inletTemperature],
      airOutletTemperature: [obj.airMassFlowMethodData.outletTemperature],

      //water mass flow method
      waterIsNameplate: [obj.waterMassFlowMethodData.isNameplate],
      waterNameplateFlowRate: [obj.waterMassFlowMethodData.massFlowNameplateData.flowRate],
      waterMeasuredAreaOfDuct: [obj.waterMassFlowMethodData.massFlowMeasuredData.areaOfDuct],
      waterMeasuredAirVelocity: [obj.waterMassFlowMethodData.massFlowMeasuredData.airVelocity],
      waterInletTemperature: [obj.waterMassFlowMethodData.inletTemperature],
      waterOutletTemperature: [obj.waterMassFlowMethodData.outletTemperature],

      //other method data
      consumption: [obj.otherMethodData.consumption],

      units: [obj.units]
    });
    form = this.setValidators(form);
    return form;
  }

  setValidators(form: UntypedFormGroup): UntypedFormGroup {
    switch (form.controls.measurementMethod.value) {
      case 0:
        form.controls.flowMeterFlowRate.setValidators([Validators.required, Validators.min(0)]);
        form.controls.units.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 1:
        form.controls.airIsNameplate.setValidators([Validators.required]);
        switch (form.controls.airIsNameplate.value) {
          case false:
            form.controls.airMeasuredAreaOfDuct.setValidators([Validators.required, Validators.min(0)]);
            form.controls.airMeasuredAirVelocity.setValidators([Validators.required, Validators.min(0)]);
            break;
          case true:
            form.controls.airNameplateFlowRate.setValidators([Validators.required, Validators.min(0)]);
            break;
        }
        form.controls.airInletTemperature.setValidators([Validators.required]);
        form.controls.airOutletTemperature.setValidators([Validators.required]);
        form.controls.units.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 2:
        form.controls.waterNameplateFlowRate.setValidators([Validators.required, Validators.min(0)]);
        form.controls.waterInletTemperature.setValidators([Validators.required]);
        form.controls.waterOutletTemperature.setValidators([Validators.required]);
        form.controls.units.setValidators([Validators.required, Validators.min(0)]);
        break;
      case 3:
        form.controls.consumption.setValidators([Validators.required, Validators.min(0)]);
        form.controls.units.clearValidators();
        break;
      default:
        break;
    }
    return form;
  }

  getObjFromForm(form: UntypedFormGroup, obj: SteamReductionData): SteamReductionData {

    let flowMeterData: SteamFlowMeterMethodData = {
      flowRate: form.controls.flowMeterFlowRate.value
    };
    let airMassFlowNameplateData: SteamMassFlowNameplateData = {
      flowRate: form.controls.airNameplateFlowRate.value
    };
    let massFlowMeasuredData: SteamMassFlowMeasuredData = {
      areaOfDuct: form.controls.airMeasuredAreaOfDuct.value,
      airVelocity: form.controls.airMeasuredAirVelocity.value
    };
    let airMassFlowMethodData: SteamMassFlowMethodData = {
      isNameplate: form.controls.airIsNameplate.value,
      massFlowMeasuredData: massFlowMeasuredData,
      massFlowNameplateData: airMassFlowNameplateData,
      inletTemperature: form.controls.airInletTemperature.value,
      outletTemperature: form.controls.airOutletTemperature.value
    };

    let waterMassFlowNameplateData: SteamMassFlowNameplateData = {
      flowRate: form.controls.waterNameplateFlowRate.value
    };
    let waterMassFlowMethodData: SteamMassFlowMethodData = {
      isNameplate: true,
      massFlowMeasuredData: massFlowMeasuredData,
      massFlowNameplateData: waterMassFlowNameplateData,
      inletTemperature: form.controls.waterInletTemperature.value,
      outletTemperature: form.controls.waterOutletTemperature.value
    };
    let otherMethodData: SteamOtherMethodData = {
      consumption: form.controls.consumption.value
    };

    //if utilityType 0 = steam, utilityType 1 = naturalGas, utilityType 2 = other
    let steamUtilityCost: number = obj.steamUtilityCost;
    let ngUtilityCost: number = obj.naturalGasUtilityCost;
    let otherUtilityCost: number = obj.otherUtilityCost;
    if (form.controls.utilityType.value == 0) {
      steamUtilityCost = form.controls.utilityCost.value;
    } else if (form.controls.utilityType.value == 1) {
      ngUtilityCost = form.controls.utilityCost.value;
    } else if (form.controls.utilityType.value == 2) {
      otherUtilityCost = form.controls.utilityCost.value;
    }

    let steamReduction: SteamReductionData = {
      name: form.controls.name.value,
      hoursPerYear: form.controls.operatingHours.value,
      utilityType: form.controls.utilityType.value,
      utilityCost: form.controls.utilityCost.value,
      steamUtilityCost: steamUtilityCost,
      naturalGasUtilityCost: ngUtilityCost,
      otherUtilityCost: otherUtilityCost,
      measurementMethod: form.controls.measurementMethod.value,
      systemEfficiency: form.controls.systemEfficiency.value,
      pressure: form.controls.pressure.value,
      boilerEfficiency: form.controls.boilerEfficiency.value,
      steamVariableOption: form.controls.steamVariableOption.value,
      steamVariable: form.controls.steamVariable.value,
      feedWaterTemperature: form.controls.feedWaterTemperature.value,
      flowMeterMethodData: flowMeterData,
      airMassFlowMethodData: airMassFlowMethodData,
      waterMassFlowMethodData: waterMassFlowMethodData,
      otherMethodData: otherMethodData,
      units: form.controls.units.value
    };
    return steamReduction;
  }

  getResults(settings: Settings, baseline: Array<SteamReductionData>, modification?: Array<SteamReductionData>): SteamReductionResults {
    let baselineInpCpy: Array<SteamReductionData> = JSON.parse(JSON.stringify(baseline));
    let baselineResults: SteamReductionResult = this.calculate(baselineInpCpy, settings);
    let modificationResults: SteamReductionResult = {
      energyCost: 0,
      energyUse: 0,
      steamUse: 0
    };
    if (modification) {
      let modificationInpCpy: Array<SteamReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }
    let steamReductionResults: SteamReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualCostSavings: 0,
      annualEnergySavings: 0,
      annualSteamSavings: 0
    };
    if (modificationResults) {
      steamReductionResults.annualEnergySavings = baselineResults.energyUse - modificationResults.energyUse;
      steamReductionResults.annualCostSavings = baselineResults.energyCost - modificationResults.energyCost;
      steamReductionResults.annualSteamSavings = baselineResults.steamUse - modificationResults.steamUse;
    }
    return steamReductionResults;
  }

  calculate(input: Array<SteamReductionData>, settings: Settings): SteamReductionResult {
    let inputArray: Array<SteamReductionData> = this.convertInput(input, settings);
    let inputObj: SteamReductionInput = {
      steamReductionInputVec: inputArray
    };
    let results: SteamReductionResult = this.standaloneService.steamReduction(inputObj);
    results = this.convertSteamReductionResult(results, settings);
    return results;
  }

  calculateIndividualEquipment(input: SteamReductionData, settings: Settings): SteamReductionResult {
    let inputArray: Array<SteamReductionData> = JSON.parse(JSON.stringify([input]));
    inputArray = this.convertInput(inputArray, settings);    
    let inputObj: SteamReductionInput = {
      steamReductionInputVec: inputArray
    };
    let results: SteamReductionResult = this.standaloneService.steamReduction(inputObj);
    results = this.convertSteamReductionResult(results, settings);
    
    return results;
  }

  convertInput(inputArray: Array<SteamReductionData>, settings: Settings): Array<SteamReductionData> {
    for (let i = 0; i < inputArray.length; i++) {
      let convertedReductionData: SteamReductionData;
      if (settings.unitsOfMeasure == 'Imperial') {
        convertedReductionData = this.convertImperialInput(inputArray[i]);
      } else if (settings.unitsOfMeasure == 'Metric') {
        convertedReductionData = this.convertMetricInput(inputArray[i], settings);
      }
      convertedReductionData.systemEfficiency = convertedReductionData.systemEfficiency / 100;
      convertedReductionData.boilerEfficiency = convertedReductionData.boilerEfficiency / 100;
      inputArray[i] = convertedReductionData;
    }
    return inputArray;
  }

  convertMetricInput(input: SteamReductionData, settings: Settings): SteamReductionData {
    let utilityCostConversionHelper: number = 0;
    if(input.utilityType == 0){
      utilityCostConversionHelper = this.convertUnitsService.value(1).from('tonne').to('kJ');
    } else if(input.utilityType == 1 || input.utilityType == 2 ){
      utilityCostConversionHelper = this.convertUnitsService.value(1).from('GJ').to('kJ');
    }
    let convertedInput: SteamReductionData = input;
    convertedInput.utilityCost = input.utilityCost / utilityCostConversionHelper;
    convertedInput.pressure = this.convertUnitsService.value(input.pressure).from('barg').to('MPaa');
    convertedInput.feedWaterTemperature = this.convertUnitsService.value(input.feedWaterTemperature).from('C').to('K');
    if(input.steamVariableOption === 0){      
      convertedInput.steamVariable = this.convertUnitsService.value(input.steamVariable).from('C').to('K');
    }
    convertedInput.airMassFlowMethodData.massFlowNameplateData.flowRate = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowNameplateData.flowRate).from('L/s').to('m3/min');
    convertedInput.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct).from('cm2').to('m2');
    convertedInput.waterMassFlowMethodData.massFlowNameplateData.flowRate = this.convertUnitsService.value(input.waterMassFlowMethodData.massFlowNameplateData.flowRate).from('L/s').to('m3/min');
    convertedInput.otherMethodData.consumption = this.convertUnitsService.value(input.otherMethodData.consumption).from('GJ').to('kJ');
    return convertedInput;
  }

  convertImperialInput(input: SteamReductionData): SteamReductionData {
    let utilityCostConversionHelper: number = 0;
    if(input.utilityType == 0){
      utilityCostConversionHelper = this.convertUnitsService.value(1).from('klb').to('kg');
    } else if(input.utilityType == 1 || input.utilityType == 2 ){
      utilityCostConversionHelper = this.convertUnitsService.value(1).from('MMBtu').to('kJ');
    }
    let convertedInput: SteamReductionData = input;
    convertedInput.utilityCost = input.utilityCost / utilityCostConversionHelper;
    convertedInput.feedWaterTemperature = this.convertUnitsService.value(input.feedWaterTemperature).from('F').to('K');
    if(input.steamVariableOption === 0){      
      convertedInput.steamVariable = this.convertUnitsService.value(input.steamVariable).from('F').to('K');
    }
    convertedInput.pressure = this.convertUnitsService.value(input.pressure).from('psig').to('MPaa');

    convertedInput.flowMeterMethodData.flowRate = this.convertUnitsService.value(input.flowMeterMethodData.flowRate).from('lb').to('kg');

    convertedInput.airMassFlowMethodData.massFlowNameplateData.flowRate = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowNameplateData.flowRate).from('ft3/min').to('m3/min');

    convertedInput.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct).from('ft2').to('m2');
    convertedInput.airMassFlowMethodData.massFlowMeasuredData.airVelocity = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowMeasuredData.airVelocity).from('ft').to('m');

    convertedInput.airMassFlowMethodData.inletTemperature = this.convertUnitsService.value(input.airMassFlowMethodData.inletTemperature).from('F').to('C');
    convertedInput.airMassFlowMethodData.outletTemperature = this.convertUnitsService.value(input.airMassFlowMethodData.outletTemperature).from('F').to('C');

    convertedInput.waterMassFlowMethodData.inletTemperature = this.convertUnitsService.value(input.waterMassFlowMethodData.inletTemperature).from('F').to('C');
    convertedInput.waterMassFlowMethodData.outletTemperature = this.convertUnitsService.value(input.waterMassFlowMethodData.outletTemperature).from('F').to('C');

    convertedInput.waterMassFlowMethodData.massFlowNameplateData.flowRate = this.convertUnitsService.value(input.waterMassFlowMethodData.massFlowNameplateData.flowRate).from('gpm').to('m3/min');

    convertedInput.otherMethodData.consumption = this.convertUnitsService.value(input.otherMethodData.consumption).from('MMBtu').to('kJ');

    return convertedInput;
  }

  convertSteamReductionResult(results: SteamReductionResult, settings: Settings): SteamReductionResult {
    if (settings.unitsOfMeasure == 'Metric') {
      results.energyUse = this.convertUnitsService.value(results.energyUse).from('kJ').to('GJ');
      results.energyCost = results.energyCost;
    }
    else if (settings.unitsOfMeasure == 'Imperial') {      
      results.energyUse = this.convertUnitsService.value(results.energyUse).from('kJ').to('MMBtu');
      results.steamUse = this.convertUnitsService.value(results.steamUse).from('kg').to('klb');    
      results.energyCost = results.energyCost;
    }
    return results;
  }
}
