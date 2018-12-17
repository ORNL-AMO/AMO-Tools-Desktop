import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PumpCurve, PumpCurveDataRow } from '../../../shared/models/calculators';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl, FormArray } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import * as regression from 'regression';
import * as _ from 'lodash';

@Injectable()
export class PumpCurveService {

  pumpCurveData: PumpCurve;
  pumpPointOne: { form: FormGroup, fluidPower: number };
  pumpPointTwo: { form: FormGroup, fluidPower: number };
  pumpCurveConstants: { form: FormGroup };

  fanCurveData: PumpCurve;
  fanPointOne: { form: FormGroup, fluidPower: number };
  fanPointTwo: { form: FormGroup, fluidPower: number };
  fanCurveConstants: { form: FormGroup };


  calcMethod: BehaviorSubject<string>;
  regEquation: BehaviorSubject<string>;
  rSquared: BehaviorSubject<string>;
  constructor(private convertUnitsService: ConvertUnitsService, private formBuilder: FormBuilder) {
    this.calcMethod = new BehaviorSubject<string>('Equation');
    this.regEquation = new BehaviorSubject<string>(null);
  }


  getFormFromObj(inputObj: PumpCurve): FormGroup {
    let headOrder = inputObj.headOrder - 2;
    let measurementOption = 1;
    if (inputObj.measurementOption == 'Diameter') {
      measurementOption = 0;
    }

    let tmpFormArray: FormArray = new FormArray([]);
    if (inputObj.dataRows !== undefined && inputObj.dataRows !== null) {
      //iterate through dataRows and create controls for them
      for (let i = 0; i < inputObj.dataRows.length; i++) {
        let tmpDataRowForm = this.formBuilder.group({
          flow: [inputObj.dataRows[i].flow, [Validators.required, Validators.max(1000000)]],
          head: [inputObj.dataRows[i].head, [Validators.required, Validators.min(0)]]
        });
        tmpFormArray.push(tmpDataRowForm);
      }
    }

    let tmpForm: FormGroup = this.formBuilder.group({
      dataRows: [tmpFormArray],
      dataOrder: [inputObj.dataRows.length || null],
      maxFlow: [inputObj.maxFlow, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      headOrder: [headOrder],
      headConstant: [inputObj.headConstant, [Validators.required, Validators.min(0)]],
      measurementOption: [measurementOption],
      measurementOption2: [measurementOption],
      baselineMeasurement: [inputObj.baselineMeasurement, [Validators.required, Validators.min(0)]],
      modifiedMeasurement: [inputObj.modifiedMeasurement, [Validators.required, Validators.min(0)]],
      headFlow: [inputObj.headFlow, Validators.required],
      headFlow2: [inputObj.headFlow2, Validators.required],
      headFlow3: [inputObj.headFlow3, Validators.required],
      headFlow4: [inputObj.headFlow4, Validators.required],
      headFlow5: [inputObj.headFlow5, Validators.required],
      headFlow6: [inputObj.headFlow6, Validators.required],
      pumpEfficiencyOrder: [inputObj.pumpEfficiencyOrder],
      pumpEfficiencyConstant: [inputObj.pumpEfficiencyConstant],
      exploreLine: [inputObj.exploreLine],
      exploreHead: [inputObj.exploreHead],
      exploreFlow: [inputObj.exploreFlow],
      explorePumpEfficiency: [inputObj.explorePumpEfficiency]
    });
    return tmpForm;
  }

  getObjFromForm(form: FormGroup): PumpCurve {
    let pumpCurve: PumpCurve;
    let dataRows = new Array<PumpCurveDataRow>();
    for (let i = 0; i < form.controls.dataRows.value.length; i++) {
      let dataRow: PumpCurveDataRow = {
        head: form.controls.dataRows.value.controls[i].controls.head.value,
        flow: form.controls.dataRows.value.controls[i].controls.flow.value
      };
      dataRows.push(dataRow);
    }
    let headOrder = form.controls.headOrder.value + 2;

    pumpCurve = {
      dataRows: dataRows,
      dataOrder: dataRows.length,
      measurementOption: form.controls.measurementOption.value == 1 ? "Speed" : "Diameter",
      baselineMeasurement: form.controls.baselineMeasurement.value,
      modifiedMeasurement: form.controls.modifiedMeasurement.value,
      exploreLine: form.controls.exploreLine.value,
      exploreHead: form.controls.exploreHead.value,
      exploreFlow: form.controls.exploreFlow.value,
      explorePumpEfficiency: form.controls.explorePumpEfficiency.value,
      headOrder: headOrder,
      headConstant: form.controls.headConstant.value,
      headFlow: form.controls.headFlow.value,
      headFlow2: form.controls.headFlow2.value,
      headFlow3: form.controls.headFlow3.value,
      headFlow4: form.controls.headFlow4.value,
      headFlow5: form.controls.headFlow5.value,
      headFlow6: form.controls.headFlow6.value,
      pumpEfficiencyOrder: form.controls.pumpEfficiencyOrder.value,
      pumpEfficiencyConstant: form.controls.pumpEfficiencyConstant.value,
      maxFlow: form.controls.maxFlow.value
    };
    return pumpCurve;
  }

  addDataRowToForm(row: PumpCurveDataRow, form: FormGroup): FormGroup {
    let tmpDataRowForm = this.formBuilder.group({
      flow: [row.flow, [Validators.required, Validators.max(1000000)]],
      head: [row.head, [Validators.required, Validators.min(0)]]
    });
    form.controls.dataRows.value.controls.push(tmpDataRowForm);
    return form;
  }

  removeDataRowFromForm(index: number, form: FormGroup): FormGroup {
    form.controls.dataRows.value.removeAt(index);
    return form;
  }

  initPumpCurve(): PumpCurve {
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
      if (!graphPumpCurve) {
        columnTitles.push('Flow Rate (' + flowMeasurement + ')');
      }
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

  getData(pumpCurve: PumpCurve, selectedFormView: string): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    if (selectedFormView == 'Data') {
      let maxDataFlow = _.maxBy(pumpCurve.dataRows, (val) => { return val.flow });
      let tmpArr = new Array<any>();
      pumpCurve.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: pumpCurve.dataOrder, precision: 10 });
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
      for (let i = 0; i <= pumpCurve.maxFlow + 10; i = i + 10) {
        let yVal = this.calculateY(pumpCurve, i);
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

  getModifiedData(pumpCurve: PumpCurve, selectedFormView: string, baseline: number, modified: number): Array<{ x: number, y: number }> {
    let data: Array<{ x: number, y: number }> = new Array<{ x: number, y: number }>();
    let ratio = modified / baseline;
    let maxDataFlow: number;
    if (selectedFormView == 'Data') {
      let tmpDataFlow = _.maxBy(pumpCurve.dataRows, (val) => { return val.flow });
      maxDataFlow = tmpDataFlow.flow;
      let tmpArr = new Array<any>();
      pumpCurve.dataRows.forEach(val => {
        tmpArr.push([val.flow, val.head]);
      })
      let results = regression.polynomial(tmpArr, { order: pumpCurve.dataOrder, precision: 10 });
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
      maxDataFlow = pumpCurve.maxFlow;
      data.push({
        x: 0 * ratio,
        y: this.calculateY(pumpCurve, 0) * Math.pow(ratio, 2)
      });
      for (let i = 10; i <= maxDataFlow + 10; i = i + 10) {
        let yVal = this.calculateY(pumpCurve, i);
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
    let results = regression.polynomial(data2, { order: pumpCurve.dataOrder, precision: 10 });
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

  calculateY(data: PumpCurve, flow: number): number {
    let result = 0;
    result = data.headConstant + (data.headFlow * flow) + (data.headFlow2 * Math.pow(flow, 2)) + (data.headFlow3 * Math.pow(flow, 3)) + (data.headFlow4 * Math.pow(flow, 4)) + (data.headFlow5 * Math.pow(flow, 5)) + (data.headFlow6 * Math.pow(flow, 6));
    return result;
  }

  getXScaleMax(graphPumpCurve: boolean, graphModificationCurve: boolean, graphSystemCurve: boolean, pumpCurve: PumpCurve, dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Flow: number, systemPoint2Flow: number) {
    let max: { x: number, y: number };
    let maxX: { x: number, y: number } = { x: 0, y: 0 };
    if (graphPumpCurve) {
      maxX = _.maxBy(dataBaseline, (val) => { return val.x });
      if (maxX === undefined) {
        let maxFlow = _.maxBy(pumpCurve.dataRows, (val) => { return val.flow });
        maxX = {
          x: maxFlow.flow,
          y: maxFlow.head
        };
      }
      if (graphModificationCurve) {
        let modMaxX = _.maxBy(dataModification, (val) => { return val.x });
        if (modMaxX === undefined) {
          let modMaxFlow = _.maxBy(pumpCurve.dataRows, (val) => { return val.flow });
          modMaxX = {
            x: modMaxFlow.flow,
            y: modMaxFlow.head
          };
        }
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

  getYScaleMax(graphPumpCurve: boolean, graphModificationCurve: boolean, graphSystemCurve: boolean, pumpCurve: PumpCurve, dataBaseline: Array<{ x: number, y: number }>, dataModification: Array<{ x: number, y: number }>, systemPoint1Head: number, systemPoint2Head: number) {
    let max: { x: number, y: number };
    let maxY: { x: number, y: number } = { x: 0, y: 0 };
    let tmpDataBaseline = dataBaseline;
    if (graphPumpCurve) {
      // let baseMaxY = _.maxBy(dataBaseline, (val) => { return val.y });
      let baseMaxY = _.maxBy(tmpDataBaseline, (val) => { return val.y });
      if (baseMaxY === undefined) {
        let maxHead = _.maxBy(pumpCurve.dataRows, (val) => { return val.head });
        baseMaxY = {
          x: maxHead.flow,
          y: maxHead.head
        };
      }
      maxY = baseMaxY;
      if (graphModificationCurve) {
        let tmpDataMod = dataModification;
        let modMaxY = _.maxBy(tmpDataMod, (mod) => { return mod.y });
        if (modMaxY === undefined) {
          let modHead = _.maxBy(pumpCurve.dataRows, (mod) => { return mod.head });
          modMaxY = {
            x: modHead.flow,
            y: modHead.head
          };
        }
        if (modMaxY.y > maxY.y) {
          maxY.y = modMaxY.y;
        }
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
