import { Injectable } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { LogToolService } from '../../log-tool.service';
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
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolService: LogToolService, private logToolDataService: LogToolDataService) {
    this.selectedGraphType = new BehaviorSubject<string>('individualDay');
    this.dayTypeScatterPlotData = new BehaviorSubject<Array<DayTypeGraphItem>>(new Array());
    this.individualDayScatterPlotData = new BehaviorSubject<Array<DayTypeGraphItem>>(new Array());
  }

  setDayTypeScatterPlotData() {
    let dayTypeScatterPlotData = new Array();
    let dayTypeSummaries = this.dayTypeAnalysisService.dayTypeSummaries.getValue();
    dayTypeSummaries.forEach(summary => {
      let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDaySummaryAverages(summary);
      let color: string = summary.dayType.color;
      dayTypeScatterPlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: summary.dayType.label, color: color, dayType: summary.dayType });
    });
    this.dayTypeScatterPlotData.next(dayTypeScatterPlotData);
  }

  getDaySummaryAverages(dayTypeSummary: DayTypeSummary): { xData: Array<number>, yData: Array<number> } {
    let xData: Array<number> = new Array();
    let yData: Array<number> = new Array();

    let selectedDataField: LogToolField = this.dayTypeAnalysisService.selectedDataField.getValue();
    for (let i = 0; i < 24; i++) {
      let hourlyAverageObj = dayTypeSummary.hourlyAverages.find(hourlyAverage => { return hourlyAverage.hour == i });
      if (hourlyAverageObj) {
        let hourlyAverage: number = _.meanBy(hourlyAverageObj.averages, selectedDataField.fieldName);
        xData.push(hourlyAverage);
        yData.push(i);
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
    for (let i = 0; i < 24; i++) {
      // let filteredDaysByHour = _.filter(dayItems, (dayItem) => {
      //   if (dayItem[this.logToolService.dateField]) {
      //     let date = new Date(dayItem[this.logToolService.dateField]);
      //     let dateVal = date.getHours();
      //     return i == dateVal;
      //   };
      // });
      let hourAverageObj: { hour: number, averages: Array<{ value: number, field: LogToolField }> } = _.find(logToolDay.hourlyAverages, (hourlyAverageObj) => { return hourlyAverageObj.hour == i })
      if (hourAverageObj) {
        let hourAverage: number = _.find(hourAverageObj.averages, (averageObj) => { return averageObj.field.fieldName == selectedDataField.fieldName }).value;
        // let dayMean: number = _.meanBy(filteredDaysByHour, (filteredDay) => { return filteredDay[this.dayTypeAnalysisService.selectedDataField.getValue().fieldName] });
        yData.push(hourAverage);
        xData.push(i);
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