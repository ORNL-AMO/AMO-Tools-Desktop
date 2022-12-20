import { Injectable } from '@angular/core';
import { LogToolService } from './log-tool.service';
import moment, { Moment } from 'moment';
import * as _ from 'lodash';
import { LogToolDay, LogToolField, IndividualDataFromCsv, ExplorerData, ExplorerFileData, ExplorerDataSet, StepMovement, LoadingSpinner, RefineDataStepStatus, LogToolDbData, AverageByInterval, DayTypeAverageInterval, ExplorerDataValid, LogToolAverage } from './log-tool-models';
import { BehaviorSubject } from 'rxjs';
import { CsvImportData, CsvToJsonService } from '../shared/helper-services/csv-to-json.service';
import { MeasurMessageData } from '../shared/models/utilities';

@Injectable()
export class LogToolDataService {

  logToolDays: Array<LogToolDay>;
  dataIntervalValid: BehaviorSubject<boolean>;
  selectedDayTypeAverageInterval: DayTypeAverageInterval = {
    display: 'Hourly', 
    seconds: 3600,
    unitOfTimeString: 'hour'
  };
  intervalTotalSecondsPerDay: number = 86400;

  loadingSpinner: BehaviorSubject<LoadingSpinner>;
  errorMessageData: BehaviorSubject<MeasurMessageData>;
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
    this.errorMessageData = new BehaviorSubject<MeasurMessageData>({
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
      datasets: [],
      valid: {
        isValid: true,
        invalidDatasets: []
      }
    }
  }

  resetData() {
    this.logToolDays = new Array();
  }

  getLogToolDayFromDate(date: Date) {
    let logToolDay: LogToolDay = this.logToolDays.find(logToolDay => { return this.checkSameDay(logToolDay.date, date) });
    return logToolDay
  }

  setLogToolDays() {
    let explorerDatasets: Array<ExplorerDataSet> = JSON.parse(JSON.stringify(this.logToolService.individualDataFromCsv));
    this.logToolDays = new Array();
    explorerDatasets.forEach((dataset: ExplorerDataSet) => {
      let dataForDays: Array<{ date: Date, data: Array<any> }> = this.divideDataIntoDays(dataset.csvImportData.data, dataset.dateField.fieldName);
      dataForDays.forEach(day => {
        let dayAveragesByInterval: Array<AverageByInterval> = this.calculateDayAveragesByInterval(day.data, dataset);
        this.addLogToolDay(new Date(day.date), dayAveragesByInterval);
      });
    });
  }

  addLogToolDay(dayDate: Date, dayAveragesByInterval: Array<AverageByInterval>) {
    let existingDayIndex = this.logToolDays.findIndex(logToolDay => { return this.checkSameDay(logToolDay.date, dayDate) });
    if (existingDayIndex != -1) {
      this.logToolDays[existingDayIndex].dayAveragesByInterval.forEach(averageItem => {
        let addtionalAverages = dayAveragesByInterval.find(hourlyAverage => { return hourlyAverage.interval == averageItem.interval });
        averageItem.averages = _.union(averageItem.averages, addtionalAverages.averages);
        averageItem.averages = this.combineTotalAggregateAverages(averageItem.averages);
      });
    } else {
      this.logToolDays.push({
        date: dayDate,
        dayAveragesByInterval: dayAveragesByInterval
      });
    }
  }
  // combine 'all' field for daytype day averages of all equipment
  combineTotalAggregateAverages(averages: LogToolAverage[]) {
    let averagesUnique: LogToolAverage[] = [];
    for(let i = 0; i< averages.length; i++){
      // to filter by any duplicate fieldname
      // let idx = averagesUnique.findIndex(x => x.field.fieldName === averages[i].field.fieldName);
      let idx = averagesUnique.findIndex(x => x.field.fieldId === 'all' && averages[i].field.fieldId === 'all');
      if(idx < 0){
        averagesUnique.push(averages[i]);
      } else {
        averagesUnique[idx].value = averagesUnique[idx].value + averages[i].value;
      }
    }

    return averagesUnique;
  }
  
  // * dayData: Array of objects where key/val is fileData fields/vals
  calculateDayAveragesByInterval(dayData: Array<any>, dataset: ExplorerDataSet): Array<AverageByInterval> {
    let dayAveragesByInterval: Array<AverageByInterval> = new Array();
    let intervalByTimeUnit: number = 0;
    // * only averaging data fields
    let fields: Array<LogToolField> = dataset.fields.filter(field => !field.isDateField && field.useForDayTypeAnalysis == true);
    let startingDate: Date = new Date(new Date(dayData[0][dataset.dateField.fieldName]).setHours(0,0,0,0));
    let endingDate: Date = new Date(new Date(dayData[0][dataset.dateField.fieldName]).setHours(0,0,0,0));
    endingDate = new Date(endingDate.setSeconds(endingDate.getSeconds() + this.selectedDayTypeAverageInterval.seconds));
    let isSameDay: boolean = true;

    if (this.selectedDayTypeAverageInterval.unitOfTimeString === 'day') {
      let dayAverages = _.filter(dayData, (dayItem) => {
        if (dayItem[dataset.dateField.fieldName]) {
          let date = new Date(dayItem[dataset.dateField.fieldName]);
          let isIntervalRange: boolean = date >= startingDate && date <= endingDate;
          return isIntervalRange;
        };
      });
      let averages: Array<{ value: number, field: LogToolField }> = this.getIntervalAverages(dayAverages, fields);
      let startDateString: string = moment(startingDate).format('YYYY-MM-DD');

      dayAveragesByInterval.push({
        interval: this.selectedDayTypeAverageInterval.seconds,
        intervalDisplayString: startDateString,
        intervalDateRange: {
          startDate: startDateString,
          endDate: undefined
        },
        averages: averages
      });
    } else {
      let unitOfTime: number = this.getUnitOfTime();
      for (let interval = 0; interval < this.intervalTotalSecondsPerDay && isSameDay;) {
        let currentIntervalDataForDay = _.filter(dayData, (dayItem) => {
          if (dayItem[dataset.dateField.fieldName]) {
            let date = new Date(dayItem[dataset.dateField.fieldName]);
            let isIntervalRange: boolean = date >= startingDate && date <= endingDate;
            return isIntervalRange;
          };
        });

        let averages: Array<{ value: number, field: LogToolField }> = this.getIntervalAverages(currentIntervalDataForDay, fields)
        let {intervalDisplayString, intervalOffsetString} = this.getCurrentIntervalStrings(intervalByTimeUnit);
        intervalByTimeUnit += unitOfTime;
        dayAveragesByInterval.push({
          interval: interval,
          intervalDisplayString: intervalDisplayString,
          intervalOffsetString: intervalOffsetString,
          intervalDateRange: {
            startDate: moment(startingDate).format('YYYY-MM-DD HH:mm:ss'),
            endDate: moment(endingDate).format('YYYY-MM-DD HH:mm:ss')
          },
          averages: averages
        });
        interval += this.selectedDayTypeAverageInterval.seconds;
        // Use moment - native dates setSeconds wrong if they go into the next day
        let newStartingIntervalDate: Moment = moment(startingDate).add(this.selectedDayTypeAverageInterval.seconds, 'seconds');
        isSameDay = this.isSameDay(startingDate, newStartingIntervalDate.toDate());
        startingDate = newStartingIntervalDate.toDate();
        let newEndingDate: Moment = moment(endingDate).add(this.selectedDayTypeAverageInterval.seconds, 'seconds');
        endingDate = newEndingDate.toDate();
      }
    }

    return dayAveragesByInterval;
  }

  getIntervalAverages(currentIntervalDataForDay, fields: Array<LogToolField>) {
    let averages: Array<{ value: number, field: LogToolField }> = new Array();
    let fieldIdsToAggregate: Array<string> = [];
    fields.forEach(field => {
      let intervalFieldMean: number;
      if (currentIntervalDataForDay.length != 0) {
        intervalFieldMean = _.meanBy(currentIntervalDataForDay, (filteredDay) => { return filteredDay[field.fieldName] });
      }
      averages.push({
        value: intervalFieldMean,
        field: field
      });

      if (field.useForDayTypeAnalysis) {
        fieldIdsToAggregate.push(field.fieldId);
      }
    });

    let allDataCollectionUnitsAverage: { value: number, field: LogToolField } = 
    {
      value: undefined,
      field: {
        fieldName: 'all',
        alias: 'Total Aggregated Equipment Data',
        useField: true,
        useForDayTypeAnalysis: true,
        isDateField: undefined,
        isTimeField: undefined,
        unit: undefined,
        invalidField: undefined,
        csvId: undefined,
        csvName: undefined,
        fieldId: 'all'
      }
    };
    allDataCollectionUnitsAverage.value = _.sumBy(averages, (average) => { 
      if (average.value !== undefined && fieldIdsToAggregate.includes(average.field.fieldId)) {
        return average.value;
      } else {
        return undefined;
      }
    });

    averages.unshift(allDataCollectionUnitsAverage);
    return averages;
  }
  
  isSameDay(firstDate: Date, secondDate: Date) {
    return firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate();
  }

getCurrentIntervalStrings(currentInterval: number): {intervalDisplayString: string, intervalOffsetString: string } {
    let intervalDisplayString: string;
    let intervalOffsetString: string;
    let day: Date = new Date(new Date().setHours(0,0,0,0));
    if (this.selectedDayTypeAverageInterval.unitOfTimeString === 'hour') {
      day.setHours(currentInterval, 0, 0, 0);
      intervalDisplayString = moment(day).format('H');
      intervalOffsetString = moment(day).add(1, 'hours').format('H');
      if (currentInterval === 23) {
        intervalOffsetString = '24';
      }
    } else if (this.selectedDayTypeAverageInterval.unitOfTimeString === 'minutes') {
      day.setMinutes(currentInterval, 0, 0);
      intervalDisplayString = moment(day).format('H:mm');
      let offsetDay: Date = new Date(new Date().setHours(0,0,0,0));
      let offsetSeconds: number = currentInterval + this.getUnitOfTime();
      offsetDay.setMinutes(offsetSeconds, 0, 0);
      intervalOffsetString = moment(offsetDay).format('H:mm');
      if (!this.checkSameDay(day, offsetDay)) {
        //is last interval
        intervalOffsetString = '24';
      }
    }
    
    return {intervalDisplayString: intervalDisplayString, intervalOffsetString: intervalOffsetString };
  }

  getUnitOfTime(): number {
    if (this.selectedDayTypeAverageInterval.seconds === 3600) {
      return 1;
    } else {
      return this.selectedDayTypeAverageInterval.seconds / 60;
    }
  }

  checkSameDay(day1: Date, day2: Date) {
    return moment(day1).isSame(day2, 'day');
  }

  finalizeDataSetup(explorerData: ExplorerData): ExplorerData {
    explorerData.valid.isValid = true;
    explorerData.valid.invalidDatasets = [];
    explorerData.canRunDayTypeAnalysis = this.setCanRunDayTypeAnalysis();
    //  5839 patch- Eventually replace individualDataFromCsv
    // explorerData and individualDataFromCSV split below
    if (explorerData.canRunDayTypeAnalysis) {
      this.loadingSpinner.next({ show: true, msg: 'Processing date and time data' });
      this.logToolService.individualDataFromCsv.map((dataSet: ExplorerDataSet) => {
        dataSet.canRunDayTypeAnalysis = true;
      });
      this.prepareDateAndTimeData(this.logToolService.individualDataFromCsv, explorerData.valid);
    }
    this.logToolService.setAllAvailableFields(this.logToolService.individualDataFromCsv);

    explorerData.isSetupDone = explorerData.valid.isValid;
    return explorerData;
  }

  parseAlternateDateFormat(dateString: string): Moment {
    let formats: Array<string> = [
      'DD/MM/YYYY HH:mm:ss',
      'DD/MM/YYYY hh:mm:ss a',
      'DD-MM-YYYY HH:mm:ss', 
      'DD-MM-YYYY hh:mm:ss a', 
      'MM/DD/YYYY HH:mm:ss',
      'MM/DD/YYYY hh:mm:ss a',
      'MM-DD-YYYY HH:mm:ss', 
      'MM-DD-YYYY hh:mm:ss a', 
      'DD-MM-YYYY', 
      'MM-DD-YYYY', 
      'HH:mm:ss',
      'hh:mm:ss a',
    ];

    let dateMoment: Moment = moment(dateString, formats, true);
    return dateMoment;
  }

  isValidDate(dateISOFormat: any) {
    return dateISOFormat instanceof Date && !isNaN(dateISOFormat.getTime());
  }

  formatDates(dataset: ExplorerDataSet) {
    dataset.csvImportData.data.map(dataItem => {
      let dateISOFormat = new Date(dataItem[dataset.dateField.fieldName]);
      let validDate: boolean = this.isValidDate(dateISOFormat);
      let dateMoment: Moment;
      if (validDate) {
        dateMoment = moment(dataItem[dataset.dateField.fieldName]);
      } else {
        dateMoment = this.parseAlternateDateFormat(dataItem[dataset.dateField.fieldName]);
      }
      dataItem[dataset.dateField.fieldName] = dateMoment.format('YYYY-MM-DD HH:mm:ss');
    });
  }
  

  prepareDateAndTimeData(explorerDatasets: Array<IndividualDataFromCsv>, valid: ExplorerDataValid) {
    explorerDatasets.forEach((dataset: ExplorerDataSet, index) => {
      let unProcessedDataCopy: Array<any> = JSON.parse(JSON.stringify(dataset.csvImportData.data));
        if (dataset.hasTimeField == true) {
          dataset = this.joinDateAndTimeFields(dataset);
        } else {
          this.formatDates(dataset);
        }
        _.remove(dataset.csvImportData.data, (dataItem) => {
          return dataItem[dataset.dateField.fieldName] == 'Invalid date';
        });

        // has at least one valid date
        if (dataset.csvImportData.data.length !== 0) {
          dataset = this.checkIntervalSeconds(dataset);
          dataset.csvImportData.data = _.sortBy(dataset.csvImportData.data, (dataItem) => {
            return dataItem[dataset.dateField.fieldName];
          }, ['desc']);
          dataset.startDate = dataset.csvImportData.data[0][dataset.dateField.fieldName];
          dataset.endDate = dataset.csvImportData.data[dataset.csvImportData.data.length - 1][dataset.dateField.fieldName];
          dataset.dataPointsPerColumn = dataset.csvImportData.data.length;
        } else {
          dataset.csvImportData.data = unProcessedDataCopy;
          valid.isValid = false;
          valid.invalidDatasets.push({id: dataset.dataSetId, name: dataset.csvName});
          valid.message = 'Unable to process date/time data.';
          valid.detailHTML = 'Please verify your date/time setup and file data are formatted correctly for the datasets below:';
        }
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
    let intervalIncrement: number = dataset.dataCollectionInterval;
    if (intervalIncrement !== undefined && intervalDifference <= 0) {
      dataset.csvImportData.data = this.addLostSecondsBack(dataset, intervalIncrement);
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
        fieldId: this.getUniqueId()
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

  // EVERY dataset must have at least date field (original funcitonality)
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
