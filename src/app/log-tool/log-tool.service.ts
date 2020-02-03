import { Injectable } from '@angular/core';
import { CsvImportData } from '../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';
import { LogToolField } from './log-tool-models';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class LogToolService {

  importDataFromCsv: CsvImportData;
  startDate: Date;
  endDate: Date;
  fields: Array<LogToolField>;
  dateFields: Array<string>;
  dateFormat: Array<string>;
  numberOfDataPoints: number;
  dataCleaned: BehaviorSubject<boolean>;
  dataSubmitted: BehaviorSubject<boolean>;
  noDayTypeAnalysis: BehaviorSubject<boolean>;
  constructor() {
    this.dataSubmitted = new BehaviorSubject<boolean>(false);
    this.dataCleaned = new BehaviorSubject<boolean>(false);
    this.noDayTypeAnalysis = new BehaviorSubject<boolean>(false);
  }

  resetData() {
    this.importDataFromCsv = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.fields = new Array();
    this.dateFields = new Array();
    this.numberOfDataPoints = undefined;
    this.dateFormat = new Array();
    this.dataCleaned.next(false);
    this.dataSubmitted.next(false);
    this.noDayTypeAnalysis.next(false);
  }

  addDateField(str: string) {
    if (this.dateFields == undefined) {
      this.dateFields = new Array();
    }
    let testForExists: string = _.find(this.dateFields, (field) => { return field == str });
    if (testForExists == undefined) {
      this.dateFields.push(str);
    }
  }

  setImportDataFromCsv(data: CsvImportData) {
    this.importDataFromCsv = data;
  }

  addAdditionalCsvData(data: CsvImportData) {
    // this.importDataFromCsv.meta.fields = this.importDataFromCsv.meta.fields.concat(data.meta.fields);
    data.meta.fields.forEach(field => {
      let testExists: string = this.importDataFromCsv.meta.fields.find(currentField => {
        return currentField == field;
      });
      if(testExists == undefined){
        this.importDataFromCsv.meta.fields.push(field);
      }
    })
    this.importDataFromCsv.data = this.importDataFromCsv.data.concat(data.data);
  }

  parseImportData() {
    this.setFields(this.importDataFromCsv.meta.fields);
    // if (this.dateFields != undefined) {
    //   this.importDataFromCsv.data = _.filter(this.importDataFromCsv.data, (data) => { return data[this.dateField] != undefined });
    // }
    this.numberOfDataPoints = this.importDataFromCsv.data.length;
    if (this.noDayTypeAnalysis.getValue() == false) {
      this.importDataFromCsv.data = _.orderBy(this.importDataFromCsv.data, (data) => {
        let date: Date;
        this.dateFields.forEach(field => {
          if (data[field]) {
            date = new Date(data[field]);
          }
        })
        return date;
      }, ['asc']);
      let startDateItem = _.minBy(this.importDataFromCsv.data, (dataItem) => {
        let date: Date;
        this.dateFields.forEach(field => {
          if (dataItem[field]) {
            date = new Date(dataItem[field]);
          }
        })
        return date;
      });
      this.dateFields.forEach(field => {
        if (startDateItem[field]) {
          this.startDate = new Date(startDateItem[field]);
        }
      });
      let endDateItem = _.maxBy(this.importDataFromCsv.data, (dataItem) => {
        let date: Date;
        this.dateFields.forEach(field => {
          if (dataItem[field]) {
            date = new Date(dataItem[field]);
          }
        })
        return date;
      });
      this.dateFields.forEach(field => {
        if (endDateItem[field]) {
          this.endDate = new Date(endDateItem[field]);
        }
      });
    }
  }

  setFields(_fields: Array<string>) {
    this.fields = new Array();
    _fields.forEach(field => {
      let unit: string = '';
      let testExist = this.dateFields.find(dateField => { return field == dateField })
      if (testExist) {
        unit = 'Date';
      }
      this.fields.push({
        fieldName: field,
        alias: field,
        useField: true,
        isDateField: unit == 'Date',
        unit: unit
      });
    });
  }
}
