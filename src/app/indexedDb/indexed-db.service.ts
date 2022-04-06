import { Injectable } from '@angular/core';
import { WindowRefService } from '../indexedDb/window-ref.service';
import { DirectoryDbRef } from '../shared/models/directory';
import { Assessment } from '../shared/models/assessment';
import { Settings } from '../shared/models/settings';
import { WallLossesSurface, GasLoadChargeMaterial, LiquidLoadChargeMaterial, SolidLoadChargeMaterial, AtmosphereSpecificHeat, FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../shared/models/materials';
import { UpdateDataService } from '../shared/helper-services/update-data.service';
import { Calculator } from '../shared/models/calculators';
import { LogToolDbData } from '../log-tool/log-tool-models';
import { InventoryItem } from '../shared/models/inventory/inventory';
import { SettingsDbService } from './settings-db.service';
import { firstValueFrom } from 'rxjs';

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

  db: any;
  request: any;
  private _window: Window;

  initCustomObjects: boolean = true;
  constructor(private windowRef: WindowRefService,
    private settingsDbService: SettingsDbService,
     private updateDataService: UpdateDataService) {
    this._window = windowRef.nativeWindow;
  }

  // initDb(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.request = this._window.indexedDB.open(myDb.name, myDb.version);
  //     this.request.onupgradeneeded = function (e) {
  //       var newVersion = e.target.result;
  //       //assessments
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.assessments)) {
  //         console.log('creating assessments store...');
  //         let assessmentObjStore = newVersion.createObjectStore(myDb.storeNames.assessments, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         assessmentObjStore.createIndex('directoryId', 'directoryId', { unique: false });
  //       }
  //       //directories
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.directories)) {
  //         console.log('creating directories store...');
  //         let directoryObjectStore = newVersion.createObjectStore(myDb.storeNames.directories, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         directoryObjectStore.createIndex('parentDirectoryId', 'parentDirectoryId', { unique: false });
  //       }
  //       //settings
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.settings)) {
  //         console.log('creating settings store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.settings, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('directoryId', 'directoryId', { unique: false });
  //         settingsObjStore.createIndex('assessmentId', 'assessmentId', { unique: false });
  //         settingsObjStore.createIndex('inventoryId', 'inventoryId', {unique: false});
  //       }
  //       //gasLoadChargeMaterial
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.gasLoadChargeMaterial)) {
  //         console.log('creating gasLoadChargeMaterial store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.gasLoadChargeMaterial, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('id', 'id', { unique: false });
  //       }

  //       //liquidLoadChargeMaterial
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.liquidLoadChargeMaterial)) {
  //         console.log('creating liquidLoadChargeMaterial store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.liquidLoadChargeMaterial, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('id', 'id', { unique: false });
  //       }

  //       //solidLoadChargeMaterial
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.solidLoadChargeMaterial)) {
  //         console.log('creating solidLoadChargeMaterial store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.solidLoadChargeMaterial, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('id', 'id', { unique: false });
  //       }
  //       //atmosphereSpecificHeat
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.atmosphereSpecificHeat)) {
  //         console.log('creating atmosphereSpecificHeat store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.atmosphereSpecificHeat, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('id', 'id', { unique: false });
  //       }
  //       //wallLossesSurface
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.wallLossesSurface)) {
  //         console.log('creating wallLossesSurface store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.wallLossesSurface, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('id', 'id', { unique: false });
  //       }
  //       //flueGasMaterial
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.flueGasMaterial)) {
  //         console.log('creating flueGasMaterial store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.flueGasMaterial, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('id', 'id', { unique: false });
  //       }
  //       //solidLiquidFlueGasMaterial
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.solidLiquidFlueGasMaterial)) {
  //         console.log('creating solidLiquidFlueGasMaterial store...');
  //         let settingsObjStore = newVersion.createObjectStore(myDb.storeNames.solidLiquidFlueGasMaterial, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         settingsObjStore.createIndex('id', 'id', { unique: false });
  //       }
  //       //calculator
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.calculator)) {
  //         console.log('creating calculator store...');
  //         let calculatorObjStore = newVersion.createObjectStore(myDb.storeNames.calculator, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         calculatorObjStore.createIndex('id', 'id', { unique: false });
  //         calculatorObjStore.createIndex('directoryId', 'directoryId', { unique: false });
  //         calculatorObjStore.createIndex('assessmentId', 'assessmentId', { unique: false });
  //       }
  //       //calculator
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.logTool)) {
  //         console.log('creating logTool store...');
  //         let calculatorObjStore = newVersion.createObjectStore(myDb.storeNames.logTool, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         calculatorObjStore.createIndex('id', 'id', { unique: false });
  //       }
  //       //inventoryItems
  //       if (!newVersion.objectStoreNames.contains(myDb.storeNames.inventoryItems)) {
  //         console.log('creating inventoryItems store...');
  //         let inventoryItemsObjStore = newVersion.createObjectStore(myDb.storeNames.inventoryItems, {
  //           autoIncrement: true,
  //           keyPath: 'id'
  //         });
  //         inventoryItemsObjStore.createIndex('directoryId', 'directoryId', { unique: false });
  //       }
  //     };
  //     myDb.setDefaultErrorHandler(this.request, myDb);

  //     this.request.onsuccess = function (e) {
  //       myDb.instance = e.target.result;
  //       resolve('db init success');
  //     };

  //     this.request.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // deleteDb(): Promise<any> {
  //   this.db = undefined;
  //   return new Promise((resolve, reject) => {
  //     myDb.instance.close();
  //     let deleteRequest = this._window.indexedDB.deleteDatabase(myDb.name);
  //     deleteRequest.onsuccess = (e) => {
  //       resolve(e);
  //     };
  //     deleteRequest.onerror = (e) => {
  //       reject(e);
  //     };
  //   });
  // }

  //ASSESSMENTS
  // addAssessment(_assessment: Assessment): Promise<any> {
  //   _assessment.createdDate = new Date();
  //   _assessment.modifiedDate = new Date();
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.assessments);
  //     let addRequest = store.add(_assessment);
  //     myDb.setDefaultErrorHandler(addRequest, myDb);
  //     addRequest.onsuccess = function (e) {
  //       resolve(e.target.result);
  //     };
  //     addRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // getAllAssessments(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.assessments);
  //     let getRequest = store.getAll();
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       e.target.result.forEach(assessment => {
  //         assessment = this.updateDataService.checkAssessment(assessment);
  //       })
  //       resolve(e.target.result);
  //     };
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // getAssessment(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.assessments);
  //     let getRequest = store.get(id);
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       //e.target.result = Assessment
  //       let assessment = this.updateDataService.checkAssessment(e.target.result);
  //       resolve(assessment);
  //     };
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // getDirectoryAssessments(directoryId: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.assessments);
  //     let index = store.index('directoryId');
  //     let indexGetRequest = index.getAll(directoryId);
  //     myDb.setDefaultErrorHandler(indexGetRequest, myDb);

  //     indexGetRequest.onsuccess = (e) => {
  //       //e.target.result = Array<Assessments>
  //       let assessments: Array<Assessment> = e.target.result;
  //       assessments.forEach(assessment => {
  //         assessment = this.updateDataService.checkAssessment(assessment);
  //       });
  //       resolve(assessments)
  //     }
  //     indexGetRequest.onerror = (e) => {
  //       reject(e);
  //     }
  //   })
  // }

  // putAssessment(assessment: Assessment): Promise<any> {
  //   assessment.modifiedDate = new Date();
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.assessments);
  //     let getRequest = store.get(assessment.id);

  //     getRequest.onsuccess = (event) => {
  //       let tmpAssessment: Assessment = event.target.result;
  //       tmpAssessment = assessment;
  //       tmpAssessment.modifiedDate = new Date();
  //       tmpAssessment.id = assessment.id;
  //       let updateRequest = store.put(tmpAssessment);
  //       updateRequest.onsuccess = (event) => {
  //         resolve(event);
  //       };
  //       updateRequest.onerror = (event) => {
  //         reject(event);
  //       };
  //     };
  //     getRequest.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // deleteAssessment(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.assessments], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.assessments);
  //     let deleteRequest = store.delete(id);
  //     deleteRequest.onsuccess = (event) => {
  //       resolve(event.target.result);
  //     };
  //     deleteRequest.onerror = (event) => {
  //       reject(event.target.result);
  //     };
  //   });
  // }

  //DIRECTORIES
  // addDirectory(directoryRef: DirectoryDbRef): Promise<any> {
  //   directoryRef.createdDate = new Date();
  //   directoryRef.modifiedDate = new Date();
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.directories);
  //     let addRequest = store.add(directoryRef);
  //     myDb.setDefaultErrorHandler(addRequest, myDb);
  //     addRequest.onsuccess = function (e) {
  //       resolve(e.target.result);
  //     };
  //     addRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // getDirectory(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.directories);
  //     let getRequest = store.get(id);
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       resolve(e.target.result);
  //     }
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result)
  //     }
  //   })
  // }

  // getAllDirectories(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.directories);
  //     let getRequest = store.getAll();
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       resolve(e.target.result);
  //     };
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // getChildrenDirectories(parentDirectoryId): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.directories);
  //     let index = store.index('parentDirectoryId');
  //     let indexGetRequest = index.getAll(parentDirectoryId);
  //     myDb.setDefaultErrorHandler(indexGetRequest, myDb);
  //     indexGetRequest.onsuccess = (e) => {
  //       resolve(e.target.result)
  //     }
  //     indexGetRequest.onerror = (e) => {
  //       reject(e);
  //     }
  //   })
  // }

  // putDirectory(directoryRef: DirectoryDbRef): Promise<any> {
  //   directoryRef.modifiedDate = new Date();
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.directories);
  //     let getRequest = store.get(directoryRef.id);
  //     getRequest.onsuccess = (event) => {
  //       let tmpDirectory: DirectoryDbRef = event.target.result;
  //       tmpDirectory = directoryRef;
  //       tmpDirectory.modifiedDate = new Date();
  //       let updateRequest = store.put(tmpDirectory);
  //       updateRequest.onsuccess = (event) => {
  //         resolve(event);
  //       };
  //       updateRequest.onerror = (event) => {
  //         reject(event);
  //       };
  //     };
  //     getRequest.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // deleteDirectory(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.directories], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.directories);
  //     let deleteRequest = store.delete(id);
  //     deleteRequest.onsuccess = (event) => {
  //       resolve(event.target.result);
  //     };
  //     deleteRequest.onerror = (event) => {
  //       reject(event.target.result);
  //     };
  //   });
  // }

  // getSettings(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.settings);
  //     let getRequest = store.get(id);
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       let settingsArr: Array<Settings> = e.target.result;
  //       settingsArr.forEach(setting => {
  //         setting = this.updateDataService.checkSettings(setting);
  //       })
  //       resolve(settingsArr);
  //     }
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result)
  //     }
  //   })
  // }

  // getDirectorySettings(directoryId): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.settings);
  //     let index = store.index('directoryId');
  //     let indexGetRequest = index.getAll(directoryId);
  //     myDb.setDefaultErrorHandler(indexGetRequest, myDb);
  //     indexGetRequest.onsuccess = (e) => {
  //       //e.target.result = Array<Settings>
  //       let settingsArr: Array<Settings> = e.target.result;
  //       settingsArr.forEach(setting => {
  //         setting = this.updateDataService.checkSettings(setting);
  //       })
  //       resolve(settingsArr)
  //     }
  //     indexGetRequest.onerror = (e) => {
  //       reject(e);
  //     }
  //   })
  // }

  // getAssessmentSettings(assessmentId): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.settings);
  //     let index = store.index('assessmentId');
  //     let indexGetRequest = index.getAll(assessmentId);
  //     myDb.setDefaultErrorHandler(indexGetRequest, myDb);
  //     indexGetRequest.onsuccess = (e) => {
  //       //e.target.result = Array<Settings>
  //       let settingsArr: Array<Settings> = e.target.result;
  //       settingsArr.forEach(setting => {
  //         setting = this.updateDataService.checkSettings(setting);
  //       })
  //       resolve(settingsArr)
  //     }
  //     indexGetRequest.onerror = (e) => {
  //       reject(e);
  //     }
  //   })
  // }

  // getAllSettings(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.settings);
  //     let getRequest = store.getAll();
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       resolve(e.target.result);
  //     };
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // putSettings(settings: Settings): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.settings);
  //     let getRequest = store.get(settings.id);
  //     getRequest.onsuccess = (event) => {
  //       let tmpSettings: Settings = event.target.result;
  //       tmpSettings = settings;
  //       tmpSettings.modifiedDate = new Date();
  //       let updateRequest = store.put(tmpSettings);
  //       updateRequest.onsuccess = (event) => {
  //         resolve(event);
  //       };
  //       updateRequest.onerror = (event) => {
  //         reject(event);
  //       };
  //     };
  //     getRequest.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  deleteSettings(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.settings], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.settings);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
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

   // TODO TEMPORARY reroute - remove
   async addSettings(_settings: Settings) {
    return firstValueFrom(this.settingsDbService.addWithObservable(_settings));
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

  //calculator
  // addCalculator(_calculator: Calculator): Promise<any> {
  //   _calculator.createdDate = new Date();
  //   _calculator.modifiedDate = new Date();
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.calculator], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.calculator);
  //     let addRequest = store.add(_calculator);
  //     myDb.setDefaultErrorHandler(addRequest, myDb);
  //     addRequest.onsuccess = (e) => {
  //       resolve(e.target.result);
  //     };
  //     addRequest.onerror = (e) => {
  //       reject(e.target.result);
  //     };
  //   });
  // }
  
  // getDirectoryCalculator(directoryId: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.calculator], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.calculator);
  //     let index = store.index('directoryId');
  //     let indexGetRequest = index.getAll(directoryId);
  //     myDb.setDefaultErrorHandler(indexGetRequest, myDb);
  //     indexGetRequest.onsuccess = (e) => {
  //       let calculators: Array<Calculator> = e.target.result;
  //       resolve(calculators)
  //     }
  //     indexGetRequest.onerror = (e) => {
  //       reject(e);
  //     }
  //   })
  // }
  // getAssessmentCalculator(assessmentId: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.calculator], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.calculator);
  //     let index = store.index('assessmentId');
  //     let indexGetRequest = index.getAll(assessmentId);
  //     myDb.setDefaultErrorHandler(indexGetRequest, myDb);
  //     indexGetRequest.onsuccess = (e) => {
  //       let calculators: Array<Calculator> = e.target.result;
  //       resolve(calculators)
  //     }
  //     indexGetRequest.onerror = (e) => {
  //       reject(e);
  //     }
  //   })
  // }

  // getCalculator(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.calculator], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.calculator);
  //     let getRequest = store.get(id);
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       resolve(e.target.result);
  //     }
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result)
  //     }
  //   })
  // }

  // getAllCalculator(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.calculator], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.calculator);
  //     let getRequest = store.getAll();
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       resolve(e.target.result);
  //     };
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // putCalculator(calculator: Calculator): Promise<any> {
  //   calculator.modifiedDate = new Date(new Date().toLocaleDateString());
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.calculator], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.calculator);
  //     let getRequest = store.get(calculator.id);
  //     getRequest.onsuccess = (event) => {
  //       let tmpCalc: Calculator = event.target.result;
  //       tmpCalc = calculator;
  //       let updateRequest = store.put(tmpCalc);
  //       updateRequest.onsuccess = (event) => {
  //         resolve(event);
  //       };
  //       updateRequest.onerror = (event) => {
  //         reject(event);
  //       };
  //     };
  //     getRequest.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // deleteCalculator(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.calculator], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.calculator);
  //     let deleteRequest = store.delete(id);
  //     deleteRequest.onsuccess = (event) => {
  //       resolve(event.target.result);
  //     };
  //     deleteRequest.onerror = (event) => {
  //       reject(event.target.result);
  //     };
  //   });
  // }

  //log tool
  addLogTool(logTool: LogToolDbData): Promise<any> {
    logTool.modifiedDate = new Date();
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.logTool], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.logTool);
      let addRequest = store.add(logTool);
      myDb.setDefaultErrorHandler(addRequest, myDb);
      addRequest.onsuccess = (e) => {
        resolve(e.target.result);
      };
      addRequest.onerror = (e) => {
        reject(e.target.result);
      };
    });
  }

  getAllLogTool(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.logTool], 'readonly');
      let store = transaction.objectStore(myDb.storeNames.logTool);
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

  putLogTool(logTool: LogToolDbData): Promise<any> {
    logTool.modifiedDate = new Date();
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.logTool], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.logTool);
      let getRequest = store.get(logTool.id);
      getRequest.onsuccess = (event) => {
        let tmpCalc: Calculator = event.target.result;
        tmpCalc = logTool;
        let updateRequest = store.put(tmpCalc);
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

  deleteLogTool(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      let transaction = myDb.instance.transaction([myDb.storeNames.logTool], 'readwrite');
      let store = transaction.objectStore(myDb.storeNames.logTool);
      let deleteRequest = store.delete(id);
      deleteRequest.onsuccess = (event) => {
        resolve(event.target.result);
      };
      deleteRequest.onerror = (event) => {
        reject(event.target.result);
      };
    });
  }

  // //inventoryItems
  // addInventoryItem(inventoryItem: InventoryItem): Promise<any> {
  //   inventoryItem.createdDate = new Date();
  //   inventoryItem.modifiedDate = new Date();
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.inventoryItems], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.inventoryItems);
  //     let addRequest = store.add(inventoryItem);
  //     myDb.setDefaultErrorHandler(addRequest, myDb);
  //     addRequest.onsuccess = function (e) {
  //       resolve(e.target.result);
  //     };
  //     addRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // getAllInventoryItems(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.inventoryItems], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.inventoryItems);
  //     let getRequest = store.getAll();
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       // e.target.result.forEach(inventoryItem => {
  //       //   inventoryItem = this.updateDataService.checkAssessment(inventoryItem);
  //       // })
  //       resolve(e.target.result);
  //     };
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // getInventoryItem(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.inventoryItems], 'readonly');
  //     let store = transaction.objectStore(myDb.storeNames.inventoryItems);
  //     let getRequest = store.get(id);
  //     myDb.setDefaultErrorHandler(getRequest, myDb);
  //     getRequest.onsuccess = (e) => {
  //       //e.target.result = Assessment
  //       // let assessment = this.updateDataService.checkAssessment(e.target.result);
  //       resolve(e.target.result);
  //     };
  //     getRequest.onerror = (error) => {
  //       reject(error.target.result);
  //     };
  //   });
  // }

  // putInventoryItem(inventoryItem: InventoryItem): Promise<any> {
  //   inventoryItem.modifiedDate = new Date();
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.inventoryItems], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.inventoryItems);
  //     let getRequest = store.get(inventoryItem.id);

  //     getRequest.onsuccess = (event) => {
  //       let tmpInventoryItem: InventoryItem = event.target.result;
  //       tmpInventoryItem = inventoryItem;
  //       tmpInventoryItem.modifiedDate = new Date();
  //       tmpInventoryItem.id = inventoryItem.id;
  //       let updateRequest = store.put(tmpInventoryItem);
  //       updateRequest.onsuccess = (event) => {
  //         resolve(event);
  //       };
  //       updateRequest.onerror = (event) => {
  //         reject(event);
  //       };
  //     };
  //     getRequest.onerror = (event) => {
  //       reject(event);
  //     };
  //   });
  // }

  // deleteInventoryItem(id: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     let transaction = myDb.instance.transaction([myDb.storeNames.inventoryItems], 'readwrite');
  //     let store = transaction.objectStore(myDb.storeNames.inventoryItems);
  //     let deleteRequest = store.delete(id);
  //     deleteRequest.onsuccess = (event) => {
  //       resolve(event.target.result);
  //     };
  //     deleteRequest.onerror = (event) => {
  //       reject(event.target.result);
  //     };
  //   });
  // }

}
