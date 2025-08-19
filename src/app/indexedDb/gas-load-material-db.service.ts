import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { GasLoadChargeMaterial } from '../shared/models/materials';
import { GasLoadMaterialStoreMeta } from './dbConfig';
declare var Module: any;


@Injectable()
export class GasLoadMaterialDbService {
  storeName: string = GasLoadMaterialStoreMeta.store;
  dbGasLoadChargeMaterials: BehaviorSubject<Array<GasLoadChargeMaterial>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbGasLoadChargeMaterials = new BehaviorSubject<Array<GasLoadChargeMaterial>>([]);

  }

  insertDefaultMaterials(): Observable<number[]> {
    let DefaultData = new Module.DefaultData();
    let suiteDefaultMaterials = DefaultData.getGasLoadChargeMaterials();

    let defaultMaterials: Array<GasLoadChargeMaterial> = [];
    for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
      let wasmClass = suiteDefaultMaterials.get(i);
      defaultMaterials.push({
        specificHeatVapor: wasmClass.getSpecificHeatVapor(),
        substance: wasmClass.getSubstance(),
        isDefault: true
      });
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
    return this.dbService.bulkAdd(this.storeName, defaultMaterials);
  }

  getAllCustomMaterials(): Observable<Array<GasLoadChargeMaterial>> {
    return this.dbService.getAll(this.storeName).pipe(
      map((materials: GasLoadChargeMaterial[]) => materials.filter((material: GasLoadChargeMaterial) => !material.isDefault))
    );
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