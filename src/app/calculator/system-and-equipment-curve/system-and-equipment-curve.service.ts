import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { EquipmentCurveService } from './equipment-curve/equipment-curve.service';
import { FanSystemCurveFormService } from './system-curve/fan-system-curve-form.service';
import { PumpSystemCurveFormService } from './system-curve/pump-system-curve-form.service';
import { PSAT } from '../../shared/models/psat';
import { FSAT } from '../../shared/models/fans';
import { ByDataInputs, ByEquationInputs, EquipmentInputs, PumpSystemCurveData, FanSystemCurveData } from '../../shared/models/system-and-equipment-curve';

@Injectable()
export class SystemAndEquipmentCurveService {
  //persistent data objects for calculator
  pumpByDataInputs: ByDataInputs;
  pumpByEquationInputs: ByEquationInputs;
  pumpEquipmentInputs: EquipmentInputs;
  fanByDataInputs: ByDataInputs;
  fanByEquationInputs: ByEquationInputs;
  fanEquipmentInputs: EquipmentInputs;

  //behavior subjects for calculator state
  currentField: BehaviorSubject<string>;
  focusedCalculator: BehaviorSubject<string>;
  selectedEquipmentCurveFormView: BehaviorSubject<string>;
  equipmentCurveCollapsed: BehaviorSubject<string>;
  systemCurveCollapsed: BehaviorSubject<string>;

  //form data behavior subjects
  pumpSystemCurveData: BehaviorSubject<PumpSystemCurveData>;
  fanSystemCurveData: BehaviorSubject<FanSystemCurveData>;
  byDataInputs: BehaviorSubject<ByDataInputs>;
  equipmentInputs: BehaviorSubject<EquipmentInputs>;
  byEquationInputs: BehaviorSubject<ByEquationInputs>;

  //calcuated data points
  baselineEquipmentCurveDataPairs: Array<{ x: number, y: number }>;
  modifiedEquipmentCurveDataPairs: Array<{ x: number, y: number }>;
  systemCurveRegressionData: Array<{ x: number, y: number, fluidPower: number }>;

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
  }
}