import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService } from '../log-tool.service';

@Injectable()
export class DayTypeAnalysisService {

  daySummaries: Array<{ day: Date, averages: Array<{ value: number, label: string }> }>;
  filteredDays: Array<any>;
  constructor(private logToolService: LogToolService) { }

  getDaySummaries() {
    console.log(this.logToolService.importDataFromCsv.data);

    let test = _.groupBy(this.logToolService.importDataFromCsv.data, (data) => { return new Date(data[this.logToolService.dateField]).getDay() });
    console.log(test);
    this.daySummaries = new Array();
    this.filteredDays = new Array();
    let dataDays = _.uniqBy(this.logToolService.importDataFromCsv.data, (dataItem) => {
      if (dataItem[this.logToolService.dateField] != null || dataItem[this.logToolService.dateField] != undefined) {
        let date = new Date(dataItem[this.logToolService.dateField]);
        return date.getDay();
      };
    });
    console.log(dataDays);
    dataDays.forEach(day => {
      if (day[this.logToolService.dateField]) {
        let tmpDay: Date = new Date(day[this.logToolService.dateField]);
        let dayData = _.filter(this.logToolService.importDataFromCsv.data, (dataItem) => {
          if (dataItem[this.logToolService.dateField]) {
            let date = new Date(dataItem[this.logToolService.dateField]);
            let dateVal = date.getDate();
            let compareVal = tmpDay.getDate();
            return compareVal == dateVal;
          }
        });
        this.filteredDays.push(dayData);
        let dayAverages: Array<{ value: number, label: string }> = new Array();
        this.logToolService.fields.forEach(field => {
          if (field.fieldName != this.logToolService.dateField) {
            let mean = _.meanBy(dayData, field.fieldName);
            dayAverages.push({ value: mean, label: field.alias });
          }
        })
        this.daySummaries.push({ day: tmpDay, averages: dayAverages });
      }
    })
  }
}
