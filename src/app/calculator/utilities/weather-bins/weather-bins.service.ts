import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
/*
WEATHER BINS FIELD OPTIONS FROM "TMY3" CSV DATA FOUND AT
https://rredc.nrel.gov/solar/old_data/nsrdb/1991-2005/tmy3/by_state_and_city.html

Date and Time,

MAIN OPTIONS:
Dry-bulb (C)
RHum (%)
Dew-point (C)
Wspd (m/s)
Wdir (degrees)
Lprecip depth (mm)
Pressure (mbar)
*/

@Injectable()
export class WeatherBinsService {

  // dataFields: BehaviorSubject<Array<string>>;
  inputData: BehaviorSubject<WeatherBinsInput>;
  importDataFromCsv: BehaviorSubject<CsvImportData>;
  dataInDateRange: Array<any>;
  constructor(private convertUnitsService: ConvertUnitsService) {
    let initInputData: WeatherBinsInput = this.initInputData();
    this.inputData = new BehaviorSubject(initInputData);
    // this.dataFields = new BehaviorSubject(undefined);
    this.importDataFromCsv = new BehaviorSubject(undefined);
  }

  resetData() {
    let initInputData: WeatherBinsInput = this.initInputData();
    this.inputData.next(initInputData);
    this.importDataFromCsv.next(undefined);
  }

  save(newInputData: WeatherBinsInput, settings: Settings) {
    newInputData = this.calculateBins(newInputData, settings);
    this.inputData.next(newInputData);
  }

  // setDataFields(csvImportData: CsvImportData) {
  //   let dataFields: Array<string> = JSON.parse(JSON.stringify(csvImportData.meta.fields));
  //   console.log(dataFields);
  //   dataFields.shift();
  //   dataFields.shift();
  //   this.dataFields.next(dataFields);
  // }

  initInputData(): WeatherBinsInput {
    // let initCase: WeatherBinCase = this.getNewCase(1);
    return {
      fileName: '',
      startDay: 1,
      startMonth: 0,
      endDay: 31,
      endMonth: 11,
      cases: new Array(),
      autoBinParameter: 'Dry-bulb (C)',
      autoBinRangeValue: 10
    }
  }

  getNewCase(index: number): WeatherBinCase {
    let emptyCaseParameter: CaseParameter = this.getEmptyCaseParameter();
    return {
      caseName: 'Bin #' + index,
      caseParameters: [emptyCaseParameter],
      totalNumberOfDataPoints: 0
    }
  }

  getEmptyCaseParameter(): CaseParameter {
    return {
      field: undefined,
      lowerBound: undefined,
      upperBound: undefined
    }
  }

  calculateBins(inputData: WeatherBinsInput, settings: Settings): WeatherBinsInput {
    let dataInRange: Array<any> = this.getDataInDateRange(inputData);
    inputData.cases.forEach(weatherCase => {
      let convertedCaseParameters: Array<CaseParameter> = this.convertCaseParameters(weatherCase.caseParameters, settings);
      weatherCase.totalNumberOfDataPoints = this.calculateNumberOfParameterDataPoints(dataInRange, convertedCaseParameters);
    });
    let total = _.sumBy(inputData.cases, 'totalNumberOfDataPoints')
    console.log('Total ' + total);
    return inputData;
  }

  convertCaseParameters(caseParameters: Array<CaseParameter>, settings: Settings): Array<CaseParameter> {
    let caseParametersCopy: Array<CaseParameter> = JSON.parse(JSON.stringify(caseParameters));
    if (settings.unitsOfMeasure == 'Imperial') {
      caseParametersCopy.forEach(parameter => {
        if (parameter.lowerBound != undefined && parameter.upperBound) {
          if (parameter.field == 'Dry-bulb (C)' || parameter.field == 'Dew-point (C)') {
            parameter.lowerBound = this.convertUnitsService.value(parameter.lowerBound).from('F').to('C');
            parameter.upperBound = this.convertUnitsService.value(parameter.upperBound).from('F').to('C');
          } else if (parameter.field == 'Wspd (m/s)') {
            parameter.lowerBound = this.convertUnitsService.value(parameter.lowerBound).from('ft').to('m');
            parameter.upperBound = this.convertUnitsService.value(parameter.upperBound).from('ft').to('m');
          } else if (parameter.field == 'Pressure (mbar)') {
            parameter.lowerBound = this.convertUnitsService.value(parameter.lowerBound).from('inHg').to('mbar');
            parameter.upperBound = this.convertUnitsService.value(parameter.upperBound).from('inHg').to('mbar');
          } else if (parameter.field == 'Lprecip depth (mm)') {
            parameter.lowerBound = this.convertUnitsService.value(parameter.lowerBound).from('in').to('mm');
            parameter.upperBound = this.convertUnitsService.value(parameter.upperBound).from('in').to('mm');
          }
        }
      })
    }
    return caseParametersCopy;
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
    let fitsParameters: boolean = false;
    caseParameters.forEach(parameter => {
      if (dataPoint[parameter.field] > parameter.lowerBound && dataPoint[parameter.field] <= parameter.upperBound) {
        fitsParameters = true;
      }
    });
    return fitsParameters;
  }

  getDataInDateRange(inputData: WeatherBinsInput): Array<any> {
    let dataInDateRange: Array<any> = new Array();
    let importDataFromCsv: CsvImportData = this.importDataFromCsv.getValue();
    if (importDataFromCsv) {
      importDataFromCsv.data.forEach((dataItem) => {
        // let data = dataItem[field];
        //first field will be date if using correct format
        let dataItemDate = new Date(dataItem[importDataFromCsv.meta.fields[0]]);
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
    }
    return dataInDateRange;
  }


  setAutoBinCases(inputData: WeatherBinsInput, settings: Settings): WeatherBinsInput {
    let minAndMax: { min: number, max: number } = this.getParameterMinMax(inputData, inputData.autoBinParameter, settings);
    let lowerBound: number = Math.floor(minAndMax.min);
    let maxValue: number = Math.ceil(minAndMax.max);
    inputData.cases = new Array();
    let caseIndex: number = 1;
    for (lowerBound; lowerBound <= maxValue; lowerBound += inputData.autoBinRangeValue) {
      inputData.cases.push({
        caseName: 'Bin #' + caseIndex,
        caseParameters: [{
          field: inputData.autoBinParameter,
          lowerBound: lowerBound,
          upperBound: lowerBound + inputData.autoBinRangeValue
        }],
        totalNumberOfDataPoints: 0
      });
      caseIndex++;
    };
    return inputData;
  }

  getParameterMinMax(inputData: WeatherBinsInput, parameter: string, settings: Settings): { min: number, max: number } {
    let dataInDateRange: Array<any> = this.getDataInDateRange(inputData);
    let minValueObj: any = _.minBy(dataInDateRange, parameter);
    let maxValueObj: any = _.maxBy(dataInDateRange, parameter);
    let min: number = minValueObj[parameter];
    let max: number = maxValueObj[parameter];
    if (settings.unitsOfMeasure != 'Metric') {
      if (parameter == 'Dry-bulb (C)' || parameter == 'Dew-point (C)') {
        min = this.convertUnitsService.value(min).from('C').to('F');
        max = this.convertUnitsService.value(max).from('C').to('F');
      } else if (parameter == 'Wspd (m/s)') {
        min = this.convertUnitsService.value(min).from('m').to('ft');
        max = this.convertUnitsService.value(max).from('m').to('ft');
      } else if (parameter == 'Pressure (mbar)') {
        min = this.convertUnitsService.value(min).from('mbar').to('inHg');
        max = this.convertUnitsService.value(max).from('mbar').to('inHg');
      } else if (parameter == 'Lprecip depth (mm)') {
        min = this.convertUnitsService.value(min).from('mm').to('in');
        max = this.convertUnitsService.value(max).from('mm').to('in');
      }
    }
    return { min: min, max: max }
  }
}


export interface WeatherBinsInput {
  startMonth: number,
  startDay: number
  endDay: number,
  endMonth: number,
  cases: Array<WeatherBinCase>,
  fileName: string,
  autoBinParameter: string,
  autoBinRangeValue: number
}


export interface WeatherBinCase {
  caseName: string,
  caseParameters: Array<CaseParameter>,
  totalNumberOfDataPoints: number
}


export interface CaseParameter {
  field: string,
  lowerBound: number,
  upperBound: number
}