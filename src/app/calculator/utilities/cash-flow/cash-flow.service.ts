import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CashFlowForm } from './cash-flow';
import { TraceData, SimpleChart } from '../../../shared/models/plotting';

@Injectable()
export class CashFlowService {

  calculate: BehaviorSubject<boolean>;
  inputData: CashFlowForm;
  constructor() { 
    this.calculate = new BehaviorSubject<boolean>(true);
  }

  getTrace(name: string, data: Array<number>, years: Array<number>): TraceData {
    let trace = {
      x: years,
      y: data,
      type: 'bar',
      name: name,
      hovertemplate:  `$%{y:.2r}`,
      showlegend: true,
    };

    return trace;
  }

  getEmptyChart(): SimpleChart {
    return {
      name: 'Cash Flow',
      data: [],
      layout: {
        hovermode: 'closest',
        barmode: 'relative',
        legend: {
          orientation: 'h',
        },
        xaxis: {
          autorange: true,
          type: 'auto',
          showgrid: false,
          showticksuffix: ''
        },
        yaxis: {
          autorange: true,
          type: 'auto',
          showgrid: false,
          showticksuffix: '',
          title: {
            text: 'Cost USD (thousands)'
          },
        },
        margin: {
          t: 25,
          b: 75,
          l: 75,
          r: 25
        }
      },
      config: {
        modeBarButtonsToRemove: ['autoScale2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
        displaylogo: false,
        displayModeBar: true,
        responsive: true
      },
    };
  }
}


export interface Expense {
  name: string,
  data: Array<number>
};