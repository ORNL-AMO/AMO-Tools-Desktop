import { Injectable } from '@angular/core';
import { FSAT } from '../shared/models/fans';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CompareService {
  baselineFSAT: FSAT;
  modifiedFSAT: FSAT;
  selectedModification: BehaviorSubject<FSAT>;
  constructor() {
    this.selectedModification = new BehaviorSubject<FSAT>(undefined);
  }


  setCompareVals(fsat: FSAT, selectedModIndex: number) {
    this.baselineFSAT = fsat;
    if (fsat.modifications) {
      if (fsat.modifications.length != 0) {
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
        this.isConditionLocationDifferent(baseline, modification) ||
        this.isSpecificGravityDifferent(baseline, modification) ||
        this.isInputTypeDifferent(baseline, modification) ||
        this.isDewPointDifferent(baseline, modification) ||
        this.isRelativeHumidityDifferent(baseline, modification) ||
        this.isWetBulbTempDifferent(baseline, modification) ||
        this.isSpecificHeatGasDifferent(baseline, modification)
      )
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
      if (baseline.baseGasDensity.dryBulbTemp != modification.baseGasDensity.dryBulbTemp) {
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
      if (baseline.baseGasDensity.staticPressure != modification.baseGasDensity.staticPressure) {
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
      if (baseline.baseGasDensity.barometricPressure != modification.baseGasDensity.barometricPressure) {
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
      if (baseline.baseGasDensity.gasDensity != modification.baseGasDensity.gasDensity) {
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
      if (baseline.baseGasDensity.gasType != modification.baseGasDensity.gasType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isConditionLocationDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.conditionLocation != modification.baseGasDensity.conditionLocation) {
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
      if (baseline.baseGasDensity.specificGravity != modification.baseGasDensity.specificGravity) {
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
      if (baseline.baseGasDensity.inputType != modification.baseGasDensity.inputType) {
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
      if (baseline.baseGasDensity.dewPoint != modification.baseGasDensity.dewPoint) {
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
      if (baseline.baseGasDensity.relativeHumidity != modification.baseGasDensity.relativeHumidity) {
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
      if (baseline.baseGasDensity.wetBulbTemp != modification.baseGasDensity.wetBulbTemp) {
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
      if (baseline.baseGasDensity.specificHeatGas != modification.baseGasDensity.specificHeatGas) {
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
  checkFanSetupDifferent(baseline?: FSAT, modification?: FSAT) {
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
        this.isDriveDifferent(baseline, modification)
      )
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
      if (baseline.fanSetup.fanType != modification.fanSetup.fanType) {
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
      if (baseline.fanSetup.fanSpeed != modification.fanSetup.fanSpeed) {
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
      if (baseline.fanSetup.drive != modification.fanSetup.drive) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //FanMotor
  checkFanMotorDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      return (
        this.isOperatingFractionDifferent(baseline, modification) ||
        this.isCostDifferent(baseline, modification) ||
        this.isFlowRateDifferent(baseline, modification) ||
        this.isInletPressureDifferent(baseline, modification) ||
        this.isOutletPressureDifferent(baseline, modification) ||
        this.isSpecificHeatRatioDifferent(baseline, modification) ||
        this.isCompressibilityFactorDifferent(baseline, modification)
      )
    } else {
      return false;
    }
  }

  isOperatingFractionDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.fieldData.operatingFraction != modification.fieldData.operatingFraction) {
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
      if (baseline.fieldData.cost != modification.fieldData.cost) {
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
      if (baseline.fieldData.flowRate != modification.fieldData.flowRate) {
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
      if (baseline.fieldData.inletPressure != modification.fieldData.inletPressure) {
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
      if (baseline.fieldData.outletPressure != modification.fieldData.outletPressure) {
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
      if (baseline.fieldData.specificHeatRatio != modification.fieldData.specificHeatRatio) {
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
      if (baseline.fieldData.compressibilityFactor != modification.fieldData.compressibilityFactor) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // isMeasuredVoltageDifferent(baseline?: FSAT, modification?: FSAT) {
  //   if (!baseline) {
  //     baseline = this.baselineFSAT;
  //   }
  //   if (!modification) {
  //     modification = this.modifiedFSAT;
  //   }
  //   if (baseline && modification) {
  //     if (baseline.fieldData.measuredVoltage != modification.fieldData.measuredVoltage) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }
}
