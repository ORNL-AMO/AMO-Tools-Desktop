import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { SimpleChart, DataPoint, TraceData } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AchievableEfficiencyService {

  pumpType: number;
  flowRate: number;
  efficiencyChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<DataPoint>>;
  // selectedDataPoints: BehaviorSubject<Array<SelectedDataPoint>>;
  
  constructor(private formBuilder: UntypedFormBuilder) {
    this.initChartData();
   }

   initChartData() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    let dataPoints = new Array<DataPoint>();
    this.efficiencyChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.selectedDataPoints = new BehaviorSubject<Array<DataPoint>>(dataPoints);
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

  getTraceDataFromPoint(selectedPoint: DataPoint): TraceData {
    let trace: TraceData = {
      x: [selectedPoint.x],
      y: [selectedPoint.y],
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
