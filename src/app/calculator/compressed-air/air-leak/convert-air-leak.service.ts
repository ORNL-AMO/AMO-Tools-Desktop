import { Injectable } from '@angular/core';
import { AirLeakSurveyData, AirLeakSurveyResult, FacilityCompressorData, CompressorElectricityData, AirLeakSurveyInput } from '../../../shared/models/standalone';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { roundVal } from '../../../shared/helperFunctions';

@Injectable()
export class ConvertAirLeakService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  //input metric => imperial
  convertInputs(inputArray: Array<AirLeakSurveyData>, settings: Settings): Array<AirLeakSurveyData> {
    if (settings.unitsOfMeasure == 'Metric') {
      for (let i = 0; i < inputArray.length; i++) {
        inputArray[i].bagMethodData.bagVolume = this.convertUnitsService.value(inputArray[i].bagMethodData.bagVolume).from('L').to('ft3');

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
        inputArray[i].bagMethodData.bagVolume = this.convertUnitsService.value(inputArray[i].bagMethodData.bagVolume).from('gal').to('ft3');
        //per issue-4091
        inputArray[i].compressorElectricityData.compressorSpecificPower = inputArray[i].compressorElectricityData.compressorSpecificPower / 100;
      }
    }
    return inputArray;
  }

  /**
   *  Convert specific power to metric
   * @param specificPower as a fraction
   * @returns 
   */
  convertSpecificPowerToMetric(specificPower: number): number {
    let conversionHelper = this.convertUnitsService.value(1).from('ft3').to('m3');
    specificPower = specificPower / conversionHelper;
    return specificPower;
  }

  /**
   *  Convert leak flow rates and electricity for AirLeakSurveyResult. NOTE 
   *  @param result the raw result returned from the suite. totalFlowRate is in scfm, annualTotalFlowRate in scf, energy in kWh
   * 
   */
  convertResult(result: AirLeakSurveyResult, settings: Settings) {
    if (settings.unitsOfMeasure == 'Metric') {
      result.totalFlowRate = this.convertUnitsService.value(result.totalFlowRate).from('ft3').to('m3');
      result.annualTotalFlowRate = this.convertUnitsService.value(result.annualTotalFlowRate).from('ft3').to('m3');
    } else {
      result.annualTotalFlowRate = result.annualTotalFlowRate / 1000;
    }
    return result;
  }

    /**
   *  Convert AirLeakSurveyResult when Bag Method is selected (measurementMethod 2).
   *  @param result the raw result returned from the suite. totalFlowRate is in scfm, annualTotalFlowRate is in kscf, energy in mWh
   */
  convertBagMethodResult(result: AirLeakSurveyResult, settings: Settings) {
    result.annualTotalElectricity = result.annualTotalElectricity * 1000;
    result.annualTotalElectricityCost = result.annualTotalElectricityCost * 1000;
    if (settings.unitsOfMeasure == 'Metric') {
      result.annualTotalFlowRate = result.annualTotalFlowRate * 1000;
      result.totalFlowRate = this.convertUnitsService.value(result.totalFlowRate).from('ft3').to('m3');
      result.annualTotalFlowRate = this.convertUnitsService.value(result.annualTotalFlowRate).from('ft3').to('m3');
    } 

    return result;
  }


  convertInputDataImperialToMetric(inputData: AirLeakSurveyData): AirLeakSurveyData {
    inputData.bagMethodData.bagVolume = this.convertUnitsService.value(inputData.bagMethodData.bagVolume).from('gal').to('L');
    inputData.bagMethodData.bagVolume = roundVal(inputData.bagMethodData.bagVolume);

    inputData.estimateMethodData.leakRateEstimate = this.convertUnitsService.value(inputData.estimateMethodData.leakRateEstimate).from('ft3').to('m3');
    inputData.estimateMethodData.leakRateEstimate = roundVal(inputData.estimateMethodData.leakRateEstimate);

    inputData.decibelsMethodData.linePressure = this.convertUnitsService.value(inputData.decibelsMethodData.linePressure).from('psig').to('kPag');
    inputData.decibelsMethodData.pressureA = this.convertUnitsService.value(inputData.decibelsMethodData.pressureA).from('psig').to('kPag');
    inputData.decibelsMethodData.pressureB = this.convertUnitsService.value(inputData.decibelsMethodData.pressureB).from('psig').to('kPag');

    inputData.decibelsMethodData.firstFlowA = this.convertUnitsService.value(inputData.decibelsMethodData.firstFlowA).from('ft3').to('m3');
    inputData.decibelsMethodData.secondFlowA = this.convertUnitsService.value(inputData.decibelsMethodData.secondFlowA).from('ft3').to('m3');
    inputData.decibelsMethodData.firstFlowB = this.convertUnitsService.value(inputData.decibelsMethodData.firstFlowB).from('ft3').to('m3');
    inputData.decibelsMethodData.secondFlowB = this.convertUnitsService.value(inputData.decibelsMethodData.secondFlowB).from('ft3').to('m3');


    inputData.decibelsMethodData.linePressure = roundVal(inputData.decibelsMethodData.linePressure);
    inputData.decibelsMethodData.pressureA = roundVal(inputData.decibelsMethodData.pressureA);
    inputData.decibelsMethodData.pressureB = roundVal(inputData.decibelsMethodData.pressureB);
    inputData.decibelsMethodData.firstFlowA = roundVal(inputData.decibelsMethodData.firstFlowA);
    inputData.decibelsMethodData.secondFlowA = roundVal(inputData.decibelsMethodData.secondFlowA);
    inputData.decibelsMethodData.firstFlowB = roundVal(inputData.decibelsMethodData.firstFlowB);
    inputData.decibelsMethodData.secondFlowB = roundVal(inputData.decibelsMethodData.secondFlowB);

    inputData.orificeMethodData.compressorAirTemp = this.convertUnitsService.value(inputData.orificeMethodData.compressorAirTemp).from('F').to('C');
    inputData.orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputData.orificeMethodData.atmosphericPressure).from('psia').to('kPaa');
    inputData.orificeMethodData.orificeDiameter = this.convertUnitsService.value(inputData.orificeMethodData.orificeDiameter).from('in').to('cm');
    inputData.orificeMethodData.supplyPressure = this.convertUnitsService.value(inputData.orificeMethodData.supplyPressure).from('psig').to('kPaa');
    inputData.orificeMethodData.compressorAirTemp = roundVal(inputData.orificeMethodData.compressorAirTemp);
    inputData.orificeMethodData.atmosphericPressure = roundVal(inputData.orificeMethodData.atmosphericPressure);
    inputData.orificeMethodData.orificeDiameter = roundVal(inputData.orificeMethodData.orificeDiameter);
    inputData.orificeMethodData.supplyPressure = roundVal(inputData.orificeMethodData.supplyPressure);
    return inputData;
  }

  /**
   * Converts inputData from Metric to Imperial units
   */
  convertInputDataMetricToImperial(inputData: AirLeakSurveyData): AirLeakSurveyData {
    inputData.bagMethodData.bagVolume = this.convertUnitsService.value(inputData.bagMethodData.bagVolume).from('L').to('gal');
    inputData.bagMethodData.bagVolume = roundVal(inputData.bagMethodData.bagVolume);

    inputData.estimateMethodData.leakRateEstimate = this.convertUnitsService.value(inputData.estimateMethodData.leakRateEstimate).from('m3').to('ft3');
    inputData.estimateMethodData.leakRateEstimate = roundVal(inputData.estimateMethodData.leakRateEstimate);

    inputData.decibelsMethodData.linePressure = this.convertUnitsService.value(inputData.decibelsMethodData.linePressure).from('kPag').to('psig');
    inputData.decibelsMethodData.pressureA = this.convertUnitsService.value(inputData.decibelsMethodData.pressureA).from('kPag').to('psig');
    inputData.decibelsMethodData.pressureB = this.convertUnitsService.value(inputData.decibelsMethodData.pressureB).from('kPag').to('psig');

    inputData.decibelsMethodData.firstFlowA = this.convertUnitsService.value(inputData.decibelsMethodData.firstFlowA).from('m3').to('ft3');
    inputData.decibelsMethodData.secondFlowA = this.convertUnitsService.value(inputData.decibelsMethodData.secondFlowA).from('m3').to('ft3');
    inputData.decibelsMethodData.firstFlowB = this.convertUnitsService.value(inputData.decibelsMethodData.firstFlowB).from('m3').to('ft3');
    inputData.decibelsMethodData.secondFlowB = this.convertUnitsService.value(inputData.decibelsMethodData.secondFlowB).from('m3').to('ft3');

    inputData.decibelsMethodData.linePressure = roundVal(inputData.decibelsMethodData.linePressure);
    inputData.decibelsMethodData.pressureA = roundVal(inputData.decibelsMethodData.pressureA);
    inputData.decibelsMethodData.pressureB = roundVal(inputData.decibelsMethodData.pressureB);
    inputData.decibelsMethodData.firstFlowA = roundVal(inputData.decibelsMethodData.firstFlowA);
    inputData.decibelsMethodData.secondFlowA = roundVal(inputData.decibelsMethodData.secondFlowA);
    inputData.decibelsMethodData.firstFlowB = roundVal(inputData.decibelsMethodData.firstFlowB);
    inputData.decibelsMethodData.secondFlowB = roundVal(inputData.decibelsMethodData.secondFlowB);

    inputData.orificeMethodData.compressorAirTemp = this.convertUnitsService.value(inputData.orificeMethodData.compressorAirTemp).from('C').to('F');
    inputData.orificeMethodData.atmosphericPressure = this.convertUnitsService.value(inputData.orificeMethodData.atmosphericPressure).from('kPaa').to('psia');
    inputData.orificeMethodData.orificeDiameter = this.convertUnitsService.value(inputData.orificeMethodData.orificeDiameter).from('cm').to('in');
    inputData.orificeMethodData.supplyPressure = this.convertUnitsService.value(inputData.orificeMethodData.supplyPressure).from('kPaa').to('psig');
    inputData.orificeMethodData.compressorAirTemp = roundVal(inputData.orificeMethodData.compressorAirTemp);
    inputData.orificeMethodData.atmosphericPressure = roundVal(inputData.orificeMethodData.atmosphericPressure);
    inputData.orificeMethodData.orificeDiameter = roundVal(inputData.orificeMethodData.orificeDiameter);
    inputData.orificeMethodData.supplyPressure = roundVal(inputData.orificeMethodData.supplyPressure);
    return inputData;
  }

  convertExample(airLeakInputExample: AirLeakSurveyInput): AirLeakSurveyInput {
    airLeakInputExample.compressedAirLeakSurveyInputVec.forEach(inputData => {
      inputData = this.convertInputDataImperialToMetric(inputData)
    });
    airLeakInputExample.facilityCompressorData = this.convertImperialFacilityCompressorData(airLeakInputExample.facilityCompressorData);
    return airLeakInputExample;
  }


 
  convertFacilityCompressorData(
    inputData: FacilityCompressorData,
    oldSettings: Settings,
    newSettings?: Settings
  ): FacilityCompressorData {
    const conversionHelper = this.convertUnitsService.value(1).from('ft3').to('m3');

    if (oldSettings.unitsOfMeasure === 'Imperial' && (!newSettings || newSettings.unitsOfMeasure === 'Metric')) {
      inputData = this.convertImperialFacilityCompressorData(inputData, conversionHelper);
    } else if (oldSettings.unitsOfMeasure === 'Metric' && (!newSettings || newSettings.unitsOfMeasure === 'Imperial')) {
      inputData.compressorElectricityData.compressorSpecificPower = inputData.compressorElectricityData.compressorSpecificPower * conversionHelper * 100;
      inputData.compressorElectricityData.compressorSpecificPower = roundVal(inputData.compressorElectricityData.compressorSpecificPower);
      if (inputData.utilityType === 0) {
        inputData.utilityCost = inputData.utilityCost * conversionHelper;
        inputData.utilityCost = roundVal(inputData.utilityCost);
      }
    }
    return inputData;
  }

  convertImperialFacilityCompressorData(inputData: FacilityCompressorData, conversionHelper?: number): FacilityCompressorData {
    conversionHelper = conversionHelper ? conversionHelper : this.convertUnitsService.value(1).from('ft3').to('m3');
    inputData.compressorElectricityData.compressorSpecificPower = this.convertSpecificPowerToMetric((inputData.compressorElectricityData.compressorSpecificPower / 100));
      inputData.compressorElectricityData.compressorSpecificPower = roundVal(inputData.compressorElectricityData.compressorSpecificPower);
      if (inputData.utilityType === 0) {
        inputData.utilityCost = inputData.utilityCost / conversionHelper;
        inputData.utilityCost = roundVal(inputData.utilityCost);
      }

    return inputData;
  }

}
