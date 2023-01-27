import { Injectable } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import moment from 'moment';
import { DayType, DayTypeGraphItem, LogToolDay, LogToolField, DayTypeSummary } from '../../log-tool-models';

@Injectable()
export class DayTypeGraphService {

  selectedGraphType: BehaviorSubject<string>;
  dayTypeScatterPlotData: BehaviorSubject<Array<DayTypeGraphItem>>;
  individualDayScatterPlotData: BehaviorSubject<Array<DayTypeGraphItem>>;
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolDataService: LogToolDataService) {
    this.selectedGraphType = new BehaviorSubject<string>('individualDay');
    this.dayTypeScatterPlotData = new BehaviorSubject<Array<DayTypeGraphItem>>(new Array());
    this.individualDayScatterPlotData = new BehaviorSubject<Array<DayTypeGraphItem>>(new Array());
  }

  resetData() {
    this.selectedGraphType = new BehaviorSubject<string>('individualDay');
    this.dayTypeScatterPlotData = new BehaviorSubject<Array<DayTypeGraphItem>>(new Array());
    this.individualDayScatterPlotData = new BehaviorSubject<Array<DayTypeGraphItem>>(new Array());
  }

  setDayTypeScatterPlotData() {
    let dayTypeScatterPlotData = new Array();
    let dayTypeSummaries = this.dayTypeAnalysisService.dayTypeSummaries.getValue();
    dayTypeSummaries.forEach(summary => {
      let dayAveragesGraphData: DayTypeGraphItem = this.getDayTypeSummaryAvgGraphData(summary);
      dayTypeScatterPlotData.push(dayAveragesGraphData);
    });
    this.dayTypeScatterPlotData.next(dayTypeScatterPlotData);
  }

  getDayTypeSummaryAvgGraphData(dayTypeSummary: DayTypeSummary): DayTypeGraphItem {
    let xData: Array<any> = new Array();
    let yData: Array<number> = new Array();
    let selectedDataField: LogToolField = this.dayTypeAnalysisService.selectedDataField.getValue();
    dayTypeSummary.dayAveragesByInterval.forEach(intervalAverage => {
      let currentFieldAverageValue: number = _.find(intervalAverage.averages, (averageObj) => { return averageObj.field.fieldName == selectedDataField.fieldName }).value;
      xData.push(intervalAverage.intervalOffsetString);
      yData.push(currentFieldAverageValue);
    });
    
    let graphData: DayTypeGraphItem = { xData: xData, yData: yData, name: dayTypeSummary.dayType.label, color: dayTypeSummary.dayType.color, dayType: dayTypeSummary.dayType } 
    return graphData;
  }

  setIndividualDayScatterPlotData() {
    let individualDayScatterPlotData = new Array();
    this.logToolDataService.logToolDays.forEach((logToolDay) => {
      let dayAverages: DayTypeGraphItem = this.getGraphDayAverages(logToolDay);
      individualDayScatterPlotData.push(dayAverages);
    });
    this.individualDayScatterPlotData.next(individualDayScatterPlotData);
  }

  updateIndividualDayScatterPlotDataColors() {
    let individualDayScatterPlotData = this.individualDayScatterPlotData.getValue();
    individualDayScatterPlotData.forEach((daySummary) => {
      daySummary.color = this.getDateColorFromDate(daySummary.date);
    });
    this.individualDayScatterPlotData.next(individualDayScatterPlotData);
  }

  getGraphDayAverages(logToolDay: LogToolDay): DayTypeGraphItem {
    let xData: Array<any> = new Array();
    let yData: Array<number> = new Array();
    let selectedDataField: LogToolField = this.dayTypeAnalysisService.selectedDataField.getValue();
    logToolDay.dayAveragesByInterval.forEach(averageByInterval => {
      let average: { value: number, field: LogToolField } = _.find(averageByInterval.averages, (averageObj) => { return averageObj.field.fieldName == selectedDataField.fieldName });
        if (average) {
          xData.push(averageByInterval.intervalOffsetString);
          yData.push(average.value);
        }
    })
    let color: string = this.getDateColorFromDay(logToolDay);
    let formatedDate: string = moment(logToolDay.date).format("MMM D, YYYY").toString();
    let graphData: DayTypeGraphItem = { xData: xData, yData: yData,  name: formatedDate, color: color, date: logToolDay.date  }
    return graphData;
  }

  getDateColorFromDay(logToolDay: LogToolDay): string {
    let typeOfDay: DayType = this.dayTypeAnalysisService.getDayType(logToolDay.date);
    if (typeOfDay) {
      return typeOfDay.color;
    } else {
      return;
    }
  }

  getDateColorFromDate(date: Date) {
    let logToolDay: LogToolDay = _.find(this.logToolDataService.logToolDays, (logToolDay) => { return this.logToolDataService.checkSameDay(date, logToolDay.date) });
    return this.getDateColorFromDay(logToolDay);
  }

}