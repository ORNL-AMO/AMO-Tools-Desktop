import { Injectable } from '@angular/core';
import { MotorPerformanceResults } from '../calculator/motors/motor-performance/motor-performance.service';
import { HeadToolResults } from '../shared/models/calculators';
import { PsatInputs, PsatOutputs } from '../shared/models/psat';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type ExistingPumpResultInput,
  type EstimateFLA,
  type LineFrequency,
  type ModifiedPumpResultInput,
  type MotorCurrent,
  type MotorEfficiency as SuiteMotorEfficiency,
  type MotorEfficiencyClass,
  type MotorPerformance,
  type MotorPerformanceOutput,
  type MotorPowerFactor,
  type PumpEfficiency as SuitePumpEfficiency,
  type PumpEfficiencyResults,
  type PumpHeadResult,
  type PumpHeadSuctionGaugeInput,
  type PumpHeadSuctionTankInput,
  type PumpResultOutput,
  type PumpResultSystemInput,
  type PumpStyle,
  type OptimalSpecificSpeedCorrection,
} from 'measur-tools-suite';

@Injectable()
export class PumpsSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  //results
  resultsExisting(psatInput: PsatInputs): PsatOutputs {
    const input: ExistingPumpResultInput = this.getExistingPumpResultInput(psatInput);
    const result: PumpResultOutput = this.toolsSuiteApiService.ToolsSuiteModule.calculateExistingPumpResult(input);
    return this.mapPumpResultOutput(result);
  }

  resultsModified(psatInput: PsatInputs): PsatOutputs {
    const input: ModifiedPumpResultInput = this.getModifiedPumpResultInput(psatInput);
    const result: PumpResultOutput = this.toolsSuiteApiService.ToolsSuiteModule.calculateModifiedPumpResult(input);
    return this.mapPumpResultOutput(result);
  }

  private mapPumpResultOutput(result: PumpResultOutput): PsatOutputs {
    const output: PsatOutputs = {
      pump_efficiency: result.pumpEfficiency,
      motor_rated_power: result.motorRatedPower,
      motor_shaft_power: result.motorShaftPower,
      mover_shaft_power: result.moverShaftPower,
      motor_efficiency: result.motorEfficiency,
      motor_power_factor: result.motorPowerFactor,
      motor_current: result.motorCurrent,
      motor_power: result.motorPower,
      load_factor: result.loadFactor,
      drive_efficiency: result.driveEfficiency,
      annual_energy: result.annualEnergy,
      annual_cost: result.annualCost,
      annual_savings_potential: 0,
      optimization_rating: 0,
      percent_annual_savings: undefined,
      co2EmissionsOutput: undefined,
    };
    return this.convertResultsToPercentages(output);
  }

  convertResultsToPercentages(calculatedResults: PsatOutputs): PsatOutputs {
    calculatedResults.pump_efficiency = calculatedResults.pump_efficiency * 100;
    calculatedResults.motor_efficiency = calculatedResults.motor_efficiency * 100;
    calculatedResults.motor_power_factor = calculatedResults.motor_power_factor * 100;
    calculatedResults.drive_efficiency = calculatedResults.drive_efficiency * 100;
    calculatedResults.annual_cost = calculatedResults.annual_cost * 1000;
    return calculatedResults;
  }

  private getExistingPumpResultInput(psatInput: PsatInputs): ExistingPumpResultInput {
    return {
      system: this.getPumpResultSystemInput(psatInput),
      motorFullLoadAmps: psatInput.motor_rated_fla,
      loadEstimationMethod: this.suiteApiHelperService.getLoadEstimationMethod(psatInput.load_estimation_method),
      measuredMotorPower: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_power),
      measuredMotorCurrent: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_current),
    };
  }

  private getModifiedPumpResultInput(psatInput: PsatInputs): ModifiedPumpResultInput {
    return {
      system: this.getPumpResultSystemInput(psatInput),
      pumpEfficiency: psatInput.pump_specified / 100,
    };
  }

  private getPumpResultSystemInput(psatInput: PsatInputs): PumpResultSystemInput {
    return {
      pumpStyle: this.suiteApiHelperService.getPumpStyleEnum(psatInput.pump_style),
      drive: this.suiteApiHelperService.getDriveEnum(psatInput.drive),
      specifiedDriveEfficiency: psatInput.specifiedDriveEfficiency / 100,
      specificGravity: psatInput.specific_gravity,
      flowRate: psatInput.flow_rate,
      head: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.head),
      differentialPressure: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.differentialPressure),
      motorRatedPower: psatInput.motor_rated_power,
      motorRatedSpeed: psatInput.motor_rated_speed,
      lineFrequency: this.suiteApiHelperService.getLineFrequencyEnum(psatInput.line_frequency),
      motorEfficiencyClass: this.suiteApiHelperService.getMotorEfficiencyEnum(psatInput.efficiency_class),
      specifiedMotorEfficiency: psatInput.efficiency / 100,
      motorRatedVoltage: psatInput.motor_rated_voltage,
      operatingVoltage: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_voltage),
      operatingHours: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.operating_hours),
      unitCost: this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.cost_kw_hour),
    };
  }

  //calculators
  headToolSuctionTank(specificGravity: number, flowRate: number, suctionPipeDiameter: number, suctionTankGasOverPressure: number, suctionTankFluidSurfaceElevation: number, suctionLineLossCoefficients: number, dischargePipeDiameter: number, dischargeGaugePressure: number, dischargeGaugeElevation: number, dischargeLineLossCoefficients: number): HeadToolResults {
    let input: PumpHeadSuctionTankInput = {
      specificGravity: specificGravity,
      flowRate: flowRate,
      suctionPipeDiameter: suctionPipeDiameter,
      suctionTankGasOverPressure: suctionTankGasOverPressure,
      suctionTankFluidSurfaceElevation: suctionTankFluidSurfaceElevation,
      suctionLineLossCoefficients: suctionLineLossCoefficients,
      dischargePipeDiameter: dischargePipeDiameter,
      dischargeGaugePressure: dischargeGaugePressure,
      dischargeGaugeElevation: dischargeGaugeElevation,
      dischargeLineLossCoefficients: dischargeLineLossCoefficients
    };
    let headToolSuctionTankResults: PumpHeadResult = this.toolsSuiteApiService.ToolsSuiteModule.calculatePumpHeadFromSuctionTank(input);
    let results: HeadToolResults = {
      differentialElevationHead: headToolSuctionTankResults.differentialElevationHead,
      differentialPressureHead: headToolSuctionTankResults.differentialPressureHead,
      differentialVelocityHead: headToolSuctionTankResults.differentialVelocityHead,
      estimatedSuctionFrictionHead: headToolSuctionTankResults.estimatedSuctionFrictionHead,
      estimatedDischargeFrictionHead: headToolSuctionTankResults.estimatedDischargeFrictionHead,
      pumpHead: headToolSuctionTankResults.pumpHead
    };
    return results;
  }

  headTool(specificGravity: number, flowRate: number, suctionPipeDiameter: number, suctionGaugePressure: number, suctionGaugeElevation: number, suctionLineLossCoefficients: number, dischargePipeDiameter: number, dischargeGaugePressure: number, dischargeGaugeElevation: number, dischargeLineLossCoefficients: number): HeadToolResults {
    let input: PumpHeadSuctionGaugeInput = {
      specificGravity: specificGravity,
      flowRate: flowRate,
      suctionPipeDiameter: suctionPipeDiameter,
      suctionGaugePressure: suctionGaugePressure,
      suctionGaugeElevation: suctionGaugeElevation,
      suctionLineLossCoefficients: suctionLineLossCoefficients,
      dischargePipeDiameter: dischargePipeDiameter,
      dischargeGaugePressure: dischargeGaugePressure,
      dischargeGaugeElevation: dischargeGaugeElevation,
      dischargeLineLossCoefficients: dischargeLineLossCoefficients
    };
    let headToolResults: PumpHeadResult = this.toolsSuiteApiService.ToolsSuiteModule.calculatePumpHeadFromSuctionGauge(input);
    let results: HeadToolResults = {
      differentialElevationHead: headToolResults.differentialElevationHead,
      differentialPressureHead: headToolResults.differentialPressureHead,
      differentialVelocityHead: headToolResults.differentialVelocityHead,
      estimatedSuctionFrictionHead: headToolResults.estimatedSuctionFrictionHead,
      estimatedDischargeFrictionHead: headToolResults.estimatedDischargeFrictionHead,
      pumpHead: headToolResults.pumpHead
    };
    return results;
  }

  achievableEfficiency(pumpStyle: number, specificSpeed: number): number {
    let pumpStyleEnum: PumpStyle = this.suiteApiHelperService.getPumpStyleEnum(pumpStyle);
    let instance: OptimalSpecificSpeedCorrection = new this.toolsSuiteApiService.ToolsSuiteModule.OptimalSpecificSpeedCorrection(pumpStyleEnum, specificSpeed);
    let results: number = instance.calculate() * 100;
    instance.delete();
    return results;
  }

  pumpEfficiency(pumpStyle: number,
      flowRate: number,
      rpm: number,
      kinematicViscosity: number,
      stageCount: number,
      head: number,
      pumpEfficiencyInput: number): { average: number, max: number } {
    let pumpStyleEnum: PumpStyle = this.suiteApiHelperService.getPumpStyleEnum(pumpStyle);
    let instance: SuitePumpEfficiency = new this.toolsSuiteApiService.ToolsSuiteModule.PumpEfficiency(pumpStyleEnum, pumpEfficiencyInput, rpm, kinematicViscosity, stageCount, flowRate, head);
    let pumpEfficiency: PumpEfficiencyResults = instance.calculate();
    let results: { average: number, max: number } = {
      average: pumpEfficiency.average,
      max: pumpEfficiency.max
    };
    pumpEfficiency.delete();
    instance.delete();
    return results;
  }

  estimateFla(motorRatedPower: number, motorRPM: number, frequency: number, efficiencyClass: number, efficiencyPercent: number, motorVoltage: number): number {
    let lineFrequency: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(frequency);
    let motorEfficiencyEnum: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let efficiency: number = efficiencyPercent / 100;
    let instance: EstimateFLA = new this.toolsSuiteApiService.ToolsSuiteModule.EstimateFLA(motorRatedPower, motorRPM, lineFrequency, motorEfficiencyEnum, efficiency, motorVoltage);
    let estimatedFLA: number = instance.getEstimatedFLA();
    instance.delete();
    return estimatedFLA;
  }

  motorPerformance(lineFreq: number, efficiencyClass: number, motorRatedPower: number, motorRPM: number, specifiedEfficiency: number, motorRatedVoltage: number, fullLoadAmps: number, loadFactor: number): MotorPerformanceResults {
    let lineFrequency: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let motorEfficiencyClass: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance: MotorPerformance = new this.toolsSuiteApiService.ToolsSuiteModule.MotorPerformance(lineFrequency, motorRPM, motorEfficiencyClass, motorRatedPower, specifiedEfficiency, loadFactor, motorRatedVoltage, fullLoadAmps);
    let tmpResults: MotorPerformanceOutput = instance.calculate();
    let results: MotorPerformanceResults = {
      efficiency: tmpResults.efficiency,
      current: tmpResults.current,
      powerFactor: tmpResults.powerFactor

    }
    tmpResults.delete();
    instance.delete();
    return results;
  }

  nema(lineFreq: number, motorRPM: number, efficiencyClass: number, efficiency: number, motorRatedPower: number): number {
    let lineFrequency: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let efficiencyClassEnum: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance: SuiteMotorEfficiency = new this.toolsSuiteApiService.ToolsSuiteModule.MotorEfficiency(lineFrequency, motorRPM, efficiencyClassEnum, motorRatedPower);
    //loadFactor hard coded to 1 for nema
    let loadFactor: number = 1;
    let motorEfficiency: number = instance.calculate(loadFactor, efficiency / 100) * 100;
    instance.delete();
    return motorEfficiency;
  }

  /**
 * motorEfficiency
 *
 * @param {number} efficiencyPercent - as percent
 * @param {number} loadFactorPercent - as percent
 * @returns {number} motorEfficiency (as percent)
 */
  motorEfficiency(lineFreq: number, motorRPM: number, efficiencyClass: number, efficiencyPercent: number, motorRatedPower: number, loadFactorPercent: number): number {
    let lineFrequency: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let efficiencyClassEnum: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance: SuiteMotorEfficiency = new this.toolsSuiteApiService.ToolsSuiteModule.MotorEfficiency(lineFrequency, motorRPM, efficiencyClassEnum, motorRatedPower);
    
    let efficiency: number = efficiencyPercent / 100;
    // * if efficiency class 0,1,2 (Standard, EE, Prem), efficiency input is not used and result is returned in decimal
    let motorEfficiency: number = instance.calculate(loadFactorPercent / 100, efficiency);
    motorEfficiency = motorEfficiency * 100;
    instance.delete();
    return motorEfficiency;
  }

  
  /**
 * motorPowerFactor
 *
 * @param {number} loadFactorPercent - as percent
 * @param {number} motorEfficiencyPercent - as percent
 * @returns {number} motorEfficiency (as percent)
 */
  motorPowerFactor(motorRatedPower: number, loadFactorPercent: number, motorCurrent: number, motorEfficiencyPercent: number, ratedVoltage: number): number {
    // * will be incorrect if incorrect estimated efficiency values are generated
    let instance: MotorPowerFactor = new this.toolsSuiteApiService.ToolsSuiteModule.MotorPowerFactor(motorRatedPower, loadFactorPercent / 100, motorCurrent, motorEfficiencyPercent / 100, ratedVoltage);
    let powerFactor: number = instance.calculate();
    powerFactor = powerFactor* 100;
    instance.delete();
    return powerFactor;
  }


    /**
 * motorPowerFactor
 *
 * @param {number} loadFactorPercent - as percent
 * @param {number} specifiedEfficiencyPercent - as percent
 * @returns {number} motorCurrent in amps
 */
  motorCurrent(motorRatedPower: number, motorRPM: number, lineFreq: number, efficiencyClass: number, specifiedEfficiencyPercent: number, loadFactorPercent: number, ratedVoltage: number, fullLoadAmps: number): number {
    let lineFrequency: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(lineFreq);
    let efficiencyClassEnum: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(efficiencyClass);
    let instance: MotorCurrent = new this.toolsSuiteApiService.ToolsSuiteModule.MotorCurrent(motorRatedPower, motorRPM, lineFrequency, efficiencyClassEnum, specifiedEfficiencyPercent, loadFactorPercent / 100, ratedVoltage);
    let motorCurrent: number = instance.calculateCurrent(fullLoadAmps);
    instance.delete();
    return motorCurrent;
  }
}
