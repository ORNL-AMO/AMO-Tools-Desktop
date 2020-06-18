import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PsatInputs } from '../../../shared/models/psat';
import { SpecificSpeedInputs } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { BehaviorSubject } from 'rxjs';
import { SimpleChart, SelectedDataPoint, TraceData } from '../../../shared/models/plotting';

@Injectable()
export class SpecificSpeedService {
  specificSpeedInputs: SpecificSpeedInputs;
  specificSpeedChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<SelectedDataPoint>>;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { 
    this.initChartData();
  }

  initForm(settings: Settings): FormGroup {
    let tmpFlowRate: number = 2000;
    let tmpHead: number = 277;
    if (settings.flowMeasurement !== 'gpm') {
      tmpFlowRate = this.convertUnitsService.value(tmpFlowRate).from('gpm').to(settings.flowMeasurement);
      tmpFlowRate = this.convertUnitsService.roundVal(tmpFlowRate, 2);
    }
    if (settings.distanceMeasurement !== 'ft') {
      tmpHead = this.convertUnitsService.value(tmpHead).from('ft').to(settings.distanceMeasurement);
      tmpHead = this.convertUnitsService.roundVal(tmpHead, 2);
    }
    return this.formBuilder.group({
      pumpType: [0, Validators.required],
      pumpRPM: [1780, [Validators.required, Validators.min(0)]],
      flowRate: [tmpFlowRate, [Validators.required, Validators.min(0)]],
      head: [tmpHead, [Validators.required, Validators.min(0)]],
    });
  }

  initChartData() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    let dataPoints = new Array<SelectedDataPoint>();
    this.specificSpeedChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.selectedDataPoints = new BehaviorSubject<Array<SelectedDataPoint>>(dataPoints);
  }

  resetForm(settings: Settings): FormGroup {
    let tmpFlowRate: number = 0;
    let tmpHead: number = 0;
    if (settings.flowMeasurement !== 'gpm') {
      tmpFlowRate = this.convertUnitsService.value(tmpFlowRate).from('gpm').to(settings.flowMeasurement);
      tmpFlowRate = this.convertUnitsService.roundVal(tmpFlowRate, 2);
    }
    if (settings.distanceMeasurement !== 'ft') {
      tmpHead = this.convertUnitsService.value(tmpHead).from('ft').to(settings.distanceMeasurement);
      tmpHead = this.convertUnitsService.roundVal(tmpHead, 2);
    }
    return this.formBuilder.group({
      pumpType: [0, Validators.required],
      pumpRPM: [0, [Validators.required, Validators.min(0)]],
      flowRate: [tmpFlowRate, [Validators.required, Validators.min(0)]],
      head: [tmpHead, [Validators.required, Validators.min(0)]],
    });
  }

  initFormFromPsat(psatInputs: PsatInputs): FormGroup {
    return this.formBuilder.group({
      pumpType: [psatInputs.pump_style, Validators.required],
      pumpRPM: [psatInputs.pump_rated_speed, [Validators.required, Validators.min(0)]],
      flowRate: [psatInputs.flow_rate, [Validators.required, Validators.min(0)]],
      head: [psatInputs.head, [Validators.required, Validators.min(0)]]
    });
  }


  initFormFromObj(obj: SpecificSpeedInputs): FormGroup {
    return this.formBuilder.group({
      pumpType: [obj.pumpType, Validators.required],
      pumpRPM: [obj.pumpRPM, Validators.required],
      flowRate: [obj.flowRate, Validators.required],
      head: [obj.head, Validators.required]
    });
  }

  getObjFromForm(form: FormGroup): SpecificSpeedInputs {
    return {
      pumpType: form.controls.pumpType.value,
      pumpRPM: form.controls.pumpRPM.value,
      flowRate: form.controls.flowRate.value,
      head: form.controls.head.value
    };
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
      name: 'Specific Speed',
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
        }
      ],
      layout: {
        hovermode: 'closest',
        xaxis: {
          autorange: true,
          type: 'log',
          showgrid: showGrid,
          title: {
            text: 'Specific Speed (U.S.)'
          },
          tickvals: [100, 1000, 10000, 100000],
          tickmode: 'array',
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: showGrid,
          title: {
            text: 'Efficiency Correction (%)'
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