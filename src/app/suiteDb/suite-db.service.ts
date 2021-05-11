import { Injectable } from '@angular/core';
import { FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, WallLossesSurface, SuiteDbMotor, SuiteDbPump } from '../shared/models/materials';
import { IndexedDbService } from '../indexedDb/indexed-db.service';

// declare var db: any;


declare var Module: any;
@Injectable()
export class SuiteDbService {
  // db: any = db;
  hasStarted: boolean = false;
  dbInstance: any;
  constructor(private indexedDbService: IndexedDbService) { }

  startup() {
    this.hasStarted = true;
    if(Module){
      this.dbInstance = new Module.SQLite(":memory:", true);
    }else {
      console.log("NO MODULE FOUND")
    }
    // return db.startup();
  }
  // preUpdate() {
  //   return db.preUpdate();
  // }

  // postUpdate() {
  //   return db.postUpdate();
  // }

  // test() {
  //   console.log(db);
  // }

  //volume
  selectGasFlueGasMaterials(): Array<FlueGasMaterial> {
    try {
      //TODO: Take C++/wasm object and convert to .js array
      return this.dbInstance.getGasFlueGasMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectGasFlueGasMaterialById(id: number): FlueGasMaterial {
    try {
      //TODO: Take C++/wasm object and convert to .js object
      return this.dbInstance.getGasFlueGasMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }
  //mass
  selectSolidLiquidFlueGasMaterials(): Array<SolidLiquidFlueGasMaterial> {
    try {
      return this.dbInstance.getSolidLiquidFlueGasMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectSolidLiquidFlueGasMaterialById(id: number): SolidLiquidFlueGasMaterial {
    try {
      return this.dbInstance.getSolidLiquidFlueGasMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectGasLoadChargeMaterials(): Array<GasLoadChargeMaterial> {
    try {
      return this.dbInstance.getGasLoadChargeMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectGasLoadChargeMaterialById(id: number): LiquidLoadChargeMaterial {
    try {
      return this.dbInstance.getGasLoadChargeMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectLiquidLoadChargeMaterials(): Array<LiquidLoadChargeMaterial> {
    try {
      return this.dbInstance.getLiquidLoadChargeMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectLiquidLoadChargeMaterialById(id: number): LiquidLoadChargeMaterial {
    try {
      return this.dbInstance.getLiquidLoadChargeMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectSolidLoadChargeMaterials(): Array<SolidLoadChargeMaterial> {
    try {
      return this.dbInstance.getSolidLoadChargeMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectSolidLoadChargeMaterialById(id: number): SolidLoadChargeMaterial {
    try {
      return this.dbInstance.getSolidLoadChargeMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectAtmosphereSpecificHeat(): Array<AtmosphereSpecificHeat> {
    try {
      return this.dbInstance.getAtmosphereSpecificHeat();
    }
    catch (err) {
      return [];
    }
  }

  selectAtmosphereSpecificHeatById(id: number): AtmosphereSpecificHeat {
    try {
      return this.dbInstance.getAtmosphereSpecificHeatById(id);
    }
    catch (err) {
      return undefined;
    }
  }


  selectWallLossesSurface(): Array<WallLossesSurface> {
    try {
      return this.dbInstance.getWallLossesSurface();
    }
    catch (err) {
      return [];
    }
  }

  selectWallLossesSurfaceById(id: number): WallLossesSurface {
    try {
      return this.dbInstance.getWallLossesSurfaceById(id);
    }
    catch (err) {
      return undefined;
    }
  }


  // update() {
  //   return db.update();
  // }


  insertAtmosphereSpecificHeat(material: AtmosphereSpecificHeat) {
    return this.dbInstance.insertAtmosphereSpecificHeat(material);
  }

  insertGasFlueGasMaterial(material: FlueGasMaterial) {
    return this.dbInstance.insertGasFlueGasMaterial(material);
  }

  insertGasLoadChargeMaterial(material: GasLoadChargeMaterial) {
    return this.dbInstance.insertGasLoadChargeMaterial(material);
  }

  insertLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial) {
    return this.dbInstance.insertLiquidLoadChargeMaterial(material);
  }

  insertSolidLiquidFlueGasMaterial(material: SolidLiquidFlueGasMaterial) {
    return this.dbInstance.insertSolidLiquidFlueGasMaterial(material);
  }

  insertSolidLoadChargeMaterial(material: SolidLoadChargeMaterial) {
    return this.dbInstance.insertSolidLoadChargeMaterial(material);
  }

  insertWallLossesSurface(material: WallLossesSurface) {
    return this.dbInstance.insertWallLossesSurface(material);
  }


  //update functions
  updateGasFlueGasMaterial(material: FlueGasMaterial) {
    return this.dbInstance.updateGasFlueGasMaterial(material);
  }

  updateSolidLiquidFlueGasMaterial(material: SolidLiquidFlueGasMaterial) {
    return this.dbInstance.updateSolidLiquidFlueGasMaterial(material);
  }

  updateGasLoadChargeMaterial(material: GasLoadChargeMaterial) {
    return this.dbInstance.updateGasLoadChargeMaterial(material);
  }

  updateLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial) {
    return this.dbInstance.updateLiquidLoadChargeMaterial(material);
  }

  updateSolidLoadChargeMaterial(material: SolidLoadChargeMaterial) {
    return this.dbInstance.updateSolidLoadChargeMaterial(material);
  }

  updateAtmosphereSpecificHeat(material: AtmosphereSpecificHeat) {
    return this.dbInstance.updateAtmosphereSpecificHeat(material);
  }

  updateWallLossesSurface(material: WallLossesSurface) {
    return this.dbInstance.updateWallLossesSurface(material);
  }

  //delete functions
  deleteGasFlueGasMaterial(id: number) {
    return this.dbInstance.deleteGasFlueGasMaterial(id);
  }

  deleteSolidLiquidFlueGasMaterial(id: number) {
    return this.dbInstance.deleteSolidLiquidFlueGasMaterial(id);
  }

  deleteGasLoadChargeMaterial(id: number) {
    return this.dbInstance.deleteGasLoadChargeMaterial(id);
  }

  deleteLiquidLoadChargeMaterial(id: number) {
    return this.dbInstance.deleteLiquidLoadChargeMaterial(id);
  }

  deleteSolidLoadChargeMaterial(id: number) {
    return this.dbInstance.deleteSolidLoadChargeMaterial(id);
  }

  deleteAtmosphereSpecificHeat(id: number) {
    return this.dbInstance.deleteAtmosphereSpecificHeat(id);
  }

  deleteWallLossesSurface(id: number) {
    return this.dbInstance.deleteWallLossesSurface(id);
  }


  //motors
  deleteMotor(id: number) {
    return this.dbInstance.deleteMotorData(id);
  }
  insertMotor(motor: SuiteDbMotor) {
    return this.dbInstance.insertMotorData(motor);
  }
  selectMotors(): Array<SuiteDbMotor> {
    try {
      return this.dbInstance.getMotorData();
    }
    catch (err) {
      return [];
    }
  }
  selectMotorById(id: number): SuiteDbMotor {
    try {
      return this.dbInstance.getMotorDataById(id);
    }
    catch (err) {
      return undefined;
    }
  }
  updateMotor(motor: SuiteDbMotor): SuiteDbMotor {
    return this.dbInstance.updateMotorData(motor);
  }
  //pumps
  deletePump(id: number) {
    return this.dbInstance.deletePumpData(id);
  }
  insertPump(pump: SuiteDbPump) {
    return this.dbInstance.insertPumpData(pump);
  }
  selectPumps(): Array<SuiteDbPump> {
    try {
      return this.dbInstance.getPumpData();
    }
    catch (err) {
      return [];
    }
  }
  selectPumpById(id: number): SuiteDbPump {
    try {
      return this.dbInstance.getPumpDataById(id);
    }
    catch (err) {
      return undefined;
    }
  }
  updatePump(pump: SuiteDbPump): SuiteDbPump {
    return this.dbInstance.updatePumpData(pump);
  }

  //insert custom materials held in indexedDb into suite db
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
}
