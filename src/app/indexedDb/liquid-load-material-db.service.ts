import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { LiquidLoadChargeMaterial } from '../shared/models/materials';
import { LiquidLoadMaterialStoreMeta } from './dbConfig';
import { ToolsSuiteApiService } from '../tools-suite-api/tools-suite-api.service';


@Injectable()
export class LiquidLoadMaterialDbService {
  storeName: string = LiquidLoadMaterialStoreMeta.store;
  dbLiquidLoadChargeMaterials: BehaviorSubject<Array<LiquidLoadChargeMaterial>>;

  constructor(private dbService: NgxIndexedDBService,
    private toolsSuiteApiService: ToolsSuiteApiService) {
    this.dbLiquidLoadChargeMaterials = new BehaviorSubject<Array<LiquidLoadChargeMaterial>>([]);
  }

  insertDefaultMaterials(): Observable<number[]> {
    let DefaultData = new this.toolsSuiteApiService.ToolsSuiteModule.DefaultData();
    let suiteDefaultMaterials = DefaultData.getLiquidLoadChargeMaterials();

    let defaultMaterials: Array<LiquidLoadChargeMaterial> = [];
    for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
      let wasmClass = suiteDefaultMaterials.get(i);
      defaultMaterials.push({
        latentHeat: wasmClass.getLatentHeat(),
        specificHeatLiquid: wasmClass.getSpecificHeatLiquid(),
        specificHeatVapor: wasmClass.getSpecificHeatVapor(),
        vaporizationTemperature: wasmClass.getVaporizingTemperature(),
        substance: wasmClass.getSubstance(),
        isDefault: true
      });
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
    return this.dbService.bulkAdd(this.storeName, defaultMaterials);
  }

  getAllCustomMaterials(): Observable<Array<LiquidLoadChargeMaterial>> {
    return this.dbService.getAll(this.storeName).pipe(
      map((materials: LiquidLoadChargeMaterial[]) => materials.filter((material: LiquidLoadChargeMaterial) => !material.isDefault))
    );
  }

  getAllWithObservable(): Observable<Array<LiquidLoadChargeMaterial>> {
    return this.dbService.getAll(this.storeName);
  }

  getByIdWithObservable(materialId: number): Observable<LiquidLoadChargeMaterial> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  addWithObservable(material: LiquidLoadChargeMaterial): Observable<LiquidLoadChargeMaterial> {
    return this.dbService.add(this.storeName, material);
  }

  deleteByIdWithObservable(materialId: number): Observable<Array<LiquidLoadChargeMaterial>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  updateWithObservable(material: LiquidLoadChargeMaterial): Observable<LiquidLoadChargeMaterial> {
    return this.dbService.update(this.storeName, material);
  }

  clearLiquidLoadChargeMaterial(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

}