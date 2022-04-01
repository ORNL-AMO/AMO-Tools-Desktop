import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, Observable } from 'rxjs';
import { WallLossesSurface } from '../shared/models/materials';
import { WallLossesSurfaceStoreMeta } from './dbConfig';

@Injectable()
export class WallLossesSurfaceDbService {

  storeName: string = WallLossesSurfaceStoreMeta.store;
  selectedSurface: BehaviorSubject<WallLossesSurface>;
  allSurfaces: BehaviorSubject<Array<WallLossesSurface>>;
  constructor(private dbService: NgxIndexedDBService) {
      this.selectedSurface = new BehaviorSubject<WallLossesSurface>(undefined);
      this.allSurfaces = new BehaviorSubject<Array<WallLossesSurface>>(new Array());
  }

  getAll(): Observable<Array<WallLossesSurface>> {
    return this.dbService.getAll(this.storeName);
  }

  getById(surfaceId: number): Observable<WallLossesSurface> {
    return this.dbService.getByKey(this.storeName, surfaceId);
  }

  add(surface: WallLossesSurface): void {
    this.dbService.add(this.storeName, surface);
  }

  deleteById(surfaceId: number): void {
    this.dbService.delete(this.storeName, surfaceId);
  }

  update(surface: WallLossesSurface): void {
    this.dbService.update(this.storeName, surface);
  }

  clearWallLossesSurface(): void {
    this.dbService.clear(this.storeName);
  }

}