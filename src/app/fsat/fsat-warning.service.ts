import { Injectable } from '@angular/core';
import { FSAT, FanSetup, BaseGasDensity } from '../shared/models/fans';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { PsatService } from '../psat/psat.service';

@Injectable()
export class FsatWarningService {

  constructor(private convertUnitsService: ConvertUnitsService, private psatService: PsatService) { }

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

  checkRatedPower(fsat: FSAT, settings: Settings) {
    let motorPowerStr: string;
    if (fsat.fieldData.loadEstimatedMethod == 0) {
      motorPowerStr = 'Motor Power';
    } else {
      motorPowerStr = 'Motor Current';
    }

    let tmpVal = fsat.fanMotor.motorRatedPower;
    if (fsat.fieldData.motorPower && tmpVal) {
      let val, compare;
      if (settings.powerMeasurement == 'hp') {
        val = this.convertUnitsService.value(tmpVal).from(settings.powerMeasurement).to('kW');
        compare = this.convertUnitsService.value(fsat.fieldData.motorPower).from(settings.powerMeasurement).to('kW');
      } else {
        val = tmpVal;
        compare = fsat.fieldData.motorPower;
      }
      val = val * 1.5;
      if (val < compare) {
        return 'The Field Data ' + motorPowerStr + ' is too high compared to the Rated Motor Power, please adjust the input values.';
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  checkVoltage(fsat: FSAT) {
    if (fsat.fieldData.measuredVoltage > 13800) {
      return 'Voltage should be less than 13800 V.';
    } else if (fsat.fieldData.measuredVoltage < 1) {
      return "Voltage should be greater then 1 V.";
    } else {
      return null;
    }
  }

  //MOTOR
  checkMotorWarnings(fsat: FSAT, settings: Settings): FanMotorWarnings {
    let efficiencyError: string = null;
    if (fsat.fanMotor.efficiencyClass == 3) {
      efficiencyError = this.checkEfficiency(fsat);
    }
    return {
      rpmError: this.checkMotorRpm(fsat),
      voltageError: this.checkMotorVoltage(fsat),
      flaError: this.checkFLA(fsat, settings),
      efficiencyError: efficiencyError,
      ratedPowerError: this.checkRatedPower(fsat, settings)
    }
  }

  checkEfficiency(fsat: FSAT) {
    if (fsat.fanMotor.specifiedEfficiency) {
      if (fsat.fanMotor.specifiedEfficiency > 100) {
        return "Unrealistic efficiency, shouldn't be greater than 100%";
      }
      else if (fsat.fanMotor.specifiedEfficiency == 0) {
        return "Cannot have 0% efficiency";
      }
      else if (fsat.fanMotor.specifiedEfficiency < 0) {
        return "Cannot have negative efficiency";
      } else {
        return null;
      }
    }
    else {
      return null;
    }
  }

  checkMotorVoltage(fsat: FSAT) {
    if (fsat.fanMotor.motorRatedVoltage < 208) {
      return "Voltage must be greater than 208";
    } else if (fsat.fanMotor.motorRatedVoltage > 15180) {
      return "Voltage must be less than 15,180";
    } else {
      return null;
    }
  }

  checkMotorRpm(fsat: FSAT) {
    let range: { min: number, max: number } = this.getMotorRpmMinMax(fsat.fanMotor.lineFrequency, fsat.fanMotor.efficiencyClass)
    if (fsat.fanMotor.motorRpm < range.min) {
      return 'Motor RPM too small for selected efficiency class';
    } else if (fsat.fanMotor.motorRpm > range.max) {
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

  checkFLA(fsat: FSAT, settings: Settings) {
    if (
      fsat.fanMotor.motorRatedPower &&
      fsat.fanMotor.motorRpm &&
      fsat.fanMotor.lineFrequency &&
      fsat.fanMotor.efficiencyClass &&
      fsat.fanMotor.motorRatedVoltage
    ) {
      if (!fsat.fanMotor.specifiedEfficiency) {
        fsat.fanMotor.specifiedEfficiency = fsat.fanMotor.efficiencyClass;
      }
      let estEfficiency = this.psatService.estFLA(
        fsat.fanMotor.motorRatedPower,
        fsat.fanMotor.motorRpm,
        fsat.fanMotor.lineFrequency + ' Hz',
        this.psatService.getEfficiencyClassFromEnum(fsat.fanMotor.efficiencyClass),
        fsat.fanMotor.specifiedEfficiency,
        fsat.fanMotor.motorRatedVoltage,
        settings
      );
      let flaMax = estEfficiency * 1.05;
      let flaMin = estEfficiency * .95;
      if (fsat.fanMotor.fullLoadAmps < flaMin) {
        return 'Value should be greater than ' + Math.round(flaMin);
      } else if (fsat.fanMotor.fullLoadAmps > flaMax) {
        return 'Value should be less than ' + Math.round(flaMax);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  //FAN
  checkFanWarnings(fanSetup: FanSetup): { fanEfficiencyError: string, fanSpeedError: string } {
    let fanEfficiencyError: string = null;
    if (fanSetup.fanType == 12) {
      fanEfficiencyError = this.checkFanEfficiency(fanSetup);
    }
    return {
      fanEfficiencyError: fanEfficiencyError,
      fanSpeedError: this.checkFanSpeed(fanSetup)
    }
  }

  checkFanEfficiency(fanSetup: FanSetup) {
    if (fanSetup.fanSpecified < 0) {
      return 'Value must be greater than or equal to 0';
    } else if (fanSetup.fanSpecified > 100) {
      return 'Value must be less than or equal to 100';
    } else {
      return null;
    }
  }

  checkFanSpeed(fanSetup: FanSetup) {
    if (fanSetup.fanSpeed < 0) {
      return 'Fan speed must be greater than or equal to 0';
    } else if (fanSetup.fanSpeed > 5000) {
      return 'Fan speed must be less than or equal to 5000';
    } else {
      return null;
    }
  }

  //FAN FLUID
  checkFanFluidWarnings(baseGasDensity: BaseGasDensity, settings: Settings): FanFluidWarnings {
    let barometricPressureError: string = this.checkBarometricPressurer(baseGasDensity, settings);
    let relativeHumidityError: string = null;
    let gasDensityError: string = this.checkGasDensity(baseGasDensity);
    let specificHeatGasError: string = null;
    if (baseGasDensity.inputType == 'relativeHumidity') {
      relativeHumidityError = this.checkRelativeHumidity(baseGasDensity);
    }
    if (baseGasDensity.inputType == 'wetBulb') {
      specificHeatGasError = this.checkSpecificHeat(baseGasDensity);
    }
    return {
      barometricPressureError: barometricPressureError,
      relativeHumidityError: relativeHumidityError,
      gasDensityError: gasDensityError,
      specificHeatGasError: specificHeatGasError
    }
  }

  //TODO: NOT Imperial || Other
  checkBarometricPressurer(baseGasDensity: BaseGasDensity, settings: Settings) {
    if (settings.unitsOfMeasure == 'Imperial') {
      if (baseGasDensity.barometricPressure < 20) {
        return 'Value should be greater than 20';
      } else if (baseGasDensity.barometricPressure > 40) {
        return 'Value should be less than 40';
      } else {
        return null;
      }

    } else {
      if (baseGasDensity.barometricPressure < 65) {
        return 'Value should be greater than 65';
      } else if (baseGasDensity.barometricPressure > 140) {
        return 'Value should be less than 140';
      } else {
        return null;
      }
    }
  }

  checkRelativeHumidity(baseGasDensity: BaseGasDensity) {
    if (baseGasDensity.relativeHumidity < 0) {
      return 'Value should be greater than or equal to 0';
    } else if (baseGasDensity.relativeHumidity > 100) {
      return 'Value should be less than or equal to 100';
    } else {
      return null;
    }
  }
  checkGasDensity(baseGasDensity: BaseGasDensity) {
    if (baseGasDensity.gasDensity <= 0) {
      return 'Value should be greater than 0';
    } else {
      return null;
    }
  }

  checkSpecificHeat(baseGasDensity: BaseGasDensity) {
    if (baseGasDensity.specificHeatGas <= 0) {
      return 'Value should be greater than 0';
    } else {
      return null;
    }
  }

  checkWarningsExist(warnings: FanFieldDataWarnings | FanMotorWarnings | FanFluidWarnings | { fanEfficiencyError: string, fanSpeedError: string }): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
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

export interface FanMotorWarnings {
  rpmError: string;
  voltageError: string;
  flaError: string;
  efficiencyError: string;
  ratedPowerError: string;
}

export interface FanFluidWarnings {
  barometricPressureError: string;
  relativeHumidityError: string;
  gasDensityError: string;
  specificHeatGasError: string;
}