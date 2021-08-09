import { Injectable } from '@angular/core';
import { LogToolService } from './log-tool.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { LogToolDay, LogToolField, IndividualDataFromCsv } from './log-tool-models';
@Injectable()
export class LogToolDataService {

  logToolDays: Array<LogToolDay>;
  isTimeSeries: boolean;
  constructor(private logToolService: LogToolService) { }

  resetData() {
    this.logToolDays = new Array();
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
      let dataForDays: Array<{ date: Date, data: Array<any> }> = this.divideDataIntoDays(csvData.csvImportData.data, csvData.dateField.fieldName);
      dataForDays.forEach(day => {
        let hourlyAverages = this.getHourlyAverages(day.data, csvData);
        this.addLogToolDay(new Date(day.date), hourlyAverages);
      });
    });
  }

  addLogToolDay(dayDate: Date, hourlyAverages: Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }>) {
    let existingDayIndex = this.logToolDays.findIndex(logToolDay => { return this.checkSameDay(logToolDay.date, dayDate) });
    if (existingDayIndex != -1) {
      this.logToolDays[existingDayIndex].hourlyAverages.forEach(hourItem => {
        let addtionalAverages = hourlyAverages.find(hourlyAverage => { return hourlyAverage.hour == hourItem.hour });
        hourItem.averages = _.union(hourItem.averages, addtionalAverages.averages);
      });
    } else {
      this.logToolDays.push({
        date: dayDate,
        hourlyAverages: hourlyAverages
      });
    }
  }


  getHourlyAverages(dayData: Array<any>, csvData: IndividualDataFromCsv): Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> {
    let hourlyAverages: Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> = new Array();
    let fields: Array<LogToolField> = csvData.fields;
    for (let hourOfDay = 0; hourOfDay < 24; hourOfDay++) {
      //filter day data by hour
      let filteredDaysByHour = _.filter(dayData, (dayItem) => {
        if (dayItem[csvData.dateField.fieldName]) {
          let date = new Date(dayItem[csvData.dateField.fieldName]);
          let dayDataHourVal = date.getHours();
          return hourOfDay == dayDataHourVal;
        };
      });
      let averages: Array<{ value: number, field: LogToolField }> = new Array();
      //iterate each field and get averages for the hour
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
        hour: hourOfDay,
        averages: averages
      });

    }
    return hourlyAverages;
  }

  checkSameDay(day1: Date, day2: Date) {
    return moment(day1).isSame(day2, 'day');
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
    this.isTimeSeries = true;
    individualDataFromCsv.forEach(csvData => {
      if (csvData.hasDateField == false) {
        csvData.startDate = undefined;
        csvData.endDate = undefined;
        this.isTimeSeries = false;
      } 
      else {
        //update date field format
        if (csvData.hasDateField == true && csvData.hasTimeField == true) {
          csvData.csvImportData.data.map(dataItem => { 
                      if (dataItem[csvData.dateField.fieldName]) {
                        dataItem[csvData.dateField.fieldName] = moment(dataItem[csvData.dateField.fieldName].toString().split(" ")[0] + " " + dataItem[csvData.timeField.fieldName]).format('YYYY-MM-DD HH:mm:ss'); 
                      }
                      else {
                        dataItem[csvData.dateField.fieldName] = 'Invalid date';
                      }
                    });
        }
        else {
          csvData.csvImportData.data.map(dataItem => { dataItem[csvData.dateField.fieldName] = moment(dataItem[csvData.dateField.fieldName]).format('YYYY-MM-DD HH:mm:ss'); });
        }
        //remove invalid dates
        _.remove(csvData.csvImportData.data, (dataItem) => {
          return dataItem[csvData.dateField.fieldName] == 'Invalid date';
        });
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

  divideDataIntoDays(data: Array<any>, dateField: string): Array<{ date: Date, data: Array<any> }> {
    let dayData = new Array();
    let individualDayData: Array<any> = new Array();
    //start date item
    let currentDate: Date = new Date(data[0][dateField]);
    //iterage each data row
    data.forEach(dataItem => {
      //date for datarow
      let dataItemDate: Date = new Date(dataItem[dateField]);
      //if same day add data to individual array
      if (this.checkSameDay(currentDate, dataItemDate)) {
        individualDayData.push(dataItem);
      } else {
        //otherwise set day summary
        dayData.push({
          date: currentDate,
          data: individualDayData
        });
        //re initialize
        individualDayData = new Array();
        currentDate = new Date(dataItem[dateField]);
      }
    });
    //add final day
    dayData.push({
      date: currentDate,
      data: individualDayData
    });
    return dayData;
  }

  getDataInRange(dataField: LogToolField, xField: LogToolField, xMin: any, xMax: any, dataMin: number, dataMax: number): Array<any> {
    let csvData: IndividualDataFromCsv = this.logToolService.individualDataFromCsv.find(csvData => { return csvData.csvName == dataField.csvName });
    let data: Array<any> = _.filter(csvData.csvImportData.data, (dataItem => {
      if (xField.isDateField == true) {
        let dateField: LogToolField = csvData.fields.find(field => {return field.isDateField})
        return (new Date(dataItem[dateField.fieldName]).valueOf() > new Date(xMin).valueOf() && new Date(dataItem[dateField.fieldName]).valueOf() < new Date(xMax).valueOf() && dataItem[dataField.fieldName] > dataMin && dataItem[dataField.fieldName] < dataMax);
      } else {
        return (dataItem[xField.fieldName] > xMin && dataItem[xField.fieldName] < xMax && dataItem[dataField.fieldName] > dataMin && dataItem[dataField.fieldName] < dataMax);
      }
    }));
    let mappedValues: Array<any> = _.mapValues(data, (dataItem) => { return dataItem[dataField.fieldName] });
    let valueArr = _.values(mappedValues);
    return valueArr;
  }
}

