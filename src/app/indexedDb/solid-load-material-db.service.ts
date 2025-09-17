import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SolidLoadChargeMaterial } from '../shared/models/materials';
import { SolidLoadMaterialStoreMeta } from './dbConfig';

@Injectable()
export class SolidLoadMaterialDbService {
  storeName: string = SolidLoadMaterialStoreMeta.store;
  dbSolidLoadChargeMaterials: BehaviorSubject<Array<SolidLoadChargeMaterial>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbSolidLoadChargeMaterials = new BehaviorSubject<Array<SolidLoadChargeMaterial>>([]);
  }

  insertDefaultMaterials(defaultMaterials: Array<SolidLoadChargeMaterial>): Observable<number[]> {
    return this.dbService.bulkAdd(this.storeName, defaultMaterials);
  }

  getAllCustomMaterials(): Observable<Array<SolidLoadChargeMaterial>> {
    return this.dbService.getAll(this.storeName).pipe(
      map((materials: SolidLoadChargeMaterial[]) => materials.filter((material: SolidLoadChargeMaterial) => !material.isDefault))
    );
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