import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { ByDataInputs, ByEquationInputs, EquipmentInputs, PumpSystemCurveData, FanSystemCurveData, ModificationEquipment } from '../../shared/models/system-and-equipment-curve';
import { RegressionEquationsService } from './regression-equations.service';
import * as _ from 'lodash';
import { DataPoint } from '../../shared/models/plotting';

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
  pumpModificationCollapsed: BehaviorSubject<string>;
  fanModificationCollapsed: BehaviorSubject<string>;
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
  systemCurveIntersectionData: BehaviorSubject<DataPoint>;
  modificationEquipment: BehaviorSubject<ModificationEquipment>;

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
    this.pumpModificationCollapsed = new BehaviorSubject<string>('closed');
    this.fanModificationCollapsed = new BehaviorSubject<string>('closed');
    this.updateGraph = new BehaviorSubject<boolean>(false);
    this.systemCurveIntersectionData = new BehaviorSubject<DataPoint>(undefined);
    this.modificationEquipment = new BehaviorSubject<ModificationEquipment>(undefined);
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

      // If baselineMeasurement is not greater than zero we get infinity (on reset)
      if (this.equipmentInputs.getValue() != undefined 
          && this.modificationEquipment.getValue() != undefined 
          && this.equipmentInputs.getValue().baselineMeasurement > 0
          && (this.equipmentInputs.getValue().baselineMeasurement < this.modificationEquipment.getValue().speed)) {
        ratio = this.modificationEquipment.getValue().speed / this.equipmentInputs.getValue().baselineMeasurement;
      }
    }
    maxFlowRate = _.max([maxFlowRate, maxEquipmentCurve, maxSystemCurve]) * ratio;
    return maxFlowRate;
  }

  resetModificationEquipment() {
    let modificationEquipment: ModificationEquipment = {
      head: 0,
      flow: 0,
      pressure: 0,
      speed: 0,
    };
    this.modificationEquipment.next(modificationEquipment);
  }


  calculateByDataRegression(equipmentType: string, maxFlowRate: number) {
    if (this.byDataInputs.getValue() != undefined 
        && this.equipmentInputs.getValue() != undefined) {
      let secondValueLabel: string = 'Head';
      if (equipmentType == 'fan') {
        secondValueLabel = 'Pressure';
      }
      let results = this.regressionEquationsService.getEquipmentCurveRegressionByData(this.byDataInputs.getValue(), this.equipmentInputs.getValue(), this.modificationEquipment.getValue(), secondValueLabel, maxFlowRate);
      console.log(results);
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
      let results = this.regressionEquationsService.getEquipmentCurveRegressionByEquation(this.byEquationInputs.getValue(), this.equipmentInputs.getValue(), this.modificationEquipment.getValue(), secondValueLabel, maxFlowRate);
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
      this.calculateModificationEquipment();
    } else if (equipmentType == 'fan' && this.fanSystemCurveData.getValue() != undefined) {
      let systemCurveRegressionEquation: string = this.regressionEquationsService.getFanSystemCurveRegressionEquation(this.fanSystemCurveData.getValue());
      this.regressionEquationsService.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
      this.systemCurveRegressionData = this.regressionEquationsService.calculateFanSystemCurveData(this.fanSystemCurveData.getValue(), maxFlowRate, settings);
      this.calculateModificationEquipment(true);
    }
  }

  calculateModificationEquipment(isFanEquipment = false) {
    let equipmentInputs = this.equipmentInputs.getValue();
    let intersection;
    let modificationEquipment: ModificationEquipment = {head: 0, flow: 0, speed: 0};
    
    // No pairs on reset
    if (this.baselineEquipmentCurveDataPairs.length > 0) {
      intersection = this.calculateIntersectionPoint(this.baselineEquipmentCurveDataPairs);
      if (intersection) {
        let systemCurveIntersectionData = intersection;
        this.systemCurveIntersectionData.next(systemCurveIntersectionData)
        let systemCurveData: FanSystemCurveData | PumpSystemCurveData;
        if (isFanEquipment) {
          systemCurveData = this.fanSystemCurveData.getValue();
        } else {
          systemCurveData = this.pumpSystemCurveData.getValue();
        }
        if (systemCurveData.modificationCurve.modificationMeasurementOption == 0) {
          // We have flow input
          modificationEquipment = this.calculateModifiedYValue(modificationEquipment, systemCurveData)
        } else {
          // We have Head input
          modificationEquipment = this.calculateModifiedFlow(modificationEquipment, systemCurveData)
        }
        let baselineFlow = intersection.x;
        // new speed/diameter from affinity law
        modificationEquipment.speed = equipmentInputs.baselineMeasurement * (modificationEquipment.flow / baselineFlow);
      }
    }
    this.modificationEquipment.next(modificationEquipment);
  }

  isFanCurveData(curveData: FanSystemCurveData | PumpSystemCurveData): curveData is FanSystemCurveData {
    return (curveData as FanSystemCurveData).pointOnePressure !== undefined;
  }

  calculateModifiedYValue(modificationEquipment: ModificationEquipment, systemCurveData: PumpSystemCurveData | FanSystemCurveData) {
    let pointOneY: number;
    let pointTwoY: number;
    if (this.isFanCurveData(systemCurveData)) {
      pointOneY = systemCurveData.pointOnePressure;
      pointTwoY = systemCurveData.pointTwoPressure;
    } else {
      pointOneY = systemCurveData.pointOneHead;
      pointTwoY = systemCurveData.pointTwoHead;
    }
    // User input for OP 1 pressure passed in to get staticHead
    let staticHead: number = this.regressionEquationsService.calculateStaticHead(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let lossCoefficient: number = this.regressionEquationsService.calculateLossCoefficient(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let constant = lossCoefficient;
    let systemLossExponent = systemCurveData.systemLossExponent;
    
    // modificationHead = Static head + (constant * flow ^ system loss exponent)
    let modifiedYValue = staticHead + (constant * (Math.pow(systemCurveData.modificationCurve.modifiedFlow, systemLossExponent)));

    modificationEquipment.flow = systemCurveData.modificationCurve.modifiedFlow;
    if (this.isFanCurveData(systemCurveData)) {
      modificationEquipment.pressure = modifiedYValue;
    } else {
      modificationEquipment.head = modifiedYValue;
    }
    return modificationEquipment;
  }

  calculateModifiedFlow(modificationEquipment: ModificationEquipment, systemCurveData: PumpSystemCurveData | FanSystemCurveData) {
    let pointOneY: number;
    let pointTwoY: number;
    let modificationInput: number;
    if (this.isFanCurveData(systemCurveData)) {
      pointOneY = systemCurveData.pointOnePressure;
      pointTwoY = systemCurveData.pointTwoPressure;
      modificationInput = systemCurveData.modificationCurve.modifiedPressure;
    } else {
      pointOneY = systemCurveData.pointOneHead;
      pointTwoY = systemCurveData.pointTwoHead;
      modificationInput = systemCurveData.modificationCurve.modifiedHead;
    }
    let staticHead: number = this.regressionEquationsService.calculateStaticHead(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let lossCoefficient: number = this.regressionEquationsService.calculateLossCoefficient(
      systemCurveData.pointOneFlowRate,
      pointOneY,
      systemCurveData.pointTwoFlowRate,
      pointTwoY,
      systemCurveData.systemLossExponent
    );
    let constant = lossCoefficient;
    let systemLossExponent = systemCurveData.systemLossExponent;

   // modificationFlow = power((modificationHead - staticHead)/Constant, 1 / systemLossExponent) }
    let exp = 1 / systemLossExponent;
    let modifiedFlow = Math.pow((modificationInput - staticHead) / constant, exp);

    if (isNaN(modifiedFlow) || !isFinite(modifiedFlow)) {
      modifiedFlow = 0;
    }
    
    modificationEquipment.flow = modifiedFlow;
    if (this.isFanCurveData(systemCurveData)) {
      modificationEquipment.pressure = systemCurveData.modificationCurve.modifiedPressure;
    } else {
      modificationEquipment.head = systemCurveData.modificationCurve.modifiedHead;
    }
    return modificationEquipment;
  }

  calculateIntersectionPoint(equipmentCurve: Array<{ x: number, y: number }>): { x: number, y: number } {
    let systemCurve: Array<{ x: number, y: number, fluidPower: number }> = this.systemCurveRegressionData;
    let intersected: boolean = false;
    let equipmentStartGreater: boolean = false;
    let intersectPoint: number = 0;
    if (equipmentCurve[0].y > systemCurve[0].y) {
      equipmentStartGreater = true;
    }
    let iterateMax: number;
    if (systemCurve.length <= equipmentCurve.length) {
      iterateMax = systemCurve.length;
    } else {
      iterateMax = equipmentCurve.length;
    }
    if (equipmentStartGreater) {
      for (let i = 1; i < iterateMax; i++) {
        if (equipmentCurve[i].y < systemCurve[i].y) {
          intersectPoint = i;
          intersected = true;
          break;
        }
      };
    }
    else {
      for (let i = 1; i < iterateMax; i++) {
        if (equipmentCurve[i].y > systemCurve[i].y) {
          intersectPoint = i;
          intersected = true;
          break;
        }
      };
    }

    if (intersected) {
      let equipmentVal1 = equipmentCurve[intersectPoint - 1];
      let equipmentVal2 = equipmentCurve[intersectPoint];
      let systemVal1 = systemCurve[intersectPoint - 1];
      let systemVal2 = systemCurve[intersectPoint];
      
      let avgYVal = (equipmentVal1.y + equipmentVal2.y + systemVal1.y + systemVal2.y) / 4;
      let avgXVal = (equipmentVal1.x + equipmentVal2.x + systemVal1.x + systemVal2.x) / 4;
      return { x: avgXVal, y: avgYVal };      
    } else {
      return undefined;
    }
  }

}