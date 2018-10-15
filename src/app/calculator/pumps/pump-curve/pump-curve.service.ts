import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PumpCurveForm, PumpCurveDataRow } from '../../../shared/models/calculators';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import * as regression from 'regression';
import * as _ from 'lodash';

@Injectable()
export class PumpCurveService {

  pumpCurveData: PumpCurveForm;
  pumpPointOne: { form: FormGroup, fluidPower: number };
  pumpPointTwo: { form: FormGroup, fluidPower: number };
  pumpCurveConstants: { form: FormGroup };

  fanCurveData: PumpCurveForm;
  fanPointOne: { form: FormGroup, fluidPower: number };
  fanPointTwo: { form: FormGroup, fluidPower: number };
  fanCurveConstants: { form: FormGroup };


  calcMethod: BehaviorSubject<string>;
  regEquation: BehaviorSubject<string>;
  rSquared: BehaviorSubject<string>;
  constructor(private convertUnitsService: ConvertUnitsService) {
    this.calcMethod = new BehaviorSubject<string>('Equation');
    this.regEquation = new BehaviorSubject<string>(null);
  }

  initForm(): PumpCurveForm {
    return {
      dataRows: new Array<PumpCurveDataRow>(
        { flow: 0, head: 355 },
        { flow: 100, head: 351 },
        // { flow: 200, head: 343.6188 },
        // { flow: 300, head: 335.9542 },
        // { flow: 400, head: 324.9089 },
        // { flow: 480, head: 314.7216 },
        // { flow: 560, head: 304.5332 },
        { flow: 630, head: 294 },
        // { flow: 690, head: 284.1775 },
        // { flow: 800, head: 264.6842 },
        // { flow: 900, head: 241.8114 },
        // { flow: 970, head: 222.3425 },
        { flow: 1020, head: 202 }
      ),
      maxFlow: 1020,
      dataOrder: 3,
      baselineMeasurement: 1800,
      modifiedMeasurement: 1800,
      exploreLine: 0,
      exploreFlow: 0,
      exploreHead: 0,
      explorePumpEfficiency: 0,
      headOrder: 3,
      headConstant: 356.96,
      headFlow: -0.0686,
      headFlow2: 0.000005,
      headFlow3: -0.00000008,
      headFlow4: 0,
      headFlow5: 0,
      headFlow6: 0,
      pumpEfficiencyOrder: 3,
      pumpEfficiencyConstant: 0,
      measurementOption: 'Speed'
    }
  }

  initColumnTitles(settings: Settings, isFan: boolean, graphPumpCurve: boolean, graphModificationCurve: boolean, graphSystemCurve: boolean): Array<string> {
    let columnTitles: Array<string> = new Array<string>();
    let flowMeasurement: string;
    let distanceMeasurement: string;
    let headOrPressure: string;
    let powerMeasurement: string;
    if (isFan) {
      flowMeasurement = this.getDisplayUnit(settings.fanFlowRate);
      distanceMeasurement = this.getDisplayUnit(settings.fanPressureMeasurement);
      powerMeasurement = this.getDisplayUnit(settings.fanPowerMeasurement);
      headOrPressure = 'Pressure';
    } else {
      flowMeasurement = this.getDisplayUnit(settings.flowMeasurement);
      distanceMeasurement = this.getDisplayUnit(settings.distanceMeasurement);
      powerMeasurement = this.getDisplayUnit(settings.powerMeasurement);
      headOrPressure = 'Head'
    }
    if (graphPumpCurve) {
      columnTitles = ['Flow Rate (' + flowMeasurement + ')', 'Base ' + headOrPressure + ' (' + distanceMeasurement + ')'];
      if (graphModificationCurve) {
        columnTitles.push('Mod ' + headOrPressure + ' (' + distanceMeasurement + ')');
      }
    }
    if (graphSystemCurve) {
      columnTitles.push('System ' + headOrPressure + ' (' + distanceMeasurement + ')');
      columnTitles.push('Fluid Power (' + powerMeasurement + ')');
    }
    return columnTitles;
  }


  initTooltipData(settings: Settings, isFan: boolean, graphPumpCurve: boolean, graphModificationCurve: boolean, graphSystemCurve: boolean): Array<{ label: string, value: number, unit: string, formatX: boolean }> {
    let tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    let flowMeasurement: string;
    let distanceMeasurement: string;
    let headOrPressure: string;
    let powerMeasurement: string;
    if (isFan) {
      headOrPressure = "Pressure";
      distanceMeasurement = this.getDisplayUnit(settings.fanPressureMeasurement);
      flowMeasurement = this.getDisplayUnit(settings.fanFlowRate);
      powerMeasurement = settings.fanPowerMeasurement;
    } else {
      headOrPressure = "Head";
      distanceMeasurement = settings.distanceMeasurement;
      flowMeasurement = settings.flowMeasurement;
      powerMeasurement = settings.powerMeasurement;
    }

    if (graphPumpCurve) {
      tooltipData.push({
        label: "Base Flow",
        value: null,
        unit: " " + flowMeasurement,
        formatX: true
      });
      if (graphModificationCurve) {
        tooltipData.push({
          label: "Mod Flow",
          value: null,
          unit: " " + flowMeasurement,
          formatX: true
        });
      }
    }
    if (graphSystemCurve) {
      tooltipData.push({
        label: "Sys. Flow",
        value: null,
        unit: " " + flowMeasurement,
        formatX: true
      });
    }

    if (graphPumpCurve) {
      tooltipData.push({
        label: "Base " + headOrPressure,
        value: null,
        unit: " " + distanceMeasurement,
        formatX: false
      });
      if (graphModificationCurve) {
        tooltipData.push({
          label: "Mod " + headOrPressure,
          value: null,
          unit: " " + distanceMeasurement,
          formatX: false
        });
      }
    }
    if (graphSystemCurve) {
      tooltipData.push({
        label: "Sys. Curve " + headOrPressure,
        value: null,
        unit: " " + distanceMeasurement,
        formatX: false
      });
      tooltipData.push({
        label: "Fluid Power",
        value: null,
        unit: " " + powerMeasurement,
        formatX: null
      });
    }
    return tooltipData;
  }

  getData(pumpCurveForm: PumpCurveForm, selectedFormView: string): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    if (selectedFormView == 'Data') {
      let maxDataFlow = _.maxBy(pumpCurveForm.dataRows, (val) => { return val.flow });
      console.log('maxDataFlow = ' + maxDataFlow);
      let tmpArr = new Array<any>();
      pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: pumpCurveForm.dataOrder, precision: 10 });
      this.regEquation.next(results.string);
      for (let i = 0; i <= maxDataFlow.flow; i = i + 10) {
        let yVal = results.predict(i);
        if (yVal[1] > 0) {
          data.push({
            x: i,
            y: yVal[1]
          })
        }
      }
    } else if (selectedFormView == 'Equation') {
      this.regEquation.next(null);
      for (let i = 0; i <= pumpCurveForm.maxFlow + 10; i = i + 10) {
        let yVal = this.calculateY(pumpCurveForm, i);
        if (yVal > 0) {
          data.push({
            x: i,
            y: yVal
          });
        }
      }
    }
    return data;
  }

  getModifiedData(pumpCurveForm: PumpCurveForm, selectedFormView: string, baseline: number, modified: number): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    let ratio = modified / baseline;
    let maxDataFlow: number;
    if (selectedFormView == 'Data') {
      let tmpDataFlow = _.maxBy(pumpCurveForm.dataRows, (val) => { return val.flow });
      maxDataFlow = tmpDataFlow.flow;
      let tmpArr = new Array<any>();
      pumpCurveForm.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: pumpCurveForm.dataOrder, precision: 10 });
      for (let i = 0; i <= maxDataFlow; i = i + 10) {
        let yVal = results.predict(i);
        if (yVal[1] > 0) {
          data.push({
            x: i * ratio,
            y: yVal[1] * Math.pow(ratio, 2)
          })
        }
      }
    } else if (selectedFormView == 'Equation') {
      maxDataFlow = pumpCurveForm.maxFlow;
      data.push({
        x: 0 * ratio,
        y: this.calculateY(pumpCurveForm, 0) * Math.pow(ratio, 2)
      });
      for (let i = 10; i <= maxDataFlow + 10; i = i + 10) {
        let yVal = this.calculateY(pumpCurveForm, i);
        if (yVal > 0) {
          data.push({
            x: i * ratio,
            y: yVal * Math.pow(ratio, 2)
          })
        }
      }
    }
    let data2 = new Array<any>();
    for (let i = 0; i < data.length; i++) {
      data2.push([data[i].x, data[i].y]);
    }
    let data3 = new Array<any>();
    let results = regression.polynomial(data2, { order: pumpCurveForm.dataOrder, precision: 10 });
    for (let i = 0; i <= maxDataFlow * ratio; i = i + 10) {
      let yVal = results.predict(i)
      if (yVal[1] > 0) {
        data3.push({
          x: i,
          y: yVal[1]
        });
      }
    }
    return data3;
  }

  calculateY(formData: PumpCurveForm, flow: number): number {
    let result = 0;
    result = formData.headConstant + (formData.headFlow * flow) + (formData.headFlow2 * Math.pow(flow, 2)) + (formData.headFlow3 * Math.pow(flow, 3)) + (formData.headFlow4 * Math.pow(flow, 4)) + (formData.headFlow5 * Math.pow(flow, 5)) + (formData.headFlow6 * Math.pow(flow, 6));
    return result;
  }

  getXScaleMax(graphPumpCurve: boolean, graphModificationCurve: boolean, graphSystemCurve: boolean, dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Flow: number, systemPoint2Flow: number) {
    let max: { x: number, y: number };
    let maxX: { x: number, y: number } = { x: 0, y: 0 };
    if (graphPumpCurve) {
      maxX = _.maxBy(dataBaseline, (val) => { return val.x });
      if (graphModificationCurve) {
        let modMaxX = _.maxBy(dataModification, (val) => { return val.x });
        if (maxX.x < modMaxX.x) {
          maxX = modMaxX;
        }
      }
    }
    if (graphSystemCurve) {
      if (systemPoint1Flow > systemPoint2Flow) {
        if (systemPoint1Flow > maxX.x) {
          maxX.x = systemPoint1Flow;
        }
      }
      else {
        if (systemPoint2Flow > maxX.x) {
          maxX.x = systemPoint2Flow;
        }
      }
    }
    max = maxX;
    return max;
  }

  getYScaleMax(graphPumpCurve: boolean, graphModificationCurve: boolean, graphSystemCurve: boolean, dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Head: number, systemPoint2Head: number) {
    let max: { x: number, y: number };
    let maxY: { x: number, y: number } = { x: 0, y: 0 };
    let tmpDataBaseline = dataBaseline;
    if (graphPumpCurve) {
      // let baseMaxY = _.maxBy(dataBaseline, (val) => { return val.y });
      let baseMaxY = _.maxBy(tmpDataBaseline, (val) => { return val.y });
      maxY = baseMaxY;
      if (graphModificationCurve) {
        let tmpDataMod = dataModification;
        // let modMaxY = _.maxBy(dataModification, (mod) => { return mod.y });
        let modMaxY = _.maxBy(tmpDataMod, (mod) => { return mod.y });
        if (modMaxY.y > maxY.y) {
          maxY.y = modMaxY.y;
        }
        // maxY.y = Math.max(modMaxY.y, maxY.y);
      }
    }
    if (graphSystemCurve) {
      if (systemPoint1Head > systemPoint2Head) {
        if (systemPoint1Head > maxY.y) {
          maxY.y = systemPoint1Head;
        }
      }
      else {
        if (systemPoint2Head > maxY.y) {
          maxY.y = systemPoint2Head;
        }
      }
      // maxY.y = Math.max(systemPoint1Head, maxY.y);
      // maxY.y = Math.max(systemPoint2Head, maxY.y);
    }
    max = maxY;
    return max;
  }


  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

}


export interface PumpCurveRanges {
  maxFlowMin: number;
  constantMin: number;
}
