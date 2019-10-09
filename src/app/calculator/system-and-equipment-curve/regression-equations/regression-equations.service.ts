import { Injectable } from '@angular/core';
import * as regression from 'regression';
import { ByDataInputs, ByEquationInputs, EquipmentInputs } from '../equipment-curve/equipment-curve.service';
import * as _ from 'lodash';
import { FanSystemCurveData, PumpSystemCurveData } from '../system-and-equipment-curve.service';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class RegressionEquationsService {

  baselineEquipmentCurveByDataRegressionEquation: BehaviorSubject<string>;
  baselineEquipmentCurveByDataRSquared: BehaviorSubject<number>;

  modificationEquipmentCurveByDataRegressionEquation: BehaviorSubject<string>;
  modificationEquipmentCurveRSquared: BehaviorSubject<number>;

  baselineEquipmentCurveByEquationRegressionEquation: BehaviorSubject<string>;
  modificationEquipmentCurveByEquationRegressionEquation: BehaviorSubject<string>;

  systemCurveRegressionEquation: BehaviorSubject<string>;
  constructor() {
    this.baselineEquipmentCurveByDataRegressionEquation = new BehaviorSubject<string>(undefined);
    this.baselineEquipmentCurveByDataRSquared = new BehaviorSubject<number>(undefined);

    this.modificationEquipmentCurveByDataRegressionEquation = new BehaviorSubject<string>(undefined);
    this.modificationEquipmentCurveRSquared = new BehaviorSubject<number>(undefined);

    this.baselineEquipmentCurveByEquationRegressionEquation = new BehaviorSubject<string>(undefined);
    this.modificationEquipmentCurveByEquationRegressionEquation = new BehaviorSubject<string>(undefined);

    this.systemCurveRegressionEquation = new BehaviorSubject<string>(undefined);
  }

  getEquipmentCurveRegressionByData(byData: ByDataInputs, equipmentInputs: EquipmentInputs, secondValueLabel: string): {
    baselineRegressionEquation: string,
    baselineRSquared: number,
    modificationRegressionEquation: string,
    modificationRSquared: number,
    baselineDataPairs: Array<Array<number>>,
    modifiedDataPairs: Array<Array<number>>
  } {

    let baselineDataPairs: Array<Array<number>> = new Array();
    byData.dataRows.forEach(row => {
      baselineDataPairs.push([row.flow, row.secondValue]);
    })

    let baselineResults = regression.polynomial(baselineDataPairs, { order: byData.dataOrder, precision: 10 });
    let baselineRegressionEquation: string = baselineResults.string;
    baselineRegressionEquation = this.formatRegressionEquation(baselineResults.string, byData.dataOrder, secondValueLabel);

    let ratio: number = equipmentInputs.modifiedMeasurement / equipmentInputs.baselineMeasurement;
    let maxDataFlow: number = _.maxBy(byData.dataRows, (val) => { return val.flow }).flow;
    let modificationData: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    for (let i = 0; i <= maxDataFlow; i = i + 10) {
      let yVal = baselineResults.predict(i);
      if (yVal[1] > 0) {
        modificationData.push({
          x: i * ratio,
          y: yVal[1] * Math.pow(ratio, 2)
        })
      }
    }

    let modifiedDataPairs: Array<Array<number>> = new Array();
    modificationData.forEach(dataPoint => {
      modifiedDataPairs.push([dataPoint.x, dataPoint.y]);
    })
    let modificationResults = regression.polynomial(modifiedDataPairs, { order: byData.dataOrder, precision: 10 });
    let modificationRegressionEquation: string = this.formatRegressionEquation(modificationResults.string, byData.dataOrder, secondValueLabel);

    return {
      baselineRegressionEquation: baselineRegressionEquation,
      baselineRSquared: baselineResults.r2,
      modificationRSquared: modificationResults.r2,
      modificationRegressionEquation: modificationRegressionEquation,
      baselineDataPairs: baselineDataPairs,
      modifiedDataPairs: modifiedDataPairs
    }

  }

  formatRegressionEquation(regressionEquation: string, order: number, secondValueLabel): string {
    for (let i = 0; i < order; i++) {
      regressionEquation = regressionEquation.replace(/x/, '(flow)');
      regressionEquation = regressionEquation.replace('+ -', '- ');
    }
    regressionEquation = regressionEquation.replace('y', secondValueLabel);
    regressionEquation = regressionEquation.replace('^2', '&#x00B2;');
    regressionEquation = regressionEquation.replace('^3', '&#x00B3;');
    regressionEquation = regressionEquation.replace('^4', '&#x2074;');
    regressionEquation = regressionEquation.replace('^5', '&#x2075;');
    regressionEquation = regressionEquation.replace('^6', '&#x2076;');
    return regressionEquation;
  }

  getEquipmentCurveRegressionByEquation(byEquationInputs: ByEquationInputs, equipmentInputs: EquipmentInputs, secondValueLabel: string): { baselineRegressionEquation: string, modificationRegressionEquation: string } {
    //baseline
    let baselineRegressionEquation = byEquationInputs.flowTwo + '(flow)&#x00B2; + ' + byEquationInputs.flow + ('(flow) +') + byEquationInputs.constant;
    if (byEquationInputs.equationOrder > 2 && byEquationInputs.flowThree) {
      baselineRegressionEquation = byEquationInputs.flowThree + '(flow)&#x00B3; + ' + baselineRegressionEquation;
    }
    if (byEquationInputs.equationOrder > 3 && byEquationInputs.flowFour) {
      baselineRegressionEquation = byEquationInputs.flowFour + '(flow)&#x2074; + ' + baselineRegressionEquation;
    }
    if (byEquationInputs.equationOrder > 4 && byEquationInputs.flowFive) {
      baselineRegressionEquation = byEquationInputs.flowFive + '(flow)&#x2075; + ' + baselineRegressionEquation;
    }
    if (byEquationInputs.equationOrder > 5 && byEquationInputs.flowSix) {
      baselineRegressionEquation = byEquationInputs.flowSix + '(flow)&#x2076; + ' + baselineRegressionEquation;
    }
    baselineRegressionEquation = secondValueLabel + ' = ' + baselineRegressionEquation;
    for (let i = 0; i < byEquationInputs.equationOrder; i++) {
      baselineRegressionEquation = baselineRegressionEquation.replace('+ -', '- ');
    }

    //modification
    let dataPoints: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    let ratio: number = equipmentInputs.modifiedMeasurement / equipmentInputs.baselineMeasurement;
    let maxDataFlow: number = byEquationInputs.maxFlow;
    dataPoints.push({
      x: 0 * ratio,
      y: this.calculateY(byEquationInputs, 0) * Math.pow(ratio, 2)
    });
    for (let i = 10; i <= maxDataFlow + 10; i = i + 10) {
      let yVal = this.calculateY(byEquationInputs, i);
      if (yVal > 0) {
        dataPoints.push({
          x: i * ratio,
          y: yVal * Math.pow(ratio, 2)
        })
      }
    }
    let modificationData = new Array<any>();
    dataPoints.forEach(dataPoint => {
      modificationData.push([dataPoint.x, dataPoint.y]);
    });
    let modificationResults = regression.polynomial(modificationData, { order: byEquationInputs.equationOrder, precision: 10 });
    let modificationRegressionEquation: string = this.formatRegressionEquation(modificationResults.string, byEquationInputs.equationOrder, secondValueLabel);

    return { baselineRegressionEquation: baselineRegressionEquation, modificationRegressionEquation: modificationRegressionEquation };
  }

  calculateY(data: ByEquationInputs, flow: number): number {
    let result = data.constant + (data.flow * flow) + (data.flowTwo * Math.pow(flow, 2)) + (data.flowThree * Math.pow(flow, 3)) + (data.flowFour * Math.pow(flow, 4)) + (data.flowFive * Math.pow(flow, 5)) + (data.flowSix * Math.pow(flow, 6));
    return result;
  }

  getPumpSystemCurveRegressionEquation(data: PumpSystemCurveData): string {
    let lossCoefficient: number = this.calculateStaticHead(
      data.pointOneFlowRate,
      data.pointOneHead,
      data.pointTwoFlowRate,
      data.pointTwoHead,
      data.systemLossExponent
    );
    let staticHead: number = this.calculateStaticHead(
      data.pointOneFlowRate,
      data.pointOneHead,
      data.pointTwoFlowRate,
      data.pointTwoHead,
      data.systemLossExponent
    );
    return 'Head = ' + staticHead + ' + (' + lossCoefficient + ' \xD7 flow' + '<sup>' + data.systemLossExponent + '</sup>)';
  }

  getFanSystemCurveRegressionEquation(data: FanSystemCurveData): string {
    let lossCoefficient: number = this.calculateStaticHead(
      data.pointOneFlowRate,
      data.pointOnePressure,
      data.pointTwoFlowRate,
      data.pointTwoPressure,
      data.systemLossExponent
    );
    let staticPressure: number = this.calculateStaticHead(
      data.pointOneFlowRate,
      data.pointOnePressure,
      data.pointTwoFlowRate,
      data.pointTwoPressure,
      data.systemLossExponent
    );
    return 'Pressure = ' + staticPressure + ' + (' + lossCoefficient + ' \xD7 flow' + '<sup>' + data.systemLossExponent + '</sup>)';
  }

  calculateLossCoefficient(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> k = (h2-h1)/(Math.pow(f2,C)-Math.pow(f1,C))
    return (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent));
  }

  calculateStaticHead(flowRateOne: number, headOne: number, flowRateTwo: number, headTwo: number, lossExponent: number): number {
    //from PSAT/curve.html -> hS = h1-(Math.pow(f1,1.9) * (h2-h1) / (Math.pow(f2,C) - Math.pow(f1,C)))
    let tmpStaticHead = headOne - (Math.pow(flowRateOne, lossExponent) * (headTwo - headOne) / (Math.pow(flowRateTwo, lossExponent) - Math.pow(flowRateOne, lossExponent)));
    return tmpStaticHead;
  }
}
