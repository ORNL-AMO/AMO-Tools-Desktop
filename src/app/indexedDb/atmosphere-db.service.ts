import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { AtmosphereSpecificHeat } from '../shared/models/materials';
import { AtmosphereStoreMeta } from './dbConfig';

@Injectable()
export class AtmosphereDbService {
  storeName: string = AtmosphereStoreMeta.store;
  dbAtmospherSpecificHeatMaterials: BehaviorSubject<Array<AtmosphereSpecificHeat>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbAtmospherSpecificHeatMaterials = new BehaviorSubject<Array<AtmosphereSpecificHeat>>([]);
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

  updateWithObservable(material: AtmosphereSpecificHeat): Observable<AtmosphereSpecificHeat> {
    return this.dbService.update(this.storeName, material);
  }

  clearAtmosphereSpecificHeat(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

}