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
        }
      }
  }

  async importWallLossSurfaces(data: Array<WallLossesSurface>) {
    for (let i = 0; i < data.length; i++) {
        let material: WallLossesSurface = data[i]
        material.selected = false;
        delete material.id;
        let test: boolean = this.sqlDbApiService.insertWallLossesSurface(material);
        if (test === true) {
          await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(material));
        }
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
      await firstValueFrom(this.atmosphereDbService.deleteByIdWithObservable(material.id));
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteAtmosphereSpecificHeat(sdbId);
    };
  }

  async deleteFlueGas(data: Array<FlueGasMaterial>) {
    let sdbMaterials: Array<FlueGasMaterial> = this.sqlDbApiService.selectGasFlueGasMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: FlueGasMaterial = data[i];
      await firstValueFrom(this.flueGasMaterialDbService.deleteByIdWithObservable(material.id));
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteGasFlueGasMaterial(sdbId);
    };
  }

  async deleteGasLoadCharge(data: Array<GasLoadChargeMaterial>) {
    let sdbMaterials: Array<GasLoadChargeMaterial> = this.sqlDbApiService.selectGasLoadChargeMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: GasLoadChargeMaterial = data[i];
      this.gasLoadDbService.deleteByIdWithObservable(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteGasLoadChargeMaterial(sdbId);
    };
  }

  async deleteLiquidLoadCharge(data: Array<LiquidLoadChargeMaterial>) {
    let sdbMaterials: Array<LiquidLoadChargeMaterial> = this.sqlDbApiService.selectLiquidLoadChargeMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: LiquidLoadChargeMaterial = data[i];
      await firstValueFrom(this.liquidLoadMaterialDbService.deleteByIdWithObservable(material.id));
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteLiquidLoadChargeMaterial(sdbId);
    };
  }

 async deleteSolidLiquidFlueGas(data: Array<SolidLiquidFlueGasMaterial>) {
    let sdbMaterials: Array<SolidLiquidFlueGasMaterial> = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: SolidLiquidFlueGasMaterial = data[i];
      await firstValueFrom(this.solidLiquidMaterialDbService.deleteByIdWithObservable(material.id));
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteSolidLiquidFlueGasMaterial(sdbId);
    };
  }

  async deleteSolidLoadChargeMaterial(data: Array<SolidLoadChargeMaterial>) {
    let sdbMaterials: Array<SolidLoadChargeMaterial> = this.sqlDbApiService.selectSolidLoadChargeMaterials();
    for (let i = 0; i < data.length; i++) {
      let material: SolidLoadChargeMaterial = data[i];
      await firstValueFrom(this.solidLoadMaterialDbService.deleteByIdWithObservable(material.id));
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.sqlDbApiService.deleteSolidLoadChargeMaterial(sdbId);
    };
  }

  async deleteWallLossSurfaces(data: Array<WallLossesSurface>) {
    let sdbMaterials: Array<WallLossesSurface> = this.sqlDbApiService.selectWallLossesSurface();
    for (let i = 0; i < data.length; i++) {
      let material: WallLossesSurface = data[i]
      await firstValueFrom(this.wallLossesSurfaceDbService.deleteByIdWithObservable(material.id));
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.surface === sdbMaterial.surface; }).id;
      this.sqlDbApiService.deleteWallLossesSurface(sdbId);
    };
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
