import { Injectable } from '@angular/core';
import { AnalyticStoreMeta } from './dbConfig';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { AppAnalyticsData } from '../shared/analytics/analytics.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsDataIdbService {

  storeName: string = AnalyticStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) { }

  getAppAnalyticsData(): Observable<Array<AppAnalyticsData>> {
    return this.dbService.getAll(this.storeName);
  }

  addWithObservable(data: AppAnalyticsData): Observable<any> {
    data.modifiedDate = new Date();
    return this.dbService.add(this.storeName, data);
  }

}
