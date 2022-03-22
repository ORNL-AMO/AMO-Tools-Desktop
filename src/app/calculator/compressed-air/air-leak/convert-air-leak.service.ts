import { Injectable } from '@angular/core';
import { AirLeakSurveyData, AirLeakSurveyResult, FacilityCompressorData, CompressorElectricityData, AirLeakSurveyInput } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class ConvertAirLeakService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  //input metric => imperial
  convertInputs(inputArray: Array<AirLeakSurveyData>, settings: Settings): Array<AirLeakSurveyData> {
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].bagMethodData.height = this.convertUnitsService.value(inputArray[i].bagMethodData.height).from('cm').to('in');
        inputArray[i].bagMethodData.diameter = this.convertUnitsService.value(inputArray[i].bagMethodData.diameter).from('cm').to('in');

        inputArray[i].estimateMethodData.leakRateEstimate = this.convertUnitsService.value(inputArray[i].estimateMethodData.leakRateEstimate).from('m3').to('ft3');

        inputArray[i].decibelsMethodData.linePressure = this.convertUnitsService.value(inputArray[i].decibelsMethodData.linePressure).from('kPag').to('psig');
        inputArray[i].decibelsMethodData.pressureA = this.convertUnitsService.value(inputArray[i].decibelsMethodData.pressureA).from('kPag').to('psig');
        inputArray[i].decibelsMethodData.pressureB = this.convertUnitsService.value(inputArray[i].decibelsMethodData.pressureB).from('kPag').to('psig');
        inputArray[i].decibelsMethodData.firstFlowA = this.convertUnitsService.value(inputArray[i].decibelsMethodData.firstFlowA).from('m3').to('ft3');
        inputArray[i].decibelsMethodData.secondFlowA = this.convertUnitsService.value(inputArray[i].decibelsMethodData.secondFlowA).from('m3').to('ft3');
        inputArray[i].decibelsMethodData.firstFlowB = this.convertUnitsService.value(inputArray[i].decibelsMethodData.firstFlowB).from('m3').to('ft3');
        inputArray[i].decibelsMethodData.secondFlowB = this.convertUnitsService.value(inputArray[i].decibelsMethodData.secondFlowB).from('m3').to('ft3');

        inputArray[i].orificeMethodData.compressorAirTemp = this.convertUnitsService.value(inputArray[i].orificeMethodData.compressorAirTemp).from('C').to('F');
        inputArray[i].orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputArray[i].orificeMethodData.atmosphericPressure).from('kPaa').to('psia');
        inputArray[i].orificeMethodData.orificeDiameter = this.convertUnitsService.value(inputArray[i].orificeMethodData.orificeDiameter).from('cm').to('in');
        inputArray[i].orificeMethodData.supplyPressure = this.convertUnitsService.value(inputArray[i].orificeMethodData.supplyPressure).from('kPaa').to('psig');
        let conversionHelper = this.convertUnitsService.value(1).from('m3').to('ft3');
        inputArray[i].compressorElectricityData.compressorSpecificPower = inputArray[i].compressorElectricityData.compressorSpecificPower / conversionHelper;
      }
    } else {
      for (let i = 0; i < inputArray.length; i++) {
        //per issue-4091
        inputArray[i].compressorElectricityData.compressorSpecificPower = inputArray[i].compressorElectricityData.compressorSpecificPower / 100;
      }
    }
    return inputArray;
  }

  convertSpecificPower(specificPower: number): number {
    let conversionHelper = this.convertUnitsService.value(1).from('ft3').to('m3');
    specificPower = specificPower / conversionHelper;
    return specificPower;
  }

  convertResult(result: AirLeakSurveyResult, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      result.totalFlowRate = this.convertUnitsService.value(result.totalFlowRate).from('ft3').to('m3');
      result.annualTotalFlowRate = this.convertUnitsService.value(result.annualTotalFlowRate).from('ft3').to('m3');
    } else {
      result.annualTotalFlowRate = result.annualTotalFlowRate / 1000;
    }
    return result;
  }


  convertInputDataImperialToMetric(inputData: AirLeakSurveyData): AirLeakSurveyData {
    inputData.bagMethodData.height = this.convertUnitsService.value(inputData.bagMethodData.height).from('in').to('cm');
    inputData.bagMethodData.diameter = this.convertUnitsService.value(inputData.bagMethodData.diameter).from('in').to('cm');
    inputData.bagMethodData.height = this.roundVal(inputData.bagMethodData.height);
    inputData.bagMethodData.diameter = this.roundVal(inputData.bagMethodData.diameter);

    inputData.estimateMethodData.leakRateEstimate = this.convertUnitsService.value(inputData.estimateMethodData.leakRateEstimate).from('ft3').to('m3');
    inputData.estimateMethodData.leakRateEstimate = this.roundVal(inputData.estimateMethodData.leakRateEstimate);

    inputData.decibelsMethodData.linePressure = this.convertUnitsService.value(inputData.decibelsMethodData.linePressure).from('psig').to('kPag');
    inputData.decibelsMethodData.pressureA = this.convertUnitsService.value(inputData.decibelsMethodData.pressureA).from('psig').to('kPag');
    inputData.decibelsMethodData.pressureB = this.convertUnitsService.value(inputData.decibelsMethodData.pressureB).from('psig').to('kPag');

    inputData.decibelsMethodData.firstFlowA = this.convertUnitsService.value(inputData.decibelsMethodData.firstFlowA).from('ft3').to('m3');
    inputData.decibelsMethodData.secondFlowA = this.convertUnitsService.value(inputData.decibelsMethodData.secondFlowA).from('ft3').to('m3');
    inputData.decibelsMethodData.firstFlowB = this.convertUnitsService.value(inputData.decibelsMethodData.firstFlowB).from('ft3').to('m3');
    inputData.decibelsMethodData.secondFlowB = this.convertUnitsService.value(inputData.decibelsMethodData.secondFlowB).from('ft3').to('m3');


    inputData.decibelsMethodData.linePressure = this.roundVal(inputData.decibelsMethodData.linePressure);
    inputData.decibelsMethodData.pressureA = this.roundVal(inputData.decibelsMethodData.pressureA);
    inputData.decibelsMethodData.pressureB = this.roundVal(inputData.decibelsMethodData.pressureB);
    inputData.decibelsMethodData.firstFlowA = this.roundVal(inputData.decibelsMethodData.firstFlowA);
    inputData.decibelsMethodData.secondFlowA = this.roundVal(inputData.decibelsMethodData.secondFlowA);
    inputData.decibelsMethodData.firstFlowB = this.roundVal(inputData.decibelsMethodData.firstFlowB);
    inputData.decibelsMethodData.secondFlowB = this.roundVal(inputData.decibelsMethodData.secondFlowB);

    inputData.orificeMethodData.compressorAirTemp = this.convertUnitsService.value(inputData.orificeMethodData.compressorAirTemp).from('F').to('C');
    inputData.orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputData.orificeMethodData.atmosphericPressure).from('psia').to('kPaa');
    inputData.orificeMethodData.orificeDiameter = this.convertUnitsService.value(inputData.orificeMethodData.orificeDiameter).from('in').to('cm');
    inputData.orificeMethodData.supplyPressure = this.convertUnitsService.value(inputData.orificeMethodData.supplyPressure).from('psig').to('kPaa');
    inputData.orificeMethodData.compressorAirTemp = this.roundVal(inputData.orificeMethodData.compressorAirTemp);
    inputData.orificeMethodData.atmosphericPressure = this.roundVal(inputData.orificeMethodData.atmosphericPressure);
    inputData.orificeMethodData.orificeDiameter = this.roundVal(inputData.orificeMethodData.orificeDiameter);
    inputData.orificeMethodData.supplyPressure = this.roundVal(inputData.orificeMethodData.supplyPressure);
    return inputData;
  }

  convertExample(airLeakInputExample: AirLeakSurveyInput): AirLeakSurveyInput {
    airLeakInputExample.compressedAirLeakSurveyInputVec.forEach(inputData => {
      inputData = this.convertInputDataImperialToMetric(inputData)
    });
    airLeakInputExample.facilityCompressorData = this.convertDefaultFacilityCompressorData(airLeakInputExample.facilityCompressorData);
    return airLeakInputExample;
  }

  convertDefaultFacilityCompressorData(inputData: FacilityCompressorData): FacilityCompressorData {

    let conversionHelper = this.convertUnitsService.value(1).from('ft3').to('m3');
    // /100 per issue-4091
    inputData.compressorElectricityData.compressorSpecificPower = this.convertSpecificPower((inputData.compressorElectricityData.compressorSpecificPower / 100));
    inputData.compressorElectricityData.compressorSpecificPower = this.roundVal(inputData.compressorElectricityData.compressorSpecificPower);
    if (inputData.utilityType == 0) {
      inputData.utilityCost = inputData.utilityCost / conversionHelper;
      inputData.utilityCost = this.roundVal(inputData.utilityCost);
    }
    return inputData;
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }

}
