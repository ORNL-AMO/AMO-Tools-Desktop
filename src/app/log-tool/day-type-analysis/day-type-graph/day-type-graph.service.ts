import { Injectable } from '@angular/core';
import { DayTypeAnalysisService} from '../day-type-analysis.service';
import { LogToolService } from '../../log-tool.service';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import * as moment from 'moment';
import { DaySummary, DayType, DayTypeGraphItem } from '../../log-tool-models';

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
      let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayAverages(summary.data);
      let color: string = summary.dayType.color;
      dayTypeScatterPlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: summary.dayType.label, color: color, dayType: summary.dayType });
    });
    this.dayTypeScatterPlotData.next(dayTypeScatterPlotData);
  }

  // getDaySummaryAverages(dayTypeSummary: DayTypeSummary): {xData: Array<number>, yData: Array<number>}{
  //   let xData: Array<number> = new Array();
  //   let yData: Array<number> = new Array();
    

  // }

  setIndividualDayScatterPlotData() {
    let individualDayScatterPlotData = new Array();
    this.dayTypeAnalysisService.daySummaries.forEach((daySummary) => {
      let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayAverages(daySummary.dayData);
      let color: string = this.getDateColorFromDaySummary(daySummary);
      let formatedDate: string = moment(daySummary.date).format("MMM D, YYYY").toString();
      individualDayScatterPlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, name: formatedDate, color: color, date: daySummary.date });
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
  getDayAverages(dayItems: Array<any>): { xData: Array<any>, yData: Array<number> } {
    let xData: Array<any> = new Array();
    let yData: Array<number> = new Array();
    //24 hrs in a day
    for (let i = 0; i <= 25; i++) {
      let filteredDaysByHour = _.filter(dayItems, (dayItem) => {
        if (dayItem[this.logToolService.dateField]) {
          let date = new Date(dayItem[this.logToolService.dateField]);
          let dateVal = date.getHours();
          return i == dateVal;
        };
      });
      let dayMean: number = _.meanBy(filteredDaysByHour, (filteredDay) => { return filteredDay[this.dayTypeAnalysisService.selectedDataField.getValue().fieldName] });
      yData.push(dayMean);
      xData.push(i);
    }
    return { xData: xData, yData: yData };
  }

  getDateColorFromDaySummary(daySummary: DaySummary): string {
    let typeOfDay: DayType = this.dayTypeAnalysisService.getDayType(daySummary.date);
    if (typeOfDay) {
      return typeOfDay.color;
    } else {
      return;
    }
  }

  getDateColorFromDate(date: Date) {
    let daySummary: DaySummary = _.find(this.dayTypeAnalysisService.daySummaries, (daySummary) => { return this.logToolDataService.checkSameDay(date, daySummary.date) });
    return this.getDateColorFromDaySummary(daySummary);
  }

}