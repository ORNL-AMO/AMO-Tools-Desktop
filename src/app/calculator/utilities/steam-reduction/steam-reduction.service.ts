import { Injectable } from '@angular/core';
import { SteamReductionData, FlowMeterMethodData, SteamFlowMeterMethodData, SteamMassFlowNameplateData, SteamMassFlowMeasuredData, SteamMassFlowMethodData, SteamOtherMethodData, SteamReductionResults, SteamReductionResult, SteamReductionInput } from '../../../shared/models/standalone';
import { OperatingHours } from '../../../shared/models/operations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private convertUnitsService: ConvertUnitsService, private standaloneService: StandaloneService) { }

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
      flowMeterMethodData: {
        flowRate: 50000
      },
      airMassFlowMethodData: {
        isNameplate: false,
        massFlowMeasuredData: {
          areaOfDuct: 100,
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

  getFormFromObj(obj: SteamReductionData, index: number, isBaseline: boolean): FormGroup {
    //if utilityType 0 = steam, utilityType 1 = naturalGas, utilityType 2 = other
    let utilityCost: number = obj.steamUtilityCost;
    if (obj.utilityType == 1) {
      utilityCost = obj.naturalGasUtilityCost
    } else if (obj.utilityType == 2) {
      utilityCost = obj.otherUtilityCost;
    }

    let form: FormGroup = this.fb.group({
      name: [obj.name, Validators.required],
      operatingHours: [obj.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]],
      utilityType: [{ value: obj.utilityType, disabled: (index != 0 || !isBaseline) }],
      utilityCost: [{ value: utilityCost, disabled: (index != 0 || !isBaseline) }, [Validators.required, Validators.min(0)]],
      measurementMethod: [obj.measurementMethod],
      systemEfficiency: [obj.systemEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]],
      pressure: [obj.pressure, [Validators.required, Validators.min(0)]],

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

  setValidators(form: FormGroup): FormGroup {
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

  getObjFromForm(form: FormGroup, obj: SteamReductionData): SteamReductionData {

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
    let modificationResults: SteamReductionResult;
    let annualEnergySavings: number = 0;
    let annualCostSavings: number = 0;
    let annualSteamSavings: number = 0;
    if (modification) {
      let modificationInpCpy: Array<SteamReductionData> = JSON.parse(JSON.stringify(modification));
      modificationResults = this.calculate(modificationInpCpy, settings);
    }
    let steamReductionResults: SteamReductionResults = {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualCostSavings: annualCostSavings,
      annualEnergySavings: annualEnergySavings,
      annualSteamSavings: annualSteamSavings
    };
    steamReductionResults = this.convertResults(steamReductionResults, settings);
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
    if (settings.unitsOfMeasure == 'Imperial') {
      results.steamUse = results.steamUse / 1000;
    }
    return results;
  }

  convertInput(inputArray: Array<SteamReductionData>, settings: Settings): Array<SteamReductionData> {
    for (let i = 0; i < inputArray.length; i++) {
      let tmp: SteamReductionData;
      if (settings.unitsOfMeasure == 'Imperial') {
        tmp = this.convertImperialInput(inputArray[i]);
      } else if (settings.unitsOfMeasure == 'Metric') {
        tmp = this.convertMetricInput(inputArray[i], settings);
      }
      inputArray[i] = tmp;
    }
    return inputArray;
  }

  convertMetricInput(input: SteamReductionData, settings: Settings): SteamReductionData {
    let utilityCostConversionHelper: number = this.convertUnitsService.value(1).from('GJ').to('MMBtu');
    let convertedInput: SteamReductionData = input;
    convertedInput.utilityCost = input.utilityCost / utilityCostConversionHelper;
    convertedInput.flowMeterMethodData.flowRate = this.convertUnitsService.value(input.flowMeterMethodData.flowRate).from('kg').to('lb');
    convertedInput.airMassFlowMethodData.massFlowNameplateData.flowRate = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowNameplateData.flowRate).from('L/s').to('ft3/min');
    convertedInput.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowMeasuredData.areaOfDuct).from('cm2').to('ft2');
    convertedInput.airMassFlowMethodData.massFlowMeasuredData.airVelocity = this.convertUnitsService.value(input.airMassFlowMethodData.massFlowMeasuredData.airVelocity).from('m').to('ft');
    convertedInput.airMassFlowMethodData.inletTemperature = this.convertUnitsService.value(input.airMassFlowMethodData.inletTemperature).from('C').to('F');
    convertedInput.airMassFlowMethodData.outletTemperature = this.convertUnitsService.value(input.airMassFlowMethodData.outletTemperature).from('C').to('F');
    convertedInput.waterMassFlowMethodData.inletTemperature = this.convertUnitsService.value(input.waterMassFlowMethodData.inletTemperature).from('C').to('F');
    convertedInput.waterMassFlowMethodData.outletTemperature = this.convertUnitsService.value(input.waterMassFlowMethodData.outletTemperature).from('C').to('F');
    convertedInput.otherMethodData.consumption = this.convertUnitsService.value(input.otherMethodData.consumption).from(settings.energyResultUnit).to('MMBtu');
    return convertedInput;
  }

  convertImperialInput(input: SteamReductionData): SteamReductionData {
    let convertedInput: SteamReductionData = input;
    convertedInput.pressure = this.convertUnitsService.value(input.pressure).from('psig').to('MPaa');
    return convertedInput;
  }

  convertResults(results: SteamReductionResults, settings: Settings): SteamReductionResults {
    // results.baselineResults = this.convertSteamReductionResult(results.baselineResults, settings);
    console.log('pre-conversion results = ');
    console.log(results);
    console.log('lb to kb / 1000 = ' + (this.convertUnitsService.value(1000).from('lb').to('kg') / 1000));
    if (settings.unitsOfMeasure == 'Imperial') {
      results.baselineResults.steamUse = results.baselineResults.steamUse / 1000;
    }
    else if (settings.unitsOfMeasure == 'Metric') {
      results.baselineResults.energyUse = this.convertUnitsService.value(results.baselineResults.energyUse).from('MMBtu').to('GJ');
      let energyCostConversionHelper = this.convertUnitsService.value(1).from('MMBtu').to('GJ');
      results.baselineResults.energyCost = results.baselineResults.energyCost / energyCostConversionHelper;
      results.baselineResults.steamUse = this.convertUnitsService.value(results.baselineResults.steamUse).from('lb').to('kg') / 1000;
    }

    if (results.modificationResults) {
      // results.modificationResults = this.convertSteamReductionResult(results.modificationResults, settings);
      if (settings.unitsOfMeasure == 'Imperial') {
        results.modificationResults.steamUse = results.modificationResults.steamUse / 1000;
      }
      else if (settings.unitsOfMeasure == 'Metric') {
        results.modificationResults.energyUse = this.convertUnitsService.value(results.modificationResults.energyUse).from('MMBtu').to('GJ');
        let energyCostConversionHelper = this.convertUnitsService.value(1).from('MMBtu').to('GJ');
        results.modificationResults.energyCost = results.modificationResults.energyCost / energyCostConversionHelper;
        results.modificationResults.steamUse = this.convertUnitsService.value(results.modificationResults.steamUse).from('lb').to('kg') / 1000;
      }
    }
    return results;
  }

  convertSteamReductionResult(results: SteamReductionResult, settings: Settings): SteamReductionResult {
    let tmpEnergyUse = results.energyUse;
    let tmpSteamUse = results.steamUse;
    let tmpEnergyCost = results.energyCost;
    if (settings.unitsOfMeasure == 'Metric') {
      tmpEnergyUse = this.convertUnitsService.value(tmpEnergyUse).from('MMBtu').to('GJ');
      tmpSteamUse = this.convertUnitsService.value(tmpSteamUse).from('lb').to('tonne');
      let energyCostConversionHelper = this.convertUnitsService.value(1).from('MMBtu').to('GJ');
      tmpEnergyCost = tmpEnergyCost / energyCostConversionHelper;
    }
    let tmpSteamReductionResult: SteamReductionResult = {
      energyCost: tmpEnergyCost,
      energyUse: tmpEnergyUse,
      steamUse: tmpSteamUse
    };
    return tmpSteamReductionResult;
  }
}
