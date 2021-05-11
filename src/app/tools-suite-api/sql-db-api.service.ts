import { Injectable } from '@angular/core';
import { FlueGasMaterial } from '../shared/models/materials';

declare var Module: any;
@Injectable()
export class SqlDbApiService {

  hasStarted: boolean = false;
  dbInstance: any;
  constructor() { }

  startup() {
    this.hasStarted = true;
    if(Module){
      this.dbInstance = new Module.SQLite(":memory:", true);
    }else {
      console.log("NO MODULE FOUND")
    }
    // return db.startup();
  }

   //GAS FLUE GAS MATERIALS
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

  insertGasFlueGasMaterial(material: FlueGasMaterial) {
    //TODO: CREATE OBJECT
    return this.dbInstance.insertGasFlueGasMaterial(material);
  }

  updateGasFlueGasMaterial(material: FlueGasMaterial) {
    //TODO: SELECT OBJECT AND THEN UPDATE
    let currentMaterial = this.dbInstance.getGasFlueGasMaterialById(id);
    currentMaterial.
    return this.dbInstance.updateGasFlueGasMaterial(material);
  }

  deleteGasFlueGasMaterial(id: number) {
    return this.dbInstance.deleteGasFlueGasMaterial(id);
  }
}
