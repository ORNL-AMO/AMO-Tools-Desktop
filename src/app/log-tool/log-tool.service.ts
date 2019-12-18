import { Injectable } from '@angular/core';
import { CsvImportData } from '../shared/helper-services/csv-to-json.service';

@Injectable()
export class LogToolService {

  fileReference: any;
  importDataFromCsv: CsvImportData;
  constructor() { }
}
