import { Injectable } from '@angular/core';
import { FSAT } from '../shared/models/fans';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';

@Injectable()
export class FsatWarningService {

  constructor(private convertUnitsService: ConvertUnitsService) { }

  checkFieldDataWarnings(fsat: FSAT, settings: Settings): FanFieldDataWarnings {
    return {
      flowRateError: this.checkFlowRate(fsat),
      costError: this.checkCost(fsat),
      voltageError: this.checkVoltage(fsat),
      opFractionError: this.checkOperatingFraction(fsat),
      ratedPowerError: this.checkRatedPower(fsat, settings),
      outletPressureError: this.checkOutletPressure(fsat),
      specificHeatRatioError: this.checkSpecificHeatRatio(fsat),
      compressibilityFactorError: this.checkCompressibilityFactor(fsat)
    }
  }

  //REQUIRED?
  checkOutletPressure(fsat: FSAT) {
    if (fsat.fieldData.outletPressure < 0) {
      return 'Outlet pressure should be greater than or equal to 0';
    } else {
      return null;
    }
  }
  //REQUIRED
  checkFlowRate(fsat: FSAT) {
    if (fsat.fieldData.flowRate < 0) {
      return 'Flow rate must be greater than or equal to 0';
    } else {
      return null;
    }
  }
  //REQUIRED
  checkSpecificHeatRatio(fsat: FSAT) {
    if (fsat.fieldData.specificHeatRatio < 0) {
      return 'Specific heat ratio must be greater than or equal to 0';
    } else {
      return null;
    }
  }
  //REQUIRED
  checkCompressibilityFactor(fsat: FSAT) {
    if (fsat.fieldData.compressibilityFactor < 0) {
      return 'Compressibility factor must be greater than or equal to 0';
    } else {
      return null;
    }
  }
  //REQUIRED
  checkOperatingFraction(fsat: FSAT) {
    if (fsat.fieldData.operatingFraction > 1) {
      return 'Operating fraction needs to be between 0 - 1';
    } else if (fsat.fieldData.operatingFraction < 0) {
      return "Cannot have negative operating fraction";
    } else {
      return null;
    }
  }
  //REQUIRED
  checkCost(fsat: FSAT) {
    if (fsat.fieldData.cost < 0) {
      return 'Cannot have negative cost';
    } else if (fsat.fieldData.cost > 1) {
      return "Shouldn't be greater then 1";
    } else {
      return null;
    }
  }

  checkRatedPower(fsat: FSAT, settings: Settings){
    let tmpVal = fsat.fanMotor.motorRatedPower;
    if (fsat.fieldData.motorPower && tmpVal) {
      let val, compare;
      if (settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(tmpVal).from(settings.powerMeasurement).to('kW');
        compare = this.convertUnitsService.value(fsat.fieldData.motorPower ).from(settings.powerMeasurement).to('kW');
      } else {
        val = tmpVal;
        compare = fsat.fieldData.motorPower ;
      }
      val = val * 1.5;
      if (val < compare) {
        return 'The Field Data Motor Power is too high compared to the Rated Motor Power, please adjust the input values.';
      } else {
        return null;
      }
    }else{
      return null;
    }
  }

  checkVoltage(fsat: FSAT){
    if (fsat.fieldData.measuredVoltage > 13800) {
      return 'Voltage should be less than 13800 V.';
    } else if (fsat.fieldData.measuredVoltage < 1) {
      return "Voltage should be greater then 1 V.";
    } else {
      return null;
    }
  }

}


export interface FanFieldDataWarnings {
  flowRateError: string,
  voltageError: string,
  costError: string,
  opFractionError: string,
  ratedPowerError: string,
  // marginError: string,
  outletPressureError: string,
  specificHeatRatioError: string,
  compressibilityFactorError: string
}