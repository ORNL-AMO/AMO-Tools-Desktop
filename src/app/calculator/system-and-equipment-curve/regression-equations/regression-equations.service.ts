import { Injectable } from '@angular/core';
import * as regression from 'regression';
import * as _ from 'lodash';
import { FanSystemCurveData, PumpSystemCurveData, ByDataInputs, EquipmentInputs, ByEquationInputs } from '../system-and-equipment-curve.service';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
@Injectable()
export class RegressionEquationsService {

  baselineEquipmentCurveByDataRegressionEquation: BehaviorSubject<string>;
  baselineEquipmentCurveByDataRSquared: BehaviorSubject<number>;

  modificationEquipmentCurveByDataRegressionEquation: BehaviorSubject<string>;
  modificationEquipmentCurveRSquared: BehaviorSubject<number>;

  baselineEquipmentCurveByEquationRegressionEquation: BehaviorSubject<string>;
  modificationEquipmentCurveByEquationRegressionEquation: BehaviorSubject<string>;

  systemCurveRegressionEquation: BehaviorSubject<string>;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.baselineEquipmentCurveByDataRegressionEquation = new BehaviorSubject<string>(undefined);
    this.baselineEquipmentCurveByDataRSquared = new BehaviorSubject<number>(undefined);

    this.modificationEquipmentCurveByDataRegressionEquation = new BehaviorSubject<string>(undefined);
    this.modificationEquipmentCurveRSquared = new BehaviorSubject<number>(undefined);

    this.baselineEquipmentCurveByEquationRegressionEquation = new BehaviorSubject<string>(undefined);
    this.modificationEquipmentCurveByEquationRegressionEquation = new BehaviorSubject<string>(undefined);

    this.systemCurveRegressionEquation = new BehaviorSubject<string>(undefined);
  }

  getEquipmentCurveRegressionByData(byData: ByDataInputs, equipmentInputs: EquipmentInputs, yValue: string): {
    baselineRegressionEquation: string,
    baselineRSquared: number,
    modificationRegressionEquation: string,
    modificationRSquared: number,
    baselineDataPairs: Array<{ x: number, y: number }>,
    modifiedDataPairs: Array<{ x: number, y: number }>
  } {
    let baselineData: Array<Array<number>> = new Array();
    byData.dataRows.forEach(row => {
      baselineData.push([row.flow, row.yValue]);
    })

    let baselineResults = regression.polynomial(baselineData, { order: byData.dataOrder, precision: 10 });
    let baselineRegressionEquation: string = baselineResults.string;

    let maxDataFlow: number = _.maxBy(byData.dataRows, (val) => { return val.flow }).flow;

    baselineRegressionEquation = this.formatRegressionEquation(baselineResults.string, byData.dataOrder, yValue);
    let baselineDataPairs: Array<{ x: number, y: number }> = new Array();

    let ratio: number = equipmentInputs.modifiedMeasurement / equipmentInputs.baselineMeasurement;
    let modifiedDataPairs: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    let modificationData: Array<Array<number>> = new Array();
    for (let i = 0; i <= maxDataFlow; i += 10) {
      let yVal = baselineResults.predict(i);
      if (yVal[1] > 0) {
        let xBaseline: number = i;
        let yBaseline: number = yVal[1];
        let xModified: number = i * ratio;
        let yModified: number = yVal[1] * Math.pow(ratio, 2);
        modifiedDataPairs.push({
          x: xModified,
          y: yModified
        });
        modificationData.push([xModified, yModified]);
        baselineDataPairs.push({
          x: xBaseline,
          y: yBaseline
        });
      }
    }
    let modificationResults = regression.polynomial(modificationData, { order: byData.dataOrder, precision: 10 });
    let modificationRegressionEquation: string = this.formatRegressionEquation(modificationResults.string, byData.dataOrder, yValue);

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

  getEquipmentCurveRegressionByEquation(byEquationInputs: ByEquationInputs, equipmentInputs: EquipmentInputs, secondValueLabel: string): {
    baselineRegressionEquation: string,
    modificationRegressionEquation: string,
    baselineDataPairs: Array<{ x: number, y: number }>,
    modifiedDataPairs: Array<{ x: number, y: number }>
  } {
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
    //baseline
    let baselineDataPairs: Array<{ x: number, y: number }> = this.calculateByEquationData(byEquationInputs, 1).dataPairs;

    //modification
    let ratio: number = equipmentInputs.modifiedMeasurement / equipmentInputs.baselineMeasurement;
    let modifiedData: { calculationData: Array<Array<number>>, dataPairs: Array<{ x: number, y: number }> } = this.calculateByEquationData(byEquationInputs, ratio);
    let modificationResults = regression.polynomial(modifiedData.calculationData, { order: byEquationInputs.equationOrder, precision: 10 });
    let modificationRegressionEquation: string = this.formatRegressionEquation(modificationResults.string, byEquationInputs.equationOrder, secondValueLabel);
    return {
      baselineRegressionEquation: baselineRegressionEquation,
      modificationRegressionEquation: modificationRegressionEquation,
      baselineDataPairs: baselineDataPairs,
      modifiedDataPairs: modifiedData.dataPairs
    };
  }

  calculateByEquationData(byEquationInputs: ByEquationInputs, ratio: number): { calculationData: Array<Array<number>>, dataPairs: Array<{ x: number, y: number }> } {
    let calculationData: Array<Array<number>> = new Array();
    let dataPairs: Array<{ x: number, y: number }> = new Array();
    for (let i = 0; i <= byEquationInputs.maxFlow + 10; i += 10) {
      let yVal = this.calculateY(byEquationInputs, i);
      if (yVal > 0) {
        let x: number = i * ratio;
        let y: number = yVal * Math.pow(ratio, 2);
        calculationData.push([x, y]);
        dataPairs.push({ x: x, y: y });
      }
    }
    return { calculationData: calculationData, dataPairs: dataPairs };
  }


  calculateY(data: ByEquationInputs, flow: number): number {
    let result = data.constant + (data.flow * flow) + (data.flowTwo * Math.pow(flow, 2)) + (data.flowThree * Math.pow(flow, 3)) + (data.flowFour * Math.pow(flow, 4)) + (data.flowFive * Math.pow(flow, 5)) + (data.flowSix * Math.pow(flow, 6));
    return result;
  }

  getPumpSystemCurveRegressionEquation(data: PumpSystemCurveData): string {
    let lossCoefficient: number = this.calculateLossCoefficient(
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
    let lossCoefficient: number = this.calculateLossCoefficient(
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


  calculateFanSystemCurveData(fanSystemCurveData: FanSystemCurveData, maxXValue: number, settings: Settings): Array<{ x: number, y: number, fluidPower: number }> {
    let data: Array<{ x: number, y: number, fluidPower: number }> = new Array<{ x: number, y: number, fluidPower: number }>();
    let lossCoefficient: number = this.calculateLossCoefficient(
      fanSystemCurveData.pointOneFlowRate,
      fanSystemCurveData.pointOnePressure,
      fanSystemCurveData.pointTwoFlowRate,
      fanSystemCurveData.pointTwoPressure,
      fanSystemCurveData.systemLossExponent
    );
    let staticPressure: number = this.calculateStaticHead(
      fanSystemCurveData.pointOneFlowRate,
      fanSystemCurveData.pointOnePressure,
      fanSystemCurveData.pointTwoFlowRate,
      fanSystemCurveData.pointTwoPressure,
      fanSystemCurveData.systemLossExponent
    );
    for (var i = 0; i <= maxXValue; i += 10) {
      let pressureAndFluidPower: { pressure: number, fluidPower: number } = this.calculateFanPressureAndFluidPower(staticPressure, lossCoefficient, i, fanSystemCurveData.systemLossExponent, fanSystemCurveData.compressibilityFactor, settings);
      if (pressureAndFluidPower.pressure >= 0) {
        data.push({ x: i, y: pressureAndFluidPower.pressure, fluidPower: pressureAndFluidPower.fluidPower })
      } else {
        data.push({ x: 0, y: 0, fluidPower: 0 });
      }
    }
    return data;
  }


  calculatePumpSystemCurveData(pumpSystemCurveData: PumpSystemCurveData, maxXValue: number, settings: Settings): Array<{ x: number, y: number, fluidPower: number }> {
    let data: Array<{ x: number, y: number, fluidPower: number }> = new Array<{ x: number, y: number, fluidPower: number }>();
    let lossCoefficient: number = this.calculateLossCoefficient(
      pumpSystemCurveData.pointOneFlowRate,
      pumpSystemCurveData.pointOneHead,
      pumpSystemCurveData.pointTwoFlowRate,
      pumpSystemCurveData.pointTwoHead,
      pumpSystemCurveData.systemLossExponent
    );
    let staticHead: number = this.calculateStaticHead(
      pumpSystemCurveData.pointOneFlowRate,
      pumpSystemCurveData.pointOneHead,
      pumpSystemCurveData.pointTwoFlowRate,
      pumpSystemCurveData.pointTwoHead,
      pumpSystemCurveData.systemLossExponent
    );

    for (var i = 0; i <= maxXValue; i += 10) {
      let headAndFluidPower: { head: number, fluidPower: number } = this.calculatePumpHeadAndFluidPower(staticHead, lossCoefficient, i, pumpSystemCurveData.systemLossExponent, pumpSystemCurveData.specificGravity, settings);
      if (headAndFluidPower.head >= 0) {
        data.push({ x: i, y: headAndFluidPower.head, fluidPower: headAndFluidPower.fluidPower });
      } else {
        data.push({ x: 0, y: 0, fluidPower: 0 });
      }
    }
    return data;
  }

  calculatePumpHeadAndFluidPower(staticHead: number, lossCoefficient: number, flow: number, systemLossExponent: number, specificGravity: number, settings): { head: number, fluidPower: number } {
    let head: number = staticHead + lossCoefficient * Math.pow(flow, systemLossExponent);
    let fluidPower = this.getPumpFluidPower(head, flow, specificGravity, settings);
    if (settings.powerMeasurement !== 'hp' && fluidPower !== 0) {
      fluidPower = this.convertUnitsService.value(fluidPower).from('hp').to(settings.powerMeasurement);
    }
    return { head: head, fluidPower: fluidPower };
  }

  calculateFanPressureAndFluidPower(staticPressure: number, lossCoefficient: number, flow: number, systemLossExponent: number, compressibilityFactor: number, settings): { pressure: number, fluidPower: number } {
    let pressure: number = staticPressure + lossCoefficient * Math.pow(flow, systemLossExponent);
    let fluidPower = this.getFanFluidPower(pressure, flow, compressibilityFactor, settings);
    if (settings.fanPowerMeasurement !== 'hp' && fluidPower !== 0) {
      fluidPower = this.convertUnitsService.value(fluidPower).from('hp').to(settings.fanPowerMeasurement);
    }
    return { pressure: pressure, fluidPower: fluidPower };
  }

  getFanFluidPower(pressure: number, flow: number, compressibilityFactor: number, settings: Settings): number {
    if (settings.fanPressureMeasurement !== 'inH2o') {
      pressure = this.convertUnitsService.value(pressure).from(settings.fanPressureMeasurement).to('inH2o');
    }
    if (settings.fanFlowRate !== 'ft3/min') {
      flow = this.convertUnitsService.value(flow).from(settings.fanFlowRate).to('ft3/min');
    }
    return (pressure * flow * compressibilityFactor) / 6362;
  }

  getPumpFluidPower(head: number, flow: number, specificGravity: number, settings: Settings): number {
    //from Daryl -> fluidPower = (head * flow * specificGravity) / 3960
    if (settings.distanceMeasurement !== 'ft') {
      head = this.convertUnitsService.value(head).from(settings.distanceMeasurement).to('ft');
    }
    if (settings.flowMeasurement !== 'gpm') {
      flow = this.convertUnitsService.value(flow).from(settings.flowMeasurement).to('gpm');
    }
    return (head * flow * specificGravity) / 3960;
  }
}
