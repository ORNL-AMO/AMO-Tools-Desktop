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
      graphType: 'scatter',
      selectedXDataField: selectedXDataField,
      xData: xData,
      selectedYDataField: selectedYDataField,
      yData: yData,
      graphName: 'New Graph'
    }
  }

  removeGraphDataObj(removeIndex: number) {
    let currentGraphData: Array<GraphDataObj> = this.graphData.getValue();
    currentGraphData.splice(removeIndex, 1);
    this.graphData.next(currentGraphData);
  }

  updateSelectedYDataField(dataField: LogToolField){

    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();    
    let yData: Array<number> = this.logToolService.getAllFieldData(dataField.fieldName);
    currentSelectedGraphData.yData = yData;
    currentSelectedGraphData.selectedYDataField = dataField;
    
    let currentAllGraphData: Array<GraphDataObj> = this.graphData.getValue();
    let updatedGraphDataIndex: number = currentAllGraphData.findIndex(dataObj => {return dataObj.graphName == dataField.fieldName});
    currentAllGraphData[updatedGraphDataIndex] = currentSelectedGraphData;
    
    this.selectedGraphData.next(currentSelectedGraphData);
    this.graphData.next(currentAllGraphData);
  }

  updateSelectedXDataField(dataField: LogToolField){
    
    let currentSelectedGraphData: GraphDataObj = this.selectedGraphData.getValue();    
    let yData: Array<number> = this.logToolService.getAllFieldData(dataField.fieldName);
    currentSelectedGraphData.xData = yData;
    currentSelectedGraphData.selectedXDataField = dataField;
    
    let currentAllGraphData: Array<GraphDataObj> = this.graphData.getValue();
    let updatedGraphDataIndex: number = currentAllGraphData.findIndex(dataObj => {return dataObj.graphName == dataField.fieldName});
    currentAllGraphData[updatedGraphDataIndex] = currentSelectedGraphData;
    
    this.selectedGraphData.next(currentSelectedGraphData);
    this.graphData.next(currentAllGraphData);
  }
}



export interface GraphDataObj {
  graphType: string,
  selectedXDataField: LogToolField,
  xData: Array<number>,
  selectedYDataField: LogToolField,
  yData: Array<number>,
  graphName: string
}