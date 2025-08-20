import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, firstValueFrom, map, Observable } from 'rxjs';
import { FlueGasMaterial } from '../shared/models/materials';
import { FlueGasMaterialStoreMeta } from './dbConfig';
declare var Module: any;

@Injectable()
export class FlueGasMaterialDbService {
  storeName: string = FlueGasMaterialStoreMeta.store;
  dbFlueGasMaterials: BehaviorSubject<Array<FlueGasMaterial>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbFlueGasMaterials = new BehaviorSubject<Array<FlueGasMaterial>>([]);

  }
  async insertDefaultMaterials(): Promise<void> {
    let DefaultData = new Module.DefaultData();
    let suiteDefaultMaterials = DefaultData.getGasFlueGasMaterials();

    let defaultMaterials: Array<FlueGasMaterial> = [];
    for (let i = 0; i < suiteDefaultMaterials.size(); i++) {
      //GasComposition
      let wasmClass = suiteDefaultMaterials.get(i);
      defaultMaterials.push({
        substance: wasmClass.getSubstance(),
        C2H6: wasmClass.getGasByVol("C2H6"),
        C3H8: wasmClass.getGasByVol("C3H8"),
        C4H10_CnH2n: wasmClass.getGasByVol("C4H10_CnH2n"),
        CH4: wasmClass.getGasByVol("CH4"),
        CO: wasmClass.getGasByVol("CO"),
        CO2: wasmClass.getGasByVol("CO2"),
        H2: wasmClass.getGasByVol("H2"),
        H2O: wasmClass.getGasByVol("H2O"),
        N2: wasmClass.getGasByVol("N2"),
        O2: wasmClass.getGasByVol("O2"),
        SO2: wasmClass.getGasByVol("SO2"),
        heatingValue: wasmClass.getHeatingValue(),
        heatingValueVolume: wasmClass.getHeatingValueVolume(),
        specificGravity: wasmClass.getSpecificGravity(),
        isDefault: true
      });
      wasmClass.delete();
    }
    DefaultData.delete();
    suiteDefaultMaterials.delete();
    await firstValueFrom(this.dbService.bulkAdd(this.storeName, defaultMaterials));
    await this.asyncSetAllMaterialsFromDb();
    return;
  }


  private getAllWithObservable(): Observable<Array<FlueGasMaterial>> {
    return this.dbService.getAll(this.storeName);
  }

  private getByIdWithObservable(materialId: number): Observable<FlueGasMaterial> {
    return this.dbService.getByKey(this.storeName, materialId);
  }

  private addWithObservable(material: FlueGasMaterial): Observable<FlueGasMaterial> {
    return this.dbService.add(this.storeName, material);
  }

  private deleteByIdWithObservable(materialId: number): Observable<Array<FlueGasMaterial>> {
    return this.dbService.delete(this.storeName, materialId);
  }

  private updateWithObservable(material: FlueGasMaterial): Observable<FlueGasMaterial> {
    return this.dbService.update(this.storeName, material);
  }

  clearFlueGasMaterials(): Observable<boolean> {
    return this.dbService.clear(this.storeName);
  }
  
  getById(id: number): FlueGasMaterial {
    let allMaterials: Array<FlueGasMaterial> = this.dbFlueGasMaterials.getValue();
    return allMaterials.find(material => material.id === id);
  }

  getAllMaterials(): Array<FlueGasMaterial> {
    return this.dbFlueGasMaterials.getValue();
  }

  getAllCustomMaterials(): Array<FlueGasMaterial> {
    let allMaterials: Array<FlueGasMaterial> = this.dbFlueGasMaterials.getValue();
    return allMaterials.filter(material => !material.isDefault);
  }

  async asyncSetAllMaterialsFromDb(): Promise<void> {
    let allMaterials: Array<FlueGasMaterial> = await firstValueFrom(this.getAllWithObservable());
    this.dbFlueGasMaterials.next(allMaterials);
  }

  async asyncUpdateMaterial(material: FlueGasMaterial): Promise<void> {
    await firstValueFrom(this.updateWithObservable(material));
    await this.asyncSetAllMaterialsFromDb();
  }

  async asyncDeleteMaterial(materialId: number): Promise<void> {
    await firstValueFrom(this.deleteByIdWithObservable(materialId));
    await this.asyncSetAllMaterialsFromDb();
  }

  async asyncAddMaterial(material: FlueGasMaterial): Promise<void> {
    await firstValueFrom(this.addWithObservable(material));
    await this.asyncSetAllMaterialsFromDb();
  }

}