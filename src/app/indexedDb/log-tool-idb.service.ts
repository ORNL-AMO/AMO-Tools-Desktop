import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { firstValueFrom, Observable } from 'rxjs';
import { LogToolDbData } from '../log-tool/log-tool-models';
import { LogToolStoreMeta } from './dbConfig';

@Injectable()
export class LogToolIdbService {
  allLogToolDbDatas: Array<LogToolDbData>;
  storeName: string = LogToolStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) { }

  getAllLogToolDbDatas(): Observable<Array<LogToolDbData>> {
    return this.dbService.getAll(this.storeName);
  }

  addWithObservable(data: LogToolDbData): Observable<any> {
    data.modifiedDate = new Date();
    return this.dbService.add(this.storeName, data);
  }

  updateWithObservable(data: LogToolDbData): Observable<any> {
    data.modifiedDate = new Date(new Date().toLocaleDateString());
    return this.dbService.update(this.storeName, data);
  }
  
}

