import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PsatService } from './psat.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { PSAT } from '../shared/models/psat';
import { fluidProperties } from './psatConstants';

@Injectable()
export class PsatWarningService {

  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }
  //FIELD DATA
  checkFieldData(psat: PSAT, settings: Settings, baseline?: boolean): FieldDataWarnings {
    let flowError = this.checkFlowRate(psat.inputs.pump_style, psat.inputs.flow_rate, settings);
    let voltageError = this.checkVoltage(psat);
    let costError = this.checkCost(psat);
    let opFractionError = this.checkOpFraction(psat);
    let ratedPowerError = null;
    if (baseline && psat.inputs.load_estimation_method == 0) {
      ratedPowerError = this.checkRatedPower(psat);
    }
    let marginError = this.checkMargin(psat);
    let headError = this.checkHead(psat);
    return {
      flowError: flowError,
      voltageError: voltageError,
      costError: costError,
      opFractionError: opFractionError,
      ratedPowerError: ratedPowerError,
      marginError: marginError,
      headError: headError
    }
  }

  checkFlowRate(pumpStyle: number, flowRate: number, settings: Settings) {
    let tmpFlowRate: number;
    //convert
    if (settings.flowMeasurement != 'gpm') {
      tmpFlowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    } else {
      tmpFlowRate = flowRate;
    }
    //get min max
    let flowRateRange = this.getFlowRateMinMax(pumpStyle);
    //check in range
    if (tmpFlowRate >= flowRateRange.min && tmpFlowRate <= flowRateRange.max) {
      return null;
    } else if (tmpFlowRate < flowRateRange.min) {
      return 'Flow rate is too small for selected pump style, should be greater than ' + flowRateRange.min;
    } else if (tmpFlowRate > flowRateRange.max) {
      return 'Flow rate is too large for selected pump style, should be less than ' + flowRateRange.max;
    } else {
      return null;
    }
  }

  getFlowRateMinMax(pumpStyle: number): { min: number, max: number } {
    //min/max values from Daryl
    let flowRate = {
      min: 1,
      max: 10000000000000000000
    }
    if (pumpStyle == 0) {
      flowRate.min = 100;
      flowRate.max = 20000;
      return flowRate;
    }
    else if (pumpStyle == 1 || pumpStyle == 3) {
      flowRate.min = 100;
      flowRate.max = 22500;
      return flowRate;
    } else if (pumpStyle == 2 || pumpStyle == 4) {
      flowRate.min = 400;
      flowRate.max = 22000;
      return flowRate;
    } else if (pumpStyle == 5) {
      flowRate.min = 100;
      flowRate.max = 4000;
      return flowRate;
    } else if (pumpStyle == 6) {
      flowRate.min = 100;
      flowRate.max = 5000;
      return flowRate;
    } else if (pumpStyle == 10) {
      flowRate.min = 5000;
      flowRate.max = 100000;
      return flowRate;
    } else if (pumpStyle == 8) {
      flowRate.min = 200;
      flowRate.max = 100000;
      return flowRate;
    } else if (pumpStyle == 7 || pumpStyle == 9) {
      flowRate.min = 200;
      flowRate.max = 40000;
      return flowRate;
    } else {
      return flowRate;
    }
  }

  checkVoltage(psat: PSAT) {
    if (psat.inputs.motor_field_voltage < 1) {
      return "Voltage shouldn't be less than 1 V";
    } else if (psat.inputs.motor_field_voltage > 13800) {
      return "Voltage shouldn't be greater than 13800 V";
    } else {
      return null;
    }
  }
  //REQUIRED?
  checkCost(psat: PSAT) {
    if (psat.inputs.cost_kw_hour < 0) {
      return 'Should not have negative cost';
    } else if (psat.inputs.cost_kw_hour > 1) {
      return "Cost shouldn't be greater than 1";
    } else {
      return null;
    }
  }

  checkRatedPower(psat: PSAT) {
    let tmpVal: number;
    if (psat.inputs.load_estimation_method == 0) {
      tmpVal = psat.inputs.motor_field_power;
    } else {
      tmpVal = psat.inputs.motor_field_current;
    }
    if (psat.inputs.motor_rated_power && tmpVal) {
      let val, compare;
      val = tmpVal;
      compare = psat.inputs.motor_rated_power;
      compare = compare * 1.5;
      if (val > compare) {
        return 'The Field Data Motor Power is too high compared to the Rated Motor Power, please adjust the input values.';
      } else {
        return null
      }
    } else {
      return null;
    }
  }
  //REQUIRED?
  checkMargin(psat: PSAT) {
    if (psat.inputs.margin > 100) {
      return "Unrealistic size margin, shouldn't be greater then 100%";
    } else if (psat.inputs.margin < 0) {
      return "Shouldn't have negative size margin";
    } else {
      return null;
    }
  }
  //REQUIRED?
  checkOpFraction(psat: PSAT) {
    if (psat.inputs.operating_fraction > 1) {
      return 'Operating fraction needs to be between 0 - 1';
    } else if (psat.inputs.operating_fraction < 0) {
      return "Cannot have negative operating fraction";
    } else {
      return null;
    }
  }

  //REQUIRED?
  checkHead(psat: PSAT) {
    if (psat.inputs.head < 0) {
      return 'Head cannot be negative';
    } else {
      return null;
    }
  }

  //MOTOR
  checkMotorWarnings(psat: PSAT, settings: Settings): MotorWarnings {
    let rpmError = this.checkMotorRpm(psat);
    let voltageError = this.checkMotorVoltage(psat);
    let flaError = this.checkFLA(psat, settings);
    let ratedPowerError = this.checkMotorRatedPower(psat, settings);
    let efficiencyError = null;
    if(psat.inputs.efficiency_class == 3){
      efficiencyError = this.checkEfficiency(psat);
    }
    return {
      rpmError: rpmError,
      voltageError: voltageError,
      flaError: flaError,
      efficiencyError: efficiencyError,
      ratedPowerError: ratedPowerError
    }
  }

  checkMotorRpm(psat: PSAT) {
    let range: { min: number, max: number } = this.getMotorRpmMinMax(psat.inputs.line_frequency, psat.inputs.efficiency_class)
    if (psat.inputs.motor_rated_speed < range.min) {
      return 'Motor RPM too small for selected efficiency class';
    } else if (psat.inputs.motor_rated_speed > range.max) {
      return 'Motor RPM too large for selected efficiency class';
    } else {
      return null;
    }
  }
  getMotorRpmMinMax(lineFreqEnum: number, effClass: number): { min: number, max: number } {
    let rpmRange = {
      min: 1,
      max: 3600
    }
    if (lineFreqEnum == 0 && (effClass == 0 || effClass == 1)) { // if 60Hz and Standard or Energy Efficiency
      rpmRange.min = 540;
      rpmRange.max = 3600;
    } else if (lineFreqEnum == 1 && (effClass == 0 || effClass == 1)) { // if 50Hz and Standard or Energy Efficiency
      rpmRange.min = 450;
      rpmRange.max = 3300;
    } else if (lineFreqEnum == 0 && effClass == 2) { // if 60Hz and Premium Efficiency
      rpmRange.min = 1080;
      rpmRange.max = 3600;
    } else if (lineFreqEnum == 1 && effClass == 2) { // if 50Hz and Premium Efficiency
      rpmRange.min = 900;
      rpmRange.max = 3000;
    }
    return rpmRange;
  }

  checkMotorVoltage(psat: PSAT) {
    if (psat.inputs.motor_rated_voltage < 208) {
      return "Voltage should be greater than 208 V."
    } else if (psat.inputs.motor_rated_voltage > 15180) {
      return "Voltage should be less than 15180 V.";
    } else {
      return null;
    }
  }

  checkMotorRatedPower(psat: PSAT, settings: Settings) {
    let motorFieldPower;
    if (psat.inputs.load_estimation_method == 0) {
      motorFieldPower = psat.inputs.motor_field_power;
    } else {
      motorFieldPower = psat.inputs.motor_field_current;
    }
    if (motorFieldPower && psat.inputs.motor_rated_power) {
      let val, compare;
      if (settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(psat.inputs.motor_rated_power).from(settings.powerMeasurement).to('kW');
        compare = this.convertUnitsService.value(motorFieldPower).from(settings.powerMeasurement).to('kW');
      } else {
        val = psat.inputs.motor_rated_power;
        compare = motorFieldPower;
      }
      val = val * 1.5;
      if (compare > val) {
        return 'The Field Data Motor Power is too high compared to the Rated Motor Power, please adjust the input values.';
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  checkFLA(psat: PSAT, settings: Settings) {
    if (
      psat.inputs.motor_rated_power &&
      psat.inputs.motor_rated_speed &&
      psat.inputs.line_frequency &&
      psat.inputs.efficiency_class &&
      psat.inputs.efficiency &&
      psat.inputs.motor_rated_voltage
    ) {
      let estEfficiency = this.psatService.estFLA(
        psat.inputs.motor_rated_power,
        psat.inputs.motor_rated_speed,
        this.psatService.getLineFreqFromEnum(psat.inputs.line_frequency),
        this.psatService.getEfficiencyClassFromEnum(psat.inputs.efficiency_class),
        psat.inputs.efficiency,
        psat.inputs.motor_rated_voltage,
        settings
      );
      this.psatService.flaRange.flaMax = estEfficiency * 1.05;
      this.psatService.flaRange.flaMin = estEfficiency * .95;
      if (psat.inputs.motor_rated_fla < this.psatService.flaRange.flaMin) {
        return 'Value should be greater than ' + Math.round(this.psatService.flaRange.flaMin);
      } else if (psat.inputs.motor_rated_fla > this.psatService.flaRange.flaMax) {
        return 'Value should be less than ' + Math.round(this.psatService.flaRange.flaMax);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  //REQUIRED?
  checkEfficiency(psat: PSAT) {
    if (psat.inputs.efficiency > 100) {
      return "Unrealistic efficiency, shouldn't be greater then 100%";
    }
    else if (psat.inputs.efficiency == 0) {
      return "Cannot have 0% efficiency";
    }
    else if (psat.inputs.efficiency < 0) {
      return "Cannot have negative efficiency";
    }
    else {
      return null;
    }
  }


  //Pump Fluid
  checkPumpFluidWarnings(psat: PSAT, settings: Settings): { rpmError: string, temperatureError: string, pumpEfficiencyError: string } {
    let rpmError = this.checkPumpRpm(psat);
    let temperatureError = this.checkTemperatureError(psat, settings);
    let pumpEfficiencyError = null;
    if(psat.inputs.pump_style == 11){
      pumpEfficiencyError = this.checkPumpEfficiency(psat);
    }
    return {
      rpmError: rpmError,
      temperatureError: temperatureError,
      pumpEfficiencyError: pumpEfficiencyError
    }
  }

  checkPumpRpm(psat: PSAT): string {
    let min = 1;
    let max = 0;
    if (psat.inputs.drive == 0) {
      min = 540;
      max = 3960;
    } else {
      // TODO UPDATE WITH BELT DRIVE VALS
      max = Infinity;
    }
    if (psat.inputs.pump_rated_speed < min) {
      return 'Pump Speed should be greater than' + min + ' rpm';
    } else if (psat.inputs.pump_rated_speed > max) {
      return 'Pump Speed should be greater than ' + max + ' rpm';
    } else {
      return null;
    }
  }

  checkTemperatureError(psat: PSAT, settings: Settings): string {
    let property = fluidProperties[psat.inputs.fluidType];
    let tempUnit: string;
    if (settings.temperatureMeasurement == 'C') {
      tempUnit = '&#8451;';
    } else if (settings.temperatureMeasurement == 'F') {
      tempUnit = '&#8457;';
    } else if (settings.temperatureMeasurement == 'K') {
      tempUnit = '&#8490;';
    } else if (settings.temperatureMeasurement == 'R') {
      tempUnit = '&#176;R';
    }
    let maxTemp = this.convertUnitsService.value(212.0).from('F').to(settings.temperatureMeasurement);
    let minTemp = this.convertUnitsService.value(32.0).from('F').to(settings.temperatureMeasurement);
    if (psat.inputs.fluidType == 'Water') {
      if (psat.inputs.fluidTemperature > maxTemp) {
        return "Warning: Fluid Temperature is greater than the boiling point (" + maxTemp + " " + tempUnit + ") at atmospheric pressure";
      } else if (psat.inputs.fluidTemperature < minTemp) {
        return "Warning: Fluid Temperature is less than the freezing point (" + minTemp + " " + tempUnit + ") at atmospheric pressure";
      } else {
        return null;
      }
    } else {
      property.boilingPoint = this.convertUnitsService.value(property.boilingPoint).from('F').to(settings.temperatureMeasurement);
      property.meltingPoint = this.convertUnitsService.value(property.meltingPoint).from('F').to(settings.temperatureMeasurement);
      if (psat.inputs.fluidTemperature > property.boilingPoint) {
        return "Warning: Fluid Temperature is greater than the boiling point (" + property.boilingPoint + " " + tempUnit + ") at atmospheric pressure";
      } else if (psat.inputs.fluidTemperature < property.meltingPoint) {
        return "Warning: Fluid Temperature is less than the freezing point (" + property.meltingPoint + " " + tempUnit + ") at atmospheric pressure";
      } else {
        return null;
      }
    }
  }

  checkPumpEfficiency(psat: PSAT) {
    if (psat.inputs.pump_specified > 100) {
      return "Unrealistic efficiency, shouldn't be greater then 100%";
    }
    else if (psat.inputs.pump_specified == 0) {
      return "Cannot have 0% efficiency";
    }
    else if (psat.inputs.pump_specified < 0) {
      return "Cannot have negative efficiency";
    }
    else {
      return null;
    }
  }

}

export interface FieldDataWarnings {
  flowError: string,
  voltageError: string,
  costError: string,
  opFractionError: string,
  ratedPowerError: string,
  marginError: string,
  headError: string
}

export interface MotorWarnings {
  rpmError: string;
  voltageError: string;
  flaError: string;
  efficiencyError: string;
  ratedPowerError: string;
}