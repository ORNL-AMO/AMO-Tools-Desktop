import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT, PsatInputs, PsatOutputs, PsatCalcResults } from '../shared/models/psat';
//import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
declare var psatAddon: any;

@Injectable()
export class PsatService {

  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { }
  //CALCULATORS
  results(psatInputs: PsatInputs, settings: Settings): PsatOutputs {
    if (settings.distanceMeasurement != 'ft') {
      psatInputs.head = this.convertUnitsService.value(psatInputs.head).from(settings.distanceMeasurement).to('ft');
    }
    if (settings.flowMeasurement != 'gpm') {
      psatInputs.flow_rate = this.convertUnitsService.value(psatInputs.flow_rate).from(settings.flowMeasurement).to('gpm');
    }
    let tmpResults = psatAddon.results(psatInputs);
    let tmpOutputs: PsatOutputs = this.parseResults(tmpResults);
    return tmpOutputs;
  }

  parseResults(results: PsatCalcResults): PsatOutputs {
    let tmpOutputs: PsatOutputs = {
      existing: {
        pump_efficiency: results.pump_efficiency[0],
        motor_rated_power: results.motor_rated_power[0],
        motor_shaft_power: results.motor_shaft_power[0],
        pump_shaft_power: results.pump_shaft_power[0],
        motor_efficiency: results.motor_efficiency[0],
        motor_power_factor: results.motor_power_factor[0],
        motor_current: results.motor_current[0],
        motor_power: results.motor_power[0],
        annual_energy: results.annual_energy[0],
        annual_cost: results.annual_cost[0],
        annual_savings_potential: results.annual_savings_potential[0],
        optimization_rating: results.optimization_rating[0]
      },
      optimal: {
        pump_efficiency: results.pump_efficiency[1],
        motor_rated_power: results.motor_rated_power[1],
        motor_shaft_power: results.motor_shaft_power[1],
        pump_shaft_power: results.pump_shaft_power[1],
        motor_efficiency: results.motor_efficiency[1],
        motor_power_factor: results.motor_power_factor[1],
        motor_current: results.motor_current[1],
        motor_power: results.motor_power[1],
        annual_energy: results.annual_energy[1],
        annual_cost: results.annual_cost[1],
        annual_savings_potential: results.annual_savings_potential[1],
        optimization_rating: results.optimization_rating[1]
      }
    }
    return tmpOutputs;
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
    dischargeLineLossCoefficients: number,
    settings: Settings
  ) {
    //desired units
    //flowRate = gpm
    //suctionPipeDiameter = feet
    //suctionTankGasOverPressure = psi
    //suctionTankFluidSurfaceElevation = feet
    //dischargePipeDiameter = feet
    //dischargeGaugePressure = psi
    //dischargeGaugeElevation = feet

    if (settings.distanceMeasurement == 'ft') {
      suctionPipeDiameter = this.convertUnitsService.value(suctionPipeDiameter).from('in').to('ft');
      dischargePipeDiameter = this.convertUnitsService.value(dischargePipeDiameter).from('in').to('ft');
    } else {
      suctionPipeDiameter = this.convertUnitsService.value(suctionPipeDiameter).from('mm').to('ft');
      dischargePipeDiameter = this.convertUnitsService.value(dischargePipeDiameter).from('mm').to('ft');
      suctionTankFluidSurfaceElevation = this.convertUnitsService.value(suctionTankFluidSurfaceElevation).from('m').to('ft');
      dischargeGaugeElevation = this.convertUnitsService.value(dischargeGaugeElevation).from('m').to('ft');
    }

    if (settings.pressureMeasurement != 'psi') {
      suctionTankGasOverPressure = this.convertUnitsService.value(suctionTankGasOverPressure).from(settings.pressureMeasurement).to('psi');
      dischargeGaugePressure = this.convertUnitsService.value(dischargeGaugePressure).from(settings.pressureMeasurement).to('psi');
    }

    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }
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
    dischargeLineLossCoefficients: number,
    settings: Settings
  ) {
    //flowRate = gpm
    //suctionPipeDiameter = feet
    //suctionGuagePressure = psi
    //suctionGuageElevation = feet
    //dischargePipeDiameter = feet
    //dischargeGaugePressure = psi
    //dischargeGaugeElevation = feet
    if (settings.distanceMeasurement == 'ft') {
      suctionPipeDiameter = this.convertUnitsService.value(suctionPipeDiameter).from('in').to('ft');
      dischargePipeDiameter = this.convertUnitsService.value(dischargePipeDiameter).from('in').to('ft');
    } else {
      suctionPipeDiameter = this.convertUnitsService.value(suctionPipeDiameter).from('mm').to('ft');
      dischargePipeDiameter = this.convertUnitsService.value(dischargePipeDiameter).from('mm').to('ft');
      suctionGuageElevation = this.convertUnitsService.value(suctionGuageElevation).from('m').to('ft');
      dischargeGaugeElevation = this.convertUnitsService.value(dischargeGaugeElevation).from('m').to('ft');
    }

    if (settings.pressureMeasurement != 'psi') {
      suctionGuagePressure = this.convertUnitsService.value(suctionGuagePressure).from(settings.pressureMeasurement).to('psi');
      dischargeGaugePressure = this.convertUnitsService.value(dischargeGaugePressure).from(settings.pressureMeasurement).to('psi');
    }

    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }
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

  //specific speed
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

  ///achievable pump efficiency
  pumpEfficiency(
    pumpStyle: string,
    flowRate: number,
    settings: Settings
  ) {
    //flow rate = 'gpm'
    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }
    let inputs: any;
    let enumPumpStyle = this.getPumpStyleEnum(pumpStyle);
    inputs = {
      pump_style: enumPumpStyle,
      flow_rate: flowRate
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
    fullLoadAmps,
    loadFactor
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
      load_factor: loadFactor,
      motor_rated_voltage: motorVoltage,
      motor_rated_fla: fullLoadAmps
    }
    return psatAddon.motorPerformance(tmpInputs);
  }

  motorPerformancePsat(psatInputs: PsatInputs) {
    psatInputs.load_factor = 1;
    return psatAddon.motorPerformance(psatInputs);
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
      load_factor: 1
    };
    return psatAddon.nema(tmpInputs);
  }

  nemaPsat(psatInputs: PsatInputs) {
    let tmpInputs: any = {
      line_frequency: psatInputs.line_frequency,
      motor_rated_speed: psatInputs.motor_rated_speed,
      efficiency_class: psatInputs.efficiency_class,
      efficiency: psatInputs.efficiency,
      motor_rated_power: psatInputs.motor_rated_power,
      load_factor: 1
    };
    return psatAddon.nema(tmpInputs);
  }

  //ENUM HELPERS
  getPumpStyleEnum(pumpStyle: string): number {
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
    let enumPumpStyle;
    if (pumpStyle == 'End Suction Slurry') {
      enumPumpStyle = 0;
    }
    else if (pumpStyle == 'End Suction Sewage') {
      enumPumpStyle = 1;
    }
    else if (pumpStyle == 'End Suction Stock') {
      enumPumpStyle = 2;
    }
    else if (pumpStyle == 'End Suction Submersible Sewage') {
      enumPumpStyle = 3;
    }
    else if (pumpStyle == 'API Double Suction') {
      enumPumpStyle = 4;
    }
    else if (pumpStyle == 'Multistage Boiler Feed') {
      enumPumpStyle = 5;
    }
    else if (pumpStyle == 'End Suction ANSI/API') {
      enumPumpStyle = 6;
    }
    else if (pumpStyle == 'Axial Flow') {
      enumPumpStyle = 7;
    }
    else if (pumpStyle == 'Double Suction') {
      enumPumpStyle = 8;
    }
    else if (pumpStyle == 'Vertical Turbine') {
      enumPumpStyle = 9;
    }
    else if (pumpStyle == 'Large End Suction') {
      enumPumpStyle = 10;
    }
    return enumPumpStyle;
  }
  getPumpStyleFromEnum(num: number): string {
    let pumpStyle;
    if (num == 0) {
      pumpStyle = 'End Suction Slurry';
    }
    else if (num == 1) {
      pumpStyle = 'End Suction Sewage';
    }
    else if (num == 2) {
      pumpStyle = 'End Suction Stock';
    }
    else if (num == 3) {
      pumpStyle = 'End Suction Submersible Sewage';
    }
    else if (num == 4) {
      pumpStyle = 'API Double Suction';
    }
    else if (num == 5) {
      pumpStyle = 'Multistage Boiler Feed';
    }
    else if (num == 6) {
      pumpStyle = 'End Suction ANSI/API';
    }
    else if (num == 7) {
      pumpStyle = 'Axial Flow';
    }
    else if (num == 8) {
      pumpStyle = 'Double Suction';
    }
    else if (num == 9) {
      pumpStyle = 'Vertical Turbine';
    }
    else if (num == 10) {
      pumpStyle = 'Large End Suction';
    }
    return pumpStyle;
  }
  getLineFreqEnum(lineFreq: string): number {
    let lineFreqEnum: number;
    if (lineFreq == '60 Hz') {
      lineFreqEnum = 0;
    } else if (lineFreq == '50 Hz') {
      lineFreqEnum = 1;
    }
    return lineFreqEnum;
  }
  getLineFreqFromEnum(num: number): string {
    let lineFreq;
    if (num == 0) {
      lineFreq = '60 Hz';
    } else if (num == 1) {
      lineFreq = '50 Hz';
    }
    return lineFreq;
  }
  getEfficienyClassEnum(effClass: string): number {
    let effEnum: number;
    if (effClass == 'Standard Efficiency') {
      effEnum = 0;
    } else if (effClass == 'Energy Efficient') {
      effEnum = 1;
    } else if (effClass == 'Specified') {
      effEnum = 2;
    }
    return effEnum;
  }
  getEfficiencyClassFromEnum(num: number): string {
    let effClass;
    if (num == 0) {
      effClass = 'Standard Efficiency';
    } else if (num == 1) {
      effClass = 'Energy Efficient';
    } else if (num == 2) {
      effClass = 'Specified';
    }
    return effClass;
  }
  getDriveEnum(drive: string): number {
    let driveEnum;
    if (drive == 'Direct Drive') {
      driveEnum = 0;
    } else if (drive == 'Belt Drive') {
      driveEnum = 1;
    }
    return driveEnum;
  }
  getDriveFromEnum(num: number): string {
    let drive;
    if (num == 0) {
      drive = 'Direct Drive';
    } else if (num == 1) {
      drive = 'Belt Drive';
    }
    return drive;
  }
  getFixedSpeedEmum(fixedSpeed: string): number {
    let fixedSpeedEnum;
    if (fixedSpeed == 'Yes') {
      fixedSpeedEnum = 0;
    } else if (fixedSpeed == 'No') {
      fixedSpeedEnum = 1;
    }
    return fixedSpeedEnum;
  }
  getFixedSpeedFromEnum(num: number): string {
    let fixedSpeed;
    if (num == 0) {
      fixedSpeed = 'Yes';
    }
    else if (num == 1) {
      fixedSpeed = 'No';
    }
    return fixedSpeed;
  }
  getLoadEstimationEnum(method: string): number {
    let methodEnum;
    if (method == 'Power') {
      methodEnum = 0;
    } else if (method == 'Current') {
      methodEnum = 1;
    }
    return methodEnum;
  }
  getLoadEstimationFromEnum(num: number): string {
    let method;
    if (num == 0) {
      method = 'Power';
    } else if (num == 1) {
      method = 'Current';
    }
    return method;
  }
  getEfficiencyFromForm(form: any) {
    let efficiency;
    if (form.value.efficiencyClass == 'Standard Efficiency') {
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
      'efficiency': [''],
      'motorVoltage': ['', Validators.required],
      'fullLoadAmps': ['', Validators.required],
      'sizeMargin': ['', Validators.required],
      'operatingFraction': ['', Validators.required],
      'costKwHr': ['', Validators.required],
      'flowRate': ['', Validators.required],
      'head': ['', Validators.required],
      'loadEstimatedMethod': ['', Validators.required],
      'motorKW': ['', Validators.required],
      'motorAmps': ['', Validators.required],
      'measuredVoltage': ['', Validators.required]
    })
  }

  getFormFromPsat(psatInputs: PsatInputs) {
    let pumpStyle = this.getPumpStyleFromEnum(psatInputs.pump_style);
    let lineFreq = this.getLineFreqFromEnum(psatInputs.line_frequency);
    let effClass = this.getEfficiencyClassFromEnum(psatInputs.efficiency_class);
    let drive = this.getDriveFromEnum(psatInputs.drive);
    let fixedSpeed = this.getFixedSpeedFromEnum(psatInputs.fixed_speed);
    let loadEstMethod = this.getLoadEstimationFromEnum(psatInputs.load_estimation_method);

    return this.formBuilder.group({
      'pumpType': [pumpStyle, Validators.required],
      'specifiedPumpType': [psatInputs.pump_specified, Validators.required],
      'pumpRPM': [psatInputs.pump_rated_speed, Validators.required],
      'drive': [drive, Validators.required],
      'viscosity': [psatInputs.kinematic_viscosity, Validators.required],
      'gravity': [psatInputs.specific_gravity, Validators.required],
      'stages': [psatInputs.stages, Validators.required],
      'fixedSpeed': [fixedSpeed, Validators.required],
      'frequency': [lineFreq, Validators.required],
      'horsePower': [psatInputs.motor_rated_power, Validators.required],
      'motorRPM': [psatInputs.motor_rated_speed, Validators.required],
      'efficiencyClass': [effClass, Validators.required],
      'efficiency': [psatInputs.efficiency],
      'motorVoltage': [psatInputs.motor_rated_voltage, Validators.required],
      'fullLoadAmps': [psatInputs.motor_rated_fla, Validators.required],
      'sizeMargin': [psatInputs.margin, Validators.required],
      'operatingFraction': [psatInputs.operating_fraction, Validators.required],
      'costKwHr': [psatInputs.cost_kw_hour, Validators.required],
      'flowRate': [psatInputs.flow_rate, Validators.required],
      'head': [psatInputs.head, Validators.required],
      'loadEstimatedMethod': [loadEstMethod, Validators.required],
      'motorKW': [psatInputs.motor_field_power, Validators.required],
      'motorAmps': [psatInputs.motor_field_current, Validators.required],
      'measuredVoltage': [psatInputs.motor_field_voltage, Validators.required]
    })
  }

  getPsatInputsFromForm(form: any): PsatInputs {
    let efficiency = this.getEfficiencyFromForm(form);
    let lineFreqEnum = this.getLineFreqEnum(form.value.frequency);
    let pumpStyleEnum = this.getPumpStyleEnum(form.value.pumpType);
    let efficiencyClassEnum = this.getEfficienyClassEnum(form.value.efficiencyClass);
    let driveEnum = this.getDriveEnum(form.value.drive);
    let fixedSpeedEnum = this.getFixedSpeedEmum(form.value.fixedSpeed);
    let loadEstMethodEnum = this.getLoadEstimationEnum(form.value.loadEstimatedMethod);

    let tmpPsatInputs: PsatInputs = {
      pump_style: pumpStyleEnum,
      pump_specified: form.value.specifiedPumpType,
      pump_rated_speed: form.value.pumpRPM,
      drive: driveEnum,
      kinematic_viscosity: form.value.viscosity,
      specific_gravity: form.value.gravity,
      stages: form.value.stages,
      fixed_speed: fixedSpeedEnum,
      line_frequency: lineFreqEnum,
      motor_rated_power: form.value.horsePower,
      motor_rated_speed: form.value.motorRPM,
      efficiency_class: efficiencyClassEnum,
      efficiency: efficiency,
      motor_rated_voltage: form.value.motorVoltage,
      load_estimation_method: loadEstMethodEnum,
      motor_rated_fla: form.value.fullLoadAmps,
      margin: form.value.sizeMargin,
      operating_fraction: form.value.operatingFraction,
      flow_rate: form.value.flowRate,
      head: form.value.head,
      motor_field_power: form.value.motorKW,
      motor_field_current: form.value.motorAmps,
      motor_field_voltage: form.value.measuredVoltage,
      cost_kw_hour: form.value.costKwHr,
      cost: form.value.costKwHr
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
      if (form.value.efficiencyClass != 'Specified') {
        return true;
      } else {
        if (form.value.efficiency) {
          return true;
        } else {
          return false;
        }
      }
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
