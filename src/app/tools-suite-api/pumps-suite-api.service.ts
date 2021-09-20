import { Injectable } from '@angular/core';
import { MotorPerformanceResults } from '../calculator/motors/motor-performance/motor-performance.service';
import { HeadToolResults } from '../shared/models/calculators';
import { PsatInputs, PsatOutputs } from '../shared/models/psat';
import { SuiteApiHelperService } from './suite-api-helper.service';

//wasm module
declare var Module: any;


@Injectable()
export class PumpsSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService) { }

  //results
  resultsExisting(psatInput: PsatInputs): PsatOutputs {
    let psatWasmModule = this.getPsatModuleFromInputs(psatInput);
    let calculatedResults: PsatOutputs = psatWasmModule.calculateExisting();
    calculatedResults.annual_savings_potential = psatWasmModule.getAnnualSavingsPotential() * 1000;
    calculatedResults.optimization_rating = psatWasmModule.getOptimizationRating();
    calculatedResults = this.convertResultsToPercentages(calculatedResults);
    return calculatedResults;
  }

  resultsModified(psatInput: PsatInputs): PsatOutputs {
    let psatWasmModule = this.getPsatModuleFromInputs(psatInput);
    let calculatedResults: PsatOutputs = psatWasmModule.calculateModified();
    calculatedResults.annual_savings_potential = psatWasmModule.getAnnualSavingsPotential() * 1000;
    calculatedResults.optimization_rating = psatWasmModule.getOptimizationRating();
    calculatedResults = this.convertResultsToPercentages(calculatedResults);
    return calculatedResults;
  }

  convertResultsToPercentages(calculatedResults: PsatOutputs): PsatOutputs {
    calculatedResults.pump_efficiency = calculatedResults.pump_efficiency * 100;
    calculatedResults.motor_efficiency = calculatedResults.motor_efficiency * 100;
    calculatedResults.motor_power_factor = calculatedResults.motor_power_factor * 100;
    calculatedResults.drive_efficiency = calculatedResults.drive_efficiency * 100;
    calculatedResults.annual_cost = calculatedResults.annual_cost * 1000;
    return calculatedResults;
  }

  getPsatModuleFromInputs(psatInput: PsatInputs) {
    let pumpStyle = this.suiteApiHelperService.getPumpStyleEnum(psatInput.pump_style);
    let pumpEfficiency = psatInput.pump_specified / 100;
    let rpm = psatInput.motor_rated_speed;
    let drive = this.suiteApiHelperService.getDriveEnum(psatInput.drive);
    let kviscosity = psatInput.kinematic_viscosity;
    let specificGravity = psatInput.specific_gravity;
    let stageCount = psatInput.stages;
    let speed = this.suiteApiHelperService.getFixedSpeedEnum(psatInput.fixed_speed);
    let specifiedDriveEfficiency = psatInput.specifiedDriveEfficiency / 100;
    let pumpInput = new Module.PsatInput(pumpStyle, pumpEfficiency, rpm, drive, kviscosity, specificGravity, stageCount, speed, specifiedDriveEfficiency);
    //motor
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(psatInput.line_frequency);
    let motorRatedPower = psatInput.motor_rated_power;
    let motorRpm = psatInput.motor_rated_speed;
    let efficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(psatInput.efficiency_class);
    let specifiedMotorEfficiency = psatInput.efficiency / 100;
    let motorRatedVoltage = psatInput.motor_rated_voltage;
    let fullLoadAmps = psatInput.motor_rated_fla;
    // TODO New assessment, no margin. What should default margin be. Applied on backend?
    let sizeMargin = psatInput.margin? psatInput.margin : 0;
    let motor = new Module.Motor(lineFrequency, motorRatedPower, motorRpm, efficiencyClass, specifiedMotorEfficiency, motorRatedVoltage, fullLoadAmps, sizeMargin);
    
    let flowRate = psatInput.flow_rate;
    let head = psatInput.head;
    let loadEstimationMethod = this.suiteApiHelperService.getLoadEstimationMethod(psatInput.load_estimation_method);
    let motorPower = psatInput.motor_field_power;
    // TODO motorAmps null for sys setup
    let motorAmps = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_current);
    let voltage = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_voltage);
    
    let fieldData = new Module.PumpFieldData(flowRate, head, loadEstimationMethod, motorPower, motorAmps, voltage);
    let psat = new Module.PSAT(pumpInput, motor, fieldData, psatInput.operating_hours, psatInput.cost_kw_hour);
    fieldData.delete();
    motor.delete();
    pumpInput.delete();
    return psat;
  }

  //calculators
  headToolSuctionTank(specificGravity: number, flowRate: number, suctionPipeDiameter: number, suctionTankGasOverPressure: number, suctionTankFluidSurfaceElevation: number, suctionLineLossCoefficients: number, dischargePipeDiameter: number, dischargeGaugePressure: number, dischargeGaugeElevation: number, dischargeLineLossCoefficients: number): HeadToolResults {
    let instance = new Module.HeadToolSuctionTank(specificGravity, flowRate, suctionPipeDiameter, suctionTankGasOverPressure, suctionTankFluidSurfaceElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let headToolSuctionTankResults: HeadToolResults = instance.calculate();
    instance.delete();
    return headToolSuctionTankResults;
  }

  headTool(specificGravity: number, flowRate: number, suctionPipeDiameter: number, suctionGaugePressure: number, suctionGaugeElevation: number, suctionLineLossCoefficients: number, dischargePipeDiameter: number, dischargeGaugePressure: number, dischargeGaugeElevation: number, dischargeLineLossCoefficients: number): HeadToolResults {
    let instance = new Module.HeadTool(specificGravity, flowRate, suctionPipeDiameter, suctionGaugePressure, suctionGaugeElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let headToolResults: HeadToolResults = instance.calculate();
    instance.delete();
    return headToolResults;
  }

  achievableEfficiency(pumpStyle: number, specificSpeed: number): number {
    let pumpStyleEnum = this.suiteApiHelperService.getPumpStyleEnum(pumpStyle);
    let instance = new Module.OptimalSpecificSpeedCorrection(pumpStyleEnum, specificSpeed);
    let results: number = instance.calculate() * 100;
    instance.delete();
    return results;
  }

  pumpEfficiency(pumpStyle: number, flowRate: number): { average: number, max: number } {
    let pumpStyleEnum = this.suiteApiHelperService.getPumpStyleEnum(pumpStyle);
    let instance = new Module.PumpEfficiency(pumpStyleEnum, flowRate);
    let pumpEfficiency: { average: number, max: number } = instance.calculate();
    return pumpEfficiency;
  }

  //TODO: MOVE TO MOTOR API SERVICE
  estimateFla(motorRatedPower: number, motorRPM: number, frequency: number, efficiencyClass: number, efficiency: number, motorVoltage: number): number {
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(frequency);
    let motorEfficiencyEnum = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance = new Module.EstimateFLA(motorRatedPower, motorRPM, lineFrequency, motorEfficiencyEnum, efficiency, motorVoltage);
    let estimatedFLA: number = instance.getEstimatedFLA();
    instance.delete();
    return estimatedFLA;
  }

  //TODO: MOVE TO MOTOR API SERVICE
  motorPerformance(lineFreq: number, efficiencyClass: number, motorRatedPower: number, motorRPM: number, specifiedEfficiency: number, motorRatedVoltage: number, fullLoadAmps: number, loadFactor: number): MotorPerformanceResults {
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let motorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance = new Module.MotorPerformance(lineFrequency, motorRPM, motorEfficiencyClass, motorRatedPower, specifiedEfficiency, loadFactor, motorRatedVoltage, fullLoadAmps);
    let tmpResults: MotorPerformanceResults = instance.calculate();
    instance.delete();
    return tmpResults;
  }

  //TODO: MOVE TO MOTOR API SERVICE
  nema(lineFreq: number, motorRPM: number, efficiencyClass: number, efficiency: number, motorRatedPower: number): number {
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let efficiencyClassEnum = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance = new Module.MotorEfficiency(lineFrequency, motorRPM, efficiencyClassEnum, motorRatedPower);
    //loadFactor hard coded to 1 for nema
    let loadFactor: number = 1;
    let motorEfficiency: number = instance.calculate(loadFactor, efficiency / 100) * 100;
    instance.delete();
    return motorEfficiency;
  }

  //TODO: MOVE TO MOTOR API SERVICE
  motorEfficiency(lineFreq: number, motorRPM: number, efficiencyClass: number, efficiency: number, motorRatedPower: number, loadFactor: number): number {
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let efficiencyClassEnum = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance = new Module.MotorEfficiency(lineFrequency, motorRPM, efficiencyClassEnum, motorRatedPower);
    let motorEfficiency: number = instance.calculate(loadFactor, efficiency / 100) * 100;
    instance.delete();
    return motorEfficiency;
  }

  //TODO: MOVE TO MOTOR API SERVICE
  motorPowerFactor(motorRatedPower: number, loadFactor: number, motorCurrent: number, motorEfficiency: number, ratedVoltage: number): number {
    let instance = new Module.MotorPowerFactor(motorRatedPower, loadFactor, motorCurrent, motorEfficiency, ratedVoltage);
    //comes back from suite as fraction, *100 to get percent
    let powerFactor: number = instance.calculate() * 100;
    instance.delete();
    return powerFactor;
  }

  //TODO: MOVE TO MOTOR API SERVICE
  motorCurrent(motorRatedPower: number, motorRPM: number, lineFreq: number, efficiencyClass: number, specifiedEfficiency: number, loadFactor: number, ratedVoltage: number, fullLoadAmps: number): number {
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let efficiencyClassEnum = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance = new Module.MotorCurrent(motorRatedPower, motorRPM, lineFrequency, efficiencyClassEnum, specifiedEfficiency, loadFactor, ratedVoltage);
    let motorCurrent: number = instance.calculate(fullLoadAmps);
    instance.delete();
    return motorCurrent;
  }
}
