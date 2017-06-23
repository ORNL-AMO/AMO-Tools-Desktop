import { Injectable } from '@angular/core';
import { PSAT } from '../shared/models/psat';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class CompareService {

  baselinePSAT: PSAT;
  modifiedPSAT: PSAT;


  pump_style_different = new BehaviorSubject<boolean>(null);
  pump_specified_different = new BehaviorSubject<boolean>(null);
  pump_rated_speed_different = new BehaviorSubject<boolean>(null);
  drive_different = new BehaviorSubject<boolean>(null);
  kinematic_viscosity_different = new BehaviorSubject<boolean>(null);
  specific_gravity_different = new BehaviorSubject<boolean>(null);
  stages_different = new BehaviorSubject<boolean>(null);
  fixed_speed_different = new BehaviorSubject<boolean>(null);
  line_frequency_different = new BehaviorSubject<boolean>(null);
  motor_rated_power_different = new BehaviorSubject<boolean>(null);
  motor_rated_speed_different = new BehaviorSubject<boolean>(null);
  efficiency_class_different = new BehaviorSubject<boolean>(null);
  efficiency_different = new BehaviorSubject<boolean>(null);
  motor_rated_voltage_different = new BehaviorSubject<boolean>(null);
  load_estimation_method_different = new BehaviorSubject<boolean>(null);
  motor_rated_fla_different = new BehaviorSubject<boolean>(null);
  margin_different = new BehaviorSubject<boolean>(null);
  operating_fraction_different = new BehaviorSubject<boolean>(null);
  flow_rate_different = new BehaviorSubject<boolean>(null);
  head_different = new BehaviorSubject<boolean>(null);
  motor_field_power_different = new BehaviorSubject<boolean>(null);
  motor_field_current_different = new BehaviorSubject<boolean>(null);
  motor_field_voltage_different = new BehaviorSubject<boolean>(null);
  cost_kw_hour_different = new BehaviorSubject<boolean>(null);
  load_factor_different = new BehaviorSubject<boolean>(null);
  cost_different = new BehaviorSubject<boolean>(null);
  constructor() { }

  checkPumpDifferent() {
    this.isPumpSpecifiedDifferent();
    this.isPumpStyleDifferent();
    this.isPumpRpmDifferent();
    this.isDriveDifferent();
    this.isKinematicViscosityDifferent();
    this.isSpecificGravityDifferent();
    this.isStagesDifferent();
    this.isFixedSpeed();
  }

  checkMotorDifferent(){
    this.isLineFreqDifferent();
    this.isMotorRatedPowerDifferent();
    this.isMotorRatedSpeedDifferent();
    this.isEfficiencyClassDifferent();
    this.isEfficiencyDifferent();
    this.isMotorRatedVoltageDifferent();
    this.isMotorRatedFlaDifferent();
    this.isMarginDifferent();
  }

  checkFieldDataDifferent(){
    this.isOperatingFractionDifferent();
    this.isCostKwhrDifferent();
    this.isFlowRateDifferent();
    this.isHeadDifferent();
    this.isLoadEstimationMethodDifferent();
    this.isMotorFieldPowerDifferent();
    this.isMotorFieldCurrentDifferent();
    this.isMotorFieldVoltageDifferent();
  }

  //pump style
  isPumpStyleDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.pump_style != this.modifiedPSAT.inputs.pump_style) {
        this.pump_style_different.next(true);
      } else {
        this.pump_style_different.next(false);
      }
    } else {
      this.pump_style_different.next(false);
    }
  }
  //pump specified
  isPumpSpecifiedDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.pump_specified != this.modifiedPSAT.inputs.pump_specified) {
        this.pump_specified_different.next(true);
      } else {
        this.pump_specified_different.next(false);
      }
    } else {
      this.pump_specified_different.next(false);
    }
  }
  //pump rpm
  isPumpRpmDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.pump_rated_speed != this.modifiedPSAT.inputs.pump_rated_speed) {
        this.pump_rated_speed_different.next(true);
      } else {
        this.pump_rated_speed_different.next(false);
      }
    } else {
      this.pump_rated_speed_different.next(false);
    }
  }
  //drive
  isDriveDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.drive != this.modifiedPSAT.inputs.drive) {
        this.drive_different.next(true);
      } else {
        this.drive_different.next(false);
      }
    } else {
      this.drive_different.next(false);
    }
  }
  //kinematic viscosity
  isKinematicViscosityDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.kinematic_viscosity != this.modifiedPSAT.inputs.kinematic_viscosity) {
        this.kinematic_viscosity_different.next(true);
      } else {
        this.kinematic_viscosity_different.next(false);
      }
    } else {
      this.kinematic_viscosity_different.next(false);
    }
  }
  //specific gravity
  isSpecificGravityDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.specific_gravity != this.modifiedPSAT.inputs.specific_gravity) {
        this.specific_gravity_different.next(true);
      } else {
        this.specific_gravity_different.next(false);
      }
    } else {
      this.specific_gravity_different.next(false);
    }
  }
  //stages
  isStagesDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.stages != this.modifiedPSAT.inputs.stages) {
        this.stages_different.next(true);
      } else {
        this.stages_different.next(false);
      }
    } else {
      this.stages_different.next(false);
    }
  }
  //fixed speed
  isFixedSpeed() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.fixed_speed != this.modifiedPSAT.inputs.fixed_speed) {
        this.fixed_speed_different.next(true);
      } else {
        this.fixed_speed_different.next(false);
      }
    } else {
      this.fixed_speed_different.next(false);
    }
  }
  //line freq
  isLineFreqDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.line_frequency != this.modifiedPSAT.inputs.line_frequency) {
        this.line_frequency_different.next(true);
      } else {
        this.line_frequency_different.next(false);
      }
    } else {
      this.line_frequency_different.next(false);
    }
  }
  //motor rated power
  isMotorRatedPowerDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_power != this.modifiedPSAT.inputs.motor_rated_power) {
        this.motor_rated_power_different.next(true);
      } else {
        this.motor_rated_power_different.next(false);
      }
    } else {
      this.motor_rated_power_different.next(false);
    }
  }
  //motor rated speed
  isMotorRatedSpeedDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_speed != this.modifiedPSAT.inputs.motor_rated_speed) {
        this.motor_rated_speed_different.next(true);
      } else {
        this.motor_rated_speed_different.next(false);
      }
    } else {
      this.motor_rated_speed_different.next(false);
    }
  }
  //efficiency class
  isEfficiencyClassDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.efficiency_class != this.modifiedPSAT.inputs.efficiency_class) {
        this.efficiency_class_different.next(true);
      } else {
        this.efficiency_class_different.next(false);
      }
    } else {
      this.efficiency_class_different.next(false);
    }
  }
  //efficiency
  isEfficiencyDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.efficiency != this.modifiedPSAT.inputs.efficiency) {
        this.efficiency_different.next(true);
      } else {
        this.efficiency_different.next(false);
      }
    } else {
      this.efficiency_different.next(false);
    }
  }
  //motor rated voltage
  isMotorRatedVoltageDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_voltage != this.modifiedPSAT.inputs.motor_rated_voltage) {
        this.motor_rated_voltage_different.next(true);
      } else {
        this.motor_rated_voltage_different.next(false);
      }
    } else {
      this.motor_rated_voltage_different.next(false);
    }
  }
  //load estimation method
  isLoadEstimationMethodDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.load_estimation_method != this.modifiedPSAT.inputs.load_estimation_method) {
        this.load_estimation_method_different.next(true);
      } else {
        this.load_estimation_method_different.next(false);
      }
    } else {
      this.load_estimation_method_different.next(false);
    }
  }
  //motor rated fla
  isMotorRatedFlaDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_rated_fla != this.modifiedPSAT.inputs.motor_rated_fla) {
        this.motor_rated_fla_different.next(true);
      } else {
        this.motor_rated_fla_different.next(false);
      }
    } else {
      this.motor_rated_fla_different.next(false);
    }
  }
  //margin
  isMarginDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.margin != this.modifiedPSAT.inputs.margin) {
        this.margin_different.next(true);
      } else {
        this.margin_different.next(false);
      }
    } else {
      this.margin_different.next(false);
    }
  }
  //operating fraction
  isOperatingFractionDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.operating_fraction != this.modifiedPSAT.inputs.operating_fraction) {
        this.operating_fraction_different.next(true);
      } else {
        this.operating_fraction_different.next(false);
      }
    } else {
      this.operating_fraction_different.next(false);
    }
  }
  //flow rate
  isFlowRateDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.flow_rate != this.modifiedPSAT.inputs.flow_rate) {
        this.flow_rate_different.next(true);
      } else {
        this.flow_rate_different.next(false);
      }
    } else {
      this.flow_rate_different.next(false);
    }
  }
  //head
  isHeadDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.head != this.modifiedPSAT.inputs.head) {
        this.head_different.next(true);
      } else {
        this.head_different.next(false);
      }
    } else {
      this.head_different.next(false);
    }
  }
  //motor field power
  isMotorFieldPowerDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_field_power != this.modifiedPSAT.inputs.motor_field_power) {
        this.motor_field_power_different.next(true);
      } else {
        this.motor_field_power_different.next(false);
      }
    } else {
      this.motor_field_power_different.next(false);
    }
  }
  //motor field current
  isMotorFieldCurrentDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_field_current != this.modifiedPSAT.inputs.motor_field_current) {
        this.motor_field_current_different.next(true);
      } else {
        this.motor_field_current_different.next(false);
      }
    } else {
      this.motor_field_current_different.next(false);
    }
  }
  //motor field voltage
  isMotorFieldVoltageDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.motor_field_voltage != this.modifiedPSAT.inputs.motor_field_voltage) {
        this.motor_field_voltage_different.next(true);
      } else {
        this.motor_field_voltage_different.next(false);
      }
    } else {
      this.motor_field_voltage_different.next(false);
    }
  }
  //cost kw/hr
  isCostKwhrDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.cost_kw_hour != this.modifiedPSAT.inputs.cost_kw_hour) {
        this.cost_kw_hour_different.next(true);
      } else {
        this.cost_kw_hour_different.next(false);
      }
    } else {
      this.cost_kw_hour_different.next(false);
    }
  }
  //cost
  isCostDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.cost != this.modifiedPSAT.inputs.cost) {
        this.cost_different.next(true);
      } else {
        this.cost_different.next(false);
      }
    } else {
      this.cost_different.next(false);
    }
  }
  //load factor
  isLoadFactorDifferent() {
    if (this.baselinePSAT && this.modifiedPSAT) {
      if (this.baselinePSAT.inputs.load_factor != this.modifiedPSAT.inputs.load_factor) {
        this.load_factor_different.next(true);
      } else {
        this.load_factor_different.next(false);
      }
    } else {
      this.load_factor_different.next(false);
    }
  }
}
