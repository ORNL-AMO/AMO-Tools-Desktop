import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService } from '../log-tool.service';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolField, DayType, DayTypeSummary, LogToolDay, HourlyAverage } from '../log-tool-models';
@Injectable()
export class DayTypeAnalysisService {

  selectedDataField: BehaviorSubject<LogToolField>;
  dayTypes: BehaviorSubject<Array<DayType>>;
  dayTypeSummaries: BehaviorSubject<Array<DayTypeSummary>>;
  displayDayTypeCalander: BehaviorSubject<boolean>;

  calendarStartDate: { year: number, month: number, day: number };
  numberOfMonths: number;
  dayTypesCalculated: boolean = false;

  dataView: BehaviorSubject<string>;

  dataDisplayType: BehaviorSubject<string>;
  constructor(private logToolDataService: LogToolDataService, private logToolService: LogToolService) {
    this.dayTypes = new BehaviorSubject<Array<DayType>>(new Array());
    this.dayTypeSummaries = new BehaviorSubject<Array<DayTypeSummary>>(new Array());
    this.selectedDataField = new BehaviorSubject<LogToolField>(undefined);
    this.displayDayTypeCalander = new BehaviorSubject<boolean>(true);
    this.dataView = new BehaviorSubject<string>('graph');
    this.dataDisplayType = new BehaviorSubject<string>('selected');
  }

  resetData() {
    this.dayTypes = new BehaviorSubject<Array<DayType>>(new Array());
    this.dayTypeSummaries = new BehaviorSubject<Array<DayTypeSummary>>(new Array());
    this.selectedDataField = new BehaviorSubject<LogToolField>(undefined);
    this.displayDayTypeCalander = new BehaviorSubject<boolean>(true);
    this.dataView = new BehaviorSubject<string>('graph');
    this.calendarStartDate = undefined;
    this.numberOfMonths = undefined;
    this.dayTypesCalculated = false;
  }

  initDayTypes() {
    let dayTypesArr: Array<DayType> = new Array();
    let excludedDates: Array<LogToolDay> = new Array();
    let weekendDates: Array<LogToolDay> = new Array();
    let weekdayDates: Array<LogToolDay> = new Array();

    this.logToolDataService.logToolDays.forEach(logToolDay => {
      let primaryDayType: string = this.getPrimaryDayType(logToolDay.date);
      if (primaryDayType == 'Excluded') {
        excludedDates.push(logToolDay);
      } else if (primaryDayType == 'Weekend') {
        weekendDates.push(logToolDay);
      } else if (primaryDayType == 'Weekday') {
        weekdayDates.push(logToolDay);
      }
    })

    if (excludedDates.length != 0) {
      dayTypesArr.push({
        color: 'red',
        label: 'Excluded',
        useDayType: true,
        logToolDays: excludedDates
      });
    }

    if (weekendDates.length != 0) {
      dayTypesArr.unshift({
        color: 'blue',
        label: 'Weekend',
        useDayType: true,
        logToolDays: weekendDates
      });
    }

    if (weekdayDates.length != 0) {
      dayTypesArr.unshift({
        color: 'green',
        label: 'Weekday',
        useDayType: true,
        logToolDays: weekdayDates
      });
    }
    this.dayTypes.next(dayTypesArr);
  }

  getPrimaryDayType(date: Date): string {
    let logToolDay: LogToolDay = this.logToolDataService.logToolDays.find(day => { return this.logToolDataService.checkSameDay(day.date, date) });
    let testExcluded = logToolDay.hourlyAverages.find(averageItem => {
      return averageItem.averages.find(item => { return item.value == undefined });
    });
    if (testExcluded != undefined) {
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
    let primaryDayTypeLabel: string = this.getPrimaryDayType(date);
    let dayTypes = this.dayTypes.getValue();
    let addDayType = dayTypes.find(dayType => { return dayType.label == primaryDayTypeLabel });
    let logToolDay: LogToolDay = this.logToolDataService.getLogToolDayFromDate(date);
    addDayType.logToolDays.push(logToolDay);
    this.dayTypes.next(dayTypes);
  }

  getDayType(_date: Date): DayType {
    let dayTypes = this.dayTypes.getValue();
    //iterate day types to see if any match with date
    let typeOfDay: DayType = _.find(dayTypes, (dayType) => {
      return this.checkDateExistsInDayType(_date, dayType);
    });
    if (typeOfDay) {
      return typeOfDay;
    }
  }

  checkDateExistsInDayType(checkDateExists: Date, dayType: DayType): boolean {
    let test: boolean = false;
    if (dayType.useDayType == true) {
      dayType.logToolDays.forEach(logToolDay => {
        if (this.logToolDataService.checkSameDay(logToolDay.date, checkDateExists)) {
          test = true;
        }
      });
    }
    return test;
  }

  toggleDateType(toggleDate: Date) {
    let dayTypes = this.dayTypes.getValue();
    if (dayTypes.length != 0) {
      let dayTypeIndex: number = _.findIndex(dayTypes, (dayType) => {
        return this.checkDateExistsInDayType(toggleDate, dayType);
      });
      let logToolDay: LogToolDay = this.logToolDataService.getLogToolDayFromDate(toggleDate);
      if (dayTypeIndex != -1) {
        _.remove(dayTypes[dayTypeIndex].logToolDays, (logToolDayToBeRemoved) => {
          return this.logToolDataService.checkSameDay(logToolDayToBeRemoved.date, toggleDate);
        });
        dayTypeIndex++;
        if (dayTypeIndex < dayTypes.length) {
          dayTypes[dayTypeIndex].logToolDays.push(logToolDay);
        } else {
          dayTypes[0].logToolDays.push(logToolDay);
        }
        this.dayTypes.next(dayTypes);
      } else {
        dayTypes[0].logToolDays.push(logToolDay);
        this.dayTypes.next(dayTypes);
      }
    }
  }

  removeDateFromExistingDayType(dateToBeRemoved: Date, dayTypes: Array<DayType>): Array<DayType> {
    if (dayTypes.length != 0) {
      let dayTypeIndex: number = _.findIndex(dayTypes, (dayType) => {
        return this.checkDateExistsInDayType(dateToBeRemoved, dayType);
      });
      if (dayTypeIndex != -1) {
        _.remove(dayTypes[dayTypeIndex].logToolDays, (logToolDay) => {
          return this.logToolDataService.checkSameDay(logToolDay.date, dateToBeRemoved);
        });
      }
    }
    return dayTypes;
  }

  addNewDayTypes(newDates: Array<Date>, newDayTypeColor: string, newDayTypeName: string) {
    let dayTypes: Array<DayType> = this.dayTypes.getValue();
    let logToolDays: Array<LogToolDay> = new Array();
    newDates.forEach(date => {
      dayTypes = this.removeDateFromExistingDayType(new Date(date), dayTypes);
      let logToolDay: LogToolDay = this.logToolDataService.getLogToolDayFromDate(new Date(date));
      logToolDays.push(logToolDay);
    });

    dayTypes.push({
      color: newDayTypeColor,
      label: newDayTypeName,
      useDayType: true,
      logToolDays: logToolDays
    });
    this.dayTypes.next(dayTypes);
  }

  setDayTypeSummaries() {
    let dayTypeSummaries: Array<DayTypeSummary> = new Array();
    let dayTypes = this.dayTypes.getValue();
    dayTypes.forEach(dayType => {
      if (dayType.logToolDays.length != 0) {
        let dayTypeSummary: DayTypeSummary = this.getDayTypeSummary(dayType);
        dayTypeSummaries.push(dayTypeSummary);
      }
    });
    this.dayTypeSummaries.next(dayTypeSummaries);
  }

  getDayTypeSummary(dayType: DayType): DayTypeSummary {
    let dayTypeData: Array<any> = new Array();
    let allDayTypeHourlyAverages: Array<HourlyAverage> = new Array();
    dayType.logToolDays.forEach(logToolDay => {
      allDayTypeHourlyAverages = _.union(allDayTypeHourlyAverages, logToolDay.hourlyAverages);
    });
    let hourlyAverages: Array<HourlyAverage> = this.calculateDayTypeHourlyAverages(allDayTypeHourlyAverages);
    return {
      dayType: dayType,
      data: dayTypeData,
      hourlyAverages: hourlyAverages
    }
  }

  calculateDayTypeHourlyAverages(hourlyAverages: Array<HourlyAverage>): Array<HourlyAverage> {
    let summedHourlyAverages: Array<HourlyAverage> = new Array();
    for (let hourOfDay = 0; hourOfDay < 24; hourOfDay++) {
      let fields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
      let fieldAverages: Array<{ field: LogToolField, value: number }> = new Array();
      fields.forEach(field => {
        let combinedDaysHourlyAverage: number = this.getCombinedHourlyAverage(hourlyAverages, field, hourOfDay);
        fieldAverages.push({
          field: field,
          value: combinedDaysHourlyAverage
        });
      });
      summedHourlyAverages.push({
        hour: hourOfDay,
        averages: fieldAverages
      });
    }
    return summedHourlyAverages;
  }

  getCombinedHourlyAverage(hourlyAverages: Array<HourlyAverage>, field: LogToolField, hourOfDay: number) {
    let filteredHourlyAverageObj = _.filter(hourlyAverages, (hourlyAverage) => { return hourlyAverage.hour == hourOfDay });
    let combinedAverages: Array<{ field: LogToolField, value: number }> = new Array();
    filteredHourlyAverageObj.forEach(obj => {
      combinedAverages = _.union(combinedAverages, obj.averages);
    });
    _.remove(combinedAverages, (averageObj) => {
      if (averageObj.field.fieldName == field.fieldName && averageObj.value == undefined || averageObj.field.fieldName != field.fieldName) {
        return true;
      }
    });
    let hourlyAverage: number = _.meanBy(combinedAverages, (averageObj) => {
      if (averageObj.field.fieldName == field.fieldName) {
        return averageObj.value
      }
    });
    return hourlyAverage;
  }

  removeDayType(dayTypeToBeRemoved: DayType) {
    let dayTypes: Array<DayType> = this.dayTypes.getValue();
    _.remove(dayTypes, (dayType) => {
      return dayType.label == dayTypeToBeRemoved.label;
    });
    this.dayTypes.next(dayTypes);
  }

  setStartDateAndNumberOfMonths() {
    let startDates: Array<Date> = this.logToolService.individualDataFromCsv.map(csvItem => { return new Date(csvItem.startDate) });
    let endDates: Array<Date> = this.logToolService.individualDataFromCsv.map(csvItem => { return new Date(csvItem.endDate) });
    let startDate: Date = new Date(_.min(startDates));
    let endDate: Date = new Date(_.max(endDates));
    this.calendarStartDate = {
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
      day: startDate.getDate()
    };
    let startMonth: number = startDate.getMonth();
    let endMonth: number = endDate.getMonth();
    this.numberOfMonths = endMonth - startMonth + 1;
  }
}
