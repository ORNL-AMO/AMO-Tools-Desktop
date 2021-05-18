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
    if (Module) {
      this.dbInstance = new Module.SQLite(":memory:", true);
    } else {
      console.log("NO MODULE FOUND")
    }
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
}
