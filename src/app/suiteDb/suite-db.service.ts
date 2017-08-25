import { Injectable } from '@angular/core';
import { FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, WallLossesSurface } from '../shared/models/materials';

declare var db: any;


@Injectable()
export class SuiteDbService {
  db: any = db;
  hasStarted: boolean = false;
  constructor() { }

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

  test() {
    console.log(db);
  }

  //volume
  selectGasFlueGasMaterials() {
    return db.selectGasFlueGasMaterials()
  }

  selectGasFlueGasMaterialById(id: number) {
    return db.selectGasFlueGasMaterialById(id)
  }
  //mass
  selectSolidLiquidFlueGasMaterials() {
    return db.selectSolidLiquidFlueGasMaterials()
  }

  selectSolidLiquidFlueGasMaterialById(id: number) {
    return db.selectSolidLiquidFlueGasMaterialById(id)
  }

  selectGasLoadChargeMaterials() {
    return db.selectGasLoadChargeMaterials()
  }

  selectGasLoadChargeMaterialById(id: number) {
    return db.selectGasLoadChargeMaterialById(id)
  }

  selectLiquidLoadChargeMaterials() {
    return db.selectLiquidLoadChargeMaterials()
  }

  selectLiquidLoadChargeMaterialById(id: number) {
    return db.selectLiquidLoadChargeMaterialById(id)
  }

  selectSolidLoadChargeMaterials() {
    return db.selectSolidLoadChargeMaterials()
  }

  selectSolidLoadChargeMaterialById(id: number) {
    return db.selectSolidLoadChargeMaterialById(id)
  }

  update() {
    return db.update()
  }

  selectAtmosphereSpecificHeat() {
    return db.selectAtmosphereSpecificHeat();
  }
  selectAtmosphereSpecificHeatById(id: number) {
    return db.selectAtmosphereSpecificHeatById(id);
  }

  insertAtmosphereSpecificHeat(material: AtmosphereSpecificHeat) {
    return db.insertAtmosphereSpecificHeat(material)
  }

  insertGasFlueGasMaterial(material: FlueGasMaterial) {
    return db.insertGasFlueGasMaterial(material);
  }

  insertGasLoadChargeMaterial(material: GasLoadChargeMaterial) {
    return db.insertGasLoadChargeMaterial(material);
  }

  insertLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial) {
    return db.insertLiquidLoadChargeMaterial(material)
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

  selectWallLossesSurface() {
    return db.selectWallLossesSurface();
  }
  selectWallLossesSurfaceById(id: number) {
    return db.selectWallLossesSurfaceById(id);
  }
}
