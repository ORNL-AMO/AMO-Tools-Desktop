import { Injectable } from '@angular/core';

declare var db: any;


@Injectable()
export class SuiteDbService {
  db: any = db;
  hasStarted: boolean = false;
  constructor() { }

  test(){
    var mat1 = {
        substance: 'customMaterial',
        specificHeatSolid: 0.25,
        latentHeat: 150,
        specificHeatLiquid: 0.30,
        meltingPoint: 1200
    };
    var mat2 = {
        substance: 'customMaterial2',
        specificHeatSolid: 0.35,
        latentHeat: 350,
        specificHeatLiquid: 0.39,
        meltingPoint: 2900
    };

    let test = this.insertSolidLoadChargeMaterial(mat1);
    let test2 = this.insertSolidLoadChargeMaterial(mat2);
    this.preUpdate();
    this.postUpdate();
    let materials = this.selectSolidLoadChargeMaterials();
    console.log(materials);
  }

  insertSolidLoadChargeMaterial(material: any){
    return db.insertSolidLoadChargeMaterial(material);
  }

  startup() {
    console.log('started');
    this.hasStarted = true;
    return db.startup();
  }
  preUpdate(){
    return db.preUpdate();
  }

  postUpdate(){
    return db.postUpdate();
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
