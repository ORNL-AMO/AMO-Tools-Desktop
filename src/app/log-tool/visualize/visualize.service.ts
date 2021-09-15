import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import * as _ from 'lodash';
import { LogToolField, GraphObj, AnnotationData } from '../log-tool-models';

@Injectable()
export class VisualizeService {

  visualizeDataInitialized: boolean = false;
  graphObjects: BehaviorSubject<Array<GraphObj>>;
  selectedGraphObj: BehaviorSubject<GraphObj>;
  visualizeData: Array<{ dataField: LogToolField, data: Array<number | string> }>;
  annotateDataPoint: BehaviorSubject<AnnotationData>;
  annotatedDataPoints: BehaviorSubject<Array<AnnotationData>>;
  focusedPanel: BehaviorSubject<string>;
  plotFunctionType: string;
  restyleRanges: BehaviorSubject<{ xMin: number, xMax: number, yMin: number, yMax: number, y2Min: number, y2Max: number }>;
  constructor(private logToolDataService: LogToolDataService) {
    this.initializeService();
  }

  initializeService() {
    this.plotFunctionType = 'react';
    this.focusedPanel = new BehaviorSubject<string>(undefined);
    let initData = this.initGraphObj();
    this.graphObjects = new BehaviorSubject([initData]);
    this.selectedGraphObj = new BehaviorSubject<GraphObj>(initData);
    this.annotateDataPoint = new BehaviorSubject<AnnotationData>(undefined);
    this.annotatedDataPoints = new BehaviorSubject<Array<AnnotationData>>(new Array());
    this.restyleRanges = new BehaviorSubject(undefined);
  }

  getVisualizeData(fieldName: string) {
    let data: Array<number | string>;
    if (fieldName == 'Time Series') {
      //
    } else {
      data = _.find(this.visualizeData, (dataItem) => { return dataItem.dataField.fieldName == fieldName }).data;
    }
    return data;
  }

  getVisualizeDateData(field: LogToolField): Array<number | string> {
    let data: Array<number | string> = _.find(this.visualizeData, (dataItem) => { return dataItem.dataField.csvId == field.csvId && dataItem.dataField.isDateField }).data;
    return data;
  }

  initGraphObj(): GraphObj {
    return {
      name: 'Data Visualization',
      data: [{
        x: [],
        y: [],
        name: '',
        type: 'scattergl',
        mode: 'markers',
        yaxis: undefined,
        marker: {
          color: undefined
        },
        line: {
          color: undefined,
          width: 1
        }
      }],
      layout: {
        title: {
          text: 'Data Visualization 1',
          font: {
            size: 22
          }
        },
        hovermode: 'closest',
        annotations: [],
        xaxis: {
          autorange: true,
          type: undefined,
          title: {
            text: 'X Axis Label'
          },
          side: undefined,
          overlaying: undefined,
          titlefont: {
            color: undefined
          },
          tickfont: {
            color: undefined
          }
        },
        yaxis: {
          autorange: true,
          type: undefined,
          title: {
            text: 'Y Axis Label'
          },
          side: undefined,
          overlaying: undefined,
          titlefont: {
            color: undefined
          },
          tickfont: {
            color: undefined
          },
          rangemode: 'tozero'
        },
        yaxis2: {
          autorange: true,
          type: undefined,
          title: {
            text: 'Y Axis 2 Label'
          },
          side: 'right',
          overlaying: 'y',
          titlefont: {
            color: undefined
          },
          tickfont: {
            color: undefined
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
      isTimeSeries: false,
      selectedXAxisDataOption: { dataField: undefined, data: [] },
      selectedYAxisDataOptions: [],
      hasSecondYAxis: false,
      numberOfBins: undefined,
      bins: undefined,
      binnedField: undefined,
      binningMethod: 'binSize',
      binSize: undefined,
      useStandardDeviation: true,
      usePercentForBins: true,
      graphId: Math.random().toString(36).substr(2, 9),
      xAxisDataOptions: [],
      yAxisDataOptions: []
    }
  }

  resetData() {
    this.initializeService();
    this.visualizeDataInitialized = false;
  }

  addNewGraphDataObj() {
    let currentGraphData: Array<GraphObj> = this.graphObjects.getValue();
    let newGraphDataObj: GraphObj = this.initGraphObj();
    newGraphDataObj.graphId = Math.random().toString(36).substr(2, 9);
    newGraphDataObj.layout.title.text = 'Data Visualization ' + (currentGraphData.length + 1);
    currentGraphData.push(newGraphDataObj);
    this.selectedGraphObj.next(newGraphDataObj);
    this.graphObjects.next(currentGraphData);
  }

  removeGraphDataObj(graphId: string) {
    let currentGraphData: Array<GraphObj> = this.graphObjects.getValue();
    _.remove(currentGraphData, (graphDataObj) => { return graphDataObj.graphId == graphId });
    this.graphObjects.next(currentGraphData);
    this.selectedGraphObj.next(currentGraphData[0]);
  }

  getNumberOfBinsBarChartData(dataField: LogToolField, bins: Array<{ max: number, min: number }>, calculatePercentage: boolean): { xLabels: Array<string>, yValues: Array<number> } {
    let graphData: Array<number> = this.logToolDataService.getAllFieldData(dataField.fieldName);
    let xLabels: Array<string> = new Array();
    let yValues: Array<number> = new Array();
    bins.forEach(bin => {
      let graphDataInRange: Array<number> = _.filter(graphData, (dataItem) => {
        if (dataItem >= bin.min && dataItem < bin.max) {
          return true;
        }
      });
      if (calculatePercentage) {
        let percentOfItemsInBin: number = graphDataInRange.length / graphData.length * 100;
        percentOfItemsInBin = Number(percentOfItemsInBin.toFixed(2));
        yValues.push(percentOfItemsInBin);

      } else {
        yValues.push(graphDataInRange.length);
      }
      let xLabel: string = bin.min.toLocaleString() + ' - ' + bin.max.toLocaleString();
      xLabels.push(xLabel)
    });
    return { xLabels: xLabels, yValues: yValues };
  }

  getStandardDevBarChartData(dataField: LogToolField, calculatePercentage: boolean, binStart: number): { xLabels: Array<string>, yValues: Array<number>, standardDeviation: number, average: number } {
    let graphData: Array<number> = this.logToolDataService.getAllFieldData(dataField.fieldName);
    let graphDataMin: number;
    if (binStart != undefined) {
      graphDataMin = binStart;
    } else {
      graphDataMin = _.min(graphData);
    }
    let graphDataMax: number = _.max(graphData);
    let graphRange: number = graphDataMax - graphDataMin;
    let mean: number = _.mean(graphData);
    let standardDeviation: number = this.calculateStandardDeviation(graphData, mean);
    let numberOfBins: number = graphRange / standardDeviation;
    let xLabels: Array<string> = new Array();
    let yValues: Array<number> = new Array();
    let minValue: number = graphDataMin;
    for (let i = 0; i < numberOfBins; i++) {
      let maxValue: number = Number((minValue + standardDeviation).toFixed(0));
      let graphDataInRange: Array<number> = _.filter(graphData, (dataItem) => {
        if (dataItem >= minValue && dataItem <= maxValue) {
          return true;
        }
      });
      if (calculatePercentage) {
        let percentOfItemsInBin: number = graphDataInRange.length / graphData.length * 100;
        percentOfItemsInBin = Number(percentOfItemsInBin.toFixed(2));
        yValues.push(percentOfItemsInBin);

      } else {
        yValues.push(graphDataInRange.length);
      }
      let xLabel: string = minValue.toLocaleString() + ' - ' + maxValue.toLocaleString();
      xLabels.push(xLabel)
      minValue = Number((minValue + standardDeviation).toFixed(0));
    }
    return { xLabels: xLabels, yValues: yValues, standardDeviation: standardDeviation, average: mean };
  }

  calculateStandardDeviation(graphData: Array<number>, mean: number): number {
    let squareDiffs: Array<number> = _.map(graphData, (dataItem) => {
      let diff: number = dataItem - mean;
      let squareDiff: number = diff * diff;
      return squareDiff;
    });
    _.remove(squareDiffs, (diff) => { return isNaN(diff) == true });
    let averageSquareDiff: number = _.mean(squareDiffs);
    let squareRootOfAverageSquareDiff: number = Math.sqrt(averageSquareDiff);
    return Number(squareRootOfAverageSquareDiff.toFixed(3));
  }

  getAnnotationPoint(x: number | string, y: number | string, yref: string, seriesName: string): AnnotationData {
    let selectedGraphObj: GraphObj = this.selectedGraphObj.getValue();
    let findAnnotation: AnnotationData = selectedGraphObj.layout.annotations.find(annotation => { return (annotation.x == x && annotation.y == y) });
    if (findAnnotation) {
      return findAnnotation;
    } else {
      return {
        x: x,
        y: y,
        text: '',
        showarrow: true,
        font: {
          // family: string,
          size: 16,
          color: '#000000'
        },
        // align: string,
        // arrowhead: number,
        arrowsize: 1,
        // arrowwidth: number,
        arrowcolor: '#000000',
        ax: 0,
        ay: -100,
        // bordercolor: string,
        // borderwidth: number,
        borderpad: 10,
        bgcolor: '#ffffff',
        // opacity: number
        annotationId: Math.random().toString(36).substr(2, 9),
        yref: yref,
        seriesName: seriesName
      }
    }
  }
}
