import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { AtmosphereSpecificHeat, FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, SuiteDbMotor, SuiteDbPump, WallLossesSurface } from '../shared/models/materials';
import { SuiteApiHelperService } from './suite-api-helper.service';

declare var Module: any;
@Injectable()
export class SqlDbApiService {

  hasStarted: boolean = false;
  dbInstance: any;
  constructor(private suiteApiHelperService: SuiteApiHelperService, private indexedDbService: IndexedDbService) { }

  startup() {
    this.hasStarted = true;
    if (Module) {
        this.dbInstance = new Module.SQLite(":memory:", true);
    } else {
      console.log("NO MODULE FOUND")
    }
  }

  initCustomDbMaterials() {
    // this.test();
    this.indexedDbService.getAllGasLoadChargeMaterial().then(results => {
      let customGasLoadChargeMaterials: GasLoadChargeMaterial[] = results;
      customGasLoadChargeMaterials.forEach(material => {
        let suiteResult = this.insertGasLoadChargeMaterial(material);
      });
    });
    this.indexedDbService.getAllLiquidLoadChargeMaterial().then(results => {
      let customLiquidLoadChargeMaterials: LiquidLoadChargeMaterial[] = results;
      customLiquidLoadChargeMaterials.forEach(material => {
        let suiteResult = this.insertLiquidLoadChargeMaterial(material);
      });
    });
    this.indexedDbService.getAllSolidLoadChargeMaterial().then(results => {
      let customLiquidLoadChargeMaterials: SolidLoadChargeMaterial[] = results;
      customLiquidLoadChargeMaterials.forEach(material => {
        let suiteResult = this.insertSolidLoadChargeMaterial(material);
      });
    });
    this.indexedDbService.getAtmosphereSpecificHeat().then(results => {
      let customAtmosphereSpecificHeatMaterials: AtmosphereSpecificHeat[] = results;
      customAtmosphereSpecificHeatMaterials.forEach(material => {
        let suiteResult = this.insertAtmosphereSpecificHeat(material);
      });
    });
    this.indexedDbService.getWallLossesSurface().then(results => {
      let customWallLossesSurfaces: WallLossesSurface[] = results;
      customWallLossesSurfaces.forEach(material => {
        let suiteResult = this.insertWallLossesSurface(material);
      });
    });
    this.indexedDbService.getFlueGasMaterials().then(results => {
      let customFluesGasses: FlueGasMaterial[] = results;
      customFluesGasses.forEach(material => {
        let suiteResult = this.insertGasFlueGasMaterial(material);
      });
    });
    this.indexedDbService.getSolidLiquidFlueGasMaterials().then(results => {
      let customSolidLiquidFlueGasses: SolidLiquidFlueGasMaterial[] = results;
      customSolidLiquidFlueGasses.forEach(material => {
        let suiteResult = this.insertSolidLiquidFlueGasMaterial(material);
      });
    });
  }

  //GAS FLUE GAS MATERIALS
  selectGasFlueGasMaterials(): Array<FlueGasMaterial> {
    try {
      let flueGasMaterials: Array<FlueGasMaterial> = new Array();
      let items = this.dbInstance.getGasFlueGasMaterials();
      for (let index = 0; index < items.size(); index++) {
        let flueGasComposition = items.get(index);
        let flueGasItem: FlueGasMaterial = this.getFlueGasItemFromGasComposition(flueGasComposition)
        flueGasMaterials.push(flueGasItem);
      }
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
      let flueGasComposition = this.dbInstance.getGasFlueGasMaterialById(id);
      let flueGasItem: FlueGasMaterial = this.getFlueGasItemFromGasComposition(flueGasComposition);
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
      this.dbInstance.insertGasFlueGasMaterial(gasComposition);
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
      this.dbInstance.updateGasFlueGasMaterial(gasComposition);
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
      return this.dbInstance.deleteGasFlueGasMaterial(id);
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  selectAtmosphereSpecificHeat(): Array<AtmosphereSpecificHeat> {
    try {
      let atmosphereSpecificHeatMaterials: Array<AtmosphereSpecificHeat> = new Array();
      let items = this.dbInstance.getAtmosphereSpecificHeat();
      for (let index = 0; index < items.size(); index++) {
        let atmosphereSpecificHeatPointer = items.get(index);
        let atmosphereSpecificHeat: AtmosphereSpecificHeat = this.getAtmosphereSpecificHeatFromWASM(atmosphereSpecificHeatPointer);
        atmosphereSpecificHeatMaterials.push(atmosphereSpecificHeat);
      }
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
      let atmosphereSpecificHeatPointer = this.dbInstance.getAtmosphereSpecificHeatById(id);
      let atmosphereSpecificHeat: AtmosphereSpecificHeat = this.getAtmosphereSpecificHeatFromWASM(atmosphereSpecificHeatPointer);
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
      this.dbInstance.insertAtmosphereSpecificHeat(Atmosphere);
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
      this.dbInstance.updateAtmosphereSpecificHeat(Atmosphere);
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
      let success = this.dbInstance.deleteAtmosphereSpecificHeat(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  selectWallLossesSurface(): Array<WallLossesSurface> {
    try {
      let wallLossesSurfaces: Array<WallLossesSurface> = new Array();
      let items = this.dbInstance.getWallLossesSurface();
      for (let index = 0; index < items.size(); index++) {
        let wallLossesSurfacePointer = items.get(index);
        let wallLossesSurface: WallLossesSurface = this.getWallLossesSurfaceFromWASM(wallLossesSurfacePointer);
        wallLossesSurfaces.push(wallLossesSurface);
      }
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
      let wallLossesSurfacePointer = this.dbInstance.getWallLossesSurfaceById(id);
      let wallLossesSurface: WallLossesSurface = this.getWallLossesSurfaceFromWASM(wallLossesSurfacePointer);
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
      this.dbInstance.insertWallLossesSurface(WallLoss);
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
      this.dbInstance.updateWallLossesSurface(WallLoss);
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
      let success = this.dbInstance.deleteWallLossesSurface(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  selectSolidLiquidFlueGasMaterials(): Array<SolidLiquidFlueGasMaterial> {
    try {
      let solidLiquidFlueGasMaterials: Array<SolidLiquidFlueGasMaterial> = new Array();
      let items = this.dbInstance.getSolidLiquidFlueGasMaterials();
      for (let index = 0; index < items.size(); index++) {
        let solidLiquidFlueGasMaterialPointer = items.get(index);
        let solidLiquidFlueGasMaterial: SolidLiquidFlueGasMaterial = this.getSolidLiquidFlueGasMaterialFromWASM(solidLiquidFlueGasMaterialPointer);
        solidLiquidFlueGasMaterials.push(solidLiquidFlueGasMaterial);
      }
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
      let solidLiquidFlueGasMaterialPointer = this.dbInstance.getSolidLiquidFlueGasMaterialById(id);
      let solidLiquidFlueGasMaterial: SolidLiquidFlueGasMaterial = this.getSolidLiquidFlueGasMaterialFromWASM(solidLiquidFlueGasMaterialPointer);
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
      this.dbInstance.insertSolidLiquidFlueGasMaterial(SolidLiquidFlueGasMaterial);
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
      this.dbInstance.updateSolidLiquidFlueGasMaterial(SolidLiquidFlueGasMaterial);
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
      let success = this.dbInstance.deleteSolidLiquidFlueGasMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  selectGasLoadChargeMaterials(): Array<GasLoadChargeMaterial> {
    try {
      let gasLoadChargeMaterials: Array<GasLoadChargeMaterial> = new Array();
      let items = this.dbInstance.getGasLoadChargeMaterials();
      for (let index = 0; index < items.size(); index++) {
        let gasLoadChargeMaterialPointer = items.get(index);
        let gasLoadChargeMaterial: GasLoadChargeMaterial = this.getGasLoadChargeMaterialFromWASM(gasLoadChargeMaterialPointer);
        gasLoadChargeMaterials.push(gasLoadChargeMaterial);
      }
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
      let gasLoadChargeMaterialPointer = this.dbInstance.getGasLoadChargeMaterialById(id);
      let gasLoadChargeMaterial: GasLoadChargeMaterial = this.getGasLoadChargeMaterialFromWASM(gasLoadChargeMaterialPointer);
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
      this.dbInstance.insertGasLoadChargeMaterials(GasLoadChargeMaterial);
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
      this.dbInstance.updateGasLoadChargeMaterial(GasLoadChargeMaterial);
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
      let success = this.dbInstance.deleteGasLoadChargeMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  
  selectLiquidLoadChargeMaterials(): Array<LiquidLoadChargeMaterial> {
    try {
      let liquidLoadChargeMaterials: Array<LiquidLoadChargeMaterial> = new Array();
      let items = this.dbInstance.getLiquidLoadChargeMaterials();
      for (let index = 0; index < items.size(); index++) {
        let liquidLoadChargeMaterialPointer = items.get(index);
        let liquidLoadChargeMaterial: LiquidLoadChargeMaterial = this.getLiquidLoadChargeMaterialFromWASM(liquidLoadChargeMaterialPointer);
        liquidLoadChargeMaterials.push(liquidLoadChargeMaterial);
      }
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
      let liquidLoadChargeMaterialPointer = this.dbInstance.getLiquidLoadChargeMaterialById(id);
      let liquidLoadChargeMaterial: LiquidLoadChargeMaterial = this.getLiquidLoadChargeMaterialFromWASM(liquidLoadChargeMaterialPointer);
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
      this.dbInstance.insertLiquidLoadChargeMaterials(LiquidLoadChargeMaterial);
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
      this.dbInstance.updateLiquidLoadChargeMaterial(LiquidLoadChargeMaterial);
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
      let success = this.dbInstance.deleteLiquidLoadChargeMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


    
  selectSolidLoadChargeMaterials(): Array<SolidLoadChargeMaterial> {
    try {
      let solidLoadChargeMaterials: Array<SolidLoadChargeMaterial> = new Array();
      let items = this.dbInstance.getSolidLoadChargeMaterials();
      for (let index = 0; index < items.size(); index++) {
        let solidLoadChargeMaterialPointer = items.get(index);
        let solidLoadChargeMaterial: SolidLoadChargeMaterial = this.getSolidLoadChargeMaterialFromWASM(solidLoadChargeMaterialPointer);
        solidLoadChargeMaterials.push(solidLoadChargeMaterial);
      }
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
      let solidLoadChargeMaterialPointer = this.dbInstance.getSolidLoadChargeMaterialById(id);
      let solidLoadChargeMaterial: SolidLoadChargeMaterial = this.getSolidLoadChargeMaterialFromWASM(solidLoadChargeMaterialPointer);
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
      this.dbInstance.insertSolidLoadChargeMaterials(SolidLoadChargeMaterial);
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
      this.dbInstance.updateSolidLoadChargeMaterial(SolidLoadChargeMaterial);
      SolidLoadChargeMaterial.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getSolidLoadChargeMaterial(solidLoadChargeMaterial: SolidLoadChargeMaterial) {
    let SolidLoadChargeMaterial = new Module.SolidLoadChargeMaterial();
    SolidLoadChargeMaterial.selected = false,
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
      let success = this.dbInstance.deleteSolidLoadChargeMaterial(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  selectMotors(): Array<SuiteDbMotor> {
    try {
      let suiteDbMotors: Array<SuiteDbMotor> = new Array();
      let items = this.dbInstance.getMotorData();
      for (let index = 0; index < items.size(); index++) {
        let suiteDbMotorPointer = items.get(index);
        let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(suiteDbMotorPointer);
        suiteDbMotors.push(suiteDbMotor);
      }
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
    
    let suiteDbMotor =  {
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
      let suiteDbMotorPointer = this.dbInstance.getMotorDataById(id);
      let suiteDbMotor: SuiteDbMotor = this.getSuiteDbMotorFromWASM(suiteDbMotorPointer);
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
      this.dbInstance.insertMotorData(MotorData);
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
      this.dbInstance.updateMotorData(MotorData);
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
      let success = this.dbInstance.deleteMotorData(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


  selectPumps(): Array<SuiteDbPump> {
    try {
      let suiteDbPumps: Array<SuiteDbPump> = new Array();
      let items = this.dbInstance.getPumpData();
      for (let index = 0; index < items.size(); index++) {
        let suiteDbPumpPointer = items.get(index);
        let suiteDbPump: SuiteDbPump = this.getSuiteDbPumpFromWASM(suiteDbPumpPointer);
        suiteDbPumps.push(suiteDbPump);
      }
      return suiteDbPumps;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }

  getSuiteDbPumpFromWASM(pumpDataPointer): SuiteDbPump {
    return {
      id: pumpDataPointer.getId(),
      manufacturer: pumpDataPointer.getManufacturer(), 
      model: pumpDataPointer.getModel(), 
      type: pumpDataPointer.getType(), 
      serialNumber: pumpDataPointer.getSerialNumber(),
      status: pumpDataPointer.getStatus(), 
      pumpType: pumpDataPointer.getPumpType(), 
      radialBearingType: pumpDataPointer.getRadialBearingType(),
      thrustBearingType: pumpDataPointer.getThrustBearingType(),
      shaftOrientation: pumpDataPointer.getShaftOrientation(),
      shaftSealType: pumpDataPointer.getShaftSealType(),
      fluidType: pumpDataPointer.getFluidType(),
      priority: pumpDataPointer.getPriority(),
      driveType: pumpDataPointer.getDriveType(),
      flangeConnectionClass: pumpDataPointer.getFlangeConnectionClass(),
      flangeConnectionSize: pumpDataPointer.getFlangeConnectionSize(),
      numShafts: pumpDataPointer.getNumShafts(),
      speed: pumpDataPointer.getSpeed(),
      numStages: pumpDataPointer.getNumStages(),
      yearlyOperatingHours: pumpDataPointer.getYearlyOperatingHours(),
      yearInstalled: pumpDataPointer.getYearInstalled(),
      finalMotorRpm: pumpDataPointer.getFinalMotorRpm(),
      inletDiameter: pumpDataPointer.getInletDiameter(),
      weight: pumpDataPointer.getWeight(),
      outletDiameter: pumpDataPointer.getOutletDiameter(),
      percentageOfSchedule: pumpDataPointer.getPercentageOfSchedule(),
      dailyPumpCapacity: pumpDataPointer.getDailyPumpCapacity(),
      measuredPumpCapacity: pumpDataPointer.getMeasuredPumpCapacity(),
      pumpPerformance: pumpDataPointer.getPumpPerformance(),
      staticSuctionHead: pumpDataPointer.getStaticSuctionHead(),
      staticDischargeHead: pumpDataPointer.getStaticDischargeHead(),
      fluidDensity: pumpDataPointer.getFluidDensity(),
      lengthOfDischargePipe: pumpDataPointer.getLengthOfDischargePipe(),
      pipeDesignFrictionLosses: pumpDataPointer.getPipeDesignFrictionLosses(),
      maxWorkingPressure: pumpDataPointer.getMaxWorkingPressure(),
      maxAmbientTemperature: pumpDataPointer.getMaxAmbientTemperature(),
      maxSuctionLift: pumpDataPointer.getMaxSuctionLift(),
      displacement: pumpDataPointer.getDisplacement(),
      startingTorque: pumpDataPointer.getStartingTorque(),
      ratedSpeed: pumpDataPointer.getRatedSpeed(),
      shaftDiameter: pumpDataPointer.getShaftDiameter(),
      impellerDiameter: pumpDataPointer.getImpellerDiameter(),
      efficiency: pumpDataPointer.getEfficiency(),
      output60Hz: pumpDataPointer.getOutput60Hz(),
      minFlowSize: pumpDataPointer.getMinFlowSize(),
      pumpSize: pumpDataPointer.getPumpSize(),
      outOfService: pumpDataPointer.getOutOfService(),
    };
  }

  selectPumpById(id: number): SuiteDbPump {
    try {
      let suiteDbPumpPointer = this.dbInstance.getPumpDataById(id);
      let suiteDbPump: SuiteDbPump = this.getSuiteDbPumpFromWASM(suiteDbPumpPointer);
      return suiteDbPump;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  insertPump(pump: SuiteDbPump): boolean {
    try {
      let PumpData = this.getPumpData(pump);
      this.dbInstance.insertPumpData(PumpData);
      PumpData.delete();
      return true;
    }
    catch (err) {
      console.log(err);
      return undefined;
    }
  }

  updatePump(pump: SuiteDbPump): boolean {
    try {
      let PumpData = this.getPumpData(pump);
      this.dbInstance.updatePumpData(PumpData);
      PumpData.delete();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  getPumpData(pump: SuiteDbPump) {
    let PumpData = new Module.PumpData(
      pump.manufacturer, 
      pump.model, 
      pump.type, 
      pump.serialNumber,
      pump.status, 
      pump.pumpType, 
      pump.radialBearingType,  
      pump.thrustBearingType,
      pump.shaftOrientation, 
      pump.shaftSealType, 
      pump.fluidType, 
      pump.priority,
      pump.driveType, 
      pump.flangeConnectionClass, 
      pump.flangeConnectionSize,
      pump.numShafts, 
      pump.speed, 
      pump.numStages,  
      pump.yearlyOperatingHours, 
      pump.yearInstalled, 
      pump.finalMotorRpm,
      pump.inletDiameter, 
      pump.weight, 
      pump.outletDiameter, 
      pump.percentageOfSchedule,
      pump.dailyPumpCapacity, 
      pump.measuredPumpCapacity, 
      pump.pumpPerformance, 
      pump.staticSuctionHead,
      pump.staticDischargeHead, 
      pump.fluidDensity, 
      pump.lengthOfDischargePipe,
      pump.pipeDesignFrictionLosses,  
      pump.maxWorkingPressure, 
      pump.maxAmbientTemperature,
      pump.maxSuctionLift,  
      pump.displacement, 
      pump.startingTorque, 
      pump.ratedSpeed,
      pump.shaftDiameter, 
      pump.impellerDiameter, 
      pump.efficiency, 
      pump.output60Hz, 
      pump.minFlowSize,
      pump.pumpSize,  
      pump.outOfService
    );
    if (pump.id !== undefined) {
      PumpData.setId(pump.id);
    }
    return PumpData;
  }

  deletePump(id: number): boolean {
    try {
      let success = this.dbInstance.deletePumpData(id);
      return success;
    } catch (err) {
      console.log(err);
      return false;
    }
  }


}
