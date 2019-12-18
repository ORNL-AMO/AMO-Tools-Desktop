import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable()
export class CsvToJsonService {

  constructor() { }

  parseCSV(csvData: any): CsvImportData {
    let results: CsvImportData = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true
    });
    return results;
  }
}


export interface CsvImportData {
  meta: {
    aborted: boolean,
    delimeter: string,
    fields: Array<string>,
    linebreak: string,
    truncated: boolean;
  },
  errors: Array<{ code: string, message: string, row: number, type: string }>,
  data: Array<any>,
}