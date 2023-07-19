import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService } from '../log-tool.service';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolField, DayType, DayTypeSummary, LogToolDay, AverageByInterval } from '../log-tool-models';
import { VisualizeService } from '../visualize/visualize.service';
@Injectable()
export class DayTypeAnalysisService {

  selectedDataField: BehaviorSubject<LogToolField>;
  dayTypes: BehaviorSubject<Array<DayType>>;
  dayTypeSummaries: BehaviorSubject<Array<DayTypeSummary>>;
  displayDayTypeCalander: BehaviorSubject<boolean>;

  calendarStartDate: { year: number, month: number, day: number };
  allDataMinDate: Date;
  allDataMaxDate: Date;
  numberOfMonths: number;
  dayTypesCalculated: boolean = false;

  dataView: BehaviorSubject<string>;

  dataDisplayType: BehaviorSubject<string>;
  constructor(private logToolDataService: LogToolDataService, 
    private logToolService: LogToolService,
    private visualizeService: VisualizeService) {

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
        dayTypeId: Math.random().toString(36).substr(2, 9),
        color: 'red',
        label: 'Excluded',
        useDayType: true,
        logToolDays: excludedDates
      });
    }

    if (weekendDates.length != 0) {
      dayTypesArr.unshift({
        dayTypeId: Math.random().toString(36).substr(2, 9),
        color: 'blue',
        label: 'Weekend',
        useDayType: true,
        logToolDays: weekendDates
      });
    }

    if (weekdayDates.length != 0) {
      dayTypesArr.unshift({
        dayTypeId: Math.random().toString(36).substr(2, 9),
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
    let shouldExclude = logToolDay.dayAveragesByInterval.find(averageItem => {
      return averageItem.averages.find(item => { return item.value == undefined });
    });
    if (shouldExclude != undefined) {
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
      let dayTypeIndex: number = _.findIndex(dayTypes, (dayType: DayType) => {
        return this.checkDateExistsInDayType(toggleDate, dayType);
      });
      let logToolDay: LogToolDay = this.logToolDataService.getLogToolDayFromDate(toggleDate);
      if (dayTypeIndex != -1) {
        _.remove(dayTypes[dayTypeIndex].logToolDays, (logToolDayToBeRemoved: LogToolDay) => {
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
      dayTypeId: Math.random().toString(36).substr(2, 9),
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

  // * each day type's average by interval
  getDayTypeSummary(dayType: DayType): DayTypeSummary {
    let summedDayAveragesByInterval: Array<AverageByInterval> = new Array();
    let intervalAveragesForAllDayTypeDays: Array<{interval: number, allDayTypeDayAverages: Array<AverageByInterval>}>;
    // * Below just populating arrays intervalAveragesForAllDayTypeDays and summedDayAveragesByInterval from first index
    
    intervalAveragesForAllDayTypeDays = dayType.logToolDays[0].dayAveragesByInterval.map(dayAverage => {
      summedDayAveragesByInterval.push(
        {
          interval: dayAverage.interval, 
          intervalDateRange: dayAverage.intervalDateRange,
          intervalDisplayString: dayAverage.intervalDisplayString,
          averages: []
        });
        return {interval: dayAverage.interval, allDayTypeDayAverages: []};
      });
      
      dayType.logToolDays.forEach(logToolDay => {
      logToolDay.dayAveragesByInterval.forEach((intervalAverage, intervalIndex) => {
        // each will have multiple all listings
        intervalAveragesForAllDayTypeDays[intervalIndex].allDayTypeDayAverages.push(intervalAverage);
      });
    });

    let dayAveragesByInterval: Array<AverageByInterval> = this.getCombinedDayTypeAverages(intervalAveragesForAllDayTypeDays, summedDayAveragesByInterval);

    return {
      dayType: dayType,
      data: [],
      dayAveragesByInterval: dayAveragesByInterval
    }
  }


  getCombinedDayTypeAverages(intervalAveragesForAllDayTypeDays: Array<{interval: number, allDayTypeDayAverages: Array<AverageByInterval>}>, summedDayAveragesByInterval: Array<AverageByInterval>): Array<AverageByInterval> {
    intervalAveragesForAllDayTypeDays.forEach((intervalDayAverages, intervalIndex: number) => {
      let fields: Array<LogToolField> = this.visualizeService.getDataFieldOptions(true);
      fields.forEach(field => {
        let combinedDaysHourlyAverage: number = this.getCombinedIntervalAverage(intervalDayAverages.allDayTypeDayAverages, field, intervalDayAverages.interval);
        summedDayAveragesByInterval[intervalIndex].averages.push({
          field: field,
          value: combinedDaysHourlyAverage
        });
      });
    });
    
    return summedDayAveragesByInterval;
  }

  getCombinedIntervalAverage(dayAveragesByInterval: Array<AverageByInterval>, field: LogToolField, interval: number) {
    let allDayTypeDaysAveragesAtCurrentInterval: Array<AverageByInterval> = _.filter(dayAveragesByInterval, (intervalAverage) => { 
      return intervalAverage.interval == interval });

    let allFieldValuesForInterval: Array<{ field: LogToolField, value: number }> = new Array();
    allDayTypeDaysAveragesAtCurrentInterval.forEach(obj => {
      allFieldValuesForInterval = _.union(allFieldValuesForInterval, obj.averages);
    });

    _.remove(allFieldValuesForInterval, (averageObj) => {
      if (averageObj.field.fieldName == field.fieldName && averageObj.value == undefined || averageObj.field.fieldName != field.fieldName) {
        return true;
      }
    });

    let intervalAverage: number = _.meanBy(allFieldValuesForInterval, (averageObj) => {
      if (averageObj.field.fieldName == field.fieldName) {
        return averageObj.value
      }
    });
    return intervalAverage;
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
    this.allDataMinDate = new Date(_.min(startDates));
    this.allDataMaxDate = new Date(_.max(endDates));
    this.calendarStartDate = {
      year: this.allDataMinDate.getFullYear(),
      month: this.allDataMinDate.getMonth() + 1,
      day: this.allDataMinDate.getDate()
    };


    let startMonth: number = this.allDataMinDate.getMonth();
    let endMonth: number = this.allDataMaxDate.getMonth();
    this.numberOfMonths = endMonth - startMonth + 1;
  }

  truncate(text: string, limit: number) {
    if (text.length > limit) {
      return text.slice(0, limit) + '...'
    } else {
      return text;
    }
  }
}
