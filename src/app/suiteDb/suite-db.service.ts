import { Injectable } from '@angular/core';

declare var db: any;


@Injectable()
export class SuiteDbService {
  db: any = db;
  constructor() { }

  startup() {
    return db.startup();
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
}
