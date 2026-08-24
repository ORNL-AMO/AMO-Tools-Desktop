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
    const desiredFlowRate: number = (inputData.flowMode === 1) ? inputData.desiredFlowVolume : inputData.desiredFlowPercent;
    // clamped defensively: the wasm constructor throws if flowPercentBaseline is outside 0-100,
    // which actualFlow > ratedFlow would otherwise trigger
    const flowPercentBaseline: number = Math.min(100, Math.max(0, (inputData.actualFlow / inputData.ratedFlow) * 100));
    const wasmInput = {
      electricityCost: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.electricalRate),
      driveEfficiency: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.efficiencyDrive),
      motorEfficiency: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.efficiencyMotor),
      flowPercentBaseline: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(flowPercentBaseline),
      operatingHours: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.hoursOperation),
      motorPower: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.powerMotor),
      ratedFlow: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(inputData.ratedFlow),
      motorControlTypeCurrent: this.getMotorControlTypeEnum(inputData.motorControlTypeCurrent),
      motorControlTypeNew: this.getMotorControlTypeEnum(inputData.motorControlTypeNew),
      flowMode: this.getFlowModeEnum(inputData.flowMode),
      desiredFlowRate: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(desiredFlowRate),
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
