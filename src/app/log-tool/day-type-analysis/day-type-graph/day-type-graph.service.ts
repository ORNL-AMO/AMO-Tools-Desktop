import { Injectable } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import moment from 'moment';
import { DayType, DayTypeGraphItem, LogToolDay, LogToolField, DayTypeSummary, HourlyAverage } from '../../log-tool-models';

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
      let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayTypeSummaryAverages(summary);
      let color: string = summary.dayType.color;
      dayTypeScatterPlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: summary.dayType.label, color: color, dayType: summary.dayType });
    });
    this.dayTypeScatterPlotData.next(dayTypeScatterPlotData);
  }

  getDayTypeSummaryAverages(dayTypeSummary: DayTypeSummary): { xData: Array<number>, yData: Array<number> } {
    let xData: Array<number> = new Array();
    let yData: Array<number> = new Array();

    let selectedDataField: LogToolField = this.dayTypeAnalysisService.selectedDataField.getValue();
    dayTypeSummary.hourlyAverages.forEach(hourlyAverage => {
      let currentFieldAverageValue: number = _.find(hourlyAverage.averages, (averageObj) => { return averageObj.field.fieldName == selectedDataField.fieldName }).value;
      xData.push(hourlyAverage.hour+1);
      yData.push(currentFieldAverageValue);
    });
    return { xData: xData, yData: yData }
  }

  setIndividualDayScatterPlotData() {
    let individualDayScatterPlotData = new Array();
    this.logToolDataService.logToolDays.forEach((logToolDay) => {
      let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayAverages(logToolDay);
      let color: string = this.getDateColorFromDay(logToolDay);
      let formatedDate: string = moment(logToolDay.date).format("MMM D, YYYY").toString();
      individualDayScatterPlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: formatedDate, color: color, date: logToolDay.date });
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

  //calculates averages per hour in a day
  getDayAverages(logToolDay: LogToolDay): { xData: Array<any>, yData: Array<number> } {
    let xData: Array<any> = new Array();
    let yData: Array<number> = new Array();
    let selectedDataField: LogToolField = this.dayTypeAnalysisService.selectedDataField.getValue();
    //24 hrs in a day (0 -> 23)
    for (let hourOfDay = 0; hourOfDay < 24; hourOfDay++) {
      let hourAverageObj: HourlyAverage = _.find(logToolDay.hourlyAverages, (hourlyAverageObj) => { return hourlyAverageObj.hour == hourOfDay })
      if (hourAverageObj) {
        let hourAverage: { value: number, field: LogToolField } = _.find(hourAverageObj.averages, (averageObj) => { return averageObj.field.fieldName == selectedDataField.fieldName });
        if (hourAverage) {
          yData.push(hourAverage.value);
          xData.push(hourOfDay+1);
        }
      }
    }
    return { xData: xData, yData: yData };
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