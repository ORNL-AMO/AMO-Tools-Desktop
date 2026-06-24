import { Injectable } from '@angular/core';
import { FacilitySteamLeakData, SteamLeakSurveyData, SteamLeakSurveyInput, SteamLeakSurveyResult } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { roundVal } from '../../../shared/helperFunctions';

@Injectable()
export class ConvertSteamLeakService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  // Convert metric inputs to Imperial before passing to calculation suite
  convertInputs(inputArray: Array<SteamLeakSurveyData>, settings: Settings): void {
    if (settings.unitsOfMeasure === 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].estimateMethodData.leakRate = this.convertUnitsService.value(inputArray[i].estimateMethodData.leakRate).from('kg').to('lb');

        inputArray[i].estimateTurbineMethodData.leakRate = this.convertUnitsService.value(inputArray[i].estimateTurbineMethodData.leakRate).from('kg').to('lb');

        inputArray[i].orificeMethodData.holeSize = this.convertUnitsService.value(inputArray[i].orificeMethodData.holeSize).from('cm').to('in');
        inputArray[i].orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputArray[i].orificeMethodData.atmosphericPressure).from('kPaa').to('psia');

        inputArray[i].plumeMethodData.plumeLength = this.convertUnitsService.value(inputArray[i].plumeMethodData.plumeLength).from('cm').to('in');
        inputArray[i].plumeMethodData.ambientTemperature = this.convertUnitsService.value(inputArray[i].plumeMethodData.ambientTemperature).from('C').to('F');
      }
    }
  }

  // Convert FacilitySteamLeakData metric inputs to Imperial before passing to suite
  convertFacilityInputs(facilityData: FacilitySteamLeakData, settings: Settings): FacilitySteamLeakData {
    if (settings.unitsOfMeasure === 'Metric') {
      facilityData.steamTemperature = this.convertUnitsService.value(facilityData.steamTemperature).from('C').to('F');
      facilityData.steamPressure = this.convertUnitsService.value(facilityData.steamPressure).from('kPaa').to('psia');
      facilityData.feedwaterTemperature = this.convertUnitsService.value(facilityData.feedwaterTemperature).from('C').to('F');
      // Suite expects $/lb; UI input is $/tonne (1 tonne = 2204.62 lb)
      facilityData.steamCost = facilityData.steamCost / 2204.62;
      // Suite expects $/MMBtu; UI input is $/GJ (1 MMBtu = 1.05506 GJ)
      facilityData.fuelCost = facilityData.fuelCost * 1.05506;
    } else {
      // Suite expects $/lb; UI input is $/klb
      facilityData.steamCost = facilityData.steamCost / 1000;
      // Suite expects $/MMBtu; Imperial UI input is already $/MMBtu — no conversion needed
    }
    return facilityData;
  }

  // Convert suite result (always Imperial) to display units
  convertResult(result: SteamLeakSurveyResult, settings: Settings): SteamLeakSurveyResult {
    if (settings.unitsOfMeasure === 'Metric') {
      result.leakRate = this.convertUnitsService.value(result.leakRate).from('lb').to('kg');
      result.steamLoss = this.convertUnitsService.value(result.steamLoss).from('lb').to('kg');
      result.energyLoss = this.convertUnitsService.value(result.energyLoss).from('MMBtu').to('GJ');
    }
    return result;
  }

  convertInputDataImperialToMetric(inputData: SteamLeakSurveyData): SteamLeakSurveyData {
    inputData.estimateMethodData.leakRate = this.convertUnitsService.value(inputData.estimateMethodData.leakRate).from('lb').to('kg');
    inputData.estimateMethodData.leakRate = roundVal(inputData.estimateMethodData.leakRate);

    inputData.estimateTurbineMethodData.leakRate = this.convertUnitsService.value(inputData.estimateTurbineMethodData.leakRate).from('lb').to('kg');
    inputData.estimateTurbineMethodData.leakRate = roundVal(inputData.estimateTurbineMethodData.leakRate);

    inputData.orificeMethodData.holeSize = this.convertUnitsService.value(inputData.orificeMethodData.holeSize).from('in').to('cm');
    inputData.orificeMethodData.holeSize = roundVal(inputData.orificeMethodData.holeSize);
    inputData.orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputData.orificeMethodData.atmosphericPressure).from('psia').to('kPaa');
    inputData.orificeMethodData.atmosphericPressure = roundVal(inputData.orificeMethodData.atmosphericPressure);

    inputData.plumeMethodData.plumeLength = this.convertUnitsService.value(inputData.plumeMethodData.plumeLength).from('in').to('cm');
    inputData.plumeMethodData.plumeLength = roundVal(inputData.plumeMethodData.plumeLength);
    inputData.plumeMethodData.ambientTemperature = this.convertUnitsService.value(inputData.plumeMethodData.ambientTemperature).from('F').to('C');
    inputData.plumeMethodData.ambientTemperature = roundVal(inputData.plumeMethodData.ambientTemperature);

    return inputData;
  }

  convertInputDataMetricToImperial(inputData: SteamLeakSurveyData): SteamLeakSurveyData {
    inputData.estimateMethodData.leakRate = this.convertUnitsService.value(inputData.estimateMethodData.leakRate).from('kg').to('lb');
    inputData.estimateMethodData.leakRate = roundVal(inputData.estimateMethodData.leakRate);

    inputData.estimateTurbineMethodData.leakRate = this.convertUnitsService.value(inputData.estimateTurbineMethodData.leakRate).from('kg').to('lb');
    inputData.estimateTurbineMethodData.leakRate = roundVal(inputData.estimateTurbineMethodData.leakRate);

    inputData.orificeMethodData.holeSize = this.convertUnitsService.value(inputData.orificeMethodData.holeSize).from('cm').to('in');
    inputData.orificeMethodData.holeSize = roundVal(inputData.orificeMethodData.holeSize);
    inputData.orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputData.orificeMethodData.atmosphericPressure).from('kPaa').to('psia');
    inputData.orificeMethodData.atmosphericPressure = roundVal(inputData.orificeMethodData.atmosphericPressure);

    inputData.plumeMethodData.plumeLength = this.convertUnitsService.value(inputData.plumeMethodData.plumeLength).from('cm').to('in');
    inputData.plumeMethodData.plumeLength = roundVal(inputData.plumeMethodData.plumeLength);
    inputData.plumeMethodData.ambientTemperature = this.convertUnitsService.value(inputData.plumeMethodData.ambientTemperature).from('C').to('F');
    inputData.plumeMethodData.ambientTemperature = roundVal(inputData.plumeMethodData.ambientTemperature);

    return inputData;
  }

  convertFacilitySteamLeakData(
    inputData: FacilitySteamLeakData,
    oldSettings: Settings,
    newSettings?: Settings
  ): FacilitySteamLeakData {
    if (oldSettings.unitsOfMeasure === 'Imperial' && (!newSettings || newSettings.unitsOfMeasure === 'Metric')) {
      inputData = this.convertImperialFacilitySteamLeakData(inputData);
    } else if (oldSettings.unitsOfMeasure === 'Metric' && (!newSettings || newSettings.unitsOfMeasure === 'Imperial')) {
      inputData = this.convertMetricFacilitySteamLeakData(inputData);
    }
    return inputData;
  }

  convertImperialFacilitySteamLeakData(inputData: FacilitySteamLeakData): FacilitySteamLeakData {
    inputData.steamTemperature = this.convertUnitsService.value(inputData.steamTemperature).from('F').to('C');
    inputData.steamTemperature = roundVal(inputData.steamTemperature);
    inputData.steamPressure = this.convertUnitsService.value(inputData.steamPressure).from('psia').to('kPaa');
    inputData.steamPressure = roundVal(inputData.steamPressure);
    inputData.feedwaterTemperature = this.convertUnitsService.value(inputData.feedwaterTemperature).from('F').to('C');
    inputData.feedwaterTemperature = roundVal(inputData.feedwaterTemperature);
    // steamCost: $/klb → $/tonne (1 tonne = 2.20462 klb)
    inputData.steamCost = inputData.steamCost * 2.20462;
    inputData.steamCost = roundVal(inputData.steamCost);
    // fuelCost: $/MMBtu → $/GJ (1 MMBtu = 1.05506 GJ)
    inputData.fuelCost = inputData.fuelCost / 1.05506;
    inputData.fuelCost = roundVal(inputData.fuelCost);
    return inputData;
  }

  convertMetricFacilitySteamLeakData(inputData: FacilitySteamLeakData): FacilitySteamLeakData {
    inputData.steamTemperature = this.convertUnitsService.value(inputData.steamTemperature).from('C').to('F');
    inputData.steamTemperature = roundVal(inputData.steamTemperature);
    inputData.steamPressure = this.convertUnitsService.value(inputData.steamPressure).from('kPaa').to('psia');
    inputData.steamPressure = roundVal(inputData.steamPressure);
    inputData.feedwaterTemperature = this.convertUnitsService.value(inputData.feedwaterTemperature).from('C').to('F');
    inputData.feedwaterTemperature = roundVal(inputData.feedwaterTemperature);
    // steamCost: $/tonne → $/klb (1 tonne = 2.20462 klb)
    inputData.steamCost = inputData.steamCost / 2.20462;
    inputData.steamCost = roundVal(inputData.steamCost);
    // fuelCost: $/GJ → $/MMBtu (1 MMBtu = 1.05506 GJ)
    inputData.fuelCost = inputData.fuelCost * 1.05506;
    inputData.fuelCost = roundVal(inputData.fuelCost);
    return inputData;
  }

  convertExample(steamLeakInputExample: SteamLeakSurveyInput): SteamLeakSurveyInput {
    steamLeakInputExample.steamLeakSurveyInputVec.forEach((inputData, index) => {
      steamLeakInputExample.steamLeakSurveyInputVec[index] = this.convertInputDataImperialToMetric(inputData);
    });
    steamLeakInputExample.facilitySteamLeakData = this.convertImperialFacilitySteamLeakData(steamLeakInputExample.facilitySteamLeakData);
    return steamLeakInputExample;
  }
}
