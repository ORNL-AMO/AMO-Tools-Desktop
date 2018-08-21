import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PsatService } from './psat.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { PSAT } from '../shared/models/psat';

@Injectable()
export class PsatWarningService {

  constructor(private psatService: PsatService, private convertUnitsService: ConvertUnitsService) { }

  checkFieldData(psat: PSAT, settings: Settings): FieldDataWarnings {
    let flowError = this.checkFlowRate(psat.inputs.pump_style, psat.inputs.flow_rate, settings);
    let voltageError = this.checkVoltage(psat);
    let costError = this.checkCost(psat);
    let opFractionError = this.checkOpFraction(psat);
    let ratedPowerError = this.checkRatedPower(psat);
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