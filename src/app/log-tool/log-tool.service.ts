import { Injectable } from '@angular/core';
import { CsvImportData } from '../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';
import { LogToolField } from './log-tool-models';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class LogToolService {

  combinedDataFromCsv: CsvImportData;
  individualDataFromCsv: Array<{
    data: CsvImportData,
    csvName: string,
    isDateValid: boolean
  }>;
  startDate: Date;
  endDate: Date;
  fields: Array<LogToolField>;
  dateFields: Array<string>;
  dateFormat: Array<string>;
  numberOfDataPoints: number;
  dataCleaned: BehaviorSubject<boolean>;
  dataSubmitted: BehaviorSubject<boolean>;
  isModalOpen: BehaviorSubject<boolean>;
  noDayTypeAnalysis: BehaviorSubject<boolean>;
  invalidDateDataFromCsv: CsvImportData;
  constructor() {
    this.dataSubmitted = new BehaviorSubject<boolean>(false);
    this.dataCleaned = new BehaviorSubject<boolean>(false);
    this.isModalOpen = new BehaviorSubject<boolean>(false);
    this.noDayTypeAnalysis = new BehaviorSubject<boolean>(false);
    this.individualDataFromCsv = new Array();
  }

  resetData() {
    this.combinedDataFromCsv = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.fields = new Array();
    this.dateFields = new Array();
    this.numberOfDataPoints = undefined;
    this.dateFormat = new Array();
    this.dataCleaned.next(false);
    this.dataSubmitted.next(false);
    this.noDayTypeAnalysis.next(false);
    this.individualDataFromCsv = new Array();
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

  setImportDataFromCsv(data: CsvImportData, csvName: string, isDateValid: boolean) {
    if (this.individualDataFromCsv == undefined) {
      this.individualDataFromCsv = new Array();
    }
    this.individualDataFromCsv.push({ data: JSON.parse(JSON.stringify(data)), csvName: csvName, isDateValid: isDateValid });
    this.combinedDataFromCsv = data;
  }

  addAdditionalCsvData(data: CsvImportData, csvName: string, isDateValid: boolean) {
    this.individualDataFromCsv.push({ data: JSON.parse(JSON.stringify(data)), csvName: csvName, isDateValid: isDateValid });
    data.meta.fields.forEach(field => {
      let testExists: string = this.combinedDataFromCsv.meta.fields.find(currentField => {
        return currentField == field;
      });
      if (testExists == undefined) {
        this.combinedDataFromCsv.meta.fields.push(field);
      }
    })
    this.combinedDataFromCsv.data = this.combinedDataFromCsv.data.concat(data.data);
  }

  parseImportData() {
    this.setFields(this.combinedDataFromCsv.meta.fields);
    this.numberOfDataPoints = this.combinedDataFromCsv.data.length;
    if (this.noDayTypeAnalysis.getValue() == false) {
      this.combinedDataFromCsv.data = _.sortBy(this.combinedDataFromCsv.data, (data) => {
        let date: Date;
        this.dateFields.forEach(field => {
          if (data[field]) {
            date = new Date(data[field]);
          }
        })
        return date;
      }, ['desc']);
      
      let startDateItem = _.minBy(this.combinedDataFromCsv.data, (dataItem) => {
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
      let endDateItem = _.maxBy(this.combinedDataFromCsv.data, (dataItem) => {
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
      if (this.dateFields) {
        let testExist = this.dateFields.find(dateField => { return field == dateField })
        if (testExist) {
          unit = 'Date';
        }
      }
      this.fields.push({
        fieldName: field,
        alias: field,
        useField: true,
        isDateField: unit == 'Date',
        unit: unit,
        invalidField: false
      });
    });
  }

  updateFieldUnit(fieldToUpdate: LogToolField){
    this.fields.forEach(field => {
      if(field.fieldName == fieldToUpdate.fieldName){
        field = fieldToUpdate;
      }
    })
  }
}
