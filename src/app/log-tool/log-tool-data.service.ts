import { Injectable } from '@angular/core';
import { LogToolService } from './log-tool.service';
import * as moment from 'moment';
import * as _ from 'lodash';
@Injectable()
export class LogToolDataService {

  logToolDays: Array<LogToolDay>;
  validNumberOfDayDataPoints: number;
  constructor(private logToolService: LogToolService) { }

  //seperate log tool data into days
  setLogToolDays() {
    let csvDataCopy: Array<any> = JSON.parse(JSON.stringify(this.logToolService.importDataFromCsv.data));
    this.logToolDays = new Array();
    let startDate: Date = new Date(this.logToolService.startDate);
    let endDate: Date = new Date(this.logToolService.endDate);
    endDate.setDate(endDate.getDate() + 1);
    //iterate thru days from start day to end day
    for (let tmpDate = startDate; this.checkSameDay(tmpDate, endDate) != true; tmpDate.setDate(tmpDate.getDate() + 1)) {
      let filteredDayData: Array<any> = this.getDataForDay(tmpDate, csvDataCopy);
      this.logToolDays.push({
        date: new Date(tmpDate),
        data: filteredDayData
      });
    }
    console.log(this.logToolDays);
  }

  getDataForDay(date: Date, data: Array<any>): Array<any> {
    //remove matching day items from all day data and return array
    let filteredDayData: Array<any> = _.remove(data, (dataItem) => {
      let dataItemDate: Date = new Date(dataItem[this.logToolService.dateField]);
      return this.checkSameDay(date, dataItemDate);
    });
    return filteredDayData;
  }

  checkSameDay(day1: Date, day2: Date) {
    return moment(day1).isSame(day2, 'day');
  }

  setValidNumberOfDayDataPoints(){
    let dayDataNumberOfEntries: Array<number> = new Array();
    this.logToolDays.forEach(day => {
      dayDataNumberOfEntries.push(day.data.length);
    })
    let tmpArr = _.countBy(dayDataNumberOfEntries);
    let tmpArr2 = _.entries(tmpArr)
    this.validNumberOfDayDataPoints = Number(_.maxBy(_.last(tmpArr2)));
  }

}


export interface LogToolDay {
  date: Date,
  data: Array<any>,
}
