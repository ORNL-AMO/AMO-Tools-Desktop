import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SimpleChart, TraceCoordinates, TraceData } from '../../../shared/models/plotting';
import { StatePointAnalysisResults } from '../../../shared/models/waste-water';

@Injectable()
export class StatePointAnalysisGraphService {
  spaGraph: BehaviorSubject<SimpleChart>;
  
  constructor() {
    this.initChart();
  }

   initChart() {
    let emptyChart: SimpleChart = this.getEmptyChart();
    this.spaGraph = new BehaviorSubject<SimpleChart>(emptyChart);
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
      },
      mode: 'lines'
    };
    return trace;
  }

  getCoordinatePairs(graphData: {data: Array<StatePointAnalysisResults>, sviParameterName: string}): TraceCoordinates {
    let coordinates = {x: [], y: []};
    if(graphData.data[0].graphData) {
      graphData.data[0].graphData.forEach((pair: Array<number>) => {
        coordinates.x.push(pair[0]);
        coordinates.y.push(pair[1]);
      });
    }
    
    return coordinates;
  }

  buildCoordinatesFromPoints(point1: Array<number>, point2: Array<number>) {
    let coordinates = {x: [], y: []};

    let slope = (point2[1] - point1[1]) / (point2[0] - point1[0]);
    let intercept = point1[1] - slope * point1[0];
    let validPoints = !isNaN(point1[0]) && !isNaN(point1[1]) && !isNaN(point2[0]) && !isNaN(point2[1])
                    && isFinite(point1[0]) && isFinite(point1[1]) && isFinite(point2[0]) && isFinite(point2[1]);
    if (validPoints) {
      let increment = point2[0] != 0? point2[0] / 100 : .5;
      for (let x = point1[0]; x <= point2[0]; x += increment) {
        let y = slope * x + intercept;
        coordinates.x.push(x);
        coordinates.y.push(y);
      }
    }

    return coordinates;
  }

  getEmptyChart(): SimpleChart {
    return {
      name: 'State Point Analysis',
      data: [],
      layout: {
        legend: {
          orientation: 'h',
          font: {
            size: 12,
          },
          x: 0,
          y: -.50
        },
        hovermode: 'closest',
        xaxis: {
          autorange: true,
          showgrid: true,
          title: {
            text: "Solids Concentration (g/L)"
          },
          showticksuffix: 'all',
          hoverformat: '%{x}%',
        },
        yaxis: {
          autorange: true,
          type: 'linear',
          showgrid: true,
          title: {
            text: `Solids Flux (lb/ft<sup>2</sup>d)`
          },
          rangemode: 'tozero',
          showticksuffix: 'all'
        },
        margin: {
          t: 50,
          b: 100,
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