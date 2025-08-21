import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';
import { SolidLiquidFlueGasMaterial } from '../shared/models/materials';
import { SolidLiquidFlueGasMaterialStoreMeta } from './dbConfig';
declare var Module: any;

@Injectable()
export class SolidLiquidMaterialDbService {
  storeName: string = SolidLiquidFlueGasMaterialStoreMeta.store;
  dbSolidLiquidFlueGasMaterials: BehaviorSubject<Array<SolidLiquidFlueGasMaterial>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbSolidLiquidFlueGasMaterials = new BehaviorSubject<Array<SolidLiquidFlueGasMaterial>>([]);
  }
  async insertDefaultMaterials(): Promise<void> {
    let DefaultData = new Module.DefaultData();
    let suiteDefaultMaterials = DefaultData.getSolidLiquidFlueGasMaterials();

    let defaultMaterials: Array<SolidLiquidFlueGasMaterial> = [];
    for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
      //GasComposition
      let wasmClass = suiteDefaultMaterials.get(i);
      defaultMaterials.push({
        substance: wasmClass.getSubstance(),
        carbon: wasmClass.getCarbon(),
        hydrogen: wasmClass.getHydrogen(),
        inertAsh: wasmClass.getInertAsh(),
        moisture: wasmClass.getMoisture(),
        nitrogen: wasmClass.getNitrogen(),
        o2: wasmClass.getO2(),
        sulphur: wasmClass.getSulphur(),
        heatingValue: wasmClass.getHeatingValueFuel(),
        isDefault: true
      });
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
    await firstValueFrom(this.dbService.bulkAdd(this.storeName, defaultMaterials));
    await this.setAllMaterialsFromDb();
  }
  
  private getAllWithObservable(): Observable<Array<SolidLiquidFlueGasMaterial>> {
    return this.dbService.getAll(this.storeName);
  }

  private getByIdWithObservable(materialId: number): Observable<SolidLiquidFlueGasMaterial> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  private addWithObservable(material: SolidLiquidFlueGasMaterial): Observable<SolidLiquidFlueGasMaterial> {
    return this.dbService.add(this.storeName, material);
  }

  private deleteByIdWithObservable(materialId: number): Observable<Array<SolidLiquidFlueGasMaterial>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  private updateWithObservable(material: SolidLiquidFlueGasMaterial): Observable<SolidLiquidFlueGasMaterial> {
    return this.dbService.update(this.storeName, material);
  }

  clearSolidLiquidFlueGasMaterials(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }

  getById(id: number): SolidLiquidFlueGasMaterial {
    let allMaterials: Array<SolidLiquidFlueGasMaterial> = this.dbSolidLiquidFlueGasMaterials.getValue();
    return allMaterials.find(material => material.id === id);
  }

  getAllMaterials(): Array<SolidLiquidFlueGasMaterial>{
    return this.dbSolidLiquidFlueGasMaterials.getValue();
  }

  getAllCustomMaterials(): Array<SolidLiquidFlueGasMaterial> {
    let allMaterials: Array<SolidLiquidFlueGasMaterial> = this.dbSolidLiquidFlueGasMaterials.getValue();
    return allMaterials.filter(material => !material.isDefault);
  }

  async setAllMaterialsFromDb(): Promise<void> {
    let allMaterials: Array<SolidLiquidFlueGasMaterial> = await firstValueFrom(this.getAllWithObservable());
    this.dbSolidLiquidFlueGasMaterials.next(allMaterials);
  }

  async updateMaterial(material: SolidLiquidFlueGasMaterial): Promise<void> {
    await firstValueFrom(this.updateWithObservable(material));
    await this.setAllMaterialsFromDb();
  }

  async deleteMaterial(materialId: number): Promise<void> {
    await firstValueFrom(this.deleteByIdWithObservable(materialId));
    await this.setAllMaterialsFromDb();
  }

  async addMaterial(material: SolidLiquidFlueGasMaterial): Promise<void> {
    await firstValueFrom(this.addWithObservable(material));
    await this.setAllMaterialsFromDb();
  }
}