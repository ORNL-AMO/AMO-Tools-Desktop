import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { GasLoadChargeMaterial, FlueGasMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, WallLossesSurface, SolidLoadChargeMaterial, AtmosphereSpecificHeat } from '../../shared/models/materials';
import { SuiteDbService } from '../suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { WallLossesSurfaceDbService } from '../../indexedDb/wall-losses-surface-db.service';

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
  constructor(private suiteDbService: SuiteDbService, 
    private indexedDbService: IndexedDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService) {
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


  importAtmosphere(data: Array<AtmosphereSpecificHeat>) {
    data.forEach(material => {
      delete material.id;
      material.selected = false;
      let test: boolean = this.suiteDbService.insertAtmosphereSpecificHeat(material);
      if (test === true) {
        this.indexedDbService.addAtmosphereSpecificHeat(material);
      }
    });
  }

  importFlueGas(data: Array<FlueGasMaterial>) {
    data.forEach(material => {
      delete material.id;
      material.selected = false;
      let test: boolean = this.suiteDbService.insertGasFlueGasMaterial(material);
      if (test === true) {
        this.indexedDbService.addFlueGasMaterial(material);
      }
    });
  }

  importGasLoadCharge(data: Array<GasLoadChargeMaterial>) {
    data.forEach(material => {
      material.selected = false;
      delete material.id;
      let test: boolean = this.suiteDbService.insertGasLoadChargeMaterial(material);
      if (test === true) {
        this.indexedDbService.addGasLoadChargeMaterial(material);
      }
    });
  }

  importLiquidLoadCharge(data: Array<LiquidLoadChargeMaterial>) {
    data.forEach(material => {
      material.selected = false;
      delete material.id;
      let test: boolean = this.suiteDbService.insertLiquidLoadChargeMaterial(material);
      if (test === true) {
        this.indexedDbService.addLiquidLoadChargeMaterial(material);
      }
    });
  }

  importSolidLiquidFlueGas(data: Array<SolidLiquidFlueGasMaterial>) {
    data.forEach(material => {
      material.selected = false;
      delete material.id;
      let test: boolean = this.suiteDbService.insertSolidLiquidFlueGasMaterial(material);
      if (test === true) {
        this.indexedDbService.addSolidLiquidFlueGasMaterial(material);
      }
    });
  }

  importSolidLoadChargeMaterial(data: Array<SolidLoadChargeMaterial>) {
    data.forEach(material => {
      material.selected = false;
      delete material.id;
      let test: boolean = this.suiteDbService.insertSolidLoadChargeMaterial(material);
      if (test === true) {
        this.indexedDbService.addSolidLoadChargeMaterial(material);
      }
    });
  }

  importWallLossSurfaces(data: Array<WallLossesSurface>) {
    data.forEach(material => {
      material.selected = false;
      delete material.id;
      let test: boolean = this.suiteDbService.insertWallLossesSurface(material);
      if (test === true) {
        this.wallLossesSurfaceDbService.add(material);
      }
    });
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


  deleteAtmosphere(data: Array<AtmosphereSpecificHeat>) {
    let sdbMaterials: Array<AtmosphereSpecificHeat> = this.suiteDbService.selectAtmosphereSpecificHeat();
    data.forEach(material => {
      this.indexedDbService.deleteAtmosphereSpecificHeat(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.suiteDbService.deleteAtmosphereSpecificHeat(sdbId);
    });
  }

  deleteFlueGas(data: Array<FlueGasMaterial>) {
    let sdbMaterials: Array<FlueGasMaterial> = this.suiteDbService.selectGasFlueGasMaterials();
    data.forEach(material => {
      this.indexedDbService.deleteFlueGasMaterial(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.suiteDbService.deleteGasFlueGasMaterial(sdbId);
    });
  }

  deleteGasLoadCharge(data: Array<GasLoadChargeMaterial>) {
    let sdbMaterials: Array<GasLoadChargeMaterial> = this.suiteDbService.selectGasLoadChargeMaterials();
    data.forEach(material => {
      this.indexedDbService.deleteGasLoadChargeMaterial(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.suiteDbService.deleteGasLoadChargeMaterial(sdbId);
    });
  }

  deleteLiquidLoadCharge(data: Array<LiquidLoadChargeMaterial>) {
    let sdbMaterials: Array<LiquidLoadChargeMaterial> = this.suiteDbService.selectLiquidLoadChargeMaterials();
    data.forEach(material => {
      this.indexedDbService.deleteLiquidLoadChargeMaterial(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.suiteDbService.deleteLiquidLoadChargeMaterial(sdbId);
    });
  }

  deleteSolidLiquidFlueGas(data: Array<SolidLiquidFlueGasMaterial>) {
    let sdbMaterials: Array<SolidLiquidFlueGasMaterial> = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    data.forEach(material => {
      this.indexedDbService.deleteSolidLiquidFlueGasMaterial(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.suiteDbService.deleteSolidLiquidFlueGasMaterial(sdbId);
    });
  }

  deleteSolidLoadChargeMaterial(data: Array<SolidLoadChargeMaterial>) {
    let sdbMaterials: Array<SolidLoadChargeMaterial> = this.suiteDbService.selectSolidLoadChargeMaterials();
    data.forEach(material => {
      this.indexedDbService.deleteSolidLoadChargeMaterial(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.substance === sdbMaterial.substance; }).id;
      this.suiteDbService.deleteSolidLoadChargeMaterial(sdbId);
    });
  }

  deleteWallLossSurfaces(data: Array<WallLossesSurface>) {
    let sdbMaterials: Array<WallLossesSurface> = this.suiteDbService.selectWallLossesSurface();
    data.forEach(material => {
      this.wallLossesSurfaceDbService.deleteById(material.id);
      let sdbId: number = _.find(sdbMaterials, (sdbMaterial) => { return material.surface === sdbMaterial.surface; }).id;
      this.suiteDbService.deleteWallLossesSurface(sdbId);
    });
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
