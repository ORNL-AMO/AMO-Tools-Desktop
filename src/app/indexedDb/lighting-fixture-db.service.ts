import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, map, Observable, firstValueFrom } from 'rxjs';
import { LightingFixtureMaterialStoreMeta } from './dbConfig';
import { LightingFixtureMaterial } from '../shared/models/materials';
@Injectable()
export class LightingFixtureServiceDbService {
  storeName: string = LightingFixtureMaterialStoreMeta.store;
  dbLightingFixtureMaterials: BehaviorSubject<Array<LightingFixtureMaterial>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbLightingFixtureMaterials = new BehaviorSubject<Array<LightingFixtureMaterial>>([]);
  }


  insertDefaultMaterials(defaultMaterials: Array<LightingFixtureMaterial>): Observable<number[]> {
    return this.dbService.bulkAdd(this.storeName, defaultMaterials);
  }


  getAllWithObservable(): Observable<Array<LightingFixtureMaterial>> {
    return this.dbService.getAll(this.storeName);
  }


  getByIdWithObservable(materialId: number): Observable<LightingFixtureMaterial> {
    return this.dbService.getByKey(this.storeName, materialId);
  }


  addWithObservable(material: LightingFixtureMaterial): Observable<LightingFixtureMaterial> {
    return this.dbService.add(this.storeName, material);
  }


  deleteByIdWithObservable(materialId: number): Observable<Array<LightingFixtureMaterial>> {
    return this.dbService.delete(this.storeName, materialId);
  }


  updateWithObservable(material: LightingFixtureMaterial): Observable<LightingFixtureMaterial> {
    return this.dbService.update(this.storeName, material);
  }


  clearLightingFixtureMaterials(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }


  getById(id: number): LightingFixtureMaterial {
    let allMaterials: Array<LightingFixtureMaterial> = this.dbLightingFixtureMaterials.getValue();
    return allMaterials.find(material => material.id === id);
  }

  getAllMaterials(): Array<LightingFixtureMaterial> {
    return this.dbLightingFixtureMaterials.getValue();
  }

  getAllCustomMaterials(): Observable<Array<LightingFixtureMaterial>> {
    return this.getAllWithObservable().pipe(
      map((materials: LightingFixtureMaterial[]) => materials.filter((material: LightingFixtureMaterial) => !material.isDefault))
    );
  }


  async setAllMaterialsFromDb(): Promise<void> {
    let allMaterials: Array<LightingFixtureMaterial> = await firstValueFrom(this.getAllWithObservable());
    this.dbLightingFixtureMaterials.next(allMaterials);
  }

  // Optionally, add async wrappers if needed for compatibility
}