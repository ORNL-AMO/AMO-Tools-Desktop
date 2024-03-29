import { Injectable } from '@angular/core';
import { CsvImportData } from '../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';
import { LogToolField, IndividualDataFromCsv, ExplorerDataSet } from './log-tool-models';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class LogToolService {

  individualDataFromCsv: Array<IndividualDataFromCsv | ExplorerDataSet>;
  fields: Array<LogToolField>;
  isModalOpen: BehaviorSubject<boolean>;
  noDayTypeAnalysis: BehaviorSubject<boolean>;
  openExportData: BehaviorSubject<boolean>;
  setupContainerHeight: BehaviorSubject<number>;
  constructor() {
    this.isModalOpen = new BehaviorSubject<boolean>(false);
    this.noDayTypeAnalysis = new BehaviorSubject<boolean>(false);
    this.individualDataFromCsv = new Array();
    this.openExportData = new BehaviorSubject<boolean>(false);
    this.setupContainerHeight = new BehaviorSubject<number>(undefined);
  }

  resetData() {
    this.fields = new Array();
    this.noDayTypeAnalysis.next(false);
    this.individualDataFromCsv = new Array();
    this.openExportData.next(false);
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
        csvName: csvName,
        fieldId: Math.random().toString(36).substr(2, 9)
      }
    });
    this.individualDataFromCsv.push({ csvImportData: JSON.parse(JSON.stringify(data)), csvName: csvName, fields: fields, hasDateField: false });
  }

  setAllAvailableFields(individualDataFromCsv: Array<IndividualDataFromCsv>) {
    // All fields regardless of marked for use
    this.fields = _.flatMap(individualDataFromCsv, csvDataItem => { return csvDataItem.fields });
  }
}
