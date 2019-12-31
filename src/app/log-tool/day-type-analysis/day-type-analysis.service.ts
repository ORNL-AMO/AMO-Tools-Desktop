import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService } from '../log-tool.service';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
@Injectable()
export class DayTypeAnalysisService {

  daySummaries: Array<DaySummary>;
  dayTypes: BehaviorSubject<Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }>>;
  validDayTypeNumberOfDataPoints: number;
  constructor(private logToolService: LogToolService) {
    this.dayTypes = new BehaviorSubject<Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }>>(new Array());
  }

  getDaySummaries() {
    this.daySummaries = new Array();
    // this.filteredDays = new Array();
    let dayDataNumberOfEntries: Array<number> = new Array();
    let dataDays = this.getDataDays();
    dataDays.forEach(day => {
      if (day[this.logToolService.dateField]) {
        let tmpDay: Date = new Date(day[this.logToolService.dateField]);
        let dayData = _.filter(this.logToolService.importDataFromCsv.data, (dataItem) => {
          if (dataItem[this.logToolService.dateField]) {
            let date = new Date(dataItem[this.logToolService.dateField]);
            return this.checkSameDay(tmpDay, date);
          }
        });
        // this.filteredDays.push(dayData);
        let dayAverages: Array<{ value: number, label: string }> = new Array();
        this.logToolService.fields.forEach(field => {
          if (field.fieldName != this.logToolService.dateField && field.useField == true) {
            let mean = _.meanBy(dayData, field.fieldName);
            dayAverages.push({ value: mean, label: field.alias });
          }
        })
        dayDataNumberOfEntries.push(dayData.length);
        this.daySummaries.push({ date: tmpDay, averages: dayAverages, dayData: dayData });
      }
    });

    let tmpArr = _.countBy(dayDataNumberOfEntries);
    let tmpArr2 = _.entries(tmpArr)
    this.validDayTypeNumberOfDataPoints = Number(_.maxBy(_.last(tmpArr2)));
  }

  getDataDays(): Array<any> {
    let dataDays: Array<any> = new Array();
    let startDate: Date = new Date(this.logToolService.startDate);
    let endDate: Date = new Date(this.logToolService.endDate);
    endDate.setDate(endDate.getDate() + 1);
    for (let tmpDate = startDate; this.checkSameDay(tmpDate, endDate) != true; tmpDate.setDate(tmpDate.getDate() + 1)) {
      let dataDay = _.find(this.logToolService.importDataFromCsv.data, (dataItem) => {
        let tmpDay: Date = new Date(dataItem[this.logToolService.dateField]);
        return this.checkSameDay(tmpDay, tmpDate);
      });
      if (dataDay != undefined) {
        dataDays.push(dataDay);
      }
    }
    return dataDays;
  }

  checkSameDay(day1: Date, day2: Date) {
    return moment(day1).isSame(day2, 'day');
  }


  getDayType(_date: Date): { color: string, label: string, useDayType: boolean, dates?: Array<Date> } {
    let dayTypes: Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }> = this.dayTypes.getValue();
    //iterate day types to see if any match with date
    let typeOfDay: { color: string, label: string, useDayType: boolean, dates?: Array<Date> } = _.find(dayTypes, (dayType) => {
      let test: boolean = false;
      if (dayType.useDayType == true) {
        dayType.dates.forEach(date => {
          if (this.checkSameDay(date, _date)) {
            test = true;
          }
        });
      }
      return test;
    });
    return typeOfDay;
  }

  toggleDateType(_date: Date) {
    let _dayTypes: Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }> = this.dayTypes.getValue();
    if (_dayTypes.length != 0) {
      let dayTypeIndex: number = _.findIndex(_dayTypes, (dayType) => {
        let test: boolean = false;
        dayType.dates.forEach(date => {
          if (this.checkSameDay(date, _date)) {
            test = true;
          }
        });
        return test;
      });
      if (dayTypeIndex != -1) {
        _.remove(_dayTypes[dayTypeIndex].dates, (date) => {
          return this.checkSameDay(date, _date);
        });
        dayTypeIndex++;
        if (dayTypeIndex < _dayTypes.length) {
          _dayTypes[dayTypeIndex].dates.push(_date);
        }
        this.dayTypes.next(_dayTypes);
      } else {
        _dayTypes[0].dates.push(_date);
        this.dayTypes.next(_dayTypes);
      }
    }
  }
}


export interface DaySummary {
  date: Date,
  averages: Array<{ value: number, label: string }>,
  dayData: Array<any>
}

export interface DayType { 
  color: string, 
  label: string, 
  useDayType: boolean, 
  dates?: Array<Date> 
}