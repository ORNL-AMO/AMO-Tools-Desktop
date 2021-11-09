import { Injectable } from '@angular/core';
import { PsatInputs, PsatOutputs, PsatValid } from '../shared/models/psat';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
declare var psatAddon: any;
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { MotorService } from './motor/motor.service';
import { FieldDataService } from './field-data/field-data.service';
import { PumpFluidService } from './pump-fluid/pump-fluid.service';
import * as _ from 'lodash';
import { pumpTypesConstant, motorEfficiencyConstants, driveConstants } from './psatConstants';
import { PSAT } from '../shared/models/psat';

@Injectable()
export class PsatService {
  flaRange: any = {
    flaMin: 0,
    flaMax: 0
  };

  getResults: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  constructor(private convertUnitsService: ConvertUnitsService, private pumpFluidService: PumpFluidService,
    private motorService: MotorService, private fieldDataService: FieldDataService) {
    this.getResults = new BehaviorSubject<boolean>(true);
    this.modalOpen = new BehaviorSubject<boolean>(true);

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
    //TODO: remove eventually. this is here for support in removing operating_fraction from suite v0.3.2
    if (inputsCpy.operating_fraction && !inputsCpy.operating_hours) {
      inputsCpy.operating_hours = inputsCpy.operating_fraction * 8760;
    }
    //TODO: Remove after demo 11/8/18
    inputsCpy.operating_fraction = 1;

    return inputsCpy;
  }

  convertOutputs(psatOutputs: PsatOutputs, settings: Settings): PsatOutputs {
    if (settings.powerMeasurement != 'hp') {
      psatOutputs.motor_rated_power = this.convertUnitsService.value(psatOutputs.motor_rated_power).from('hp').to(settings.powerMeasurement);
      psatOutputs.motor_shaft_power = this.convertUnitsService.value(psatOutputs.motor_shaft_power).from('hp').to(settings.powerMeasurement);
      psatOutputs.pump_shaft_power = this.convertUnitsService.value(psatOutputs.pump_shaft_power).from('hp').to(settings.powerMeasurement);
    }
    if (settings.currency !== "$") {
      psatOutputs.annual_cost = this.convertUnitsService.value(psatOutputs.annual_cost).from('$').to(settings.currency);
      psatOutputs.annual_savings_potential = this.convertUnitsService.value(psatOutputs.annual_savings_potential).from('$').to(settings.currency);
    }
    return psatOutputs;
  }

  //results
  resultsExisting(psatInputs: PsatInputs, settings: Settings): PsatOutputs {
    let valid: PsatValid = this.isPsatValid(psatInputs, true)
    if (valid.isValid) {
      let tmpInputs: PsatInputs = this.convertInputs(psatInputs, settings);
      //call results existing
      let tmpResults: PsatOutputs = psatAddon.resultsExisting(tmpInputs);
      tmpResults = this.convertOutputs(tmpResults, settings);
      tmpResults = this.roundResults(tmpResults);
      return tmpResults;
    } else {
      return this.emptyResults();
    }
  }

  resultsModified(psatInputs: PsatInputs, settings: Settings): PsatOutputs {
    let valid: PsatValid = this.isPsatValid(psatInputs, false)
    if (valid.isValid) {
      let tmpInputs: any = this.convertInputs(psatInputs, settings);
      tmpInputs.margin = 1;
      let tmpResults: PsatOutputs = psatAddon.resultsModified(tmpInputs);
      tmpResults = this.convertOutputs(tmpResults, settings);
      tmpResults = this.roundResults(tmpResults);
      return tmpResults;
    } else {
      return this.emptyResults();
    }
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
      load_factor: 0,
      drive_efficiency: 0,
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
      load_factor: this.roundVal(psatResults.load_factor, 2),
      drive_efficiency: this.roundVal(psatResults.drive_efficiency, 2),
      annual_energy: this.roundVal(psatResults.annual_energy, 2),
      annual_cost: this.roundVal(psatResults.annual_cost, 2),
      annual_savings_potential: this.roundVal(psatResults.annual_savings_potential, 0),
      optimization_rating: this.roundVal(psatResults.optimization_rating, 2)
    }
    return roundResults;
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
      // horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
    if (motorRPM > 0) {
      let inputs: any = {
        motor_rated_power: horsePower,
        motor_rated_speed: motorRPM,
        line_frequency: frequency,
        efficiency_class: efficiencyClass,
        efficiency: efficiency,
        motor_rated_voltage: motorVoltage
      }
      return this.roundVal(psatAddon.estFLA(inputs), 2);
    } else {
      return 0;
    }

  }


  estFanFLA(
    horsePower: number,
    motorRPM: number,
    frequency: number,
    efficiencyClass: number,
    efficiency: number,
    motorVoltage: number,
    settings: Settings
  ) {
    if (settings.fanPowerMeasurement != 'hp') {
      // horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
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
    pumpStyle: number,
    specificSpeed: number
  ) {
    let inputs: any = {
      pump_style: pumpStyle,
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
    let inputs: any = {
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
    lineFreq: number,
    efficiencyClass: number,
    horsePower: number,
    motorRPM: number,
    efficiency: number,
    motorVoltage: number,
    fullLoadAmps: number,
    loadFactor: number,
    settings: Settings
  ) {

    if (settings.powerMeasurement != 'hp') {
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
    let tmpInputs: any = {
      line_frequency: lineFreq,
      efficiency_class: efficiencyClass,
      motor_rated_power: horsePower,
      motor_rated_speed: motorRPM,
      efficiency: efficiency || 90,
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
    lineFreq: number,
    motorRPM: number,
    efficiencyClass: number,
    efficiency: number,
    horsePower: number,
    settings: Settings
  ) {
    if (settings.powerMeasurement != 'hp') {
      horsePower = this.convertUnitsService.value(horsePower).from(settings.powerMeasurement).to('hp');
    }
    let tmpInputs = {
      line_frequency: lineFreq,
      motor_rated_speed: motorRPM,
      efficiency_class: efficiencyClass,
      efficiency: efficiency || 90,
      motor_rated_power: horsePower,
      load_factor: 1
    };
    return this.roundVal(psatAddon.nema(tmpInputs), 2);
  }

  //motor efficiency (nema without hard coded load factor)
  motorEfficiency(
    lineFreq: number,
    motorRPM: number,
    efficiencyClass: number,
    efficiency: number,
    motorPower: number,
    loadFactor: number,
    settings: Settings
  ): number {
    if (motorPower != undefined && lineFreq != undefined && motorRPM != undefined && efficiencyClass != undefined && loadFactor != undefined) {
      if (settings.unitsOfMeasure != 'Imperial') {
        motorPower = this.convertUnitsService.value(motorPower).from(settings.powerMeasurement).to('hp');
      }
      //efficiency unused, calced from efficiencyClass
      let tmpInputs = {
        line_frequency: lineFreq,
        motor_rated_speed: motorRPM,
        efficiency_class: efficiencyClass,
        efficiency: efficiency,
        motor_rated_power: motorPower,
        load_factor: loadFactor
      };
      return this.roundVal(psatAddon.nema(tmpInputs), 2);
    } else {
      return 0;
    }
  }

  motorPowerFactor(
    motorRatedPower: number,
    loadFactor: number,
    motorCurrent: number,
    motorEfficiency: number,
    ratedVoltage: number,
    settings: Settings
  ): number {
    if (settings.unitsOfMeasure != 'Imperial') {
      motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
    }
    if (motorRatedPower && motorCurrent && ratedVoltage) {
      //efficiency and load factor need to be decimal
      let inp = {
        motorRatedPower: motorRatedPower,
        loadFactor: loadFactor / 100,
        motorCurrent: motorCurrent,
        motorEfficiency: motorEfficiency / 100,
        ratedVoltage: ratedVoltage
      };
      return this.roundVal(psatAddon.motorPowerFactor(inp), 2);
    } else {
      return 0;
    }
  }

  motorCurrent(
    motorRatedPower: number,
    motorRpm: number,
    lineFrequency: number,
    efficiencyClass: number,
    loadFactor: number,
    ratedVoltage: number,
    fullLoadAmps: number,
    specifiedEfficiency: number,
    settings: Settings
  ): number {
    if (settings.unitsOfMeasure != 'Imperial') {
      motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
    }
    if (motorRatedPower && motorRpm && ratedVoltage && fullLoadAmps) {
      let inp = {
        motorRatedPower: motorRatedPower,
        loadFactor: loadFactor,
        motorRPM: motorRpm,
        line_frequency: lineFrequency,
        efficiency_class: efficiencyClass,
        fullLoadAmps: fullLoadAmps,
        ratedVoltage: ratedVoltage,
        specifiedEfficiency: specifiedEfficiency
      };
      return this.roundVal(psatAddon.motorCurrent(inp), 2);
    } else {
      return 0;
    }
  }


  //ENUM Helpers
  getPumpStyleFromEnum(num: number): string {
    let pumpStyle: { display: string, value: number } = _.find(pumpTypesConstant, (pumpStyle) => { return pumpStyle.value == num });
    if (pumpStyle) {
      return pumpStyle.display;
    } else {
      return undefined;
    }
  }

  getEfficiencyClassFromEnum(num: number): string {
    let effClass: { display: string, value: number } = _.find(motorEfficiencyConstants, (motorStyle) => { return motorStyle.value == num });
    if (effClass) {
      return effClass.display;
    } else {
      return undefined;
    }
  }

  getDriveFromEnum(num: number): string {
    let drive: { display: string, value: number } = _.find(driveConstants, (driveType) => { return driveType.value == num });
    if (drive) {
      return drive.display;
    } else {
      return undefined;
    }
  }

  getFixedSpeedFromEnum(num: number): string {
    let fixedSpeed: string;
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

  getLoadEstimationFromEnum(num: number): string {
    let method: string;
    if (num == 0) {
      method = 'Power';
    } else if (num == 1) {
      method = 'Current';
    }
    return method;
  }

  getPsatResults(baselinePsatInputs: PsatInputs, settings: Settings, modificationPsatInputs?: PsatInputs): { baselineResults: PsatOutputs, modificationResults: PsatOutputs, annualSavings: number, percentSavings: number } {
    let baselineResults: PsatOutputs = this.emptyResults();
    let modificationResults: PsatOutputs = this.emptyResults();
    let annualSavings: number;
    let percentSavings: number;

    //create copies of inputs to use for calcs
    let psatInputs: PsatInputs = JSON.parse(JSON.stringify(baselinePsatInputs));
    let isPsatValid: PsatValid = this.isPsatValid(psatInputs, true);
    if (isPsatValid.isValid) {
      baselineResults = this.resultsExisting(psatInputs, settings);
    }
    if (modificationPsatInputs) {
      let modInputs: PsatInputs = JSON.parse(JSON.stringify(modificationPsatInputs));
      isPsatValid = this.isPsatValid(modInputs, false);
      if (isPsatValid.isValid) {
        if (modInputs.whatIfScenario == true) {
          modificationResults = this.resultsModified(modInputs, settings);
        } else {
          modificationResults = this.resultsExisting(modInputs, settings);
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
    let estEfficiency: number = this.estFLA(
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


  isPsatValid(psatInputs: PsatInputs, isBaseline: boolean): PsatValid {
    let tmpPumpFluidForm: FormGroup = this.pumpFluidService.getFormFromObj(psatInputs);
    let tmpMotorForm: FormGroup = this.motorService.getFormFromObj(psatInputs);
    let tmpFieldDataForm: FormGroup = this.fieldDataService.getFormFromObj(psatInputs, isBaseline);
    return {
      isValid: tmpPumpFluidForm.valid && tmpMotorForm.valid && tmpFieldDataForm.valid,
      pumpFluidValid: tmpPumpFluidForm.valid,
      motorValid: tmpMotorForm.valid,
      fieldDataValid: tmpFieldDataForm.valid
    }
  }

  convertExistingData(psat: PSAT, oldSettings: Settings, settings: Settings, mod?): PSAT {
    if (psat.inputs.flow_rate) {
      psat.inputs.flow_rate = this.convertUnitsService.value(psat.inputs.flow_rate).from(oldSettings.flowMeasurement).to(settings.flowMeasurement);
      psat.inputs.flow_rate = this.convertUnitsService.roundVal(psat.inputs.flow_rate, 2);
    }
    if (psat.inputs.head) {
      psat.inputs.head = this.convertUnitsService.value(psat.inputs.head).from(oldSettings.distanceMeasurement).to(settings.distanceMeasurement);
      psat.inputs.head = this.convertUnitsService.roundVal(psat.inputs.head, 2);
    }
    if (psat.inputs.motor_rated_power) {
      psat.inputs.motor_rated_power = this.convertUnitsService.value(psat.inputs.motor_rated_power).from(oldSettings.powerMeasurement).to(settings.powerMeasurement);
      psat.inputs.motor_rated_power = this.convertUnitsService.roundVal(psat.inputs.motor_rated_power, 2)
    }
    if (psat.inputs.fluidTemperature) {
      if (settings.temperatureMeasurement && oldSettings.temperatureMeasurement) {
        psat.inputs.fluidTemperature = this.convertUnitsService.value(psat.inputs.fluidTemperature).from(oldSettings.temperatureMeasurement).to(settings.temperatureMeasurement);
        psat.inputs.fluidTemperature = this.convertUnitsService.roundVal(psat.inputs.fluidTemperature, 2);
      }
    }
    return psat;
  }
}
