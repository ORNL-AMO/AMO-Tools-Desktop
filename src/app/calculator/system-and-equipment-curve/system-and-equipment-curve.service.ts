import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SystemAndEquipmentCurveService {

  currentField: BehaviorSubject<string>;
  pumpSystemCurveData: BehaviorSubject<PumpSystemCurveData>;
  constructor() { 
    this.currentField = new BehaviorSubject<string>('default');
    this.pumpSystemCurveData = new BehaviorSubject<PumpSystemCurveData>(undefined);
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
