import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { WallLossesSurface } from '../shared/models/materials';
import { WallLossesSurfaceStoreMeta } from './dbConfig';

@Injectable()
export class WallLossesSurfaceDbService {

  storeName: string = WallLossesSurfaceStoreMeta.store;
  dbWallLossesSurfaceMaterials: BehaviorSubject<Array<WallLossesSurface>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbWallLossesSurfaceMaterials = new BehaviorSubject<Array<WallLossesSurface>>([]);

  }

  getAllWithObservable(): Observable<Array<WallLossesSurface>> {
    return this.dbService.getAll(this.storeName);
  }

  getByIdWithObservable(materialId: number): Observable<WallLossesSurface> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  addWithObservable(material: WallLossesSurface): Observable<WallLossesSurface> {
    return this.dbService.add(this.storeName, material);
  }

  deleteByIdWithObservable(materialId: number): Observable<Array<WallLossesSurface>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  updateWithObservable(material: WallLossesSurface): Observable<WallLossesSurface> {
    return this.dbService.update(this.storeName, material);
  }

  clearWallLossesSurface(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

}