import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT } from '../shared/models/psat';
declare var psatAddon: any;

@Injectable()
export class PsatService {

  constructor(private formBuilder: FormBuilder) { }

  headToolSuctionTank(
    specificGravity: number,
    flowRate: number,
    suctionPipeDiameter: number,
    suctionTankGasOverPressure: number,
    suctionTankFluidSurfaceElevation: number,
    suctionLineLossCoefficients: number,
    dischargePipeDiameter: number,
    dischargeGaugePressure: number,
    dischargeGaugeElevation: number,
    dischargeLineLossCoefficients: number
  ) {
    return psatAddon.headToolSuctionTank(specificGravity, flowRate, suctionPipeDiameter, suctionTankGasOverPressure, suctionTankFluidSurfaceElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients)
  }

  headTool(
    specificGravity: number,
    flowRate: number,
    suctionPipeDiameter: number,
    suctionGuagePressure: number,
    suctionGuageElevation: number,
    suctionLineLossCoefficients: number,
    dischargePipeDiameter: number,
    dischargeGaugePressure: number,
    dischargeGaugeElevation: number,
    dischargeLineLossCoefficients: number
  ) {
    return psatAddon.headTool(specificGravity, flowRate, suctionPipeDiameter, suctionGuagePressure, suctionGuageElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
  }

  initForm() {
    return this.formBuilder.group({
      'pumpType': ['', Validators.required],
      'specifiedPumpType': ['', Validators.required],
      'pumpRPM': ['', Validators.required],
      'drive': ['', Validators.required],
      'viscosity': ['', Validators.required],
      'gravity': ['', Validators.required],
      'stages': ['', Validators.required],
      'fixedSpeed': ['', Validators.required],
      'frequency': ['', Validators.required],
      'horsePower': ['', Validators.required],
      'motorRPM': ['', Validators.required],
      'efficiencyClass': ['', Validators.required],
      'efficiencyClassSpecified': [''],
      'efficiency': [''],
      'motorVoltage': ['', Validators.required],
      'fullLoadAmps': ['', Validators.required],
      'sizeMargin': ['', Validators.required],
      'operatingFraction': ['', Validators.required],
      'costKwHr': ['', Validators.required],
      'flowRate': ['', Validators.required],
      'head': ['', Validators.required],
      'loadEstimatedMethod': ['Power', Validators.required],
      'motorKW': ['', Validators.required],
      'motorAmps': ['', Validators.required],
      'measuredVoltage': ['', Validators.required]
    })
  }

  getFormFromPsat(psat: PSAT) {
    return this.formBuilder.group({
      'pumpType': [psat.inputs.pump_style, Validators.required],
      'specifiedPumpType': [psat.inputs.pump_specified, Validators.required],
      'pumpRPM': [psat.inputs.pump_rated_speed, Validators.required],
      'drive': [psat.inputs.drive, Validators.required],
      'viscosity': [psat.inputs.kinematic_viscosity, Validators.required],
      'gravity': [psat.inputs.specific_gravity, Validators.required],
      'stages': [psat.inputs.stages, Validators.required],
      'fixedSpeed': [psat.inputs.fixed_speed, Validators.required],
      'frequency': [psat.inputs.line_frequency, Validators.required],
      'horsePower': [psat.inputs.motor_rated_power, Validators.required],
      'motorRPM': [psat.inputs.motor_rated_speed, Validators.required],
      'efficiencyClass': [psat.inputs.efficiency_class, Validators.required],
      'efficiencyClassSpecified': [psat.inputs.efficiency_class_specified],
      'efficiency': [psat.inputs.efficiency],
      'motorVoltage': [psat.inputs.motor_rated_voltage, Validators.required],
      'fullLoadAmps': [psat.inputs.full_load_amps, Validators.required],
      'sizeMargin': [psat.inputs.margin, Validators.required],
      'operatingFraction': [psat.inputs.operating_fraction, Validators.required],
      'costKwHr': [psat.inputs.cost_kw_hour, Validators.required],
      'flowRate': [psat.inputs.flow_rate, Validators.required],
      'head': [psat.inputs.head, Validators.required],
      'loadEstimatedMethod': [psat.inputs.load_estimation_method, Validators.required],
      'motorKW': [psat.inputs.motor_field_power, Validators.required],
      'motorAmps': [psat.inputs.motor_field_current, Validators.required],
      'measuredVoltage': [psat.inputs.motor_field_voltage, Validators.required]
    })
  }

  getPsatFromForm(form: any): PSAT {
    let efficiency;
    if(form.value.efficiencyClass == 'Standard'){
      efficiency = 0;
    }else if(form.value.efficiencyClass == 'Energy Efficient'){
      efficiency = 1;
    }else if(form.value.efficiencyClass == 'Specified'){
      efficiency = form.value.efficiency;
    }
    let tmpPsat: PSAT = {
      inputs: {
        pump_style: form.value.pumpType,
        pump_specified: form.value.specifiedPumpType,
        pump_rated_speed: form.value.pumpRPM,
        drive: form.value.drive,
        kinematic_viscosity: form.value.viscosity,
        specific_gravity: form.value.gravity,
        stages: form.value.stages,
        fixed_speed: form.value.fixedSpeed,
        line_frequency: form.value.frequency,
        motor_rated_power: form.value.horsePower,
        motor_rated_speed: form.value.motorRPM,
        efficiency_class: form.value.efficiencyClass,
        efficiency_class_specified: form.value.efficiencyClassSpecified,
        efficiency: efficiency,
        motor_rated_voltage: form.value.motorVoltage,
        load_estimation_method: form.value.loadEstimatedMethod,
        motor_rated_flc: form.value.motorRatedFlc,
        full_load_amps: form.value.fullLoadAmps,
        margin: form.value.sizeMargin,
        operating_fraction: form.value.operatingFraction,
        flow_rate: form.value.flowRate,
        head: form.value.head,
        motor_field_power: form.value.motorKW,
        motor_field_current: form.value.motorAmps,
        motor_field_voltage: form.value.measuredVoltage,
        cost_kw_hour: form.value.costKwHr
      }
    }
    return tmpPsat;
  }

}
