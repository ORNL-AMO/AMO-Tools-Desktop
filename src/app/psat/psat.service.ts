import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT, PsatInputs } from '../shared/models/psat';
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

  getFormFromPsat(psatInputs: PsatInputs) {
    return this.formBuilder.group({
      'pumpType': [psatInputs.pump_style, Validators.required],
      'specifiedPumpType': [psatInputs.pump_specified, Validators.required],
      'pumpRPM': [psatInputs.pump_rated_speed, Validators.required],
      'drive': [psatInputs.drive, Validators.required],
      'viscosity': [psatInputs.kinematic_viscosity, Validators.required],
      'gravity': [psatInputs.specific_gravity, Validators.required],
      'stages': [psatInputs.stages, Validators.required],
      'fixedSpeed': [psatInputs.fixed_speed, Validators.required],
      'frequency': [psatInputs.line_frequency, Validators.required],
      'horsePower': [psatInputs.motor_rated_power, Validators.required],
      'motorRPM': [psatInputs.motor_rated_speed, Validators.required],
      'efficiencyClass': [psatInputs.efficiency_class, Validators.required],
      'efficiencyClassSpecified': [psatInputs.efficiency_class_specified],
      'efficiency': [psatInputs.efficiency],
      'motorVoltage': [psatInputs.motor_rated_voltage, Validators.required],
      'fullLoadAmps': [psatInputs.full_load_amps, Validators.required],
      'sizeMargin': [psatInputs.margin, Validators.required],
      'operatingFraction': [psatInputs.operating_fraction, Validators.required],
      'costKwHr': [psatInputs.cost_kw_hour, Validators.required],
      'flowRate': [psatInputs.flow_rate, Validators.required],
      'head': [psatInputs.head, Validators.required],
      'loadEstimatedMethod': [psatInputs.load_estimation_method, Validators.required],
      'motorKW': [psatInputs.motor_field_power, Validators.required],
      'motorAmps': [psatInputs.motor_field_current, Validators.required],
      'measuredVoltage': [psatInputs.motor_field_voltage, Validators.required]
    })
  }

  getPsatInputsFromForm(form: any): PsatInputs {
    let efficiency;
    if (form.value.efficiencyClass == 'Standard') {
      efficiency = 0;
    } else if (form.value.efficiencyClass == 'Energy Efficient') {
      efficiency = 1;
    } else if (form.value.efficiencyClass == 'Specified') {
      efficiency = form.value.efficiency;
    }
    let tmpPsatInputs: PsatInputs = {
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
    return tmpPsatInputs;
  }

  isPumpFluidFormValid(form: any) {
    if (
      form.controls.pumpType.status == 'VALID' &&
      form.controls.pumpRPM.status == 'VALID' &&
      form.controls.drive.status == 'VALID' &&
      form.controls.viscosity.status == 'VALID' &&
      form.controls.gravity.status == 'VALID' &&
      form.controls.stages.status == 'VALID' &&
      form.controls.fixedSpeed.status == 'VALID'
    ) {
      //TODO: Check pumpType for custom
      return true;
    } else {
      return false;
    }
  }

  isMotorFormValid(form: any) {
    if (
      form.controls.frequency.status == 'VALID' &&
      form.controls.horsePower.status == 'VALID' &&
      form.controls.motorRPM.status == 'VALID' &&
      form.controls.efficiencyClass.status == 'VALID' &&
      form.controls.motorVoltage.status == 'VALID' &&
      form.controls.fullLoadAmps.status == 'VALID' &&
      form.controls.sizeMargin.status == 'VALID'
    ) {
      //TODO: logic for specified
      return true;
    }
    else {
      return false;
    }
  }

  isFieldDataFormValid(form: any) {
    if (
      form.controls.operatingFraction.status == 'VALID' &&
      form.controls.flowRate.status == 'VALID' &&
      form.controls.head.status == 'VALID' &&
      form.controls.loadEstimatedMethod.status == 'VALID' &&
      form.controls.measuredVoltage.status == 'VALID' &&
      form.controls.costKwHr.status == 'VALID'
    ) {
      //TODO check motorAMPS or motorKW
      return true
    }
    else {
      return false;
    }
  }
}
