import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService, LogToolField } from '../log-tool.service';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
@Injectable()
export class DayTypeAnalysisService {

  selectedDataField: BehaviorSubject<LogToolField>;
  daySummaries: Array<DaySummary>;
  dayTypes: BehaviorSubject<{ addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> }>;
  // secondaryDayTypes: BehaviorSubject<Array<DayType>>;
  dayTypeSummaries: BehaviorSubject<Array<DayTypeSummary>>;
  constructor(private logToolDataService: LogToolDataService, private logToolService: LogToolService) {
    this.dayTypes = new BehaviorSubject<{ addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> }>({ addedDayTypes: new Array(), primaryDayTypes: new Array() });
    // this.secondaryDayTypes = new BehaviorSubject<Array<DayType>>(new Array());
    this.dayTypeSummaries = new BehaviorSubject<Array<DayTypeSummary>>(new Array());
    this.selectedDataField = new BehaviorSubject<LogToolField>(undefined);
  }

  initSecondaryDayTypes() {
    let dayTypesArr: Array<DayType> = new Array();
    let excludedDates: Array<Date> = new Array();
    let weekendDates: Array<Date> = new Array();
    let weekdayDates: Array<Date> = new Array();

    this.logToolDataService.logToolDays.forEach(day => {
      let secondaryDayType: string = this.getSecondaryDayType(day.date);
      if (secondaryDayType == 'Excluded') {
        excludedDates.push(new Date(day.date));
      } else if (secondaryDayType == 'Weekend') {
        weekendDates.push(new Date(day.date));
      } else if (secondaryDayType == 'Weekday') {
        weekdayDates.push(new Date(day.date));
      }
    })

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
    this.dayTypes.next({ primaryDayTypes: dayTypesArr, addedDayTypes: [] });
  }

  getSecondaryDayType(date: Date): string {
    let daySummary: DaySummary = this.daySummaries.find(day => { return this.logToolDataService.checkSameDay(day.date, date) });
    if (daySummary.dayData.length != this.logToolDataService.validNumberOfDayDataPoints) {
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

  addPrimaryDayType(date: Date) {
    let secondaryDayTypeLabel: string = this.getSecondaryDayType(date);
    let dayTypes = this.dayTypes.getValue();
    let addDayType = dayTypes.primaryDayTypes.find(dayType => { return dayType.label == secondaryDayTypeLabel });
    addDayType.dates.push(date);
    this.dayTypes.next(dayTypes);
  }

  getDaySummaries() {
    this.daySummaries = new Array();
    this.logToolDataService.logToolDays.forEach(logToolDay => {
      let dayAverages: Array<{ value: number, field: LogToolField }> = new Array();
      this.logToolService.fields.forEach(field => {
        if (field.fieldName != this.logToolService.dateField && field.useField == true) {
          if (this.selectedDataField.getValue() == undefined) {
            this.selectedDataField.next(field);
          }
          let fieldAverage: number = _.meanBy(logToolDay.data, field.fieldName);
          dayAverages.push({ field: field, value: fieldAverage });
        }
      });
      this.daySummaries.push({ date: logToolDay.date, averages: dayAverages, dayData: logToolDay.data })
    });
  }

  getDayType(_date: Date): DayType {
    let dayTypes = this.dayTypes.getValue();
    let combinedDayTypes: Array<DayType> = _.union(dayTypes.primaryDayTypes, dayTypes.addedDayTypes);
    //iterate day types to see if any match with date
    let typeOfDay: DayType = _.find(combinedDayTypes, (dayType) => {
      return this.checkDateExistsInDayType(_date, dayType);
    });
    if (typeOfDay) {
      return typeOfDay;
    }
  }

  checkDateExistsInDayType(checkDateExists: Date, dayType: DayType): boolean {
    let test: boolean = false;
    if (dayType.useDayType == true) {
      dayType.dates.forEach(date => {
        if (this.logToolDataService.checkSameDay(date, checkDateExists)) {
          test = true;
        }
      });
    }
    return test;
  }

  toggleDateType(toggleDate: Date) {
    let dayTypes = this.dayTypes.getValue();
    if (dayTypes.addedDayTypes.length != 0) {
      let dayTypeIndex: number = _.findIndex(dayTypes.addedDayTypes, (dayType) => {
        return this.checkDateExistsInDayType(toggleDate, dayType);
      });
      if (dayTypeIndex != -1) {
        _.remove(dayTypes.addedDayTypes[dayTypeIndex].dates, (dateToBeRemoved) => {
          return this.logToolDataService.checkSameDay(dateToBeRemoved, toggleDate);
        });
        dayTypeIndex++;
        if (dayTypeIndex < dayTypes.addedDayTypes.length) {
          dayTypes[dayTypeIndex].dates.push(toggleDate);
        } else {
          this.addPrimaryDayType(toggleDate);
        }
        this.dayTypes.next(dayTypes);
      } else {
        dayTypes.addedDayTypes[0].dates.push(toggleDate);
        this.removeFromPrimary(toggleDate);
        this.dayTypes.next(dayTypes);
      }
    }
  }

  removeFromPrimary(dateToBeRemoved: Date) {
    let dayTypes = this.dayTypes.getValue();
    if (dayTypes.primaryDayTypes.length != 0) {
      let dayTypeIndex: number = _.findIndex(dayTypes.primaryDayTypes, (dayType) => {
        return this.checkDateExistsInDayType(dateToBeRemoved, dayType);
      });
      if (dayTypeIndex != -1) {
        _.remove(dayTypes.primaryDayTypes[dayTypeIndex].dates, (date) => {
          return this.logToolDataService.checkSameDay(date, dateToBeRemoved);
        });
      }
    }
    this.dayTypes.next(dayTypes);
  }


  setDayTypeSummaries() {
    let dayTypeSummaries: Array<DayTypeSummary> = new Array();
    //day types
    let dayTypes = this.dayTypes.getValue();
    dayTypes.addedDayTypes.forEach(dayType => {
      if (dayType.dates.length != 0) {
        let dayTypeSummary: DayTypeSummary = this.getDayTypeSummary(dayType);
        dayTypeSummaries.push(dayTypeSummary);
      }
    });
    // let secondaryDayTypes: Array<DayType> = this.secondaryDayTypes.getValue();
    dayTypes.primaryDayTypes.forEach(dayType => {
      if (dayType.dates.length != 0) {
        let dayTypeSummary: DayTypeSummary = this.getDayTypeSummary(dayType);
        dayTypeSummaries.push(dayTypeSummary);
      }
    });
    this.dayTypeSummaries.next(dayTypeSummaries);
  }

  getDayTypeSummary(dayType: DayType): DayTypeSummary {
    let dayTypeData: Array<any> = _.filter(this.logToolDataService.logToolDays, (logToolDay) => {
      let test = _.find(dayType.dates, (dayTypeDate) => { return this.logToolDataService.checkSameDay(dayTypeDate, logToolDay.date) });
      if (test != undefined) {
        return true;
      } else { return false };
    });
    let data: Array<any> = new Array();
    dayTypeData.forEach(dataItem => {
      data = _.union(data, dataItem.data)
    });
    return {
      dayType: dayType,
      data: data
    }
  }
}


export interface DaySummary {
  date: Date,
  averages: Array<{ value: number, field: LogToolField }>,
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