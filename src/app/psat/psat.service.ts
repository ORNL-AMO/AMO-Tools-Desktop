import { Injectable } from '@angular/core';
import { ExploreOpportunitiesResults, PsatInputs, PsatOutputs, PsatValid } from '../shared/models/psat';
import { Settings } from '../shared/models/settings';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { MotorService } from './motor/motor.service';
import { FieldDataService } from './field-data/field-data.service';
import { PumpFluidService } from './pump-fluid/pump-fluid.service';
import * as _ from 'lodash';
import { pumpTypesConstant, motorEfficiencyConstants, driveConstants } from './psatConstants';
import { PSAT } from '../shared/models/psat';
import { MotorPerformanceResults } from '../calculator/motors/motor-performance/motor-performance.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { PumpsSuiteApiService } from '../tools-suite-api/pumps-suite-api.service';
import { IntegratedAssessment, IntegratedEnergyOptions, ModificationEnergyOption } from '../shared/assessment-integration/assessment-integration.service';
import { EnergyUseItem } from '../shared/models/treasure-hunt';
import { Co2SavingsData } from '../calculator/utilities/co2-savings/co2-savings.service';

@Injectable()
export class PsatService {
  flaRange: any = {
    flaMin: 0,
    flaMax: 0
  };

  getResults: BehaviorSubject<boolean>;
  modalOpen: BehaviorSubject<boolean>;
  constructor(
    private pumpsSuiteApiService: PumpsSuiteApiService,
    private convertUnitsService: ConvertUnitsService,
    private assessmentCo2Service: AssessmentCo2SavingsService,
    private pumpFluidService: PumpFluidService,
    private motorService: MotorService,
    private fieldDataService: FieldDataService
  ) {
    this.getResults = new BehaviorSubject<boolean>(true);
    this.modalOpen = new BehaviorSubject<boolean>(true);

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
      psatOutputs.mover_shaft_power = this.convertUnitsService.value(psatOutputs.mover_shaft_power).from('hp').to(settings.powerMeasurement);
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
      let psatOutputs: PsatOutputs = this.pumpsSuiteApiService.resultsExisting(tmpInputs);
      psatOutputs = this.setCo2SavingsEmissionsResult(psatInputs, psatOutputs, settings);
      psatOutputs = this.convertOutputs(psatOutputs, settings);
      psatOutputs = this.roundResults(psatOutputs);
      return psatOutputs;
    } else {
      return this.emptyResults();
    }
  }

  resultsModified(psatInputs: PsatInputs, settings: Settings): PsatOutputs {
    let valid: PsatValid = this.isPsatValid(psatInputs, false)
    if (valid.isValid) {
      let tmpInputs: PsatInputs = this.convertInputs(psatInputs, settings);
      tmpInputs.margin = 1;
      let psatOutputs: PsatOutputs = this.pumpsSuiteApiService.resultsModified(tmpInputs);
      psatOutputs = this.setCo2SavingsEmissionsResult(psatInputs, psatOutputs, settings);
      psatOutputs = this.convertOutputs(psatOutputs, settings);
      psatOutputs = this.roundResults(psatOutputs);
      return psatOutputs;
    } else {
      return this.emptyResults();
    }
  }

  setIntegratedAssessmentData(integratedAssessment: IntegratedAssessment, settings: Settings) {
    let energyOptions: IntegratedEnergyOptions = {
      baseline: undefined,
      modifications: []
    }

    let psat: PSAT = integratedAssessment.assessment.psat;
    let baselineOutputs: PsatOutputs = this.resultsExisting(psat.inputs, settings);
    baselineOutputs.annual_energy = this.convertUnitsService.value(baselineOutputs.annual_energy).from('MWh').to('kWh');
    baselineOutputs.annual_energy = this.convertUnitsService.roundVal(baselineOutputs.annual_energy, 0)

    energyOptions.baseline = {
      name: psat.name,
      annualEnergy: baselineOutputs.annual_energy,
      annualCost: baselineOutputs.annual_cost,
      co2EmissionsOutput: baselineOutputs.co2EmissionsOutput,
      energyThDisplayUnits: 'kWh'
    };

    let baselineEnergy: EnergyUseItem = {
      type: 'Electricity',
      amount: baselineOutputs.annual_energy,
      integratedEnergyCost: baselineOutputs.annual_cost,
      integratedEmissionRate: baselineOutputs.co2EmissionsOutput
    };

    integratedAssessment.hasModifications = integratedAssessment.assessment.psat.modifications && integratedAssessment.assessment.psat.modifications.length !== 0;
    if (integratedAssessment.hasModifications) {
      let modificationEnergyOptions: Array<ModificationEnergyOption> = [];
      psat.modifications.forEach(modification => {
        let modificationOutputs = this.resultsModified(modification.psat.inputs, settings);
        modificationOutputs.annual_energy = this.convertUnitsService.value(modificationOutputs.annual_energy).from('MWh').to('kWh');
        modificationOutputs.annual_energy = this.convertUnitsService.roundVal(modificationOutputs.annual_energy, 0);

        energyOptions.modifications.push({
          name: modification.psat.name,
          annualEnergy: modificationOutputs.annual_energy,
          annualCost: modificationOutputs.annual_cost,
          modificationId: modification.id,
          co2EmissionsOutput: modificationOutputs.co2EmissionsOutput
        });

        let modificationEnergy: EnergyUseItem = {
          type: 'Electricity',
          amount: modificationOutputs.annual_energy,
          integratedEnergyCost: modificationOutputs.annual_cost,
          integratedEmissionRate: modificationOutputs.co2EmissionsOutput
        }
        modificationEnergyOptions.push(
          {
            modificationId: modification.id,
            energies: [modificationEnergy]
          })
      });
      integratedAssessment.modificationEnergyUseItems = modificationEnergyOptions;
    }

    integratedAssessment.assessmentType = 'PSAT';
    integratedAssessment.baselineEnergyUseItems = [baselineEnergy];
    integratedAssessment.energyOptions = energyOptions;
    integratedAssessment.thEquipmentType = 'pump';
    integratedAssessment.navigation = {
      queryParams: undefined,
      url: '/psat/' + integratedAssessment.assessment.id
    }
  }


  setCo2SavingsEmissionsResult(psatInputs: PsatInputs, psatOutputs: PsatOutputs, settings: Settings): PsatOutputs {
    if (psatInputs.co2SavingsData) {
      psatInputs.co2SavingsData.electricityUse = psatOutputs.annual_energy;
      psatOutputs.co2EmissionsOutput = this.assessmentCo2Service.getCo2EmissionsResult(psatInputs.co2SavingsData, settings);
    } else {
      let co2SavingsData: Co2SavingsData = this.assessmentCo2Service.getCo2SavingsDataFromSettingsObject(settings);
      psatInputs.co2SavingsData = co2SavingsData;
      psatInputs.co2SavingsData.electricityUse = psatOutputs.annual_energy;
      psatOutputs.co2EmissionsOutput = this.assessmentCo2Service.getCo2EmissionsResult(psatInputs.co2SavingsData, settings);
    }
    return psatOutputs;
  }

  emptyResults(): PsatOutputs {
    let results: PsatOutputs = {
      pump_efficiency: 0,
      motor_rated_power: 0,
      motor_shaft_power: 0,
      mover_shaft_power: 0,
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
      mover_shaft_power: this.roundVal(psatResults.mover_shaft_power, 2),
      motor_efficiency: this.roundVal(psatResults.motor_efficiency, 2),
      motor_power_factor: this.roundVal(psatResults.motor_power_factor, 2),
      motor_current: this.roundVal(psatResults.motor_current, 2),
      motor_power: this.roundVal(psatResults.motor_power, 2),
      load_factor: this.roundVal(psatResults.load_factor, 2),
      drive_efficiency: this.roundVal(psatResults.drive_efficiency, 2),
      annual_energy: this.roundVal(psatResults.annual_energy, 2),
      annual_cost: this.roundVal(psatResults.annual_cost, 2),
      annual_savings_potential: this.roundVal(psatResults.annual_savings_potential, 0),
      optimization_rating: this.roundVal(psatResults.optimization_rating, 2),
      co2EmissionsOutput: this.roundVal(psatResults.co2EmissionsOutput, 2),
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

    let tmpResults = this.pumpsSuiteApiService.headToolSuctionTank(specificGravity, flowRate, suctionPipeDiameter, suctionTankGasOverPressure, suctionTankFluidSurfaceElevation, suctionLineLossCoefficients,
      dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
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

    let tmpResults = this.pumpsSuiteApiService.headTool(specificGravity, flowRate, suctionPipeDiameter, suctionGaugePressure, suctionGaugeElevation, suctionLineLossCoefficients,
      dischargePipeDiameter, dischargeGaugePressure, dischargeGaugeElevation, dischargeLineLossCoefficients);
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
    motorRatedPower: number,
    motorRPM: number,
    frequency: number,
    efficiencyClass: number,
    efficiency: number,
    motorVoltage: number,
    settings: Settings
  ) {
    if (settings.powerMeasurement != 'hp') {
      motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
    }
    if (motorRPM > 0) {
      let estimatedFLA: number = this.pumpsSuiteApiService.estimateFla(motorRatedPower, motorRPM, frequency, efficiencyClass, efficiency, motorVoltage);
      return this.roundVal(estimatedFLA, 2);
    } else {
      return 0;
    }

  }


  estFanFLA(
    motorRatedPower: number,
    motorRPM: number,
    frequency: number,
    efficiencyClass: number,
    efficiency: number,
    motorVoltage: number,
    settings: Settings
  ) {
    if (settings.fanPowerMeasurement != 'hp') {
      motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.fanPowerMeasurement).to('hp');
    }
    let estimatedFLA: number = this.pumpsSuiteApiService.estimateFla(motorRatedPower, motorRPM, frequency, efficiencyClass, efficiency, motorVoltage);
    return this.roundVal(estimatedFLA, 2);
  }
  getFlaRange() {
    return this.flaRange;
  }

  //specific speed
  achievableEfficiency(
    pumpStyle: number,
    specificSpeed: number
  ) {
    let achievableEfficiency: number = this.pumpsSuiteApiService.achievableEfficiency(pumpStyle, specificSpeed);
    return this.roundVal(achievableEfficiency, 2);
  }

  ///achievable pump efficiency
  pumpEfficiency(
    pumpStyle: number,
    flowRate: number,
    rpm: number,
    kinematicViscosity: number,
    stageCount: number,
    head: number,
    pumpEfficiencyInput: number,
    settings: Settings
  ) {
    //flow rate = 'gpm'
    if (settings.flowMeasurement != 'gpm') {
      flowRate = this.convertUnitsService.value(flowRate).from(settings.flowMeasurement).to('gpm');
    }
    let pumpEfficiency: { average: number, max: number } = this.pumpsSuiteApiService.pumpEfficiency(pumpStyle, flowRate, rpm, kinematicViscosity, stageCount, head, pumpEfficiencyInput);
    let results = {
      average: this.roundVal(pumpEfficiency.average, 2),
      max: this.roundVal(pumpEfficiency.max, 2)
    }
    return results;
  }

  motorPerformance(
    lineFreq: number,
    efficiencyClass: number,
    motorRatedPower: number,
    motorRPM: number,
    specifiedEfficiency: number,
    motorRatedVoltage: number,
    fullLoadAmps: number,
    loadFactor: number,
    settings: Settings
  ) {

    if (settings.powerMeasurement != 'hp') {
      motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
    }
    let motorPerformanceResults: MotorPerformanceResults = this.pumpsSuiteApiService.motorPerformance(lineFreq, efficiencyClass, motorRatedPower, motorRPM, specifiedEfficiency, motorRatedVoltage, fullLoadAmps, loadFactor);
    let results: MotorPerformanceResults = {
      efficiency: this.roundVal(motorPerformanceResults.efficiency, 3),
      current: this.roundVal(motorPerformanceResults.current, 3),
      powerFactor: this.roundVal(motorPerformanceResults.powerFactor, 3)
    }
    return results;
  }

  //loadFactor hard coded to 1
  nema(
    lineFreq: number,
    motorRPM: number,
    efficiencyClass: number,
    efficiency: number,
    motorRatedPower: number,
    settings: Settings
  ) {
    if (settings.powerMeasurement != 'hp') {
      motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
    }
    let motorEfficiency: number = this.pumpsSuiteApiService.nema(lineFreq, motorRPM, efficiencyClass, efficiency, motorRatedPower);
    return this.roundVal(motorEfficiency, 2);
  }

  /**
* Getet Motor efficiency (nema without hard coded load factor)
*
* @param {number} efficiency - as percent
* @returns {number} motorEfficiency (as percent)
*/
  motorEfficiency(
    lineFreq: number,
    motorRPM: number,
    efficiencyClass: number,
    efficiency: number,
    motorRatedPower: number,
    loadFactor: number,
    settings: Settings
  ): number {
    if (motorRatedPower != undefined && lineFreq != undefined && motorRPM != undefined && efficiencyClass != undefined && loadFactor != undefined) {
      if (settings.unitsOfMeasure != 'Imperial') {
        motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
      }
      let motorEfficiency: number = this.pumpsSuiteApiService.motorEfficiency(lineFreq, motorRPM, efficiencyClass, efficiency, motorRatedPower, loadFactor);
      return this.roundVal(motorEfficiency, 2);
    } else {
      return 0;
    }
  }

  motorPowerFactor(
    motorRatedPower: number,
    loadFactorPercent: number,
    motorCurrent: number,
    motorEfficiencyPercent: number,
    ratedVoltage: number,
    settings: Settings
  ): number {
    if (motorRatedPower && motorCurrent && ratedVoltage) {
      if (settings.unitsOfMeasure != 'Imperial') {
        motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
      }
      let powerFactor: number = this.pumpsSuiteApiService.motorPowerFactor(motorRatedPower, loadFactorPercent, motorCurrent, motorEfficiencyPercent, ratedVoltage);
      return this.roundVal(powerFactor, 2);
    } else {
      return 0;
    }
  }

  motorCurrent(
    motorRatedPower: number,
    motorRpm: number,
    lineFrequency: number,
    efficiencyClass: number,
    loadFactorPercent: number,
    ratedVoltage: number,
    fullLoadAmps: number,
    specifiedEfficiencyPercent: number,
    settings: Settings
  ): number {
    if (motorRatedPower && motorRpm && ratedVoltage && fullLoadAmps) {
      if (settings.unitsOfMeasure != 'Imperial') {
        motorRatedPower = this.convertUnitsService.value(motorRatedPower).from(settings.powerMeasurement).to('hp');
      }
      let motorCurrent: number = this.pumpsSuiteApiService.motorCurrent(motorRatedPower, motorRpm, lineFrequency, efficiencyClass, specifiedEfficiencyPercent, loadFactorPercent, ratedVoltage, fullLoadAmps)
      return this.roundVal(motorCurrent, 2);
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

  getPsatResults(baselinePsatInputs: PsatInputs, settings: Settings, modificationPsatInputs?: PsatInputs): ExploreOpportunitiesResults {
    let baselineResults: PsatOutputs = this.emptyResults();
    let modificationResults: PsatOutputs = this.emptyResults();
    let annualSavings: number;
    let co2EmissionsSavings: number;
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
    co2EmissionsSavings = baselineResults.co2EmissionsOutput - modificationResults.co2EmissionsOutput;
    percentSavings = Number(Math.round((((annualSavings * 100) / baselineResults.annual_cost) * 100) / 100).toFixed(0));
    return {
      baselineResults: baselineResults,
      modificationResults: modificationResults,
      annualSavings: annualSavings,
      co2EmissionsSavings: co2EmissionsSavings,
      percentSavings: percentSavings
    }
  }

  setFormFullLoadAmps(form: UntypedFormGroup, settings: Settings): UntypedFormGroup {
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
    let tmpPumpFluidForm: UntypedFormGroup = this.pumpFluidService.getFormFromObj(psatInputs);
    let tmpMotorForm: UntypedFormGroup = this.motorService.getFormFromObj(psatInputs);
    let tmpFieldDataForm: UntypedFormGroup = this.fieldDataService.getFormFromObj(psatInputs, isBaseline);
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
