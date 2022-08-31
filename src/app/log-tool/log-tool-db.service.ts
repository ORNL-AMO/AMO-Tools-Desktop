import { Injectable } from '@angular/core';
import { LogToolDbData } from './log-tool-models';
 
import { LogToolService } from './log-tool.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { LogToolDataService } from './log-tool-data.service';
import { VisualizeService } from './visualize/visualize.service';
import { DayTypeAnalysisService } from './day-type-analysis/day-type-analysis.service';
import { DayTypeGraphService } from './day-type-analysis/day-type-graph/day-type-graph.service';
import { LogToolIdbService } from '../indexedDb/log-tool-idb.service';

@Injectable()
export class LogToolDbService {

  previousDataAvailable: BehaviorSubject<Date>;
  logToolDbData: Array<LogToolDbData>;
  constructor(   private logToolService: LogToolService,
    private dbService: LogToolIdbService,
    private logToolDataService: LogToolDataService, private visualizeService: VisualizeService,
    private dayTypeAnalysisService: DayTypeAnalysisService, private dayTypeGraphService: DayTypeGraphService) {
    this.previousDataAvailable = new BehaviorSubject<Date>(undefined);
  }

  async initLogToolData() {
    //first time in log tool for this session, 
    //initialize data with last use
    if (!this.logToolService.dataSubmitted.getValue()) {
      let allLogToolData: LogToolDbData[] = await firstValueFrom(this.dbService.getAllLogToolDbDatas());
      if (allLogToolData.length == 0) {
        this.addLogToolToDb();
      } else {
        //get latest entry
        this.logToolDbData = allLogToolData;
        if (this.logToolDbData[0].setupData.dataSubmitted === true) {
          this.previousDataAvailable.next(allLogToolData[0].modifiedDate);
        }
      }
    }
  }

  async addLogToolToDb() {
    //no id on add, automatically set on insert
    let logToolDbData: LogToolDbData = {
      name: 'Latest',
      modifiedDate: new Date(),
      setupData: {
        logToolDays: undefined,
        individualDataFromCsv: undefined,
        fields: undefined,
        dataCleaned: undefined,
        dataSubmitted: undefined,
        noDayTypeAnalysis: undefined
      },
      visualizeData: {
        graphObjects: undefined,
        selectedGraphObj: undefined,
        visualizeData: undefined,
        annotateDataPoint: undefined
      },
      dayTypeData: {
        selectedDataField: undefined,
        dayTypes: undefined,
        dayTypeSummaries: undefined,
        displayDayTypeCalander: undefined,
        calendarStartDate: undefined,
        dayTypesCalculated: undefined,
        numberOfMonths: undefined,
        dataView: undefined,
        dataDisplayType: undefined,
        selectedGraphType: undefined,
        dayTypeScatterPlotData: undefined,
        individualDayScatterPlotData: undefined
      }
    }
    await firstValueFrom(this.dbService.addWithObservable(logToolDbData));
  }

  setLogToolData() {
    let logToolDbData: LogToolDbData = this.logToolDbData[0];
    this.logToolDataService.logToolDays = logToolDbData.setupData.logToolDays;
    this.logToolService.individualDataFromCsv = logToolDbData.setupData.individualDataFromCsv;
    this.logToolService.fields = logToolDbData.setupData.fields;
    this.logToolService.dataCleaned.next(logToolDbData.setupData.dataCleaned);
    this.logToolService.dataSubmitted.next(logToolDbData.setupData.dataSubmitted);
    this.logToolService.noDayTypeAnalysis.next(logToolDbData.setupData.noDayTypeAnalysis);
    this.visualizeService.graphObjects.next(logToolDbData.visualizeData.graphObjects);
    this.visualizeService.selectedGraphObj.next(logToolDbData.visualizeData.selectedGraphObj);
    this.visualizeService.visualizeData = logToolDbData.visualizeData.visualizeData;
    this.visualizeService.annotateDataPoint.next(logToolDbData.visualizeData.annotateDataPoint);
    this.dayTypeAnalysisService.selectedDataField.next(logToolDbData.dayTypeData.selectedDataField);
    this.dayTypeAnalysisService.dayTypes.next(logToolDbData.dayTypeData.dayTypes);
    this.dayTypeAnalysisService.dayTypeSummaries.next(logToolDbData.dayTypeData.dayTypeSummaries);
    this.dayTypeAnalysisService.dayTypesCalculated = logToolDbData.dayTypeData.dayTypesCalculated;
    this.dayTypeAnalysisService.displayDayTypeCalander.next(logToolDbData.dayTypeData.displayDayTypeCalander);
    this.dayTypeAnalysisService.calendarStartDate = logToolDbData.dayTypeData.calendarStartDate;
    this.dayTypeAnalysisService.numberOfMonths = logToolDbData.dayTypeData.numberOfMonths;
    this.dayTypeAnalysisService.dataView.next(logToolDbData.dayTypeData.dataView);
    this.dayTypeAnalysisService.dataDisplayType.next(logToolDbData.dayTypeData.dataDisplayType);
    this.dayTypeGraphService.selectedGraphType.next(logToolDbData.dayTypeData.selectedGraphType);
    this.dayTypeGraphService.dayTypeScatterPlotData.next(logToolDbData.dayTypeData.dayTypeScatterPlotData);
    this.dayTypeGraphService.individualDayScatterPlotData.next(logToolDbData.dayTypeData.individualDayScatterPlotData);

  }

 async saveData() {
    let logToolDbData: LogToolDbData = this.getLogToolDbDataObj();
    let allData: LogToolDbData[] = await firstValueFrom(this.dbService.updateWithObservable(logToolDbData));
  }

  getSavedData(): LogToolDbData {
    let logToolDbData: LogToolDbData = this.getLogToolDbDataObj();
    return logToolDbData;
  }

  getLogToolDbDataObj(): LogToolDbData{
    let newLogToolDbData: LogToolDbData = {
      id: 1,
      name: 'Latest',
      modifiedDate: new Date(),
      origin: 'AMO-LOG-TOOL-DATA',
      setupData: {
        logToolDays: this.logToolDataService.logToolDays,
        individualDataFromCsv: this.logToolDataService.explorerData.getValue().datasets,
        fields: this.logToolService.fields,
        dataCleaned: this.logToolService.dataCleaned.getValue(),
        dataSubmitted: this.logToolService.dataSubmitted.getValue(),
        noDayTypeAnalysis: this.logToolService.noDayTypeAnalysis.getValue()
      },
      visualizeData: {
        graphObjects: this.visualizeService.graphObjects.getValue(),
        selectedGraphObj: this.visualizeService.selectedGraphObj.getValue(),
        visualizeData: this.visualizeService.visualizeData,
        annotateDataPoint: this.visualizeService.annotateDataPoint.getValue()
      },
      dayTypeData: {
        selectedDataField: this.dayTypeAnalysisService.selectedDataField.getValue(),
        dayTypes: this.dayTypeAnalysisService.dayTypes.getValue(),
        dayTypeSummaries: this.dayTypeAnalysisService.dayTypeSummaries.getValue(),
        displayDayTypeCalander: this.dayTypeAnalysisService.displayDayTypeCalander.getValue(),
        calendarStartDate: this.dayTypeAnalysisService.calendarStartDate,
        dayTypesCalculated: this.dayTypeAnalysisService.dayTypesCalculated,
        numberOfMonths: this.dayTypeAnalysisService.numberOfMonths,
        dataView: this.dayTypeAnalysisService.dataView.getValue(),
        dataDisplayType: this.dayTypeAnalysisService.dataDisplayType.getValue(),
        selectedGraphType: this.dayTypeGraphService.selectedGraphType.getValue(),
        dayTypeScatterPlotData: this.dayTypeGraphService.dayTypeScatterPlotData.getValue(),
        individualDayScatterPlotData: this.dayTypeGraphService.individualDayScatterPlotData.getValue()
      }
    }
    return newLogToolDbData;
  }


}
