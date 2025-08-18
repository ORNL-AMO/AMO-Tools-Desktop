import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { SolidLoadChargeMaterial } from '../shared/models/materials';
import { SolidLoadMaterialStoreMeta } from './dbConfig';
declare var Module: any;

@Injectable()
export class SolidLoadMaterialDbService {
  storeName: string = SolidLoadMaterialStoreMeta.store;
  dbSolidLoadChargeMaterials: BehaviorSubject<Array<SolidLoadChargeMaterial>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbSolidLoadChargeMaterials = new BehaviorSubject<Array<SolidLoadChargeMaterial>>([]);

  }

  insertDefaultMaterials(): Observable<number[]> {
    let DefaultData = new Module.DefaultData();
    let suiteDefaultMaterials = DefaultData.getSolidLoadChargeMaterials();

    let defaultMaterials: Array<SolidLoadChargeMaterial> = [];
    for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
      let wasmClass = suiteDefaultMaterials.get(i);
      defaultMaterials.push({
        latentHeat: wasmClass.getLatentHeat(),
        meltingPoint: wasmClass.getMeltingPoint(),
        specificHeatLiquid: wasmClass.getSpecificHeatLiquid(),
        specificHeatSolid: wasmClass.getSpecificHeatSolid(),
        substance: wasmClass.getSubstance(),
        isDefault: true
      });
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
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