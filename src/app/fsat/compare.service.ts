import { Injectable } from '@angular/core';
import { FSAT } from '../shared/models/fans';
import { BehaviorSubject } from 'rxjs';
import { FsatService } from './fsat.service';
import { Settings } from '../shared/models/settings';

@Injectable()
export class CompareService {
  baselineFSAT: FSAT;
  modifiedFSAT: FSAT;
  selectedModification: BehaviorSubject<FSAT>;
  totalEmissionOutputRateDifferent: BehaviorSubject<boolean>;
  constructor(private fsatService: FsatService) {
    this.selectedModification = new BehaviorSubject<FSAT>(undefined);
    this.totalEmissionOutputRateDifferent = new BehaviorSubject<boolean>(false);
  }


  setCompareVals(fsat: FSAT, selectedModIndex?: number) {
    this.baselineFSAT = fsat;
    if (fsat.modifications && selectedModIndex != undefined) {
      if (fsat.modifications.length !== 0) {
        this.selectedModification.next(fsat.modifications[selectedModIndex].fsat);
        this.modifiedFSAT = this.selectedModification.value;
      } else {
        this.selectedModification.next(undefined);
        this.modifiedFSAT = undefined;
      }
    } else {
      this.selectedModification.next(undefined);
      this.modifiedFSAT = undefined;
    }
  }


  ///fsat-fluid (baseGasDensity)
  checkFluidDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      return (
        this.isDryBulbTempDifferent(baseline, modification) ||
        this.isStaticPressureDifferent(baseline, modification) ||
        this.isBarometricPressureDifferent(baseline, modification) ||
        this.isGasDensityDifferent(baseline, modification) ||
        this.isGasTypeDifferent(baseline, modification) ||
        // this.isConditionLocationDifferent(baseline, modification) ||
        //removed issue 4332, coming back eventually.
        // this.isSpecificGravityDifferent(baseline, modification) ||
        this.isInputTypeDifferent(baseline, modification) ||
        this.isDewPointDifferent(baseline, modification) ||
        this.isRelativeHumidityDifferent(baseline, modification) ||
        this.isWetBulbTempDifferent(baseline, modification) ||
        this.isSpecificHeatGasDifferent(baseline, modification)
      );
    } else {
      return false;
    }
  }


  isDryBulbTempDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.dryBulbTemp !== modification.baseGasDensity.dryBulbTemp) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isStaticPressureDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.staticPressure !== modification.baseGasDensity.staticPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isBarometricPressureDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.barometricPressure !== modification.baseGasDensity.barometricPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isGasDensityDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.gasDensity !== modification.baseGasDensity.gasDensity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isGasTypeDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.gasType !== modification.baseGasDensity.gasType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isSpecificGravityDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.specificGravity !== modification.baseGasDensity.specificGravity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isInputTypeDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.inputType !== modification.baseGasDensity.inputType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isDewPointDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.dewPoint !== modification.baseGasDensity.dewPoint) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isRelativeHumidityDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.relativeHumidity !== modification.baseGasDensity.relativeHumidity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isWetBulbTempDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.wetBulbTemp !== modification.baseGasDensity.wetBulbTemp) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isSpecificHeatGasDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.specificHeatGas !== modification.baseGasDensity.specificHeatGas) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //fan-setup (FanSetup)
  //TODO: Add Specified Fan Type logic
  checkFanSetupDifferent(settings: Settings, baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      return (
        this.isFanTypeDifferent(baseline, modification) ||
        this.isFanSpeedDifferent(baseline, modification) ||
        this.isDriveDifferent(baseline, modification) ||
        this.isSpecifiedFanEfficiencyDifferent(settings, baseline, modification)
      );
    } else {
      return false;
    }
  }
  isFanTypeDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanSetup.fanType !== modification.fanSetup.fanType && modification.fanSetup.fanType != 12) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isFanSpeedDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanSetup.fanSpeed !== modification.fanSetup.fanSpeed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isDriveDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanSetup.drive !== modification.fanSetup.drive) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isSpecifiedDriveEfficiencyDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanSetup.specifiedDriveEfficiency !== modification.fanSetup.specifiedDriveEfficiency) {

        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isSpecifiedFanEfficiencyDifferent(settings: Settings, baseline?: FSAT, modification?: FSAT) {
    let baselineEfficiency: number;
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (baseline && baseline.setupDone) {
      baselineEfficiency = this.fsatService.getResults(baseline, true, settings).fanEfficiency;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baselineEfficiency && modification) {
      let baselineCompValue = Math.round(baselineEfficiency * 10) / 10;
      let modificationCompValue = Math.round(modification.fanSetup.fanEfficiency * 10) / 10;
      if (baselineCompValue == modificationCompValue) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  checkFanOperationsDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      return (
        this.isOperatingHoursDifferent(baseline, modification) ||
        this.isCostDifferent(baseline, modification) ||
        this.isTotalEmissionOutputRateDifferent(false, baseline, modification)
      );
    } else {
      return false;
    }
  }


  //Fan Field Data
  checkFanFieldDataDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      return (
        this.isFlowRateDifferent(baseline, modification) ||
        this.isInletPressureDifferent(baseline, modification) ||
        this.isOutletPressureDifferent(baseline, modification) ||
        this.isSpecificHeatRatioDifferent(baseline, modification) ||
        this.isCompressibilityFactorDifferent(baseline, modification) || 
        this.isMeasuredVoltageDifferent(baseline, modification)
      );
    } else {
      return false;
    }
  }

  isOperatingHoursDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fsatOperations.operatingHours !== modification.fsatOperations.operatingHours) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isCostDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fsatOperations.cost !== modification.fsatOperations.cost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isFlowRateDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.flowRate !== modification.fieldData.flowRate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isInletPressureDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.inletPressure !== modification.fieldData.inletPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isInletVelocityPressureDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.inletVelocityPressure !== modification.fieldData.inletVelocityPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isDuctAreaDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.ductArea !== modification.fieldData.ductArea) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isOutletPressureDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.outletPressure !== modification.fieldData.outletPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //only baseline
  // isLoadEstimatedMethodDifferent(baseline?: FSAT, modification?: FSAT) {
  //   if (!baseline) {
  //     baseline = this.baselineFSAT;
  //   }
  //   if (!modification) {
  //     modification = this.modifiedFSAT;
  //   }
  //   if (baseline && modification) {
  //     if (baseline.fieldData.loadEstimatedMethod != modification.fieldData.loadEstimatedMethod) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }
  // isMotorPowerDifferent(baseline?: FSAT, modification?: FSAT) {
  //   if (!baseline) {
  //     baseline = this.baselineFSAT;
  //   }
  //   if (!modification) {
  //     modification = this.modifiedFSAT;
  //   }
  //   if (baseline && modification) {
  //     if (baseline.fieldData.motorPower != modification.fieldData.motorPower) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }
  isSpecificHeatRatioDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.specificHeatRatio !== modification.baseGasDensity.specificHeatRatio) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isCompressibilityFactorDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.compressibilityFactor !== modification.fieldData.compressibilityFactor) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isMeasuredVoltageDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.measuredVoltage != modification.fieldData.measuredVoltage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //Fan Motor
  checkFanMotorDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      return (
        this.isLineFrequencyDifferent(baseline, modification) ||
        this.isMotorRatedPowerDifferent(baseline, modification) ||
        this.isMotorRpmDifferent(baseline, modification) ||
        this.isEfficiencyClassDifferent(baseline, modification) ||
        this.isSpecifiedEfficiencyDifferent(baseline, modification) ||
        this.isMotorRatedVoltageDifferent(baseline, modification) ||
        this.isMotorFullLoadAmpsDifferent(baseline, modification)
      );
    } else {
      return false;
    }
  }

  isLineFrequencyDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanMotor.lineFrequency !== modification.fanMotor.lineFrequency) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isMotorRatedPowerDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanMotor.motorRatedPower !== modification.fanMotor.motorRatedPower) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isMotorRpmDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanMotor.motorRpm !== modification.fanMotor.motorRpm) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isEfficiencyClassDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanMotor.efficiencyClass !== modification.fanMotor.efficiencyClass) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isSpecifiedEfficiencyDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanMotor.efficiencyClass == 3 || baseline.fanMotor.efficiencyClass == 3) {
        if (baseline.fanMotor.specifiedEfficiency !== modification.fanMotor.specifiedEfficiency) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isMotorRatedVoltageDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanMotor.motorRatedVoltage !== modification.fanMotor.motorRatedVoltage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isMotorFullLoadAmpsDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fanMotor.fullLoadAmps !== modification.fanMotor.fullLoadAmps) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isTotalEmissionOutputRateDifferent(shouldUpdateModifyForm: boolean = true, baseline?: FSAT, modification?: FSAT): boolean {
    let totalEmissionOutputRateDifferent: boolean = false;
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fsatOperations.cO2SavingsData && modification.fsatOperations.cO2SavingsData) {
        totalEmissionOutputRateDifferent = baseline.fsatOperations.cO2SavingsData.totalEmissionOutputRate != modification.fsatOperations.cO2SavingsData.totalEmissionOutputRate;
      }
    } 

    if (shouldUpdateModifyForm) {
      this.totalEmissionOutputRateDifferent.next(totalEmissionOutputRateDifferent);
    }

    return totalEmissionOutputRateDifferent;
  }

  getBadges(baseline: FSAT, modification: FSAT, settings: Settings): Array<{ badge: string, componentStr: string }> {
    let badges: Array<{ badge: string, componentStr: string }> = [];
    if (baseline && modification) {
      if (this.checkFanOperationsDifferent(baseline, modification)) {
        badges.push({ badge: 'Operations', componentStr: 'fsat-operations' });
      }
      if (this.checkFluidDifferent(baseline, modification)) {
        badges.push({ badge: 'Fluid', componentStr: 'fsat-fluid' });
      }
      if (this.checkFanSetupDifferent(settings, baseline, modification)) {
        badges.push({ badge: 'Fan', componentStr: 'fan-setup' });
      }
      if (this.checkFanMotorDifferent(baseline, modification)) {
        badges.push({ badge: 'Motor', componentStr: 'fan-motor' });
      }
      if (this.checkFanFieldDataDifferent(baseline, modification)) {
        badges.push({ badge: 'Field Data', componentStr: 'fan-field-data' });
      }
    }
    return badges;
  }

}
