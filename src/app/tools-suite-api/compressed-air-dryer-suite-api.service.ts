import { Injectable } from '@angular/core';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType, PurgeInputMode } from '../shared/models/standalone';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { type DryerOperatingCostResult } from 'measur-tools-suite';

export { DryerType, PurgeInputMode, DryerOperatingCostInput, DryerOperatingCostOutput };

@Injectable()
export class CompressedAirDryersSuiteApiService {
  constructor(private toolsSuiteApiService: ToolsSuiteApiService, private suiteApiHelperService: SuiteApiHelperService) { }

  // Stateless suite call: input and result are plain value objects, so no delete() cleanup is needed.
  dryerOperatingCost(inputObj: DryerOperatingCostInput): DryerOperatingCostOutput {
    const output: DryerOperatingCostResult = this.toolsSuiteApiService.ToolsSuiteModule.calculateDryerOperatingCost({
      dryerType: this.getDryerTypeEnum(inputObj.dryerType),
      flowRate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.flowRate),
      pressure: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.pressure),
      temperature: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.temperature),
      annualOperatingHours: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.annualOperatingHours),
      costOfElectricity: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.costOfElectricity),
      costOfCompressedAir: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.costOfCompressedAir),
      costOfCoolingWater: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.costOfCoolingWater),
      heaterPower: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.heaterPower),
      heatingHoursPerDay: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.heatingHoursPerDay),
      purgeRate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.purgeRate),
      purgeFlowRate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.purgeFlowRate),
      designDDCPercentage: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.designDDCPercentage),
      regenerationCycleLength: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.regenerationCycleLength),
      motorPower: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputObj.motorPower),
      purgeInputMode: this.getPurgeInputModeEnum(inputObj.purgeInputMode),
    });

    return {
      waterRemoved: output.waterRemoved,
      totalCostPerYear: output.totalCostPerYear,
      heaterPower: output.heaterPower,
      heatingHoursPerDay: output.heatingHoursPerDay,
      purgeRate: output.purgeRate,
      designDDCPercentage: output.designDDCPercentage,
      purgeFlowRate: output.purgeFlowRate,
      motorPower: output.motorPower,
      regenerationCycleLength: output.regenerationCycleLength,
    };
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

  private getPurgeInputModeEnum(purgeInputMode: PurgeInputMode) {
    const PurgeInputModeWasm = this.toolsSuiteApiService.ToolsSuiteModule.PurgeInputMode;
    switch (purgeInputMode) {
      case PurgeInputMode.PercentOfDryerCapacity: return PurgeInputModeWasm.PercentOfDryerCapacity;
      case PurgeInputMode.DirectFlow:             return PurgeInputModeWasm.DirectFlow;
    }
  }
}
