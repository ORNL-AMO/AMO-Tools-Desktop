import { Injectable } from '@angular/core';
import { FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial } from '../shared/models/phast/materials';




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

  insertAtmosphereSpecificHeat() { }

  insertGasFlueGasMaterial(material: FlueGasMaterial) { }

  insertGasLoadChargeMaterial(material: GasLoadChargeMaterial) { }

  insertLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial) { }

  insertSolidLiquidFlueGasMaterial(material: SolidLiquidFlueGasMaterial) { }

  insertSolidLoadChargeMaterial(material: SolidLoadChargeMaterial) { }

  insertWallLossesSurface() { }
}
