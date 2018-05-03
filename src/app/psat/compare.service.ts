import { Injectable } from '@angular/core';
import { PSAT } from '../shared/models/psat';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class CompareService {

  baselinePSAT: PSAT;
  modifiedPSAT: PSAT;
  selectedModification: BehaviorSubject<PSAT>;
  openModificationModal: BehaviorSubject<boolean>;
  openNewModal: BehaviorSubject<boolean>;
  constructor() {
    this.selectedModification = new BehaviorSubject<PSAT>(undefined);
    this.openModificationModal = new BehaviorSubject<boolean>(undefined);
    this.openNewModal = new BehaviorSubject<boolean>(undefined);
  }

  setCompareVals(psat: PSAT, selectedModIndex: number) {
    this.baselinePSAT = psat;
    if (psat.modifications) {
      if (psat.modifications.length != 0) {
        this.selectedModification.next(psat.modifications[selectedModIndex].psat);
        this.modifiedPSAT = this.selectedModification.value;
      } else {
        this.selectedModification.next(undefined);
        this.modifiedPSAT = undefined;
      }
    } else {
      this.selectedModification.next(undefined);
      this.modifiedPSAT = undefined;
    }
  }


  checkPumpDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      return (
        this.isPumpSpecifiedDifferent(baseline, modification) ||
        this.isPumpStyleDifferent(baseline, modification) ||
        this.isPumpRpmDifferent(baseline, modification) ||
        this.isDriveDifferent(baseline, modification) ||
        this.isKinematicViscosityDifferent(baseline, modification) ||
        this.isSpecificGravityDifferent(baseline, modification) ||
        this.isFluidTempDifferent(baseline, modification) ||
        this.isFluidTypeDifferent(baseline, modification) ||
        this.isStagesDifferent(baseline, modification)
      )
    } else {
      return false;
    }
  }

  checkMotorDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      return (
        this.isLineFreqDifferent(baseline, modification) ||
        this.isMotorRatedPowerDifferent(baseline, modification) ||
        this.isMotorRatedSpeedDifferent(baseline, modification) ||
        this.isEfficiencyClassDifferent(baseline, modification) ||
        this.isEfficiencyDifferent(baseline, modification) ||
        this.isMotorRatedVoltageDifferent(baseline, modification) ||
        this.isMotorRatedFlaDifferent(baseline, modification)
      )
    } else {
      return false;
    }
  }

  checkFieldDataDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      return (
        this.isOperatingFractionDifferent(baseline, modification) ||
        this.isCostKwhrDifferent(baseline, modification) ||
        this.isFlowRateDifferent(baseline, modification) ||
        this.isHeadDifferent(baseline, modification)
      )
    }
    else {
      return false;
    }
  }

  //pump style
  isPumpStyleDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.pump_style != modification.inputs.pump_style) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //pump specified
  isPumpSpecifiedDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.pump_specified != modification.inputs.pump_specified) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //pump rpm
  isPumpRpmDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.pump_rated_speed != modification.inputs.pump_rated_speed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //drive
  isDriveDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.drive != modification.inputs.drive) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //kinematic viscosity
  isKinematicViscosityDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.kinematic_viscosity != modification.inputs.kinematic_viscosity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //specific gravity
  isSpecificGravityDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.specific_gravity != modification.inputs.specific_gravity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //stages
  isStagesDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.stages != modification.inputs.stages) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //fixed speed
  isFixedSpeed(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.fixed_speed != modification.inputs.fixed_speed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //line freq
  isLineFreqDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.line_frequency != modification.inputs.line_frequency) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated power
  isMotorRatedPowerDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.motor_rated_power != modification.inputs.motor_rated_power) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated speed
  isMotorRatedSpeedDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.motor_rated_speed != modification.inputs.motor_rated_speed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //efficiency class
  isEfficiencyClassDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.efficiency_class != modification.inputs.efficiency_class) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //efficiency
  isEfficiencyDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.efficiency != modification.inputs.efficiency) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated voltage
  isMotorRatedVoltageDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.motor_rated_voltage != modification.inputs.motor_rated_voltage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //load estimation method
  isLoadEstimationMethodDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.load_estimation_method != modification.inputs.load_estimation_method) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated fla
  isMotorRatedFlaDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.motor_rated_fla != modification.inputs.motor_rated_fla) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //margin
  isMarginDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.margin != modification.inputs.margin) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //operating fraction
  isOperatingFractionDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.operating_fraction != modification.inputs.operating_fraction) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //flow rate
  isFlowRateDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.flow_rate != modification.inputs.flow_rate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //head
  isHeadDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.head != modification.inputs.head) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor field power
  isMotorFieldPowerDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.motor_field_power != modification.inputs.motor_field_power) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor field current
  isMotorFieldCurrentDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.motor_field_current != modification.inputs.motor_field_current) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor field voltage
  isMotorFieldVoltageDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.motor_field_voltage != modification.inputs.motor_field_voltage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //cost kw/hr
  isCostKwhrDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.cost_kw_hour != modification.inputs.cost_kw_hour) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //cost
  isCostDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.cost != modification.inputs.cost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //load factor
  isLoadFactorDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.load_factor != modification.inputs.load_factor) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isFluidTempDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.fluidTemperature != modification.inputs.fluidTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isFluidTypeDifferent(baseline?: PSAT, modification?: PSAT) {
    if (!baseline) {
      baseline = this.baselinePSAT;
    }
    if (!modification) {
      modification = this.modifiedPSAT;
    }
    if (baseline && modification) {
      if (baseline.inputs.fluidType != modification.inputs.fluidType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getBadges(baseline: PSAT, modification: PSAT): Array<{ badge: string, componentStr: string }> {
    let badges: Array<{ badge: string, componentStr: string }> = [];
    if (baseline && modification) {
      if (this.checkFieldDataDifferent(baseline, modification)) {
        badges.push({ badge: 'Field Data', componentStr: 'field-data' })
      }
      if (this.checkMotorDifferent(baseline, modification)) {
        badges.push({ badge: 'Motor', componentStr: 'motor' })
      }
      if (this.checkPumpDifferent(baseline, modification)) {
        badges.push({ badge: 'Pump Fluid', componentStr: 'pump-fluid' })
      }
    }
    return badges;
  }
}
