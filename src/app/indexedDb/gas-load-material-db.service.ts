import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { GasLoadChargeMaterial } from '../shared/models/materials';
import { GasLoadMaterialStoreMeta } from './dbConfig';

@Injectable()
export class GasLoadMaterialDbService {
  storeName: string = GasLoadMaterialStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) {
  }

  getAllWithObservable(): Observable<Array<GasLoadChargeMaterial>> {
    return this.dbService.getAll(this.storeName);
  }

  getByIdWithObservable(materialId: number): Observable<GasLoadChargeMaterial> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  addWithObservable(material: GasLoadChargeMaterial): Observable<GasLoadChargeMaterial> {
    return this.dbService.add(this.storeName, material);
  }

  deleteByIdWithObservable(materialId: number): Observable<Array<GasLoadChargeMaterial>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  updateWithObservable(material: GasLoadChargeMaterial): Observable<GasLoadChargeMaterial> {
    return this.dbService.update(this.storeName, material);
  }

  clearGasLoadChargeMaterial(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

}