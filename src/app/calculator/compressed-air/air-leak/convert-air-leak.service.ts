import { Injectable } from '@angular/core';
import { AirLeakSurveyData, AirLeakSurveyResult, FacilityCompressorData, CompressorElectricityData } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class ConvertAirLeakService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertInputs(inputArray: Array<AirLeakSurveyData>, settings: Settings): Array<AirLeakSurveyData> {
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].bagMethodData.height = this.convertUnitsService.value(inputArray[i].bagMethodData.height).from('cm').to('in');
        inputArray[i].bagMethodData.diameter = this.convertUnitsService.value(inputArray[i].bagMethodData.diameter).from('cm').to('in');

        inputArray[i].estimateMethodData.leakRateEstimate = this.convertUnitsService.value(inputArray[i].estimateMethodData.leakRateEstimate).from('ft3').to('m3');

        inputArray[i].decibelsMethodData.linePressure = this.convertUnitsService.value(inputArray[i].decibelsMethodData.linePressure).from('psig').to('kPaa');
        inputArray[i].decibelsMethodData.pressureA = this.convertUnitsService.value(inputArray[i].decibelsMethodData.pressureA).from('psig').to('kPaa');
        inputArray[i].decibelsMethodData.pressureB = this.convertUnitsService.value(inputArray[i].decibelsMethodData.pressureB).from('psig').to('kPaa');

        inputArray[i].orificeMethodData.compressorAirTemp = this.convertUnitsService.value(inputArray[i].orificeMethodData.compressorAirTemp).from('F').to('C');
        inputArray[i].orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputArray[i].orificeMethodData.atmosphericPressure).from('psia').to('kPaa');
        inputArray[i].orificeMethodData.orificeDiameter = this.convertUnitsService.value(inputArray[i].orificeMethodData.orificeDiameter).from('in').to('cm');
        inputArray[i].orificeMethodData.supplyPressure = this.convertUnitsService.value(inputArray[i].orificeMethodData.supplyPressure).from('in').to('cm');        

        // let conversionHelper = this.convertUnitsService.value(1).from('m3').to('ft3');
        // inputArray[i].compressorElectricityData.compressorSpecificPower = inputArray[i].compressorElectricityData.compressorSpecificPower / conversionHelper;
      }
    } 
    return inputArray;
  }

  convertFacilityCompressorData(compressorElectricityData: CompressorElectricityData, settings: Settings): CompressorElectricityData {
    if (settings.unitsOfMeasure == 'Metric') {
        let conversionHelper = this.convertUnitsService.value(1).from('m3').to('ft3');
        compressorElectricityData.compressorSpecificPower = compressorElectricityData.compressorSpecificPower / conversionHelper;
    } 
    return compressorElectricityData;
  }

  convertResult(result: AirLeakSurveyResult, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      result.flowRate = this.convertUnitsService.value(result.flowRate).from('ft3').to('m3');
      result.consumption = this.convertUnitsService.value(result.consumption).from('ft3').to('m3');
      result.compressedAirUse = this.convertUnitsService.value(result.compressedAirUse).from('ft3').to('m3');
      result.airLoss = this.convertUnitsService.value(result.airLoss).from('ft3').to('m3');
    } else {
      result.consumption = result.consumption / 1000;
    }
    return result;
  }


  convertDefaultData(inputData: AirLeakSurveyData): AirLeakSurveyData {
    inputData.bagMethodData.height = this.convertUnitsService.value(inputData.bagMethodData.height).from('in').to('cm');
    inputData.bagMethodData.diameter = this.convertUnitsService.value(inputData.bagMethodData.diameter).from('in').to('cm');
    inputData.bagMethodData.height = this.roundVal(inputData.bagMethodData.height);
    inputData.bagMethodData.diameter = this.roundVal(inputData.bagMethodData.diameter);

    inputData.estimateMethodData.leakRateEstimate = this.convertUnitsService.value(inputData.estimateMethodData.leakRateEstimate).from('m3').to('ft3');
    inputData.bagMethodData.height = this.roundVal(inputData.bagMethodData.height);

    inputData.decibelsMethodData.linePressure = this.convertUnitsService.value(inputData.decibelsMethodData.linePressure).from('kPaa').to('psig');
    inputData.decibelsMethodData.pressureA = this.convertUnitsService.value(inputData.decibelsMethodData.pressureA).from('kPaa').to('psig');
    inputData.decibelsMethodData.pressureB = this.convertUnitsService.value(inputData.decibelsMethodData.pressureB).from('kPaa').to('psig');
    inputData.decibelsMethodData.linePressure = this.roundVal(inputData.decibelsMethodData.linePressure);
    inputData.decibelsMethodData.pressureA = this.roundVal(inputData.decibelsMethodData.pressureA);
    inputData.decibelsMethodData.pressureB = this.roundVal(inputData.decibelsMethodData.pressureB);

    inputData.orificeMethodData.compressorAirTemp = this.convertUnitsService.value(inputData.orificeMethodData.compressorAirTemp).from('c').to('f');
    inputData.orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputData.orificeMethodData.atmosphericPressure).from('kPaa').to('psia');
    inputData.orificeMethodData.orificeDiameter = this.convertUnitsService.value(inputData.orificeMethodData.orificeDiameter).from('cm').to('in');
    inputData.orificeMethodData.supplyPressure = this.convertUnitsService.value(inputData.orificeMethodData.supplyPressure).from('cm').to('in'); 
    inputData.orificeMethodData.compressorAirTemp = this.roundVal(inputData.orificeMethodData.compressorAirTemp);
    inputData.orificeMethodData.atmosphericPressure = this.roundVal(inputData.orificeMethodData.atmosphericPressure);
    inputData.orificeMethodData.orificeDiameter = this.roundVal(inputData.orificeMethodData.orificeDiameter);       
    inputData.orificeMethodData.supplyPressure = this.roundVal(inputData.orificeMethodData.supplyPressure);       

    // let conversionHelper = this.convertUnitsService.value(1).from('ft3').to('m3');
    // inputData.compressorElectricityData.compressorSpecificPower = inputData.compressorElectricityData.compressorSpecificPower / conversionHelper;
    // inputData.compressorElectricityData.compressorSpecificPower = this.roundVal(inputData.compressorElectricityData.compressorSpecificPower);
    // inputData.utilityCost = this.roundVal(inputData.utilityCost);

    return inputData;
  }

  convertDefaultFacilityCompressorData(inputData: FacilityCompressorData): FacilityCompressorData {
    let conversionHelper = this.convertUnitsService.value(1).from('ft3').to('m3');
    inputData.compressorElectricityData.compressorSpecificPower = inputData.compressorElectricityData.compressorSpecificPower / conversionHelper;
    inputData.compressorElectricityData.compressorSpecificPower = this.roundVal(inputData.compressorElectricityData.compressorSpecificPower);
    inputData.utilityCost = this.roundVal(inputData.utilityCost);

    return inputData;
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }

}
