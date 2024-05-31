import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData } from '../../../shared/helper-services/csv-to-json.service';
import * as _ from 'lodash';
import { Settings } from '../../../shared/models/settings';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { copyObject } from '../../../shared/helperFunctions';
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

  inputData: BehaviorSubject<WeatherBinsInput>;
  importDataFromCsv: BehaviorSubject<CsvImportData>;
  dataInDateRange: Array<any>;
  weatherDataSourceView: BehaviorSubject<WeatherDataSourceView>;
  dataSubmitted: BehaviorSubject<boolean>;
  integratedCalculator: BehaviorSubject<WeatherIntegratedCalculatorData>;
  currentField: BehaviorSubject<string>;

  constructor(private convertUnitsService: ConvertUnitsService) {
    let initInputData: WeatherBinsInput = this.initInputData();
    this.inputData = new BehaviorSubject(initInputData);
    this.weatherDataSourceView = new BehaviorSubject('lookup');
    this.importDataFromCsv = new BehaviorSubject(undefined);
    this.dataSubmitted = new BehaviorSubject<boolean>(false);
    this.integratedCalculator = new BehaviorSubject<WeatherIntegratedCalculatorData>(undefined);
    this.currentField = new BehaviorSubject<string>(undefined);
  }

  resetBinCaseData() {
    let initInputData: WeatherBinsInput = this.initInputData();
    this.inputData.next(initInputData);
    this.importDataFromCsv.next(undefined);
  }

  save(newInputData: WeatherBinsInput, settings: Settings) {
    newInputData = this.calculateBins(newInputData, settings);
    this.setGraphType(newInputData);
    this.inputData.next(newInputData);
  }

  initInputData(): WeatherBinsInput {
    return {
      fileName: '',
      startDay: 1,
      startMonth: 0,
      endDay: 31,
      endMonth: 11,
      cases: new Array(),
      graphType: undefined,
      binParameters: [{
        name: 'Dry-bulb (C)',
        range: 10,
        startingValue: undefined,
        endValue: undefined
      }],
      totalDataPoints: 0,
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
    let dataInDateRange: Array<any> = this.getDataInDateRange(inputData);
    let zCaseHours = [];
    let flattenedHours = [];

    // todo on delete ignore changes to customized
    inputData.cases.map((yParameterCase: WeatherBinCase, index) => {
     yParameterCase.lowerBoundWarnings = this.getLowerBoundWarnings(yParameterCase, index, inputData.cases);
     yParameterCase.upperBoundWarnings = this.getUpperBoundWarnings(yParameterCase, index, inputData.cases);
      let yCases = [];
      let yConvertedParameter: CaseParameter = {
        field: yParameterCase.field,
        lowerBound: yParameterCase.lowerBound,
        upperBound: yParameterCase.upperBound,
      };
      yConvertedParameter = this.convertParameterFields(yConvertedParameter, settings);
      if (yParameterCase.caseParameters.length !== 0) {
        yParameterCase.caseParameters.map((xParameter, xIndex) => {
          let caseMatchingHours: number = 0;
          xParameter.lowerBoundWarnings = this.getLowerBoundWarnings(xParameter, xIndex, yParameterCase.caseParameters);
          xParameter.upperBoundWarnings = this.getUpperBoundWarnings(xParameter, xIndex, yParameterCase.caseParameters);
          let xConvertedParameter = this.convertParameterFields(xParameter, settings);
          dataInDateRange.map(dataPoint => {
            let yMatches = dataPoint[yConvertedParameter.field] > yConvertedParameter.lowerBound && dataPoint[yConvertedParameter.field] <= yConvertedParameter.upperBound;
            let xMatches = dataPoint[xConvertedParameter.field] > xConvertedParameter.lowerBound && dataPoint[xConvertedParameter.field] <= xConvertedParameter.upperBound;
            if (xMatches && yMatches) {
              caseMatchingHours++;
            }
          });
          xParameter.totalNumberOfDataPoints = caseMatchingHours;
          yCases.push(caseMatchingHours);
          flattenedHours.push(caseMatchingHours);
        });
        yParameterCase.totalNumberOfDataPoints = yParameterCase.caseParameters.reduce((total, current) => total + current.totalNumberOfDataPoints, 0);
      } else {
        let caseMatchingHours: number = 0;
        dataInDateRange.map(dataPoint => {
          let yMatches = dataPoint[yConvertedParameter.field] > yConvertedParameter.lowerBound && dataPoint[yConvertedParameter.field] <= yConvertedParameter.upperBound;
          if (yMatches) {
            caseMatchingHours++;
          }
        });
        yParameterCase.totalNumberOfDataPoints = caseMatchingHours;
      }

      zCaseHours.push(yCases);
      inputData.heatMapHoursMatrix = zCaseHours;

      inputData.multiBinDetails = {
        min: Math.min(...flattenedHours), 
        max: Math.max(...flattenedHours), 
      }
    });

    inputData.totalDataPoints = inputData.cases.reduce((total, current) => total + current.totalNumberOfDataPoints, 0)
    return inputData;
  }

    getUpperBoundWarnings(currentBin: WeatherBinCase | CaseParameter, currentIndex: number, binCases: Array<WeatherBinCase | CaseParameter>) {
    let warnings: BoundWarnings;
    let nextBin: WeatherBinCase | CaseParameter;

    if (currentIndex < binCases.length - 1) {
      nextBin = binCases[currentIndex + 1]
    }

    if (currentBin.upperBound !== undefined && currentBin.upperBound !== null) {
      if (nextBin && currentBin.upperBound > nextBin.lowerBound) {
        warnings = {...warnings, nextLowerBound: nextBin.lowerBound}
      }
      if (currentBin.upperBound < currentBin.lowerBound) {
        warnings = {
          greaterThan: currentBin.lowerBound
        }
      }
    } else {
      warnings = {
        requiredWarning: true
      }
    }
    return warnings;
  }

  getLowerBoundWarnings(currentBin: WeatherBinCase | CaseParameter, currentIndex: number, binCases: Array<WeatherBinCase | CaseParameter>) {
    let warnings: BoundWarnings;
    let previousBin: WeatherBinCase | CaseParameter;

    if (currentIndex > 0) {
      previousBin = binCases[currentIndex - 1];
    }

    if (currentBin.lowerBound !== undefined && currentBin.lowerBound !== null) {
      if (previousBin && currentBin.lowerBound < previousBin.upperBound) {
        warnings = {
          prevUpperBound: previousBin.upperBound
        }
      }
      if (currentBin.lowerBound > currentBin.upperBound) {
        warnings = {
          lessThan: currentBin.upperBound
        }
      }
    } else {
      warnings = {
        requiredWarning: true
      }
    }
    return warnings;
  }

  getfilledLabelRangeString(settings: Settings, fieldName: string, lowerBound: number, upperBound: number, rangeOnly? : boolean) {
    let lower = lowerBound < 0? `(${lowerBound})`: lowerBound;
    let upper = upperBound < 0? `(${upperBound})`: upperBound;
    let paramRange = `${lower} - ${upper}`;
    if (rangeOnly) {
      return paramRange;
    }
    fieldName = this.getParameterLabelFromCSVName(fieldName, settings);
    return `${fieldName} ${paramRange}`;
  }

  convertParameterFields(parameter: CaseParameter, settings: Settings) {
    let convertedParameter: CaseParameter = {
      field: parameter.field,
      lowerBound: parameter.lowerBound,
      upperBound: parameter.upperBound
    }

    if (settings.unitsOfMeasure != 'Metric') {
      if (parameter.lowerBound != undefined && parameter.upperBound !== undefined) {
        if (parameter.field == 'Dry-bulb (C)' || parameter.field == 'Dew-point (C)' || parameter.field == 'Wet Bulb (C)') {
          convertedParameter.lowerBound = this.convertUnitsService.value(convertedParameter.lowerBound).from('F').to('C');
          convertedParameter.upperBound = this.convertUnitsService.value(convertedParameter.upperBound).from('F').to('C');
        } else if (parameter.field == 'Wspd (m/s)') {
          convertedParameter.lowerBound = this.convertUnitsService.value(convertedParameter.lowerBound).from('ft').to('m');
          convertedParameter.upperBound = this.convertUnitsService.value(convertedParameter.upperBound).from('ft').to('m');
        } else if (parameter.field == 'Pressure (mbar)') {
          convertedParameter.lowerBound = this.convertUnitsService.value(convertedParameter.lowerBound).from('inHg').to('mbar');
          convertedParameter.upperBound = this.convertUnitsService.value(convertedParameter.upperBound).from('inHg').to('mbar');
        } else if (parameter.field == 'Lprecip depth (mm)') {
          convertedParameter.lowerBound = this.convertUnitsService.value(convertedParameter.lowerBound).from('in').to('mm');
          convertedParameter.upperBound = this.convertUnitsService.value(convertedParameter.upperBound).from('in').to('mm');
        }
      }
    }
    return convertedParameter;
  }

  setGraphType(weatherBinsInput: WeatherBinsInput) {
    if (weatherBinsInput.binParameters.length === 1 || (weatherBinsInput.binParameters.length > 1
      && weatherBinsInput.cases.length > 0 && weatherBinsInput.cases[0].caseParameters.length === 0)) {
      weatherBinsInput.graphType = 'bar';
    }

    if (weatherBinsInput.binParameters.length > 1
      && weatherBinsInput.cases.length > 0
      && weatherBinsInput.cases[0].caseParameters.length > 0) {
      weatherBinsInput.graphType = 'heatmap';
    }
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
    inputData.cases = new Array();
    inputData.binParameters.map((binParam, binParametersIndex) => {
      let isParentBinParameter: boolean = binParametersIndex === 0;
      let lowerBound = binParam.startingValue;
      let caseIndex: number = 0;
      let upperBound = 0;
      
      for (lowerBound; upperBound <= binParam.endValue; lowerBound += binParam.range) {
        upperBound = lowerBound + binParam.range;
        let caseParameter: CaseParameter = {
          field: binParam.name,
          lowerBound: lowerBound,
          upperBound: upperBound
        }

        if (isParentBinParameter) {
          let yParameterBin: WeatherBinCase = {
            caseName: this.getfilledLabelRangeString(settings, binParam.name, lowerBound, upperBound),
            field: binParam.name,
            lowerBound: lowerBound,
            upperBound: upperBound,
            caseParameters: [],
            totalNumberOfDataPoints: 0
          }
          inputData.cases.push(yParameterBin);
        } else {
          inputData.cases.map(yParameterBin => {
            yParameterBin.caseParameters.push(caseParameter)
          })
        }

        caseIndex++;
      };
    });

    return inputData;
  }

  setAutoSubBins(inputData: WeatherBinsInput): WeatherBinsInput {
    let xBinParam = inputData.binParameters[1];
    if (xBinParam) {
      let lowerBound = xBinParam.startingValue;
      let caseIndex: number = 0;
      let upperBound = 0;

      for (lowerBound; upperBound <= xBinParam.endValue; lowerBound += xBinParam.range) {
        upperBound = lowerBound + xBinParam.range;
        let caseParameter: CaseParameter = {
          field: xBinParam.name,
          lowerBound: lowerBound,
          upperBound: upperBound
        }
        inputData.cases.map(yParameterBin => {
          yParameterBin.caseParameters.push(caseParameter)
        })
        caseIndex++;
      };
    }

    return inputData;
  }

  getParameterOptions(settings: Settings) {
    return settings.unitsOfMeasure === 'Metric'? copyObject(MetricParameterOptions) : copyObject(ImperialParameterOptions);
  }

  getParameterLabelFromCSVName(csvDataLabel:string, settings: Settings): string {
    let parameterOptions = this.getParameterOptions(settings);
    return parameterOptions.find(option => option.value === csvDataLabel).display;
  }
  getParameterMinMax(inputData: WeatherBinsInput, parameter: string, settings: Settings): { min: number, max: number } {
    let dataInDateRange: Array<any> = this.getDataInDateRange(inputData);
    let minValueObj: any = _.minBy(dataInDateRange, parameter);
    let maxValueObj: any = _.maxBy(dataInDateRange, parameter);
    let min: number = minValueObj[parameter];
    let max: number = maxValueObj[parameter];
      if (settings.unitsOfMeasure != 'Metric') {
        if (parameter == 'Dry-bulb (C)' || parameter == 'Wet Bulb (C)' || parameter == 'Dew-point (C)') {
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
    return { min: Math.floor(min), max: Math.ceil(max) }
  }
}


export interface WeatherBinsInput {
  startMonth: number,
  startDay: number
  endDay: number,
  endMonth: number,
  cases: Array<WeatherBinCase>,
  multiBinDetails?: {
    min: number, max: number
  }
  heatMapHoursMatrix?: Array<Array<any>>,
  fileName: string,
  totalDataPoints: number,
  graphType: 'heatmap' | 'bar' | undefined,
  binParameters?: BinParameter[],
}

export interface BinParameter {
  name: string,
  min?: number,
  max?: number,
  range: number,
  startingValue: number,
  endValue: number,
}


export interface WeatherBinCase {
  caseName: string,
  field?: string,
  lowerBound?: number,
  upperBound?: number
  caseParameters: Array<CaseParameter>,
  totalNumberOfDataPoints: number,
  lowerBoundWarnings?: BoundWarnings,
  upperBoundWarnings?: BoundWarnings
}



export interface CaseParameter {
  field: string,
  lowerBound: number,
  upperBound: number,
  totalNumberOfDataPoints?: number,
  lowerBoundWarnings?: BoundWarnings,
  upperBoundWarnings?: BoundWarnings
}

export interface BoundWarnings {
  requiredWarning?: boolean,
  greaterThan?: number,
  lessThan?: number,
  prevUpperBound?: number,
  nextLowerBound?: number,
}

export interface WeatherIntegratedCalculatorData {
  binningParameters: Array<string>
}

export type WeatherDataSourceView = "both" | "lookup" | "file";

export const ImperialParameterOptions: Array<{display: string, value: string}> = [
  {display: "Dry-bulb Temperature (F)", value: "Dry-bulb (C)"},
  {display: "Wet-bulb Temperature (F)", value: "Wet Bulb (C)"},
  {display: "Relative Humidity (%)", value: "RHum (%)"},
  {display: "Dew-point (F)", value: "Dew-point (C)"},
  {display: "Wind Speed (ft/s)", value: "Wspd (m/s)"},
  {display: "Wind Direction (degrees)", value: "Wdir (degrees)"},
  {display: "Liquid Precipitation Depth (in)", value: "Lprecip depth (mm)"},
  {display: "Pressure (in Hg)", value: "Pressure (mbar)"},
];

export const MetricParameterOptions: Array<{display: string, value: string}> = [
  {display: "Dry-bulb Temperature (C)", value: "Dry-bulb (C)"},
  {display: "Wet-bulb Temperature (C)", value: "Wet Bulb (C)"},
  {display: "Relative Humidity (%)", value: "RHum (%)"},
  {display: "Dew-point (C)", value: "Dew-point (C)"},
  {display: "Wind Speed (m/s)", value: "Wspd (m/s)"},
  {display: "Wind Direction (degrees)", value: "Wdir (degrees)"},
  {display: "Liquid Precipitation Depth (mm)", value: "Lprecip depth (mm)"},
  {display: "Pressure (mbar)", value: "Pressure (mbar)"},
];
