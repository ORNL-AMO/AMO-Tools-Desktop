import { Injectable } from '@angular/core';
import { PSAT } from '../shared/models/psat';
import { Assessment } from '../shared/models/assessment';
import { PHAST } from '../shared/models/phast';

@Injectable()
export class AssessmentService {

  workingAssessment: Assessment;
  constructor() { }

  getNewAssessment(assessmentType: string){
    let newAssessment: Assessment = {
      name: null,
      date: new Date(),
      type: assessmentType
    }
    return newAssessment;
  }

  getNewPsat(){
    let newPsat: PSAT = {
      pump_style: null,
      pump_specified: null,
      pump_rated_speed: null,
      drive: null,
      kinematic_viscosity: null,
      specific_gravity: null,
      stages: null,
      fixed_speed: null,
      line_frequency: null,
      motor_rated_power: null,
      motor_rated_speed: null,
      efficiency_class: null,
      efficiency: null,
      motor_rated_voltage: null,
      load_estimation_method: null,
      motor_rated_flc: null,
      full_load_amps: null,
      margin: null,
      operating_fraction: null,
      flow_rate: null,
      head: null,
      motor_field_power: null,
      motor_field_current: null,
      motor_field_voltage: null
    }
    return newPsat;
  }

  getNewPhast(){
    let newPhast: PHAST = {
      name: null
    }
    return newPhast;
  }

  getWorkingAssessment(){
    return this.workingAssessment;
  }

  setWorkingAssessment(assessment: Assessment){
    this.workingAssessment = assessment;
  }

  getBaselinePSAT(){
    let tmpPSAT = this.buildPSAT(
      this.workingAssessment.psat.pump_style,
      this.workingAssessment.psat.pump_specified,
      this.workingAssessment.psat.pump_rated_speed,
      this.workingAssessment.psat.drive,
      this.workingAssessment.psat.kinematic_viscosity,
      this.workingAssessment.psat.specific_gravity,
      this.workingAssessment.psat.stages,
      this.workingAssessment.psat.fixed_speed,
      this.workingAssessment.psat.line_frequency,
      this.workingAssessment.psat.motor_rated_power,
      this.workingAssessment.psat.motor_rated_speed,
      this.workingAssessment.psat.efficiency_class,
      this.workingAssessment.psat.efficiency,
      this.workingAssessment.psat.motor_rated_voltage,
      this.workingAssessment.psat.load_estimation_method,
      this.workingAssessment.psat.motor_rated_flc,
      this.workingAssessment.psat.full_load_amps,
      this.workingAssessment.psat.margin,
      this.workingAssessment.psat.operating_fraction,
      this.workingAssessment.psat.flow_rate,
      this.workingAssessment.psat.head,
      this.workingAssessment.psat.motor_field_power,
      this.workingAssessment.psat.motor_field_current,
      this.workingAssessment.psat.motor_field_voltage,
      this.workingAssessment.psat.cost_kw_hour
    );

    return tmpPSAT;
  }

  buildPSAT(
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
      _motor_rated_flc: any,
      _full_load_amps: any,
      _margin: any,
      _operating_fraction: any,
      _flow_rate:any,
      _head: any,
      _motor_field_power: any,
      _motor_field_current: any,
      _motor_field_voltage: any,
      _cost_kw_hour: any

  ){
    let newPsat: PSAT = {
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
      motor_rated_flc: _motor_rated_flc,
      full_load_amps: _full_load_amps,
      margin: _margin,
      operating_fraction: _operating_fraction,
      flow_rate: _flow_rate,
      head: _head,
      motor_field_power: _motor_field_power,
      motor_field_current: _motor_field_current,
      motor_field_voltage: _motor_field_voltage,
      cost_kw_hour: _cost_kw_hour
    }
    return newPsat;
  }
}
