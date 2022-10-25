import { Injectable } from '@angular/core';
import { LogToolService } from './log-tool.service';
import moment from 'moment';
import * as _ from 'lodash';
import { LogToolDay, LogToolField, IndividualDataFromCsv, ExplorerData, ExplorerFileData, ExplorerDataSet, StepMovement, LoadingSpinner, RefineDataStepStatus, LogToolDbData, HourAverage } from './log-tool-models';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData, CsvToJsonService } from '../shared/helper-services/csv-to-json.service';

@Injectable()
export class LogToolDataService {

  logToolDays: Array<LogToolDay>;
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
    let explorerDatasets: Array<ExplorerDataSet> = JSON.parse(JSON.stringify(this.logToolService.individualDataFromCsv));
    this.logToolDays = new Array();
    explorerDatasets.forEach((dataset: ExplorerDataSet) => {
      let dataForDays: Array<{ date: Date, data: Array<any> }> = this.divideDataIntoDays(dataset.csvImportData.data, dataset.dateField.fieldName);
      dataForDays.forEach(day => {
        let hourlyAverages: Array<HourAverage> = this.getHourlyAverages(day.data, dataset);
        this.addLogToolDay(new Date(day.date), hourlyAverages);
      });
    });
  }

  addLogToolDay(dayDate: Date, hourlyAverages: Array<HourAverage>) {
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


  getHourlyAverages(dayData: Array<any>, csvData: IndividualDataFromCsv): Array<HourAverage> {
    let hourlyAverages: Array<HourAverage> = new Array();
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

  finalizeDataSetup(explorerData: ExplorerData): ExplorerData {
    explorerData.canRunDayTypeAnalysis = this.setCanRunDayTypeAnalysis();
    //  5839 patch- Eventually replace individualDataFromCsv
    if (explorerData.canRunDayTypeAnalysis) {
      this.loadingSpinner.next({ show: true, msg: 'Processing date and time data...' });
      this.logToolService.individualDataFromCsv.map((dataSet: ExplorerDataSet) => {
        dataSet.canRunDayTypeAnalysis = true;
      });
      this.prepareDateAndTimeData(this.logToolService.individualDataFromCsv);
    }
    this.logToolService.setAllAvailableFields(this.logToolService.individualDataFromCsv);
    // explorerData and individualDataFromCSV break here
    explorerData.isSetupDone = true;
    return explorerData;
  }

  prepareDateAndTimeData(explorerDatasets: Array<IndividualDataFromCsv>) {
    explorerDatasets.forEach((dataset: ExplorerDataSet) => {
        if (dataset.hasTimeField == true) {
          dataset = this.joinDateAndTimeFields(dataset);
        } else {
          dataset.csvImportData.data.map(dataItem => {
            let dateISOFormat = new Date(dataItem[dataset.dateField.fieldName]);
            dataItem[dataset.dateField.fieldName] = moment(dateISOFormat).format('YYYY-MM-DD HH:mm:ss');
          });
        }

        // Optimize? reverse iterate and delete or use flag to see if anymarked
        _.remove(dataset.csvImportData.data, (dataItem) => {
          return dataItem[dataset.dateField.fieldName] == 'Invalid date';
        });

        dataset = this.checkIntervalSeconds(dataset);

        dataset.csvImportData.data = _.sortBy(dataset.csvImportData.data, (dataItem) => {
          return dataItem[dataset.dateField.fieldName];
        }, ['desc']);
        dataset.startDate = dataset.csvImportData.data[0][dataset.dateField.fieldName];
        dataset.endDate = dataset.csvImportData.data[dataset.csvImportData.data.length - 1][dataset.dateField.fieldName];
        dataset.dataPointsPerColumn = dataset.csvImportData.data.length;
    });
  }

  joinDateAndTimeFields(dataset: ExplorerDataSet) {
    dataset.csvImportData.data.map(dataItem => {
      if (dataItem[dataset.dateField.fieldName]) {
        dataItem[dataset.dateField.fieldName] = moment(dataItem[dataset.dateField.fieldName].toString().split(" ")[0] + " " + dataItem[dataset.timeField.fieldName]).format('YYYY-MM-DD HH:mm:ss');
        delete dataItem[dataset.timeField.fieldName];
      }
      else {
        dataItem[dataset.dateField.fieldName] = 'Invalid date';
        console.log('***** has invalid dates');
      }
    });
    dataset.hasTimeField = false;
    let timeIndex = dataset.fields.indexOf(dataset.timeField);
    dataset.fields.splice(timeIndex, 1);
    return dataset;
  }

  checkIntervalSeconds(dataset: ExplorerDataSet) {
    let firstRowDate = new Date(dataset.csvImportData.data[0][dataset.dateField.fieldName]);
    let secondRowDate = new Date(dataset.csvImportData.data[1][dataset.dateField.fieldName]);
    let intervalDifference: number = (secondRowDate.getTime() - firstRowDate.getTime()) / 1000;
    let intervalIncrement: number = dataset.intervalForSeconds;
    // TODO What is going on here??
    if (intervalIncrement !== undefined && intervalDifference <= 0) {
      dataset.csvImportData.data = this.addLostSecondsBack(dataset, intervalIncrement);
      // this.dataIntervalValid.next(true);
    } else if (intervalIncrement == undefined && intervalDifference <= 0) {
      // this.dataIntervalValid.next(false);
    } else if (intervalDifference > 0) {
      // this.dataIntervalValid.next(true);
    }
    return dataset;
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
    data.forEach(dataItem => {
      let dataItemDate: Date = new Date(dataItem[dateField]);
      // 3777 why
      //if same day add data to individual array
      if (this.checkSameDay(currentDate, dataItemDate)) {
        individualDayData.push(dataItem);
      } else {
        dayData.push({
          date: currentDate,
          data: individualDayData
        });
        individualDayData = new Array();
        currentDate = new Date(dataItem[dateField]);
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

  async importFileData(): Promise<Array<CsvImportData>> {
    let explorerData: ExplorerData = this.explorerData.getValue();
     return Promise.all(explorerData.fileData.map(async(fileData) => {
      if (fileData.fileType !== '.json') {
        let fileDataExistsInDataSet = explorerData.datasets.find(dataset => dataset.dataSetId === fileData.dataSetId);
        if (!fileDataExistsInDataSet) { 
          return this.csvToJsonService.parseCSVasync(fileData, false, Number(fileData.headerRowIndex));
        }
      }
    }));
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
      hasDateField: false,
      startDate: undefined,
      endDate: undefined
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

  // 3777 EVERY dataset must have at least date field (original funcitonality)
  setCanRunDayTypeAnalysis(explorerDataSets?: Array<ExplorerDataSet>): boolean {
    if (!explorerDataSets) {
      explorerDataSets = this.explorerData.getValue().datasets;
    }
    let isAllDataTimeStamped: boolean = false;
    if (explorerDataSets.length !== 0) {
      isAllDataTimeStamped = explorerDataSets.every(data => {
        return data.hasDateField;
      });
    }
    return isAllDataTimeStamped;
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
