import { Injectable } from '@angular/core';
import { FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, WallLossesSurface, SuiteDbMotor, SuiteDbPump } from '../shared/models/materials';
 
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { firstValueFrom } from 'rxjs';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';

declare var db: any;


@Injectable()
export class SuiteDbService {
  db: any = db;
  hasStarted: boolean = false;
  constructor(   
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private atmosphereDbService: AtmosphereDbService,
    ) { }

  startup() {
    this.hasStarted = true;
    return db.startup();
  }
  preUpdate() {
    return db.preUpdate();
  }

  postUpdate() {
    return db.postUpdate();
  }

  //volume
  selectGasFlueGasMaterials(): Array<FlueGasMaterial> {
    try {
      return db.selectGasFlueGasMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectGasFlueGasMaterialById(id: number): FlueGasMaterial {
    try {
      return db.selectGasFlueGasMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }
  //mass
  selectSolidLiquidFlueGasMaterials(): Array<SolidLiquidFlueGasMaterial> {
    try {
      return db.selectSolidLiquidFlueGasMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectSolidLiquidFlueGasMaterialById(id: number): SolidLiquidFlueGasMaterial {
    try {
      return db.selectSolidLiquidFlueGasMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectGasLoadChargeMaterials(): Array<GasLoadChargeMaterial> {
    try {
      return db.selectGasLoadChargeMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectGasLoadChargeMaterialById(id: number): LiquidLoadChargeMaterial {
    try {
      return db.selectGasLoadChargeMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectLiquidLoadChargeMaterials(): Array<LiquidLoadChargeMaterial> {
    try {
      return db.selectLiquidLoadChargeMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectLiquidLoadChargeMaterialById(id: number): LiquidLoadChargeMaterial {
    try {
      return db.selectLiquidLoadChargeMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectSolidLoadChargeMaterials(): Array<SolidLoadChargeMaterial> {
    try {
      return db.selectSolidLoadChargeMaterials();
    }
    catch (err) {
      return [];
    }
  }

  selectSolidLoadChargeMaterialById(id: number): SolidLoadChargeMaterial {
    try {
      return db.selectSolidLoadChargeMaterialById(id);
    }
    catch (err) {
      return undefined;
    }
  }

  selectAtmosphereSpecificHeat(): Array<AtmosphereSpecificHeat> {
    try {
      return db.selectAtmosphereSpecificHeat();
    }
    catch (err) {
      return [];
    }
  }

  selectAtmosphereSpecificHeatById(id: number): AtmosphereSpecificHeat {
    try {
      return db.selectAtmosphereSpecificHeatById(id);
    }
    catch (err) {
      return undefined;
    }
  }


  selectWallLossesSurface(): Array<WallLossesSurface> {
    try {
      return db.selectWallLossesSurface();
    }
    catch (err) {
      return [];
    }
  }

  selectWallLossesSurfaceById(id: number): WallLossesSurface {
    try {
      return db.selectWallLossesSurfaceById(id);
    }
    catch (err) {
      return undefined;
    }
  }


  update() {
    return db.update();
  }


  insertAtmosphereSpecificHeat(material: AtmosphereSpecificHeat) {
    return db.insertAtmosphereSpecificHeat(material);
  }

  insertGasFlueGasMaterial(material: FlueGasMaterial) {
    return db.insertGasFlueGasMaterial(material);
  }

  insertGasLoadChargeMaterial(material: GasLoadChargeMaterial) {
    return db.insertGasLoadChargeMaterial(material);
  }

  insertLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial) {
    return db.insertLiquidLoadChargeMaterial(material);
  }

  insertSolidLiquidFlueGasMaterial(material: SolidLiquidFlueGasMaterial) {
    return db.insertSolidLiquidFlueGasMaterial(material);
  }

  insertSolidLoadChargeMaterial(material: SolidLoadChargeMaterial) {
    return db.insertSolidLoadChargeMaterial(material);
  }

  insertWallLossesSurface(material: WallLossesSurface) {
    return db.insertWallLossesSurface(material);
  }


  //update functions
  updateGasFlueGasMaterial(material: FlueGasMaterial) {
    return db.updateGasFlueGasMaterial(material);
  }

  updateSolidLiquidFlueGasMaterial(material: SolidLiquidFlueGasMaterial) {
    return db.updateSolidLiquidFlueGasMaterial(material);
  }

  updateGasLoadChargeMaterial(material: GasLoadChargeMaterial) {
    return db.updateGasLoadChargeMaterial(material);
  }

  updateLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial) {
    return db.updateLiquidLoadChargeMaterial(material);
  }

  updateSolidLoadChargeMaterial(material: SolidLoadChargeMaterial) {
    return db.updateSolidLoadChargeMaterial(material);
  }

  updateAtmosphereSpecificHeat(material: AtmosphereSpecificHeat) {
    return db.updateAtmosphereSpecificHeat(material);
  }

  updateWallLossesSurface(material: WallLossesSurface) {
    return db.updateWallLossesSurface(material);
  }

  //delete functions
  deleteGasFlueGasMaterial(id: number) {
    return db.deleteGasFlueGasMaterial(id);
  }

  deleteSolidLiquidFlueGasMaterial(id: number) {
    return db.deleteSolidLiquidFlueGasMaterial(id);
  }

  deleteGasLoadChargeMaterial(id: number) {
    return db.deleteGasLoadChargeMaterial(id);
  }

  deleteLiquidLoadChargeMaterial(id: number) {
    return db.deleteLiquidLoadChargeMaterial(id);
  }

  deleteSolidLoadChargeMaterial(id: number) {
    return db.deleteSolidLoadChargeMaterial(id);
  }

  deleteAtmosphereSpecificHeat(id: number) {
    return db.deleteAtmosphereSpecificHeat(id);
  }

  deleteWallLossesSurface(id: number) {
    return db.deleteWallLossesSurface(id);
  }


  //motors
  deleteMotor(id: number) {
    return db.deleteMotor(id);
  }
  insertMotor(motor: SuiteDbMotor) {
    return db.insertMotor(motor);
  }
  selectMotors(): Array<SuiteDbMotor> {
    try {
      return db.selectMotors();
    }
    catch (err) {
      return [];
    }
  }
  selectMotorById(id: number): SuiteDbMotor {
    try {
      return db.selectMotorById(id);
    }
    catch (err) {
      return undefined;
    }
  }
  updateMotor(motor: SuiteDbMotor): SuiteDbMotor {
    return db.updateMotor(motor);
  }
  //pumps
  deletePump(id: number) {
    return db.deletePump(id);
  }
  insertPump(pump: SuiteDbPump) {
    return db.insertPump(pump);
  }
  selectPumps(): Array<SuiteDbPump> {
    try {
      return db.selectPumps();
    }
    catch (err) {
      return [];
    }
  }
  selectPumpById(id: number): SuiteDbPump {
    try {
      return db.selectPumpById(id);
    }
    catch (err) {
      return undefined;
    }
  }
  updatePump(pump: SuiteDbPump): SuiteDbPump {
    return db.updatePump(pump);
  }

  //insert custom materials held in indexedDb into suite db
  async initCustomDbMaterials() {
    // this.test();
    let customGasLoadChargeMaterials: GasLoadChargeMaterial[] = await firstValueFrom(this.gasLoadDbService.getAllWithObservable());
    customGasLoadChargeMaterials.forEach(material => {
      this.insertGasLoadChargeMaterial(material);
    });

    let customLiquidLoadChargeMaterials: LiquidLoadChargeMaterial[] = await firstValueFrom(this.liquidLoadMaterialDbService.getAllWithObservable());
    customLiquidLoadChargeMaterials.forEach(material => {
      this.insertLiquidLoadChargeMaterial(material);
    });

    let customSolidLoadChargeMaterials: SolidLoadChargeMaterial[] = await firstValueFrom(this.solidLoadMaterialDbService.getAllWithObservable());
    customSolidLoadChargeMaterials.forEach(material => {
      this.insertSolidLoadChargeMaterial(material);
    });

    let customAtmosphereSpecificHeatMaterials: AtmosphereSpecificHeat[] = await firstValueFrom(this.atmosphereDbService.getAllWithObservable());
    customAtmosphereSpecificHeatMaterials.forEach(material => {
      this.insertAtmosphereSpecificHeat(material);
    });

    let customWallLossesSurfaces: WallLossesSurface[] = await firstValueFrom(this.wallLossesSurfaceDbService.getAllWithObservable());
    customWallLossesSurfaces.forEach(material => {
      this.insertWallLossesSurface(material);
    });

    let customFluesGasses: FlueGasMaterial[] = await firstValueFrom(this.flueGasMaterialDbService.getAllWithObservable());
    customFluesGasses.forEach(material => {
      this.insertGasFlueGasMaterial(material);
    });
    
    let customSolidLiquidFlueGasses: SolidLiquidFlueGasMaterial[] = await firstValueFrom(this.solidLiquidMaterialDbService.getAllWithObservable());
    customSolidLiquidFlueGasses.forEach(material => {
      this.insertSolidLiquidFlueGasMaterial(material);
    });
  }

}
