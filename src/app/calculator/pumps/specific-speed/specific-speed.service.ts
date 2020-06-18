import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PsatInputs } from '../../../shared/models/psat';
import { SpecificSpeedInputs } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SelectedDataPoint } from './specific-speed-graph/specific-speed-graph.component';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SpecificSpeedService {
  specificSpeedInputs: SpecificSpeedInputs;
  constructor(private formBuilder: FormBuilder, private convertUnitsService: ConvertUnitsService) { 
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

  getTraceDataFromPoint(selectedPoint: SelectedDataPoint) {
    let hoverTemplate = 'Specific Speed' + ': %{x:.2r} <br>' + 'Efficiency Correction' + ': %{y:.2r}%' + '<extra></extra>';
    let trace = {
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

  getEmptyChart() {
    let hoverTemplate = 'Specific Speed' + ': %{x:.2r} <br>' + 'Efficiency Correction' + ': %{y:.2r}%' + '<extra></extra>';
    let showGrid = false;
    return {
      name: 'Specific Speed',
      data: [
        {
          x: [],
          y: [],
          name: '',
          type: 'scatter',
          showlegend: false,
          hovertemplate: hoverTemplate,
          line: {
            shape: 'spline'
          }
        }
      ],
      layout: {
        // title: {
        //   text: undefined,
        //   font: {
        //     size: 22
        //   }
        // },
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
          showgrid: showGrid,
          title: {
            text: 'Efficiency Correction (%)'
          },
          // overlaying: undefined,
          // titlefont: {
          //   color: undefined
          // },
          // tickfont: {
          //   color: undefined
          // },
          rangemode: 'tozero'
        },
        // yaxis2: {
        //   autorange: true,
        //   type: undefined,
        //   title: {
        //     text: 'Y Axis 2 Label'
        //   },
        //   side: 'right',
        //   overlaying: 'y',
        //   titlefont: {
        //     color: undefined
        //   },
        //   tickfont: {
        //     color: undefined
        //   },
        //   rangemode: 'tozero'
        // },
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


// interface ScatterChart {
//   name?: string,
//   data: [
//     {
//       x: [],
//       y: [],
//       name: '',
//       type: 'scatter',
//       hovertemplate: hoverTemplate,
//       line: {
//         shape: 'spline'
//       },
//       yaxis: undefined,
//     },
//     {
//       x: [],
//       y: [],
//       type: 'scatter',
//       name: 'Initial',
//       hovertemplate: hoverTemplate,
//       yaxis: undefined,
//       mode: 'markers',
//       marker: {
//         color: [],
//         size: 14,
//       }
//     }
//   ],
//   layout: {
//     title: {
//       text: undefined,
//       font: {
//         size: 22
//       }
//     },
//     hovermode: 'closest',
//     annotations: [],
//     xaxis: {
//       autorange: true,
//       type: undefined,
//       showgrid: showGrid,
//       title: {
//         text: 'Specific Speed (U.S.)'
//       },
//       side: undefined,
//       overlaying: undefined,
//       titlefont: {
//         color: undefined
//       },
//       tickfont: {
//         color: undefined
//       }
//     },
//     yaxis: {
//       autorange: true,
//       type: undefined,
//       showgrid: showGrid,
//       title: {
//         text: 'Efficiency Correction (%)'
//       },
//       side: undefined,
//       overlaying: undefined,
//       titlefont: {
//         color: undefined
//       },
//       tickfont: {
//         color: undefined
//       },
//       rangemode: 'tozero'
//     },
//     yaxis2: {
//       autorange: true,
//       type: undefined,
//       title: {
//         text: 'Y Axis 2 Label'
//       },
//       side: 'right',
//       overlaying: 'y',
//       titlefont: {
//         color: undefined
//       },
//       tickfont: {
//         color: undefined
//       },
//       rangemode: 'tozero'
//     },
//     margin: {
//       t: 75,
//       b: 100,
//       l: 100,
//       r: 100
//     }
//   },
//   config: {
//     modeBarButtonsToRemove: ['lasso2d', 'pan2d', 'select2d', 'hoverClosestCartesian', 'toggleSpikelines', 'hoverCompareCartesian'],
//     displaylogo: false,
//     displayModeBar: true,
//     responsive: true
//   }
// };

// interface TraceData {
//     x: Array<number | string>,
//     y: Array<number | string>,
//     type: string,
//     name: string,
//     hovertemplate: string,
//     xaxis?: any,
//     yaxis?: any,
//     mode: string,
//     marker: {
//       color: [],
//       size: 14,
//   }
