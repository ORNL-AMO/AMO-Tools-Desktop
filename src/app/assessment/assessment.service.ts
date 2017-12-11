import { Injectable } from '@angular/core';
import { PSAT, PsatInputs } from '../shared/models/psat';
import { Assessment } from '../shared/models/assessment';
import { PHAST } from '../shared/models/phast/phast';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AssessmentService {

  workingAssessment: Assessment;
  tab: string;
  subTab: string;
  showLandingScreen: boolean = true;

  createAssessment: BehaviorSubject<boolean>;
  // checkForUpdates: BehaviorSubject<boolean>;
  updateAvailable: BehaviorSubject<boolean>;
  constructor() {
    this.createAssessment = new BehaviorSubject<boolean>(null);
    // this.checkForUpdates = new BehaviorSubject<boolean>(null);
    this.updateAvailable = new BehaviorSubject<boolean>(null);
  }

  getNewAssessment(assessmentType: string): Assessment {
    let newAssessment: Assessment = {
      name: null,
      createdDate: new Date(),
      modifiedDate: new Date(),
      type: assessmentType
    }
    return newAssessment;
  }

  getNewPsat(): PSAT {
    let newPsatInputs: PsatInputs = {
      pump_style: 6,
      pump_specified: null,
      pump_rated_speed: 1780,
      drive: 0,
      kinematic_viscosity: 1.107,
      specific_gravity: 1.002,
      stages: 1,
      fixed_speed: 0,
      line_frequency: 0,
      motor_rated_power: 200,
      motor_rated_speed: 1780,
      efficiency_class: 1,
      efficiency: 95,
      motor_rated_voltage: 460,
      load_estimation_method: 0,
      motor_rated_fla: null,
      margin: 0,
      operating_fraction: 1,
      flow_rate: null,
      head: 277,
      motor_field_power: null,
      motor_field_current: null,
      motor_field_voltage: 460,
      cost_kw_hour: 0.06,
      fluidType: 'Water',
      fluidTemperature: 68
    };
    let newPsat: PSAT = {
      inputs: newPsatInputs
    };
    return newPsat;
  }

  getNewPhast(): PHAST {
    let newPhast: PHAST = {
      name: null,
      systemEfficiency: 90,
      operatingHours: {
        weeksPerYear: 52,
        daysPerWeek: 7,
        shiftsPerDay: 3,
        hoursPerShift: 8,
        hoursPerYear:8736
      },
      operatingCosts: {
        fuelCost: 8.00,
        steamCost: 10.00,
        electricityCost: .080
      },
    }
    return newPhast;
  }

  getWorkingAssessment(): Assessment {
    return this.workingAssessment;
  }

  getTab() {
    return this.tab;
  }

  getSubTab() {
    return this.subTab;
  }

  getLandingScreen() {
    return this.showLandingScreen;
  }

  setLandingScreen(bool: boolean) {
    this.showLandingScreen = bool;
  }

  setWorkingAssessment(assessment: Assessment, str?: string) {
    this.tab = str;
    this.workingAssessment = assessment;
  }

  getBaselinePSAT(): PSAT {
    let tmpPSAT: PSAT;
    let tmpPsatInputs = this.buildPsatInputs(
      this.workingAssessment.psat.inputs.pump_style,
      this.workingAssessment.psat.inputs.pump_specified,
      this.workingAssessment.psat.inputs.pump_rated_speed,
      this.workingAssessment.psat.inputs.drive,
      this.workingAssessment.psat.inputs.kinematic_viscosity,
      this.workingAssessment.psat.inputs.specific_gravity,
      this.workingAssessment.psat.inputs.stages,
      this.workingAssessment.psat.inputs.fixed_speed,
      this.workingAssessment.psat.inputs.line_frequency,
      this.workingAssessment.psat.inputs.motor_rated_power,
      this.workingAssessment.psat.inputs.motor_rated_speed,
      this.workingAssessment.psat.inputs.efficiency_class,
      this.workingAssessment.psat.inputs.efficiency,
      this.workingAssessment.psat.inputs.motor_rated_voltage,
      this.workingAssessment.psat.inputs.load_estimation_method,
      this.workingAssessment.psat.inputs.motor_rated_fla,
      this.workingAssessment.psat.inputs.margin,
      this.workingAssessment.psat.inputs.operating_fraction,
      this.workingAssessment.psat.inputs.flow_rate,
      this.workingAssessment.psat.inputs.head,
      this.workingAssessment.psat.inputs.motor_field_power,
      this.workingAssessment.psat.inputs.motor_field_current,
      this.workingAssessment.psat.inputs.motor_field_voltage,
      this.workingAssessment.psat.inputs.cost_kw_hour,
      this.workingAssessment.psat.inputs.fluidType,
      this.workingAssessment.psat.inputs.fluidTemperature
    );
    tmpPSAT = {
      inputs: tmpPsatInputs
    };
    return tmpPSAT;
  }

  buildPsatInputs(
    _pump_style: any,
    _pump_specified: any,
    _pump_rated_speed: any,
    _drive: any,
    _kinematic_viscosity: any,
    _specific_gravity: any,
    _stages: any,
    _fixed_speed: any,
    _line_frequency: any,
    _motor_rated_power: any,
    _motor_rated_speed: any,
    _efficiency_class: any,
    _efficiency: any,
    _motor_rated_voltage: any,
    _load_estimation_method: any,
    _motor_rated_fla: any,
    _margin: any,
    _operating_fraction: any,
    _flow_rate: any,
    _head: any,
    _motor_field_power: any,
    _motor_field_current: any,
    _motor_field_voltage: any,
    _cost_kw_hour: any,
    _fluidType: any,
    _fluidTemperature: any

  ): PsatInputs {
    let newPsatInputs: PsatInputs = {
      pump_style: _pump_style,
      pump_specified: _pump_specified,
      pump_rated_speed: _pump_rated_speed,
      drive: _drive,
      kinematic_viscosity: _kinematic_viscosity,
      specific_gravity: _specific_gravity,
      stages: _stages,
      fixed_speed: _fixed_speed,
      line_frequency: _line_frequency,
      motor_rated_power: _motor_rated_power,
      motor_rated_speed: _motor_rated_speed,
      efficiency_class: _efficiency_class,
      efficiency: _efficiency,
      motor_rated_voltage: _motor_rated_voltage,
      load_estimation_method: _load_estimation_method,
      motor_rated_fla: _motor_rated_fla,
      margin: _margin,
      operating_fraction: _operating_fraction,
      flow_rate: _flow_rate,
      head: _head,
      motor_field_power: _motor_field_power,
      motor_field_current: _motor_field_current,
      motor_field_voltage: _motor_field_voltage,
      cost_kw_hour: _cost_kw_hour,
      fluidType: _fluidType,
      fluidTemperature: _fluidTemperature
    };
    return newPsatInputs;
  }
}
