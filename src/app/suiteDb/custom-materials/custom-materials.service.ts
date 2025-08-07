import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { GasLoadChargeMaterial, FlueGasMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, WallLossesSurface, SolidLoadChargeMaterial, AtmosphereSpecificHeat } from '../../shared/models/materials';
import { SqlDbApiService } from '../../tools-suite-api/sql-db-api.service';
import { WallLossesSurfaceDbService } from '../../indexedDb/wall-losses-surface-db.service';
import { GasLoadMaterialDbService } from '../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../indexedDb/liquid-load-material-db.service';
import { SolidLoadMaterialDbService } from '../../indexedDb/solid-load-material-db.service';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { AtmosphereDbService } from '../../indexedDb/atmosphere-db.service';

@Injectable()
export class CustomMaterialsService {

  selectedAtmosphere: Array<AtmosphereSpecificHeat>;
  selectedFlueGas: Array<FlueGasMaterial>;
  selectedGasLoadCharge: Array<GasLoadChargeMaterial>;
  selectedLiquidLoadCharge: Array<LiquidLoadChargeMaterial>;
  selectedSolidLiquidFlueGas: Array<SolidLiquidFlueGasMaterial>;
  selectedSolidCharge: Array<SolidLoadChargeMaterial>;
  selectedWall: Array<WallLossesSurface>;

  getSelected: BehaviorSubject<boolean>;
  selectAll: BehaviorSubject<boolean>;
  constructor( 
    private sqlDbApiService: SqlDbApiService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private atmosphereDbService: AtmosphereDbService,
    ) {
    this.selectedAtmosphere = new Array<AtmosphereSpecificHeat>();
    this.selectedFlueGas = new Array<FlueGasMaterial>();
    this.selectedGasLoadCharge = new Array<GasLoadChargeMaterial>();
    this.selectedLiquidLoadCharge = new Array<LiquidLoadChargeMaterial>();
    this.selectedSolidLiquidFlueGas = new Array<SolidLiquidFlueGasMaterial>();
    this.selectedSolidCharge = new Array<SolidLoadChargeMaterial>();
    this.selectedWall = new Array<WallLossesSurface>();
    this.getSelected = new BehaviorSubject<boolean>(false);
    this.selectAll = new BehaviorSubject<boolean>(false);
  }


  buildSelectedData(): MaterialData {
    let data: MaterialData = {
      atmosphereSpecificHeat: this.selectedAtmosphere,
      flueGasMaterial: this.selectedFlueGas,
      gasLoadChargeMaterial: this.selectedGasLoadCharge,
      liquidLoadChargeMaterial: this.selectedLiquidLoadCharge,
      solidLiquidFlueGasMaterial: this.selectedSolidLiquidFlueGas,
      solidLoadChargeMaterial: this.selectedSolidCharge,
      wallLossesSurface: this.selectedWall
    };
    return data;
  }

  importSelected(data: MaterialData) {
    if (data.atmosphereSpecificHeat.length !== 0) {
      this.importAtmosphere(data.atmosphereSpecificHeat);
    }
    if (data.flueGasMaterial.length !== 0) {
      this.importFlueGas(data.flueGasMaterial);
    }
    if (data.gasLoadChargeMaterial.length !== 0) {
      this.importGasLoadCharge(data.gasLoadChargeMaterial);
    }
    if (data.liquidLoadChargeMaterial.length !== 0) {
      this.importLiquidLoadCharge(data.liquidLoadChargeMaterial);
    }
    if (data.solidLiquidFlueGasMaterial.length !== 0) {
      this.importSolidLiquidFlueGas(data.solidLiquidFlueGasMaterial);
    }
    if (data.solidLoadChargeMaterial.length !== 0) {
      this.importSolidLoadChargeMaterial(data.solidLoadChargeMaterial);
    }
    if (data.wallLossesSurface.length !== 0) {
      this.importWallLossSurfaces(data.wallLossesSurface);
    }
  }


  async importAtmosphere(data: Array<AtmosphereSpecificHeat>) {
    for (let i = 0; i < data.length; i++) {
      let material: AtmosphereSpecificHeat = data[i];
      delete material.id;
      material.selected = false;
      let test: boolean = this.sqlDbApiService.insertAtmosphereSpecificHeat(material);
      if (test === true) {
        await firstValueFrom(this.atmosphereDbService.addWithObservable(material));
        let materials = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
        this.atmosphereDbService.dbAtmospherSpecificHeatMaterials.next(materials);
      }
    };
  }

  async importFlueGas(data: Array<FlueGasMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: FlueGasMaterial = data[i];
      delete material.id;
      material.selected = false;
      let test: boolean = this.sqlDbApiService.insertGasFlueGasMaterial(material);
      if (test === true) {
        await firstValueFrom(this.flueGasMaterialDbService.addWithObservable(material));
        let materials = await firstValueFrom(this.flueGasMaterialDbService.getAllWithObservable());
        this.flueGasMaterialDbService.dbFlueGasMaterials.next(materials);
      }
    };
  }

  async importGasLoadCharge(data: Array<GasLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: GasLoadChargeMaterial = data[i];
      material.selected = false;
      delete material.id;
      let test: boolean = this.sqlDbApiService.insertGasLoadChargeMaterial(material);
      if (test === true) {
        await firstValueFrom(this.gasLoadDbService.addWithObservable(material));
        let materials = await firstValueFrom(this.gasLoadDbService.getAllWithObservable());
        this.gasLoadDbService.dbGasLoadChargeMaterials.next(materials);
      }
    };
  }

  async importLiquidLoadCharge(data: Array<LiquidLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: LiquidLoadChargeMaterial = data[i];
      material.selected = false;
      delete material.id;
      let test: boolean = this.sqlDbApiService.insertLiquidLoadChargeMaterial(material);
      if (test === true) {
        await firstValueFrom(this.liquidLoadMaterialDbService.addWithObservable(material));
        let materials = await firstValueFrom(this.liquidLoadMaterialDbService.getAllWithObservable());
        this.liquidLoadMaterialDbService.dbLiquidLoadChargeMaterials.next(materials);
      }
    };
  }

  async importSolidLiquidFlueGas(data: Array<SolidLiquidFlueGasMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: SolidLiquidFlueGasMaterial = data[i];
      material.selected = false;
      delete material.id;
      let test: boolean = this.sqlDbApiService.insertSolidLiquidFlueGasMaterial(material);
      if (test === true) {
        await firstValueFrom(this.solidLiquidMaterialDbService.addWithObservable(material));
        let materials = await firstValueFrom(this.solidLiquidMaterialDbService.getAllWithObservable());
        this.solidLiquidMaterialDbService.dbSolidLiquidFlueGasMaterials.next(materials);
      }
    };
  }

  async importSolidLoadChargeMaterial(data: Array<SolidLoadChargeMaterial>) {
      for (let i = 0; i < data.length; i++) {
        let material: SolidLoadChargeMaterial = data[i];
        material.selected = false;
        delete material.id;
        let test: boolean = this.sqlDbApiService.insertSolidLoadChargeMaterial(material);
        if (test === true) {
          await firstValueFrom(this.solidLoadMaterialDbService.addWithObservable(material));
          let materials = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
          this.solidLoadMaterialDbService.dbSolidLoadChargeMaterials.next(materials);
        }
      }
  }

  async importWallLossSurfaces(data: Array<WallLossesSurface>) {
    for (let i = 0; i < data.length; i++) {
        let material: WallLossesSurface = data[i]
        material.selected = false;
        delete material.id;
        await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(material));
        let materials = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
        this.wallLossesSurfaceDbService.dbWallLossesSurfaceMaterials.next(materials);
      }
  }

  deleteSelected(data: MaterialData) {
    if (data.atmosphereSpecificHeat.length !== 0) {
      this.deleteAtmosphere(data.atmosphereSpecificHeat);
    }
    if (data.flueGasMaterial.length !== 0) {
      this.deleteFlueGas(data.flueGasMaterial);
    }
    if (data.gasLoadChargeMaterial.length !== 0) {
      this.deleteGasLoadCharge(data.gasLoadChargeMaterial);
    }
    if (data.liquidLoadChargeMaterial.length !== 0) {
      this.deleteLiquidLoadCharge(data.liquidLoadChargeMaterial);
    }
    if (data.solidLiquidFlueGasMaterial.length !== 0) {
      this.deleteSolidLiquidFlueGas(data.solidLiquidFlueGasMaterial);
    }
    if (data.solidLoadChargeMaterial.length !== 0) {
      this.deleteSolidLoadChargeMaterial(data.solidLoadChargeMaterial);
    }
    if (data.wallLossesSurface.length !== 0) {
      this.deleteWallLossSurfaces(data.wallLossesSurface);
    }
  }


  async deleteAtmosphere(data: Array<AtmosphereSpecificHeat>) {
    let sdbMaterials: Array<AtmosphereSpecificHeat> = this.sqlDbApiService.selectAtmosphereSpecificHeat();
    for (let i = 0; i < data.length; i++) {
      let material: AtmosphereSpecificHeat = data[i];
      let materials: Array<AtmosphereSpecificHeat> = await firstValueFrom(this.atmosphereDbService.deleteByIdWithObservable(material.id));
      this.atmosphereDbService.dbAtmospherSpecificHeatMaterials.next(materials);
      
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteAtmosphereSpecificHeat(sdbId);
    };
  }

  async deleteFlueGas(data: Array<FlueGasMaterial>) {
    let sdbMaterials: Array<FlueGasMaterial> = this.sqlDbApiService.selectGasFlueGasMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: FlueGasMaterial = data[i];
      let materials = await firstValueFrom(this.flueGasMaterialDbService.deleteByIdWithObservable(material.id));
      this.flueGasMaterialDbService.dbFlueGasMaterials.next(materials);

      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteGasFlueGasMaterial(sdbId);
    };
  }

  async deleteGasLoadCharge(data: Array<GasLoadChargeMaterial>) {
    let sdbMaterials: Array<GasLoadChargeMaterial> = this.sqlDbApiService.selectGasLoadChargeMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: GasLoadChargeMaterial = data[i];
      let materials = await firstValueFrom(this.gasLoadDbService.deleteByIdWithObservable(material.id));
      this.gasLoadDbService.dbGasLoadChargeMaterials.next(materials);

      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteGasLoadChargeMaterial(sdbId);
    };
  }

  async deleteLiquidLoadCharge(data: Array<LiquidLoadChargeMaterial>) {
    let sdbMaterials: Array<LiquidLoadChargeMaterial> = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: LiquidLoadChargeMaterial = data[i];
      let materials = await firstValueFrom(this.liquidLoadMaterialDbService.deleteByIdWithObservable(material.id));
      this.liquidLoadMaterialDbService.dbLiquidLoadChargeMaterials.next(materials);

      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteLiquidLoadChargeMaterial(sdbId);
    };
  }

 async deleteSolidLiquidFlueGas(data: Array<SolidLiquidFlueGasMaterial>) {
    let sdbMaterials: Array<SolidLiquidFlueGasMaterial> = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: SolidLiquidFlueGasMaterial = data[i];
      let materials = await firstValueFrom(this.solidLiquidMaterialDbService.deleteByIdWithObservable(material.id));
      this.solidLiquidMaterialDbService.dbSolidLiquidFlueGasMaterials.next(materials);

      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteSolidLiquidFlueGasMaterial(sdbId);
    };
  }

  async deleteSolidLoadChargeMaterial(data: Array<SolidLoadChargeMaterial>) {
    let sdbMaterials: Array<SolidLoadChargeMaterial> = this.sqlDbApiService.selectSolidLoadChargeMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: SolidLoadChargeMaterial = data[i];
      let materials = await firstValueFrom(this.solidLoadMaterialDbService.deleteByIdWithObservable(material.id));
      this.solidLoadMaterialDbService.dbSolidLoadChargeMaterials.next(materials);

      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteSolidLoadChargeMaterial(sdbId);
    };
  }

  async deleteWallLossSurfaces(data: Array<WallLossesSurface>) {
    let sdbMaterials: Array<WallLossesSurface> = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    for (let i = 0; i < data.length; i++) {
      let material: WallLossesSurface = data[i]
      let materials = await firstValueFrom(this.wallLossesSurfaceDbService.deleteByIdWithObservable(material.id));
      this.wallLossesSurfaceDbService.dbWallLossesSurfaceMaterials.next(materials);
    };
  }

    getMaterialNameError(existingMaterials: MeasurPHMaterial[], newMaterialId: number, newMaterialName: string, nameKey: 'substance' | 'surface'): string {
      let materialNameError = undefined;
      let hasDuplicateName = _.filter(existingMaterials, (material) => {
        if (material.id !== newMaterialId) {
          return this.getCleanedMaterialName(material[nameKey]) === this.getCleanedMaterialName(newMaterialName);
        }
      });

      if (hasDuplicateName.length > 0) {
        materialNameError = 'This name is in use by another material';
      }
      else if (this.getCleanedMaterialName(newMaterialName) === '') {
        materialNameError = 'The material must have a name';
      }
      return materialNameError;
    }

    getCleanedMaterialName(name: string): string {
      return name.toLowerCase().trim();
    }

}


export interface MaterialData {
  atmosphereSpecificHeat: Array<AtmosphereSpecificHeat>;
  flueGasMaterial: Array<FlueGasMaterial>;
  gasLoadChargeMaterial: Array<GasLoadChargeMaterial>;
  liquidLoadChargeMaterial: Array<LiquidLoadChargeMaterial>;
  solidLiquidFlueGasMaterial: Array<SolidLiquidFlueGasMaterial>;
  solidLoadChargeMaterial: Array<SolidLoadChargeMaterial>;
  wallLossesSurface: Array<WallLossesSurface>;
}


export type MeasurPHMaterial = WallLossesSurface | GasLoadChargeMaterial | LiquidLoadChargeMaterial | SolidLiquidFlueGasMaterial | SolidLoadChargeMaterial | AtmosphereSpecificHeat | FlueGasMaterial;