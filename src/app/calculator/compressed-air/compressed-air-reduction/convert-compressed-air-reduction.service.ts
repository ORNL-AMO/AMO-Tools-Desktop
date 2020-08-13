import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { CompressedAirReductionData, CompressedAirReductionResult } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class ConvertCompressedAirReductionService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  convertInputs(inputArray: Array<CompressedAirReductionData>, settings: Settings): Array<CompressedAirReductionData> {
    // need to loop through for conversions prior to calculation
    if (settings.unitsOfMeasure != 'Imperial') {
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
    if (settings.unitsOfMeasure != 'Imperial') {
      results.flowRate = this.convertUnitsService.value(results.flowRate).from('ft3').to('m3');
      results.singleNozzeFlowRate = this.convertUnitsService.value(results.singleNozzeFlowRate).from('ft3').to('m3');
      results.consumption = this.convertUnitsService.value(results.consumption).from('ft3').to('m3');
    } else if (settings.unitsOfMeasure == 'Imperial') {
      results.consumption = results.consumption / 1000;
    }
    return results;
  }

  convertDefaultData(inputData: CompressedAirReductionData): CompressedAirReductionData {
    inputData.flowMeterMethodData.meterReading = this.convertUnitsService.value(inputData.flowMeterMethodData.meterReading).from('ft3').to('m3');
    inputData.flowMeterMethodData.meterReading = this.roundVal(inputData.flowMeterMethodData.meterReading);

    inputData.bagMethodData.height = this.convertUnitsService.value(inputData.bagMethodData.height).from('in').to('cm');
    inputData.bagMethodData.height = this.roundVal(inputData.bagMethodData.height);

    inputData.bagMethodData.diameter = this.convertUnitsService.value(inputData.bagMethodData.diameter).from('in').to('cm');
    inputData.bagMethodData.diameter = this.roundVal(inputData.bagMethodData.diameter);

    inputData.pressureMethodData.supplyPressure = this.convertUnitsService.value(inputData.pressureMethodData.supplyPressure).from('psig').to('barg');
    inputData.pressureMethodData.supplyPressure = this.roundVal(inputData.pressureMethodData.supplyPressure);

    inputData.otherMethodData.consumption = this.convertUnitsService.value(inputData.otherMethodData.consumption).from('ft3').to('m3');
    inputData.otherMethodData.consumption = this.roundVal(inputData.otherMethodData.consumption);

    let conversionHelper = this.convertUnitsService.value(1).from('ft3').to('m3');
    inputData.compressorElectricityData.compressorSpecificPower = inputData.compressorElectricityData.compressorSpecificPower / conversionHelper;
    inputData.compressorElectricityData.compressorSpecificPower = this.roundVal(inputData.compressorElectricityData.compressorSpecificPower);

    if (inputData.utilityType == 0) {
      inputData.compressedAirCost = inputData.compressedAirCost / conversionHelper;
      inputData.compressedAirCost = this.roundVal(inputData.compressedAirCost);
      inputData.utilityCost = inputData.compressedAirCost;
    }
    else {
      inputData.utilityCost = inputData.electricityCost;
      inputData.utilityCost = this.roundVal(inputData.utilityCost);
    }
    return inputData;
  }

  roundVal(num: number): number {
    return Number(num.toFixed(3));
  }
}
