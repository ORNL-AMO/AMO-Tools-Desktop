import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { LogToolService } from '../log-tool.service';
import { BehaviorSubject } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolField, DaySummary, DayType, DayTypeSummary, LogToolDay, HourlyAverage } from '../log-tool-models';
@Injectable()
export class DayTypeAnalysisService {

  selectedDataField: BehaviorSubject<LogToolField>;
  daySummaries: Array<DaySummary>;
  dayTypes: BehaviorSubject<{ addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> }>;
  dayTypeSummaries: BehaviorSubject<Array<DayTypeSummary>>;
  displayDayTypeCalander: BehaviorSubject<boolean>;

  calendarStartDate: { year: number, month: number, day: number };
  numberOfMonths: number;
  dayTypesCalculated: boolean = false;

  dataView: BehaviorSubject<string>;
  constructor(private logToolDataService: LogToolDataService, private logToolService: LogToolService) {
    this.dayTypes = new BehaviorSubject<{ addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> }>({ addedDayTypes: new Array(), primaryDayTypes: new Array() });
    this.dayTypeSummaries = new BehaviorSubject<Array<DayTypeSummary>>(new Array());
    this.selectedDataField = new BehaviorSubject<LogToolField>(undefined);
    this.displayDayTypeCalander = new BehaviorSubject<boolean>(true);
    this.dataView = new BehaviorSubject<string>('graph');
  }

  resetData(){
    this.dayTypes = new BehaviorSubject<{ addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> }>({ addedDayTypes: new Array(), primaryDayTypes: new Array() });
    this.dayTypeSummaries = new BehaviorSubject<Array<DayTypeSummary>>(new Array());
    this.selectedDataField = new BehaviorSubject<LogToolField>(undefined);
    this.displayDayTypeCalander = new BehaviorSubject<boolean>(true);
    this.dataView = new BehaviorSubject<string>('graph');
    this.calendarStartDate = undefined;
    this.numberOfMonths = undefined;
    this.dayTypesCalculated = false;
  }

  initSecondaryDayTypes() {
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
      dayTypesArr.push({
        color: 'blue',
        label: 'Weekend',
        useDayType: true,
        logToolDays: weekendDates
      });
    }

    if (weekdayDates.length != 0) {
      dayTypesArr.push({
        color: 'green',
        label: 'Weekday',
        useDayType: true,
        logToolDays: weekdayDates
      });
    }
    this.dayTypes.next({ primaryDayTypes: dayTypesArr, addedDayTypes: [] });
  }

  getPrimaryDayType(date: Date): string {
    let daySummary: DaySummary = this.daySummaries.find(day => { return this.logToolDataService.checkSameDay(day.logToolDay.date, date) });
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
    let primaryDayTypeLabel: string = this.getPrimaryDayType(date);
    let dayTypes = this.dayTypes.getValue();
    let addDayType = dayTypes.primaryDayTypes.find(dayType => { return dayType.label == primaryDayTypeLabel });
    let logToolDay: LogToolDay = this.logToolDataService.getLogToolDayFromDate(date);
    addDayType.logToolDays.push(logToolDay);
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
      this.daySummaries.push({ logToolDay: logToolDay, averages: dayAverages, dayData: logToolDay.data })
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
    if (dayTypes.addedDayTypes.length != 0) {
      let dayTypeIndex: number = _.findIndex(dayTypes.addedDayTypes, (dayType) => {
        return this.checkDateExistsInDayType(toggleDate, dayType);
      });
      if (dayTypeIndex != -1) {
        _.remove(dayTypes.addedDayTypes[dayTypeIndex].logToolDays, (logToolDayToBeRemoved) => {
          return this.logToolDataService.checkSameDay(logToolDayToBeRemoved.date, toggleDate);
        });
        dayTypeIndex++;
        if (dayTypeIndex < dayTypes.addedDayTypes.length) {
          dayTypes[dayTypeIndex].dates.push(toggleDate);
        } else {
          this.addPrimaryDayType(toggleDate);
        }
        this.dayTypes.next(dayTypes);
      } else {
        let logToolDay: LogToolDay = this.logToolDataService.getLogToolDayFromDate(toggleDate);
        dayTypes.addedDayTypes[0].logToolDays.push(logToolDay);
        this.removeFromPrimary(toggleDate, dayTypes);
        this.dayTypes.next(dayTypes);
      }
    }
  }

  removeFromPrimary(dateToBeRemoved: Date, dayTypes: { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> }): { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> } {
    if (dayTypes.primaryDayTypes.length != 0) {
      let dayTypeIndex: number = _.findIndex(dayTypes.primaryDayTypes, (dayType) => {
        return this.checkDateExistsInDayType(dateToBeRemoved, dayType);
      });
      if (dayTypeIndex != -1) {
        _.remove(dayTypes.primaryDayTypes[dayTypeIndex].logToolDays, (logToolDay) => {
          return this.logToolDataService.checkSameDay(logToolDay.date, dateToBeRemoved);
        });
      }
    }
    return dayTypes;
  }

  removeFromSecondary(dayType: DayType) {
    let dayTypes = this.dayTypes.getValue();
    let dayTypeIndex: number = _.findIndex(dayTypes.addedDayTypes, (addedDayType) => { return (dayType.color == addedDayType.color && dayType.label == addedDayType.label) });
    if (dayTypeIndex != -1) {
      dayTypes.addedDayTypes.splice(dayTypeIndex, 1);
      dayType.logToolDays.forEach(logToolDay => {
        let primaryDayTypeStr: string = this.getPrimaryDayType(logToolDay.date);
        let primaryDayType: DayType = _.find(dayTypes.primaryDayTypes, (primaryDayType) => { return primaryDayType.label == primaryDayTypeStr });
        primaryDayType.logToolDays.push(logToolDay);
      });
      this.dayTypes.next(dayTypes);
    }
  }

  addNewDayTypes(newDates: Array<Date>, newDayTypeColor: string, newDayTypeName: string) {
    let dayTypes: { addedDayTypes: Array<DayType>, primaryDayTypes: Array<DayType> } = this.dayTypes.getValue();
    let logToolDays: Array<LogToolDay> = new Array();
    newDates.forEach(date => {
      dayTypes = this.removeFromPrimary(new Date(date), dayTypes);
      let logToolDay: LogToolDay = this.logToolDataService.getLogToolDayFromDate(new Date(date));
      logToolDays.push(logToolDay);
    });

    dayTypes.addedDayTypes.push({
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
    dayTypes.addedDayTypes.forEach(dayType => {
      if (dayType.logToolDays.length != 0) {
        let dayTypeSummary: DayTypeSummary = this.getDayTypeSummary(dayType);
        dayTypeSummaries.push(dayTypeSummary);
      }
    });
    dayTypes.primaryDayTypes.forEach(dayType => {
      if (dayType.logToolDays.length != 0) {
        let dayTypeSummary: DayTypeSummary = this.getDayTypeSummary(dayType);
        dayTypeSummaries.push(dayTypeSummary);
      }
    });
    this.dayTypeSummaries.next(dayTypeSummaries);
  }

  getDayTypeSummary(dayType: DayType): DayTypeSummary {
    let dayTypeData: Array<any> = new Array();
    dayType.logToolDays.forEach(logToolDay => {
      dayTypeData = _.union(dayTypeData, logToolDay.data);
    })
    let fields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
    let fieldAverages: Array<{ field: LogToolField, value: number }> = new Array();
    fields.forEach(field => {
      let fieldAverage: number = _.meanBy(dayTypeData, field.fieldName);
      fieldAverages.push({
        field: field,
        value: fieldAverage
      })
    });

    let hourlyAverages: Array<HourlyAverage> = new Array();
    dayType.logToolDays.forEach(logToolDay => {
      hourlyAverages = _.union(hourlyAverages, logToolDay.hourlyAverages);
    });



    return {
      dayType: dayType,
      data: dayTypeData,
      averages: fieldAverages,
      hourlyAverages: hourlyAverages
    }
  }

  // setDayTypeHourlyAverages(hourlyAverages: Array<HourlyAverage>): Array<HourlyAverage>{
  //   let selectedDataField: LogToolField = this.selectedDataField.getValue();
  //   for (let hourOfDay = 0; hourOfDay < 24; hourOfDay++) {
  //     let hourlyAverageObj = hourlyAverages.find(hourlyAverage => { return hourlyAverage.hour == hourOfDay });
  //     if (hourlyAverageObj) {
  //       let hourlyAverage: number = _.meanBy(hourlyAverageObj.averages, (averageObj) => {
  //         if (averageObj.field.fieldName == selectedDataField.fieldName) {
  //           return averageObj.value
  //         }
  //       });
  //       xData.push(hourOfDay);
  //       yData.push(hourlyAverage);
  //     }
  //   }
  // }


  setStartDateAndNumberOfMonths() {
    this.calendarStartDate = {
      year: this.logToolService.startDate.getFullYear(),
      month: this.logToolService.startDate.getMonth() + 1,
      day: this.logToolService.startDate.getDate()
    };
    let startMonth: number = this.logToolService.startDate.getMonth();
    let endMonth: number = this.logToolService.endDate.getMonth();
    this.numberOfMonths = endMonth - startMonth + 1;
  }
}
