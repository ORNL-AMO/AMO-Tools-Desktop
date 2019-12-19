import { Injectable } from '@angular/core';
import { DayTypeAnalysisService } from '../day-type-analysis.service';
import { LogToolService } from '../../log-tool.service';
import * as _ from 'lodash';
@Injectable()
export class DayTypeGraphService {

  selectedDataField: string = 'CFM';
  constructor(private dayTypeAnalysisService: DayTypeAnalysisService, private logToolService: LogToolService) { }

  getDayTypeScatterPlotData(): Array<{ xData: Array<any>, yData: Array<number>, date: Date }> {
    let dayTypePlotData: Array<{ xData: Array<any>, yData: Array<number>, date: Date }> = new Array();
    this.dayTypeAnalysisService.filteredDays.forEach((dayItems: Array<any>) => {
      let dayAverages: { xData: Array<any>, yData: Array<number> } = this.getDayAverages(dayItems);
      dayTypePlotData.push({ xData: dayAverages.xData, yData: dayAverages.yData, date: new Date(dayItems[0][this.logToolService.dateField])});
    })
    return dayTypePlotData;
  }

  getDayAverages(dayItems: Array<any>): { xData: Array<any>, yData: Array<number> } {
    let uniqHours = _.uniqBy(dayItems, (dayItem) => {
      if (dayItem[this.logToolService.dateField]) {
        let date = new Date(dayItem[this.logToolService.dateField]);
        return date.getHours();
      };
    });
    let xData: Array<any> = new Array();
    let yData: Array<number> = new Array();
    uniqHours.forEach(hourItem => {
      let tmpDay: Date = new Date(hourItem[this.logToolService.dateField]);
      let filteredDaysByHour = _.filter(dayItems, (dayItem) => {
        if (dayItem[this.logToolService.dateField]) {
          let date = new Date(dayItem[this.logToolService.dateField]);
          let dateVal = date.getHours();
          let compareVal = tmpDay.getHours();
          return compareVal == dateVal;
        };
      });
      let dayMean: number = _.meanBy(filteredDaysByHour, (filteredDay) => { return filteredDay[this.selectedDataField] });
      yData.push(dayMean);
      xData.push(tmpDay.getHours());
    })
    return { xData: xData, yData: yData };
  }
}
