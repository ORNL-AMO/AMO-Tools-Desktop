import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { WallLossesSurface } from '../shared/models/materials';
import { LightingFixtureMaterialStoreMeta } from './dbConfig';
import { LightingFixtureCategory } from '../tools-suite-api/lighting-suite-api.service';
@Injectable()
export class LightingFixtureServiceDbService {

  storeName: string = LightingFixtureMaterialStoreMeta.store;
  dbLightingFixturesMaterials: BehaviorSubject<LightingFixtureCategory[]>;

  constructor(private dbService: NgxIndexedDBService
  ) {
    this.dbLightingFixturesMaterials = new BehaviorSubject<LightingFixtureCategory[]>([]);
  }

  insertDefaultMaterials(defaultMaterials: Array<LightingFixtureCategory>): Observable<number[]> {
    return this.dbService.bulkAdd(this.storeName, defaultMaterials);
  }

  getAllCustomMaterials(): Observable<Array<LightingFixtureCategory>> {
    return this.dbService.getAll(this.storeName);
  }

  getAllWithObservable(): Observable<Array<LightingFixtureCategory>> {
    return this.dbService.getAll(this.storeName);
  }

  getByIdWithObservable(materialId: number): Observable<LightingFixtureCategory> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  addWithObservable(material: LightingFixtureCategory): Observable<LightingFixtureCategory> {
    return this.dbService.add(this.storeName, material);
  }

  deleteByIdWithObservable(materialId: number): Observable<Array<LightingFixtureCategory>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  updateWithObservable(material: LightingFixtureCategory): Observable<LightingFixtureCategory> {
    return this.dbService.update(this.storeName, material);
  }

  clearLightingFixtures(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }
}