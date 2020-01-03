import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService } from '../log-tool.service';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
@Injectable()
export class DayTypeAnalysisService {

  daySummaries: Array<DaySummary>;
  dayTypes: BehaviorSubject<Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }>>;
  secondaryDayTypes: BehaviorSubject<Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }>>;
  validDayTypeNumberOfDataPoints: number;
  dayTypeSummaries: BehaviorSubject<Array<DayTypeSummary>>;
  constructor(private logToolService: LogToolService) {
    this.dayTypes = new BehaviorSubject<Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }>>(new Array());
    this.secondaryDayTypes = new BehaviorSubject<Array<{ color: string, label: string, useDayType: boolean, dates?: Array<Date> }>>(new Array());
    this.dayTypeSummaries = new BehaviorSubject<Array<DayTypeSummary>>(new Array());
  }

  initSecondaryDayTypes() {
    let dayTypesArr: Array<DayType> = new Array();
    let startDate: Date = new Date(this.logToolService.startDate);
    let endDate: Date = new Date(this.logToolService.endDate);
    endDate.setDate(endDate.getDate() + 1);
    let excludedDates: Array<Date> = new Array();
    let weekendDates: Array<Date> = new Array();
    let weekdayDates: Array<Date> = new Array();

    for (let tmpDate = startDate; this.checkSameDay(tmpDate, endDate) != true; tmpDate.setDate(tmpDate.getDate() + 1)) {
      let secondaryDayType: string = this.getSecondaryDayType(tmpDate);
      if (secondaryDayType == 'Excluded') {
        excludedDates.push(new Date(tmpDate));
      } else if (secondaryDayType == 'Weekend') {
        weekendDates.push(new Date(tmpDate));
      } else if (secondaryDayType == 'Weekday') {
        weekdayDates.push(new Date(tmpDate));
      }
    }

    if (excludedDates.length != 0) {
      dayTypesArr.push({
        color: 'red',
        label: 'Excluded',
        useDayType: true,
        dates: excludedDates
      });
    }

    if (weekendDates.length != 0) {
      dayTypesArr.push({
        color: 'blue',
        label: 'Weekend',
        useDayType: true,
        dates: weekendDates
      });
    }

    if (weekdayDates.length != 0) {
      dayTypesArr.push({
        color: 'green',
        label: 'Weekday',
        useDayType: true,
        dates: weekdayDates
      });
    }
    this.secondaryDayTypes.next(dayTypesArr);
  }


  getSecondaryDayType(date: Date): string {
    let daySummary: DaySummary = this.daySummaries.find(day => { return this.checkSameDay(day.date, date) });
    if (daySummary.dayData.length != this.validDayTypeNumberOfDataPoints) {
      return 'Excluded';
    } else {
      let dayCode: number = date.getDay();
      if (dayCode == 0 || dayCode == 6) {
        return 'Weekend';
      } else {
        return 'Weekday';
      }
    }
  }

  addSecondaryDayType(date: Date) {
    let secondaryDayTypeLabel: string = this.getSecondaryDayType(date);
    let secondaryDayTypes = this.secondaryDayTypes.getValue();
    let addDayType = secondaryDayTypes.find(dayType => { return dayType.label == secondaryDayTypeLabel });
    addDayType.dates.push(date);
    this.secondaryDayTypes.next(secondaryDayTypes);
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
        } else {
          this.addSecondaryDayType(_date);
        }
        this.dayTypes.next(_dayTypes);
      } else {
        _dayTypes[0].dates.push(_date);
        this.removeFromSecondary(_date);
        this.dayTypes.next(_dayTypes);
      }
    }
  }

  removeFromSecondary(_date: Date) {
    let secondaryDayTypes = this.secondaryDayTypes.getValue();
    if (this.secondaryDayTypes.getValue().length != 0) {
      let dayTypeIndex: number = _.findIndex(secondaryDayTypes, (dayType) => {
        let test: boolean = false;
        dayType.dates.forEach(date => {
          if (this.checkSameDay(date, _date)) {
            test = true;
          }
        });
        return test;
      });
      if (dayTypeIndex != -1) {
        _.remove(secondaryDayTypes[dayTypeIndex].dates, (date) => {
          return this.checkSameDay(date, _date);
        });
      }
    }
    this.secondaryDayTypes.next(secondaryDayTypes);
  }


  setDayTypeSummaries() {
    let dayTypeSummaries: Array<DayTypeSummary> = new Array();
    //day types
    let currentDayTypes: Array<DayType> = this.dayTypes.getValue();
    currentDayTypes.forEach(dayType => {
      if (dayType.dates.length != 0) {
        let dayTypeSummary: DayTypeSummary = this.getDayTypeSummary(dayType);
        dayTypeSummaries.push(dayTypeSummary);
      }
    });
    let secondaryDayTypes: Array<DayType> = this.secondaryDayTypes.getValue();
    secondaryDayTypes.forEach(dayType => {
      if (dayType.dates.length != 0) {
        let dayTypeSummary: DayTypeSummary = this.getDayTypeSummary(dayType);
        dayTypeSummaries.push(dayTypeSummary);
      }
    });
    this.dayTypeSummaries.next(dayTypeSummaries);
  }

  getDayTypeSummary(dayType: DayType): DayTypeSummary {
    let dayTypeData: Array<any> = _.filter(this.logToolService.importDataFromCsv.data, (dataItem) => {
      let dataItemDate: Date = new Date(dataItem[this.logToolService.dateField]);
      let test = _.find(dayType.dates, (date) => { return this.checkSameDay(date, dataItemDate) });
      if (test != undefined) {
        return true;
      } else { return false };
    });

    return {
      dayType: dayType,
      data: dayTypeData
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

export interface DayTypeSummary {
  dayType: DayType
  data: Array<any>
}