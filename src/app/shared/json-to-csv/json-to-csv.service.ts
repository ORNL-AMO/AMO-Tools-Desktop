import { Injectable } from '@angular/core';
declare var json2csv: any;
import { MockDirectory } from '../mocks/mock-directory';
import { ProjElectronService } from '../proj-electron/proj-electron.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { Assessment } from '../models/assessment';
import { PsatService } from '../../psat/psat.service';
import { Settings } from '../models/settings';
import { PSAT } from '../models/psat';

@Injectable()
export class JsonToCsvService {

  constructor(private projElectronService: ProjElectronService, private windowRefService: WindowRefService, private psatService: PsatService) { }

  exportSinglePsat(assessment: Assessment, settings: Settings) {
    let dataArr = new Array();
    dataArr.push(this.getPsatCsvData(assessment, settings, assessment.psat));
    if (assessment.psat.modifications) {
      assessment.psat.modifications.forEach(mod => {
        dataArr.push(this.getPsatCsvData(assessment, settings, mod.psat));
      })
    }
    let convert2Csv = json2csv({ data: dataArr, fields: PsatCsvDataFields, excelString: true });
    convert2Csv = 'data:text/csv;charset=utf-8,' + convert2Csv;
    let doc = this.windowRefService.getDoc();
    let encodedUri = encodeURI(convert2Csv);
    let dlLink = doc.createElement("a");
    dlLink.setAttribute("href", encodedUri);
    dlLink.setAttribute("download", assessment.name + ".csv");
    dlLink.click();
  }

  getPsatCsvData(assessment: Assessment, settings: Settings, psat: PSAT) {
    let tmpResults = this.psatService.results(psat.inputs, settings);
    let tmpPsatCsvData: PsatCsvData = {
      Name: assessment.name,
      CreatedDate: assessment.createdDate,
      ModifiedDate: assessment.modifiedDate,
      PsatName: psat.name ? psat.name : 'Baseline',
      PumpStyle: this.psatService.getPumpStyleFromEnum(psat.inputs.pump_style),
      PumpRatedSpeed: psat.inputs.pump_rated_speed,
      PumpRatedSpeedUnit: 'rpms',
      Drive: this.psatService.getDriveFromEnum(psat.inputs.drive),
      KinematicViscosity: psat.inputs.kinematic_viscosity,
      KinematicViscosityUnit: 'cST',
      SpecificGravity: psat.inputs.specific_gravity,
      FixedSpeed: this.psatService.getFixedSpeedFromEnum(psat.inputs.fixed_speed),
      Stages: psat.inputs.stages,
      LineFrequency: this.psatService.getLineFreqNumValueFromEnum(psat.inputs.line_frequency),
      LineFrequencyUnit: 'Hz',
      MotorRatedPower: psat.inputs.motor_rated_power,
      MotorRatedPowerUnit: settings.powerMeasurement,
      MotorRatedSpeed: psat.inputs.motor_rated_speed,
      MotorRatedSpeedUnit: 'rpms',
      EfficiencyClass: this.psatService.getEfficiencyClassFromEnum(psat.inputs.efficiency_class),
      Efficiency: psat.inputs.efficiency,
      EfficiencyUnit: '%',
      MotorRatedVoltage: psat.inputs.motor_rated_voltage,
      MotorRatedVoltageUnit: 'V',
      LoadEstimationMethod: this.psatService.getLoadEstimationFromEnum(psat.inputs.load_estimation_method),
      MotorRatedFullLoadAmps: psat.inputs.motor_rated_fla,
      MotorRatedFullLoadAmpsUnit: 'A',
      Margin: psat.inputs.margin,
      OperatingFraction: psat.inputs.operating_fraction,
      FlowRate: psat.inputs.flow_rate,
      FlowRateUnit: settings.flowMeasurement,
      Head: psat.inputs.head,
      HeadUnit: settings.distanceMeasurement,
      MotorFieldPower: psat.inputs.motor_field_power,
      MotorFieldPowerUnit: settings.powerMeasurement,
      MotorFieldCurrent: psat.inputs.motor_field_current ? psat.inputs.motor_field_current : null,
      MotorFieldCurrentUnit: psat.inputs.motor_field_current ? 'A' : null,
      MotorFieldVoltage: psat.inputs.motor_field_voltage ? psat.inputs.motor_field_voltage : null,
      MotorFieldVoltageUnit: psat.inputs.motor_field_voltage ? 'kW' : null,
      CostKwHour: psat.inputs.cost_kw_hour,
      CostKwHourUnit: '$/kwh',
      LoadFactor: 1,
      ExistingPumpEfficiency: tmpResults.existing.pump_efficiency,
      ExistingPumpEfficiencyUnit: '%',
      ExistingMotorRatedPower: tmpResults.existing.motor_rated_power,
      ExistingMotorRatedPowerUnit: settings.powerMeasurement,
      ExistingMotorShaftPower: tmpResults.existing.motor_shaft_power,
      ExistingMotorShaftPowerUnit: settings.powerMeasurement,
      ExistingPumpShaftPower: tmpResults.existing.pump_shaft_power,
      ExistingPumpShaftPowerUnit: settings.powerMeasurement,
      ExistingMotorEfficiency: tmpResults.existing.motor_efficiency,
      ExistingMotorEfficiencyUnit: '%',
      ExistingMotorPowerFactor: tmpResults.existing.motor_power_factor,
      ExistingMotorPowerFactorUnit: '%',
      ExistingMotorCurrent: tmpResults.existing.motor_current,
      ExistingMotorCurrentUnit: 'amps',
      ExistingMotorPower: tmpResults.existing.motor_power,
      ExistingMotorPowerUnit: settings.powerMeasurement,
      ExistingAnnualEnergy: tmpResults.existing.annual_energy,
      ExistingAnnualEnergyUnit: 'MWh',
      ExistingAnnualCost: tmpResults.existing.annual_cost,
      ExistingAnnualCostUnit: '$',
      ExistingAnnualSavingPotential: tmpResults.existing.annual_savings_potential,
      ExistingAnnualSavingPotentialUnit: '$/kwh',
      ExistingOptimizationRating: tmpResults.existing.optimization_rating,
      ExistingOptimizationRatingUnit: '%',
      OptimalPumpEfficiency: tmpResults.optimal.pump_efficiency,
      OptimalPumpEfficiencyUnit: '%',
      OptimalMotorRatedPower: tmpResults.optimal.motor_rated_power,
      OptimalMotorRatedPowerUnit:settings.powerMeasurement,
      OptimalMotorShaftPower: tmpResults.optimal.motor_shaft_power,
      OptimalMotorShaftPowerUnit:settings.powerMeasurement,
      OptimalPumpShaftPower: tmpResults.optimal.pump_shaft_power,
      OptimalPumpShaftPowerUnit:settings.powerMeasurement,
      OptimalMotorEfficiency: tmpResults.optimal.motor_efficiency,
      OptimalMotorEfficiencyUnit: '%',
      OptimalMotorPowerFactor: tmpResults.optimal.motor_power_factor,
      OptimalMotorPowerFactorUnit:'%',
      OptimalMotorCurrent: tmpResults.optimal.motor_current,
      OptimalMotorCurrentUnit: 'amps',
      OptimalMotorPower: tmpResults.optimal.motor_power,
      OptimalMotorPowerUnit: settings.powerMeasurement,
      OptimalAnnualEnergy: tmpResults.optimal.annual_energy,
      OptimalAnnualEnergyUnit: 'MWh',
      OptimalAnnualCost: tmpResults.optimal.annual_cost,
      OptimalAnnualCostUnit: '$'
    }
    return tmpPsatCsvData;
  }
}


export interface PsatCsvData {
  Name: string,
  CreatedDate: Date,
  ModifiedDate: Date,
  PsatName: string,
  PumpStyle: string,
  PumpRatedSpeed: number,
  PumpRatedSpeedUnit: string,
  Drive: string,
  KinematicViscosity: number,
  KinematicViscosityUnit: string,
  SpecificGravity: number,
  FixedSpeed: string,
  Stages: number,
  LineFrequency: number,
  LineFrequencyUnit: string,
  MotorRatedPower: number,
  MotorRatedPowerUnit: string,
  MotorRatedSpeed: number,
  MotorRatedSpeedUnit: string,
  EfficiencyClass: string,
  Efficiency: number,
  EfficiencyUnit: string,
  MotorRatedVoltage: number,
  MotorRatedVoltageUnit: string,
  LoadEstimationMethod: string,
  MotorRatedFullLoadAmps: number,
  MotorRatedFullLoadAmpsUnit: string,
  Margin: number,
  OperatingFraction: number,
  FlowRate: number,
  FlowRateUnit: string,
  Head: number,
  HeadUnit: string,
  MotorFieldPower: number,
  MotorFieldPowerUnit: string,
  MotorFieldCurrent: number,
  MotorFieldCurrentUnit: string,
  MotorFieldVoltage: number,
  MotorFieldVoltageUnit: string,
  CostKwHour: number,
  CostKwHourUnit: string,
  LoadFactor: number,
  ExistingPumpEfficiency: number,
  ExistingPumpEfficiencyUnit: string,
  ExistingMotorRatedPower: number,
  ExistingMotorRatedPowerUnit: string,
  ExistingMotorShaftPower: number,
  ExistingMotorShaftPowerUnit: string,
  ExistingPumpShaftPower: number,
  ExistingPumpShaftPowerUnit: string,
  ExistingMotorEfficiency: number,
  ExistingMotorEfficiencyUnit: string,
  ExistingMotorPowerFactor: number,
  ExistingMotorPowerFactorUnit: string
  ExistingMotorCurrent: number,
  ExistingMotorCurrentUnit: string,
  ExistingMotorPower: number,
  ExistingMotorPowerUnit: string
  ExistingAnnualEnergy: number,
  ExistingAnnualEnergyUnit: string
  ExistingAnnualCost: number,
  ExistingAnnualCostUnit: string,
  ExistingAnnualSavingPotential: number,
  ExistingAnnualSavingPotentialUnit: string,
  ExistingOptimizationRating: number,
  ExistingOptimizationRatingUnit: string,
  OptimalPumpEfficiency: number,
  OptimalPumpEfficiencyUnit: string,
  OptimalMotorRatedPower: number,
  OptimalMotorRatedPowerUnit: string
  OptimalMotorShaftPower: number,
  OptimalMotorShaftPowerUnit: string
  OptimalPumpShaftPower: number,
  OptimalPumpShaftPowerUnit: string
  OptimalMotorEfficiency: number,
  OptimalMotorEfficiencyUnit: string,
  OptimalMotorPowerFactor: number,
  OptimalMotorPowerFactorUnit: string
  OptimalMotorCurrent: number,
  OptimalMotorCurrentUnit: string
  OptimalMotorPower: number,
  OptimalMotorPowerUnit: string
  OptimalAnnualEnergy: number,
  OptimalAnnualEnergyUnit: string
  OptimalAnnualCost: number,
  OptimalAnnualCostUnit: string
}

export const PsatCsvDataFields = [
  "Name",
  "CreatedDate",
  "ModifiedDate",
  "PsatName",
  "PumpStyle",
  "PumpRatedSpeed",
  "PumpRatedSpeedUnit",
  "Drive",
  "KinematicViscosity",
  "KinematicViscosityUnit",
  "SpecificGravity",
  "FixedSpeed",
  "Stages",
  "LineFrequency",
  "LineFrequencyUnit",
  "MotorRatedPower",
  "MotorRatedPowerUnit",
  "MotorRatedSpeed",
  "MotorRatedSpeedUnit",
  "EfficiencyClass",
  "Efficiency",
  "EfficiencyUnit",
  "MotorRatedVoltage",
  "MotorRatedVoltageUnit",
  "LoadEstimationMethod",
  "MotorRatedFullLoadAmps",
  "MotorRatedFullLoadAmpsUnit",
  "Margin",
  "OperatingFraction",
  "FlowRate",
  "FlowRateUnit",
  "Head",
  "HeadUnit",
  "MotorFieldPower",
  "MotorFieldPowerUnit",
  "MotorFieldCurrent",
  "MotorFieldCurrentUnit",
  "MotorFieldVoltage",
  "MotorFieldVoltageUnit",
  "CostKwHour",
  "CostKwHourUnit",
  "LoadFactor",
  "ExistingPumpEfficiency",
  "ExistingPumpEfficiencyUnit",
  "ExistingMotorRatedPower",
  "ExistingMotorShaftPower",
  "ExistingPumpShaftPower",
  "ExistingMotorEfficiency",
  "ExistingMotorEfficiencyUnit",
  "ExistingMotorPowerFactor",
  "ExistingMotorCurrent",
  "ExistingMotorPower",
  "ExistingAnnualEnergy",
  "ExistingAnnualCost",
  "ExistingAnnualCostUnit",
  "ExistingAnnualSavingPotential",
  "ExistingAnnualSavingPotentialUnit",
  "ExistingOptimizationRating",
  "ExistingOptimizationRatingUnit",
  "OptimalPumpEfficiency",
  "OptimalPumpEfficiencyUnit",
  "OptimalMotorRatedPower",
  "OptimalMotorShaftPower",
  "OptimalPumpShaftPower",
  "OptimalMotorEfficiency",
  "OptimalMotorEfficiencyUnit",
  "OptimalMotorPowerFactor",
  "OptimalMotorCurrent",
  "OptimalMotorPower",
  "OptimalAnnualEnergy",
  "OptimalAnnualCost",
  "OptimalAnnualCostUnit"
]