import { Injectable } from '@angular/core';
import { MotorPerformanceResults } from '../calculator/motors/motor-performance/motor-performance.service';
import { HeadToolResults } from '../shared/models/calculators';
import { PsatInputs, PsatOutputs } from '../shared/models/psat';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import {
  type Drive,
  type EstimateFLA,
  type HeadTool,
  type HeadToolOutput,
  type HeadToolSuctionTank,
  type LineFrequency,
  type LoadEstimationMethod,
  type Motor,
  type MotorCurrent,
  type MotorEfficiency as SuiteMotorEfficiency,
  type MotorEfficiencyClass,
  type MotorPerformance,
  type MotorPerformanceOutput,
  type MotorPowerFactor,
  type PumpEfficiency as SuitePumpEfficiency,
  type PumpEfficiencyResults,
  type PumpFieldData,
  type PumpResult,
  type PumpResultInput,
  type PumpResults,
  type PumpStyle,
  type SpecificSpeed,
  type OptimalSpecificSpeedCorrection,
} from 'measur-tools-suite';

@Injectable()
export class PumpsSuiteApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private toolsSuiteApiService: ToolsSuiteApiService
  ) { }

  //results
  resultsExisting(psatInput: PsatInputs): PsatOutputs {
    let psatWasmModule: PumpResult = this.getPsatModuleFromInputs(psatInput);
    let calculatedResults: PumpResults = psatWasmModule.calculateExisting();
    let output: PsatOutputs = {
      pump_efficiency: calculatedResults.pump_efficiency,
      motor_rated_power: calculatedResults.motor_rated_power,
      motor_shaft_power: calculatedResults.motor_shaft_power,
      mover_shaft_power: calculatedResults.mover_shaft_power,
      motor_efficiency: calculatedResults.motor_efficiency,
      motor_power_factor: calculatedResults.motor_power_factor,
      motor_current: calculatedResults.motor_current,
      motor_power: calculatedResults.motor_power,
      load_factor: calculatedResults.load_factor,
      drive_efficiency: calculatedResults.drive_efficiency,
      annual_energy: calculatedResults.annual_energy,
      annual_cost: calculatedResults.annual_cost,
      annual_savings_potential: psatWasmModule.getAnnualSavingsPotential() * 1000,
      optimization_rating: psatWasmModule.getOptimizationRating(),
      percent_annual_savings: undefined,
      co2EmissionsOutput: undefined,
    }

    calculatedResults.delete();
    psatWasmModule.delete();
    output = this.convertResultsToPercentages(output);
    return output;
  }

  resultsModified(psatInput: PsatInputs): PsatOutputs {
    let psatWasmModule: PumpResult = this.getPsatModuleFromInputs(psatInput);
    let calculatedResults: PumpResults = psatWasmModule.calculateModified();
    let output: PsatOutputs = {
      pump_efficiency: calculatedResults.pump_efficiency,
      motor_rated_power: calculatedResults.motor_rated_power,
      motor_shaft_power: calculatedResults.motor_shaft_power,
      mover_shaft_power: calculatedResults.mover_shaft_power,
      motor_efficiency: calculatedResults.motor_efficiency,
      motor_power_factor: calculatedResults.motor_power_factor,
      motor_current: calculatedResults.motor_current,
      motor_power: calculatedResults.motor_power,
      load_factor: calculatedResults.load_factor,
      drive_efficiency: calculatedResults.drive_efficiency,
      annual_energy: calculatedResults.annual_energy,
      annual_cost: calculatedResults.annual_cost,
      annual_savings_potential: psatWasmModule.getAnnualSavingsPotential() * 1000,
      optimization_rating: psatWasmModule.getOptimizationRating(),
      percent_annual_savings: undefined,
      co2EmissionsOutput: undefined,
    }
    calculatedResults.delete();
    psatWasmModule.delete();
    output = this.convertResultsToPercentages(output);
    return output;
  }

  convertResultsToPercentages(calculatedResults: PsatOutputs): PsatOutputs {
    calculatedResults.pump_efficiency = calculatedResults.pump_efficiency * 100;
    calculatedResults.motor_efficiency = calculatedResults.motor_efficiency * 100;
    calculatedResults.motor_power_factor = calculatedResults.motor_power_factor * 100;
    calculatedResults.drive_efficiency = calculatedResults.drive_efficiency * 100;
    calculatedResults.annual_cost = calculatedResults.annual_cost * 1000;
    return calculatedResults;
  }

  getPsatModuleFromInputs(psatInput: PsatInputs): PumpResult {
    let pumpStyle: PumpStyle = this.suiteApiHelperService.getPumpStyleEnum(psatInput.pump_style);
    let pumpEfficiency: number = psatInput.pump_specified / 100;
    let rpm: number = psatInput.motor_rated_speed;
    let drive: Drive = this.suiteApiHelperService.getDriveEnum(psatInput.drive);
    let kviscosity: number = psatInput.kinematic_viscosity;
    let specificGravity: number = psatInput.specific_gravity;
    let stageCount: number = psatInput.stages;
    let speed: SpecificSpeed = this.suiteApiHelperService.getFixedSpeedEnum(psatInput.fixed_speed);
    let specifiedDriveEfficiency: number = psatInput.specifiedDriveEfficiency / 100;
    let pumpInput: PumpResultInput = new this.toolsSuiteApiService.ToolsSuiteModule.PumpResultInput(pumpStyle, pumpEfficiency, rpm, drive, kviscosity, specificGravity, stageCount, speed, specifiedDriveEfficiency);
    //motor
    let lineFrequency: LineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(psatInput.line_frequency);
    let motorRatedPower: number = psatInput.motor_rated_power;
    let motorRpm: number = psatInput.motor_rated_speed;
    let efficiencyClass: MotorEfficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(psatInput.efficiency_class);
    let specifiedMotorEfficiency: number = psatInput.efficiency / 100;
    let motorRatedVoltage: number = psatInput.motor_rated_voltage;
    let fullLoadAmps: number = psatInput.motor_rated_fla;
    // TODO New assessment, no margin. What should default margin be. Applied on backend?
    let sizeMargin: number = psatInput.margin ? psatInput.margin : 0;
    let motor: Motor = new this.toolsSuiteApiService.ToolsSuiteModule.Motor(lineFrequency, motorRatedPower, motorRpm, efficiencyClass, specifiedMotorEfficiency, motorRatedVoltage, fullLoadAmps, sizeMargin);

    let flowRate: number = psatInput.flow_rate;
    let head: number = psatInput.head;
    let loadEstimationMethod: LoadEstimationMethod = this.suiteApiHelperService.getLoadEstimationMethod(psatInput.load_estimation_method);
    let motorPower: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_power);
    let motorAmps: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_current);
    let voltage: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_voltage);
    let operating_hours: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.operating_hours);
    let cost_kw_hour: number = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.cost_kw_hour);
    let fieldData: PumpFieldData = new this.toolsSuiteApiService.ToolsSuiteModule.PumpFieldData(flowRate, head, loadEstimationMethod, motorPower, motorAmps, voltage);
    let psat: PumpResult = new this.toolsSuiteApiService.ToolsSuiteModule.PumpResult(pumpInput, motor, fieldData, operating_hours, cost_kw_hour);
    fieldData.delete();
    motor.delete();
    pumpInput.delete();
    return psat;
  }

  //calculators
  headToolSuctionTank(specificGravity: number, flowRate: number, suctionPipeDiameter: number, suctionTankGasOverPressure: number, suctionTankFluidSurfaceElevation: number, suctionLineLossCoefficients: number, dischargePipeDiameter: number, dischargeGaugePressure: number, dischargeGaugeElevation: number, dischargeLineLossCoefficients: number): HeadToolResults {
    let instance: HeadToolSuctionTank = new this.toolsSuiteApiService.ToolsSuiteModule.HeadToolSuctionTank(specificGravity, flowRate, suctionPipeDiameter, suctionTankGasOverPressure, suctionTankFluidSurfaceElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let headToolSuctionTankResults: HeadToolOutput = instance.calculate();
    let results: HeadToolResults = {
      differentialElevationHead: headToolSuctionTankResults.differentialElevationHead,
      differentialPressureHead: headToolSuctionTankResults.differentialPressureHead,
      differentialVelocityHead: headToolSuctionTankResults.differentialVelocityHead,
      estimatedSuctionFrictionHead: headToolSuctionTankResults.estimatedSuctionFrictionHead,
      estimatedDischargeFrictionHead: headToolSuctionTankResults.estimatedDischargeFrictionHead,
      pumpHead: headToolSuctionTankResults.pumpHead
    }
    headToolSuctionTankResults.delete();
    instance.delete();
    return results;
  }

  headTool(specificGravity: number, flowRate: number, suctionPipeDiameter: number, suctionGaugePressure: number, suctionGaugeElevation: number, suctionLineLossCoefficients: number, dischargePipeDiameter: number, dischargeGaugePressure: number, dischargeGaugeElevation: number, dischargeLineLossCoefficients: number): HeadToolResults {
    let instance: HeadTool = new this.toolsSuiteApiService.ToolsSuiteModule.HeadTool(specificGravity, flowRate, suctionPipeDiameter, suctionGaugePressure, suctionGaugeElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let headToolResults: HeadToolOutput = instance.calculate();
    let results: HeadToolResults = {
      differentialElevationHead: headToolResults.differentialElevationHead,
      differentialPressureHead: headToolResults.differentialPressureHead,
      differentialVelocityHead: headToolResults.differentialVelocityHead,
      estimatedSuctionFrictionHead: headToolResults.estimatedSuctionFrictionHead,
      estimatedDischargeFrictionHead: headToolResults.estimatedDischargeFrictionHead,
      pumpHead: headToolResults.pumpHead
    }
    headToolResults.delete();
    instance.delete();
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
