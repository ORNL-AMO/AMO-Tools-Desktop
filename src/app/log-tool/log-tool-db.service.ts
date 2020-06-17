import { Injectable } from '@angular/core';
import { LogToolDbData } from './log-tool-models';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { LogToolService } from './log-tool.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LogToolDbService {

  previousDataAvailable: BehaviorSubject<boolean>;
  logToolDbData: Array<LogToolDbData>;
  constructor(private indexedDbService: IndexedDbService, private logToolService: LogToolService) {
    this.previousDataAvailable = new BehaviorSubject<boolean>(false);
  }
  initLogToolData() {
    //first time in log tool for this session, 
    //initialize data with last use
    if (!this.logToolService.dataSubmitted.getValue()) {
      this.indexedDbService.getAllLogTool().then((logToolDbData: Array<LogToolDbData>) => {
        if (logToolDbData.length == 0) {
          this.addLogToolToDb();
        } else {
          //get latest entry
          this.logToolDbData = logToolDbData;
          this.previousDataAvailable.next(true);
        }
      })
    }
  }

  addLogToolToDb() {
    let logToolDbData: LogToolDbData = {
      // id: undefined,
      name: 'Latest',
      modifiedDate: new Date(),
      setupData: {
        logToolDays: undefined,
        individualDataFromCsv: undefined,
        fields: undefined,
        dataCleaned: undefined,
        dataSubmitted: undefined,
        isModalOpen: undefined,
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
        numberOfMonths: undefined,
        dataView: undefined,
        dataDisplayType: undefined,
        selectedGraphType: undefined,
        dayTypeScatterPlotData: undefined,
        individualDayScatterPlotData: undefined
      }
    }
    this.indexedDbService.addLogTool(logToolDbData);
  }

  initializeLogToolData(logToolDbData: LogToolDbData) {

  }

  saveData() {

  }
}
