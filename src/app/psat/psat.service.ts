import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PSAT, PsatInputs, PsatOutputs, PsatCalcResults, PsatOutputsExistingOptimal } from '../shared/models/psat';
//import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { ValidationService } from '../shared/validation.service';
declare var psatAddon: any;
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MotorService } from './motor/motor.service';
import { FieldDataService } from './field-data/field-data.service';
import { PumpFluidService } from './pump-fluid/pump-fluid.service';
@Injectable()
export class PsatService {
  flaRange: any = {
    flaMin: 0,
    flaMax: 0
  };

  getResults: BehaviorSubject<boolean>;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService, private validationService: ValidationService, private pumpFluidService: PumpFluidService,
    private motorService: MotorService, private fieldDataService: FieldDataService) {
    this.getResults = new BehaviorSubject<boolean>(true);
  }

  test() {
    console.log(psatAddon);
  }

  roundVal(val: number, digits: number) {
    return Number(val.toFixed(digits))
  }

  convertInputs(psatInputs: PsatInputs, settings: Settings) {
    let inputsCpy: PsatInputs = JSON.parse(JSON.stringify(psatInputs));
    if (settings.distanceMeasurement != 'ft' && inputsCpy.head) {
      inputsCpy.head = this.convertUnitsService.value(inputsCpy.head).from(settings.distanceMeasurement).to('ft');
    }
    if (settings.flowMeasurement != 'gpm' && inputsCpy.flow_rate) {
      inputsCpy.flow_rate = this.convertUnitsService.value(inputsCpy.flow_rate).from(settings.flowMeasurement).to('gpm');
    }
    if (settings.powerMeasurement != 'hp' && inputsCpy.motor_rated_power) {
      inputsCpy.motor_rated_power = this.convertUnitsService.value(inputsCpy.motor_rated_power).from(settings.powerMeasurement).to('hp');
    }
    if (settings.temperatureMeasurement != 'F' && inputsCpy.fluidTemperature) {
      inputsCpy.fluidTemperature = this.convertUnitsService.value(inputsCpy.fluidTemperature).from(settings.temperatureMeasurement).to('F');
    }
    return inputsCpy;
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
    let tmpInputs: PsatInputs = this.convertInputs(psatInputs, settings);
    //call results existing
    let tmpResults: PsatOutputs = psatAddon.resultsExisting(tmpInputs);
    if (settings.powerMeasurement != 'hp') {
      tmpResults = this.convertOutputs(tmpResults, settings);
    }
    tmpResults = this.roundResults(tmpResults);
    return tmpResults;
  }

  resultsOptimal(psatInputs: PsatInputs, settings: Settings): PsatOutputs {
    let tmpInputs: PsatInputs = this.convertInputs(psatInputs, settings);

    //call addon resultsOptimal
    let tmpResults: PsatOutputs = psatAddon.resultsOptimal(tmpInputs);
    if (settings.powerMeasurement != 'hp') {
      tmpResults = this.convertOutputs(tmpResults, settings);
    }
    tmpResults = this.roundResults(tmpResults);
    return tmpResults
  }

  resultsModified(psatInputs: PsatInputs, settings: Settings, baseline_pump_efficiency: number): PsatOutputs {
    let tmpInputs: any = this.convertInputs(psatInputs, settings);
    tmpInputs.baseline_pump_efficiency = baseline_pump_efficiency;
    let tmpResults: PsatOutputs = psatAddon.resultsModified(tmpInputs);
    if (settings.powerMeasurement != 'hp') {
      tmpResults = this.convertOutputs(tmpResults, settings);
    }
    tmpResults = this.roundResults(tmpResults);
    return tmpResults;
  }

  emptyResults(): PsatOutputs {
    let results: PsatOutputs = {
      pump_efficiency: 0,
      motor_rated_power: 0,
      motor_shaft_power: 0,
      pump_shaft_power: 0,
      motor_efficiency: 0,
      motor_power_factor: 0,
      motor_current: 0,
      motor_power: 0,
      annual_energy: 0,
      annual_cost: 0,
      annual_savings_potential: 0,
      optimization_rating: 0
    }
    return results;
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
    return roundResults;
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

    if (settings.pressureMeasurement != 'psi') {
      suctionTankGasOverPressure = this.convertUnitsService.value(suctionTankGasOverPressure).from(settings.pressureMeasurement).to('psi');
      dischargeGaugePressure = this.convertUnitsService.value(dischargeGaugePressure).from(settings.pressureMeasurement).to('psi');
    }

    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }

    let inputs: any = {
      specificGravity: specificGravity,
      flowRate: flowRate,
      suctionPipeDiameter: suctionPipeDiameter,
      suctionTankGasOverPressure: suctionTankGasOverPressure,
      suctionTankFluidSurfaceElevation: suctionTankFluidSurfaceElevation,
      suctionLineLossCoefficients: suctionLineLossCoefficients,
      dischargePipeDiameter: dischargePipeDiameter,
      dischargeGaugePressure: dischargeGaugePressure,
      dischargeGaugeElevation: dischargeGaugeElevation,
      dischargeLineLossCoefficients: dischargeLineLossCoefficients
    }

    let tmpResults = psatAddon.headToolSuctionTank(inputs);
    if (settings.distanceMeasurement != 'ft') {
      tmpResults.differentialElevationHead = this.convertUnitsService.value(tmpResults.differentialElevationHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.differentialPressureHead = this.convertUnitsService.value(tmpResults.differentialPressureHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.differentialVelocityHead = this.convertUnitsService.value(tmpResults.differentialVelocityHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.estimatedDischargeFrictionHead = this.convertUnitsService.value(tmpResults.estimatedDischargeFrictionHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.estimatedSuctionFrictionHead = this.convertUnitsService.value(tmpResults.estimatedSuctionFrictionHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.pumpHead = this.convertUnitsService.value(tmpResults.pumpHead).from('ft').to(settings.distanceMeasurement);
    }
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
    suctionGaugePressure: number,
    suctionGaugeElevation: number,
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
      suctionGaugeElevation = this.convertUnitsService.value(suctionGaugeElevation).from('m').to('ft');
      dischargeGaugeElevation = this.convertUnitsService.value(dischargeGaugeElevation).from('m').to('ft');
    }

    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }

    if (settings.pressureMeasurement != 'psi') {
      dischargeGaugePressure = this.convertUnitsService.value(dischargeGaugePressure).from(settings.pressureMeasurement).to('psi');
      suctionGaugePressure = this.convertUnitsService.value(suctionGaugePressure).from(settings.pressureMeasurement).to('psi');
    }

    let inputs: any = {
      specificGravity: specificGravity,
      flowRate: flowRate,
      suctionPipeDiameter: suctionPipeDiameter,
      suctionGaugePressure: suctionGaugePressure,
      suctionGaugeElevation: suctionGaugeElevation,
      suctionLineLossCoefficients: suctionLineLossCoefficients,
      dischargePipeDiameter: dischargePipeDiameter,
      dischargeGaugePressure: dischargeGaugePressure,
      dischargeGaugeElevation: dischargeGaugeElevation,
      dischargeLineLossCoefficients: dischargeLineLossCoefficients
    }

    let tmpResults = psatAddon.headTool(inputs);
    if (settings.distanceMeasurement != 'ft') {
      tmpResults.differentialElevationHead = this.convertUnitsService.value(tmpResults.differentialElevationHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.differentialPressureHead = this.convertUnitsService.value(tmpResults.differentialPressureHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.differentialVelocityHead = this.convertUnitsService.value(tmpResults.differentialVelocityHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.estimatedDischargeFrictionHead = this.convertUnitsService.value(tmpResults.estimatedDischargeFrictionHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.estimatedSuctionFrictionHead = this.convertUnitsService.value(tmpResults.estimatedSuctionFrictionHead).from('ft').to(settings.distanceMeasurement);
      tmpResults.pumpHead = this.convertUnitsService.value(tmpResults.pumpHead).from('ft').to(settings.distanceMeasurement);
    }
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
    horsePower: number,
    motorRPM: number,
    frequency: number,
    efficiencyClass: number,
    efficiency: number,
    motorVoltage: number,
    settings: Settings
  ) {
    if (settings.powerMeasurement != 'hp') {
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
    // let lineFreqEnum = this.getLineFreqEnum(frequency);
    // let effClassEnum = this.getEfficienyClassEnum(efficiencyClass);
    let inputs: any = {
      motor_rated_power: horsePower,
      motor_rated_speed: motorRPM,
      line_frequency: frequency,
      efficiency_class: efficiencyClass,
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
    pumpStyle: number,
    flowRate: number,
    settings: Settings
  ) {
    //flow rate = 'gpm'
    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }
    let inputs: any;
    // let enumPumpStyle = this.getPumpStyleEnum(pumpStyle);
    inputs = {
      pump_style: pumpStyle,
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
  getPumpStyleFromEnum(num: number): number {
    // let pumpStyle;
    // if (num == 0) {
    //   pumpStyle = 'End Suction Slurry';
    // }
    // else if (num == 1) {
    //   pumpStyle = 'End Suction Sewage';
    // }
    // else if (num == 2) {
    //   pumpStyle = 'End Suction Stock';
    // }
    // else if (num == 3) {
    //   pumpStyle = 'End Suction Submersible Sewage';
    // }
    // else if (num == 4) {
    //   pumpStyle = 'API Double Suction';
    // }
    // else if (num == 5) {
    //   pumpStyle = 'Multistage Boiler Feed';
    // }
    // else if (num == 6) {
    //   pumpStyle = 'End Suction ANSI/API';
    // }
    // else if (num == 7) {
    //   pumpStyle = 'Axial Flow';
    // }
    // else if (num == 8) {
    //   pumpStyle = 'Double Suction';
    // }
    // else if (num == 9) {
    //   pumpStyle = 'Vertical Turbine';
    // }
    // else if (num == 10) {
    //   pumpStyle = 'Large End Suction';
    // }
    // else if (num == 11) {
    //   pumpStyle = 'Specified Optimal Efficiency';
    // }
    return num;
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
    if (effClass === 'Standard Efficiency') {
      effEnum = 0;
    } else if (effClass === 'Energy Efficient') {
      effEnum = 1;
    } else if (effClass === 'Premium Efficient' || effClass === 'Premium') {
      effEnum = 2;
    } else if (effClass === 'Specified') {
      effEnum = 3;
    }
    return effEnum;
  }
  getEfficiencyClassFromEnum(num: number): string {
    let effClass;
    if (num === 0) {
      effClass = 'Standard Efficiency';
    } else if (num === 1) {
      effClass = 'Energy Efficient';
    } else if (num === 2) {
      effClass = 'Premium Efficient';
    } else if (num === 3) {
      effClass = 'Specified';
    }
    return effClass;
  }

  getDriveEnum(drive: string): number {
    let driveEnum;
    if (drive == 'Direct Drive') {
      driveEnum = 0;
    } else if (drive == 'V-Belt Drive') {
      driveEnum = 1;
    } else if (drive == 'Notched V-Belt Drive') {
      driveEnum = 2;
    } else if (drive == 'Synchronous Belt Drive') {
      driveEnum = 3;
    } else if (drive == 'Specified Efficiency') {
      driveEnum = 4;
    }
    return driveEnum;
  }
  getDriveFromEnum(num: number): string {
    let drive;
    if (num == 0) {
      drive = 'Direct Drive';
    } else if (num == 1) {
      drive = 'V-Belt Drive';
    } else if (num == 2) {
      drive = 'Notched V-Belt Drive';
    } else if (num == 3) {
      drive = 'Synchronous Belt Drive';
    } else if (num == 4) {
      drive = 'Specified Efficiency';
    }
    return drive;
  }
  getFixedSpeedEmum(fixedSpeed: string): number {
    let fixedSpeedEnum;
    if (fixedSpeed == 'Yes') {
      fixedSpeedEnum = 0;
    } else if (fixedSpeed == 'No') {
      fixedSpeedEnum = 1;
    } else {
      fixedSpeedEnum = 0;
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
    } else {
      fixedSpeed = 'Yes';
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
  getEfficiencyFromForm(form: FormGroup) {
    let efficiency;
    if (form.controls.efficiencyClass.value == 'Standard Efficiency') {
      efficiency = 0;
    } else if (form.controls.efficiencyClass.value == 'Energy Efficient') {
      efficiency = 1;
    } else if (form.controls.efficiencyClass.value === 'Premium Efficient' || form.controls.efficiencyClass.value === 'Premium') {
      efficiency = 2;
    } else if (form.controls.efficiencyClass.value == 'Specified') {
      efficiency = form.controls.efficiency.value;
    }
    return efficiency;
  }

  getPsatResults(baselinePsatInputs: PsatInputs, settings: Settings, modificationPsatInputs?: PsatInputs): { baselineResults: PsatOutputs, modificationResults: PsatOutputs, annualSavings: number, percentSavings: number } {
    let baselineResults: PsatOutputs = this.emptyResults();
    let modificationResults: PsatOutputs = this.emptyResults();
    let annualSavings: number;
    let percentSavings: number;

    //create copies of inputs to use for calcs
    let psatInputs: PsatInputs = JSON.parse(JSON.stringify(baselinePsatInputs));
    let isPsatValid: boolean = this.isPsatValid(psatInputs, true);
    if (isPsatValid) {
      if (psatInputs.optimize_calculation) {
        baselineResults = this.resultsOptimal(psatInputs, settings);
      } else {
        baselineResults = this.resultsExisting(psatInputs, settings);
      }
    }
    if (modificationPsatInputs) {
      let modInputs: PsatInputs = JSON.parse(JSON.stringify(modificationPsatInputs));
      isPsatValid = this.isPsatValid(modInputs, false);
      if (isPsatValid) {
        if (modInputs.optimize_calculation) {
          modificationResults = this.resultsOptimal(modInputs, settings);
        } else {
          modificationResults = this.resultsModified(modInputs, settings, baselineResults.pump_efficiency);
        }
      }
    }
    annualSavings = baselineResults.annual_cost - modificationResults.annual_cost;
    percentSavings = Number(Math.round((((annualSavings * 100) / baselineResults.annual_cost) * 100) / 100).toFixed(0));
    return {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualSavings: annualSavings,
      percentSavings: percentSavings
    }
  }

  setFormFullLoadAmps(form: FormGroup, settings: Settings): FormGroup {
    let estEfficiency = this.estFLA(
      form.controls.horsePower.value,
      form.controls.motorRPM.value,
      form.controls.frequency.value,
      form.controls.efficiencyClass.value,
      form.controls.efficiency.value,
      form.controls.motorVoltage.value,
      settings
    );
    form.patchValue({
      fullLoadAmps: estEfficiency
    });
    return form;
  }


  isPsatValid(psatInputs: PsatInputs, isBaseline: boolean): boolean {
    let tmpPumpFluidForm: FormGroup = this.pumpFluidService.getFormFromObj(psatInputs);
    let tmpMotorForm: FormGroup = this.motorService.getFormFromObj(psatInputs);
    let tmpFieldDataForm: FormGroup = this.fieldDataService.getFormFromObj(psatInputs, isBaseline);
    return tmpPumpFluidForm.valid && tmpMotorForm.valid && tmpFieldDataForm.valid
  }

  // //PSAT FORM UTILITIES
  // initForm() {
  //   return this.formBuilder.group({
  //     'pumpType': ['', Validators.required],
  //     'specifiedPumpEfficiency': [''],
  //     'pumpRPM': ['', Validators.required],
  //     'drive': ['', Validators.required],
  //     'specifiedDriveEfficiency': [''],
  //     'viscosity': ['', Validators.required],
  //     'gravity': ['', Validators.required],
  //     'stages': ['', Validators.required],
  //     'fixedSpeed': ['Yes', Validators.required],
  //     'frequency': ['', Validators.required],
  //     'horsePower': ['', Validators.required],
  //     'motorRPM': ['', [Validators.required, Validators.min(1)]],
  //     'efficiencyClass': ['', Validators.required],
  //     'efficiency': [''],
  //     'motorVoltage': ['', Validators.required],
  //     'fullLoadAmps': ['', Validators.required],
  //     'sizeMargin': [0, Validators.required],
  //     'operatingFraction': ['', Validators.required],
  //     'costKwHr': ['', Validators.required],
  //     'flowRate': ['', Validators.required],
  //     'head': ['', Validators.required],
  //     'loadEstimatedMethod': ['', Validators.required],
  //     'motorKW': [''],
  //     'motorAmps': [''],
  //     'measuredVoltage': ['', Validators.required],
  //     'optimizeCalculation': [''],
  //     'implementationCosts': ['']
  //   })
  // }

  // getFormFromPsat(psatInputs: PsatInputs): FormGroup {
  //   let motorAmpsValidators: Array<Validators> = new Array<Validators>();
  //   let motorKwValidators: Array<Validators> = new Array<Validators>();
  //   if (!psatInputs.fixed_speed) {
  //     psatInputs.fixed_speed = 0;
  //   }
  //   if (!psatInputs.margin) {
  //     psatInputs.margin = 0;
  //   }

  //   if (psatInputs.load_estimation_method == 0) {
  //     motorKwValidators = [Validators.required];
  //   } else {
  //     motorAmpsValidators = [Validators.required];
  //   }
  //   let pumpStyle = this.getPumpStyleFromEnum(psatInputs.pump_style);
  //   let lineFreq = this.getLineFreqFromEnum(psatInputs.line_frequency);
  //   let effClass = this.getEfficiencyClassFromEnum(psatInputs.efficiency_class);
  //   let drive = this.getDriveFromEnum(psatInputs.drive);
  //   let fixedSpeed = this.getFixedSpeedFromEnum(psatInputs.fixed_speed);
  //   let loadEstMethod = this.getLoadEstimationFromEnum(psatInputs.load_estimation_method);
  //   return this.formBuilder.group({
  //     'pumpType': [pumpStyle, Validators.required],
  //     'specifiedPumpEfficiency': [psatInputs.pump_specified],
  //     'pumpRPM': [psatInputs.pump_rated_speed, Validators.required],
  //     'drive': [drive, Validators.required],
  //     'specifiedDriveEfficiency': [psatInputs.specifiedDriveEfficiency],
  //     'viscosity': [psatInputs.kinematic_viscosity, Validators.required],
  //     'gravity': [psatInputs.specific_gravity, Validators.required],
  //     'stages': [psatInputs.stages, Validators.required],
  //     'fixedSpeed': [fixedSpeed, Validators.required],
  //     'frequency': [lineFreq, Validators.required],
  //     'horsePower': [psatInputs.motor_rated_power, Validators.required],
  //     'motorRPM': [psatInputs.motor_rated_speed, [Validators.required, Validators.min(1)]],
  //     'efficiencyClass': [effClass, Validators.required],
  //     'efficiency': [psatInputs.efficiency],
  //     'motorVoltage': [psatInputs.motor_rated_voltage, Validators.required],
  //     'fullLoadAmps': [psatInputs.motor_rated_fla, Validators.required],
  //     'sizeMargin': [psatInputs.margin, Validators.required],
  //     'operatingFraction': [psatInputs.operating_fraction, Validators.required],
  //     'costKwHr': [psatInputs.cost_kw_hour, Validators.required],
  //     'flowRate': [psatInputs.flow_rate, Validators.required],
  //     'head': [psatInputs.head, Validators.required],
  //     'loadEstimatedMethod': [loadEstMethod, Validators.required],
  //     'motorKW': [psatInputs.motor_field_power, motorKwValidators],
  //     'motorAmps': [psatInputs.motor_field_current, motorAmpsValidators],
  //     'measuredVoltage': [psatInputs.motor_field_voltage, Validators.required],
  //     'optimizeCalculation': [psatInputs.optimize_calculation],
  //     'implementationCosts': [psatInputs.implementationCosts],
  //     'fluidType': [psatInputs.fluidType],
  //     'fluidTemperature': [psatInputs.fluidTemperature, Validators.required]
  //   })
  // }

  // getPsatInputsFromForm(form: FormGroup): PsatInputs {

  //   let efficiency = this.getEfficiencyFromForm(form);
  //   let lineFreqEnum = this.getLineFreqEnum(form.controls.frequency.value);
  //   let pumpStyleEnum = this.getPumpStyleEnum(form.controls.pumpType.value);
  //   let efficiencyClassEnum = this.getEfficienyClassEnum(form.controls.efficiencyClass.value);
  //   let driveEnum = this.getDriveEnum(form.controls.drive.value);
  //   let fixedSpeedEnum = this.getFixedSpeedEmum(form.controls.fixedSpeed.value);
  //   let loadEstMethodEnum = this.getLoadEstimationEnum(form.controls.loadEstimatedMethod.value);
  //   let tmpPsatInputs: PsatInputs = {
  //     pump_style: pumpStyleEnum,
  //     pump_specified: form.controls.specifiedPumpEfficiency.value,
  //     pump_rated_speed: form.controls.pumpRPM.value,
  //     drive: driveEnum,
  //     specifiedDriveEfficiency: form.controls.specifiedDriveEfficiency.value,
  //     kinematic_viscosity: form.controls.viscosity.value,
  //     specific_gravity: form.controls.gravity.value,
  //     stages: form.controls.stages.value,
  //     fixed_speed: fixedSpeedEnum,
  //     line_frequency: lineFreqEnum,
  //     motor_rated_power: form.controls.horsePower.value,
  //     motor_rated_speed: form.controls.motorRPM.value,
  //     efficiency_class: efficiencyClassEnum,
  //     efficiency: efficiency,
  //     motor_rated_voltage: form.controls.motorVoltage.value,
  //     load_estimation_method: loadEstMethodEnum,
  //     motor_rated_fla: form.controls.fullLoadAmps.value,
  //     margin: form.controls.sizeMargin.value,
  //     operating_fraction: form.controls.operatingFraction.value,
  //     flow_rate: form.controls.flowRate.value,
  //     head: form.controls.head.value,
  //     motor_field_power: form.controls.motorKW.value,
  //     motor_field_current: form.controls.motorAmps.value,
  //     motor_field_voltage: form.controls.measuredVoltage.value,
  //     cost_kw_hour: form.controls.costKwHr.value,
  //     cost: form.controls.costKwHr.value,
  //     optimize_calculation: form.controls.optimizeCalculation.value,
  //     implementationCosts: form.controls.implementationCosts.value,
  //     fluidType: form.controls.fluidType.value,
  //     fluidTemperature: form.controls.fluidTemperature.value
  //   };
  //   return tmpPsatInputs;
  // }
}
