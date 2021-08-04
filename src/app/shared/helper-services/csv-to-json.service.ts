import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable()
export class CsvToJsonService {

  constructor() { }

  parseCsvWithHeaders(csvData: any, headerRow: number): CsvImportData {
    let results: CsvImportData;
    if (headerRow == 0) {
      results = Papa.parse(csvData, {
        header: true,
        dynamicTyping: true
      });
    } else {
      results = Papa.parse(csvData, {
        dynamicTyping: true
      });
      results.meta.fields = results.data[headerRow];
      results.data = results.data.splice(headerRow + 1);
      results.data = results.data.map(dataItem => {
        let element = {};
        results.meta.fields.forEach((field, index) => {
          element[field] = dataItem[index];
        });
        return element;
      })
    }
    //last item ends up as null
    results.data.pop();
    return results;
  }

  parseCsvWithoutHeaders(csvData: any): CsvImportData {
    let results: CsvImportData;
    results = Papa.parse(csvData, {
      dynamicTyping: true
    });
    //last item ends up as null
    results.data.pop();
    return results;

  }

  parseWeatherCSV(csvData: any): CsvImportData {
    let results: CsvImportData = Papa.parse(csvData, {
      // header: true,
      dynamicTyping: true
    });
    results.data.shift();

    let unparsed = Papa.unparse(results.data);
    results = Papa.parse(unparsed, {
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