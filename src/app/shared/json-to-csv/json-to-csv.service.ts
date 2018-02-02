import { Injectable } from '@angular/core';
//declare var json2csv: any;
import { MockDirectory } from '../mocks/mock-directory';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { Assessment } from '../models/assessment';
import { PsatService } from '../../psat/psat.service';
import { Settings } from '../models/settings';
import { PSAT } from '../models/psat';
import * as moment from 'moment';
import * as json2csv from 'json2csv';
@Injectable()
export class JsonToCsvService {

  constructor(private windowRefService: WindowRefService, private psatService: PsatService) { }

  exportSinglePsat(assessment: Assessment, settings: Settings) {
    let dataArr = new Array();
    dataArr.push(this.getPsatCsvData(assessment, settings, assessment.psat));
    if (assessment.psat.modifications) {
      assessment.psat.modifications.forEach(mod => {
        dataArr.push(this.getPsatCsvData(assessment, settings, mod.psat));
      })
    }
    this.downloadData(dataArr, assessment.name);
  }

  downloadData(dataArr: any, name: string) {
    let convert2Csv = json2csv({ data: dataArr, fields: PsatCsvDataFields });
    convert2Csv = 'data:text/csv;charset=utf-8,' + convert2Csv;
    let doc = this.windowRefService.getDoc();
    let encodedUri = encodeURI(convert2Csv);
    let dlLink = doc.createElement("a");
    dlLink.setAttribute("href", encodedUri);
    dlLink.setAttribute("download", name + ".csv");
    dlLink.click();
  }

  getPsatCsvData(assessment: Assessment, settings: Settings, psat: PSAT) {
    let tmpResults;
    let isOptimized;
    if (psat.inputs.optimize_calculation) {
      isOptimized = 'Yes';
      tmpResults = this.psatService.resultsOptimal(psat.inputs, settings);
    } else {
      isOptimized = 'No';
      tmpResults = this.psatService.resultsExisting(psat.inputs, settings);
    }
    let tmpPsatCsvData: PsatCsvData = {
      Name: assessment.name,
      CreatedDate: moment(assessment.createdDate).format("YYYY-MM-DD H:mm A"),
      ModifiedDate: moment(assessment.modifiedDate).format("YYYY-MM-DD H:mm A"),
      PsatName: psat.name ? psat.name : 'Baseline',
      PumpStyle: this.psatService.getPumpStyleFromEnum(psat.inputs.pump_style),
      PumpRatedSpeed: psat.inputs.pump_rated_speed,
      PumpRatedSpeedUnit: 'rpms',
      Drive: this.psatService.getDriveFromEnum(psat.inputs.drive),
      FluidType: psat.inputs.fluidType,
      FluidTemperature: psat.inputs.fluidTemperature,
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
      MotorFieldVoltageUnit: psat.inputs.motor_field_voltage ? 'V' : null,
      CostKwHour: psat.inputs.cost_kw_hour,
      CostKwHourUnit: '$/kwh',
      LoadFactor: 1,
      PumpEfficiency: tmpResults.pump_efficiency,
      PumpEfficiencyUnit: '%',
      MotorShaftPower: tmpResults.motor_shaft_power,
      MotorShaftPowerUnit: settings.powerMeasurement,
      PumpShaftPower: tmpResults.pump_shaft_power,
      PumpShaftPowerUnit: settings.powerMeasurement,
      MotorEfficiency: tmpResults.motor_efficiency,
      MotorEfficiencyUnit: '%',
      MotorPowerFactor: tmpResults.motor_power_factor,
      MotorPowerFactorUnit: '%',
      MotorCurrent: tmpResults.motor_current,
      MotorCurrentUnit: 'amps',
      MotorPower: tmpResults.motor_power,
      MotorPowerUnit: settings.powerMeasurement,
      AnnualEnergy: tmpResults.annual_energy,
      AnnualEnergyUnit: 'MWh',
      AnnualCost: tmpResults.annual_cost,
      AnnualCostUnit: '$',
      Optimized: isOptimized
    };
    return tmpPsatCsvData;
  }
}


export interface PsatCsvData {
  Name: string,
  CreatedDate: string,
  ModifiedDate: string,
  PsatName: string,
  PumpStyle: string,
  PumpRatedSpeed: number,
  PumpRatedSpeedUnit: string,
  Drive: string,
  FluidType: string,
  FluidTemperature: number,
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
  PumpEfficiency: number,
  PumpEfficiencyUnit: string,
  MotorShaftPower: number,
  MotorShaftPowerUnit: string,
  PumpShaftPower: number,
  PumpShaftPowerUnit: string,
  MotorEfficiency: number,
  MotorEfficiencyUnit: string,
  MotorPowerFactor: number,
  MotorPowerFactorUnit: string
  MotorCurrent: number,
  MotorCurrentUnit: string,
  MotorPower: number,
  MotorPowerUnit: string
  AnnualEnergy: number,
  AnnualEnergyUnit: string
  AnnualCost: number,
  AnnualCostUnit: string,
  Optimized:string
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
  "FluidType",
  "FluidTemperature",
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
  "PumpEfficiency",
  "PumpEfficiencyUnit",
  "MotorRatedPower",
  "MotorShaftPower",
  "PumpShaftPower",
  "MotorEfficiency",
  "MotorEfficiencyUnit",
  "MotorPowerFactor",
  "MotorCurrent",
  "MotorPower",
  "AnnualEnergy",
  "AnnualCost",
  "AnnualCostUnit",
  "Optimized"
];
