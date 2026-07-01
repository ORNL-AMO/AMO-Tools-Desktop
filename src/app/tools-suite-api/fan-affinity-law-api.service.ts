import { Injectable } from '@angular/core';
import { FanAffinityLawsInput, FanAffinityLawsOutput } from '../shared/models/standalone';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';

@Injectable()
export class FanAffinityLawApiService {
  constructor(
    private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService,
  ) {}

  calculate(inputData: FanAffinityLawsInput): FanAffinityLawsOutput {
    const instance = this.buildInstance(inputData);
    const suiteOutput = instance.calculate();
    const results = this.mapOutput(suiteOutput);
    suiteOutput.delete();
    instance.delete();
    return results;
  }

  changeFanSize(inputData: FanAffinityLawsInput, currentDiameter: number, newDiameter: number): FanAffinityLawsOutput {
    const instance = this.buildInstance(inputData);
    const suiteOutput = instance.changeFanSize(currentDiameter, newDiameter);
    const results = this.mapOutput(suiteOutput);
    suiteOutput.delete();
    instance.delete();
    return results;
  }

  private buildInstance(inputData: FanAffinityLawsInput): any {
    const wasmInput = {
      electricityCost: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.electricityCost),
      driveEfficiency: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.driveEfficiency),
      motorEfficiency: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.motorEfficiency),
      flowPercentBaseline: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.flowPercentBaseline),
      operatingHours: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.operatingHours),
      motorPower: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.motorPower),
      ratedFlow: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.ratedFlow),
      motorControlTypeCurrent: this.getMotorControlTypeEnum(inputData.motorControlTypeCurrent),
      motorControlTypeNew: this.getMotorControlTypeEnum(inputData.motorControlTypeNew),
      flowMode: this.getFlowModeEnum(inputData.flowMode),
      desiredFlowRate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.desiredFlowRate),
    };
    return new this.toolsSuiteApiService.ToolsSuiteModule.FanAffinityLaws(wasmInput);
  }

  private mapOutput(suiteOutput: any): FanAffinityLawsOutput {
    return {
      annualEnergyBaseline: suiteOutput.annualEnergyBaseline,
      annualEnergyNew: suiteOutput.annualEnergyNew,
      annualCostSavings: suiteOutput.annualCostSavings,
    };
  }

  private getMotorControlTypeEnum(controlType: number): any {
    switch (controlType) {
      case 0:
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorControlType.OnOff;
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorControlType.TwoSpeed;
      case 2:
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorControlType.VSD;
      case 3:
      default:
        return this.toolsSuiteApiService.ToolsSuiteModule.MotorControlType.None;
    }
  }

  private getFlowModeEnum(flowMode: number): any {
    switch (flowMode) {
      case 1:
        return this.toolsSuiteApiService.ToolsSuiteModule.FlowMode.Volume;
      case 0:
      default:
        return this.toolsSuiteApiService.ToolsSuiteModule.FlowMode.Percent;
    }
  }
}
