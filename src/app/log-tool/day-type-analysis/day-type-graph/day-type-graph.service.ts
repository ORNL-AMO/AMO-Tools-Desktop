import { Injectable } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import * as moment from 'moment';
import { DaySummary, DayType, DayTypeGraphItem, LogToolDay, LogToolField, DayTypeSummary } from '../../log-tool-models';

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

  resetData(){
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
    for (let hourOfDay = 0; hourOfDay < 24; hourOfDay++) {
      let hourlyAverageObj = dayTypeSummary.hourlyAverages.find(hourlyAverage => { return hourlyAverage.hour == hourOfDay });
      if (hourlyAverageObj) {
        let hourlyAverage: number = _.meanBy(hourlyAverageObj.averages, (averageObj) => {
          if (averageObj.field.fieldName == selectedDataField.fieldName) {
            return averageObj.value
          }
        });
        xData.push(hourOfDay);
        yData.push(hourlyAverage);
      }
    }
    return { xData: xData, yData: yData }
  }

  setIndividualDayScatterPlotData() {
    let individualDayScatterPlotData = new Array();
    this.dayTypeAnalysisService.daySummaries.forEach((daySummary) => {
      let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayAverages(daySummary.logToolDay);
      let color: string = this.getDateColorFromDaySummary(daySummary);
      let formatedDate: string = moment(daySummary.logToolDay.date).format("MMM D, YYYY").toString();
      individualDayScatterPlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: formatedDate, color: color, date: daySummary.logToolDay.date });
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
    //24 hrs in a day
    for (let hourOfDay = 0; hourOfDay < 24; hourOfDay++) {
      let hourAverageObj: { hour: number, averages: Array<{ value: number, field: LogToolField }> } = _.find(logToolDay.hourlyAverages, (hourlyAverageObj) => { return hourlyAverageObj.hour == hourOfDay })
      if (hourAverageObj) {
        let hourAverage: number = _.find(hourAverageObj.averages, (averageObj) => { return averageObj.field.fieldName == selectedDataField.fieldName }).value;
        yData.push(hourAverage);
        xData.push(hourOfDay);
      }
    }
    return { xData: xData, yData: yData };
  }

  getDateColorFromDaySummary(daySummary: DaySummary): string {
    let typeOfDay: DayType = this.dayTypeAnalysisService.getDayType(daySummary.logToolDay.date);
    if (typeOfDay) {
      return typeOfDay.color;
    } else {
      return;
    }
  }

  getDateColorFromDate(date: Date) {
    let daySummary: DaySummary = _.find(this.dayTypeAnalysisService.daySummaries, (daySummary) => { return this.logToolDataService.checkSameDay(date, daySummary.logToolDay.date) });
    return this.getDateColorFromDaySummary(daySummary);
  }

}