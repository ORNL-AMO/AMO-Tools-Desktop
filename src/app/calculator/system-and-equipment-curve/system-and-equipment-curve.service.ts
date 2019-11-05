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
  //persistent equipment curve data
  pumpByDataInputs: ByDataInputs;
  pumpByEquationInputs: ByEquationInputs;
  pumpEquipmentInputs: EquipmentInputs;

  fanByDataInputs: ByDataInputs;
  fanByEquationInputs: ByEquationInputs;
  fanEquipmentInputs: EquipmentInputs;

  //behavior subjects
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

  baselineEquipmentCurveDataPairs: BehaviorSubject<Array<{ x: number, y: number }>>;
  modifiedEquipmentCurveDataPairs: BehaviorSubject<Array<{ x: number, y: number }>>;
  systemCurveRegressionData: BehaviorSubject<Array<{ x: number, y: number, fluidPower: number }>>;
  //data points for system curve dropdown in assessment
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