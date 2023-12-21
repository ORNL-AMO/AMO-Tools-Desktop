import { Injectable } from '@angular/core';
import * as regression from 'regression';
import * as _ from 'lodash';
import { FanSystemCurveData, PumpSystemCurveData, ByDataInputs, EquipmentInputs, ByEquationInputs, ModificationEquipment, ByEquationOutput, ByDataOutput } from '../../shared/models/system-and-equipment-curve';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { EquipmentCurveService } from './equipment-curve/equipment-curve.service';
import { HelperFunctionsService } from '../../shared/helper-services/helper-functions.service';

@Injectable()
export class RegressionEquationsService {

  baselineEquipmentCurveByDataRegressionEquation: BehaviorSubject<string>;
  baselineEquipmentCurveByDataRSquared: BehaviorSubject<number>;

  modificationEquipmentCurveByDataRegressionEquation: BehaviorSubject<string>;
  modificationEquipmentCurveRSquared: BehaviorSubject<number>;

  baselineEquipmentCurveByEquationRegressionEquation: BehaviorSubject<string>;
  modificationEquipmentCurveByEquationRegressionEquation: BehaviorSubject<string>;

  systemCurveRegressionEquation: BehaviorSubject<string>;
  rawRegressionEquations: BehaviorSubject<RawEquations>;
  // * Default increment to 2 (was always 10 before work done)
  dataPairCoordinateIncrement: number = 1;
  constructor(private convertUnitsService: ConvertUnitsService, private equipmentCurveService: EquipmentCurveService, private helperService: HelperFunctionsService) {
    this.baselineEquipmentCurveByDataRegressionEquation = new BehaviorSubject<string>(undefined);
    this.baselineEquipmentCurveByDataRSquared = new BehaviorSubject<number>(undefined);

    this.modificationEquipmentCurveByDataRegressionEquation = new BehaviorSubject<string>(undefined);
    this.modificationEquipmentCurveRSquared = new BehaviorSubject<number>(undefined);

    this.baselineEquipmentCurveByEquationRegressionEquation = new BehaviorSubject<string>(undefined);
    this.modificationEquipmentCurveByEquationRegressionEquation = new BehaviorSubject<string>(undefined);

    this.systemCurveRegressionEquation = new BehaviorSubject<string>(undefined);
    this.rawRegressionEquations = new BehaviorSubject<RawEquations>({ fanBaselineEquipment: '', pumpBaselineEquipment: '', fanModificationEquipment: '', pumpModificationEquipment: '', fanSystem: '', pumpSystem: '' });
  }

  // * 4e
  // todo this should be split and at least partially moved to sys and equip service
  getEquipmentCurveRegressionByData(
    byData: ByDataInputs,
    equipmentInputs: EquipmentInputs,
    modificationEquipment: ModificationEquipment,
    yValueLabel: string,
    maxFlowRate: number,
    equipmentType: string,
    settings: Settings
  ): CurveRegressionData {

    let baselineRegressionOutput: ByDataOutput = this.getBaselineByDataRegression(byData, yValueLabel, maxFlowRate, equipmentType);
    let modificationRegressionOutput: ByEquationOutput;

    if (modificationEquipment) {
      let flowUnit = settings.flowMeasurement;
      let yValueUnit = settings.distanceMeasurement;
      let yImperialUnit = 'ft';
      let baselineEquationInputs: ByEquationInputs = this.equipmentCurveService.getPumpByEquationDefault(flowUnit, yValueUnit, yImperialUnit);

      let baselineEquationCoefficients = this.helperService.copyObject(baselineRegressionOutput.baselinePolynomialCurve.equation);
      let flowCoefficientIndex: number = baselineEquationCoefficients.length - 2;
      let flowAndConstant: number[] = baselineEquationCoefficients.splice(flowCoefficientIndex, 2);
      baselineEquationInputs.flow = flowAndConstant[0];
      baselineEquationInputs.constant = flowAndConstant[1];
      baselineEquationInputs.equationOrder = byData.dataOrder;

      // * map reversed listing of coefficients
      // *          index 0                      index 1                          flow                 constant    
      // * EX. y = -8.482672009106605e-8x^3 + 0.000010825931568798886x^2 + -0.06993099587341044x + 357.02595478256984
      // * data order = 3   [0, 0]
      if (baselineEquationCoefficients.length > 0) {
        if (byData.dataOrder === 6) {
          baselineEquationInputs.flowSix = baselineEquationCoefficients[0];
          baselineEquationInputs.flowFive = baselineEquationCoefficients[1];
          baselineEquationInputs.flowFour = baselineEquationCoefficients[2];
          baselineEquationInputs.flowThree = baselineEquationCoefficients[3];
          baselineEquationInputs.flowTwo = baselineEquationCoefficients[4];
        } else if (byData.dataOrder === 5) {
          baselineEquationInputs.flowFive = baselineEquationCoefficients[0];
          baselineEquationInputs.flowFour = baselineEquationCoefficients[1];
          baselineEquationInputs.flowThree = baselineEquationCoefficients[2];
          baselineEquationInputs.flowTwo = baselineEquationCoefficients[3];
        } else if (byData.dataOrder === 4) {
          baselineEquationInputs.flowFour = baselineEquationCoefficients[0];
          baselineEquationInputs.flowThree = baselineEquationCoefficients[1];
          baselineEquationInputs.flowTwo = baselineEquationCoefficients[2];
        } else if (byData.dataOrder === 3) {
          baselineEquationInputs.flowThree = baselineEquationCoefficients[0];
          baselineEquationInputs.flowTwo = baselineEquationCoefficients[1];
        } else if (byData.dataOrder === 2) {
          baselineEquationInputs.flowTwo = baselineEquationCoefficients[0];
        }
      }

      modificationRegressionOutput = this.getEquipmentCurveRegressionByEquation(baselineEquationInputs, equipmentInputs, modificationEquipment, yValueLabel, maxFlowRate);
    }
    return {
      baselineRegressionEquation: baselineRegressionOutput.baselineRegressionEquation,
      baselineRSquared: baselineRegressionOutput.baselineRSquared,
      modificationRegressionEquation: modificationRegressionOutput.modificationRegressionEquation,
      baselineDataPairs: baselineRegressionOutput.baselineDataPairs,
      modifiedDataPairs: modificationRegressionOutput.modifiedDataPairs,
      modificationEquipment: modificationEquipment,
    }
  }

  getBaselineByDataRegression(
    byData: ByDataInputs,
    yValueLabel: string,
    maxFlowRate: number,
    equipmentType: string,
  ): ByDataOutput {

    let baselineData: Array<Array<number>> = new Array();
    byData.dataRows.forEach(row => {
      baselineData.push([row.flow, row.yValue]);
    });
    // * Fits the input data to a polynomial curve with the equation anx^n ... + a1x + a0. It returns the coefficients in the form [an..., a1, a0].
    let baselinePolynomialCurve = regression.polynomial(baselineData, { order: byData.dataOrder, precision: 50 });
    // todo set only before display
    // this.setSigFigs(baselinePolynomialCurve);
    let baselineRegressionEquation: string = baselinePolynomialCurve.string;

    // * Set raw equations to be used in intersection calcs
    this.setRawEquation(`${equipmentType}BaselineEquipment`, baselinePolynomialCurve.string);
    baselineRegressionEquation = this.formatRegressionEquation(baselinePolynomialCurve.string, byData.dataOrder, yValueLabel);
    let baselineDataPairs: Array<{ x: number, y: number }> = new Array();

    for (let flow = 0; flow <= maxFlowRate; flow += this.dataPairCoordinateIncrement) {
      let predictedHead = baselinePolynomialCurve.predict(flow)[1];
      if (predictedHead > 0) {
        let xBaseline: number = flow;
        let yBaseline: number = predictedHead;
        baselineDataPairs.push({
          x: xBaseline,
          y: yBaseline
        });
        baselineData.push([xBaseline, yBaseline]);
      }
    }

    let baselineByDataOutput: ByDataOutput = {
      baselinePolynomialCurve: baselinePolynomialCurve,
      baselineRegressionEquation: baselineRegressionEquation,
      baselineDataPairs: baselineDataPairs,
      baselineRSquared: baselinePolynomialCurve.r2,
    }

    return baselineByDataOutput
  }

  getModificationByEquationInputs(
    baselineEquationInputs: ByEquationInputs,
    equipmentInputs: EquipmentInputs,
    modificationEquipment: ModificationEquipment,
    yValueLabel: string,
  ): { modificationByEquationInputs: ByEquationInputs, modificationSpeed: number } {

    let modifiedYValue: number = yValueLabel === "Head" ? modificationEquipment.head : modificationEquipment.pressure;
    let quadraticEquationA: number = baselineEquationInputs.constant;
    let quadraticEquationB: number = baselineEquationInputs.flow * modificationEquipment.flow;

    let quadraticEquationC = baselineEquationInputs.flowTwo * Math.pow(modificationEquipment.flow, 2) +
      (baselineEquationInputs.flowThree * Math.pow(modificationEquipment.flow, 3)) +
      (baselineEquationInputs.flowFour * Math.pow(modificationEquipment.flow, 4)) +
      (baselineEquationInputs.flowFive * Math.pow(modificationEquipment.flow, 5)) +
      (baselineEquationInputs.flowSix * Math.pow(modificationEquipment.flow, 6)) - modifiedYValue;
    let ratio = (-quadraticEquationB + Math.pow((Math.pow(quadraticEquationB, 2) - 4 * quadraticEquationA * quadraticEquationC), .5)) / (2 * quadraticEquationA)

    // tuse value regardless of is speed or diameter
    let modificationSpeed: number = ratio * equipmentInputs.baselineMeasurement;

    let modificationByEquationInputs: ByEquationInputs = this.helperService.copyObject(baselineEquationInputs);
    modificationByEquationInputs.constant = baselineEquationInputs.constant * Math.pow(ratio, 2);
    modificationByEquationInputs.flow = baselineEquationInputs.flow * ratio;
    modificationByEquationInputs.equationOrder = baselineEquationInputs.equationOrder;

    return {
      modificationByEquationInputs,
      modificationSpeed
    };
  }

  getEquipmentCurveRegressionByEquation(
    baselineEquationInputs: ByEquationInputs,
    equipmentInputs: EquipmentInputs,
    modificationEquipment: ModificationEquipment,
    yValueLabel: string,
    maxFlowRate: number
  ): ByEquationOutput {
    console.log('baseline byEquation', baselineEquationInputs);
    let baselineRegressionEquation = baselineEquationInputs.flowTwo + '(flow)&#x00B2; + ' + baselineEquationInputs.flow + ('(flow) +') + baselineEquationInputs.constant;
    let rawBaselineEquation = baselineEquationInputs.flowTwo + 'x^2 + ' + baselineEquationInputs.flow + ('x +') + baselineEquationInputs.constant;
    if (baselineEquationInputs.equationOrder > 2) {
      baselineRegressionEquation = baselineEquationInputs.flowThree + '(flow)&#x00B3; + ' + baselineRegressionEquation;
      rawBaselineEquation = baselineEquationInputs.flowThree + 'x^3 + ' + rawBaselineEquation;
    }
    if (baselineEquationInputs.equationOrder > 3) {
      baselineRegressionEquation = baselineEquationInputs.flowFour + '(flow)&#x2074; + ' + baselineRegressionEquation;
      rawBaselineEquation = baselineEquationInputs.flowFour + 'x^4 + ' + rawBaselineEquation;
    }
    if (baselineEquationInputs.equationOrder > 4) {
      baselineRegressionEquation = baselineEquationInputs.flowFive + '(flow)&#x2075; + ' + baselineRegressionEquation;
      rawBaselineEquation = baselineEquationInputs.flowFive + 'x^5 + ' + rawBaselineEquation;
    }
    if (baselineEquationInputs.equationOrder > 5) {
      baselineRegressionEquation = baselineEquationInputs.flowSix + '(flow)&#x2076; + ' + baselineRegressionEquation;
      rawBaselineEquation = baselineEquationInputs.flowSix + 'x^6 + ' + rawBaselineEquation;
    }
    baselineRegressionEquation = yValueLabel + ' = ' + baselineRegressionEquation;
    rawBaselineEquation = 'y = ' + rawBaselineEquation;
    let equipmentType = yValueLabel == 'Head' ? 'pump' : 'fan';
    this.setRawEquation(`${equipmentType}BaselineEquipment`, rawBaselineEquation);

    for (let i = 0; i < baselineEquationInputs.equationOrder; i++) {
      baselineRegressionEquation = baselineRegressionEquation.replace('+ -', '- ');
    }
    let baselineDataPairs: Array<{ x: number, y: number }> = this.calculateByEquationData(baselineEquationInputs, 1, maxFlowRate).dataPairs;
    
    let modifiedData: { calculationData: Array<Array<number>>, dataPairs: Array<{ x: number, y: number }> }
    let modificationResults;
    let modificationRegressionEquation: string;

    // todo test for breaking on no mod
    if (modificationEquipment) {
      let { modificationByEquationInputs, modificationSpeed } = this.getModificationByEquationInputs(baselineEquationInputs, equipmentInputs, modificationEquipment, yValueLabel);
      modificationEquipment.speed = modificationSpeed;
      // * Use modification inputs constructed from BL byData
      console.log('modification byEquation', modificationByEquationInputs);
      modifiedData = this.calculateByDataModifiedCurve(modificationByEquationInputs, maxFlowRate);
      modificationResults = regression.polynomial(modifiedData.calculationData, { order: baselineEquationInputs.equationOrder, precision: 50 });
      // todo sigfigs
      this.setSigFigs(modificationResults);
      this.setRawEquation(`${equipmentType}ModificationEquipment`, modificationResults.string); 
      modificationRegressionEquation = this.formatRegressionEquation(modificationResults.string, baselineEquationInputs.equationOrder, yValueLabel);
    } 

    return {
      baselineRegressionEquation: baselineRegressionEquation,
      modificationRegressionEquation: modificationRegressionEquation,
      baselineDataPairs: baselineDataPairs,
      modifiedDataPairs: modifiedData.dataPairs,
      modificationEquipment: modificationEquipment
    };
  }

  // * 3e
  getEquipmentPowerRegressionByData(byData: ByDataInputs, modificationEquipment: ModificationEquipment, equipmentInputs: EquipmentInputs, maxFlowRate: number): {
    baseline: Array<{ x: number, y: number }>,
    modification: Array<{ x: number, y: number }>
  } {
    let regressionInputs: Array<Array<number>> = new Array();
    byData.dataRows.forEach(row => {
      regressionInputs.push([row.flow, row.power]);
    });

    let baselineResults = regression.polynomial(regressionInputs, { order: byData.powerDataOrder, precision: 50 });
    this.setSigFigs(baselineResults);
    let ratio: number;
    let modificationDataPairs: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    let modificationData: Array<Array<number>> = new Array();
    if (modificationEquipment) {
      ratio = modificationEquipment.speed / equipmentInputs.baselineMeasurement;
    }

    let powerExponentVal = 3;
    let baselineDataPairs: Array<{ x: number, y: number }> = new Array();
    for (let i = 0; i <= maxFlowRate; i += this.dataPairCoordinateIncrement) {
      let yVal = baselineResults.predict(i);
      if (yVal[1] > 0) {
        let xBaseline: number = i;
        let yBaseline: number = yVal[1];
        baselineDataPairs.push({
          x: xBaseline,
          y: yBaseline
        });
        if (modificationEquipment) {
          let yModified: number = yVal[1] * Math.pow(ratio, powerExponentVal);
          let xModified: number = i * ratio;
          if (xModified <= maxFlowRate) {
            modificationDataPairs.push({
              x: xModified,
              y: yModified
            });
            modificationData.push([xModified, yModified]);
          }
        }
      }
    }
    let modificationResults = regression.polynomial(modificationData, { order: byData.dataOrder, precision: 50 });
    this.setSigFigs(modificationResults);
    return {
      baseline: baselineDataPairs,
      modification: modificationDataPairs
    }
  }

  setSigFigs(data: { equation: Array<number>, string: string }) {
    data.equation.forEach(val => {
      if (val >= 1000 || val <= .0001) {
        data.string = data.string.replace(val.toString(), Number(val.toPrecision(3)).toExponential());
      } else {
        data.string = data.string.replace(val.toString(), val.toPrecision(3));
      }
    });
  }


  formatRegressionEquation(regressionEquation: string, order: number, secondValueLabel: string): string {
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


  getEquipmentPowerRegressionByEquation(byEquationInputs: ByEquationInputs, equipmentInputs: EquipmentInputs, modificationEquipment: ModificationEquipment, maxFlowRate: number): {
    baseline: Array<{ x: number, y: number }>,
    modification: Array<{ x: number, y: number }>
  } {
    let baselineDataPairs: Array<{ x: number, y: number }> = this.calculateByEquationData(byEquationInputs, 1, maxFlowRate, true).dataPairs;
    let ratio: number;
    if (modificationEquipment) {
      ratio = modificationEquipment.speed / equipmentInputs.baselineMeasurement;
    }
    let modifiedPowerData: { calculationData: Array<Array<number>>, dataPairs: Array<{ x: number, y: number }> } = this.calculateByEquationData(byEquationInputs, ratio, maxFlowRate, true);
    let modificationDataPairs: Array<{ x: number, y: number }> = modifiedPowerData.dataPairs;
    let modificationResults = regression.polynomial(modifiedPowerData.calculationData, { order: byEquationInputs.equationOrder, precision: 50 });
    this.setSigFigs(modificationResults);
    return {
      baseline: baselineDataPairs,
      modification: modificationDataPairs
    }
  }

  calculateByEquationData(byEquationInputs: ByEquationInputs, ratio: number, maxFlowRate: number, calculatePower = false): { calculationData: Array<Array<number>>, dataPairs: Array<{ x: number, y: number }> } {
    let calculationData: Array<Array<number>> = new Array();
    let dataPairs: Array<{ x: number, y: number }> = new Array();
    // todo Step 6
    for (let i = 0; i <= maxFlowRate; i += this.dataPairCoordinateIncrement) {
      let yVal;
      if (calculatePower) {
        yVal = this.calculateYPower(byEquationInputs, i);
      } else {
        yVal = this.calculateY(byEquationInputs, i);
      }
      if (yVal > 0) {
        let x: number = i * ratio;
        let y: number = yVal * Math.pow(ratio, 2);
        if (x <= maxFlowRate) {
          calculationData.push([x, y]);
          dataPairs.push({ x: x, y: y });
        }
      }
    }
    return { calculationData: calculationData, dataPairs: dataPairs };
  }

  calculateByDataModifiedCurve(byEquationInputs: ByEquationInputs, maxFlowRate: number, calculatePower = false): { calculationData: Array<Array<number>>, dataPairs: Array<{ x: number, y: number }> } {
    let calculationData: Array<Array<number>> = new Array();
    let dataPairs: Array<{ x: number, y: number }> = new Array();
    for (let i = 0; i <= maxFlowRate; i += this.dataPairCoordinateIncrement) {
      let yVal;
      if (calculatePower) {
        yVal = this.calculateYPower(byEquationInputs, i);
      } else {
        yVal = this.calculateY(byEquationInputs, i);
      }
      if (yVal > 0) {
        let x: number = i;
        let y: number = yVal;
        if (x <= maxFlowRate) {
          calculationData.push([x, y]);
          dataPairs.push({ x: x, y: y });
        }
      }
    }
    return { calculationData: calculationData, dataPairs: dataPairs };
  }


  calculateY(data: ByEquationInputs, flow: number): number {
    let result = data.constant
      + (data.flow * flow)
      + (data.flowTwo * Math.pow(flow, 2))
      + (data.flowThree * Math.pow(flow, 3))
      + (data.flowFour * Math.pow(flow, 4))
      + (data.flowFive * Math.pow(flow, 5))
      + (data.flowSix * Math.pow(flow, 6));
    return result;
  }

  calculateYPower(data: ByEquationInputs, flow: number): number {
    let power = data.powerConstant + (data.powerFlow * flow) + (data.powerFlowTwo * Math.pow(flow, 2)) + (data.powerFlowThree * Math.pow(flow, 3)) + (data.powerFlowFour * Math.pow(flow, 4)) + (data.powerFlowFive * Math.pow(flow, 5)) + (data.powerFlowSix * Math.pow(flow, 6));
    return power;
  }

  //  * 3s
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

    let rawSystemEquation = `y = ${staticHead.toPrecision(3)} + (${lossCoefficient.toPrecision(3)}x^${data.systemLossExponent})`;
    this.setRawEquation('pumpSystem', rawSystemEquation);
    return 'Head = ' + staticHead.toPrecision(3) + ' + (' + lossCoefficient.toPrecision(3) + ' \xD7 flow' + '<sup>' + data.systemLossExponent + '</sup>)';
  }

  // Set object used for calculating intersections
  setRawEquation(curveName: string, equation: string) {
    let rawRegressionsEquations: RawEquations = this.rawRegressionEquations.getValue();
    rawRegressionsEquations[curveName] = equation;
    this.rawRegressionEquations.next(rawRegressionsEquations);
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
    let rawSystemEquation = `y = ${staticPressure.toPrecision(3)} + (${lossCoefficient.toPrecision(3)}x^${data.systemLossExponent})`;
    this.setRawEquation('fanSystem', rawSystemEquation);
    return 'Pressure = ' + staticPressure.toPrecision(3) + ' + (' + lossCoefficient.toPrecision(3) + ' \xD7 flow' + '<sup>' + data.systemLossExponent + '</sup>)';
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

  calculateFanSystemCurveData(fanSystemCurveData: FanSystemCurveData, maxFlowRate: number, settings: Settings): Array<{ x: number, y: number, fluidPower: number }> {
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
    for (var i = 0; i <= maxFlowRate; i += this.dataPairCoordinateIncrement) {
      let pressureAndFluidPower: { pressure: number, fluidPower: number } = this.calculateFanPressureAndFluidPower(staticPressure, lossCoefficient, i, fanSystemCurveData.systemLossExponent, fanSystemCurveData.compressibilityFactor, settings);
      if (pressureAndFluidPower.pressure >= 0) {
        data.push({ x: i, y: pressureAndFluidPower.pressure, fluidPower: pressureAndFluidPower.fluidPower })
      } else {
        data.push({ x: i, y: 0, fluidPower: 0 });
      }
    }
    return data;
  }

  // * 4s
  calculatePumpSystemCurveData(pumpSystemCurveData: PumpSystemCurveData, maxFlowRate: number, settings: Settings): Array<{ x: number, y: number, fluidPower: number }> {
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
    for (var i = 0; i <= maxFlowRate; i += this.dataPairCoordinateIncrement) {
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


export interface RawEquations {
  fanBaselineEquipment: string,
  pumpBaselineEquipment: string,
  fanModificationEquipment: string,
  pumpModificationEquipment: string,
  fanSystem: string,
  pumpSystem: string
}

export interface CurveRegressionData {
  baselineRegressionEquation: string,
  baselineRSquared: number,
  modificationRegressionEquation: string,
  baselineDataPairs: Array<{ x: number, y: number }>,
  modifiedDataPairs: Array<{ x: number, y: number }>,
  modificationEquipment: ModificationEquipment
}