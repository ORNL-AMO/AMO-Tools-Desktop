import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogToolService } from '../log-tool.service';
import { LogToolDataService } from '../log-tool-data.service';
import * as _ from 'lodash';
import { GraphDataObj, LogToolField, GraphObj } from '../log-tool-models';

@Injectable()
export class VisualizeService {


  graphData: BehaviorSubject<Array<GraphDataObj>>;
  selectedGraphData: BehaviorSubject<GraphDataObj>;
  visualizeDataInitialized: boolean = false;

  graphObjects: BehaviorSubject<Array<GraphObj>>;
  selectedGraphObj: BehaviorSubject<GraphObj>;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService) {
    this.selectedGraphData = new BehaviorSubject<GraphDataObj>(undefined);
    this.graphData = new BehaviorSubject(new Array());
    let initData = this.initGraphObj();
    this.graphObjects = new BehaviorSubject([initData]);
    this.selectedGraphObj = new BehaviorSubject<GraphObj>(initData);
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
        }
      }],
      layout: {
        title: {
          text: 'Data Visualization 1'
        },
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
      graphId: Math.random().toString(36).substr(2, 9)
    }
  }


  resetData() {
    this.graphData.next(new Array());
    this.selectedGraphData.next(undefined);
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

  removeGraphDataObj(removeIndex: number) {
    let currentGraphData: Array<GraphDataObj> = this.graphData.getValue();
    currentGraphData.splice(removeIndex, 1);
    this.graphData.next(currentGraphData);
  }

  updateSelectedYDataField(dataField: LogToolField) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    let yData: Array<number> = this.logToolDataService.getAllFieldData(dataField.fieldName);
    currentSelectedGraphData.yData = yData;
    currentSelectedGraphData.selectedYDataField = dataField;
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  updateSelectedXDataField(dataField: LogToolField) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    let xData: Array<number> = this.logToolDataService.getAllFieldData(dataField.fieldName);
    currentSelectedGraphData.xData = xData;
    currentSelectedGraphData.selectedXDataField = dataField;
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  updateGraphType(newGraphType: { label: string, value: string }) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    currentSelectedGraphData.graphType = newGraphType;
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  updateAllGraphItems(currentSelectedGraphData: GraphDataObj) {
    let currentAllGraphData: Array<GraphDataObj> = this.graphData.getValue();
    let updatedGraphDataIndex: number = currentAllGraphData.findIndex(dataObj => { return dataObj.graphId == currentSelectedGraphData.graphId });
    currentAllGraphData[updatedGraphDataIndex] = currentSelectedGraphData;
    this.graphData.next(currentAllGraphData);
  }

  updateGraphScatterPlotMode(str: string) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    currentSelectedGraphData.scatterPlotMode = str;
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }


  //HISTOGRAM
  updateSelectedHistogramDataField(dataField: LogToolField) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    currentSelectedGraphData.histogramDataField = dataField;
    currentSelectedGraphData.histogramData = this.getHistogramData();
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  updateUseStandardDeviation(useStandardDeviation: boolean) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    currentSelectedGraphData.useStandardDeviation = useStandardDeviation;
    currentSelectedGraphData.histogramData = this.getHistogramData();
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  updateNumberOfBins(numberOfBins: number) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    currentSelectedGraphData.numberOfBins = numberOfBins;
    currentSelectedGraphData.histogramData = this.getHistogramData();
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  getHistogramData(): { xLabels: Array<string>, yValues: Array<number>, standardDeviation: number, average: number } {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    if (currentSelectedGraphData.useStandardDeviation == true) {
      //get bin data using standard deviation
      return this.getStandardDevBarChartData(currentSelectedGraphData.histogramDataField);
    } else {
      //get bin data using number of bins
      return this.getNumberOfBinsBarChartData(currentSelectedGraphData.histogramDataField, currentSelectedGraphData.numberOfBins);
    }
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
}
