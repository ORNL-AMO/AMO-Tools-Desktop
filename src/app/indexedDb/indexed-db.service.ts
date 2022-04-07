import { Injectable } from '@angular/core';
import { GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../shared/models/materials';


var myDb: any = {
  name: 'CrudDB',
  version: 6,
  instance: {},
  storeNames: {
    assessments: 'assessments',
    directories: 'directories',
    settings: 'settings',
    gasLoadChargeMaterial: 'gasLoadChargeMaterial',
    solidLoadChargeMaterial: 'solidLoadChargeMaterial',
    liquidLoadChargeMaterial: 'liquidLoadChargeMaterial',
    atmosphereSpecificHeat: 'atmosphereSpecificHeat',
    wallLossesSurface: 'wallLossesSurface',
    flueGasMaterial: 'flueGasMaterial',
    solidLiquidFlueGasMaterial: 'solidLiquidFlueGasMaterial',
    calculator: 'calculator',
    logTool: 'logTool',
    inventoryItems: 'inventoryItems'
  },
  defaultErrorHandler: function (e) {
    //todo: implement error handling
    console.log(e);
  },
  setDefaultErrorHandler: function (request, db) {
    if ('onerror' in request) {
      request.onerror = db.defaultErrorHandler;
    }
    if ('onblocked' in request) {
      request.onblocked = db.defaultErrorHandler;
    }
  }
};



@Injectable()
export class IndexedDbService {

  constructor() {}

  //gasLoadChargeMaterial
  addGasLoadChargeMaterial(_material: GasLoadChargeMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      addRequest.onerror = (e) => {
        reject(e.target.result);
      };
    });
  }

  putGasLoadChargeMaterial(material: GasLoadChargeMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let getRequest = store.get(material.id);
      getRequest.onsuccess = (event) => {
        let tmpMaterial: GasLoadChargeMaterial = event.target.result;
        tmpMaterial = material;
        let updateRequest = store.put(material);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        };
        updateRequest.onerror = (event) => {
          reject(event);
        };
      };
      getRequest.onerror = (event) => {
        reject(event);
      };
    });
  }

  deleteGasLoadChargeMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
  }


  getGasLoadChargeMaterial(id: number): Promise<GasLoadChargeMaterial> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  getAllGasLoadChargeMaterial(): Promise<Array<GasLoadChargeMaterial>> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  clearGasLoadChargeMaterial(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let clearRequest = store.clear();
      myDb.setDefaultErrorHandler(clearRequest, myDb);
      clearRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      clearRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  //liquidLoadChargeMaterial
  addLiquidLoadChargeMaterial(_material: LiquidLoadChargeMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      addRequest.onerror = (e) => {
        reject(e.target.result);
      };
    });
  }

  putLiquidLoadChargeMaterial(material: LiquidLoadChargeMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let getRequest = store.get(material.id);
      getRequest.onsuccess = (event) => {
        let tmpMaterial: LiquidLoadChargeMaterial = event.target.result;
        tmpMaterial = material;
        let updateRequest = store.put(material);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        };
        updateRequest.onerror = (event) => {
          reject(event);
        };
      };
      getRequest.onerror = (event) => {
        reject(event);
      };
    });
  }

  deleteLiquidLoadChargeMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
  }

  getLiquidLoadChargeMaterial(id: number): Promise<LiquidLoadChargeMaterial> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  getAllLiquidLoadChargeMaterial(): Promise<Array<LiquidLoadChargeMaterial>> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  clearLiquidLoadChargeMaterial(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let clearRequest = store.clear();
      myDb.setDefaultErrorHandler(clearRequest, myDb);
      clearRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      clearRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  //solidLoadChargeMaterial
  addSolidLoadChargeMaterial(_material: SolidLoadChargeMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      addRequest.onerror = (e) => {
        reject(e.target.result);
      };
    });
  }


  deleteSolidLoadChargeMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
  }

  putSolidLoadChargeMaterial(material: SolidLoadChargeMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let getRequest = store.get(material.id);
      getRequest.onsuccess = (event) => {
        let tmpMaterial: SolidLoadChargeMaterial = event.target.result;
        tmpMaterial = material;
        let updateRequest = store.put(material);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        };
        updateRequest.onerror = (event) => {
          reject(event);
        };
      };
      getRequest.onerror = (event) => {
        reject(event);
      };
    });
  }

  getSolidLoadChargeMaterial(id: number): Promise<SolidLoadChargeMaterial> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  getAllSolidLoadChargeMaterial(): Promise<Array<SolidLoadChargeMaterial>> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  clearSolidLoadChargeMaterial(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let clearRequest = store.clear();
      myDb.setDefaultErrorHandler(clearRequest, myDb);
      clearRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      clearRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  //atmosphereSpecificHeat
  addAtmosphereSpecificHeat(_material: AtmosphereSpecificHeat): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      addRequest.onerror = (e) => {
        reject(e.target.result);
      };
    });
  }

  deleteAtmosphereSpecificHeat(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
  }

  putAtmosphereSpecificHeat(material: AtmosphereSpecificHeat): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let getRequest = store.get(material.id);
      getRequest.onsuccess = (event) => {
        let tmpMaterial: AtmosphereSpecificHeat = event.target.result;
        tmpMaterial = material;
        let updateRequest = store.put(material);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        };
        updateRequest.onerror = (event) => {
          reject(event);
        };
      };
      getRequest.onerror = (event) => {
        reject(event);
      };
    });
  }

  getAtmosphereSpecificHeatById(id: number): Promise<AtmosphereSpecificHeat> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  getAtmosphereSpecificHeat(): Promise<Array<AtmosphereSpecificHeat>> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  clearAtmosphereSpecificHeat(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let clearRequest = store.clear();
      myDb.setDefaultErrorHandler(clearRequest, myDb);
      clearRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      clearRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  //flueGasMaterial
  addFlueGasMaterial(_material: FlueGasMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      addRequest.onerror = (e) => {
        reject(e.target.result);
      };
    });
  }

  putFlueGasMaterial(material: FlueGasMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let getRequest = store.get(material.id);
      getRequest.onsuccess = (event) => {
        let tmpMaterial: FlueGasMaterial = event.target.result;
        tmpMaterial = material;
        let updateRequest = store.put(material);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        };
        updateRequest.onerror = (event) => {
          reject(event);
        };
      };
      getRequest.onerror = (event) => {
        reject(event);
      };
    });
  }

  deleteFlueGasMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
  }

  getFlueGasMaterialById(id: number): Promise<FlueGasMaterial> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  getFlueGasMaterials(): Promise<Array<FlueGasMaterial>> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }
  clearFlueGasMaterials(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let clearRequest = store.clear();
      myDb.setDefaultErrorHandler(clearRequest, myDb);
      clearRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      clearRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  //solidLiquidFlueGasMaterial
  addSolidLiquidFlueGasMaterial(_material: SolidLiquidFlueGasMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLiquidFlueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLiquidFlueGasMaterial);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      addRequest.onerror = (e) => {
        reject(e.target.result);
      };
    });
  }

  deleteSolidLiquidFlueGasMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLiquidFlueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLiquidFlueGasMaterial);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
  }

  putSolidLiquidFlueGasMaterial(material: SolidLiquidFlueGasMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLiquidFlueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLiquidFlueGasMaterial);
      let getRequest = store.get(material.id);
      getRequest.onsuccess = (event) => {
        let tmpMaterial: SolidLiquidFlueGasMaterial = event.target.result;
        tmpMaterial = material;
        let updateRequest = store.put(material);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        };
        updateRequest.onerror = (event) => {
          reject(event);
        };
      };
      getRequest.onerror = (event) => {
        reject(event);
      };
    });
  }

  getSolidLiquidFlueGasMaterialById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLiquidFlueGasMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.solidLiquidFlueGasMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  getSolidLiquidFlueGasMaterials(): Promise<Array<SolidLiquidFlueGasMaterial>> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLiquidFlueGasMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.solidLiquidFlueGasMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      getRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

  clearSolidLiquidFlueGasMaterials(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLiquidFlueGasMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.solidLiquidFlueGasMaterial);
      let clearRequest = store.clear();
      myDb.setDefaultErrorHandler(clearRequest, myDb);
      clearRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      clearRequest.onerror = (error) => {
        reject(error.target.result);
      };
    });
  }

}
