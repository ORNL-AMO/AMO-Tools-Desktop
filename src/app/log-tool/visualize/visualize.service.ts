import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogToolService, LogToolField } from '../log-tool.service';
import { LogToolDataService } from '../log-tool-data.service';
import * as _ from 'lodash';
@Injectable()
export class VisualizeService {


  graphData: BehaviorSubject<Array<GraphDataObj>>;
  selectedGraphData: BehaviorSubject<GraphDataObj>;
  constructor(private logToolService: LogToolService, private logToolDataService: LogToolDataService) {
    let initGraphData: GraphDataObj = this.getNewGraphDataObject();
    this.selectedGraphData = new BehaviorSubject<GraphDataObj>(initGraphData);
    this.graphData = new BehaviorSubject([initGraphData]);
  }

  addNewGraphDataObj() {
    let currentGraphData: Array<GraphDataObj> = this.graphData.getValue();
    let newGraphDataObj: GraphDataObj = this.getNewGraphDataObject();
    currentGraphData.push(newGraphDataObj);
    this.graphData.next(currentGraphData);
    this.selectedGraphData.next(newGraphDataObj);
  }

  getNewGraphDataObject(): GraphDataObj {
    console.time('getNewGraphDataObj')
    let selectedYDataField: LogToolField = this.logToolService.fields.find((field) => { return field.fieldName != this.logToolService.dateField });
    let yData: Array<number> = this.logToolDataService.getAllFieldData(selectedYDataField.fieldName);
    let selectedXDataField: LogToolField;
    if (this.logToolService.dateField != undefined) {
      selectedXDataField = this.logToolService.fields.find((field) => { return field.fieldName == this.logToolService.dateField });
    } else {
      selectedXDataField = this.logToolService.fields.find((field) => { return field.fieldName != this.logToolService.dateField || field.fieldName != selectedYDataField.fieldName });
    }
    let xData: Array<number> = this.logToolDataService.getAllFieldData(selectedXDataField.fieldName);
    console.time('histogramData');
    let histogramData: { xLabels: Array<string>, yValues: Array<number>, standardDeviation: number, average: number } = this.getStandardDevBarChartData(selectedYDataField);
    console.timeEnd('histogramData')
    console.timeEnd('getNewGraphDataObj');
    return {
      graphType: { label: 'Scatter Plot', value: 'scatter' },
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
    let yData: Array<number> = this.logToolDataService.getAllFieldData(dataField.fieldName);
    currentSelectedGraphData.xData = yData;
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

  updateUseStandardDeviation(useStandardDeviation: boolean) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    currentSelectedGraphData.useStandardDeviation = useStandardDeviation;
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  getHistogramData(): { xLabels: Array<string>, yValues: Array<number> } {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    if (currentSelectedGraphData.useStandardDeviation == true) {
      //get bin data using standard deviation
      return this.getStandardDevBarChartData(currentSelectedGraphData.histogramDataField);
    } else {
      //get bin data using number of bins
    }
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

    let averageSquareDiff: number = _.mean(squareDiffs);
    let squareRootOfAverageSquareDiff: number = Math.sqrt(averageSquareDiff);
    return squareRootOfAverageSquareDiff;
  }
}



export interface GraphDataObj {
  graphType: { label: string, value: string },
  scatterPlotMode: string,
  selectedXDataField: LogToolField,
  xData: Array<number>,
  selectedYDataField: LogToolField,
  yData: Array<number>,
  graphName: string,
  graphId: string;
  useStandardDeviation: boolean;
  numberOfBins: number;
  histogramDataField: LogToolField;
  histogramData: {
    xLabels: Array<string>,
    yValues: Array<number>,
    standardDeviation: number,
    average: number
  }
}