import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { GasLoadChargeMaterial, FlueGasMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, WallLossesSurface, SolidLoadChargeMaterial, AtmosphereSpecificHeat } from '../../shared/models/materials';
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
      await firstValueFrom(this.atmosphereDbService.addWithObservable(material));
      let materials = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
      this.atmosphereDbService.dbAtmospherSpecificHeatMaterials.next(materials);
    };
  }

  async importFlueGas(data: Array<FlueGasMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: FlueGasMaterial = data[i];
      delete material.id;
      material.selected = false;
      await this.flueGasMaterialDbService.asyncAddMaterial(material);
    };
  }

  async importGasLoadCharge(data: Array<GasLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: GasLoadChargeMaterial = data[i];
      material.selected = false;
      delete material.id;
      await firstValueFrom(this.gasLoadDbService.addWithObservable(material));
      let materials = await firstValueFrom(this.gasLoadDbService.getAllWithObservable());
      this.gasLoadDbService.dbGasLoadChargeMaterials.next(materials);
    };
  }

  async importLiquidLoadCharge(data: Array<LiquidLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: LiquidLoadChargeMaterial = data[i];
      material.selected = false;
      delete material.id;
      await firstValueFrom(this.liquidLoadMaterialDbService.addWithObservable(material));
      let materials = await firstValueFrom(this.liquidLoadMaterialDbService.getAllWithObservable());
      this.liquidLoadMaterialDbService.dbLiquidLoadChargeMaterials.next(materials);
    };
  }

  async importSolidLiquidFlueGas(data: Array<SolidLiquidFlueGasMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: SolidLiquidFlueGasMaterial = data[i];
      material.selected = false;
      delete material.id;
      await this.solidLiquidMaterialDbService.asyncAddMaterial(material);
    };
  }

  async importSolidLoadChargeMaterial(data: Array<SolidLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: SolidLoadChargeMaterial = data[i];
      material.selected = false;
      delete material.id;
      await firstValueFrom(this.solidLoadMaterialDbService.addWithObservable(material));
      let materials = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
      this.solidLoadMaterialDbService.dbSolidLoadChargeMaterials.next(materials);
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
    for (let i = 0; i < data.length; i++) {
      let material: AtmosphereSpecificHeat = data[i];
      let materials: Array<AtmosphereSpecificHeat> = await firstValueFrom(this.atmosphereDbService.deleteByIdWithObservable(material.id));
      this.atmosphereDbService.dbAtmospherSpecificHeatMaterials.next(materials);
    };
  }

  async deleteFlueGas(data: Array<FlueGasMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: FlueGasMaterial = data[i];
      this.flueGasMaterialDbService.asyncDeleteMaterial(material.id);
    };
  }

  async deleteGasLoadCharge(data: Array<GasLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: GasLoadChargeMaterial = data[i];
      let materials: Array<GasLoadChargeMaterial> = await firstValueFrom(this.gasLoadDbService.deleteByIdWithObservable(material.id));
      this.gasLoadDbService.dbGasLoadChargeMaterials.next(materials);
    };
  }

  async deleteLiquidLoadCharge(data: Array<LiquidLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: LiquidLoadChargeMaterial = data[i];
      let materials = await firstValueFrom(this.liquidLoadMaterialDbService.deleteByIdWithObservable(material.id));
      this.liquidLoadMaterialDbService.dbLiquidLoadChargeMaterials.next(materials);
    };
  }

  async deleteSolidLiquidFlueGas(data: Array<SolidLiquidFlueGasMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: SolidLiquidFlueGasMaterial = data[i];
      await this.solidLiquidMaterialDbService.asyncDeleteMaterial(material.id);
    };
  }

  async deleteSolidLoadChargeMaterial(data: Array<SolidLoadChargeMaterial>) {
    for (let i = 0; i < data.length; i++) {
      let material: SolidLoadChargeMaterial = data[i];
      let materials: Array<SolidLoadChargeMaterial> = await firstValueFrom(this.solidLoadMaterialDbService.deleteByIdWithObservable(material.id));
      this.solidLoadMaterialDbService.dbSolidLoadChargeMaterials.next(materials);
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
    let hasDuplicateName = existingMaterials.filter((material) => {
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