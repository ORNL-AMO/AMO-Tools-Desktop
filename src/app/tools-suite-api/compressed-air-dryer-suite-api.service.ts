import { Injectable } from '@angular/core';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType } from '../shared/models/standalone';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';

export { DryerType, DryerOperatingCostInput, DryerOperatingCostOutput };

@Injectable()
export class CompressedAirDryersSuiteApiService {
  constructor(private toolsSuiteApiService: ToolsSuiteApiService, private suiteApiHelperService: SuiteApiHelperService) { }

  dryerOperatingCost(inputObj: DryerOperatingCostInput): DryerOperatingCostOutput {
    const wasmInput = {
      flowRate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.flowRate),
      pressure: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.pressure),
      temperature: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.temperature),
      operatingHoursPerDay: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.operatingHoursPerDay),
      operatingDaysPerWeek: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.operatingDaysPerWeek),
      operatingWeeksPerYear: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.operatingWeeksPerYear),
      costOfElectricity: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.costOfElectricity),
      costOfCompressedAir: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.costOfCompressedAir),
      costOfCoolingWater: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.costOfCoolingWater),
      heaterPower: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.heaterPower),
      heatingHoursPerDay: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.heatingHoursPerDay),
      purgeRate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.purgeRate),
      designDDCPercentage: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.designDDCPercentage),
    };

    const instance = new this.toolsSuiteApiService.ToolsSuiteModule.DryerOperatingCost(wasmInput);
    const dryerTypeEnum = this.getDryerTypeEnum(inputObj.dryerType);
    const output = instance.calculate(dryerTypeEnum);

    const result: DryerOperatingCostOutput = {
      waterRemoved: output.waterRemoved,
      totalCostPerYear: output.totalCostPerYear,
      heaterPower: output.heaterPower,
      heatingHoursPerDay: output.heatingHoursPerDay,
      purgeRate: output.purgeRate,
      designDDCPercentage: output.designDDCPercentage,
    };

    output.delete();
    instance.delete();
    return result;
  }

  private getDryerTypeEnum(dryerType: DryerType) {
    const DryerTypeWasm = this.toolsSuiteApiService.ToolsSuiteModule.DryerType;
    switch (dryerType) {
      case DryerType.Heatless:                return DryerTypeWasm.Heatless;
      case DryerType.HeatedExternally:        return DryerTypeWasm.HeatedExternally;
      case DryerType.BlowerPurgeWithSweep:    return DryerTypeWasm.BlowerPurgeWithSweep;
      case DryerType.BlowerPurgeWithoutSweep: return DryerTypeWasm.BlowerPurgeWithoutSweep;
      case DryerType.HeatOfCompressionHC:     return DryerTypeWasm.HeatOfCompressionHC;
      case DryerType.HeatOfCompressionSP:     return DryerTypeWasm.HeatOfCompressionSP;
      case DryerType.Refrigerated:            return DryerTypeWasm.Refrigerated;
    }
  }
}
