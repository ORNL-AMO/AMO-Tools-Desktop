import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { SimpleChart, TraceData } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';
import { getNewIdString } from '../../../shared/helperFunctions';

@Injectable()
export class AchievableEfficiencyService {

  pumpType: number;
  flowRate: number;
  efficiencyChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<EfficiencyPoint>>;
  dataPointTraces: BehaviorSubject<Array<EfficiencyTrace>>;
  
  constructor(private formBuilder: UntypedFormBuilder) {
    this.initChartData();
   }

   initChartData() {
    this.efficiencyChart = new BehaviorSubject<SimpleChart>(this.getEmptyChart());
    this.selectedDataPoints = new BehaviorSubject<Array<EfficiencyPoint>>([]);
    this.dataPointTraces = new BehaviorSubject<Array<EfficiencyTrace>>([]);
  }


  getForm(pumpType: number, flowRate: number): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      pumpType: [pumpType, Validators.required],
      flowRate: [flowRate, [Validators.required, Validators.min(0)]]
    });
    if (form.controls.flowRate.value) {
      form.controls.flowRate.markAsDirty();
    }
    return form;
  }

  getTraceDataFromPoint(selectedPoint: EfficiencyPoint): EfficiencyTrace {
    let trace: EfficiencyTrace = {
      x: [selectedPoint.x],
      y: [selectedPoint.y],
      id: getNewIdString(),
      pairId: undefined,
      type: 'scatter',
      name: `${selectedPoint.x}, ${selectedPoint.y}`,
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
    let maxTemplate = 'Flow Rate' + ': %{x} <br>' + 'Maximum' + ': %{y:.2r}% <br>' + '<extra></extra>';
    let avgTemplate = 'Flow Rate' + ': %{x} <br>' + 'Average' + ': %{y:.2r}% <br>' + '<extra></extra>';
    
    let showGrid = true;
    return {
      name: 'Achievable Efficiency',
      data: [
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          hovertemplate: maxTemplate,
          line: {
            shape: 'spline',
            color: undefined
          }
        },
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          hovertemplate: avgTemplate,
          line: {
            shape: 'spline',
            color: undefined
          }
        }
      ],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: false,
          type: 'linear',
          showgrid: showGrid,
          title: {
            text: ""
          },
          showticksuffix: 'all',
          tickangle: -60
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: showGrid,
          title: {
            text: "Achievable Efficiency (%)"
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


export interface EfficiencyPoint {
  id: string,
  pairId?: string,
  pointColor?: string;
  pointOutlineColor?: string;
  pointTraceIndex?: number;
  name?: string;
  x: number;
  y: number;
  avgMaxEffColumn?: string;
}

export interface EfficiencyTrace extends TraceData {
  pairId: string,
}