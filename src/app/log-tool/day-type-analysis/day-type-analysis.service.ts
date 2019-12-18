import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService } from '../log-tool.service';

@Injectable()
export class DayTypeAnalysisService {

  daySummaries: Array<{ day: Date, averages: Array<{ value: number, label: string }> }>;
  constructor(private logToolService: LogToolService) { }

  getDaySummaries() {
    this.daySummaries = new Array();
    let dataDays = _.uniqBy(this.logToolService.importDataFromCsv.data, (dataItem) => {
      if (dataItem[this.logToolService.dateField]) {
        let date = new Date(dataItem[this.logToolService.dateField]);
        return date.getDay();
      };
    });
    dataDays.forEach(day => {
      if (day[this.logToolService.dateField]) {
        let tmpDay: Date = new Date(day[this.logToolService.dateField]);
        console.log(tmpDay.toDateString());
        let dayData = _.filter(this.logToolService.importDataFromCsv.data, (dataItem) => {
          if (dataItem[this.logToolService.dateField]) {
            let date = new Date(dataItem[this.logToolService.dateField]);
            let dateVal = date.getDate();
            let compareVal = tmpDay.getDate();
            return compareVal == dateVal;
          }
        });
        let dayAverages: Array<{ value: number, label: string }> = new Array();
        this.logToolService.fields.forEach(field => {
          if (field.fieldName != this.logToolService.dateField) {
            let sum = _.sumBy(dayData, field.fieldName);
            let dayAverage = sum / dayData.length;
            dayAverages.push({ value: dayAverage, label: field.alias });
          }
        })
        this.daySummaries.push({ day: tmpDay, averages: dayAverages });
      }
    })
  }
}
