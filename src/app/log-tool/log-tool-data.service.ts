import { Injectable } from '@angular/core';
import { LogToolService } from './log-tool.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { LogToolDay, LogToolField, IndividualDataFromCsv } from './log-tool-models';
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
    _.remove(tmpFields, (field) => { return field.useField == false || field.isDateField == true });
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
    let individualDataFromCsv: Array<IndividualDataFromCsv> = JSON.parse(JSON.stringify(this.logToolService.individualDataFromCsv));
    this.logToolDays = new Array();
    individualDataFromCsv.forEach(csvData => {
      let startDate: Date = new Date(csvData.startDate);
      let endDate: Date = new Date(csvData.endDate);
      endDate.setDate(endDate.getDate() + 1);
      //iterate thru days from start day to end day
      for (let tmpDate = startDate; this.checkSameDay(tmpDate, endDate) != true; tmpDate.setDate(tmpDate.getDate() + 1)) {
        let filteredDayData: Array<any> = this.getDataForDay(tmpDate, csvData.csvImportData.data, csvData.dateField);
        if (filteredDayData.length != 0) {
          let hourlyAverages = this.getHourlyAverages(filteredDayData, csvData);
          this.logToolDays.push({
            date: new Date(tmpDate),
            data: filteredDayData,
            hourlyAverages: hourlyAverages
          });
        }
      }
    });
  }

  getHourlyAverages(dayData: Array<any>, csvData: IndividualDataFromCsv): Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> {
    let hourlyAverages: Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> = new Array();
    let fields: Array<LogToolField> = csvData.fields;
    for (let i = 0; i < 24; i++) {
      let filteredDaysByHour = _.filter(dayData, (dayItem) => {
        if (dayItem[csvData.dateField.fieldName]) {
          let date = new Date(dayItem[csvData.dateField.fieldName]);
          let dateVal = date.getHours();
          return i == dateVal;
        };
      });
      let averages: Array<{ value: number, field: LogToolField }> = new Array();
      fields.forEach(field => {
        if (field.isDateField == false && field.useField == true) {
          let hourFieldMean: number;
          if (filteredDaysByHour.length != 0) {
            hourFieldMean = _.meanBy(filteredDaysByHour, (filteredDay) => { return filteredDay[field.fieldName] });
          }
          averages.push({
            value: hourFieldMean,
            field: field
          })
        }
      })
      hourlyAverages.push({
        hour: i,
        averages: averages
      });

    }
    return hourlyAverages;
  }

  getDataForDay(date: Date, data: Array<any>, dateField: LogToolField): Array<any> {
    //filter matching day items from all day data and return array
    let filteredDayData: Array<any> = _.filter(data, (dataItem) => {
      let isSameDay: boolean = false;
      if (dataItem[dateField.fieldName] != undefined) {
        let dataItemDate: Date = new Date(dataItem[dateField.fieldName]);
        isSameDay = this.checkSameDay(date, dataItemDate);
      }
      return isSameDay;
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
    console.log(this.validNumberOfDayDataPoints);
  }

  getAllFieldData(fieldName: string): Array<number> {
    let data: Array<any> = this.getData(fieldName);
    let mappedValues: Array<any> = _.mapValues(data, (dataItem) => { return dataItem[fieldName] });
    let valueArr = _.values(mappedValues);
    return valueArr;
  }

  getData(fieldName: string): Array<any> {
    let data: Array<any> = new Array();
    this.logToolService.individualDataFromCsv.forEach(individualDataItem => {
      let foundData = individualDataItem.csvImportData.meta.fields.find(field => { return field == fieldName });
      if (foundData) {
        data = _.concat(data, individualDataItem.csvImportData.data);
      }
    });
    return data;
  };

  submitIndividualCsvData(individualDataFromCsv: Array<IndividualDataFromCsv>) {
    individualDataFromCsv.forEach(csvData => {
      csvData.dateField = csvData.fields.find(field => {
        return field.isDateField == true;
      });
      if (csvData.dateField == undefined) {
        csvData.hasDateField = false;
        csvData.startDate = undefined;
        csvData.endDate = undefined;
      } else {
        csvData.hasDateField = true;
        //update date field format
        csvData.csvImportData.data.map(dataItem => { dataItem[csvData.dateField.fieldName] = moment(dataItem[csvData.dateField.fieldName]).format('YYYY-MM-DD HH:mm:ss'); });
        //order by date descending
        csvData.csvImportData.data = _.sortBy(csvData.csvImportData.data, (dataItem) => {
          return dataItem[csvData.dateField.fieldName];
        }, ['desc']);
        //set start date
        csvData.startDate = csvData.csvImportData.data[0][csvData.dateField.fieldName];
        //find end date
        csvData.endDate = csvData.csvImportData.data[csvData.csvImportData.data.length - 1][csvData.dateField.fieldName];
        //find number of points per column
        csvData.dataPointsPerColumn = csvData.csvImportData.data.length;
      }
    });
  }
}

