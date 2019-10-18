import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { EquipmentCurveService } from './equipment-curve/equipment-curve.service';
import { FanSystemCurveFormService } from './system-curve/fan-system-curve-form.service';
import { PumpSystemCurveFormService } from './system-curve/pump-system-curve-form.service';
import { PSAT } from '../../shared/models/psat';
import { FSAT } from '../../shared/models/fans';

@Injectable()
export class SystemAndEquipmentCurveService {

  currentField: BehaviorSubject<string>;
  pumpSystemCurveData: BehaviorSubject<PumpSystemCurveData>;
  fanSystemCurveData: BehaviorSubject<FanSystemCurveData>;
  focusedCalculator: BehaviorSubject<string>;
  byDataInputs: BehaviorSubject<ByDataInputs>;
  equipmentInputs: BehaviorSubject<EquipmentInputs>;
  byEquationInputs: BehaviorSubject<ByEquationInputs>;
  selectedEquipmentCurveFormView: BehaviorSubject<string>;
  equipmentCurveCollapsed: BehaviorSubject<string>;
  systemCurveCollapsed: BehaviorSubject<string>;
  resetForms: BehaviorSubject<boolean>;

  baselineEquipmentCurveDataPairs: BehaviorSubject<Array<{ x: number, y: number }>>;
  modifiedEquipmentCurveDataPairs: BehaviorSubject<Array<{ x: number, y: number }>>;
  systemCurveRegressionData: BehaviorSubject<Array<{ x: number, y: number, fluidPower: number }>>;
  systemCurveDataPoints: Array<{ pointName: string, flowRate: number, yValue: number }>;
  constructor(private equipmentCurveService: EquipmentCurveService,
    private fanSystemCurveFormService: FanSystemCurveFormService, private pumpSystemCurveFormService: PumpSystemCurveFormService) {
    this.currentField = new BehaviorSubject<string>('default');
    this.pumpSystemCurveData = new BehaviorSubject<PumpSystemCurveData>(undefined);
    this.fanSystemCurveData = new BehaviorSubject<FanSystemCurveData>(undefined);
    this.focusedCalculator = new BehaviorSubject<string>(undefined);
    this.byDataInputs = new BehaviorSubject<ByDataInputs>(undefined);
    this.equipmentInputs = new BehaviorSubject<EquipmentInputs>(undefined);
    this.byEquationInputs = new BehaviorSubject<ByEquationInputs>(undefined);
    this.selectedEquipmentCurveFormView = new BehaviorSubject<string>('Equation');
    this.equipmentCurveCollapsed = new BehaviorSubject<string>('closed');
    this.systemCurveCollapsed = new BehaviorSubject<string>('closed');
    this.baselineEquipmentCurveDataPairs = new BehaviorSubject(undefined);
    this.modifiedEquipmentCurveDataPairs = new BehaviorSubject(undefined);
    this.resetForms = new BehaviorSubject(false);
  }

  setExample(settings: Settings, equipmentType: string) {
    if (equipmentType == 'pump') {
      let byDataInputs: ByDataInputs = this.equipmentCurveService.getPumpByDataExample(settings);
      this.byDataInputs.next(byDataInputs);
      let pumpSystemCurveData: PumpSystemCurveData = this.pumpSystemCurveFormService.getPumpSystemCurveDefaults(settings);
      this.pumpSystemCurveData.next(pumpSystemCurveData);
    } else if (equipmentType == 'fan') {
      let byDataInputs: ByDataInputs = this.equipmentCurveService.getFanByDataExample(settings);
      this.byDataInputs.next(byDataInputs);
      let fanSystemCurveData: FanSystemCurveData = this.fanSystemCurveFormService.getFanSystemCurveDefaults(settings);
      this.fanSystemCurveData.next(fanSystemCurveData);
    }
    let flowUnit: string;
    let yValueUnit: string;
    let yImperialUnit: string;
    if (equipmentType == 'fan') {
      flowUnit = settings.fanFlowRate;
      yValueUnit = settings.fanPressureMeasurement;
      yImperialUnit = 'inH2o';
    } else {
      flowUnit = settings.flowMeasurement;
      yValueUnit = settings.distanceMeasurement;
      yImperialUnit = 'ft';
    }

    let exampleByEquationInputs: ByEquationInputs = this.equipmentCurveService.getByEquationDefault(flowUnit, yValueUnit, yImperialUnit);
    this.byEquationInputs.next(exampleByEquationInputs);
    let exampleEquipment: EquipmentInputs = this.equipmentCurveService.getEquipmentCurveDefault();
    this.equipmentInputs.next(exampleEquipment);

    this.selectedEquipmentCurveFormView.next('Data');
    this.systemCurveCollapsed.next('open');
    this.equipmentCurveCollapsed.next('open');
  }

  resetData(equipmentType: string) {
    let exampleByEquationInputs: ByEquationInputs = this.equipmentCurveService.getResetByEquationInputs();
    this.byEquationInputs.next(exampleByEquationInputs);
    let exampleEquipment: EquipmentInputs = this.equipmentCurveService.getResetEquipmentInputs();
    this.equipmentInputs.next(exampleEquipment);
    let byDataInputs: ByDataInputs = this.equipmentCurveService.getResetByDataInputs();
    this.byDataInputs.next(byDataInputs);

    if (equipmentType == 'fan') {
      let fanSystemCurveData: FanSystemCurveData = this.fanSystemCurveFormService.getResetFanSystemCurveInputs();
      this.fanSystemCurveData.next(fanSystemCurveData);
    } else if (equipmentType == 'pump') {
      let pumpSystemCurveData: PumpSystemCurveData = this.pumpSystemCurveFormService.getResetPumpSystemCurveInputs();
      this.pumpSystemCurveData.next(pumpSystemCurveData);
    }
  }

  initializeDataFromPSAT(psat: PSAT) {
    let systemCurveDataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = this.getPumpSystemCurveDataPoints(psat);
    this.systemCurveDataPoints = systemCurveDataPoints;
    let pumpSystemCurveData: PumpSystemCurveData = {
      specificGravity: psat.inputs.specific_gravity,
      systemLossExponent: 1.9,
      pointOneFlowRate: 0,
      pointOneHead: 0,
      pointTwo: 'Baseline',
      pointTwoFlowRate: psat.inputs.flow_rate,
      pointTwoHead: psat.inputs.head,
    };
    this.pumpSystemCurveData.next(pumpSystemCurveData);
  }

  getPumpSystemCurveDataPoints(psat: PSAT): Array<{ pointName: string, flowRate: number, yValue: number }> {
    let dataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = new Array();
    dataPoints.push({
      pointName: 'Baseline',
      flowRate: psat.inputs.flow_rate,
      yValue: psat.inputs.head
    });
    if (psat.modifications) {
      psat.modifications.forEach(modification => {
        dataPoints.push({
          pointName: modification.psat.name,
          flowRate: modification.psat.inputs.flow_rate,
          yValue: modification.psat.inputs.head
        });
      })
    }
    return dataPoints;
  }

  initializeDataFromFSAT(fsat: FSAT) {
    let systemCurveDataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = this.getFanSystemCurveDataPoints(fsat);
    this.systemCurveDataPoints = systemCurveDataPoints;
    let fanSystemCurveData: FanSystemCurveData = {
      compressibilityFactor: fsat.fieldData.compressibilityFactor,
      systemLossExponent: .98,
      pointOneFlowRate: 0,
      pointOnePressure: 0,
      pointTwo: 'Baseline',
      pointTwoFlowRate: fsat.fieldData.flowRate,
      pointTwoPressure: fsat.fieldData.inletPressure - fsat.fieldData.outletPressure
    }
    this.fanSystemCurveData.next(fanSystemCurveData);
  }

  getFanSystemCurveDataPoints(fsat: FSAT): Array<{ pointName: string, flowRate: number, yValue: number }> {
    let dataPoints: Array<{ pointName: string, flowRate: number, yValue: number }> = new Array();
    dataPoints.push({
      pointName: 'Baseline',
      flowRate: fsat.fieldData.flowRate,
      yValue: fsat.fieldData.outletPressure - fsat.fieldData.inletPressure
    });
    if (fsat.modifications) {
      fsat.modifications.forEach(modification => {
        dataPoints.push({
          pointName: modification.fsat.name,
          flowRate: modification.fsat.fieldData.flowRate,
          yValue: modification.fsat.fieldData.outletPressure - modification.fsat.fieldData.inletPressure
        })
      })
    }
    return dataPoints;
  }


}

export interface SystemAndEquipmentCurveData {
  pumpSystemCurveData?: PumpSystemCurveData,
  fanSystemCurveData?: FanSystemCurveData,
  byEquationInputs?: ByEquationInputs,
  byDataInputs?: ByDataInputs,
  equipmentInputs?: EquipmentInputs,
  equipmentCurveFormView?: string,
  systemCurveDataPoints?: Array<{ pointName: string, flowRate: number, yValue: number }>

}


export interface PumpSystemCurveData {
  specificGravity: number,
  systemLossExponent: number,
  pointOneFlowRate: number,
  pointOneHead: number,
  pointTwo: string,
  pointTwoFlowRate: number,
  pointTwoHead: number,
}

export interface FanSystemCurveData {
  compressibilityFactor: number,
  systemLossExponent: number,
  pointOneFlowRate: number,
  pointOnePressure: number,
  pointTwo: string,
  pointTwoFlowRate: number,
  pointTwoPressure: number
}


export interface ByEquationInputs {
  maxFlow: number,
  equationOrder: number,
  constant: number,
  flow: number,
  flowTwo: number,
  flowThree: number,
  flowFour: number,
  flowFive: number,
  flowSix: number
}

export interface EquipmentInputs {
  measurementOption: number,
  baselineMeasurement: number,
  modificationMeasurementOption: number,
  modifiedMeasurement: number
}

export interface ByDataInputs {
  dataRows: Array<{ flow: number, yValue: number }>,
  dataOrder: number
}