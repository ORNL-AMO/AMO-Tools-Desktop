import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { WeatherDataDbData } from '../calculator/utilities/weather-bins/weather-db.service';
import { WeatherDataStoreMeta } from './dbConfig';

@Injectable()
export class WeatherDataIdbService {

  allWeatherData: Array<WeatherDataDbData>;
  storeName: string = WeatherDataStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) { }

  getAllWeatherData(): Observable<Array<WeatherDataDbData>> {
    return this.dbService.getAll(this.storeName);
  }

  addWithObservable(data: WeatherDataDbData): Observable<any> {
    data.modifiedDate = new Date();
    return this.dbService.add(this.storeName, data);
  }

  updateWithObservable(data: WeatherDataDbData): Observable<any> {
    data.modifiedDate = new Date(new Date().toLocaleDateString());
    return this.dbService.update(this.storeName, data);
  }

  deleteByIdWithObservable(id: number): Observable<any> {
    return this.dbService.delete(this.storeName, id);
  }

}
