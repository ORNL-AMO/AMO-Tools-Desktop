import { Injectable } from '@angular/core';
import { PSAT } from '../shared/models/psat';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class CompareService {

  baselinePSAT: PSAT;
  modifiedPSAT: PSAT;
  selectedModification: BehaviorSubject<PSAT>;
  openModificationModal: BehaviorSubject<boolean>;
  constructor() {
    this.selectedModification = new BehaviorSubject<PSAT>(undefined);
    this.openModificationModal = new BehaviorSubject<boolean>(undefined);
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


  checkPumpDifferent() {
    return (
      this.isPumpSpecifiedDifferent() ||
      this.isPumpStyleDifferent() ||
      this.isPumpRpmDifferent() ||
      this.isDriveDifferent() ||
      this.isKinematicViscosityDifferent() ||
      this.isSpecificGravityDifferent() ||
      this.isFluidTempDifferent() ||
      this.isFluidTypeDifferent()
    )
  }

  checkMotorDifferent() {
    return (
      this.isLineFreqDifferent() ||
      this.isMotorRatedPowerDifferent() ||
      this.isMotorRatedSpeedDifferent() ||
      this.isEfficiencyClassDifferent() ||
      this.isEfficiencyDifferent() ||
      this.isMotorRatedVoltageDifferent() ||
      this.isMotorRatedFlaDifferent() ||
      this.isMarginDifferent()
    )
  }

  checkFieldDataDifferent() {
    return (
      this.isOperatingFractionDifferent() ||
      this.isCostKwhrDifferent() ||
      this.isFlowRateDifferent() ||
      this.isHeadDifferent()
    )
  }

  //pump style
  isPumpStyleDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.pump_style != this.modifiedPSAT.inputs.pump_style) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //pump specified
  isPumpSpecifiedDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.pump_specified != this.modifiedPSAT.inputs.pump_specified) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //pump rpm
  isPumpRpmDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.pump_rated_speed != this.modifiedPSAT.inputs.pump_rated_speed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //drive
  isDriveDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.drive != this.modifiedPSAT.inputs.drive) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //kinematic viscosity
  isKinematicViscosityDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.kinematic_viscosity != this.modifiedPSAT.inputs.kinematic_viscosity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //specific gravity
  isSpecificGravityDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.specific_gravity != this.modifiedPSAT.inputs.specific_gravity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //stages
  isStagesDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.stages != this.modifiedPSAT.inputs.stages) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //fixed speed
  isFixedSpeed() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.fixed_speed != this.modifiedPSAT.inputs.fixed_speed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //line freq
  isLineFreqDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.line_frequency != this.modifiedPSAT.inputs.line_frequency) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated power
  isMotorRatedPowerDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_power != this.modifiedPSAT.inputs.motor_rated_power) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated speed
  isMotorRatedSpeedDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_speed != this.modifiedPSAT.inputs.motor_rated_speed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //efficiency class
  isEfficiencyClassDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.efficiency_class != this.modifiedPSAT.inputs.efficiency_class) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //efficiency
  isEfficiencyDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.efficiency != this.modifiedPSAT.inputs.efficiency) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated voltage
  isMotorRatedVoltageDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_voltage != this.modifiedPSAT.inputs.motor_rated_voltage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //load estimation method
  isLoadEstimationMethodDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.load_estimation_method != this.modifiedPSAT.inputs.load_estimation_method) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor rated fla
  isMotorRatedFlaDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_fla != this.modifiedPSAT.inputs.motor_rated_fla) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //margin
  isMarginDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.margin != this.modifiedPSAT.inputs.margin) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //operating fraction
  isOperatingFractionDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.operating_fraction != this.modifiedPSAT.inputs.operating_fraction) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //flow rate
  isFlowRateDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.flow_rate != this.modifiedPSAT.inputs.flow_rate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //head
  isHeadDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.head != this.modifiedPSAT.inputs.head) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor field power
  isMotorFieldPowerDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_field_power != this.modifiedPSAT.inputs.motor_field_power) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor field current
  isMotorFieldCurrentDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_field_current != this.modifiedPSAT.inputs.motor_field_current) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //motor field voltage
  isMotorFieldVoltageDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_field_voltage != this.modifiedPSAT.inputs.motor_field_voltage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //cost kw/hr
  isCostKwhrDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.cost_kw_hour != this.modifiedPSAT.inputs.cost_kw_hour) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //cost
  isCostDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.cost != this.modifiedPSAT.inputs.cost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //load factor
  isLoadFactorDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.load_factor != this.modifiedPSAT.inputs.load_factor) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isFluidTempDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.fluidTemperature != this.modifiedPSAT.inputs.fluidTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isFluidTypeDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.fluidType != this.modifiedPSAT.inputs.fluidType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  // getBadges(baseline: PSAT, modification: PSAT): Array<{ badge: string, componentStr: string }> {

  // }
}
