import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';


@Injectable()
export class WeatherBinsService {

  dataFields: BehaviorSubject<Array<string>>;
  inputData: BehaviorSubject<WeatherBinsInput>;
  importDataFromCsv: CsvImportData;
  dataInDateRange: Array<any>;
  constructor() {
    let initInputData: WeatherBinsInput = this.initInputData();
    this.inputData = new BehaviorSubject(initInputData);
    this.dataFields = new BehaviorSubject(undefined);
  }

  setDataFields(csvImportData: CsvImportData) {
    let dataFields: Array<string> = JSON.parse(JSON.stringify(csvImportData.meta.fields));
    dataFields.shift();
    dataFields.shift();
    this.dataFields.next(dataFields);
  }

  initInputData(): WeatherBinsInput {
    // let initCase: WeatherBinCase = this.getNewCase(1);
    return {
      startDay: 1,
      startMonth: 0,
      endDay: 30,
      endMonth: 11,
      cases: new Array()
    }
  }

  getNewCase(index: number): WeatherBinCase {
    let emptyCaseParameter: CaseParameter = this.getEmptyCaseParameter();
    return {
      caseName: 'Case #' + index,
      caseParameters: [emptyCaseParameter],
      totalNumberOfDataPoints: 0
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

  calculateBins(inputData: WeatherBinsInput): WeatherBinsInput {
    let dataInRange: Array<any> = this.getDataInDateRange(inputData);
    inputData.cases.forEach(weatherCase => {
      weatherCase.totalNumberOfDataPoints = this.calculateNumberOfParameterDataPoints(dataInRange, weatherCase.caseParameters);
    });
    return inputData;
  }

  calculateNumberOfParameterDataPoints(dataInDateRange: Array<any>, caseParameters: Array<CaseParameter>): number {
    let checkCaseValid: boolean = true;
    caseParameters.forEach(parameter => {
      if (parameter.field == undefined || parameter.upperBound == undefined || parameter.lowerBound == undefined) {
        checkCaseValid = false;
      }
    });
    let numDataPointsInParameters: number = 0;
    if (checkCaseValid == true) {
      dataInDateRange.forEach(dataPoint => {
        let doesDataFitParameters: boolean = this.checkDataPointFitsParameters(dataPoint, caseParameters);
        if (doesDataFitParameters == true) {
          numDataPointsInParameters++;
        }
      })
    }
    return numDataPointsInParameters;
  }

  checkDataPointFitsParameters(dataPoint: any, caseParameters: Array<CaseParameter>): boolean {
    let fitsParameters: boolean = true;
    caseParameters.forEach(parameter => {
      if (dataPoint[parameter.field] > parameter.upperBound || dataPoint[parameter.field] < parameter.lowerBound) {
        fitsParameters = false;
      }
    });
    return fitsParameters;
  }

  getDataInDateRange(inputData: WeatherBinsInput) {
    let dataInDateRange: Array<any> = new Array();
    this.importDataFromCsv.data.forEach((dataItem) => {
      // let data = dataItem[field];
      let dataItemDate = new Date(dataItem[this.importDataFromCsv.meta.fields[0]]);
      let dateMonth: number = dataItemDate.getMonth();
      let dateDay: number = dataItemDate.getDate();
      let checkMax: boolean = false;
      if (dateMonth <= inputData.endMonth) {
        if (dateMonth == inputData.endMonth) {
          if (dateDay <= inputData.endDay) {
            checkMax = true;
          }
        } else {
          checkMax = true;
        }
      }

      let checkMin: boolean = false;
      if (dateMonth >= inputData.startMonth) {
        if (dateMonth == inputData.startMonth) {
          if (dateDay >= inputData.startDay) {
            checkMin = true;
          }
        } else {
          checkMin = true;
        }
      }
      if (checkMax && checkMin) {
        dataInDateRange.push(dataItem);
      }
    })
    return dataInDateRange;
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
  caseParameters: Array<CaseParameter>,
  totalNumberOfDataPoints: number
}


export interface CaseParameter {
  field: string,
  lowerOperator: string,
  lowerBound: number,
  upperOperator: string,
  upperBound: number
}