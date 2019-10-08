import { Injectable } from '@angular/core';
import * as regression from 'regression';
import { ByDataInputs, ByEquationInputs, EquipmentInputs } from '../../equipment-curve/equipment-curve.service';
import * as _ from 'lodash';
@Injectable()
export class RegressionEquationsService {

  constructor() { }

  getEquipmentCurveRegressionByData(byData: ByDataInputs, equipmentInputs: EquipmentInputs, secondValueLabel: string): { baselineRegressionEquation: string, baselineRSquared: number, modificationRegressionEquation: string, modificationRSquared: number } {

    let dataPairs: Array<Array<number>> = new Array();
    byData.dataRows.forEach(row => {
      dataPairs.push([row.flow, row.secondValue]);
    })

    let baselineResults = regression.polynomial(dataPairs, { order: byData.dataOrder, precision: 10 });
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

    return { baselineRegressionEquation: baselineRegressionEquation, baselineRSquared: baselineResults.r2, modificationRSquared: modificationResults.r2, modificationRegressionEquation: modificationRegressionEquation }

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

  getEquipmentCurveRegressionByEquation(byEquationInputs: ByEquationInputs, secondValueLabel: string): string {
    let tmpStr = byEquationInputs.flowTwo + '(flow)&#x00B2; + ' + byEquationInputs.flow + ('(flow) +') + byEquationInputs.constant;
    if (byEquationInputs.equationOrder > 2 && byEquationInputs.flowThree) {
      tmpStr = byEquationInputs.flowThree + '(flow)&#x00B3; + ' + tmpStr;
    }
    if (byEquationInputs.equationOrder > 3 && byEquationInputs.flowFour) {
      tmpStr = byEquationInputs.flowFour + '(flow)&#x2074; + ' + tmpStr;
    }
    if (byEquationInputs.equationOrder > 4 && byEquationInputs.flowFive) {
      tmpStr = byEquationInputs.flowFive + '(flow)&#x2075; + ' + tmpStr;
    }
    if (byEquationInputs.equationOrder > 5 && byEquationInputs.flowSix) {
      tmpStr = byEquationInputs.flowSix + '(flow)&#x2076; + ' + tmpStr;
    }
    let regEquation: string = secondValueLabel + ' = ' + tmpStr;
    for (let i = 0; i < byEquationInputs.equationOrder; i++) {
      regEquation = regEquation.replace('+ -', '- ');
    }
    return regEquation;
  }



  // getData(pumpCurve: PumpCurve, selectedFormView: string): Array<{ x: number, y: number }> {
  //   let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
  //   let maxDataFlow: number;
  //   if (selectedFormView == 'Data') {
  //     let tmpDataFlow = _.maxBy(pumpCurve.dataRows, (val) => { return val.flow });
  //     maxDataFlow = tmpDataFlow.flow;
  //     let tmpArr = new Array<any>();
  //     pumpCurve.dataRows.forEach(val => {
  //       tmpArr.push([val.flow, val.head]);
  //     });
  //     let results = regression.polynomial(tmpArr, { order: pumpCurve.dataOrder, precision: 10 });
  //     regressionEquation.next(results.string);
  //     this.baselineR2.next(results.r2);
  //     for (let i = 0; i <= maxDataFlow; i = i + 10) {
  //       let yVal = results.predict(i);
  //       if (yVal[1] > 0) {
  //         data.push({
  //           x: i,
  //           y: yVal[1]
  //         });
  //       }
  //     }
  //   } else if (selectedFormView == 'Equation') {
  //     maxDataFlow = pumpCurve.maxFlow;
  //     // regressionEquation.next(null);
  //     // this.baselineR2.next(null);
  //     for (let i = 0; i <= maxDataFlow + 10; i = i + 10) {
  //       let yVal = this.calculateY(pumpCurve, i);
  //       if (yVal > 0) {
  //         data.push({
  //           x: i,
  //           y: yVal
  //         });
  //       }
  //     }
  //   }
  //   return data;
  // }

  // getModifiedData(pumpCurve: PumpCurve, selectedFormView: string, baseline: number, modified: number): Array<{ x: number, y: number }> {
  //   let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
  //   let ratio = modified / baseline;
  //   let maxDataFlow: number;
  //   if (selectedFormView == 'Data') {
  //     let tmpDataFlow = _.maxBy(pumpCurve.dataRows, (val) => { return val.flow });
  //     maxDataFlow = tmpDataFlow.flow;
  //     let tmpArr = new Array<any>();
  //     pumpCurve.dataRows.forEach(val => {
  //       tmpArr.push([val.flow, val.head]);
  //     });
  //     let results = regression.polynomial(tmpArr, { order: pumpCurve.dataOrder, precision: 10 });
  //     this.modificationRegEquation.next(results.string);
  //     this.modificationR2.next(results.r2);
  //     for (let i = 0; i <= maxDataFlow; i = i + 10) {
  //       let yVal = results.predict(i);
  //       if (yVal[1] > 0) {
  //         data.push({
  //           x: i * ratio,
  //           y: yVal[1] * Math.pow(ratio, 2)
  //         })
  //       }
  //     }
  //   } else if (selectedFormView == 'Equation') {
  //     maxDataFlow = pumpCurve.maxFlow;
  //     this.modificationRegEquation.next(null);
  //     this.modificationR2.next(null);
  //     data.push({
  //       x: 0 * ratio,
  //       y: this.calculateY(pumpCurve, 0) * Math.pow(ratio, 2)
  //     });
  //     for (let i = 10; i <= maxDataFlow + 10; i = i + 10) {
  //       let yVal = this.calculateY(pumpCurve, i);
  //       if (yVal > 0) {
  //         data.push({
  //           x: i * ratio,
  //           y: yVal * Math.pow(ratio, 2)
  //         })
  //       }
  //     }
  //   }
  //   let data2 = new Array<any>();
  //   for (let i = 0; i < data.length; i++) {
  //     data2.push([data[i].x, data[i].y]);
  //   }
  //   let data3 = new Array<any>();
  //   let results = regression.polynomial(data2, { order: pumpCurve.dataOrder, precision: 10 });
  //   this.modificationRegEquation.next(results.string);
  //   this.modificationR2.next(results.r2);
  //   for (let i = 0; i <= maxDataFlow * ratio; i = i + 10) {
  //     let yVal = results.predict(i)
  //     if (yVal[1] > 0) {
  //       data3.push({
  //         x: i,
  //         y: yVal[1]
  //       });
  //     }
  //   }
  //   return data3;
  // }
}
