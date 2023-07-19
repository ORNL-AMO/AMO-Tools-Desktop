import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { AtmosphereSpecificHeat, FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, SuiteDbMotor, SuiteDbPump, WallLossesSurface } from '../shared/models/materials';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
declare var dbInstance: any;
@Injectable()
export class SqlDbApiService {

  constructor(private suiteApiHelperService: SuiteApiHelperService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadMaterialDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private atmosphereDbService: AtmosphereDbService,
    ) { }


  async initCustomDbMaterials() {
    let customGasLoadChargeMaterials: GasLoadChargeMaterial[] = await firstValueFrom(this.gasLoadMaterialDbService.getAllWithObservable());
    customGasLoadChargeMaterials.forEach(material => {
      let suiteResult = this.insertGasLoadChargeMaterial(material);
    });


    let customLiquidLoadChargeMaterials: LiquidLoadChargeMaterial[] = await firstValueFrom(this.liquidLoadMaterialDbService.getAllWithObservable());
    customLiquidLoadChargeMaterials.forEach(material => {
      let suiteResult = this.insertLiquidLoadChargeMaterial(material);
    });

    let solidLoadChargeMaterials: SolidLoadChargeMaterial[] = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
    solidLoadChargeMaterials.forEach(material => {
      let suiteResult = this.insertSolidLoadChargeMaterial(material);
    });

    let atmosphereMaterials: AtmosphereSpecificHeat[] = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
    atmosphereMaterials.forEach(material => {
      let suiteResult = this.insertAtmosphereSpecificHeat(material);
    });

    let wallMaterials: WallLossesSurface[] = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    wallMaterials.forEach(material => {
      let suiteResult = this.insertWallLossesSurface(material);
    });

   let flueGasMaterials: FlueGasMaterial[] = await firstValueFrom(this.flueGasMaterialDbService.getAllWithObservable());
   flueGasMaterials.forEach(material => {
      let suiteResult = this.insertGasFlueGasMaterial(material);
    });

    let solidLiquidFlueGasMaterial: SolidLiquidFlueGasMaterial[] = await firstValueFrom(this.solidLiquidMaterialDbService.getAllWithObservable());
    solidLiquidFlueGasMaterial.forEach(material => {
      let suiteResult = this.insertSolidLiquidFlueGasMaterial(material);
    });

  }

  //GAS FLUE GAS MATERIALS
  selectGasFlueGasMaterials(): Array<FlueGasMaterial> {
    try {
      let flueGasMaterials: Array<FlueGasMaterial> = new Array();
      let items = dbInstance.getGasFlueGasMaterials();
      for (let index = 0; index < items.size(); index++) {
        let flueGasComposition = items.get(index);
        let flueGasItem: FlueGasMaterial = this.getFlueGasItemFromGasComposition(flueGasComposition)
        flueGasMaterials.push(flueGasItem);
        flueGasComposition.delete();
      }
      items.delete();
      return flueGasMaterials;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  //convert C++ object to js object
  getFlueGasItemFromGasComposition(flueGasComposition: any): FlueGasMaterial {
    return {
      C2H6: flueGasComposition.getGasByVol("C2H6"),
      C3H8: flueGasComposition.getGasByVol("C3H8"),
      C4H10_CnH2n: flueGasComposition.getGasByVol("C4H10_CnH2n"),
      CH4: flueGasComposition.getGasByVol("CH4"),
      CO: flueGasComposition.getGasByVol("CO"),
      CO2: flueGasComposition.getGasByVol("CO2"),
      H2: flueGasComposition.getGasByVol("H2"),
      H2O: flueGasComposition.getGasByVol("H2O"),
      N2: flueGasComposition.getGasByVol("N2"),
      O2: flueGasComposition.getGasByVol("O2"),
      SO2: flueGasComposition.getGasByVol("SO2"),
      heatingValue: flueGasComposition.getHeatingValue(),
      heatingValueVolume: flueGasComposition.getHeatingValueVolume(),
      id: flueGasComposition.getID(),
      //TODO: double check selected = false
      selected: false,
      specificGravity: flueGasComposition.getSpecificGravity(),
      substance: flueGasComposition.getSubstance(),
    }
  }

  selectGasFlueGasMaterialById(id: number): FlueGasMaterial {
    try {
      //get composition and create flue gas material
      let flueGasComposition = dbInstance.getGasFlueGasMaterialById(id);
      let flueGasItem: FlueGasMaterial = this.getFlueGasItemFromGasComposition(flueGasComposition);
      flueGasComposition.delete();
      return flueGasItem;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertGasFlueGasMaterial(material: FlueGasMaterial): boolean {
    try {
      //create material
      let gasComposition = this.getGasCompositionFromMaterial(material);
      //insert
      dbInstance.insertGasFlueGasMaterial(gasComposition);
      gasComposition.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateGasFlueGasMaterial(material: FlueGasMaterial): boolean {
    try {
      //create material
      let gasComposition = this.getGasCompositionFromMaterial(material);
      //set id
      gasComposition.setID(material.id);
      //update
      dbInstance.updateGasFlueGasMaterial(gasComposition);
      gasComposition.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getGasCompositionFromMaterial(material: FlueGasMaterial) {
    // std::string substance, const double CH4, const double C2H6, const double N2,
    //               const double H2, const double C3H8, const double C4H10_CnH2n, const double H2O,
    //               const double CO, const double CO2, const double SO2, const double O2
    return new Module.GasCompositions(material.substance, material.CH4, material.C2H6, material.N2, material.H2, material.C3H8,
      material.C4H10_CnH2n, material.H2O, material.CO, material.CO2, material.SO2, material.O2);
  }

  deleteGasFlueGasMaterial(id: number): boolean {
    try {
      return dbInstance.deleteGasFlueGasMaterial(id);
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  selectAtmosphereSpecificHeat(): Array<AtmosphereSpecificHeat> {
    try {
      let atmosphereSpecificHeatMaterials: Array<AtmosphereSpecificHeat> = new Array();
      let items = dbInstance.getAtmosphereSpecificHeat();
      for (let index = 0; index < items.size(); index++) {
        let atmosphereSpecificHeatPointer = items.get(index);
        let atmosphereSpecificHeat: AtmosphereSpecificHeat = this.getAtmosphereSpecificHeatFromWASM(atmosphereSpecificHeatPointer);
        atmosphereSpecificHeatMaterials.push(atmosphereSpecificHeat);
        atmosphereSpecificHeatPointer.delete();
      }
      items.delete();
      return atmosphereSpecificHeatMaterials;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getAtmosphereSpecificHeatFromWASM(atmosphereSpecificHeatPointer): AtmosphereSpecificHeat {
    return {
      id: atmosphereSpecificHeatPointer.getID(),
      selected: false,
      specificHeat: atmosphereSpecificHeatPointer.getSpecificHeat(),
      substance: atmosphereSpecificHeatPointer.getSubstance(),
    };
  }


  selectAtmosphereSpecificHeatById(id: number): AtmosphereSpecificHeat {
    try {
      let atmosphereSpecificHeatPointer = dbInstance.getAtmosphereSpecificHeatById(id);
      let atmosphereSpecificHeat: AtmosphereSpecificHeat = this.getAtmosphereSpecificHeatFromWASM(atmosphereSpecificHeatPointer);
      atmosphereSpecificHeatPointer.delete();
      return atmosphereSpecificHeat;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertAtmosphereSpecificHeat(material: AtmosphereSpecificHeat): boolean {
    try {
      let Atmosphere = this.getAtmosphere(material);
      dbInstance.insertAtmosphereSpecificHeat(Atmosphere);
      Atmosphere.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateAtmosphereSpecificHeat(material: AtmosphereSpecificHeat): boolean {
    try {
      let Atmosphere = this.getAtmosphere(material);
      dbInstance.updateAtmosphereSpecificHeat(Atmosphere);
      Atmosphere.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getAtmosphere(material: AtmosphereSpecificHeat) {
    let Atmosphere = new Module.Atmosphere();
    Atmosphere.setSubstance(material.substance);
    Atmosphere.setSpecificHeat(material.specificHeat);
    if (material.id !== undefined) {
      Atmosphere.setID(material.id);
    }
    return Atmosphere;
  }

  deleteAtmosphereSpecificHeat(id: number): boolean {
    try {
      let success = dbInstance.deleteAtmosphereSpecificHeat(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  selectWallLossesSurface(): Array<WallLossesSurface> {
    try {
      let wallLossesSurfaces: Array<WallLossesSurface> = new Array();
      let items = dbInstance.getWallLossesSurface();
      for (let index = 0; index < items.size(); index++) {
        let wallLossesSurfacePointer = items.get(index);
        let wallLossesSurface: WallLossesSurface = this.getWallLossesSurfaceFromWASM(wallLossesSurfacePointer);
        wallLossesSurfaces.push(wallLossesSurface);
        wallLossesSurfacePointer.delete();
      }
      items.delete();
      return wallLossesSurfaces;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getWallLossesSurfaceFromWASM(wallLossesSurfacePointer): WallLossesSurface {
    return {
      id: wallLossesSurfacePointer.getID(),
      selected: false,
      surface: wallLossesSurfacePointer.getSurface(),
      conditionFactor: wallLossesSurfacePointer.getConditionFactor(),
    };
  }


  selectWallLossesSurfaceById(id: number): WallLossesSurface {
    try {
      let wallLossesSurfacePointer = dbInstance.getWallLossesSurfaceById(id);
      let wallLossesSurface: WallLossesSurface = this.getWallLossesSurfaceFromWASM(wallLossesSurfacePointer);
      wallLossesSurfacePointer.delete();
      return wallLossesSurface;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertWallLossesSurface(surface: WallLossesSurface): boolean {
    try {
      let WallLoss = this.getWallLoss(surface);
      dbInstance.insertWallLossesSurface(WallLoss);
      WallLoss.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateWallLossesSurface(material: WallLossesSurface): boolean {
    try {
      let WallLoss = this.getWallLoss(material);
      dbInstance.updateWallLossesSurface(WallLoss);
      WallLoss.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getWallLoss(wallLossesSurface: WallLossesSurface) {
    let WallLoss = new Module.WallLosses();
    WallLoss.setConditionFactor(wallLossesSurface.conditionFactor);
    WallLoss.setSurface(wallLossesSurface.surface);
    if (wallLossesSurface.id !== undefined) {
      WallLoss.setID(wallLossesSurface.id);
    }
    return WallLoss;
  }

  deleteWallLossesSurface(id: number): boolean {
    try {
      let success = dbInstance.deleteWallLossesSurface(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  selectSolidLiquidFlueGasMaterials(): Array<SolidLiquidFlueGasMaterial> {
    try {
      let solidLiquidFlueGasMaterials: Array<SolidLiquidFlueGasMaterial> = new Array();
      let items = dbInstance.getSolidLiquidFlueGasMaterials();
      for (let index = 0; index < items.size(); index++) {
        let solidLiquidFlueGasMaterialPointer = items.get(index);
        let solidLiquidFlueGasMaterial: SolidLiquidFlueGasMaterial = this.getSolidLiquidFlueGasMaterialFromWASM(solidLiquidFlueGasMaterialPointer);
        solidLiquidFlueGasMaterials.push(solidLiquidFlueGasMaterial);
        solidLiquidFlueGasMaterialPointer.delete();
      }
      items.delete();
      return solidLiquidFlueGasMaterials;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getSolidLiquidFlueGasMaterialFromWASM(solidLiquidFlueGasMaterialPointer): SolidLiquidFlueGasMaterial {
    let solidLiquidFlueGasMaterial: SolidLiquidFlueGasMaterial = {
      id: solidLiquidFlueGasMaterialPointer.getID(),
      selected: false,
      carbon: solidLiquidFlueGasMaterialPointer.getCarbon(),
      hydrogen: solidLiquidFlueGasMaterialPointer.getHydrogen(),
      inertAsh: solidLiquidFlueGasMaterialPointer.getInertAsh(),
      moisture: solidLiquidFlueGasMaterialPointer.getMoisture(),
      nitrogen: solidLiquidFlueGasMaterialPointer.getNitrogen(),
      o2: solidLiquidFlueGasMaterialPointer.getO2(),
      substance: solidLiquidFlueGasMaterialPointer.getSubstance(),
      sulphur: solidLiquidFlueGasMaterialPointer.getSulphur(),
      heatingValue: undefined,
    };
    return solidLiquidFlueGasMaterial;
  }


  selectSolidLiquidFlueGasMaterialById(id: number): SolidLiquidFlueGasMaterial {
    try {
      let solidLiquidFlueGasMaterialPointer = dbInstance.getSolidLiquidFlueGasMaterialById(id);
      let solidLiquidFlueGasMaterial: SolidLiquidFlueGasMaterial = this.getSolidLiquidFlueGasMaterialFromWASM(solidLiquidFlueGasMaterialPointer);
      solidLiquidFlueGasMaterialPointer.delete();
      return solidLiquidFlueGasMaterial;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertSolidLiquidFlueGasMaterial(surface: SolidLiquidFlueGasMaterial): boolean {
    try {
      let SolidLiquidFlueGasMaterial = this.getSolidLiquidFlueGasMaterial(surface);
      dbInstance.insertSolidLiquidFlueGasMaterial(SolidLiquidFlueGasMaterial);
      SolidLiquidFlueGasMaterial.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateSolidLiquidFlueGasMaterial(material: SolidLiquidFlueGasMaterial): boolean {
    try {
      let SolidLiquidFlueGasMaterial = this.getSolidLiquidFlueGasMaterial(material);
      dbInstance.updateSolidLiquidFlueGasMaterial(SolidLiquidFlueGasMaterial);
      SolidLiquidFlueGasMaterial.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getSolidLiquidFlueGasMaterial(solidLiquidFlueGasMaterial: SolidLiquidFlueGasMaterial) {
    let SolidLiquidFlueGasMaterial = new Module.SolidLiquidFlueGasMaterial(
      solidLiquidFlueGasMaterial.substance,
      solidLiquidFlueGasMaterial.carbon,
      solidLiquidFlueGasMaterial.hydrogen,
      solidLiquidFlueGasMaterial.sulphur,
      solidLiquidFlueGasMaterial.inertAsh,
      solidLiquidFlueGasMaterial.o2,
      solidLiquidFlueGasMaterial.moisture,
      solidLiquidFlueGasMaterial.nitrogen,
    );
    return SolidLiquidFlueGasMaterial;
  }

  deleteSolidLiquidFlueGasMaterial(id: number): boolean {
    try {
      let success = dbInstance.deleteSolidLiquidFlueGasMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  selectGasLoadChargeMaterials(): Array<GasLoadChargeMaterial> {
    try {
      let gasLoadChargeMaterials: Array<GasLoadChargeMaterial> = new Array();
      let items = dbInstance.getGasLoadChargeMaterials();
      for (let index = 0; index < items.size(); index++) {
        let gasLoadChargeMaterialPointer = items.get(index);
        let gasLoadChargeMaterial: GasLoadChargeMaterial = this.getGasLoadChargeMaterialFromWASM(gasLoadChargeMaterialPointer);
        gasLoadChargeMaterials.push(gasLoadChargeMaterial);
        gasLoadChargeMaterialPointer.delete();
      }
      items.delete();
      return gasLoadChargeMaterials;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getGasLoadChargeMaterialFromWASM(gasLoadChargeMaterialPointer): GasLoadChargeMaterial {
    return {
      id: gasLoadChargeMaterialPointer.getID(),
      selected: false,
      specificHeatVapor: gasLoadChargeMaterialPointer.getSpecificHeatVapor(),
      substance: gasLoadChargeMaterialPointer.getSubstance()
    };
  }


  selectGasLoadChargeMaterialById(id: number): GasLoadChargeMaterial {
    try {
      let gasLoadChargeMaterialPointer = dbInstance.getGasLoadChargeMaterialById(id);
      let gasLoadChargeMaterial: GasLoadChargeMaterial = this.getGasLoadChargeMaterialFromWASM(gasLoadChargeMaterialPointer);
      gasLoadChargeMaterialPointer.delete();
      return gasLoadChargeMaterial;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertGasLoadChargeMaterial(surface: GasLoadChargeMaterial): boolean {
    try {
      let GasLoadChargeMaterial = this.getGasLoadChargeMaterial(surface);
      dbInstance.insertGasLoadChargeMaterials(GasLoadChargeMaterial);
      GasLoadChargeMaterial.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateGasLoadChargeMaterial(material: GasLoadChargeMaterial): boolean {
    try {
      let GasLoadChargeMaterial = this.getGasLoadChargeMaterial(material);
      dbInstance.updateGasLoadChargeMaterial(GasLoadChargeMaterial);
      GasLoadChargeMaterial.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getGasLoadChargeMaterial(gasLoadChargeMaterial: GasLoadChargeMaterial) {
    let GasLoadChargeMaterial = new Module.GasLoadChargeMaterial();
    GasLoadChargeMaterial.setSubstance(gasLoadChargeMaterial.substance);
    GasLoadChargeMaterial.setSpecificHeatVapor(gasLoadChargeMaterial.specificHeatVapor);
    if (gasLoadChargeMaterial.id !== undefined) {
      GasLoadChargeMaterial.setID(gasLoadChargeMaterial.id);
    }
    return GasLoadChargeMaterial;
  }

  deleteGasLoadChargeMaterial(id: number): boolean {
    try {
      let success = dbInstance.deleteGasLoadChargeMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }



  selectLiquidLoadChargeMaterials(): Array<LiquidLoadChargeMaterial> {
    try {
      let liquidLoadChargeMaterials: Array<LiquidLoadChargeMaterial> = new Array();
      let items = dbInstance.getLiquidLoadChargeMaterials();
      for (let index = 0; index < items.size(); index++) {
        let liquidLoadChargeMaterialPointer = items.get(index);
        let liquidLoadChargeMaterial: LiquidLoadChargeMaterial = this.getLiquidLoadChargeMaterialFromWASM(liquidLoadChargeMaterialPointer);
        liquidLoadChargeMaterials.push(liquidLoadChargeMaterial);
        liquidLoadChargeMaterialPointer.delete();
      }
      items.delete();
      return liquidLoadChargeMaterials;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getLiquidLoadChargeMaterialFromWASM(liquidLoadChargeMaterialPointer): LiquidLoadChargeMaterial {
    return {
      id: liquidLoadChargeMaterialPointer.getID(),
      selected: false,
      latentHeat: liquidLoadChargeMaterialPointer.getLatentHeat(),
      specificHeatLiquid: liquidLoadChargeMaterialPointer.getSpecificHeatLiquid(),
      specificHeatVapor: liquidLoadChargeMaterialPointer.getSpecificHeatVapor(),
      substance: liquidLoadChargeMaterialPointer.getSubstance(),
      vaporizationTemperature: liquidLoadChargeMaterialPointer.getVaporizingTemperature()
    };
  }


  selectLiquidLoadChargeMaterialById(id: number): LiquidLoadChargeMaterial {
    try {
      let liquidLoadChargeMaterialPointer = dbInstance.getLiquidLoadChargeMaterialById(id);
      let liquidLoadChargeMaterial: LiquidLoadChargeMaterial = this.getLiquidLoadChargeMaterialFromWASM(liquidLoadChargeMaterialPointer);
      liquidLoadChargeMaterialPointer.delete();
      return liquidLoadChargeMaterial;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertLiquidLoadChargeMaterial(surface: LiquidLoadChargeMaterial): boolean {
    try {
      let LiquidLoadChargeMaterial = this.getLiquidLoadChargeMaterial(surface);
      dbInstance.insertLiquidLoadChargeMaterials(LiquidLoadChargeMaterial);
      LiquidLoadChargeMaterial.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial): boolean {
    try {
      let LiquidLoadChargeMaterial = this.getLiquidLoadChargeMaterial(material);
      dbInstance.updateLiquidLoadChargeMaterial(LiquidLoadChargeMaterial);
      LiquidLoadChargeMaterial.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getLiquidLoadChargeMaterial(liquidLoadChargeMaterial: LiquidLoadChargeMaterial) {
    let LiquidLoadChargeMaterial = new Module.LiquidLoadChargeMaterial();
    LiquidLoadChargeMaterial.setLatentHeat(liquidLoadChargeMaterial.latentHeat),
      LiquidLoadChargeMaterial.setSpecificHeatLiquid(liquidLoadChargeMaterial.specificHeatLiquid),
      LiquidLoadChargeMaterial.setSpecificHeatVapor(liquidLoadChargeMaterial.specificHeatVapor),
      LiquidLoadChargeMaterial.setSubstance(liquidLoadChargeMaterial.substance),
      LiquidLoadChargeMaterial.setVaporizingTemperature(liquidLoadChargeMaterial.vaporizationTemperature)
    if (liquidLoadChargeMaterial.id !== undefined) {
      LiquidLoadChargeMaterial.setID(liquidLoadChargeMaterial.id);
    }
    return LiquidLoadChargeMaterial;
  }

  deleteLiquidLoadChargeMaterial(id: number): boolean {
    try {
      let success = dbInstance.deleteLiquidLoadChargeMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }



  selectSolidLoadChargeMaterials(): Array<SolidLoadChargeMaterial> {
    try {
      let solidLoadChargeMaterials: Array<SolidLoadChargeMaterial> = new Array();
      let items = dbInstance.getSolidLoadChargeMaterials();
      for (let index = 0; index < items.size(); index++) {
        let solidLoadChargeMaterialPointer = items.get(index);
        let solidLoadChargeMaterial: SolidLoadChargeMaterial = this.getSolidLoadChargeMaterialFromWASM(solidLoadChargeMaterialPointer);
        solidLoadChargeMaterials.push(solidLoadChargeMaterial);
        solidLoadChargeMaterialPointer.delete();
      }
      items.delete();
      return solidLoadChargeMaterials;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getSolidLoadChargeMaterialFromWASM(solidLoadChargeMaterialPointer): SolidLoadChargeMaterial {
    return {
      id: solidLoadChargeMaterialPointer.getID(),
      selected: false,
      latentHeat: solidLoadChargeMaterialPointer.getLatentHeat(),
      meltingPoint: solidLoadChargeMaterialPointer.getMeltingPoint(),
      specificHeatLiquid: solidLoadChargeMaterialPointer.getSpecificHeatLiquid(),
      specificHeatSolid: solidLoadChargeMaterialPointer.getSpecificHeatSolid(),
      substance: solidLoadChargeMaterialPointer.getSubstance(),
    };
  }


  selectSolidLoadChargeMaterialById(id: number): SolidLoadChargeMaterial {
    try {
      let solidLoadChargeMaterialPointer = dbInstance.getSolidLoadChargeMaterialById(id);
      let solidLoadChargeMaterial: SolidLoadChargeMaterial = this.getSolidLoadChargeMaterialFromWASM(solidLoadChargeMaterialPointer);
      solidLoadChargeMaterialPointer.delete();
      return solidLoadChargeMaterial;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertSolidLoadChargeMaterial(surface: SolidLoadChargeMaterial): boolean {
    try {
      let SolidLoadChargeMaterial = this.getSolidLoadChargeMaterial(surface);
      dbInstance.insertSolidLoadChargeMaterials(SolidLoadChargeMaterial);
      SolidLoadChargeMaterial.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateSolidLoadChargeMaterial(material: SolidLoadChargeMaterial): boolean {
    try {
      let SolidLoadChargeMaterial = this.getSolidLoadChargeMaterial(material);
      dbInstance.updateSolidLoadChargeMaterial(SolidLoadChargeMaterial);
      SolidLoadChargeMaterial.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getSolidLoadChargeMaterial(solidLoadChargeMaterial: SolidLoadChargeMaterial) {
    let SolidLoadChargeMaterial = new Module.SolidLoadChargeMaterial();
    SolidLoadChargeMaterial.selected = false;
    SolidLoadChargeMaterial.setLatentHeat(solidLoadChargeMaterial.latentHeat);
    SolidLoadChargeMaterial.setMeltingPoint(solidLoadChargeMaterial.meltingPoint);
    SolidLoadChargeMaterial.setSpecificHeatLiquid(solidLoadChargeMaterial.specificHeatLiquid);
    SolidLoadChargeMaterial.setSpecificHeatSolid(solidLoadChargeMaterial.specificHeatSolid);
    SolidLoadChargeMaterial.setSubstance(solidLoadChargeMaterial.substance);

    if (solidLoadChargeMaterial.id !== undefined) {
      SolidLoadChargeMaterial.setID(solidLoadChargeMaterial.id);
    }
    return SolidLoadChargeMaterial;
  }

  deleteSolidLoadChargeMaterial(id: number): boolean {
    try {
      let success = dbInstance.deleteSolidLoadChargeMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  selectMotors(): Array<SuiteDbMotor> {
    try {
      let suiteDbMotors: Array<SuiteDbMotor> = new Array();
      let items = dbInstance.getMotorData();
      for (let index = 0; index < items.size(); index++) {
        let suiteDbMotorPointer = items.get(index);
        let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(suiteDbMotorPointer);
        suiteDbMotors.push(suiteDbMotor);
        suiteDbMotorPointer.delete();
      }
      items.delete();
      return suiteDbMotors;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getSuiteDbMotorFromWASM(suiteDbMotorPointer): SuiteDbMotor {
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyFromSuiteEnumValue(suiteDbMotorPointer.getLineFrequency().value);
    let efficiencyClass = suiteDbMotorPointer.getEfficiencyClass().value;

    let suiteDbMotor = {
      id: suiteDbMotorPointer.getId(),
      catalog: suiteDbMotorPointer.getCatalog(),
      efficiencyClass: efficiencyClass,
      hp: suiteDbMotorPointer.getHp(),
      lineFrequency: lineFrequency,
      enclosureType: suiteDbMotorPointer.getEnclosureType(),
      nemaTable: suiteDbMotorPointer.getNemaTable(),
      nominalEfficiency: suiteDbMotorPointer.getNominalEfficiency(),
      poles: suiteDbMotorPointer.getPoles(),
      synchronousSpeed: suiteDbMotorPointer.getSynchronousSpeed(),
      voltageLimit: suiteDbMotorPointer.getVoltageLimit()
    };

    return suiteDbMotor;
  }


  selectMotorById(id: number): SuiteDbMotor {
    try {
      let suiteDbMotorPointer = dbInstance.getMotorDataById(id);
      let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(suiteDbMotorPointer);
      suiteDbMotorPointer.delete();
      return suiteDbMotor;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertMotor(motor: SuiteDbMotor): boolean {
    try {
      let MotorData = this.getMotorData(motor);
      dbInstance.insertMotorData(MotorData);
      MotorData.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updateMotor(motor: SuiteDbMotor): boolean {
    try {
      let MotorData = this.getMotorData(motor);
      dbInstance.updateMotorData(MotorData);
      MotorData.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getMotorData(motor: SuiteDbMotor) {
    let efficiencyClass = this.suiteApiHelperService.getMotorEfficiencyEnum(motor.efficiencyClass);
    let lineFrequency = this.suiteApiHelperService.getLineFrequencyEnum(motor.lineFrequency);
    let MotorData = new Module.MotorData(
      motor.hp,
      motor.synchronousSpeed,
      motor.poles,
      motor.nominalEfficiency,
      efficiencyClass,
      motor.nemaTable,
      motor.enclosureType,
      lineFrequency,
      motor.voltageLimit,
      motor.catalog

    );
    if (motor.id !== undefined) {
      MotorData.setId(motor.id);
    }
    return MotorData;
  }

  deleteMotor(id: number): boolean {
    try {
      let success = dbInstance.deleteMotorData(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  // selectPumps(): Array<SuiteDbPump> {
  //   try {
  //     let suiteDbPumps: Array<SuiteDbPump> = new Array();
  //     let items = dbInstance.getPumpData();
  //     for (let index = 0; index < items.size(); index++) {
  //       let suiteDbPumpPointer = items.get(index);
  //       let suiteDbPump: SuiteDbPump = this.getSuiteDbPumpFromWASM(suiteDbPumpPointer);
  //       suiteDbPumps.push(suiteDbPump);
  //       suiteDbPumpPointer.delete();
  //     }
  //     items.delete();
  //     return suiteDbPumps;
  //   }
  //   catch (err) {
  //     console.log(err);
  //     return [];
  //   }
  // }

  // getSuiteDbPumpFromWASM(pumpDataPointer): SuiteDbPump {
  //   return {
  //     id: pumpDataPointer.getId(),
  //     manufacturer: pumpDataPointer.getManufacturer(),
  //     model: pumpDataPointer.getModel(),
  //     type: pumpDataPointer.getType(),
  //     serialNumber: pumpDataPointer.getSerialNumber(),
  //     status: pumpDataPointer.getStatus(),
  //     pumpType: pumpDataPointer.getPumpType(),
  //     radialBearingType: pumpDataPointer.getRadialBearingType(),
  //     thrustBearingType: pumpDataPointer.getThrustBearingType(),
  //     shaftOrientation: pumpDataPointer.getShaftOrientation(),
  //     shaftSealType: pumpDataPointer.getShaftSealType(),
  //     fluidType: pumpDataPointer.getFluidType(),
  //     priority: pumpDataPointer.getPriority(),
  //     driveType: pumpDataPointer.getDriveType(),
  //     flangeConnectionClass: pumpDataPointer.getFlangeConnectionClass(),
  //     flangeConnectionSize: pumpDataPointer.getFlangeConnectionSize(),
  //     numShafts: pumpDataPointer.getNumShafts(),
  //     speed: pumpDataPointer.getSpeed(),
  //     numStages: pumpDataPointer.getNumStages(),
  //     yearlyOperatingHours: pumpDataPointer.getYearlyOperatingHours(),
  //     yearInstalled: pumpDataPointer.getYearInstalled(),
  //     finalMotorRpm: pumpDataPointer.getFinalMotorRpm(),
  //     inletDiameter: pumpDataPointer.getInletDiameter(),
  //     weight: pumpDataPointer.getWeight(),
  //     outletDiameter: pumpDataPointer.getOutletDiameter(),
  //     percentageOfSchedule: pumpDataPointer.getPercentageOfSchedule(),
  //     dailyPumpCapacity: pumpDataPointer.getDailyPumpCapacity(),
  //     measuredPumpCapacity: pumpDataPointer.getMeasuredPumpCapacity(),
  //     pumpPerformance: pumpDataPointer.getPumpPerformance(),
  //     staticSuctionHead: pumpDataPointer.getStaticSuctionHead(),
  //     staticDischargeHead: pumpDataPointer.getStaticDischargeHead(),
  //     fluidDensity: pumpDataPointer.getFluidDensity(),
  //     lengthOfDischargePipe: pumpDataPointer.getLengthOfDischargePipe(),
  //     pipeDesignFrictionLosses: pumpDataPointer.getPipeDesignFrictionLosses(),
  //     maxWorkingPressure: pumpDataPointer.getMaxWorkingPressure(),
  //     maxAmbientTemperature: pumpDataPointer.getMaxAmbientTemperature(),
  //     maxSuctionLift: pumpDataPointer.getMaxSuctionLift(),
  //     displacement: pumpDataPointer.getDisplacement(),
  //     startingTorque: pumpDataPointer.getStartingTorque(),
  //     ratedSpeed: pumpDataPointer.getRatedSpeed(),
  //     shaftDiameter: pumpDataPointer.getShaftDiameter(),
  //     impellerDiameter: pumpDataPointer.getImpellerDiameter(),
  //     efficiency: pumpDataPointer.getEfficiency(),
  //     output60Hz: pumpDataPointer.getOutput60Hz(),
  //     minFlowSize: pumpDataPointer.getMinFlowSize(),
  //     pumpSize: pumpDataPointer.getPumpSize(),
  //     outOfService: pumpDataPointer.getOutOfService(),
  //   };
  // }

  // selectPumpById(id: number): SuiteDbPump {
  //   try {
  //     let suiteDbPumpPointer = dbInstance.getPumpDataById(id);
  //     let suiteDbPump: SuiteDbPump = this.getSuiteDbPumpFromWASM(suiteDbPumpPointer);
  //     suiteDbPumpPointer.delete();
  //     return suiteDbPump;
  //   }
  //   catch (err) {
  //     console.log(err);
  //     return undefined;
  //   }
  // }

  // insertPump(pump: SuiteDbPump): boolean {
  //   try {
  //     let PumpData = this.getPumpData(pump);
  //     dbInstance.insertPumpData(PumpData);
  //     PumpData.delete();
  //     return true;
  //   }
  //   catch (err) {
  //     console.log(err);
  //     return undefined;
  //   }
  // }

  // updatePump(pump: SuiteDbPump): boolean {
  //   try {
  //     let PumpData = this.getPumpData(pump);
  //     dbInstance.updatePumpData(PumpData);
  //     PumpData.delete();
  //     return true;
  //   } catch (err) {
  //     console.log(err);
  //     return false;
  //   }
  // }

  // getPumpData(pump: SuiteDbPump) {
  //   let PumpData = new Module.PumpData(
  //     pump.manufacturer,
  //     pump.model,
  //     pump.type,
  //     pump.serialNumber,
  //     pump.status,
  //     pump.pumpType,
  //     pump.radialBearingType,
  //     pump.thrustBearingType,
  //     pump.shaftOrientation,
  //     pump.shaftSealType,
  //     pump.fluidType,
  //     pump.priority,
  //     pump.driveType,
  //     pump.flangeConnectionClass,
  //     pump.flangeConnectionSize,
  //     pump.numShafts,
  //     pump.speed,
  //     pump.numStages,
  //     pump.yearlyOperatingHours,
  //     pump.yearInstalled,
  //     pump.finalMotorRpm,
  //     pump.inletDiameter,
  //     pump.weight,
  //     pump.outletDiameter,
  //     pump.percentageOfSchedule,
  //     pump.dailyPumpCapacity,
  //     pump.measuredPumpCapacity,
  //     pump.pumpPerformance,
  //     pump.staticSuctionHead,
  //     pump.staticDischargeHead,
  //     pump.fluidDensity,
  //     pump.lengthOfDischargePipe,
  //     pump.pipeDesignFrictionLosses,
  //     pump.maxWorkingPressure,
  //     pump.maxAmbientTemperature,
  //     pump.maxSuctionLift,
  //     pump.displacement,
  //     pump.startingTorque,
  //     pump.ratedSpeed,
  //     pump.shaftDiameter,
  //     pump.impellerDiameter,
  //     pump.efficiency,
  //     pump.output60Hz,
  //     pump.minFlowSize,
  //     pump.pumpSize,
  //     pump.outOfService
  //   );
  //   if (pump.id !== undefined) {
  //     PumpData.setId(pump.id);
  //   }
  //   return PumpData;
  // }

  // deletePump(id: number): boolean {
  //   try {
  //     let success = dbInstance.deletePumpData(id);
  //     return success;
  //   } catch (err) {
  //     console.log(err);
  //     return false;
  //   }
  // }


}
