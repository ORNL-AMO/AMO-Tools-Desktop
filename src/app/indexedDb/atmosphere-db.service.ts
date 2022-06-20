import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { AtmosphereSpecificHeat } from '../shared/models/materials';
import { AtmosphereStoreMeta } from './dbConfig';

@Injectable()
export class AtmosphereDbService {
  storeName: string = AtmosphereStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) {
  }

  getAllWithObservable(): Observable<Array<AtmosphereSpecificHeat>> {
    return this.dbService.getAll(this.storeName);
  }

  getByIdWithObservable(materialId: number): Observable<AtmosphereSpecificHeat> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  addWithObservable(material: AtmosphereSpecificHeat): Observable<AtmosphereSpecificHeat> {
    return this.dbService.add(this.storeName, material);
  }

  deleteByIdWithObservable(materialId: number): Observable<Array<AtmosphereSpecificHeat>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  updateWithObservable(material: AtmosphereSpecificHeat): Observable<Array<AtmosphereSpecificHeat>> {
    return this.dbService.update(this.storeName, material);
  }

  clearAtmosphereSpecificHeat(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

}