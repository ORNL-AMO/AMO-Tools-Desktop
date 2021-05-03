import { Injectable } from '@angular/core';
import { FSAT, FanSetup, BaseGasDensity, FsatOutput, FsatInput } from '../shared/models/fans';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { PsatService } from '../psat/psat.service';
import { FsatService } from './fsat.service';
import { CompareService } from './compare.service';

@Injectable()
export class FsatWarningService {

  constructor(private convertUnitsService: ConvertUnitsService, private compareService: CompareService, private psatService: PsatService, private fsatService: FsatService) {
   }

  checkFieldDataWarnings(fsat: FSAT, settings: Settings, isModification: boolean): FanFieldDataWarnings {
    let ratedPowerWarning: string = null;
    if (!isModification) {
      ratedPowerWarning = this.checkRatedPower(fsat, settings, isModification);
    }
    
    let warnings: FanFieldDataWarnings = {
      costError: this.checkCost(fsat),
      voltageError: this.checkVoltage(fsat),
      suggestedVoltage: this.checkSuggestedVoltage(fsat, isModification),
      ratedPowerError: ratedPowerWarning,
      inletPressureError: this.checkInletPressure(fsat),
      outletPressureError: this.checkOutletPressure(fsat),
      calcInletVelocityPressureError: this.checkCalcInletVelocityPressureError(fsat.fieldData.flowRate)
    };

    return warnings;
  }

  checkCalcInletVelocityPressureError(flowRate: number) {
    if (flowRate <= 0) {
      return 'Flow rate is required to calculate Inlet Velocity Pressure';
    } else {
      return null;
    }
  }

  //REQUIRED?
  checkOutletPressure(fsat: FSAT) {
    if (fsat.fieldData.outletPressure < 0) {
      return 'Outlet pressure is usually not less than zero';
    } else {
      return null;
    }
  }

  checkInletPressure(fsat: FSAT) {
    if(fsat.fieldData.inletPressure > 0) {
      return 'Inlet Pressure is usually not greater than zero';
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


  checkCost(fsat: FSAT) {
    if (fsat.fieldData.cost > 1) {
      return "Shouldn't be greater then 1";
    } else {
      return null;
    }
  }

  checkRatedPower(fsat: FSAT, settings: Settings, isModification: boolean) {
    let motorPowerStr: string;
    if (fsat.fieldData.loadEstimatedMethod === 0) {
      motorPowerStr = 'Motor Power';
    } else {
      motorPowerStr = 'Motor Current';
    }

    let tmpVal = fsat.fanMotor.motorRatedPower;
    let min: number = 5;
    let max: number = 10000;
    if (tmpVal < this.convertUnitsService.value(min).from('hp').to(settings.fanPowerMeasurement)) {
      return 'Rated motor power is too small.';
    } else if (tmpVal > this.convertUnitsService.value(max).from('hp').to(settings.fanPowerMeasurement)) {
      return 'Rated motor power is too large.';
    } else {
      if (fsat.fieldData.motorPower && tmpVal) {
        let val, compare;
        if (settings.fanPowerMeasurement === 'hp') {
          val = this.convertUnitsService.value(tmpVal).from(settings.fanPowerMeasurement).to('kW');
          if (isModification) {
            let isModValid: boolean = this.fsatService.checkValid(fsat, isModification, settings).isValid;
            if (isModValid) {
              let fsatInput: FsatInput = this.fsatService.getInput(fsat, settings);
              let fsatOutput: FsatOutput = this.fsatService.fanResultsModified(fsatInput);
              compare = fsatOutput.motorPower;
            }
            else {
              compare = this.convertUnitsService.value(fsat.fieldData.motorPower).from(settings.fanPowerMeasurement).to('kW');
            }
          }
          else {
            compare = this.convertUnitsService.value(fsat.fieldData.motorPower).from(settings.fanPowerMeasurement).to('kW');
          }
        } else {
          val = tmpVal;
          if (isModification) {
            let isModValid: boolean = this.fsatService.checkValid(fsat, isModification, settings).isValid;
            if (isModValid) {
              let fsatInput: FsatInput = this.fsatService.getInput(fsat, settings);
              let fsatOutput: FsatOutput = this.fsatService.fanResultsModified(fsatInput);
              compare = fsatOutput.motorPower;
            }
            else {
              compare = fsat.fieldData.motorPower;
            }
          }
          else {
            compare = fsat.fieldData.motorPower;
          }
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

  checkSuggestedVoltage(fsat: FSAT, isModification: boolean) {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && isModification) {
      let ratedVoltage = this.compareService.modifiedFSAT.fanMotor.motorRatedVoltage;
      if (this.compareService.isMotorRatedVoltageDifferent() && fsat.fieldData.measuredVoltage != ratedVoltage) {
        return `Motor modification Rated Voltage differs from baseline. Consider using ${ratedVoltage} (modification Rated Voltage) for Measured Voltage`;
      } else {
        return null;
      }
    }
    else {
      return null;
    }
  }

  //MOTOR
  checkMotorWarnings(fsat: FSAT, settings: Settings, isModification: boolean): FanMotorWarnings {
    let efficiencyError: string = null;
    if (fsat.fanMotor.efficiencyClass === 3) {
      efficiencyError = this.checkEfficiency(fsat);
    }
    return {
      rpmError: this.checkMotorRpm(fsat),
      voltageError: this.checkMotorVoltage(fsat),
      flaError: this.checkFLA(fsat, settings),
      efficiencyError: efficiencyError,
      ratedPowerError: this.checkRatedPower(fsat, settings, isModification)
    };
  }

  checkEfficiency(fsat: FSAT) {
    if (fsat.fanMotor.specifiedEfficiency) {
      if (fsat.fanMotor.specifiedEfficiency > 100) {
        return "Unrealistic efficiency, cannot be greater than 100%";
      }
      else if (fsat.fanMotor.specifiedEfficiency === 0) {
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
    let range: { min: number, max: number } = this.getMotorRpmMinMax(fsat.fanMotor.lineFrequency, fsat.fanMotor.efficiencyClass);
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
    };
    if (lineFreqEnum === 0 && (effClass === 0 || effClass === 1)) { // if 60Hz and Standard or Energy Efficiency
      rpmRange.min = 540;
      rpmRange.max = 3600;
    } else if (lineFreqEnum === 1 && (effClass === 0 || effClass === 1)) { // if 50Hz and Standard or Energy Efficiency
      rpmRange.min = 450;
      rpmRange.max = 3300;
    } else if (lineFreqEnum === 0 && effClass === 2) { // if 60Hz and Premium Efficiency
      rpmRange.min = 1080;
      rpmRange.max = 3600;
    } else if (lineFreqEnum === 1 && effClass === 2) { // if 50Hz and Premium Efficiency
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
        fsat.fanMotor.lineFrequency,
        fsat.fanMotor.efficiencyClass,
        fsat.fanMotor.specifiedEfficiency,
        fsat.fanMotor.motorRatedVoltage,
        settings
      );

      // Keep - may use min/max in the future
      // let flaMax = estEfficiency * 1.05;
      // let flaMin = estEfficiency * .95;
      // if (fsat.fanMotor.fullLoadAmps < flaMin) {
      //   return 'Value should be greater than ' + Math.round(flaMin) + ' A';
      // } else if (fsat.fanMotor.fullLoadAmps > flaMax) {
      //   return 'Value should be less than ' + Math.round(flaMax) + ' A';
      // } else {
      // return null;

      let limit = .05;
      let percentDifference = Math.abs(fsat.fanMotor.fullLoadAmps - estEfficiency) / estEfficiency;
      if (percentDifference > limit) {
        return `Value is greater than ${limit * 100}% different from estimated FLA (${Math.round(estEfficiency)} A). Consider using the 'Estimate Full-Load Amps' button.`;
      }
      return null;
    } else {
      return null;
    }
  }

  //FAN
  checkFanWarnings(fanSetup: FanSetup): { fanSpeedError: string } {
    return {
      fanSpeedError: this.checkFanSpeed(fanSetup),
    };
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

  
  // //FAN FLUID
  // checkFanFluidWarnings(baseGasDensity: BaseGasDensity, settings: Settings): FanFluidWarnings {
  //   let barometricPressureError: string = this.checkBarometricPressure(baseGasDensity, settings);
  //   return {
  //     barometricPressureError: barometricPressureError
  //   }
  // }

  // //TODO: NOT Imperial || Other
  // checkBarometricPressure(baseGasDensity: BaseGasDensity, settings: Settings) {
  //   let barometricMin: number = this.convertUnitsService.value(25.5).from('inHg').to(settings.fanBarometricPressure);
  //   let barometricMax: number = this.convertUnitsService.value(32.5).from('inHg').to(settings.fanBarometricPressure);
  //   if (baseGasDensity.barometricPressure) {
  //     if(baseGasDensity.barometricPressure > barometricMax){
  //       return 'Barometirc pressure is high, please check your value.';
  //     }else if(baseGasDensity.barometricPressure < barometricMin){
  //       return 'Barometirc pressure is low, please check your value.'
  //     }else{
  //       return null;
  //     }
  //   } else {
  //     return null;
  //   }
  // }

  // checkRelativeHumidity(baseGasDensity: BaseGasDensity) {
  //   if (baseGasDensity.relativeHumidity < 0) {
  //     return 'Value should be greater than or equal to 0';
  //   } else if (baseGasDensity.relativeHumidity > 100) {
  //     return 'Value should be less than or equal to 100';
  //   } else {
  //     return null;
  //   }
  // }

  checkWarningsExist(warnings: FanFieldDataWarnings | FanMotorWarnings | { fanSpeedError: string }): boolean {
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
  voltageError: string;
  costError: string;
  ratedPowerError: string;
  suggestedVoltage: string,
  inletPressureError: string;
  outletPressureError: string;
  calcInletVelocityPressureError: string;
}

export interface FanMotorWarnings {
  rpmError: string;
  voltageError: string;
  flaError: string;
  efficiencyError: string;
  ratedPowerError: string;
}

// export interface FanFluidWarnings {
//   barometricPressureError: string;
// }
