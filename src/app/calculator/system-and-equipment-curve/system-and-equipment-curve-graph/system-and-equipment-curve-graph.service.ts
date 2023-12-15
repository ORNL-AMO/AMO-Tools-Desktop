import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { SimpleChart, DataPoint, TraceData } from '../../../shared/models/plotting';
import { Settings } from '../../../shared/models/settings';

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
  powerChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<DataPoint>>;
  modifiedIntersectionIndex: number;

  constructor(private convertUnitsService: ConvertUnitsService, private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) {
    this.selectedDataPoint = new BehaviorSubject(undefined);
    this.baselineIntersectionPoint = new BehaviorSubject(undefined);
    this.modificationIntersectionPoint = new BehaviorSubject(undefined);
    this.clearDataPoints = new BehaviorSubject<boolean>(false);

    this.initChartData();
  }

  initChartData() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    let emptyPowerChart: SimpleChart = this.getEmptyPowerChart();
    let dataPoints = new Array<DataPoint>();
    
    this.curveEquipmentChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.powerChart = new BehaviorSubject<SimpleChart>(emptyPowerChart);
    this.selectedDataPoints = new BehaviorSubject<Array<DataPoint>>(dataPoints);
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }

  getBaselineIntersectionPoint(curveDataPairs: Array<{ x: number, y: number }>, equipmentType: string, settings: Settings): SystemCurveDataPoint {
    let calculatedIntersection = this.systemAndEquipmentCurveService.calculateBaselineIntersectionPoint(curveDataPairs);
    let intersection: SystemCurveDataPoint = {
      x: 0, 
      y: 0,
    };
    if (calculatedIntersection) {
      intersection.x = calculatedIntersection.x; 
      intersection.y = calculatedIntersection.y;
      let baselinePowerPairs = this.systemAndEquipmentCurveService.baselinePowerDataPairs;
      if (equipmentType == 'fan') {
        intersection = this.systemAndEquipmentCurveService.calculateFanEfficiency(baselinePowerPairs, intersection, settings);
      } else {
        intersection = this.systemAndEquipmentCurveService.calculatePumpEfficiency(baselinePowerPairs, intersection, settings);
      }
    }
    return intersection;
  }

  calculateModificationIntersectionPoint(equipmentType: string, settings: Settings): SystemCurveDataPoint {
    let intersection: SystemCurveDataPoint = {
      x: 0,
      y: 0
    }

    let closestSystemCurvePoint;
    let closestModifiedDataPoint;
    let smallestDistanceBetweenPoints = Infinity;
    this.systemAndEquipmentCurveService.systemCurveRegressionData.forEach(systemCurveDataPoint => {
      this.systemAndEquipmentCurveService.modifiedEquipmentCurveDataPairs.forEach((modifiedDataPoint, index) => {
        //distance = (p1.x - p2.x)^2 + (p1.y - p2.y)^2
        let distanceBetweenCurrentPoint = Math.pow((systemCurveDataPoint.x - modifiedDataPoint.x), 2) + Math.pow((systemCurveDataPoint.y - modifiedDataPoint.y), 2)
        if (smallestDistanceBetweenPoints > distanceBetweenCurrentPoint) {
          smallestDistanceBetweenPoints = distanceBetweenCurrentPoint;
          closestSystemCurvePoint = systemCurveDataPoint;
          closestModifiedDataPoint = modifiedDataPoint;
          this.modifiedIntersectionIndex = index;
        }
      })
    });
    //find average between points
    if (closestModifiedDataPoint && closestSystemCurvePoint) {
      intersection.x = (closestModifiedDataPoint.x + closestSystemCurvePoint.x) / 2;
      intersection.y = (closestModifiedDataPoint.y + closestSystemCurvePoint.y) / 2;
      let baselinePowerPairs = this.systemAndEquipmentCurveService.baselinePowerDataPairs;
      if (equipmentType == 'fan') {
        intersection = this.systemAndEquipmentCurveService.calculateFanEfficiency(baselinePowerPairs, intersection, settings, true);
      } else {
        intersection = this.systemAndEquipmentCurveService.calculatePumpEfficiency(baselinePowerPairs, intersection, settings, true);
      }
    } 
    return intersection;
  }

  getSelectedDataPointEfficiency(userDataPoint: SystemCurveDataPoint, equipmentType: string, settings: Settings, isModification: boolean): SystemCurveDataPoint {
    let baselinePowerPairs = this.systemAndEquipmentCurveService.baselinePowerDataPairs;
    let systemCurveDataPoint: SystemCurveDataPoint;
    if (equipmentType == 'fan') {
      systemCurveDataPoint = this.systemAndEquipmentCurveService.calculateFanEfficiency(baselinePowerPairs, userDataPoint, settings, isModification);
    } else {
      systemCurveDataPoint = this.systemAndEquipmentCurveService.calculatePumpEfficiency(baselinePowerPairs, userDataPoint, settings, isModification);
    }
    return systemCurveDataPoint;
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
      ],
      layout: {
        hovermode: 'closest',
        height: 350,
        xaxis: {
          autorange: true,
          type: 'auto',
          showgrid: true,
          title: {
            text: "",
          },
          showspikes: true,
          spikemode: 'across',
          showticksuffix: 'all',
          tickangle: 30
        },
        yaxis: {
          autorange: true,
          type: 'linear',
          showgrid: true,
          title: {
            text: "",
          },
          rangemode: 'tozero',
          showticksuffix: 'all'
        },
        margin: {
          t: 25,
          b: 50,
          l: 75,
          r: 50
        }
      },
      config: {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
      selectedAxis: 0
    };
  }

  getEmptyPowerChart(): SimpleChart {
    return {
      name: 'Power',
      currentEquipmentType: '',
      data: [
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
        // Mod Power
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
        height: 250,
        xaxis: {
          autorange: true,
          type: 'auto',
          showgrid: true,
          spikemode: 'across',
          showspikes: true,
          title: {
            text: "",
          },
          showticksuffix: 'all',
          tickangle: 30
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
          t: 25,
          b: 50,
          l: 75,
          r: 50
        }
      },
      config: {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
      selectedAxis: 0
    };
  }
}

export interface HoverGroupData {
  baseline: DataPoint,
  modification?: DataPoint,
  system?: DataPoint,
  fluidPower?: number
};


export interface SystemCurveDataPoint extends DataPoint {
  power?: number,
  id?: string,
  efficiency?: number,
  fluidPower?: number,
  isUserPoint?: boolean
}