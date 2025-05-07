import { Injectable } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { SimpleChart, TraceData } from '../../../shared/models/plotting';
import { BehaviorSubject } from 'rxjs';
import { getNewIdString } from '../../../shared/helperFunctions';
import { PSAT } from '../../../shared/models/psat';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class AchievableEfficiencyService {

  pumpType: number;
  flowRate: number;
  pumpEfficiencyInputs: PumpEfficiencyInputs;
  efficiencyChart: BehaviorSubject<SimpleChart>;
  selectedDataPoints: BehaviorSubject<Array<EfficiencyPoint>>;
  dataPointTraces: BehaviorSubject<Array<EfficiencyTrace>>;

  constructor(private formBuilder: UntypedFormBuilder, private convertUnitsService: ConvertUnitsService) {
    this.initChartData();
  }

  initChartData() {
    this.efficiencyChart = new BehaviorSubject<SimpleChart>(this.getEmptyChart());
    this.selectedDataPoints = new BehaviorSubject<Array<EfficiencyPoint>>([]);
    this.dataPointTraces = new BehaviorSubject<Array<EfficiencyTrace>>([]);
  }


  getFormFromObj(pumpEfficiencyInputs: PumpEfficiencyInputs): UntypedFormGroup {
    let form: UntypedFormGroup = this.formBuilder.group({
      pumpType: [pumpEfficiencyInputs.pumpType, Validators.required],
      flowRate: [pumpEfficiencyInputs.flowRate, [Validators.required, Validators.min(0)]],
      rpm: [pumpEfficiencyInputs.rpm, Validators.required],
      kinematicViscosity: [pumpEfficiencyInputs.kinematicViscosity, Validators.required],
      stageCount: [pumpEfficiencyInputs.stageCount, Validators.required],
      head: [pumpEfficiencyInputs.head, Validators.required],
      pumpEfficiency: [pumpEfficiencyInputs.pumpEfficiency, Validators.required],
    });
    if (form.controls.flowRate.value) {
      form.controls.flowRate.markAsDirty();
    }
    return form;
  }

  getObjectFromForm(form: UntypedFormGroup): PumpEfficiencyInputs {
    let obj: PumpEfficiencyInputs = {
      pumpType: form.controls.pumpType.value,
      flowRate: form.controls.flowRate.value,
      rpm: form.controls.rpm.value,
      kinematicViscosity: form.controls.kinematicViscosity.value,
      stageCount: form.controls.stageCount.value,
      head: form.controls.head.value,
      pumpEfficiency: form.controls.pumpEfficiency.value,
    };
    return obj;
  }

  getFormFromPSAT(psat: PSAT, settings: Settings): UntypedFormGroup {
    let pumpEfficiency: number = 90;
    if (psat.outputs) {
      if (psat.outputs.pump_efficiency) {
        pumpEfficiency = psat.outputs.pump_efficiency;
      } 
    }

    let flowRate: number = 2000;
    if (settings.flowMeasurement !== 'gpm') {
      flowRate = Math.round(this.convertUnitsService.value(flowRate).from('gpm').to(settings.flowMeasurement) * 100) / 100;
    }
    if (psat.inputs.flow_rate) {
      flowRate = psat.inputs.flow_rate;
    } 

    let head: number = 137;
    if (settings.distanceMeasurement !== 'ft') {
      head = Math.round(this.convertUnitsService.value(head).from('ft').to(settings.distanceMeasurement) * 100) / 100;
    }
    if (psat.inputs.head) {
      head = psat.inputs.head;
    } 

    let form: UntypedFormGroup = this.formBuilder.group({
      pumpType: [psat.inputs.pump_style, Validators.required],
      flowRate: [flowRate, [Validators.required, Validators.min(0)]],
      rpm: [psat.inputs.pump_rated_speed, Validators.required],
      kinematicViscosity: [psat.inputs.kinematic_viscosity, Validators.required],
      stageCount: [psat.inputs.stages, Validators.required],
      head: [head, Validators.required],
      pumpEfficiency: [pumpEfficiency, Validators.required],
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

export interface PumpEfficiencyInputs {
  pumpType: number;
  flowRate: number;
  rpm: number;
  kinematicViscosity: number;
  stageCount: number;
  head: number;
  pumpEfficiency: number;
}