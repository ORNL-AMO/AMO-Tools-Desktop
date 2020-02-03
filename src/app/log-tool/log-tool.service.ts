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
  dateField: string;
  dateFormat: Array<string>;
  numberOfDataPoints: number;
  dataCleaned: BehaviorSubject<boolean>;
  dataSubmitted: BehaviorSubject<boolean>;
  isModalOpen: BehaviorSubject<boolean>;
  noDayTypeAnalysis: BehaviorSubject<boolean>;

  constructor() { 
    this.dataSubmitted = new BehaviorSubject<boolean>(false);
    this.dataCleaned = new BehaviorSubject<boolean>(false);
    this.isModalOpen = new BehaviorSubject<boolean>(false);
    this.noDayTypeAnalysis = new BehaviorSubject<boolean>(false);
  }

  resetData() {
    this.importDataFromCsv = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.fields = new Array();
    this.dateField = undefined;
    this.numberOfDataPoints = undefined;
    this.dateFormat = new Array();
    this.dataCleaned.next(false);
    this.dataSubmitted.next(false);
    this.noDayTypeAnalysis.next(false);
  }

  setDateField(str: string) {
    this.dateField = str;
  }

  setImportDataFromCsv(data: CsvImportData) {
    this.importDataFromCsv = data;
  }

  parseImportData() {
    this.setFields(this.importDataFromCsv.meta.fields);
    if (this.dateField != undefined) {
      this.importDataFromCsv.data = _.filter(this.importDataFromCsv.data, (data) => { return data[this.dateField] != undefined });
    }
    this.numberOfDataPoints = this.importDataFromCsv.data.length;
    if (this.noDayTypeAnalysis.getValue() == false) {
      this.importDataFromCsv.data = _.orderBy(this.importDataFromCsv.data, (data) => { return new Date(data[this.dateField]) }, ['asc']);
      let startDateItem = _.minBy(this.importDataFromCsv.data, (dataItem) => {
        if (dataItem[this.dateField]) {
          return new Date(dataItem[this.dateField])
        }
      });
      this.startDate = new Date(startDateItem[this.dateField]);
      let endDateItem = _.maxBy(this.importDataFromCsv.data, (dataItem) => {
        if (dataItem[this.dateField]) {
          return new Date(dataItem[this.dateField])
        }
      });
      this.endDate = new Date(endDateItem[this.dateField]);
    }
  }

  setFields(_fields: Array<string>) {
    this.fields = new Array();
    _fields.forEach(field => {
      let unit: string;
      if (field == this.dateField) {
        unit = 'Date';
      }
      this.fields.push({
        fieldName: field,
        alias: field,
        useField: true,
        isDateField: field == this.dateField,
        unit: unit
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
