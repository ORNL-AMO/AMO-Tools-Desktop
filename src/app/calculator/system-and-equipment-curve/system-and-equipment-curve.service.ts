import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { ByDataInputs, ByEquationInputs, EquipmentInputs, PumpSystemCurveData, FanSystemCurveData } from '../../shared/models/system-and-equipment-curve';
import { RegressionEquationsService } from './regression-equations.service';
import * as _ from 'lodash';

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
  updateGraph: BehaviorSubject<boolean>;

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

  constructor(private regressionEquationsService: RegressionEquationsService) {
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
    this.updateGraph = new BehaviorSubject<boolean>(false);
  }

  //calculation functions
  getMaxFlowRate(equipmentType: string): number {
    //50, system curve point (1,2) flow rate, byData max flow rate from data rows, byEquation max flow
    let maxFlowRate: number = 50;
    let maxEquipmentCurve: number = 0;
    let maxSystemCurve: number = 0;
    let ratio: number = 1;
    //max system curve
    if (this.systemCurveCollapsed.getValue() == 'open') {
      if (equipmentType == 'pump' && this.pumpSystemCurveData.getValue() != undefined) {
        maxSystemCurve = _.max([this.pumpSystemCurveData.getValue().pointOneFlowRate, this.pumpSystemCurveData.getValue().pointTwoFlowRate]);
      } else if (equipmentType == 'fan' && this.fanSystemCurveData.getValue() != undefined) {
        maxSystemCurve = _.max([this.fanSystemCurveData.getValue().pointOneFlowRate, this.fanSystemCurveData.getValue().pointTwoFlowRate]);
      }
    }
    //max equipment curve;
    if (this.equipmentCurveCollapsed.getValue() == 'open') {
      if (this.selectedEquipmentCurveFormView.getValue() == 'Equation' && this.byEquationInputs.getValue() != undefined) {
        maxEquipmentCurve = this.byEquationInputs.getValue().maxFlow;
      } else if (this.selectedEquipmentCurveFormView.getValue() == 'Data' && this.byDataInputs.getValue() != undefined) {
        maxEquipmentCurve = _.maxBy(this.byDataInputs.getValue().dataRows, (val) => { return val.flow }).flow;
      }
      //adjust for modificatication > baseline
      if (this.equipmentInputs.getValue() != undefined && (this.equipmentInputs.getValue().baselineMeasurement < this.equipmentInputs.getValue().modifiedMeasurement)) {
        ratio = this.equipmentInputs.getValue().modifiedMeasurement / this.equipmentInputs.getValue().baselineMeasurement;
      }
    }
    maxFlowRate = _.max([maxFlowRate, maxEquipmentCurve, maxSystemCurve]) * ratio;
    return maxFlowRate;
  }


  calculateByDataRegression(equipmentType: string, maxFlowRate: number) {
    if (this.byDataInputs.getValue() != undefined && this.equipmentInputs.getValue() != undefined) {
      let secondValueLabel: string = 'Head';
      if (equipmentType == 'fan') {
        secondValueLabel = 'Pressure';
      }
      let results = this.regressionEquationsService.getEquipmentCurveRegressionByData(this.byDataInputs.getValue(), this.equipmentInputs.getValue(), secondValueLabel, maxFlowRate);
      this.regressionEquationsService.baselineEquipmentCurveByDataRegressionEquation.next(results.baselineRegressionEquation);
      this.regressionEquationsService.baselineEquipmentCurveByDataRSquared.next(results.baselineRSquared);
      this.regressionEquationsService.modificationEquipmentCurveByDataRegressionEquation.next(results.modificationRegressionEquation);
      this.regressionEquationsService.modificationEquipmentCurveRSquared.next(results.modificationRSquared);
      if (this.selectedEquipmentCurveFormView.getValue() == 'Data') {
        this.baselineEquipmentCurveDataPairs = results.baselineDataPairs;
        this.modifiedEquipmentCurveDataPairs = results.modifiedDataPairs;
      }
    }
  }

  calculateByEquationRegressions(equipmentType: string, maxFlowRate: number) {
    if (this.byEquationInputs.getValue() != undefined && this.equipmentInputs.getValue() != undefined) {
      let secondValueLabel: string = 'Head';
      if (equipmentType == 'fan') {
        secondValueLabel = 'Pressure';
      }
      let results = this.regressionEquationsService.getEquipmentCurveRegressionByEquation(this.byEquationInputs.getValue(), this.equipmentInputs.getValue(), secondValueLabel, maxFlowRate);
      this.regressionEquationsService.baselineEquipmentCurveByEquationRegressionEquation.next(results.baselineRegressionEquation);
      this.regressionEquationsService.modificationEquipmentCurveByEquationRegressionEquation.next(results.modificationRegressionEquation);
      if (this.selectedEquipmentCurveFormView.getValue() == 'Equation') {
        this.baselineEquipmentCurveDataPairs = results.baselineDataPairs;
        this.modifiedEquipmentCurveDataPairs = results.modifiedDataPairs;
      }
    }
  }

  calculateSystemCurveRegressionData(equipmentType: string, settings: Settings, maxFlowRate: number) {
    if (equipmentType == 'pump' && this.pumpSystemCurveData.getValue() != undefined) {
      let systemCurveRegressionEquation: string = this.regressionEquationsService.getPumpSystemCurveRegressionEquation(this.pumpSystemCurveData.getValue());
      this.regressionEquationsService.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
      this.systemCurveRegressionData = this.regressionEquationsService.calculatePumpSystemCurveData(this.pumpSystemCurveData.getValue(), maxFlowRate, settings);
    } else if (equipmentType == 'fan' && this.fanSystemCurveData.getValue() != undefined) {
      let systemCurveRegressionEquation: string = this.regressionEquationsService.getFanSystemCurveRegressionEquation(this.fanSystemCurveData.getValue());
      this.regressionEquationsService.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
      this.systemCurveRegressionData = this.regressionEquationsService.calculateFanSystemCurveData(this.fanSystemCurveData.getValue(), maxFlowRate, settings);
    }
  }

}