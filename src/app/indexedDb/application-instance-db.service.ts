import { Injectable } from '@angular/core';
import { ApplicationInstanceDataStoreMeta } from './dbConfig';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable()
export class ApplicationInstanceDbService {
  applicationInstanceData: BehaviorSubject<ApplicationInstanceData>;
  storeName: string = ApplicationInstanceDataStoreMeta.store;

  constructor(private dbService: NgxIndexedDBService) { 
    this.applicationInstanceData = new BehaviorSubject<ApplicationInstanceData>(undefined);
  }
  
  updateWithObservable(applicationinstancedata: ApplicationInstanceData): Observable<ApplicationInstanceData> {
    applicationinstancedata.modifiedDate = new Date();
    return this.dbService.update(this.storeName, applicationinstancedata);
  }

  addWithObservable(applicationinstancedata: ApplicationInstanceData): Observable<any> {
    applicationinstancedata.createdDate = new Date();
    applicationinstancedata.modifiedDate = new Date();
    return this.dbService.add(this.storeName, applicationinstancedata);
  }

  getApplicationInstanceData(): Observable<any> {
    return this.dbService.getAll(this.storeName);
  }

  setSurveyDone(isDone = true) {
    let applicationInstanceData = this.applicationInstanceData.getValue();
    applicationInstanceData.isSurveyDone = isDone;
    applicationInstanceData.doSurveyReminder = !isDone;
    applicationInstanceData.isSurveyToastDone = true;
    return this.updateWithObservable(applicationInstanceData);
  }
  
  setSurveyToastDone() {
    let applicationInstanceData = this.applicationInstanceData.getValue();
    applicationInstanceData.isSurveyToastDone = true;
    return this.updateWithObservable(applicationInstanceData);
  }

}

export interface ApplicationInstanceData {
  dataBackupFilePath: string,
  isAutomaticBackupOn: boolean,
  isSurveyToastDone: boolean,
  isSurveyDone: boolean,
  subscriberId: number,
  doSurveyReminder: boolean,
  appOpenCount: number,
  createVersionedBackups: boolean,
  createdDate: Date,
  modifiedDate: Date,
}