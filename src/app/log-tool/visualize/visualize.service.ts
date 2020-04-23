import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogToolService } from '../log-tool.service';
import { LogToolDataService } from '../log-tool-data.service';
import * as _ from 'lodash';
import { GraphDataObj, LogToolField, GraphObj, AnnotationData } from '../log-tool-models';

@Injectable()
export class VisualizeService {


  // graphData: BehaviorSubject<Array<GraphDataObj>>;
  // selectedGraphData: BehaviorSubject<GraphDataObj>;
  visualizeDataInitialized: boolean = false;

  graphObjects: BehaviorSubject<Array<GraphObj>>;
  selectedGraphObj: BehaviorSubject<GraphObj>;

  visualizeData: Array<{ dataField: LogToolField, data: Array<number | string> }>;

  annotateDataPoint: BehaviorSubject<AnnotationData>;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService) {
    // this.selectedGraphData = new BehaviorSubject<GraphDataObj>(undefined);
    // this.graphData = new BehaviorSubject(new Array());
    let initData = this.initGraphObj();
    this.graphObjects = new BehaviorSubject([initData]);
    this.selectedGraphObj = new BehaviorSubject<GraphObj>(initData);
    this.annotateDataPoint = new BehaviorSubject<AnnotationData>(undefined);
  }

  getVisualizeData(fieldName: string) {
    let data: Array<number | string> = _.find(this.visualizeData, (dataItem) => { return dataItem.dataField.fieldName == fieldName }).data;
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
        mode: 'line+markers',
        yaxis: undefined,
        marker: {
          color: undefined
        }
      }],
      layout: {
        title: {
          text: 'Data Visualization 1'
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
          }
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
          }
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
      numberOfBins: 5,
      useStandardDeviation: true,
      graphId: Math.random().toString(36).substr(2, 9),
      xAxisDataOptions: [],
      yAxisDataOptions: []
    }
  }


  resetData() {
    // this.graphData.next(new Array());
    // this.selectedGraphData.next(undefined);
    this.visualizeDataInitialized = false;
  }

  addNewGraphDataObj() {
    let currentGraphData: Array<GraphObj> = this.graphObjects.getValue();
    let newGraphDataObj: GraphObj = JSON.parse(JSON.stringify(this.selectedGraphObj.getValue()));
    newGraphDataObj.graphId = Math.random().toString(36).substr(2, 9);
    newGraphDataObj.layout.title.text = 'Data Visualization ' + (currentGraphData.length + 1);
    currentGraphData.push(newGraphDataObj);
    this.selectedGraphObj.next(newGraphDataObj);
    this.graphObjects.next(currentGraphData);
  }

  getNewGraphDataObject(): GraphDataObj {
    let fields: Array<LogToolField> = this.logToolDataService.getDataFieldOptionsWithDate();
    let selectedYDataField: LogToolField
    let selectedXDataField: LogToolField;
    let noDayTypeAnalysis: boolean = this.logToolService.noDayTypeAnalysis.getValue();
    if (noDayTypeAnalysis == false) {
      selectedXDataField = fields.find((field) => { return this.logToolService.dateFields.find((dateField) => { return dateField == field.fieldName }) });
      selectedYDataField = fields.find((field) => { return this.logToolService.dateFields.find((dateField) => { return dateField == field.fieldName }) == undefined });
    } else {
      selectedYDataField = fields[0];
      selectedXDataField = fields.find((field) => { return field.fieldName != selectedYDataField.fieldName });
    }
    let yData: Array<number | Date> = this.logToolDataService.getAllFieldData(selectedYDataField.fieldName);
    let xData: Array<number | Date> = this.logToolDataService.getAllFieldData(selectedXDataField.fieldName);
    let histogramData: { xLabels: Array<string>, yValues: Array<number>, standardDeviation: number, average: number } = this.getStandardDevBarChartData(selectedYDataField);
    return {
      graphType: { label: 'Scatter Plot', value: 'scattergl' },
      selectedXDataField: selectedXDataField,
      xData: xData,
      selectedYDataField: selectedYDataField,
      yData: yData,
      graphName: 'New Graph',
      graphId: Math.random().toString(36).substr(2, 9),
      scatterPlotMode: 'markers',
      useStandardDeviation: true,
      numberOfBins: 5,
      histogramDataField: selectedYDataField,
      histogramData: histogramData
    }
  }

  removeGraphDataObj(graphId: string) {
    let currentGraphData: Array<GraphObj> = this.graphObjects.getValue();
    // currentGraphData.splice(removeIndex, 1);
    _.remove(currentGraphData, (graphDataObj) => { return graphDataObj.graphId == graphId });
    this.graphObjects.next(currentGraphData);
    this.selectedGraphObj.next(currentGraphData[0]);
  }

  getNumberOfBinsBarChartData(dataField: LogToolField, numberOfBins: number): { xLabels: Array<string>, yValues: Array<number>, standardDeviation: number, average: number } {
    let graphData: Array<number> = this.logToolDataService.getAllFieldData(dataField.fieldName);
    let graphDataMin: number = _.min(graphData);
    let graphDataMax: number = _.max(graphData);
    let graphRange: number = graphDataMax - graphDataMin;
    let mean: number = _.mean(graphData);
    // let numberOfBins: number = graphRange / standardDeviation;
    let sizeOfBins: number = graphRange / numberOfBins;
    let xLabels: Array<string> = new Array();
    let yValues: Array<number> = new Array();
    let minValue: number = graphDataMin;
    for (let i = 0; i < numberOfBins; i++) {
      let maxValue: number = Number((minValue + sizeOfBins).toFixed(2));
      let graphDataInRange: Array<number> = _.filter(graphData, (dataItem) => {
        if (dataItem >= minValue && dataItem <= maxValue) {
          return true;
        }
      });
      let numberOfItemsInBin: number = graphDataInRange.length;
      let xLabel: string = minValue + ' - ' + maxValue;
      xLabels.push(xLabel)
      yValues.push(numberOfItemsInBin);
      minValue = Number((minValue + sizeOfBins).toFixed(2));
    }
    return { xLabels: xLabels, yValues: yValues, standardDeviation: 0, average: mean };
  }

  getStandardDevBarChartData(dataField: LogToolField): { xLabels: Array<string>, yValues: Array<number>, standardDeviation: number, average: number } {
    let graphData: Array<number> = this.logToolDataService.getAllFieldData(dataField.fieldName);
    let graphDataMin: number = _.min(graphData);
    let graphDataMax: number = _.max(graphData);
    let graphRange: number = graphDataMax - graphDataMin;
    let mean: number = _.mean(graphData);
    let standardDeviation: number = this.calculateStandardDeviation(graphData, mean);
    let numberOfBins: number = graphRange / standardDeviation;
    let xLabels: Array<string> = new Array();
    let yValues: Array<number> = new Array();
    let minValue: number = graphDataMin;
    for (let i = 0; i < numberOfBins; i++) {
      let maxValue: number = Number((minValue + standardDeviation).toFixed(2));
      let graphDataInRange: Array<number> = _.filter(graphData, (dataItem) => {
        if (dataItem >= minValue && dataItem <= maxValue) {
          return true;
        }
      });
      let numberOfItemsInBin: number = graphDataInRange.length;
      let xLabel: string = minValue + ' - ' + maxValue;
      xLabels.push(xLabel)
      yValues.push(numberOfItemsInBin);
      minValue = Number((minValue + standardDeviation).toFixed(2));
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
    return squareRootOfAverageSquareDiff;
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
