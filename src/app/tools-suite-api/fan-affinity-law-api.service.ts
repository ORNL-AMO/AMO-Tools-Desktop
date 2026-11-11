import { Injectable } from '@angular/core';
import {
  type FanAffinityLawsInput as SuiteFanAffinityLawsInput,
  type FanAffinityLawsResult,
  type FanAffinityLawsTimeFactorResult,
  type FlowMode,
  type MeasurToolsSuite,
  type MotorControlType
} from 'measur-tools-suite';
import { FanAffinityLawsInput, FanAffinityLawsOutput, FanAffinityLawsTimeFactors } from '../shared/models/standalone';
import { ToolsSuiteApiService } from './tools-suite-api.service';

@Injectable()
export class FanAffinityLawApiService {
  constructor(private toolsSuiteApiService: ToolsSuiteApiService) {}

  // suite inputs and results are plain objects, so nothing needs delete()
  calculate(inputData: FanAffinityLawsInput): FanAffinityLawsOutput {
    const suite: MeasurToolsSuite = this.toolsSuiteApiService.ToolsSuiteModule;
    const input: SuiteFanAffinityLawsInput = this.buildInput(inputData, suite);
    const output: FanAffinityLawsResult = suite.calculateFanAffinityLaws(input);
    return { ...output };
  }

  changeFanSize(inputData: FanAffinityLawsInput, currentDiameter: number, newDiameter: number): FanAffinityLawsOutput {
    const suite: MeasurToolsSuite = this.toolsSuiteApiService.ToolsSuiteModule;
    const input: SuiteFanAffinityLawsInput = this.buildInput(inputData, suite);
    const output: FanAffinityLawsResult = suite.calculateFanAffinityLawsWithFanSize(input, currentDiameter, newDiameter);
    return { ...output };
  }

  get50PercentTimeFactor(flowFraction: number): FanAffinityLawsTimeFactors {
    const suite: MeasurToolsSuite = this.toolsSuiteApiService.ToolsSuiteModule;
    const output: FanAffinityLawsTimeFactorResult = suite.get50PercentTimeFactor(flowFraction);
    return { ...output };
  }

  private buildInput(inputData: FanAffinityLawsInput, suite: MeasurToolsSuite): SuiteFanAffinityLawsInput {
    const controlledFlow: boolean = inputData.motorControlTypeNew === 1 || inputData.motorControlTypeNew === 2;
    const desiredFlowRate: number = controlledFlow
      ? (inputData.flowMode === 1 ? inputData.desiredFlowVolume : inputData.desiredFlowPercent) : 0;
    return {
      electricityCost: inputData.electricalRate,
      driveEfficiency: inputData.efficiencyDrive,
      motorEfficiency: inputData.efficiencyMotor,
      flowPercentBaseline: inputData.motorControlTypeCurrent === 0 ? 100 : inputData.actualFlow / inputData.ratedFlow * 100,
      operatingHours: inputData.hoursOperation,
      motorPower: inputData.powerMotor,
      ratedFlow: inputData.ratedFlow,
      motorControlTypeCurrent: this.getMotorControlTypeEnum(inputData.motorControlTypeCurrent, suite),
      motorControlTypeNew: this.getMotorControlTypeEnum(inputData.motorControlTypeNew, suite),
      flowMode: this.getFlowModeEnum(inputData.flowMode, suite),
      desiredFlowRate
    };
  }

  private getMotorControlTypeEnum(controlType: number, suite: MeasurToolsSuite): MotorControlType {
    switch (controlType) {
      case 0: return suite.MotorControlType.OnOff;
      case 1: return suite.MotorControlType.TwoSpeed;
      case 2: return suite.MotorControlType.VSD;
      default: return suite.MotorControlType.None;
    }
  }

  private getFlowModeEnum(flowMode: number, suite: MeasurToolsSuite): FlowMode {
    return flowMode === 1 ? suite.FlowMode.Volume : suite.FlowMode.Percent;
  }
}
