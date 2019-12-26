import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LogToolService, LogToolField } from '../log-tool.service';

@Injectable()
export class VisualizeService {


  graphData: BehaviorSubject<Array<GraphDataObj>>;
  selectedGraphData: BehaviorSubject<GraphDataObj>;
  constructor(private logToolService: LogToolService) {
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
    let selectedYDataField: LogToolField = this.logToolService.fields.find((field) => { return field.fieldName != this.logToolService.dateField });
    let yData: Array<number> = this.logToolService.getAllFieldData(selectedYDataField.fieldName);
    let selectedXDataField: LogToolField;
    if (this.logToolService.dateField != undefined) {
      selectedXDataField = this.logToolService.fields.find((field) => { return field.fieldName == this.logToolService.dateField });
    } else {
      selectedXDataField = this.logToolService.fields.find((field) => { return field.fieldName != this.logToolService.dateField || field.fieldName != selectedYDataField.fieldName });
    }
    let xData: Array<number> = this.logToolService.getAllFieldData(selectedXDataField.fieldName);
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
      numberOfBins: 5
    }
  }

  removeGraphDataObj(removeIndex: number) {
    let currentGraphData: Array<GraphDataObj> = this.graphData.getValue();
    currentGraphData.splice(removeIndex, 1);
    this.graphData.next(currentGraphData);
  }

  updateSelectedYDataField(dataField: LogToolField) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    let yData: Array<number> = this.logToolService.getAllFieldData(dataField.fieldName);
    currentSelectedGraphData.yData = yData;
    currentSelectedGraphData.selectedYDataField = dataField;
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
  }

  updateSelectedXDataField(dataField: LogToolField) {
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    let yData: Array<number> = this.logToolService.getAllFieldData(dataField.fieldName);
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

  updateUseStandardDeviation(useStandardDeviation: boolean){
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();
    currentSelectedGraphData.useStandardDeviation = useStandardDeviation;
    this.selectedGraphData.next(currentSelectedGraphData);
    this.updateAllGraphItems(currentSelectedGraphData);
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
}