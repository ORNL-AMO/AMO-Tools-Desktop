import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ByDataInputs, EquipmentInputs, ByEquationInputs } from './equipment-curve/equipment-curve.service';

@Injectable()
export class SystemAndEquipmentCurveService {

  currentField: BehaviorSubject<string>;
  pumpSystemCurveData: BehaviorSubject<PumpSystemCurveData>;
  fanSystemCurveData: BehaviorSubject<FanSystemCurveData>;
  focusedCalculator: BehaviorSubject<string>;
  byDataInputs: BehaviorSubject<ByDataInputs>;
  equipmentInputs: BehaviorSubject<EquipmentInputs>;
  byEquationInputs: BehaviorSubject<ByEquationInputs>;
  constructor() {
    this.currentField = new BehaviorSubject<string>('default');
    this.pumpSystemCurveData = new BehaviorSubject<PumpSystemCurveData>(undefined);
    this.fanSystemCurveData = new BehaviorSubject<FanSystemCurveData>(undefined);
    this.focusedCalculator = new BehaviorSubject<string>(undefined);
    this.byDataInputs = new BehaviorSubject<ByDataInputs>(undefined);
    this.equipmentInputs = new BehaviorSubject<EquipmentInputs>(undefined);
    this.byEquationInputs = new BehaviorSubject<ByEquationInputs>(undefined);
  }
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