import { Injectable, ElementRef } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import * as _ from 'lodash';
import { RegressionEquationsService } from '../regression-equations.service';
import { BehaviorSubject } from 'rxjs';
import { SvgToPngService } from '../../../shared/helper-services/svg-to-png.service';
import { PumpSystemCurveData, FanSystemCurveData, EquipmentInputs } from '../../../shared/models/system-and-equipment-curve';
import { SimpleChart, DataPoint, TraceData } from '../../../shared/models/plotting';
@Injectable()
export class SystemAndEquipmentCurveGraphService {

  selectedDataPoint: BehaviorSubject<Array<{ x: number, y: number, fluidPower?: number }>>;
  baselineIntersectionPoint: BehaviorSubject<{ x: number, y: number, fluidPower: number }>;
  modificationIntersectionPoint: BehaviorSubject<{ x: number, y: number, fluidPower: number }>;
  clearDataPoints: BehaviorSubject<boolean>;
  xRef: any;
  yRef: any;
  svg: any;

  curveEquipmentChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<DataPoint>>;

  constructor(private convertUnitsService: ConvertUnitsService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService, private regressionEquationsService: RegressionEquationsService, private svgToPngService: SvgToPngService) {
    this.selectedDataPoint = new BehaviorSubject(undefined);
    this.baselineIntersectionPoint = new BehaviorSubject(undefined);
    this.modificationIntersectionPoint = new BehaviorSubject(undefined);
    this.clearDataPoints = new BehaviorSubject<boolean>(false);

    this.initChartData();
  }

  initChartData() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    let dataPoints = new Array<DataPoint>();
    
    this.curveEquipmentChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.selectedDataPoints = new BehaviorSubject<Array<DataPoint>>(dataPoints);
  }


  initColumnTitles(settings: Settings, equipmentType: string, displayEquipmentCurve: boolean, displayModificationCurve: boolean, displaySystemCurve: boolean): Array<string> {
    let columnTitles: Array<string> = new Array<string>();
    let flowMeasurement: string;
    let distanceMeasurement: string;
    let equipmentLabel: string;
    let powerMeasurement: string;
    if (equipmentType == 'fan') {
      flowMeasurement = this.getDisplayUnit(settings.fanFlowRate);
      distanceMeasurement = this.getDisplayUnit(settings.fanPressureMeasurement);
      powerMeasurement = this.getDisplayUnit(settings.fanPowerMeasurement);
      equipmentLabel = 'Pressure';
    } else if (equipmentType == 'pump') {
      flowMeasurement = this.getDisplayUnit(settings.flowMeasurement);
      distanceMeasurement = this.getDisplayUnit(settings.distanceMeasurement);
      powerMeasurement = this.getDisplayUnit(settings.powerMeasurement);
      equipmentLabel = 'Head'
    }
    if (displayEquipmentCurve) {
      columnTitles = ['Flow Rate (' + flowMeasurement + ')', 'Base ' + equipmentLabel + ' (' + distanceMeasurement + ')'];
      if (displayModificationCurve) {
        columnTitles.push('Mod ' + equipmentLabel + ' (' + distanceMeasurement + ')');
      }
    }
    if (displaySystemCurve) {
      if (!displayEquipmentCurve) {
        columnTitles.push('Flow Rate (' + flowMeasurement + ')');
      }
      columnTitles.push('System ' + equipmentLabel + ' (' + distanceMeasurement + ')');
      columnTitles.push('Fluid Power (' + powerMeasurement + ')');
    }
    return columnTitles;
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  getGraphDomainAndRange(
    isEquipmentCurveShown: boolean,
    isSystemCurveShown: boolean,
    equipmentType: string,
    width: number,
    height: number,
    baselineEquipmentData: Array<{ x: number, y: number }>,
    modificationEqupmentData: Array<{ x: number, y: number }>,
    pumpSystemCurveData: PumpSystemCurveData,
    fanSystemCurveData: FanSystemCurveData,
    maxFlowRate: number
  ): {
    xDomain: { min: number, max: number },
    xRange: { min: number, max: number },
    yDomain: { min: number, max: number },
    yRange: { min: number, max: number }
  } {
    let maxY: number = 0;

    if (isEquipmentCurveShown == true && baselineEquipmentData && modificationEqupmentData) {
      let baselineEquipmentDataCopy: Array<{ x: number, y: number }> = JSON.parse(JSON.stringify(baselineEquipmentData));
      let modificationEqupmentDataCopy: Array<{ x: number, y: number }> = JSON.parse(JSON.stringify(modificationEqupmentData));
      let combinedData: Array<{ x: number, y: number }> = modificationEqupmentDataCopy.concat(baselineEquipmentDataCopy);
      // let tmpMaxX = _.maxBy(combinedData, (data) => { return data.x });
      // if (tmpMaxX != undefined) { maxX = tmpMaxX };
      let tmpMaxY = _.maxBy(combinedData, (data) => { return data.y });
      if (tmpMaxY != undefined) { maxY = tmpMaxY.y };
    }

    if (isSystemCurveShown == true) {
      if (equipmentType == 'pump' && pumpSystemCurveData) {
        if (pumpSystemCurveData != undefined) {
          let pumpSystemDataCpy: PumpSystemCurveData = JSON.parse(JSON.stringify(pumpSystemCurveData));
          // let maxXValue: number = _.max([maxX.x, pumpSystemDataCpy.pointOneFlowRate, pumpSystemDataCpy.pointTwoFlowRate]);
          // maxX.x = maxXValue;
          let maxYValue: number = _.max([maxY, pumpSystemDataCpy.pointOneHead, pumpSystemDataCpy.pointTwoHead]);
          maxY = maxYValue;
        }
      } else if (equipmentType == 'fan') {
        if (fanSystemCurveData != undefined && fanSystemCurveData) {
          let fanSystemCurveDataCpy: FanSystemCurveData = JSON.parse(JSON.stringify(fanSystemCurveData));
          // let maxXValue: number = _.max([maxX.x, fanSystemCurveDataCpy.pointOneFlowRate, fanSystemCurveDataCpy.pointTwoFlowRate]);
          // maxX.x = maxXValue;
          let maxYValue: number = _.max([maxY, fanSystemCurveDataCpy.pointOnePressure, fanSystemCurveDataCpy.pointTwoPressure]);
          maxY = maxYValue;
        }
      }
    }

    if (maxY < 50) {
      maxY = 50;
    }

    let paddingX = maxFlowRate * 0.1;
    let paddingY = maxY * 0.1;
    //create x and y graph scales
    let xRange: { min: number, max: number } = { min: 0, max: width };
    let xDomain = { min: 0, max: maxFlowRate + paddingX };
    let yRange: { min: number, max: number } = { min: height, max: 0 };
    let yDomain = { min: 0, max: maxY + paddingY };
    return { xDomain: xDomain, yDomain: yDomain, xRange: xRange, yRange: yRange }
  }


  getIntersectionPoint(equipmentType: string, settings: Settings, curveDataPairs: Array<{ x: number, y: number }>, systemCurveRegressionData: Array<{ x: number, y: number, fluidPower: number }>) {
    let intersectionPoint: { x: number, y: number } = this.calculateIntersectionPoint(JSON.parse(JSON.stringify(systemCurveRegressionData)), JSON.parse(JSON.stringify(curveDataPairs)));
    if (intersectionPoint != undefined) {
      let fluidPower: number = this.getFluidPowerFromIntersectionPoint(intersectionPoint.x, intersectionPoint.y, settings, equipmentType);
      return {
        x: intersectionPoint.x,
        y: intersectionPoint.y,
        fluidPower: fluidPower
      };
    } else {
      return undefined;
    }
  }

  getModifiedIntersectionPoint(baselinePoint: { x: number, y: number }, settings: Settings, equipmentType: string, equipmentInputs: EquipmentInputs): { x: number, y: number, fluidPower: number } {
    let ratio: number = equipmentInputs.modifiedMeasurement / equipmentInputs.baselineMeasurement;
    let x: number = baselinePoint.x * ratio;
    let y: number = baselinePoint.y * Math.pow(ratio, 2);
    let fluidPower: number = this.getFluidPowerFromIntersectionPoint(x, y, settings, equipmentType);
    return { x: x, y: y, fluidPower: fluidPower };
  }

  getFluidPowerFromIntersectionPoint(x: number, y: number, settings: Settings, equipmentType: string): number {
    let fluidPowerCalcVal: number;
    if (equipmentType == 'fan') {
      let fanSystemCurveData: FanSystemCurveData = this.systemAndEquipmentCurveService.fanSystemCurveData.getValue();
      fluidPowerCalcVal = fanSystemCurveData.compressibilityFactor;
    } else if (equipmentType == 'pump') {
      let pumpSystemCurveData: PumpSystemCurveData = this.systemAndEquipmentCurveService.pumpSystemCurveData.getValue();
      fluidPowerCalcVal = pumpSystemCurveData.specificGravity;
    }
    let fluidPower: number;
    if (equipmentType == 'pump') {
      fluidPower = this.regressionEquationsService.getPumpFluidPower(y, x, fluidPowerCalcVal, settings);
    } else if (equipmentType == 'fan') {
      fluidPower = this.regressionEquationsService.getFanFluidPower(y, x, fluidPowerCalcVal, settings);
    }
    return fluidPower;
  }

  calculateIntersectionPoint(
    systemCurve: Array<{ x: number, y: number, fluidPower: number }>,
    equipmentCurve: Array<{ x: number, y: number }>
  ): { x: number, y: number } {
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

  // calculateXValFromY(yVal: number, staticVal: number, coefficient: number, systemLossExponent: number) {
  //   return Math.pow((yVal - staticVal) / coefficient, 1 / systemLossExponent);
  // }

  initTooltipData(settings: Settings, equipmentType: string, isEquipmentCurveShown: boolean, isEquipmentModificationShown: boolean, isSystemCurveShown: boolean): Array<{ label: string, value: number, unit: string, formatX: boolean }> {
    let tooltipData = new Array<{ label: string, value: number, unit: string, formatX: boolean }>();
    let flowMeasurement: string;
    let distanceMeasurement: string;
    let yValueLabel: string;
    let powerMeasurement: string;
    if (equipmentType == 'fan') {
      yValueLabel = "Pressure";
      distanceMeasurement = this.getDisplayUnit(settings.fanPressureMeasurement);
      flowMeasurement = this.getDisplayUnit(settings.fanFlowRate);
      powerMeasurement = settings.fanPowerMeasurement;
    } else {
      yValueLabel = "Head";
      distanceMeasurement = settings.distanceMeasurement;
      flowMeasurement = settings.flowMeasurement;
      powerMeasurement = settings.powerMeasurement;
    }

    if (isEquipmentCurveShown) {
      tooltipData.push({
        label: "Base Flow",
        value: null,
        unit: " " + flowMeasurement,
        formatX: true
      });
      if (isEquipmentModificationShown) {
        tooltipData.push({
          label: "Mod Flow",
          value: null,
          unit: " " + flowMeasurement,
          formatX: true
        });
      }
    }
    if (isSystemCurveShown) {
      tooltipData.push({
        label: "Sys. Flow",
        value: null,
        unit: " " + flowMeasurement,
        formatX: true
      });
    }

    if (isEquipmentCurveShown) {
      tooltipData.push({
        label: "Base " + yValueLabel,
        value: null,
        unit: " " + distanceMeasurement,
        formatX: false
      });
      if (isEquipmentModificationShown) {
        tooltipData.push({
          label: "Mod " + yValueLabel,
          value: null,
          unit: " " + distanceMeasurement,
          formatX: false
        });
      }
    }
    if (isSystemCurveShown) {
      tooltipData.push({
        label: "Sys. Curve " + yValueLabel,
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

  downloadChart(ngChart: ElementRef, equipmentType: string) {
    let exportName: string = this.getExportName(equipmentType);
    this.svgToPngService.exportPNG(ngChart, exportName);
  }

  getExportName(equipmentType: string): string {
    let exportName: string;
    let isSystemCurveShown: boolean = this.systemAndEquipmentCurveService.systemCurveCollapsed.getValue() == 'open';
    let isEquipmentCurveShown: boolean = this.systemAndEquipmentCurveService.equipmentCurveCollapsed.getValue() == 'open';
    if (isSystemCurveShown) {
      exportName = equipmentType + '-system-curve-graph';
    } else if (isEquipmentCurveShown) {
      exportName = equipmentType + '-curve-graph';
    }
    return exportName;
  }

  getTraceDataFromPoint(selectedPoint: DataPoint): TraceData {
    let trace: TraceData = {
      x: [selectedPoint.x],
      y: [selectedPoint.y],
      type: 'scatter',
      name: '',
      showlegend: false,
      mode: 'markers',
      marker: {
        color: selectedPoint.pointColor,
        size: 14,
      },
    };
    return trace;
  }

  getEmptyChart(): SimpleChart {
    return {
      name: 'System and Equipment Curve',
      currentEquipmentType: '',
      data: [
        // System
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          line: {
            shape: 'spline',
            color: 'red',
            dash: 'dot',
          }
        },
        // Baseline
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          line: {
            shape: 'spline',
            color: undefined,
          }
        },
        // Baseline Intersect
        {
          x: [],
          y: [],
          type: 'scatter',
          showlegend: false,
          mode: 'markers',
          name: '',
          marker: {
            color: 'rgba(0, 0, 0, 0)',
            line: {
              color: 'rgba(0, 0, 0, .6)',
              width: 4,
            },
            size: 12,
          },
        },
        // Modification
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          line: {
            shape: 'spline',
            color: undefined,
          }
        },
        // Modification Intersect
        {
          x: [],
          y: [],
          type: 'scatter',
          showlegend: false,
          mode: 'markers',
          name: '',
          marker: {
            color: 'rgba(0, 0, 0, 0)',
            line: {
              color: 'rgba(0, 0, 0, .6)',
              width: 4
            },
            size: 12,
          },
        },
        // Power
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          line: {
            shape: 'spline',
            color: undefined,
            smoothing: 1.3
          }
        },
      ],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: true,
          type: 'auto',
          showgrid: true,
          title: {
            text: ""
          },
          showticksuffix: 'all',
          tickangle: -60
        },
        yaxis: {
          autorange: true,
          type: 'linear',
          showgrid: true,
          title: {
            text: ""
          },
          rangemode: 'tozero',
          showticksuffix: 'all'
        },
        margin: {
          t: 50,
          b: 75,
          l: 75,
          r: 50
        }
      },
      config: {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'toggleSpikelines', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      }
    };
  }
}

export interface HoverGroupData {
  baseline: DataPoint,
  modification?: DataPoint,
  system: DataPoint,
  fluidPower?: number
};


export interface SystemCurveDataPoint extends DataPoint {
  pointEfficiency?: number
}