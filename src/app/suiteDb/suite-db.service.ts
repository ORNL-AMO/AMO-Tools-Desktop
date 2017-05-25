import { Injectable } from '@angular/core';

declare var db: any;


@Injectable()
export class SuiteDbService {
  db: any = db;
  constructor() { }

  startup() {
    return db.startup();
  }

  selectFlueGasMaterialGas() {
    return db.selectFlueGasMaterialGas()
  }

  selectFlueGasMaterialGasById(id: number) {
    return db.selectFlueGasMaterialGasById(id)
  }

  selectFlueGasMaterialSolidLiquid() {
    return db.selectFlueGasMaterialSolidLiquid()
  }

  selectFlueGasMaterialSolidLiquidById(id: number) {
    return db.selectFlueGasMaterialSolidLiquidById(id)
  }

  selectGasMaterial() {
    return db.selectGasMaterial()
  }

  selectGasMaterialById(id: number) {
    return db.selectGasMaterialById(id)
  }

  selectLiquidMaterial() {
    return db.selectLiquidMaterial()
  }

  selectLiquidMaterialById(id: number) {
    return db.selectLiquidMaterialById(id)
  }

  selectSolidMaterial() {
    return db.selectSolidMaterial()
  }

  selectSolidMaterialById(id: number) {
    return db.selectSolidMaterialById(id)
  }

  update() {
    return db.update()
  }
}
