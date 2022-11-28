import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable()
export class CsvToJsonService {

  constructor() { }

  parseCSVasync(fileData, shouldDownload: boolean, headerRow: number): Promise<CsvImportData> {
    return new Promise((resolve, reject) => {
      // With worker true, papa returns async
      return Papa.parse(fileData.data, {
        header: headerRow == 0,
        dynamicTyping: true,
        worker: true,
        download: shouldDownload,
        complete: results => {
          results.name = fileData.name;
          results.dataSetId = fileData.dataSetId;
          if (headerRow != 0) {
            results.meta.fields = results.data[headerRow];
            results.data = results.data.splice(headerRow + 1);
            results.data = results.data.map(dataItem => {
              let element = {};
              results.meta.fields.forEach((field, index) => {
                element[field] = dataItem[index];
              });
              return element;
            });
          }
          //last item ends up as null
          results.data.pop();
          resolve(results);
        },
        error: error => {
          console.log('error', error)
        },
      });
    });
  }
  
  parseCsvWithoutHeaders(csvData: any): Promise<CsvImportData> {
    return new Promise((resolve, reject) => {
      return Papa.parse(csvData, {
        dynamicTyping: true,
        worker: true,
        complete: results => {
          //last item ends up as null
          results.data.pop();
          resolve(results);
        },
        error: error => {
          console.log('error', error)
        },
      });
    });

  }
  
  parseExampleCSV(): Promise<any> {
    return new Promise((resolve, reject) => {
      Papa.parse("assets/data-explorer-example.csv", {
        header: true,
        dynamicTyping: true,
        download: true,
        complete: results => {
           //last item ends up as null
           results.data.pop();
          resolve(results);
        },
        error: results => {
          reject(true);
        },
      });
    });
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

  // Weather calc old method
  parseCSV(csvData: any): CsvImportData {
    let results: CsvImportData = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true
    });
    //last item ends up as null
    results.data.pop();
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
  name?: string,
  dataSetId?: string,
  errors: Array<{ code: string, message: string, row: number, type: string }>,
  data: Array<any>,
}