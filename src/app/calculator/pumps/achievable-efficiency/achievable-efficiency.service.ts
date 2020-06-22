import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SimpleChart, SelectedDataPoint, TraceData } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AchievableEfficiencyService {

  pumpType: number;
  flowRate: number;
  efficiencyChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<SelectedDataPoint>>;
  constructor(private formBuilder: FormBuilder) {
    this.initChartData();

   }

   initChartData() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    let dataPoints = new Array<SelectedDataPoint>();
    this.efficiencyChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.selectedDataPoints = new BehaviorSubject<Array<SelectedDataPoint>>(dataPoints);
  }


  getForm(pumpType: number, flowRate: number): FormGroup {
    let form: FormGroup = this.formBuilder.group({
      pumpType: [pumpType, Validators.required],
      flowRate: [flowRate, [Validators.required, Validators.min(0)]]
    });
    if (form.controls.flowRate.value) {
      form.controls.flowRate.markAsDirty();
    }
    return form;
  }

  getTraceDataFromPoint(selectedPoint: SelectedDataPoint): TraceData {
    let hoverTemplate = 'Specific Speed' + ': %{x:.2r} <br>' + 'Efficiency Correction' + ': %{y:.2r}%' + '<extra></extra>';
    let trace: TraceData = {
      x: [selectedPoint.pointX],
      y: [selectedPoint.pointY],
      type: 'scatter',
      name: `${selectedPoint.pointX}, ${selectedPoint.pointY}`,
      hovertemplate: hoverTemplate,
      mode: 'markers',
      marker: {
        color: selectedPoint.pointColor,
        size: 14,
      },
    };
    return trace;
  }

  getEmptyChart(): SimpleChart {
    let hoverTemplate = 'Specific Speed' + ': %{x:.2r} <br>' + 'Efficiency Correction' + ': %{y:.2r}%' + '<extra></extra>';
    let showGrid = true;
    return {
      name: 'AchievableEfficiency',
      data: [
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          hovertemplate: hoverTemplate,
          line: {
            shape: 'spline'
          }
        },
        {
          x: [],
          y: [],
          name: '',
          showlegend: false,
          type: 'scatter',
          hovertemplate: hoverTemplate,
          line: {
            shape: 'spline'
          }
        }
      ],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: true,
          type: 'log',
          showgrid: showGrid,
          title: {
            text: ""
          },
          tickvals: [100, 1000, 10000, 100000],
          tickmode: 'array',
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: showGrid,
          title: {
            text: "Achievable Efficiency (%)"
          },
          rangemode: 'tozero'
        },
        margin: {
          t: 75,
          b: 100,
          l: 100,
          r: 100
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
