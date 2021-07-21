import { Injectable } from '@angular/core';
import { CsvImportData } from '../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';
import { LogToolField, IndividualDataFromCsv } from './log-tool-models';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class LogToolService {

  individualDataFromCsv: Array<IndividualDataFromCsv>;
  fields: Array<LogToolField>;
  dataCleaned: BehaviorSubject<boolean>;
  dataSubmitted: BehaviorSubject<boolean>;
  isModalOpen: BehaviorSubject<boolean>;
  noDayTypeAnalysis: BehaviorSubject<boolean>;
  constructor() {
    this.dataSubmitted = new BehaviorSubject<boolean>(false);
    this.dataCleaned = new BehaviorSubject<boolean>(false);
    this.isModalOpen = new BehaviorSubject<boolean>(false);
    this.noDayTypeAnalysis = new BehaviorSubject<boolean>(false);
    this.individualDataFromCsv = new Array();
  }

  resetData() {
    this.fields = new Array();
    this.dataCleaned.next(false);
    this.dataSubmitted.next(false);
    this.noDayTypeAnalysis.next(false);
    this.individualDataFromCsv = new Array();
  }

  addCsvData(data: CsvImportData, csvName: string,) {
    let csvId: string = Math.random().toString(36).substr(2, 9);
    let fields: Array<LogToolField> = data.meta.fields.map(field => {
      return {
        fieldName: field,
        alias: field,
        useField: true,
        isDateField: false,
        unit: '',
        invalidField: false,
        csvId: csvId,
        csvName: csvName
      }
    });
    this.individualDataFromCsv.push({ csvImportData: JSON.parse(JSON.stringify(data)), csvName: csvName, fields: fields, hasDateField: false });
  }

  setFields(individualDataFromCsv: Array<IndividualDataFromCsv>) {
    this.fields = _.flatMap(individualDataFromCsv, csvDataItem => { return csvDataItem.fields });
  }
}
