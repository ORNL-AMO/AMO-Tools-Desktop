import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AtmosphereSpecificHeat } from '../shared/models/materials';
import { AtmosphereStoreMeta } from './dbConfig';
declare var Module: any;

@Injectable()
export class AtmosphereDbService {
  storeName: string = AtmosphereStoreMeta.store;
  dbAtmospherSpecificHeatMaterials: BehaviorSubject<Array<AtmosphereSpecificHeat>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbAtmospherSpecificHeatMaterials = new BehaviorSubject<Array<AtmosphereSpecificHeat>>([]);
  }

  insertDefaultMaterials(): Observable<number[]> {
    let DefaultData = new Module.DefaultData();
    let suiteDefaultMaterials = DefaultData.getAtmosphereSpecificHeat();

    let defaultMaterials: Array<AtmosphereSpecificHeat> = [];
    for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
      let wasmClass = suiteDefaultMaterials.get(i);
      defaultMaterials.push({ 
        substance: wasmClass.getSubstance(), 
        specificHeat: wasmClass.getSpecificHeat(),
        isDefault: true 
      });
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
    return this.dbService.bulkAdd(this.storeName, defaultMaterials);
  }

  getAllCustomMaterials(): Observable<Array<AtmosphereSpecificHeat>> {
    return this.dbService.getAll(this.storeName).pipe(
      map((materials: AtmosphereSpecificHeat[]) => materials.filter((material: AtmosphereSpecificHeat) => !material.isDefault))
    );
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