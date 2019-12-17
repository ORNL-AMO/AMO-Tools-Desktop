import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable()
export class CsvToJsonService {

  constructor() { }

  parseCSV(csvData: any) {
    let results = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true
    });
    console.log(results);
    console.log("headers");
    results.meta.fields.forEach(field => {
      console.log(field);
    })
  }
}
