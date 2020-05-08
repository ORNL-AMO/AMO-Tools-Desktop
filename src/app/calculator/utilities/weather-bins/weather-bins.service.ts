import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';

@Injectable()
export class WeatherBinsService {

  dataFields: BehaviorSubject<Array<string>>;
  inputData: BehaviorSubject<WeatherBinsInput>
  constructor() {
    let initInputData: WeatherBinsInput = this.initInputData();
    this.inputData = new BehaviorSubject(initInputData);
    this.dataFields = new BehaviorSubject(undefined);
  }

  setDataFields(csvImportData: CsvImportData) {
    this.dataFields.next(csvImportData.meta.fields);
  }

  initInputData(): WeatherBinsInput {
    let initCase: WeatherBinCase = this.getNewCase(1);
    return {
      startDay: 1,
      startMonth: 0,
      endDay: 30,
      endMonth: 11,
      cases: [initCase]
    }
  }

  getNewCase(index: number): WeatherBinCase {
    let emptyCaseParameter: CaseParameter = this.getEmptyCaseParameter();
    return {
      caseName: 'Case #' + index,
      caseParameters: [emptyCaseParameter]
    }
  }

  getEmptyCaseParameter(): CaseParameter {
    return {
      field: undefined,
      lowerOperator: undefined,
      lowerBound: undefined,
      upperOperator: undefined,
      upperBound: undefined
    }
  }
}


export interface WeatherBinsInput {
  startMonth: number,
  startDay: number
  endDay: number,
  endMonth: number,
  cases: Array<WeatherBinCase>
}


export interface WeatherBinCase {
  caseName: string,
  caseParameters: Array<CaseParameter>
}


export interface CaseParameter {
  field: string,
  lowerOperator: string,
  lowerBound: number,
  upperOperator: string,
  upperBound: number
}