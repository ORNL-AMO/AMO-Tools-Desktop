import { Injectable } from '@angular/core';
import { TraceCoordinates, SimpleChart, TraceData, DataPoint } from '../../../shared/models/plotting';
import { PsatService } from '../../../psat/psat.service';
import { UntypedFormGroup } from '@angular/forms';
import { Settings } from '../../../shared/models/settings';
import { BehaviorSubject } from 'rxjs';
import { MotorPerformanceResults } from './motor-performance.service';

@Injectable({
  providedIn: 'root'
})
export class MotorPerformanceChartService {

  performanceChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<MotorPoint>>;
  constructor(private psatService: PsatService) {
    this.initChart();
  }

   initChart() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    this.performanceChart = new BehaviorSubject<SimpleChart>(emptyChart);
    
    let selectedDataPoints = new Array<MotorPoint>();
    this.selectedDataPoints = new BehaviorSubject<Array<MotorPoint>>(selectedDataPoints);
  }

  buildLineData(performanceForm: UntypedFormGroup, settings: Settings): Array<TraceCoordinates> {
    let currentData: TraceCoordinates = {x: [], y: []};
    let powerData: TraceCoordinates = {x: [], y: []};
    let efficiencyData: TraceCoordinates = {x: [], y: []};

    for (let i = .001; i <= 1.2; i = i + .01) {
      let performanceResults = this.calculateMotorPerformance(i, performanceForm, settings);
      let current: number = performanceResults.current;
      let efficiency: number = performanceResults.efficiency;
      let powerFactor: number = performanceResults.powerFactor;

      if (current >= 0) {
        currentData.x.push(i);
        currentData.y.push(this.psatService.roundVal(current, 3));
      }
      if (powerFactor >= 0 && powerFactor <= 120) {
        powerData.x.push(i);
        powerData.y.push(this.psatService.roundVal(powerFactor, 3));
      }
      if (efficiency >= 0 && efficiency <= 120) {
        efficiencyData.x.push(i);
        efficiencyData.y.push(this.psatService.roundVal(efficiency, 3));
      }
    }
    return [currentData, powerData, efficiencyData];
  }

  calculateMotorPerformance(loadFactor: number, performanceForm: UntypedFormGroup, settings: Settings): MotorPerformanceResults {
      if (performanceForm.valid) {
        let results: MotorPerformanceResults = this.psatService.motorPerformance(
          performanceForm.controls.frequency.value,
          performanceForm.controls.efficiencyClass.value,
          performanceForm.controls.horsePower.value,
          performanceForm.controls.motorRPM.value,
          performanceForm.controls.efficiency.value,
          performanceForm.controls.motorVoltage.value,
          performanceForm.controls.fullLoadAmps.value,
          loadFactor,
          settings
        );
        return results;
      }
      return {
        current: 0,
        efficiency: 0,
        powerFactor: 0
      };
  }

  
  getTraceDataFromPoint(selectedPoint: DataPoint): TraceData {
    let trace: TraceData = {
      x: [selectedPoint.x],
      y: [selectedPoint.y],
      type: 'scatter',
      name: '',
      showlegend: false,
      mode: 'markers',
      hoverinfo: 'skip',
      marker: {
        color: selectedPoint.pointColor,
        size: 14,
      },
    };
    return trace;
  }

  getEmptyTrace(): TraceData {
    let trace: TraceData =   {
      x: [],
      y: [],
      name: '',
      showlegend: true,
      type: 'scatter',
      line: {
        shape: 'spline',
        color: '',
      }
    };
    return trace;
  }

  getEmptyChart(): SimpleChart {
    return {
      name: 'Motor Performance',
      data: [],
      layout: {
        legend: {
          orientation: 'h',
          font: {
            size: 12,
          },
          x: 0,
          y: -.25
        },
        hovermode: 'x',
        xaxis: {
          autorange: false,
          showgrid: true,
          title: {
            text: "Motor Shaft Load"
          },
          showticksuffix: 'all',
          tickangle: -60,
          tickmode: 'array',
          range: [0, 1.4],
          tickvals: [0, .20, .40, .60, .80, 1, 1.2],
          tickformat: '.0%'
        },
        yaxis: {
          type: 'linear',
          showgrid: true,
          title: {
            text: "Current, Power Factor, Efficiency"
          },
          range: [0, 140],
          tickvals: [0, 20, 40, 60, 80, 100, 120],
          ticktext: ['0', '20%', '40%', '60%', '80%', '100%', '120%'],
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
  hoverPoints: Array<DataPoint>,
  shaftLoad?: DataPoint
};

export interface MotorPoint extends DataPoint {
  shaftLoad: number,
  current: number,
  power: number,
  efficiency: number
};