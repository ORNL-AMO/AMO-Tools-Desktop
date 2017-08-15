import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT, PsatInputs, PsatOutputs, PsatCalcResults, PsatOutputsExistingOptimal } from '../shared/models/psat';
//import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { ValidationService } from '../shared/validation.service';
declare var psatAddon: any;
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class PsatService {
  flaRange: any = {
    flaMin: 0,
    flaMax: 0
  };

  mainTab: BehaviorSubject<string>;
  secondaryTab: BehaviorSubject<string>;
  baseline: PSAT;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private validationService: ValidationService) {
    this.mainTab = new BehaviorSubject<string>('system-setup');
    this.secondaryTab = new BehaviorSubject<string>('explore-opportunities');
  }

  test() {
    console.log(psatAddon);
  }

  roundVal(val: number, digits: number) {
    return Number((Math.round(val * 100) / 100).toFixed(digits))
  }

  convertInputs(psatInputs: PsatInputs, settings: Settings) {
    if (settings.distanceMeasurement != 'ft' && psatInputs.head) {
      psatInputs.head = this.convertUnitsService.value(psatInputs.head).from(settings.distanceMeasurement).to('ft');
    }
    if (settings.flowMeasurement != 'gpm' && psatInputs.flow_rate) {
      psatInputs.flow_rate = this.convertUnitsService.value(psatInputs.flow_rate).from(settings.flowMeasurement).to('gpm');
    }
    if (settings.powerMeasurement != 'hp' && psatInputs.motor_rated_power) {
      psatInputs.motor_rated_power = this.convertUnitsService.value(psatInputs.motor_rated_power).from(settings.powerMeasurement).to('hp');
    }
    return psatInputs;
  }

  convertOutputs(psatOutputs: PsatOutputs, settings: Settings): PsatOutputs {
    if (settings.powerMeasurement != 'hp') {
      psatOutputs.motor_rated_power = this.convertUnitsService.value(psatOutputs.motor_rated_power).from('hp').to(settings.powerMeasurement);
      psatOutputs.motor_shaft_power = this.convertUnitsService.value(psatOutputs.motor_shaft_power).from('hp').to(settings.powerMeasurement);
      psatOutputs.pump_shaft_power = this.convertUnitsService.value(psatOutputs.pump_shaft_power).from('hp').to(settings.powerMeasurement);
    }
    return psatOutputs;
  }

  //results
  resultsExisting(psatInputs: PsatInputs, settings: Settings): PsatOutputs {
    psatInputs = this.convertInputs(psatInputs, settings);
    //call results existing
    let tmpResults: PsatOutputs = psatAddon.resultsExisting(psatInputs);
    if (settings.powerMeasurement != 'hp') {
      tmpResults = this.convertOutputs(tmpResults, settings);
    }
    tmpResults = this.roundResults(tmpResults);
    return tmpResults;
  }

  resultsOptimal(psatInputs: PsatInputs, settings: Settings): PsatOutputs {
    psatInputs = this.convertInputs(psatInputs, settings);
    //call addon resultsOptimal
    let tmpResults: PsatOutputs = psatAddon.resultsOptimal(psatInputs);
    if (settings.powerMeasurement != 'hp') {
      tmpResults = this.convertOutputs(tmpResults, settings);
    }
    tmpResults = this.roundResults(tmpResults);
    return tmpResults
  }

  resultsModified(psatInputs: PsatInputs, settings: Settings, baseline_pump_efficiency: number): PsatOutputs {
    let tmpInputs: any;
    tmpInputs = psatInputs;
    tmpInputs.baseline_pump_efficiency = baseline_pump_efficiency;
    let tmpResults: PsatOutputs = psatAddon.resultsModified(tmpInputs);
    console.log(tmpResults);
    if (settings.powerMeasurement != 'hp') {
      tmpResults = this.convertOutputs(tmpResults, settings);
    }
    tmpResults = this.roundResults(tmpResults);
    return tmpResults;
  }

  roundResults(psatResults: PsatOutputs): PsatOutputs {
    let roundResults: PsatOutputs = {
      pump_efficiency: this.roundVal(psatResults.pump_efficiency, 2),
      motor_rated_power: this.roundVal(psatResults.motor_rated_power, 2),
      motor_shaft_power: this.roundVal(psatResults.motor_shaft_power, 2),
      pump_shaft_power: this.roundVal(psatResults.pump_shaft_power, 2),
      motor_efficiency: this.roundVal(psatResults.motor_efficiency, 2),
      motor_power_factor: this.roundVal(psatResults.motor_power_factor, 2),
      motor_current: this.roundVal(psatResults.motor_current, 2),
      motor_power: this.roundVal(psatResults.motor_power, 2),
      annual_energy: this.roundVal(psatResults.annual_energy, 2),
      annual_cost: this.roundVal(psatResults.annual_cost, 2),
      annual_savings_potential: this.roundVal(psatResults.annual_savings_potential, 0),
      optimization_rating: this.roundVal(psatResults.optimization_rating, 2)
    }
    return psatResults;
  }

  resultsExistingAndOptimal(psatInputs: PsatInputs, settings: Settings): PsatOutputsExistingOptimal {
    psatInputs = this.convertInputs(psatInputs, settings);

    let tmpResults = psatAddon.resultsExistingAndOptimal(psatInputs);

    if (settings.powerMeasurement != 'hp') {
      tmpResults.motor_rated_power[0] = this.convertUnitsService.value(tmpResults.motor_rated_power[0]).from('hp').to(settings.powerMeasurement);
      tmpResults.motor_rated_power[1] = this.convertUnitsService.value(tmpResults.motor_rated_power[1]).from('hp').to(settings.powerMeasurement);

      tmpResults.motor_shaft_power[0] = this.convertUnitsService.value(tmpResults.motor_shaft_power[0]).from('hp').to(settings.powerMeasurement);
      tmpResults.motor_shaft_power[1] = this.convertUnitsService.value(tmpResults.motor_shaft_power[1]).from('hp').to(settings.powerMeasurement);

      tmpResults.pump_shaft_power[0] = this.convertUnitsService.value(tmpResults.pump_shaft_power[0]).from('hp').to(settings.powerMeasurement);
      tmpResults.pump_shaft_power[1] = this.convertUnitsService.value(tmpResults.pump_shaft_power[1]).from('hp').to(settings.powerMeasurement);

    }
    let tmpOutputs: PsatOutputsExistingOptimal = this.parseResultsExistingOptimal(tmpResults);
    return tmpOutputs;
  }

  parseResultsExistingOptimal(results: PsatCalcResults): PsatOutputsExistingOptimal {
    let tmpOutputs: PsatOutputsExistingOptimal = {
      existing: {
        pump_efficiency: this.roundVal(results.pump_efficiency[0], 2),
        motor_rated_power: this.roundVal(results.motor_rated_power[0], 2),
        motor_shaft_power: this.roundVal(results.motor_shaft_power[0], 2),
        pump_shaft_power: this.roundVal(results.pump_shaft_power[0], 2),
        motor_efficiency: this.roundVal(results.motor_efficiency[0], 2),
        motor_power_factor: this.roundVal(results.motor_power_factor[0], 2),
        motor_current: this.roundVal(results.motor_current[0], 2),
        motor_power: this.roundVal(results.motor_power[0], 2),
        annual_energy: this.roundVal(results.annual_energy[0], 2),
        annual_cost: this.roundVal(results.annual_cost[0], 2),
        annual_savings_potential: this.roundVal(results.annual_savings_potential[0], 0),
        optimization_rating: this.roundVal(results.optimization_rating[0], 2)
      },
      optimal: {
        pump_efficiency: this.roundVal(results.pump_efficiency[1], 2),
        motor_rated_power: this.roundVal(results.motor_rated_power[1], 2),
        motor_shaft_power: this.roundVal(results.motor_shaft_power[1], 2),
        pump_shaft_power: this.roundVal(results.pump_shaft_power[1], 2),
        motor_efficiency: this.roundVal(results.motor_efficiency[1], 2),
        motor_power_factor: this.roundVal(results.motor_power_factor[1], 2),
        motor_current: this.roundVal(results.motor_current[1], 2),
        motor_power: this.roundVal(results.motor_power[1], 2),
        annual_energy: this.roundVal(results.annual_energy[1], 2),
        annual_cost: this.roundVal(results.annual_cost[1], 2),
        annual_savings_potential: this.roundVal(results.annual_savings_potential[1], 0),
        optimization_rating: this.roundVal(results.optimization_rating[1], 2)
      }
    }
    return tmpOutputs;
  }
  //CALCULATORS
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
    //suctionPipeDiameter = in
    //suctionTankGasOverPressure = psi
    //suctionTankFluidSurfaceElevation = feet
    //dischargePipeDiameter = feet
    //dischargeGaugePressure = psi
    //dischargeGaugeElevation = feet

    if (settings.distanceMeasurement != 'ft') {
      suctionPipeDiameter = this.convertUnitsService.value(suctionPipeDiameter).from('mm').to('in');
      dischargePipeDiameter = this.convertUnitsService.value(dischargePipeDiameter).from('mm').to('in');
      suctionTankFluidSurfaceElevation = this.convertUnitsService.value(suctionTankFluidSurfaceElevation).from('m').to('ft');
      dischargeGaugeElevation = this.convertUnitsService.value(dischargeGaugeElevation).from('m').to('ft');
    }

    // if (settings.pressureMeasurement != 'psi') {
    //   suctionTankGasOverPressure = this.convertUnitsService.value(suctionTankGasOverPressure).from(settings.pressureMeasurement).to('psi');
    //   dischargeGaugePressure = this.convertUnitsService.value(dischargeGaugePressure).from(settings.pressureMeasurement).to('psi');
    // }

    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }

    let tmpResults = psatAddon.headToolSuctionTank(specificGravity, flowRate, suctionPipeDiameter, suctionTankGasOverPressure, suctionTankFluidSurfaceElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let results = {
      differentialElevationHead: this.roundVal(tmpResults.differentialElevationHead, 2),
      differentialPressureHead: this.roundVal(tmpResults.differentialPressureHead, 2),
      differentialVelocityHead: this.roundVal(tmpResults.differentialVelocityHead, 2),
      estimatedDischargeFrictionHead: this.roundVal(tmpResults.estimatedDischargeFrictionHead, 2),
      estimatedSuctionFrictionHead: this.roundVal(tmpResults.estimatedSuctionFrictionHead, 2),
      pumpHead: this.roundVal(tmpResults.pumpHead, 2)
    }
    return results;
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
    //suctionPipeDiameter = in
    //suctionGuagePressure = psi
    //suctionGuageElevation = feet
    //dischargePipeDiameter = in
    //dischargeGaugePressure = psi
    //dischargeGaugeElevation = feet
    if (settings.distanceMeasurement != 'ft') {
      suctionPipeDiameter = this.convertUnitsService.value(suctionPipeDiameter).from('mm').to('in');
      dischargePipeDiameter = this.convertUnitsService.value(dischargePipeDiameter).from('mm').to('in');
      suctionGuageElevation = this.convertUnitsService.value(suctionGuageElevation).from('m').to('ft');
      dischargeGaugeElevation = this.convertUnitsService.value(dischargeGaugeElevation).from('m').to('ft');
    }

    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }
    let tmpResults = psatAddon.headTool(specificGravity, flowRate, suctionPipeDiameter, suctionGuagePressure, suctionGuageElevation, suctionLineLossCoefficients, dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
    let results = {
      differentialElevationHead: this.roundVal(tmpResults.differentialElevationHead, 2),
      differentialPressureHead: this.roundVal(tmpResults.differentialPressureHead, 2),
      differentialVelocityHead: this.roundVal(tmpResults.differentialVelocityHead, 2),
      estimatedDischargeFrictionHead: this.roundVal(tmpResults.estimatedDischargeFrictionHead, 2),
      estimatedSuctionFrictionHead: this.roundVal(tmpResults.estimatedSuctionFrictionHead, 2),
      pumpHead: this.roundVal(tmpResults.pumpHead, 2)
    }
    return results;
  }

  estFLA(
    horsePower,
    motorRPM,
    frequency,
    efficiencyClass,
    efficiency,
    motorVoltage,
    settings: Settings
  ) {
    if (settings.powerMeasurement != 'hp') {
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
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
    return this.roundVal(psatAddon.estFLA(inputs), 2);

  }

  getFlaRange() {
    return this.flaRange;
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
    return this.roundVal(psatAddon.achievableEfficiency(inputs), 2);
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
    let tmpResults = psatAddon.pumpEfficiency(inputs);
    let results = {
      average: this.roundVal(tmpResults.average, 2),
      max: this.roundVal(tmpResults.max, 2)
    }
    return results;
  }

  motorPerformance(
    lineFreq,
    efficiencyClass,
    horsePower,
    motorRPM,
    efficiency,
    motorVoltage,
    fullLoadAmps,
    loadFactor,
    settings
  ) {

    if (settings.powerMeasurement != 'hp') {
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
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
    let tmpResults = psatAddon.motorPerformance(tmpInputs);
    let results = {
      efficiency: this.roundVal(tmpResults.efficiency, 2),
      motor_current: this.roundVal(tmpResults.motor_current, 2),
      motor_power_factor: this.roundVal(tmpResults.motor_power_factor, 2)
    }
    return results;
  }

  //loadFactor hard coded to 1
  nema(
    lineFreq,
    motorRPM,
    efficiencyClass,
    efficiency,
    horsePower,
    settings: Settings
  ) {
    if (settings.powerMeasurement != 'hp') {
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
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
    return this.roundVal(psatAddon.nema(tmpInputs), 2);
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
    } else if (pumpStyle == 'Specified Optimal Efficiency') {
      enumPumpStyle = 11;
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
    else if (num == 11) {
      pumpStyle = 'Specified Optimal Efficiency';
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

  getLineFreqNumValueFromEnum(num: number): number {
    let lineFreq;
    if (num == 0) {
      lineFreq = 60;
    } else if (num == 1) {
      lineFreq = 50;
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
      'specifiedPumpEfficiency': ['', Validators.required],
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
      'measuredVoltage': ['', Validators.required],
      'optimizeCalculation': ['', Validators.required]
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
      'specifiedPumpEfficiency': [psatInputs.pump_specified, Validators.required],
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
      'measuredVoltage': [psatInputs.motor_field_voltage, Validators.required],
      'optimizeCalculation': [psatInputs.optimize_calculation, Validators.required]
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
      pump_specified: form.value.specifiedPumpEfficiency,
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
      cost: form.value.costKwHr,
      optimize_calculation: form.value.optimizeCalculation
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
      if (form.value.pumpType != "Specified Optimal Efficiency") {
        return true;
      } else {
        if (form.controls.specifiedPumpEfficiency.status == 'VALID') {
          return true;
        } else {
          return false;
        }
      }
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
        if (form.value.efficiency > 0 && form.value.efficiency <= 100) {
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

  checkFlowRate(pumpStyle: number, flowRate: number, settings: Settings) {
    let tmpFlowRate;
    let response = {
      valid: null,
      message: null
    };
    //convert
    if (settings.flowMeasurement != 'gpm') {
      tmpFlowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    } else {
      tmpFlowRate = flowRate;
    }
    //get min max
    let flowRateRange = this.getFlowRateMinMax(pumpStyle);
    //check in range
    if (tmpFlowRate >= flowRateRange.min && tmpFlowRate <= flowRateRange.max) {
      response.valid = true;
      return response;
    } else if (tmpFlowRate < flowRateRange.min) {
      response.valid = false;
      response.message = 'Flow Rate too Small for Selected Pump Style';
      return response;
    } else if (tmpFlowRate > flowRateRange.max) {
      response.valid = false;
      response.message = 'Flow Rate too Large for Selected Pump Style';
      return response;
    } else {
      return response;
    }
  }

  getFlowRateMinMax(pumpStyle: number) {
    //min/max values from Daryl
    let flowRate = {
      min: 1,
      max: 10000000000000000000
    }
    if (pumpStyle == 0) {
      flowRate.min = 100;
      flowRate.max = 20000;
      return flowRate;
    }
    else if (pumpStyle == 1 || pumpStyle == 3) {
      flowRate.min = 100;
      flowRate.max = 22500;
      return flowRate;
    } else if (pumpStyle == 2 || pumpStyle == 4) {
      flowRate.min = 400;
      flowRate.max = 22000;
      return flowRate;
    } else if (pumpStyle == 5) {
      flowRate.min = 100;
      flowRate.max = 4000;
      return flowRate;
    } else if (pumpStyle == 6) {
      flowRate.min = 100;
      flowRate.max = 5000;
      return flowRate;
    } else if (pumpStyle == 10) {
      flowRate.min = 5000;
      flowRate.max = 100000;
      return flowRate;
    } else if (pumpStyle == 8) {
      flowRate.min = 200;
      flowRate.max = 100000;
      return flowRate;
    } else if (pumpStyle == 7 || pumpStyle == 9) {
      flowRate.min = 200;
      flowRate.max = 40000;
      return flowRate;
    } else {
      return flowRate;
    }
  }

  checkMotorRpm(lineFreqEnum: number, motorRPM: number) {
    let response = {
      valid: null,
      message: null
    };
    let range = this.getMotorRpmMinMax(lineFreqEnum);
    if (motorRPM >= range.min && motorRPM <= range.max) {
      response.valid = true;
      return response
    } else if (motorRPM < range.min) {
      response.valid = false;
      response.message = 'Motor RPM too Small for Selected Line Frequency';
      return response;
    } else if (motorRPM > range.max) {
      response.valid = false;
      response.message = 'Motor RPM too Latge for Selected Line Frequency';
      return response;
    } else {
      return response;
    }
  }

  getMotorRpmMinMax(lineFreqEnum: number) {
    let rpmRange = {
      min: 0,
      max: 0
    }
    if (lineFreqEnum == 0) {
      rpmRange.min = 540;
      rpmRange.max = 3960;
    } else if (lineFreqEnum == 1) {
      rpmRange.min = 450;
      rpmRange.max = 3300;
    }
    return rpmRange;
  }

  checkMotorVoltage(voltage: number) {
    let response = {
      valid: null,
      message: null
    };

    if (voltage >= 208 && voltage <= 15180) {
      response.valid = true;
      return response;
    } else if (voltage < 208) {
      response.valid = false;
      response.message = "Voltage value is too small."
      return response;
    } else if (voltage > 15180) {
      response.valid = false;
      response.message = "Voltage value is too large";
    } else {
      return response;
    }
  }



}
