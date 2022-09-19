import { Injectable } from '@angular/core';
import { LogToolService } from './log-tool.service';
import moment from 'moment';
import * as _ from 'lodash';
import { LogToolDay, LogToolField, IndividualDataFromCsv, ExplorerData, ExplorerFileData, ExplorerDataSet, StepMovement, LoadingSpinner, RefineDataStepStatus, LogToolDbData } from './log-tool-models';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData, CsvToJsonService } from '../shared/helper-services/csv-to-json.service';

@Injectable()
export class LogToolDataService {

  logToolDays: Array<LogToolDay>;
  isTimeSeries: boolean;
  dataIntervalValid: BehaviorSubject<boolean>;

  loadingSpinner: BehaviorSubject<LoadingSpinner>;
  explorerData: BehaviorSubject<ExplorerData>;
  changeStep: BehaviorSubject<StepMovement>;
  constructor(private logToolService: LogToolService, 
    private csvToJsonService: CsvToJsonService) {
    this.dataIntervalValid = new BehaviorSubject<boolean>(undefined);
    this.explorerData = new BehaviorSubject<ExplorerData>(this.getDefaultExplorerData());
    this.loadingSpinner = new BehaviorSubject<LoadingSpinner>({
      show: false,
      msg: undefined,
    });
    this.changeStep = new BehaviorSubject<StepMovement>(undefined);
  }

  getDefaultExplorerData(): ExplorerData {
    return {
      isSetupDone: false,
      canRunDayTypeAnalysis: false,
      isStepFileUploadComplete: false,
      isStepHeaderRowComplete: false,
      refineDataStepStatus: {
        isComplete: false,
        currentDatasetValid: true,
        hasInvalidDataset: false,
      },
      isStepMapTimeDataComplete: false,
      fileData: [],
      datasets: []
    }
  }

  resetData() {
    this.logToolDays = new Array();
  }

  getDataFieldOptions(): Array<LogToolField> {
    //non date and used fields
    let tmpFields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    _.remove(tmpFields, (field) => { return field.useField == false || field.isDateField == true });
    return tmpFields;
  }

  getDataFieldOptionsWithDate() {
    let tmpFields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    _.remove(tmpFields, (field) => { return field.useField == false });
    return tmpFields;
  }

  getLogToolDayFromDate(date: Date) {
    let logToolDay: LogToolDay = this.logToolDays.find(logToolDay => { return this.checkSameDay(logToolDay.date, date) });
    return logToolDay
  }

  //seperate log tool data into days
  setLogToolDays() {
    let individualDataFromCsv: Array<IndividualDataFromCsv> = JSON.parse(JSON.stringify(this.logToolService.individualDataFromCsv));
    this.logToolDays = new Array();
    individualDataFromCsv.forEach(csvData => {
      let dataForDays: Array<{ date: Date, data: Array<any> }> = this.divideDataIntoDays(csvData.csvImportData.data, csvData.dateField.fieldName);
      dataForDays.forEach(day => {
        let hourlyAverages = this.getHourlyAverages(day.data, csvData);
        this.addLogToolDay(new Date(day.date), hourlyAverages);
      });
    });
    console.log('logtooldays', this.logToolDays)
  }

  addLogToolDay(dayDate: Date, hourlyAverages: Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }>) {
    let existingDayIndex = this.logToolDays.findIndex(logToolDay => { return this.checkSameDay(logToolDay.date, dayDate) });
    if (existingDayIndex != -1) {
      this.logToolDays[existingDayIndex].hourlyAverages.forEach(hourItem => {
        let addtionalAverages = hourlyAverages.find(hourlyAverage => { return hourlyAverage.hour == hourItem.hour });
        hourItem.averages = _.union(hourItem.averages, addtionalAverages.averages);
      });
    } else {
      this.logToolDays.push({
        date: dayDate,
        hourlyAverages: hourlyAverages
      });
    }
  }


  getHourlyAverages(dayData: Array<any>, csvData: IndividualDataFromCsv): Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> {
    let hourlyAverages: Array<{ hour: number, averages: Array<{ value: number, field: LogToolField }> }> = new Array();
    let fields: Array<LogToolField> = csvData.fields;
    for (let hourOfDay = 0; hourOfDay < 24; hourOfDay++) {
      //filter day data by hour
      let filteredDaysByHour = _.filter(dayData, (dayItem) => {
        if (dayItem[csvData.dateField.fieldName]) {
          let date = new Date(dayItem[csvData.dateField.fieldName]);
          let dayDataHourVal = date.getHours();
          return hourOfDay == dayDataHourVal;
        };
      });
      let averages: Array<{ value: number, field: LogToolField }> = new Array();
      //iterate each field and get averages for the hour
      fields.forEach(field => {
        if (field.isDateField == false && field.useField == true) {
          let hourFieldMean: number;
          if (filteredDaysByHour.length != 0) {
            hourFieldMean = _.meanBy(filteredDaysByHour, (filteredDay) => { return filteredDay[field.fieldName] });
          }
          averages.push({
            value: hourFieldMean,
            field: field
          })
        }
      })
      hourlyAverages.push({
        hour: hourOfDay,
        averages: averages
      });

    }
    return hourlyAverages;
  }

  checkSameDay(day1: Date, day2: Date) {
    return moment(day1).isSame(day2, 'day');
  }

  getAllFieldData(fieldName: string): Array<number> {
    let data: Array<any> = this.getData(fieldName);
    let mappedValues: Array<any> = _.mapValues(data, (dataItem) => { return dataItem[fieldName] });
    let valueArr = _.values(mappedValues);
    return valueArr;
  }

  getData(fieldName: string): Array<any> {
    let data: Array<any> = new Array();
    this.logToolService.individualDataFromCsv.forEach(individualDataItem => {
      let foundData = individualDataItem.csvImportData.meta.fields.find(field => { return field == fieldName });
      if (foundData) {
        data = _.concat(data, individualDataItem.csvImportData.data);
      }
    });
    return data;
  };

  submitIndividualCsvData(individualDataFromCsv: Array<IndividualDataFromCsv>) {
    this.isTimeSeries = true;
    console.time('submitIndividualCSVDAta')
    individualDataFromCsv.forEach(csvData => {
      console.log('hasDateField', csvData.hasDateField)
      if (csvData.hasDateField == false) {
        csvData.startDate = undefined;
        csvData.endDate = undefined;
        this.isTimeSeries = false;
        this.dataIntervalValid.next(true);
      }
      else {
        //update date field format
        this.loadingSpinner.next({ show: true, msg: 'Formatting Date Fields...' });
          console.time('formatting date fields with time')
          if (csvData.hasDateField == true && csvData.hasTimeField == true) {
            csvData.csvImportData.data.map(dataItem => {
              if (dataItem[csvData.dateField.fieldName]) {
                dataItem[csvData.dateField.fieldName] = moment(dataItem[csvData.dateField.fieldName].toString().split(" ")[0] + " " + dataItem[csvData.timeField.fieldName]).format('YYYY-MM-DD HH:mm:ss');
                delete dataItem[csvData.timeField.fieldName];
              }
              else {
                dataItem[csvData.dateField.fieldName] = 'Invalid date';
              }
            });
            console.timeEnd('formatting date fields with time')
            csvData.hasTimeField = false;
            let timeIndex = csvData.fields.indexOf(csvData.timeField);
            csvData.fields.splice(timeIndex, 1);
          }
          else {
            console.time('formatting date fields')
            csvData.csvImportData.data.map(dataItem => {
              dataItem[csvData.dateField.fieldName] = moment(dataItem[csvData.dateField.fieldName]).format('YYYY-MM-DD HH:mm:ss');
            });
            console.timeEnd('formatting date fields')

          }
          //remove invalid dates
          _.remove(csvData.csvImportData.data, (dataItem) => {
            return dataItem[csvData.dateField.fieldName] == 'Invalid date';
          });

          //checking intervals for lost seconds 
          let date1 = new Date(csvData.csvImportData.data[0][csvData.dateField.fieldName]);
          let date2 = new Date(csvData.csvImportData.data[1][csvData.dateField.fieldName]);
          let intervalDifference: number = (date2.getTime() - date1.getTime()) / 1000;
          let intervalIncrement: number = csvData.intervalForSeconds;
          if (intervalIncrement !== undefined && intervalDifference <= 0) {
            csvData.csvImportData.data = this.addLostSecondsBack(csvData, intervalIncrement);
            this.dataIntervalValid.next(true);
          } else if (intervalIncrement == undefined && intervalDifference <= 0) {
            this.dataIntervalValid.next(false);
          } else if (intervalDifference > 0) {
            this.dataIntervalValid.next(true);
          }

          //order by date descending
          csvData.csvImportData.data = _.sortBy(csvData.csvImportData.data, (dataItem) => {
            return dataItem[csvData.dateField.fieldName];
          }, ['desc']);
          //set start date
          csvData.startDate = csvData.csvImportData.data[0][csvData.dateField.fieldName];
          //find end date
          csvData.endDate = csvData.csvImportData.data[csvData.csvImportData.data.length - 1][csvData.dateField.fieldName];
          //find number of points per column
          csvData.dataPointsPerColumn = csvData.csvImportData.data.length;
      }
    });
    this.logToolService.setFields(individualDataFromCsv);
    console.timeEnd('submitIndividualCSVDAta')
  }

  addLostSecondsBack(csvData: IndividualDataFromCsv, intervalIncrement: number) {
    let secondsCounter: number = 0;
    csvData.csvImportData.data.map(dataItem => {
      if (secondsCounter == 60) {
        secondsCounter = 0;
      }
      dataItem[csvData.dateField.fieldName] = moment(dataItem[csvData.dateField.fieldName]).format('YYYY-MM-DD HH:mm:ss');
      let date = new Date(dataItem[csvData.dateField.fieldName]);
      date.setSeconds(secondsCounter);
      dataItem[csvData.dateField.fieldName] = moment(date).format('YYYY-MM-DD HH:mm:ss');
      secondsCounter += intervalIncrement;
    });
    return csvData.csvImportData.data;
  }

  divideDataIntoDays(data: Array<any>, dateField: string): Array<{ date: Date, data: Array<any> }> {
    let dayData = new Array();
    let individualDayData: Array<any> = new Array();
    //start date item
    let currentDate: Date = new Date(data[0][dateField]);
    //iterage each data row
    data.forEach(dataItem => {
      //date for datarow
      let dataItemDate: Date = new Date(dataItem[dateField]);
      //if same day add data to individual array
      if (this.checkSameDay(currentDate, dataItemDate)) {
        individualDayData.push(dataItem);
      } else {
        //otherwise set day summary
        dayData.push({
          date: currentDate,
          data: individualDayData
        });
        //re initialize
        individualDayData = new Array();
        currentDate = new Date(dataItem[dateField]);
        //add next day data item before continuing
        individualDayData.push(dataItem);
      }
    });
    //add final day
    dayData.push({
      date: currentDate,
      data: individualDayData
    });
    return dayData;
  }

  getDataInRange(dataField: LogToolField, xField: LogToolField, xMin: any, xMax: any, dataMin: number, dataMax: number): Array<any> {
    let csvData: IndividualDataFromCsv = this.logToolService.individualDataFromCsv.find(csvData => { return csvData.csvName == dataField.csvName });
    let data: Array<any> = _.filter(csvData.csvImportData.data, (dataItem => {
      if (xField.isDateField == true) {
        let dateField: LogToolField = csvData.fields.find(field => { return field.isDateField })
        return (new Date(dataItem[dateField.fieldName]).valueOf() > new Date(xMin).valueOf() && new Date(dataItem[dateField.fieldName]).valueOf() < new Date(xMax).valueOf() && dataItem[dataField.fieldName] > dataMin && dataItem[dataField.fieldName] < dataMax);
      } else {
        return (dataItem[xField.fieldName] > xMin && dataItem[xField.fieldName] < xMax && dataItem[dataField.fieldName] > dataMin && dataItem[dataField.fieldName] < dataMax);
      }
    }));
    let mappedValues: Array<any> = _.mapValues(data, (dataItem) => { return dataItem[dataField.fieldName] });
    let valueArr = _.values(mappedValues);
    return valueArr;
  }
  
  getUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }

  importFileData() {
    let explorerData: ExplorerData = this.explorerData.getValue();
    explorerData.fileData.forEach(fileData => {
      // should not operate on json
      if (fileData.fileType !== '.json') {
        let fileDataExistsInDataSet = explorerData.datasets.find(dataset => dataset.dataSetId === fileData.dataSetId);
        if (!fileDataExistsInDataSet) { 
          let fileImportData = this.csvToJsonService.parseCsvWithHeaders(fileData.data, Number(fileData.headerRowIndex));
          explorerData = this.addImportDataSet(fileImportData, fileData.name, fileData.dataSetId, explorerData);
        }
      }
    });
    
    this.explorerData.next(explorerData);
  }

  importExistingDataSets(logToolDbData: LogToolDbData) {
    let explorerData: ExplorerData = this.explorerData.getValue();
    logToolDbData.setupData.individualDataFromCsv.forEach((existingDataset: ExplorerDataSet) => {
      explorerData.datasets.push(existingDataset);
    });
    this.explorerData.next(explorerData);
  }

  updateIndividualCSVData(explorerData: ExplorerData) {
    explorerData.datasets.forEach((dataSet, index) => {
      this.logToolService.individualDataFromCsv[index] = dataSet;
    });
  }

  // replace logtoolservice.addCsvdata()
  addImportDataSet(fileImportData: CsvImportData, name: string, dataSetId: string, explorerData: ExplorerData) {
    // let csvId: string = Math.random().toString(36).substr(2, 9);
    let fields: Array<LogToolField> = fileImportData.meta.fields.map(field => {
      return {
        fieldName: field,
        alias: field,
        useField: true,
        isDateField: false,
        unit: '',
        invalidField: false,
        csvId: dataSetId,
        csvName: name,
        fieldId: Math.random().toString(36).substr(2, 9)
      }
    });
    let newDataSet: ExplorerDataSet = {
      dataSetId: dataSetId,
      csvImportData: JSON.parse(JSON.stringify(fileImportData)), 
      csvName: name, 
      fields: fields, 
      canRunDayTypeAnalysis: false,
      hasDateField: false 
    }
    if (explorerData.isExample) {
      newDataSet.dateField = newDataSet.fields[0];
      newDataSet.fields[0].isDateField = true;
      newDataSet.hasDateField = true;
    }
    explorerData.datasets.push(newDataSet);
    // OLD MODEL
    this.logToolService.individualDataFromCsv.push(newDataSet); 
    return explorerData;
  }

  finalizeDataSetup(explorerData: ExplorerData): ExplorerData {
    explorerData.canRunDayTypeAnalysis = this.setCanRunDayTypeAnalysis();
    // Eventually replace individualDataFromCsv  5839
    if (explorerData.canRunDayTypeAnalysis) {
      this.logToolService.individualDataFromCsv.map((dataSet: ExplorerDataSet) => {
        dataSet.canRunDayTypeAnalysis = true;
      });
    }
    this.submitIndividualCsvData(this.logToolService.individualDataFromCsv);
    explorerData.isSetupDone = true;
    return explorerData;
  }

  resetSetupData() {
    this.explorerData.next(this.getDefaultExplorerData());
    this.logToolService.resetData();
  }

  checkHasUnprocessedFileData(): boolean {
    let filesLength: number = this.explorerData.getValue().fileData.length;
    let dataSetsLength: number = this.explorerData.getValue().datasets.length;
    return filesLength !== dataSetsLength;
  }

  checkStepSelectedHeaderComplete(explorerFileData?: Array<ExplorerFileData>): boolean {
    if (!explorerFileData) {
      explorerFileData = this.explorerData.getValue().fileData;
    }
    let stepIncomplete: boolean = false;
    if (explorerFileData.length !== 0) {
      stepIncomplete = explorerFileData.some(data => {
        return !data.headerRowVisited;
      });
    } else {
      stepIncomplete = true;
    }
    return !stepIncomplete;
  } 

  checkStepRefineDataComplete(explorerDataSets: Array<ExplorerDataSet>, selectedDataSetIndex: number): RefineDataStepStatus {
    if (!explorerDataSets) {
      explorerDataSets = this.explorerData.getValue().datasets;
    }
    let refineDataStepStatus: RefineDataStepStatus = {
      isComplete: true,
      currentDatasetValid: true,
      hasInvalidDataset: false,
    }
    if (explorerDataSets.length !== 0) {
      explorerDataSets.forEach((dataSet, dataSetIndex) => {
        let isUsingMinimumFields = dataSet.fields.some(field => field.useField);
        if (!isUsingMinimumFields) {
          refineDataStepStatus.currentDatasetValid = selectedDataSetIndex !== dataSetIndex; 
          refineDataStepStatus.hasInvalidDataset = true;
          refineDataStepStatus.isComplete = false;
        } else if (!dataSet.refineDataTabVisited) {
          refineDataStepStatus.isComplete = false;
        } 
      });

    }
    return refineDataStepStatus;
  } 

  checkStepMapDatesComplete(explorerDataSets?: Array<ExplorerDataSet>): boolean {
    if (!explorerDataSets) {
      explorerDataSets = this.explorerData.getValue().datasets;
    }
    let stepIncomplete: boolean = false;
    if (explorerDataSets.length !== 0) {
      stepIncomplete = explorerDataSets.some(data => {
        return !data.mapTimeDataTabVisited;
      });
    } else {
      stepIncomplete = true;
    }
    return !stepIncomplete;
  }

  setCanRunDayTypeAnalysis(explorerDataSets?: Array<ExplorerDataSet>): boolean {
    if (!explorerDataSets) {
      explorerDataSets = this.explorerData.getValue().datasets;
    }
    let hasDateOrTime: boolean = false;
    if (explorerDataSets.length !== 0) {
      hasDateOrTime = explorerDataSets.every(data => {
        return data.hasDateField || data.hasTimeField;
      });
    } else {
      hasDateOrTime = true;
    }
    // 5839 patch
    // this.dateExistsForEachCsv = this.individualDataFromCsv.find(dataItem => { return dataItem.hasDateField == false }) == undefined;
    // this.logToolService.noDayTypeAnalysis.next(!this.dateExistsForEachCsv);
    return hasDateOrTime;
  }


  getNextDataStep(currentDataIndex: number, endDataIndex: number) {
    let nextIndex: number = -1;
    if (currentDataIndex < endDataIndex) {
      nextIndex = currentDataIndex + 1; 
    }
    return nextIndex;
  }

  getPreviousDataStep(currentDataIndex: number) {
    let previousIndex: number = -1;
    if (currentDataIndex !== 0) {
      previousIndex = currentDataIndex - 1; 
    }
    return previousIndex;
  }

  getNewStepIndex(changeStep: StepMovement, currentDataIndex: number, endDataIndex: number): number {
    let newDataIndex: number;
    if (changeStep.direction === 'forward') {
      newDataIndex = this.getNextDataStep(currentDataIndex, endDataIndex);
    } else if (changeStep.direction === 'back') {
      newDataIndex = this.getPreviousDataStep(currentDataIndex);
    }
    return newDataIndex;
  }

}
