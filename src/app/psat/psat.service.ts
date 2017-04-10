import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT, PsatInputs } from '../shared/models/psat';
declare var psatAddon: any;

@Injectable()
export class PsatService {

  constructor(private formBuilder: FormBuilder) { }
  //CALCULATORS
  results(psatInputs: PsatInputs) {
    console.log(psatInputs);
    return psatAddon.results(psatInputs);
  }

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

  estFLA(
    horsePower,
    motorRPM,
    frequency,
    efficiencyClass,
    efficiency,
    motorVoltage
  ) {
    let lineFreqEnum = this.getLineFreqEnum(frequency);
    let effClassEnum = this.getEfficienyClassEnum(efficiencyClass);
    let inputs: any = {
      motor_rated_power: horsePower,
      motor_rated_speed: motorRPM,
      line_frequency: lineFreqEnum,
      efficiency_class: effClassEnum,
      efficiency: efficiency,
      motor_rated_voltage: motorVoltage
    }
    return psatAddon.estFLA(inputs);

  }

  achievableEfficiency(
    pumpStyle: string,
    specificSpeed: number
  ) {
    let inputs: any;
    let enumPumpStyle = this.getPumpStyleEnum(pumpStyle);
    inputs = {
      pump_style: enumPumpStyle,
      specific_speed: specificSpeed
    }
    return psatAddon.achievableEfficiency(inputs)
  }

  pumpEfficiency(
    pumpStyle,
    flowRate
  ) {
    let inputs: any;
    let enumPumpStyle = this.getPumpStyleEnum(pumpStyle);
    inputs = {
      pump_style: enumPumpStyle,
      specific_speed: flowRate
    }
    return psatAddon.pumpEfficiency(inputs);
  }

  motorPerformance(
    lineFreq,
    efficiencyClass,
    horsePower,
    motorRPM,
    efficiency,
    motorVoltage,
    fullLoadAmps
  ) {
    let tmpInputs: any;
    let lineFreqEnum = this.getLineFreqEnum(lineFreq);
    let effClassEnum = this.getEfficienyClassEnum(efficiencyClass);
    tmpInputs = {
      line_frequency: lineFreqEnum,
      efficiency_class: effClassEnum,
      motor_rated_power: horsePower,
      motor_rated_speed: motorRPM,
      efficiency: efficiency,
      load_factor: .25,
      motor_rated_voltage: motorVoltage,
      motor_rated_fla: fullLoadAmps
    }
    return psatAddon.motorPerformance(tmpInputs);
  }

  //loadFactor hard coded to 1
  nema(
    lineFreq,
    motorRPM,
    efficiencyClass,
    efficiency,
    horsePower
  ) {
    let tmpInputs: any;
    let lineFreqEnum = this.getLineFreqEnum(lineFreq);
    let effClassEnum = this.getEfficienyClassEnum(efficiencyClass);
    tmpInputs = {
      line_frequency: lineFreqEnum,
      motor_rated_speed: motorRPM,
      efficiency_class: effClassEnum,
      efficiency: efficiency,
      motor_rated_power: horsePower,
      loadFactor: 1
    };
    return psatAddon.nema(tmpInputs);
  }

  //ENUM HELPERS
  getPumpStyleEnum(pumpStyle: string) {
    // enum class Style {
    // END_SUCTION_SLURRY,
    // END_SUCTION_SEWAGE,
    // END_SUCTION_STOCK,
    // END_SUCTION_SUBMERSIBLE_SEWAGE,
    // API_DOUBLE_SUCTION,
    // MULTISTAGE_BOILER_FEED,
    // END_SUCTION_ANSI_API,
    // AXIAL_FLOW,
    // DOUBLE_SUCTION,
    // VERTICAL_TURBINE,
    // LARGE_END_SUCTION,
    // SPECIFIED_OPTIMAL_EFFICIENCY
    // }
    let enumPumpStyle: number = 0;
    if (pumpStyle == 'End Suction Slurry') {
      enumPumpStyle = 0;
    }
    else if (pumpStyle == 'End Suction Sewage') {
      enumPumpStyle = 1;
    }
    else if (pumpStyle == 'End Suction Stock') {
      enumPumpStyle = 2;
    }
    else if (pumpStyle == 'API Double Suction') {
      enumPumpStyle = 3;
    }
    else if (pumpStyle == 'Multistage Boiler Feed') {
      enumPumpStyle = 4;
    }
    else if (pumpStyle == 'End Suction ANSI/API') {
      enumPumpStyle = 5;
    }
    else if (pumpStyle == 'Axial Flow') {
      enumPumpStyle = 6;
    }
    else if (pumpStyle == 'Double Suction') {
      enumPumpStyle = 7;
    }
    else if (pumpStyle == 'Vertical Turbine') {
      enumPumpStyle = 8;
    }
    else if (pumpStyle == 'Large End Suction') {
      enumPumpStyle = 9;
    }
    return enumPumpStyle;
  }

  getLineFreqEnum(lineFreq: string) {
    let lineFreqEnum: number;
    if (lineFreq == '60 Hz') {
      lineFreqEnum = 0;
    } else if (lineFreq == '50 Hz') {
      lineFreqEnum = 1;
    }
    return lineFreqEnum;
  }

  getEfficienyClassEnum(effClass: string) {
    let effEnum: number;
    if (effClass == 'Standard') {
      effEnum = 0;
    } else if (effClass == 'Energy Efficient') {
      effEnum = 1;
    } else if (effClass == 'Specified') {
      effEnum = 3;
    }
    return effEnum;
  }

  getEfficiencyFromForm(form: any) {
    let efficiency;
    if (form.value.efficiencyClass == 'Standard') {
      efficiency = 0;
    } else if (form.value.efficiencyClass == 'Energy Efficient') {
      efficiency = 1;
    } else if (form.value.efficiencyClass == 'Specified') {
      efficiency = form.value.efficiency;
    }
    return efficiency;
  }

  
  //PSAT FORM UTILITIES
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
      'fullLoadAmps': [psatInputs.motor_rated_fla, Validators.required],
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
    let efficiency = this.getEfficiencyFromForm(form);
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
      motor_rated_fla: form.value.fullLoadAmps,
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
