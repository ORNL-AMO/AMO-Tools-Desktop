import { Injectable } from '@angular/core';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { MockDirectory } from '../shared/mocks/mock-directory';
import { DirectoryDbRef } from '../shared/models/directory';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { WallLossesSurface, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../shared/models/materials'
import { SuiteDbService } from '../suiteDb/suite-db.service';


var myDb: any = {
  name: 'CrudDB',
  version: 3,
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
    solidLiquidFlueGasMaterial: 'solidLiquidFlueGasMaterial'
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

  db: any;
  request: any;
  private _window: Window;

  initCustomObjects: boolean = true;

  constructor(private windowRef: WindowRefService, private suiteDbService: SuiteDbService) {
    this._window = windowRef.nativeWindow;
  }

  initDb(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.request = this._window.indexedDB.open(myDb.name, myDb.version);
      this.request.onupgradeneeded = function (e) {
        var newVersion = e.target.result;
        //assessments
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.assessments)) {
          console.log('creating assessments store...');
          let assessmentObjStore = newVersion.createObjectStore(myDb.storeNames.assessments, {
            autoIncrement: true,
            keyPath: 'id'
          })
          assessmentObjStore.createIndex('directoryId', 'directoryId', { unique: false });
        }
        //directories
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.directories)) {
          console.log('creating directories store...');
          let directoryObjectStore = newVersion.createObjectStore(myDb.storeNames.directories, {
            autoIncrement: true,
            keyPath: 'id'
          })
          directoryObjectStore.createIndex('parentDirectoryId', 'parentDirectoryId', { unique: false });
        }
        //settings
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.settings)) {
          console.log('creating settings store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.settings, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('directoryId', 'directoryId', { unique: false });
          settingsObjStore.createIndex('assessmentId', 'assessmentId', { unique: false });
        }
        //gasLoadChargeMaterial
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.gasLoadChargeMaterial)) {
          console.log('creating gasLoadChargeMaterial store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.gasLoadChargeMaterial, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('id', 'id', { unique: false });
        }

        //liquidLoadChargeMaterial
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.liquidLoadChargeMaterial)) {
          console.log('creating liquidLoadChargeMaterial store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.liquidLoadChargeMaterial, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('id', 'id', { unique: false });
        }

        //solidLoadChargeMaterial
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.solidLoadChargeMaterial)) {
          console.log('creating solidLoadChargeMaterial store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.solidLoadChargeMaterial, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('id', 'id', { unique: false });
        }
        //atmosphereSpecificHeat
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.atmosphereSpecificHeat)) {
          console.log('creating atmosphereSpecificHeat store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.atmosphereSpecificHeat, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('id', 'id', { unique: false });
        }
        //wallLossesSurface
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.wallLossesSurface)) {
          console.log('creating wallLossesSurface store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.wallLossesSurface, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('id', 'id', { unique: false });
        }
        //flueGasMaterial
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.flueGasMaterial)) {
          console.log('creating flueGasMaterial store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.flueGasMaterial, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('id', 'id', { unique: false });
        }
        //solidLiquidFlueGasMaterial
        if (!newVersion.objectStoreNames.contains(myDb.storeNames.solidLiquidFlueGasMaterial)) {
          console.log('creating solidLiquidFlueGasMaterial store...');
          let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.solidLiquidFlueGasMaterial, {
            autoIncrement: true,
            keyPath: 'id'
          })
          settingsObjStore.createIndex('id', 'id', { unique: false });
        }
      }
      myDb.setDefaultErrorHandler(this.request, myDb);

      this.request.onsuccess = function (e) {
        myDb.instance = e.target.result;
        resolve('db init success');
      }

      this.request.onerror = (error) => {
        reject(error.target.result);
      }
    });
  }

  deleteDb(): Promise<any> {
    this.db = undefined;
    return new Promise((resolve, reject) => {
      myDb.instance.close();
      let deleteRequest = this._window.indexedDB.deleteDatabase(myDb.name);
      deleteRequest.onsuccess = (e) => {
        resolve(e);
      }
      deleteRequest.onerror = (e) => {
        reject(e);
      }
    })
  }

  //ASSESSMENTS
  addAssessment(_assessment: Assessment): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.assessments);
      let addRequest = store.add(_assessment);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = function (e) {
        resolve(e.target.result);
      }
      addRequest.onerror = (error) => {
        reject(error.target.result)
      }
    });
  }

  getAllAssessments(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.assessments);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getAssessment(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.assessments);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getDirectoryAssessments(directoryId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.assessments);
      let index = store.index('directoryId');
      let indexGetRequest = index.getAll(directoryId);
      myDb.setDefaultErrorHandler(indexGetRequest, myDb);

      indexGetRequest.onsuccess = (e) => {
        resolve(e.target.result)
      }
      indexGetRequest.onerror = (e) => {
        reject(e);
      }
    })
  }

  putAssessment(assessment: Assessment): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.assessments);
      let getRequest = store.get(assessment.id);

      getRequest.onsuccess = (event) => {
        let tmpAssessment: Assessment = event.target.result;
        tmpAssessment = assessment;
        tmpAssessment.modifiedDate = new Date();
        tmpAssessment.id = assessment.id;
        let updateRequest = store.put(tmpAssessment);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        }
        updateRequest.onerror = (event) => {
          reject(event)
        }
      }
      getRequest.onerror = (event) => {
        reject(event);
      }
    })
  }

  deleteAssessment(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.assessments);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      }
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      }
    })
  }

  //DIRECTORIES
  addDirectory(directoryRef: DirectoryDbRef): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.directories);
      let addRequest = store.add(directoryRef);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = function (e) {
        resolve(e.target.result);
      }
      addRequest.onerror = (error) => {
        reject(error.target.result)
      }
    });
  }

  getDirectory(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.directories);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getAllDirectories(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.directories);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getChildrenDirectories(parentDirectoryId): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.directories);
      let index = store.index('parentDirectoryId');
      let indexGetRequest = index.getAll(parentDirectoryId);
      myDb.setDefaultErrorHandler(indexGetRequest, myDb);
      indexGetRequest.onsuccess = (e) => {
        resolve(e.target.result)
      }
      indexGetRequest.onerror = (e) => {
        reject(e);
      }
    })
  }

  putDirectory(directoryRef: DirectoryDbRef): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.directories);
      let getRequest = store.get(directoryRef.id);
      getRequest.onsuccess = (event) => {
        let tmpDirectory: DirectoryDbRef = event.target.result;
        tmpDirectory = directoryRef;
        tmpDirectory.modifiedDate = new Date();
        let updateRequest = store.put(tmpDirectory);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        }
        updateRequest.onerror = (event) => {
          reject(event)
        }
      }
      getRequest.onerror = (event) => {
        reject(event);
      }
    })
  }

  deleteDirectory(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.directories);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      }
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      }
    })
  }


  //Settings
  addSettings(_settings: Settings): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.settings);
      let addRequest = store.add(_settings);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
    });
  }

  getSettings(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.settings);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getDirectorySettings(directoryId): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.settings);
      let index = store.index('directoryId');
      let indexGetRequest = index.getAll(directoryId);
      myDb.setDefaultErrorHandler(indexGetRequest, myDb);
      indexGetRequest.onsuccess = (e) => {
        resolve(e.target.result)
      }
      indexGetRequest.onerror = (e) => {
        reject(e);
      }
    })
  }

  getAssessmentSettings(assessmentId): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.settings);
      let index = store.index('assessmentId');
      let indexGetRequest = index.getAll(assessmentId);
      myDb.setDefaultErrorHandler(indexGetRequest, myDb);
      indexGetRequest.onsuccess = (e) => {
        resolve(e.target.result)
      }
      indexGetRequest.onerror = (e) => {
        reject(e);
      }
    })
  }

  putSettings(settings: Settings): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.settings);
      let getRequest = store.get(settings.id);
      getRequest.onsuccess = (event) => {
        let tmpSettings: Settings = event.target.result;
        tmpSettings = settings;
        tmpSettings.modifiedDate = new Date();
        let updateRequest = store.put(tmpSettings);
        updateRequest.onsuccess = (event) => {
          resolve(event);
        }
        updateRequest.onerror = (event) => {
          reject(event)
        }
      }
      getRequest.onerror = (event) => {
        reject(event);
      }
    })
  }

  deleteSettings(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.settings);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      }
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      }
    })
  }

  //gasLoadChargeMaterial
  addGasLoadChargeMaterial(_material: GasLoadChargeMaterial): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
    });
  }

  getGasLoadChargeMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getAllGasLoadChargeMaterial(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.gasLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.gasLoadChargeMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
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
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
    });
  }

  getLiquidLoadChargeMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getAllLiquidLoadChargeMaterial(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.liquidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.liquidLoadChargeMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
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
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
    });
  }

  getSolidLoadChargeMaterial(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getAllSolidLoadChargeMaterial(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLoadChargeMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.solidLoadChargeMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
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
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
    });
  }

  getAtmosphereSpecificHeatById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getAtmosphereSpecificHeat(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.atmosphereSpecificHeat], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.atmosphereSpecificHeat);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  //wallLossesSurface
  addWallLossesSurface(_material: WallLossesSurface): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.wallLossesSurface], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.wallLossesSurface);
      let addRequest = store.add(_material);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
    });
  }

  getWallLossesSurfaceById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.wallLossesSurface], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.wallLossesSurface);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getWallLossesSurface(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.wallLossesSurface], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.wallLossesSurface);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
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
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
    });
  }

  getFlueGasMaterialById(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let getRequest = store.get(id);
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getFlueGasMaterials(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.flueGasMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.flueGasMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
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
      }
      addRequest.onerror = (e) => {
        reject(e.target.result)
      }
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
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }

  getSolidLiquidFlueGasMaterials(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.solidLiquidFlueGasMaterial], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.solidLiquidFlueGasMaterial);
      let getRequest = store.getAll();
      myDb.setDefaultErrorHandler(getRequest, myDb);
      getRequest.onsuccess = (e) => {
        resolve(e.target.result);
      }
      getRequest.onerror = (error) => {
        reject(error.target.result)
      }
    })
  }
}
