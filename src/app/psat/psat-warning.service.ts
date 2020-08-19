import { Injectable } from '@angular/core';
import { PsatService } from './psat.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { PSAT, PsatOutputs } from '../shared/models/psat';
import { fluidProperties } from './psatConstants';


//PSAT Warnings are messages for input fields
//will display if unrelistic data is entered
//they do not stop calculations.

@Injectable()
export class PsatWarningService {

  updateFla: boolean = false;
  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }
  //FIELD DATA
  //warnings for field data form
  checkFieldData(psat: PSAT, settings: Settings, isBaseline?: boolean): FieldDataWarnings {
    let flowError: string = this.checkFlowRate(psat.inputs.pump_style, psat.inputs.flow_rate, settings);
    let voltageError: string = this.checkVoltage(psat);
    let ratedPowerError: string = null;
    if (isBaseline) {
      ratedPowerError = this.checkRatedPower(psat);
    }
    return {
      flowError: flowError,
      voltageError: voltageError,
      ratedPowerError: ratedPowerError,
    }
  }
  //Field data warning: flowError
  checkFlowRate(pumpStyle: number, flowRate: number, settings: Settings) {
    //get min max
    let flowRateRange = this.getFlowRateMinMax(pumpStyle);
    //convert
    if (settings.flowMeasurement != 'gpm') {
      flowRateRange.min = this.convertUnitsService.value(flowRateRange.min).from('gpm').to(settings.flowMeasurement);
      flowRateRange.min = this.convertUnitsService.roundVal(flowRateRange.min, 2);
      flowRateRange.max = this.convertUnitsService.value(flowRateRange.max).from('gpm').to(settings.flowMeasurement);
      flowRateRange.max = this.convertUnitsService.roundVal(flowRateRange.max, 2);
    }
    //check in range
    if (flowRate >= flowRateRange.min && flowRate <= flowRateRange.max) {
      return null;
    } else if (flowRate < flowRateRange.min) {
      return 'Flow rate is too small for selected pump style, should be greater than ' + flowRateRange.min;
    } else if (flowRate > flowRateRange.max) {
      return 'Flow rate is too large for selected pump style, should be less than ' + flowRateRange.max;
    } else {
      return null;
    }
  }
  //used by checkFlowRate()
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
  //Field Data Warning: voltageError
  checkVoltage(psat: PSAT) {
    if (psat.inputs.motor_field_voltage < 1) {
      return "Voltage shouldn't be less than 1 V";
    } else if (psat.inputs.motor_field_voltage > 13800) {
      return "Voltage shouldn't be greater than 13800 V";
    } else {
      return null;
    }
  }
  //Field Data Warning: ratedPowerError
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
  //MOTOR
  //checks for warnings in motor setup form
  checkMotorWarnings(psat: PSAT, settings: Settings, isModification: boolean): MotorWarnings {
    let rpmError: string = this.checkMotorRpm(psat);
    let voltageError: string = this.checkMotorVoltage(psat);
    let flaError: string = this.checkFLA(psat, settings);
    let recalculateFla: string = this.updateFla ? "Inputs to this calculated value have changed. Consider re-estimating" : null;
    let ratedPowerError: string;
    ratedPowerError = this.checkMotorRatedPower(psat, settings, isModification);
    return {
      rpmError: rpmError,
      voltageError: voltageError,
      flaError: flaError,
      recalculateFla: recalculateFla,
      ratedPowerError: ratedPowerError
    }
  }
  //Motor Warning: rpmError
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
  //Motor Warning: voltageError
  checkMotorVoltage(psat: PSAT) {
    if (psat.inputs.motor_rated_voltage < 208) {
      return "Voltage should be greater than 208 V."
    } else if (psat.inputs.motor_rated_voltage > 15180) {
      return "Voltage should be less than 15180 V.";
    } else {
      return null;
    }
  }
  //Motor Warning: ratedPowerError
  checkMotorRatedPower(psat: PSAT, settings: Settings, isModification: boolean) {
    let motorFieldPower;
    let inputTypeStr: string;
    if (psat.inputs.load_estimation_method == 0) {
      motorFieldPower = psat.inputs.motor_field_power;
      inputTypeStr = 'Field Data Motor Power';
    } else {
      motorFieldPower = psat.inputs.motor_field_current;
      inputTypeStr = 'Field Data Motor Current';
    }

    let min: number = 5;
    let max: number = 10000;
    // let isModificationValid: boolean;
    if (psat.inputs.motor_rated_power < this.convertUnitsService.value(min).from('hp').to(settings.powerMeasurement)) {
      return 'Rated motor power is too small.';
    } else if (psat.inputs.motor_rated_power > this.convertUnitsService.value(max).from('hp').to(settings.powerMeasurement)) {
      return 'Rated motor power is too large.';
    } else {

      if (motorFieldPower && psat.inputs.motor_rated_power) {
        let val, compare;
        if (settings.powerMeasurement == 'hp') {
          val = this.convertUnitsService.value(psat.inputs.motor_rated_power).from(settings.powerMeasurement).to('kW');
          if (isModification) {
            psat.valid = this.psatService.isPsatValid(psat.inputs, false);
            if (psat.valid.isValid) {
              let modificationResults: PsatOutputs = this.psatService.resultsModified(psat.inputs, settings);
              compare = modificationResults.motor_power;
            } else {
              compare = this.convertUnitsService.value(motorFieldPower).from(settings.powerMeasurement).to('kW');
            }
          }
          else {
            compare = this.convertUnitsService.value(motorFieldPower).from(settings.powerMeasurement).to('kW');
          }
        } else {
          val = psat.inputs.motor_rated_power;
          if (isModification) {
            psat.valid = this.psatService.isPsatValid(psat.inputs, false);
            if (psat.valid.isValid) {
              let modificationResults: PsatOutputs = this.psatService.resultsModified(psat.inputs, settings);
              compare = modificationResults.motor_power;
            } else {
              compare = motorFieldPower;
            }
          }
          else {
            compare = motorFieldPower;
          }
        }
        val = val * 1.5;
        // console.log('val = ' + val);
        // console.log('compare = ' + compare);
        if (compare > val) {
          return 'The ' + inputTypeStr + ' is too high compared to the Rated Motor Power, please adjust the input values.';
        } else {
          return null;
        }
      } else {
        return null;
      }
    }
  }
  //Motor Warning: flaError
  checkFLA(psat: PSAT, settings: Settings) {
    let lineFreqTest: boolean = (psat.inputs.line_frequency != undefined || psat.inputs.line_frequency != null);
    if (
      psat.inputs.motor_rated_power &&
      psat.inputs.motor_rated_speed &&
      lineFreqTest &&
      psat.inputs.efficiency_class &&
      psat.inputs.efficiency &&
      psat.inputs.motor_rated_voltage
    ) {
      let estEfficiency = this.psatService.estFLA(
        psat.inputs.motor_rated_power,
        psat.inputs.motor_rated_speed,
        psat.inputs.line_frequency,
        psat.inputs.efficiency_class,
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
        if (psat.inputs.motor_rated_fla != estEfficiency) {
          this.updateFla = true;
        } else {
          this.updateFla = false;
        }
        return null;
      }
    } else {
      return null;
    }
  }

  //PUMP FLUID
  //warnings for pump fluid form
  checkPumpFluidWarnings(psat: PSAT, settings: Settings): PumpFluidWarnings {
    let rpmError: string = this.checkPumpRpm(psat);
    let temperatureError: string = this.checkTemperatureError(psat, settings);
    return {
      rpmError: rpmError,
      temperatureError: temperatureError
    }
  }
  //Pump Fluid Warning: rpmError
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
      return 'Pump Speed should be greater than ' + min + ' rpm';
    } else if (psat.inputs.pump_rated_speed > max) {
      return 'Pump Speed should be less than ' + max + ' rpm';
    } else {
      return null;
    }
  }
  //Pump Fluid Warning: temperatureError
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

  //Iterates warnings objects to see if any warnings are not null
  checkWarningsExist(warnings: FieldDataWarnings | MotorWarnings | PumpFluidWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }

}

export interface FieldDataWarnings {
  flowError: string;
  voltageError: string;
  ratedPowerError: string;
}

export interface MotorWarnings {
  rpmError: string;
  voltageError: string;
  flaError: string;
  ratedPowerError: string;
  recalculateFla: string;
}

export interface PumpFluidWarnings {
  rpmError: string;
  temperatureError: string;
}