import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { LogToolField, GraphObj, AnnotationData, GraphDataOption } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';

@Injectable()
export class VisualizeService {

  visualizeDataInitialized: boolean = false;
  graphObjects: BehaviorSubject<Array<GraphObj>>;
  selectedGraphObj: BehaviorSubject<GraphObj>;
  userInputDelay: BehaviorSubject<number>;
  visualizeData: Array<GraphDataOption>;
  annotateDataPoint: BehaviorSubject<AnnotationData>;
  userGraphOptions: BehaviorSubject<GraphObj>;
  tabSelect: BehaviorSubject<string>;
  focusedPanel: BehaviorSubject<string>;
  plotFunctionType: string;
  restyleRanges: BehaviorSubject<{ xMin: number, xMax: number, yMin: number, yMax: number, y2Min: number, y2Max: number }>;
  constructor(private logToolService: LogToolService) {
    this.initializeService();
  }

  initializeService() {
    this.focusedPanel = new BehaviorSubject<string>(undefined);
    this.userInputDelay = new BehaviorSubject<number>(0);
    let initData = this.initGraphObj();
    this.graphObjects = new BehaviorSubject([initData]);
    this.selectedGraphObj = new BehaviorSubject<GraphObj>(initData);
    this.userGraphOptions = new BehaviorSubject<GraphObj>(undefined);
    this.annotateDataPoint = new BehaviorSubject<AnnotationData>(undefined);
    this.restyleRanges = new BehaviorSubject(undefined);
    this.tabSelect = new BehaviorSubject(undefined);
  }

  buildGraphData() {
    this.visualizeDataInitialized = true;
    this.visualizeData = new Array();
    let graphAxisOptions = this.getDataFieldOptionsWithDate();
    graphAxisOptions.forEach(field => {
      let data = this.getAxisOptionGraphData(field.fieldName);
      this.visualizeData.push({
        data: data,
        numberOfDataPoints: data.length,
        dataField: field
      });
    });
  }

  displayAnnotationHelp() {
    this.tabSelect.next('help');
    this.focusedPanel.next('highlight-performance-info');
  }

  displayTimeSeriesHelp() {
    this.tabSelect.next('help');
    this.focusedPanel.next('highlight-timeseries-info');
  }

  getDataFieldOptions(): Array<LogToolField> {
    //non date and used fields
    let tmpFields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    _.remove(tmpFields, (field) => { return field.useField == false || field.isDateField == true });
    return tmpFields;
  }

  // field == axis
  getDataFieldOptionsWithDate() {
    let tmpFields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    _.remove(tmpFields, (field) => { return field.useField == false });
    return tmpFields;
  }

  // field == axis
  getAxisOptionGraphData(fieldName: string): Array<number> {
    let data: Array<any> = new Array();
    this.logToolService.individualDataFromCsv.forEach(individualDataItem => {
      let foundData = individualDataItem.csvImportData.meta.fields.find(field => { return field == fieldName });
      if (foundData) {
        data = _.concat(data, individualDataItem.csvImportData.data);
      }
    });

    let mappedValues: Array<any> = _.mapValues(data, (dataItem) => { return dataItem[fieldName] });
    let valueArr = _.values(mappedValues);
    return valueArr;
  }

  getGraphData(fieldName: string) {
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

  setDefaultGraphInteractivity(graphObj: GraphObj, dataPoints: number) {
    graphObj.graphInteractivity.hasLargeDataset = dataPoints > 200000;
    graphObj.graphInteractivity.showUserToggledPerformanceWarning = false;

    if (graphObj.graphInteractivity.hasLargeDataset) {
      graphObj.graphInteractivity.showDefaultPerformanceWarning = true;
      graphObj.graphInteractivity.isGraphInteractive = false;
      
      let userGraphObj: GraphObj = this.userGraphOptions.getValue();
      if (userGraphObj) {
        userGraphObj.graphInteractivity.showDefaultPerformanceWarning = true;
        userGraphObj.graphInteractivity.isGraphInteractive = false;
        this.userGraphOptions.next(userGraphObj);
      }
    }


    return graphObj;
  }

  setCustomGraphInteractivity(graphObj: GraphObj, dataPoints: number) {
    graphObj.graphInteractivity.hasLargeDataset = dataPoints > 200000;
    graphObj.graphInteractivity.showUserToggledPerformanceWarning = false;

    if (graphObj.graphInteractivity.hasLargeDataset) {
      if (graphObj.graphInteractivity.isGraphInteractive) {
          graphObj.graphInteractivity.showUserToggledPerformanceWarning = true;
          graphObj.graphInteractivity.showDefaultPerformanceWarning = false;
      } else if (!graphObj.graphInteractivity.isGraphInteractive) {
        graphObj.graphInteractivity.showUserToggledPerformanceWarning = false;
      }
    }

    return graphObj;
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
        hovermode: false,
        dragmode: false,
        annotations: [],
        xaxis: {
          autorange: true,
          type: undefined,
          // spikemode: 'across',
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
          r: 50
        }
      },
      mode: {
        modeBarButtonsToRemove: ['lasso2d'],
        // plotGlPixelRatio: 3,
        responsive: true,
        displaylogo: false,
        displayModeBar: true
      },
      graphInteractivity: {
        isGraphInteractive: true,
        showDefaultPerformanceWarning: false,
      },
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

  saveUserOptionsChanges() {
    let selectedGraphObj = this.selectedGraphObj.getValue();
    let userGraphObj = this.userGraphOptions.getValue();
    if (selectedGraphObj && userGraphObj) {
      selectedGraphObj.graphInteractivity = userGraphObj.graphInteractivity;
      selectedGraphObj.layout = userGraphObj.layout;
      // restore original zoom/range
      selectedGraphObj.layout.autosize = true;
      this.selectedGraphObj.next(selectedGraphObj);
    }
  }


  addNewGraphDataObj() {
    let currentGraphData: Array<GraphObj> = this.graphObjects.getValue();
    let newGraphDataObj: GraphObj = this.initGraphObj();
    newGraphDataObj.graphId = Math.random().toString(36).substr(2, 9);
    newGraphDataObj.layout.title.text = 'Data Visualization ' + (currentGraphData.length + 1);
    currentGraphData.push(newGraphDataObj);
    this.selectedGraphObj.next(newGraphDataObj);
    this.userGraphOptions.next(newGraphDataObj);
    this.graphObjects.next(currentGraphData);
  }

  removeGraphDataObj(graphId: string) {
    let currentGraphData: Array<GraphObj> = this.graphObjects.getValue();
    _.remove(currentGraphData, (graphDataObj) => { return graphDataObj.graphId == graphId });
    this.graphObjects.next(currentGraphData);
    this.selectedGraphObj.next(currentGraphData[0]);
  }

  getNumberOfBinsBarChartData(dataField: LogToolField, bins: Array<{ max: number, min: number }>, calculatePercentage: boolean): { xLabels: Array<string>, yValues: Array<number> } {
    let graphData: Array<number> = this.getAxisOptionGraphData(dataField.fieldName);
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
    let graphData: Array<number> = this.getAxisOptionGraphData(dataField.fieldName);
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
