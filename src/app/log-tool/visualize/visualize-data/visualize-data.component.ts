import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { LogToolField, GraphObj, GraphDataSummary, GraphDataOption } from '../../log-tool-models';
import { VisualizeService } from '../visualize.service';
import * as _ from 'lodash';
import { combineLatestWith, debounce, interval, Observable, Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
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

  @Input()
  containerHeight: number;

  selectedGraphObjSub: Subscription;

  axisSummaries: Array<GraphDataSummary>;
  axisRanges: { xMin: number, xMax: number, yMin: number, yMax: number, y2Min: number, y2Max: number };
  axisRangesSub: Subscription;

  worker: Worker;
  calculatingSummaries: any;
  onUpdateGraphEventsSubscription: Subscription;
  constructor(private visualizeService: VisualizeService, private cd: ChangeDetectorRef, private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    this.calculateSummaries();
    let onUpdateGraphEventsObservable: Observable<any> = this.visualizeService.selectedGraphObj
      .pipe(
        combineLatestWith(this.visualizeService.restyleRanges),
        debounce(obs => {
          let userInputDelay = this.visualizeService.userInputDelay.getValue()
          return interval(userInputDelay);
        })
      );

    this.onUpdateGraphEventsSubscription = onUpdateGraphEventsObservable.subscribe(obs => {
      this.calculateSummaries();
    });
  }

  ngOnDestroy() {
    this.onUpdateGraphEventsSubscription.unsubscribe();
  }

  calculateSummaries() {
    this.timeSummaries = new Array();
    this.axisSummaries = new Array();
    let graphObj: GraphObj = this.visualizeService.selectedGraphObj.getValue();
    if (graphObj.data[0].type == 'bar') {
      this.axisRanges = {
        xMin: graphObj.bins[0].min,
        xMax: graphObj.bins[graphObj.bins.length - 1].min,
        yMin: undefined,
        yMax: undefined,
        y2Min: undefined,
        y2Max: undefined
      };
    } else {
      this.axisRanges = undefined;
    }
    if (graphObj.data[0].type == 'time-series') {
      this.setTimeSeriesSummary();
    } else if (graphObj.selectedXAxisDataOption.dataField) {
      let xAxisSummary = this.getDataSummary(graphObj.selectedXAxisDataOption.dataField, 'X-Axis', graphObj.selectedXAxisDataOption.data)
      this.axisSummaries.push(xAxisSummary);
    }
    if (graphObj.data[0].type != 'bar') {
      graphObj.selectedYAxisDataOptions.forEach(async (option) => {
        let yAxis: string = 'Y-Axis';
        if (option.yaxis == 'y2') {
          yAxis = 'Right Y-Axis'
        }
        let summary = this.getDataSummary(option.dataOption.dataField, yAxis, option.dataOption.data);
        this.axisSummaries.push(summary);
      });
    }
    this.cd.detectChanges();
  }

  setTimeSeriesSummary() {
    let allDataByAxisField: Array<GraphDataOption> = this.visualizeService.allDataByAxisField;
    allDataByAxisField.forEach((dataItem) => {
      if (dataItem.dataField.isDateField) {
        let fieldData: Array<any>;
        if (this.axisRanges) {
          fieldData = this.filterXAxisData(dataItem.data, true);
        } else {
          fieldData = dataItem.data;
        }
        let dateFieldSummary = this.getDataSummaryItem(fieldData, dataItem.dataField.csvName);
        this.timeSummaries.push(dateFieldSummary);
      }
    });
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

  getDataSummary(dataField: LogToolField, axis: string, allData: Array<any>): GraphDataSummary {
    let min: number;
    let max: number;
    let mean: number;
    let standardDeviation;
    let filteredData: Array<any> = allData;

    if (this.axisRanges) {
      if (axis != 'X-Axis') {
        filteredData = this.filterData(dataField, axis);
      } else {
        filteredData = this.filterXAxisData(allData, dataField.isDateField);
      }
    }

    if (isNaN(filteredData[0]) == false) {
      min = _.min(filteredData);
      max = _.max(filteredData);
      mean = _.mean(filteredData);
      standardDeviation = this.visualizeService.calculateStandardDeviation(filteredData, mean);
    } else if (dataField.isDateField) {
      min = _.minBy(filteredData, (dataItem) => { return new Date(dataItem) });
      max = _.maxBy(filteredData, (dataItem) => { return new Date(dataItem) });
    }
    return {
      axis: axis,
      max: max,
      min: min,
      numberOfDataPoints: filteredData.length,
      standardDeviation: standardDeviation,
      mean: mean,
      name: dataField.alias
    }
  }


  filterData(dataField: LogToolField, axis: string): Array<any> {
    let graphObj: GraphObj = this.visualizeService.selectedGraphObj.getValue();
    let min: number;
    let max: number;
    if (axis == 'Y-Axis') {
      min = this.axisRanges.yMin;
      max = this.axisRanges.yMax;
    } else if (axis == 'Right Y-Axis') {
      min = this.axisRanges.y2Min;
      max = this.axisRanges.y2Max;
    }
    let filteredData: Array<any> = this.logToolDataService.getDataInRange(dataField, graphObj.selectedXAxisDataOption.dataField, this.axisRanges.xMin, this.axisRanges.xMax, min, max);
    return filteredData;
  }

  filterXAxisData(data: Array<any>, isDateField: boolean): Array<any> {
    let filteredData: Array<any> = _.filter(data, (dataItem) => {
      if (isDateField) {
        return (new Date(dataItem).valueOf() > new Date(this.axisRanges.xMin).valueOf() && new Date(dataItem).valueOf() < new Date(this.axisRanges.xMax).valueOf());
      } else {
        return (dataItem > this.axisRanges.xMin && dataItem < this.axisRanges.xMax);
      }
    });
    return filteredData;
  }


}
