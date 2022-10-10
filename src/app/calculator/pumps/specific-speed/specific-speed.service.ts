import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { PsatInputs } from '../../../shared/models/psat';
import { SpecificSpeedInputs } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { BehaviorSubject } from 'rxjs';
import { SimpleChart, DataPoint, TraceData } from '../../../shared/models/plotting';

@Injectable()
export class SpecificSpeedService {
  specificSpeedInputs: SpecificSpeedInputs;
  specificSpeedChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<DataPoint>>;
  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) { 
    this.initChartData();
  }

  initForm(settings: Settings): UntypedFormGroup {
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
    let dataPoints = new Array<DataPoint>();
    this.specificSpeedChart = new BehaviorSubject<SimpleChart>(emptyChart);
    this.selectedDataPoints = new BehaviorSubject<Array<DataPoint>>(dataPoints);
  }

  resetForm(settings: Settings): UntypedFormGroup {
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

  initFormFromPsat(psatInputs: PsatInputs): UntypedFormGroup {
    return this.formBuilder.group({
      pumpType: [psatInputs.pump_style, Validators.required],
      pumpRPM: [psatInputs.pump_rated_speed, [Validators.required, Validators.min(0)]],
      flowRate: [psatInputs.flow_rate, [Validators.required, Validators.min(0)]],
      head: [psatInputs.head, [Validators.required, Validators.min(0)]]
    });
  }


  initFormFromObj(obj: SpecificSpeedInputs): UntypedFormGroup {
    return this.formBuilder.group({
      pumpType: [obj.pumpType, Validators.required],
      pumpRPM: [obj.pumpRPM, Validators.required],
      flowRate: [obj.flowRate, Validators.required],
      head: [obj.head, Validators.required]
    });
  }

  getObjFromForm(form: UntypedFormGroup): SpecificSpeedInputs {
    return {
      pumpType: form.controls.pumpType.value,
      pumpRPM: form.controls.pumpRPM.value,
      flowRate: form.controls.flowRate.value,
      head: form.controls.head.value
    };
  }

  getTraceDataFromPoint(selectedPoint: DataPoint): TraceData {
    let hoverTemplate = 'Specific Speed' + ': %{x:.2r} <br>' + 'Efficiency Correction' + ': %{y:.2r}%' + '<extra></extra>';
    let trace: TraceData = {
      x: [selectedPoint.x],
      y: [selectedPoint.y],
      type: 'scatter',
      name: `${selectedPoint.x}, ${selectedPoint.y}`,
      hovertemplate: hoverTemplate,
      mode: 'markers',
      showlegend: false,
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
          },
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
          rangemode: 'tozero',
          tickmode: 'array',
          showticksuffix: 'all'
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: showGrid,
          title: {
            text: 'Efficiency Correction (%)'
          },
          rangemode: 'tozero',
          ticksuffix: '%',
          showticksuffix: 'all'
        },
        margin: {
          t: 25,
          b: 75,
          l: 75,
          r: 25
        }
      },
      config: {
        modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'toggleSpikelines', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
    };
  }
}