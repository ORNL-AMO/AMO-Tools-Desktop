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
    debugger
    return db.selectFlueGasMaterialGas()
  }

  selectGasFlueGasMaterialById(id: number) {debugger
    return db.selectFlueGasMaterialGasById(id)
  }
  //mass
  selectSolidLiquidFlueGasMaterials() {debugger
    return db.selectSolidLiquidFlueGasMaterials()
  }

  selectSolidLiquidFlueGasMaterialById(id: number) {debugger
    return db.selectSolidLiquidFlueGasMaterialById(id)
  }

  selectGasLoadChargeMaterials() {debugger
    return db.selectGasLoadChargeMaterials()
  }

  selectGasLoadChargeMaterialById(id: number) {debugger
    return db.selectGasLoadChargeMaterialById(id)
  }

  selectLiquidLoadChargeMaterials() {debugger
    return db.selectLiquidLoadChargeMaterials()
  }

  selectLiquidLoadChargeMaterialById(id: number) {debugger
    return db.selectLiquidLoadChargeMaterialById(id)
  }

  selectSolidLoadChargeMaterials() {debugger
    return db.selectSolidLoadChargeMaterials()
  }

  selectSolidLoadChargeMaterialById(id: number) {debugger
    return db.selectSolidLoadChargeMaterialById(id)
  }

  update() {
    return db.update()
  }
}
