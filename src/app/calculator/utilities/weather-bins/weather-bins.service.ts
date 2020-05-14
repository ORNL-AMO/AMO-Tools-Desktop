import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
/*
WEATHER BINS FIELD OPTIONS FROM "TMY3" CSV DATA FOUND AT
https://rredc.nrel.gov/solar/old_data/nsrdb/1991-2005/tmy3/by_state_and_city.html

Date (MM/DD/YYYY),
Time (HH:MM),

MAIN OPTIONS:
Dry-bulb (C)
RHum (%)
Dew-point (C)

ADDITIONAL OPTIONS:
ETR (W/m^2),
ETRN (W/m^2),
GHI (W/m^2),
GHI uncert (%),
DNI (W/m^2),
DNI uncert (%),
DHI (W/m^2),
DHI uncert (%),
GH illum (lx),
Global illum uncert (%),
DN illum (lx),
DN illum uncert (%),
DH illum (lx),
DH illum uncert (%),
Zenith lum (cd/m^2),
TotCld (tenths),
OpqCld (tenths),
Dry-bulb (C),
Dew-point (C),
RHum (%),
Pressure (mbar),
Wdir (degrees),
Wspd (m/s),
Hvis (m),
CeilHgt (m),
Pwat (cm),
AOD (unitless),
Alb (unitless),
Lprecip depth (mm),
Lprecip quantity (hr),
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
    return inputData;
  }

  convertCaseParameters(caseParameters: Array<CaseParameter>, settings: Settings): Array<CaseParameter> {
    let caseParametersCopy: Array<CaseParameter> = JSON.parse(JSON.stringify(caseParameters));
    if (settings.unitsOfMeasure == 'Imperial') {
      caseParametersCopy.forEach(parameter => {
        if ((parameter.field == 'Dry-bulb (C)' || 'Dew-point (C)') && parameter.lowerBound != undefined && parameter.upperBound) {
          parameter.lowerBound = this.convertUnitsService.value(parameter.lowerBound).from('C').to('F');
          parameter.upperBound = this.convertUnitsService.value(parameter.upperBound).from('C').to('F');
        }
        // else if (parameter.field == 'Atm Pressure (psia)') {
        //   parameter.lowerBound = this.convertUnitsService.value(parameter.lowerBound).from('Pa').to('psia');
        //   parameter.upperBound = this.convertUnitsService.value(parameter.upperBound).from('Pa').to('psia');
        // } else if (parameter.field == 'Enthalpy (BTU/lbm)') {
        //   parameter.lowerBound = this.convertUnitsService.value(parameter.lowerBound).from('kJkg').to('btuLb');
        //   parameter.upperBound = this.convertUnitsService.value(parameter.upperBound).from('kJkg').to('btuLb');
        // }
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
}


export interface WeatherBinsInput {
  startMonth: number,
  startDay: number
  endDay: number,
  endMonth: number,
  cases: Array<WeatherBinCase>,
  fileName: string
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