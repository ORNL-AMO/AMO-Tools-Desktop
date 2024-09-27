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
    let calculatedResults = psatWasmModule.calculateExisting();
    let output: PsatOutputs = {
      pump_efficiency: calculatedResults.pump_efficiency,
      motor_rated_power: calculatedResults.motor_rated_power,
      motor_shaft_power: calculatedResults.motor_shaft_power,
      pump_shaft_power: calculatedResults.pump_shaft_power,
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
      percent_annual_savings: calculatedResults.percent_annual_savings,
      co2EmissionsOutput: calculatedResults.co2EmissionsOutput,
    }
    calculatedResults.delete();
    psatWasmModule.delete();
    output = this.convertResultsToPercentages(output);
    return output;
  }

  resultsModified(psatInput: PsatInputs): PsatOutputs {
    let psatWasmModule = this.getPsatModuleFromInputs(psatInput);
    let calculatedResults = psatWasmModule.calculateModified();
    let output: PsatOutputs = {
      pump_efficiency: calculatedResults.pump_efficiency,
      motor_rated_power: calculatedResults.motor_rated_power,
      motor_shaft_power: calculatedResults.motor_shaft_power,
      pump_shaft_power: calculatedResults.pump_shaft_power,
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
      percent_annual_savings: calculatedResults.percent_annual_savings,
      co2EmissionsOutput: calculatedResults.co2EmissionsOutput,
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
    let specifiedMotorEfficiency = psatInput.efficiency;
    let motorRatedVoltage = psatInput.motor_rated_voltage;
    let fullLoadAmps = psatInput.motor_rated_fla;
    // TODO New assessment, no margin. What should default margin be. Applied on backend?
    let sizeMargin = psatInput.margin ? psatInput.margin : 0;
    let motor = new Module.Motor(lineFrequency, motorRatedPower, motorRpm, efficiencyClass, specifiedMotorEfficiency, motorRatedVoltage, fullLoadAmps, sizeMargin);

    let flowRate = psatInput.flow_rate;
    let head = psatInput.head;
    let loadEstimationMethod = this.suiteApiHelperService.getLoadEstimationMethod(psatInput.load_estimation_method);
    let motorPower = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_power);
    let motorAmps = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_current);
    let voltage = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.motor_field_voltage);
    let operating_hours = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.operating_hours);
    let cost_kw_hour = this.suiteApiHelperService.convertNullInputValueForObjectConstructor(psatInput.cost_kw_hour);
    let fieldData = new Module.PumpFieldData(flowRate, head, loadEstimationMethod, motorPower, motorAmps, voltage);
    let psat = new Module.PSAT(pumpInput, motor, fieldData, operating_hours, cost_kw_hour);
    fieldData.delete();
    motor.delete();
    pumpInput.delete();
    return psat;
  }

  //calculators
  headToolSuctionTank(specificGravity: number, flowRate: number, suctionPipeDiameter: number, suctionTankGasOverPressure: number, suctionTankFluidSurfaceElevation: number, suctionLineLossCoefficients: number, dischargePipeDiameter: number, dischargeGaugePressure: number, dischargeGaugeElevation: number, dischargeLineLossCoefficients: number): HeadToolResults {
    let instance = new Module.HeadToolSuctionTank(specificGravity, flowRate, suctionPipeDiameter, suctionTankGasOverPressure, suctionTankFluidSurfaceElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let headToolSuctionTankResults = instance.calculate();
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
    let instance = new Module.HeadTool(specificGravity, flowRate, suctionPipeDiameter, suctionGaugePressure, suctionGaugeElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let headToolResults = instance.calculate();
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
    let pumpStyleEnum = this.suiteApiHelperService.getPumpStyleEnum(pumpStyle);
    let instance = new Module.OptimalSpecificSpeedCorrection(pumpStyleEnum, specificSpeed);
    let results: number = instance.calculate() * 100;
    instance.delete();
    return results;
  }

  pumpEfficiency(pumpStyle: number, flowRate: number): { average: number, max: number } {
    let pumpStyleEnum = this.suiteApiHelperService.getPumpStyleEnum(pumpStyle);
    let instance = new Module.PumpEfficiency(pumpStyleEnum, flowRate);
    let pumpEfficiency = instance.calculate();
    let results: { average: number, max: number } = {
      average: pumpEfficiency.average,
      max: pumpEfficiency.max
    };
    pumpEfficiency.delete();
    instance.delete();
    return results;
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
    let tmpResults = instance.calculate();
    let results: MotorPerformanceResults = {
      efficiency: tmpResults.efficiency,
      current: tmpResults.current,
      powerFactor: tmpResults.powerFactor

    }
    tmpResults.delete();
    instance.delete();
    return results;
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
    let motorCurrent: number = instance.calculateCurrent(fullLoadAmps);
    instance.delete();
    return motorCurrent;
  }
}
