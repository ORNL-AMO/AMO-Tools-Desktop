import { Injectable } from '@angular/core';
import * as regression from 'regression';
import * as _ from 'lodash';
import { FanSystemCurveData, PumpSystemCurveData, ByDataInputs, EquipmentInputs, ByEquationInputs, ModificationEquipment, ByEquationOutput, ByDataOutput, CurveCoordinatePairs } from '../../shared/models/system-and-equipment-curve';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { EquipmentCurveService } from './equipment-curve/equipment-curve.service';
import { copyObject } from '../../shared/helperFunctions';

@Injectable()
export class RegressionEquationsService {

  baselineEquipmentCurveByDataRegressionEquation: BehaviorSubject<string>;
  baselineEquipmentCurveByDataRSquared: BehaviorSubject<number>;

  modificationEquipmentRegressionEquation: BehaviorSubject<string>;

  baselineEquipmentRegressionEquation: BehaviorSubject<string>;

  systemCurveRegressionEquation: BehaviorSubject<string>;
  dataPairCoordinateIncrement: number = 1;
  constructor(private convertUnitsService: ConvertUnitsService, private equipmentCurveService: EquipmentCurveService) {
    this.baselineEquipmentCurveByDataRegressionEquation = new BehaviorSubject<string>(undefined);
    this.baselineEquipmentCurveByDataRSquared = new BehaviorSubject<number>(undefined);

    this.modificationEquipmentRegressionEquation = new BehaviorSubject<string>(undefined);

    this.baselineEquipmentRegressionEquation = new BehaviorSubject<string>(undefined);
    this.systemCurveRegressionEquation = new BehaviorSubject<string>(undefined);
  }

  getEquipmentCurveRegressionByData(
    byData: ByDataInputs,
    equipmentInputs: EquipmentInputs,
    modificationEquipment: ModificationEquipment,
    fluidPowerMultiplier: number,
    yValueLabel: string,
    maxFlowRate: number,
    settings: Settings
  ): CurveRegressionData {
    let baselineRegressionOutput: ByDataOutput = this.getBaselineEquipmentRegressionByData(byData, fluidPowerMultiplier, yValueLabel, maxFlowRate, settings);
    let modificationRegressionOutput: ByEquationOutput;
    let modifiedPairs: Array<CurveCoordinatePairs>;
    let modificationRatio: number;

    if (modificationEquipment) {
      let flowUnit = settings.flowMeasurement;
      let yValueUnit = settings.distanceMeasurement;
      let yImperialUnit = 'ft';
      let baselineEquationInputs: ByEquationInputs;

      if (yValueLabel === "Head") {
        baselineEquationInputs = this.equipmentCurveService.getPumpByEquationDefault(flowUnit, yValueUnit, yImperialUnit);
      } else {
        baselineEquationInputs = this.equipmentCurveService.getFanByEquationDefault(flowUnit, yValueUnit, yImperialUnit);
      }
      
      let baselineEquationCoefficients = copyObject(baselineRegressionOutput.baselinePolynomialCurve.equation);
      let flowCoefficientIndex: number = baselineEquationCoefficients.length - 2;
      let flowAndConstant: number[] = baselineEquationCoefficients.splice(flowCoefficientIndex, 2);
      baselineEquationInputs.flow = flowAndConstant[0];
      baselineEquationInputs.constant = flowAndConstant[1];
      baselineEquationInputs.equationOrder = byData.dataOrder;

      // * map reversed listing of coefficients
      // * EX. y = -8.482672009106605e-8x^3 + 0.000010825931568798886x^2 + -0.06993099587341044x + 357.02595478256984
      // *          index 0                      index 1                          flow                 constant    
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

      modificationRegressionOutput = this.getEquipmentRegressionByEquation(baselineEquationInputs, equipmentInputs, modificationEquipment, yValueLabel, maxFlowRate, fluidPowerMultiplier, settings);
      modifiedPairs = modificationRegressionOutput.modifiedDataPairs;
      modificationRatio = modificationRegressionOutput.ratio;
    }

    return {
      baselineDataPairs: baselineRegressionOutput.baselineDataPairs,
      modifiedDataPairs: modifiedPairs,
      modificationEquipment: modificationEquipment,
      modificationRatio: modificationRatio
    }
  }

  getModificationEquipmentByEquationInputs(
    baselineEquationInputs: ByEquationInputs,
    equipmentInputs: EquipmentInputs,
    modificationEquipment: ModificationEquipment,
    yValueLabel: string,
  ): ModificationByEquationInputData {

    let modifiedYValue: number = yValueLabel === "Head" ? modificationEquipment.head : modificationEquipment.pressure;
    let quadraticEquationA: number = baselineEquationInputs.constant;
    let quadraticEquationB: number = baselineEquationInputs.flow * modificationEquipment.flow;

    let quadraticEquationC = baselineEquationInputs.flowTwo * Math.pow(modificationEquipment.flow, 2) +
      (baselineEquationInputs.flowThree * Math.pow(modificationEquipment.flow, 3)) +
      (baselineEquationInputs.flowFour * Math.pow(modificationEquipment.flow, 4)) +
      (baselineEquationInputs.flowFive * Math.pow(modificationEquipment.flow, 5)) +
      (baselineEquationInputs.flowSix * Math.pow(modificationEquipment.flow, 6)) - modifiedYValue;
    let ratio = (-quadraticEquationB + Math.pow((Math.pow(quadraticEquationB, 2) - 4 * quadraticEquationA * quadraticEquationC), .5)) / (2 * quadraticEquationA)

    // still use value regardless of is speed or diameter
    let modificationSpeed: number = ratio * equipmentInputs.baselineMeasurement;

    let modificationByEquationInputs: ByEquationInputs = copyObject(baselineEquationInputs);
    modificationByEquationInputs.constant = baselineEquationInputs.constant * Math.pow(ratio, 2);
    modificationByEquationInputs.flow = baselineEquationInputs.flow * ratio;
    modificationByEquationInputs.equationOrder = baselineEquationInputs.equationOrder;

    return {
      modificationByEquationInputs,
      modificationSpeed,
      ratio
    };
  }

  getEquipmentRegressionByEquation(
    baselineEquationInputs: ByEquationInputs,
    equipmentInputs: EquipmentInputs,
    modificationEquipment: ModificationEquipment,
    yValueLabel: string,
    maxFlowRate: number,
    fluidPowerMultiplier?: number,
    settings?: Settings
  ): ByEquationOutput {
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
    for (let i = 0; i < baselineEquationInputs.equationOrder; i++) {
      baselineRegressionEquation = baselineRegressionEquation.replace('+ -', '- ');
    }
    
    let baselineDataPairs: Array<CurveCoordinatePairs> = this.calculateBaselineEquipmentByEquation(baselineEquationInputs, maxFlowRate, yValueLabel, settings, fluidPowerMultiplier).dataPairs;
    let modifiedData: { calculationData: Array<Array<number>>, dataPairs: Array<CurveCoordinatePairs> };
    let modificationByEquation: ModificationByEquationInputData;
    let modificationResults;
    let modificationRegressionEquation: string;
    let modificationRatio: number;
    let modifiedDataPairs: Array<CurveCoordinatePairs>

    if (modificationEquipment) {
      // * modification by equation inputs are constructed from BL
      modificationByEquation = this.getModificationEquipmentByEquationInputs(baselineEquationInputs, equipmentInputs, modificationEquipment, yValueLabel);
      modificationEquipment.speed = modificationByEquation.modificationSpeed;
      modificationRatio = modificationByEquation.ratio;
      modifiedData = this.calculateModifiedEquipmentByEquation(modificationByEquation.modificationByEquationInputs, fluidPowerMultiplier, maxFlowRate, yValueLabel, settings);
      if (modifiedData) {
        modifiedDataPairs = modifiedData.dataPairs;
      }
      // * Fits the input data to a polynomial curve with the equation anx^n ... + a1x + a0. It returns the coefficients in the form [an..., a1, a0].
      modificationResults = regression.polynomial(modifiedData.calculationData, { order: baselineEquationInputs.equationOrder, precision: 50 });
      this.setSigFigs(modificationResults);
      modificationRegressionEquation = this.formatRegressionEquation(modificationResults.string, baselineEquationInputs.equationOrder, yValueLabel);
    } 

    this.baselineEquipmentRegressionEquation.next(baselineRegressionEquation);
    this.modificationEquipmentRegressionEquation.next(modificationRegressionEquation);

    return {
      baselineDataPairs: baselineDataPairs,
      modifiedDataPairs: modifiedDataPairs,
      modificationEquipment: modificationEquipment,
      ratio: modificationRatio
    };
  }

  getEquipmentPowerRegressionByData(byData: ByDataInputs, modificationEquipment: ModificationEquipment, maxFlowRate: number, ratio: number): {
    baseline: Array<{ x: number, y: number }>,
    modification: Array<{ x: number, y: number }>
  } {
    let baselineRegressionOutput: ByDataOutput = this.calculateBaselinePowerByData(byData, maxFlowRate);
    let modificationDataPairs: Array<{ x: number, y: number }>;

    if (modificationEquipment) {
      let baselineEquationInputs: ByEquationInputs = this.equipmentCurveService.getResetByEquationInputs();

      let baselineEquationCoefficients = copyObject(baselineRegressionOutput.baselinePolynomialCurve.equation);
      let flowCoefficientIndex: number = baselineEquationCoefficients.length - 2;
      let flowAndConstant: number[] = baselineEquationCoefficients.splice(flowCoefficientIndex, 2);
      baselineEquationInputs.powerFlow = flowAndConstant[0];
      baselineEquationInputs.powerConstant = flowAndConstant[1];
      baselineEquationInputs.powerOrder = byData.powerDataOrder;

      // * map reversed listing of coefficients
      // * EX. y = -8.482672009106605e-8x^3 + 0.000010825931568798886x^2 + -0.06993099587341044x + 357.02595478256984
      // *          index 0                      index 1                          flow                 constant    
      if (baselineEquationCoefficients.length > 0) {
        if (byData.powerDataOrder === 6) {
          baselineEquationInputs.powerFlowSix = baselineEquationCoefficients[0];
          baselineEquationInputs.powerFlowFive = baselineEquationCoefficients[1];
          baselineEquationInputs.powerFlowFour = baselineEquationCoefficients[2];
          baselineEquationInputs.powerFlowThree = baselineEquationCoefficients[3];
          baselineEquationInputs.powerFlowTwo = baselineEquationCoefficients[4];
        } else if (byData.powerDataOrder === 5) {
          baselineEquationInputs.powerFlowFive = baselineEquationCoefficients[0];
          baselineEquationInputs.powerFlowFour = baselineEquationCoefficients[1];
          baselineEquationInputs.powerFlowThree = baselineEquationCoefficients[2];
          baselineEquationInputs.powerFlowTwo = baselineEquationCoefficients[3];
        } else if (byData.powerDataOrder === 4) {
          baselineEquationInputs.powerFlowFour = baselineEquationCoefficients[0];
          baselineEquationInputs.powerFlowThree = baselineEquationCoefficients[1];
          baselineEquationInputs.powerFlowTwo = baselineEquationCoefficients[2];
        } else if (byData.powerDataOrder === 3) {
          baselineEquationInputs.powerFlowThree = baselineEquationCoefficients[0];
          baselineEquationInputs.powerFlowTwo = baselineEquationCoefficients[1];
        } else if (byData.powerDataOrder === 2) {
          baselineEquationInputs.powerFlowTwo = baselineEquationCoefficients[0];
        }
      }

      let modificationByEquationInputs = this.getModificationPowerByEquationInputs(baselineEquationInputs, ratio);
      let modifiedData: { calculationData: Array<Array<number>>, dataPairs: Array<{ x: number, y: number }> } = this.calculateModifiedPowerByEquation(modificationByEquationInputs, maxFlowRate);
      modificationDataPairs = modifiedData.dataPairs;
    }

    return {
      baseline: baselineRegressionOutput.baselineDataPairs,
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


  getEquipmentPowerRegressionByEquation(baselineEquationInputs: ByEquationInputs, byEquationOutput: ByEquationOutput, equipmentInputs: EquipmentInputs, modificationEquipment: ModificationEquipment, yValueLabel: string, maxFlowRate: number): {
    baseline: Array<{ x: number, y: number }>,
    modification: Array<{ x: number, y: number }>
  } {
    let baselineDataPairs: Array<CurveCoordinatePairs> = this.calculatePowerByEquation(baselineEquationInputs, maxFlowRate).dataPairs;
    let modificationRegressionOutput = byEquationOutput; 
    let modificationByEquationInputs = this.getModificationPowerByEquationInputs(baselineEquationInputs, modificationRegressionOutput.ratio);
    let modifiedPowerData: { calculationData: Array<Array<number>>, dataPairs: Array<CurveCoordinatePairs> } = this.calculatePowerByEquation(modificationByEquationInputs, maxFlowRate);
    
    let modificationDataPairs = modifiedPowerData.dataPairs;
    return {
      baseline: baselineDataPairs,
      modification: modificationDataPairs
    }
  }

  getModificationPowerByEquationInputs(baselineEquationInputs: ByEquationInputs, ratio: number): ByEquationInputs {
    let modificationByEquationInputs: ByEquationInputs = copyObject(baselineEquationInputs);
    modificationByEquationInputs.powerConstant = baselineEquationInputs.powerConstant * Math.pow(ratio, 3);
    modificationByEquationInputs.powerFlow = baselineEquationInputs.powerFlow * Math.pow(ratio, 2);
    modificationByEquationInputs.powerFlowTwo = baselineEquationInputs.powerFlowTwo * ratio;
    modificationByEquationInputs.powerOrder = baselineEquationInputs.powerOrder;
    return modificationByEquationInputs;
  }

  calculateBaselinePowerByData(
    byData: ByDataInputs,
    maxFlowRate: number,
    ): ByDataOutput {
      let regressionInputs: Array<Array<number>> = new Array();
      byData.dataRows.forEach(row => {
        regressionInputs.push([row.flow, row.power]);
      });
  
      let baselinePolynomialCurve = regression.polynomial(regressionInputs, { order: byData.powerDataOrder, precision: 50 });
      this.setSigFigs(baselinePolynomialCurve);
      let baselineDataPairs: Array<{ x: number, y: number }> = new Array(); 
      for (let i = 0; i <= maxFlowRate; i += this.dataPairCoordinateIncrement) {
        let yVal = baselinePolynomialCurve.predict(i);
        if (yVal[1] > 0) {
          let xBaseline: number = i;
          let yBaseline: number = yVal[1];
          baselineDataPairs.push({
            x: xBaseline,
            y: yBaseline
          });
        }
      }

      let baselineByDataOutput: ByDataOutput = {
        baselinePolynomialCurve: baselinePolynomialCurve,
        baselineDataPairs: baselineDataPairs,
      }

      return baselineByDataOutput
    }

  calculatePowerByEquation(byEquationInputs: ByEquationInputs, maxFlowRate: number): { calculationData: Array<Array<number>>, dataPairs: Array<CurveCoordinatePairs> } {
    let calculationData: Array<Array<number>> = new Array();
    let dataPairs: Array<CurveCoordinatePairs> = new Array();
    for (let flow = 0; flow <= maxFlowRate; flow += this.dataPairCoordinateIncrement) {
      let power: number = this.calculateYPower(byEquationInputs, flow);
      if (power > 0) {
        if (flow <= maxFlowRate) {
          calculationData.push([flow, power]);
          dataPairs.push({ x: flow, y: power });
        } 
      }
    }
    return { calculationData: calculationData, dataPairs: dataPairs };
  }

    // * fluidPowerMultiplier is specificGravity (pump) or compressibilityFactor (Fan)
    getBaselineEquipmentRegressionByData(
      byData: ByDataInputs,
      fluidPowerMultiplier: number,
      yValueLabel: string,
      maxFlowRate: number,
      settings: Settings
    ): ByDataOutput {
  
      let baselineData: Array<Array<number>> = new Array();
      byData.dataRows.forEach(row => {
        baselineData.push([row.flow, row.yValue]);
      });
      // * Fits the input data to a polynomial curve with the equation anx^n ... + a1x + a0. It returns the coefficients in the form [an..., a1, a0].
      let baselinePolynomialCurve = regression.polynomial(baselineData, { order: byData.dataOrder, precision: 50 });
      this.setSigFigs(baselinePolynomialCurve);
      let baselineRegressionEquation: string = this.formatRegressionEquation(baselinePolynomialCurve.string, byData.dataOrder, yValueLabel);
      let baselineDataPairs: Array<CurveCoordinatePairs> = new Array();
  
      for (let flow = 0; flow <= maxFlowRate; flow += this.dataPairCoordinateIncrement) {
        let predicatedHeadOrPressure = baselinePolynomialCurve.predict(flow)[1];
        if (predicatedHeadOrPressure > 0) {
          let fluidPower: number;
          if (yValueLabel === 'Head') {
            fluidPower = this.getPumpFluidPower(predicatedHeadOrPressure, flow, fluidPowerMultiplier, settings);
          } else {
            fluidPower = this.getFanFluidPower(predicatedHeadOrPressure, flow, fluidPowerMultiplier, settings);
          }
          baselineDataPairs.push({
            x: flow,
            y: predicatedHeadOrPressure,
            fluidPower: fluidPower
          });
          baselineData.push([flow, predicatedHeadOrPressure]);
        }
      }
  
      this.baselineEquipmentCurveByDataRegressionEquation.next(baselineRegressionEquation);
      this.baselineEquipmentCurveByDataRSquared.next(baselinePolynomialCurve.r2);
  
      let baselineByDataOutput: ByDataOutput = {
        baselinePolynomialCurve: baselinePolynomialCurve,
        baselineDataPairs: baselineDataPairs,
      }
      return baselineByDataOutput;
  }


  calculateBaselineEquipmentByEquation(byEquationInputs: ByEquationInputs, maxFlowRate: number, yValueLabel: string, settings?: Settings, fluidPowerMultiplier?: number): { calculationData: Array<Array<number>>, dataPairs: Array<CurveCoordinatePairs> } {
    let calculationData: Array<Array<number>> = new Array();
    let dataPairs: Array<CurveCoordinatePairs> = new Array();
    for (let flow = 0; flow <= maxFlowRate; flow += this.dataPairCoordinateIncrement) {
      let predicatedHeadOrPressure: number = this.calculateY(byEquationInputs, flow);
      if (predicatedHeadOrPressure > 0) {
        let fluidPower: number;
        if (settings) {
          if (yValueLabel === 'Head') {
            fluidPower = this.getPumpFluidPower(predicatedHeadOrPressure, flow, fluidPowerMultiplier, settings);
          } else {
            fluidPower = this.getFanFluidPower(predicatedHeadOrPressure, flow, fluidPowerMultiplier, settings);
          }
        }
        if (flow <= maxFlowRate) {
          calculationData.push([flow, predicatedHeadOrPressure]);
          dataPairs.push({ x: flow, y: predicatedHeadOrPressure, fluidPower: fluidPower });
        } 
      }
    }
    return { calculationData: calculationData, dataPairs: dataPairs };
  }
  

  calculateModifiedEquipmentByEquation(byEquationInputs: ByEquationInputs, fluidPowerMultiplier: number, maxFlowRate: number, yValueLabel: string, settings: Settings): { calculationData: Array<Array<number>>, dataPairs: Array<CurveCoordinatePairs> } {
    let calculationData: Array<Array<number>> = new Array();
    let dataPairs: Array<CurveCoordinatePairs> = new Array();
    for (let flow = 0; flow <= maxFlowRate; flow += this.dataPairCoordinateIncrement) {
      let predicatedHeadOrPressure = this.calculateY(byEquationInputs, flow);
      if (predicatedHeadOrPressure > 0) {
        let fluidPower;
        if (settings) {
         if (yValueLabel === 'Head') {
          fluidPower = this.getPumpFluidPower(predicatedHeadOrPressure, flow, fluidPowerMultiplier, settings);
        } else {
          fluidPower = this.getFanFluidPower(predicatedHeadOrPressure, flow, fluidPowerMultiplier, settings);
        }
        }
        if (flow <= maxFlowRate) {
          calculationData.push([flow, predicatedHeadOrPressure]);
          dataPairs.push({ x: flow, y: predicatedHeadOrPressure, fluidPower: fluidPower });
        }
      }
    }
    return { calculationData: calculationData, dataPairs: dataPairs };
  }

  calculateModifiedPowerByEquation(byEquationInputs: ByEquationInputs, maxFlowRate: number): { calculationData: Array<Array<number>>, dataPairs: Array<CurveCoordinatePairs> } {
    let calculationData: Array<Array<number>> = new Array();
    let dataPairs: Array<CurveCoordinatePairs> = new Array();
    for (let flow = 0; flow <= maxFlowRate; flow += this.dataPairCoordinateIncrement) {
      let power = this.calculateYPower(byEquationInputs, flow);
      if (power > 0) {
        if (flow <= maxFlowRate) {
          calculationData.push([flow, power]);
          dataPairs.push({ x: flow, y: power });
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

  setPumpSystemCurveRegressionEquation(data: PumpSystemCurveData) {
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
    let systemCurveRegressionEquation = 'Head = ' + staticHead.toPrecision(3) + ' + (' + lossCoefficient.toPrecision(3) + ' \xD7 flow' + '<sup>' + data.systemLossExponent + '</sup>)';
    this.systemCurveRegressionEquation.next(systemCurveRegressionEquation);

  }

  setFanSystemCurveRegressionEquation(data: FanSystemCurveData) {
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
    let systemCurveRegressionEquation = 'Pressure = ' + staticPressure.toPrecision(3) + ' + (' + lossCoefficient.toPrecision(3) + ' \xD7 flow' + '<sup>' + data.systemLossExponent + '</sup>)';
    this.systemCurveRegressionEquation.next(systemCurveRegressionEquation);
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
  baselineDataPairs: Array<CurveCoordinatePairs>,
  modifiedDataPairs: Array<CurveCoordinatePairs>,
  modificationEquipment: ModificationEquipment,
  modificationRatio?: number
}

export interface ModificationByEquationInputData { 
  modificationByEquationInputs: ByEquationInputs, 
  modificationSpeed: number, 
  ratio: number 
}