import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { SolidLoadChargeMaterial } from '../shared/models/materials';
import { SolidLoadMaterialStoreMeta } from './dbConfig';

@Injectable()
export class SolidLoadMaterialDbService {
  storeName: string = SolidLoadMaterialStoreMeta.store;
  constructor(private dbService: NgxIndexedDBService) {
  }

  getAllWithObservable(): Observable<Array<SolidLoadChargeMaterial>> {
    return this.dbService.getAll(this.storeName);
  }

  getByIdWithObservable(materialId: number): Observable<SolidLoadChargeMaterial> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  addWithObservable(material: SolidLoadChargeMaterial): Observable<SolidLoadChargeMaterial> {
    return this.dbService.add(this.storeName, material);
  }

  deleteByIdWithObservable(materialId: number): Observable<Array<SolidLoadChargeMaterial>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  updateWithObservable(material: SolidLoadChargeMaterial): Observable<SolidLoadChargeMaterial> {
    return this.dbService.update(this.storeName, material);
  }

  clearSolidLoadChargeMaterial(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

}