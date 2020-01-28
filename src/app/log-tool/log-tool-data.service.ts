import { Injectable } from '@angular/core';
import { LogToolService } from './log-tool.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { LogToolDay, LogToolField } from './log-tool-models';
@Injectable()
export class LogToolDataService {

  logToolDays: Array<LogToolDay>;
  validNumberOfDayDataPoints: number;
  constructor(private logToolService: LogToolService) { }

  resetData() {
    this.logToolDays = new Array();
    this.validNumberOfDayDataPoints = undefined;
  }

  getDataFieldOptions(): Array<LogToolField> {
    //non date and used fields
    let tmpFields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    _.remove(tmpFields, (field) => { return field.useField == false || field.isDateField == false });
    return tmpFields;
  }

  getDataFieldOptionsWithDate() {
    let tmpFields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    _.remove(tmpFields, (field) => { return field.useField == false });
    return tmpFields;
  }

  getLogToolDayFromDate(date: Date) {
    let logToolDay: LogToolDay = this.logToolDays.find(logToolDay => { return this.checkSameDay(logToolDay.date, date) });
    return logToolDay
  }

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
      let hourlyAverages = this.getHourlyAverages(filteredDayData);
      this.logToolDays.push({
        date: new Date(tmpDate),
        data: filteredDayData,
        hourlyAverages: hourlyAverages
      });
    }
  }

  getHourlyAverages(dayData: Array<any>): Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> {
    let hourlyAverages: Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> = new Array();
    let fields: Array<LogToolField> = this.getDataFieldOptions();
    for (let i = 0; i < 24; i++) {
      let filteredDaysByHour = _.filter(dayData, (dayItem) => {
        this.logToolService.dateFields.forEach(field => {
          if (dayItem[field]) {
            let date = new Date(dayItem[field]);
            let dateVal = date.getHours();
            return i == dateVal;
          };
        })
      });
      let averages: Array<{ value: number, field: LogToolField }> = new Array();
      fields.forEach(field => {
        let hourFieldMean: number;
        if (filteredDaysByHour.length != 0) {
          hourFieldMean = _.meanBy(filteredDaysByHour, (filteredDay) => { return filteredDay[field.fieldName] });
        }
        averages.push({
          value: hourFieldMean,
          field: field
        })
      })
      hourlyAverages.push({
        hour: i,
        averages: averages
      });
    }
    return hourlyAverages;
  }

  getDataForDay(date: Date, data: Array<any>): Array<any> {
    //filter matching day items from all day data and return array
    let filteredDayData: Array<any> = _.filter(data, (dataItem) => {
      let dataItemDate: Date;
      this.logToolService.dateFields.forEach(field => {
        if (dataItem[field] != undefined) {
          dataItemDate = new Date(dataItem[field]);
          return this.checkSameDay(date, dataItemDate);
        }
      })

    });
    return filteredDayData;
  }

  checkSameDay(day1: Date, day2: Date) {
    return moment(day1).isSame(day2, 'day');
  }

  setValidNumberOfDayDataPoints() {
    let dayDataNumberOfEntries: Array<number> = new Array();
    this.logToolDays.forEach(day => {
      dayDataNumberOfEntries.push(day.data.length);
    })
    let tmpArr = _.countBy(dayDataNumberOfEntries);
    let tmpArr2 = _.entries(tmpArr)
    this.validNumberOfDayDataPoints = Number(_.maxBy(_.last(tmpArr2)));
  }

  getAllFieldData(fieldName: string): Array<number> {
    let mappedValues: Array<any> = _.mapValues(this.logToolService.importDataFromCsv.data, (dataItem) => { return dataItem[fieldName] });
    let valueArr = _.values(mappedValues);
    return valueArr;
  }
}

