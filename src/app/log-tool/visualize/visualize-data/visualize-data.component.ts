import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../../log-tool.service';
import { VisualizeMenuService } from '../visualize-menu/visualize-menu.service';
import { LogToolField } from '../../log-tool-models';
import { VisualizeService } from '../visualize.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-visualize-data',
  templateUrl: './visualize-data.component.html',
  styleUrls: ['./visualize-data.component.css']
})
export class VisualizeDataComponent implements OnInit {


  timeSummaries: Array<{
    csvName: string,
    startDate: Date,
    endDate: Date,
    dataFrequency: number,
    numberOfDataPoints: number
  }>;

  selectedGraphObjSub: Subscription;

  axisSummaries: Array<{
    max: number,
    min: number,
    numberOfDataPoints: number,
    standardDeviation: number,
    mean: number,
    name: string
  }>;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(graphObj => {
      this.timeSummaries = new Array();
      this.axisSummaries = new Array();
      if (graphObj.selectedXAxisDataOption.dataField && graphObj.selectedXAxisDataOption.dataField.alias == 'Time Series') {
        this.setDataSummary();
      } else if (graphObj.selectedXAxisDataOption.dataField) {
        let xAxisSummary = this.getDataSummary(graphObj.selectedXAxisDataOption)
        this.axisSummaries.push(xAxisSummary);
      }
      if (graphObj.data[0].type != 'bar') {
        graphObj.selectedYAxisDataOptions.forEach(option => {
          let summary = this.getDataSummary(option.dataOption);
          this.axisSummaries.push(summary);
        });
      }
    });
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  setDataSummary() {
    let visualizeData: Array<{ dataField: LogToolField, data: Array<number | string> }> = this.visualizeService.visualizeData;
    visualizeData.forEach(dataItem => {
      if (dataItem.dataField.isDateField) {
        let dateFieldSummary = this.getDataSummaryItem(dataItem.data, dataItem.dataField.csvName);
        this.timeSummaries.push(dateFieldSummary);
      }
    })
  }

  getDataSummaryItem(data: Array<number | string>, csvName: string): {
    csvName: string,
    startDate: Date,
    endDate: Date,
    dataFrequency: number,
    numberOfDataPoints: number
  } {
    let min: any = _.min(data);
    let max: any = _.max(data);
    let date1 = new Date(data[0]);
    let date2 = new Date(data[1]);
    let intervalDifference = (date2.getTime() - date1.getTime()) / 1000;
    return {
      csvName: csvName,
      startDate: min,
      endDate: max,
      dataFrequency: intervalDifference,
      numberOfDataPoints: data.length
    }
  }

  getDataSummary(dataOption: { dataField: LogToolField, data: Array<any> }): {
    max: number,
    min: number,
    numberOfDataPoints: number,
    standardDeviation: number,
    mean: number,
    name: string
  } {
    let min: number = _.min(dataOption.data);
    let max: number = _.max(dataOption.data);
    let mean: number = _.mean(dataOption.data);
    let standardDeviation = this.visualizeService.calculateStandardDeviation(dataOption.data, mean);
    return {
      max: max,
      min: min,
      numberOfDataPoints: dataOption.data.length,
      standardDeviation: standardDeviation,
      mean: mean,
      name: dataOption.dataField.alias
    }
  }



}
