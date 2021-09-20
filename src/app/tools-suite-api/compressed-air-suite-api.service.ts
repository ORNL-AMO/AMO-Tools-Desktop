import { Injectable } from '@angular/core';
import { CompEEM_kWAdjustedInput, CompressedAirPressureReductionInput, CompressedAirPressureReductionResult } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;

@Injectable()
export class CompressedAirSuiteApiService {
  constructor(private suiteApiHelperService: SuiteApiHelperService) { }
  compressedAirPressureReduction(inputObj: CompressedAirPressureReductionInput): CompressedAirPressureReductionResult {
    if(inputObj.compressedAirPressureReductionInputVec && inputObj.compressedAirPressureReductionInputVec.length > 0){
      inputObj.compressedAirPressureReductionInputVec[0].compressorPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].compressorPower);
      inputObj.compressedAirPressureReductionInputVec[0].pressureRated = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].pressureRated);
      inputObj.compressedAirPressureReductionInputVec[0].pressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].pressure);
      inputObj.compressedAirPressureReductionInputVec[0].atmosphericPressure = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.compressedAirPressureReductionInputVec[0].atmosphericPressure);

      let input: CompEEM_kWAdjustedInput = {
        kW_fl_rated: inputObj.compressedAirPressureReductionInputVec[0].compressorPower,
        P_fl_rated: inputObj.compressedAirPressureReductionInputVec[0].pressureRated,
        P_discharge: inputObj.compressedAirPressureReductionInputVec[0].pressure,
        P_alt: inputObj.compressedAirPressureReductionInputVec[0].atmosphericPressure,
        P_atm: 14.7
      }
      let kW_adjusted: number = Module.kWAdjusted(input.kW_fl_rated, input.P_fl_rated, input.P_discharge, input.P_alt, input.P_atm);
      let annualEnergyUsage: number = kW_adjusted * inputObj.compressedAirPressureReductionInputVec[0].hoursPerYear;
      let annualEnergyCost: number = annualEnergyUsage * inputObj.compressedAirPressureReductionInputVec[0].electricityCost;
      return {
        energyCost: annualEnergyCost,
        energyUse: annualEnergyUsage
      }
    }
    return {
      energyCost: 0,
      energyUse: 0
    }
  }
}
