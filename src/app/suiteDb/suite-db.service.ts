import { Injectable } from '@angular/core';
import { FlueGasMaterial, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLiquidFlueGasMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, WallLossesSurface } from '../shared/models/materials';
import { IndexedDbService } from '../indexedDb/indexed-db.service';

declare var db: any;


@Injectable()
export class SuiteDbService {
  db: any = db;
  hasStarted: boolean = false;
  constructor(private indexedDbService: IndexedDbService) { }

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


  //testing update function
  updateGasLoadChargeMaterial(material: GasLoadChargeMaterial) {
    console.log('updateGasLoadChargeMaterial()');
    console.log('material.substance = ' + material.substance);
    console.log('material.id = ' + material.id);
    return db.updateGasLoadChargeMaterial(material);
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

  initCustomDbMaterials() {
    //this.test();
    this.indexedDbService.getAllGasLoadChargeMaterial().then(results => {
      let customGasLoadChargeMaterials: GasLoadChargeMaterial[] = results;
      customGasLoadChargeMaterials.forEach(material => {
        let suiteResult = this.insertGasLoadChargeMaterial(material);
      })
    })
    this.indexedDbService.getAllLiquidLoadChargeMaterial().then(results => {
      let customLiquidLoadChargeMaterials: LiquidLoadChargeMaterial[] = results;
      customLiquidLoadChargeMaterials.forEach(material => {
        let suiteResult = this.insertLiquidLoadChargeMaterial(material);
      })
    })
    this.indexedDbService.getAllSolidLoadChargeMaterial().then(results => {
      let customLiquidLoadChargeMaterials: SolidLoadChargeMaterial[] = results;
      customLiquidLoadChargeMaterials.forEach(material => {
        let suiteResult = this.insertSolidLoadChargeMaterial(material);
      })
    })
    this.indexedDbService.getAtmosphereSpecificHeat().then(results => {
      let customAtmosphereSpecificHeatMaterials: AtmosphereSpecificHeat[] = results;
      customAtmosphereSpecificHeatMaterials.forEach(material => {
        let suiteResult = this.insertAtmosphereSpecificHeat(material);
      })
    })
    this.indexedDbService.getWallLossesSurface().then(results => {
      let customWallLossesSurfaces: WallLossesSurface[] = results;
      customWallLossesSurfaces.forEach(material => {
        let suiteResult = this.insertWallLossesSurface(material);
      })
    })
    this.indexedDbService.getFlueGasMaterials().then(results => {
      let customFluesGasses: FlueGasMaterial[] = results;
      customFluesGasses.forEach(material => {
        let suiteResult = this.insertGasFlueGasMaterial(material);
      })
    })
    this.indexedDbService.getSolidLiquidFlueGasMaterials().then(results => {
      let customSolidLiquidFlueGasses: SolidLiquidFlueGasMaterial[] = results;
      customSolidLiquidFlueGasses.forEach(material => {
        let suiteResult = this.insertSolidLiquidFlueGasMaterial(material);
      })
    })
  }
}
