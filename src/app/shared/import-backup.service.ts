import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { BackupDataService, MeasurBackupFile } from './backup-data.service';
import { CoreService } from '../core/core.service';
import { ElectronService } from '../electron/electron.service';
import { ManageAppDataService } from './manage-app-data.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { AppErrorService } from './errors/app-error.service';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { Directory } from './models/directory';
import { Assessment } from './models/assessment';
import { InventoryItem } from './models/inventory/inventory';
import { DirectoryDashboardService } from '../dashboard/directory-dashboard/directory-dashboard.service';
import { Settings } from './models/settings';
import { Calculator } from './models/calculators';
import { SqlDbApiService } from '../tools-suite-api/sql-db-api.service';

@Injectable({
  providedIn: 'root'
})
export class ImportBackupService {
  showImportBackupModal: BehaviorSubject<boolean>;
  selectedImportFile: MeasurBackupFile;
  backupFileError: string;
  importName: string;
  importDirectoryIdMap: { [oldId: number]: number };
  // get new assessmentId from old
  importAssessmentIdMap: { [oldId: number]: number };
  // get new settings id from old directory id
  importDirectorySettingsIdMap: { [oldId: number]: number };
  // get new settings id from old assessment id
  importAssessmentSettingsIdMap: { [oldId: number]: number };
  // get new settings id from old inventory id
  importInventorySettingsIdMap: { [oldId: number]: number };


  constructor(
    private calculatorDbService: CalculatorDbService,
    private directoryDbService: DirectoryDbService,
    private settingsDbService: SettingsDbService,
    private dbService: NgxIndexedDBService,
    private assessmentDbService: AssessmentDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private atmosphereDbService: AtmosphereDbService,
    private appErrorService: AppErrorService,
    private inventoryDbService: InventoryDbService,
    private manageAppDataService: ManageAppDataService,
    private backupDataService: BackupDataService,
    private electronService: ElectronService,
    private coreService: CoreService,
    private directoryDashboardService: DirectoryDashboardService,
    private sqlDbApiService: SqlDbApiService,
    private dashboardService: DashboardService,
  ) {

    this.showImportBackupModal = new BehaviorSubject<boolean>(undefined);
  }

  ngOnInit(): void {
    // this.showModalSub = this.importBackupModalService.showModal.subscribe(value => {
    //   this.showModal = value;
    //   this.inFacility = this.importBackupModalService.inFacility;
    //   if (this.showModal == true) {
    //     this.backupFile = undefined;
    //     this.backupFileError = undefined;
    //     this.backupName = undefined;
    //     this.selectedAccount = this.accountDbService.selectedAccount.getValue();
    //     this.accountFacilities = this.facilityDbService.accountFacilities.getValue();
    //     if (!this.selectedAccount) {
    //       this.overwriteData = false;
    //     }
    //   }
    // })
  }

  cancelImportBackup() {
    // this.importBackupModalService.showModal.next(false);
  }

  setImportFile(event: EventTarget): Promise<MeasurBackupFile> {
    return new Promise((resolve, reject) => {
      let files: FileList = (event as HTMLInputElement).files;
      if (files) {
        if (files.length !== 0) {
          let fr: FileReader = new FileReader();
          fr.readAsText(files[0]);
          fr.onloadend = (e) => {
            try {
              this.selectedImportFile = JSON.parse(JSON.stringify(fr.result));
              // console.log('selectedImportFile', this.selectedImportFile);
              let testBackup = JSON.parse(this.selectedImportFile as any)
              if (!testBackup.origin || testBackup.origin != "AMO-TOOLS-DESKTOP") {
                this.backupFileError = "Selected file does not come from MEASUR and cannot be imported."
              } else {
                this.importName = testBackup.name;
                this.backupFileError = undefined;
                resolve(this.selectedImportFile)
              }
            } catch (err) {
              console.log(err);
              reject(fr);
            }
          };

          fr.onerror = () => {
            reject(fr);
          };
        }
      } else {
        reject(undefined);
      }
    });


  }


  getImportDate(date: Date): Date {
    //date imported with timestap cause problems.
    if (typeof date.getMonth === 'function') {
      return date;
    } else {
      let readDateString: string = String(date);
      //remove time stamp
      let newString: string = readDateString.split('T')[0];
      //Format: YYYY-MM-DD
      let yearMonthDate: Array<string> = newString.split('-');
      //Month 0 indexed (-1)
      if (yearMonthDate.length == 3) {
        return new Date(Number(yearMonthDate[0]), Number(yearMonthDate[1]) - 1, Number(yearMonthDate[2]));
      } else {
        return date;
      }
    }
  }


  async importBackupFile() {
    this.importDirectoryIdMap = {};
    this.importAssessmentIdMap = {};
    this.importDirectorySettingsIdMap = {};
    this.importAssessmentSettingsIdMap = {};
    this.importInventorySettingsIdMap = {};
    // this.importInventoryIdMap = {};
    // this.cancelImportBackup();
    // this.loadingService.setLoadingStatus(true);
    // this.loadingService.setLoadingMessage("Importing backup file...")
    try {
      let backupFile: MeasurBackupFile = JSON.parse(this.selectedImportFile as any);
      console.log('importing... ', backupFile)
      // todo 6925 create backup of current data
      this.backupExistingData();
      // todo 6925 delete all data
      await this.manageAppDataService.deleteAllAppData();
      // todo 6925 import new data
      await this.importMeasurBackupFile(backupFile);

      // this.loadingService.setLoadingStatus(false);
      this.dashboardService.updateDashboardData.next(true);

      // todo 6925, nav after import or success message
    } catch (err) {
      console.log(err);
      // todo 6925 fallback to original data?
      // this.toastNotificationService.showToast('Error importing backup', 'There was an error importing this data file.', 15000, false, 'alert-danger');
      // this.loadingService.setLoadingStatus(false);
    }
  }

  async backupExistingData() {
    let newBackupFile = await this.backupDataService.getBackupFile();
    // todo 6925 change name
    this.electronService.saveToFileSystem(newBackupFile);
  }

  async importMeasurBackupFile(measurBackupFile: MeasurBackupFile) {
    console.log('importing backupfile', measurBackupFile);
    // * delete current root directory settings
    await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(1));

    // *import settings first to benefit from getter methods on 'allSettings'
    for await (let settings of measurBackupFile.settings) {
      let oldDirectoryId = settings.directoryId;
      let oldAssessmentId = settings.assessmentId;
      let oldInventoryid = settings.inventoryId;
      delete settings.id;
      delete settings.assessmentId;
      delete settings.directoryId;
      delete settings.inventoryId;

      // * reassign root settings to current root directory
      if (oldDirectoryId === 1) {
          settings.directoryId = 1;
          oldDirectoryId = undefined;
      }

      let newSettings: Settings = await firstValueFrom(this.settingsDbService.addWithObservable(settings));
      if (oldAssessmentId !== undefined && oldAssessmentId !== null) {
        this.importAssessmentSettingsIdMap[oldAssessmentId] = newSettings.id;
      }

      if (oldDirectoryId !== undefined && oldDirectoryId !== null) {
        this.importDirectorySettingsIdMap[oldDirectoryId] = newSettings.id;
      }

      if (oldInventoryid !== undefined && oldInventoryid !== null) {
        this.importInventorySettingsIdMap[oldInventoryid] = newSettings.id;
      }
    };

    let settings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(settings);

    console.log('importDirectorySettingsIdMap', this.importDirectorySettingsIdMap);
    console.log('measurBackupFile.directories', measurBackupFile.directories)
    let userDirectories = measurBackupFile.directories.filter(dir => dir.id !== 1);
    for await (let directory of userDirectories) {
      directory.selected = false;
      let oldDirId = directory.id;
      delete directory.id;

      let newDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(directory));
      await this.updateRelatedDirectorySettings(newDirectory, oldDirId);
      this.importDirectoryIdMap[oldDirId] = newDirectory.id;
    };
    let directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
    this.directoryDbService.setAll(directories);
    console.log('all directories', directories);


    for await (let assessment of measurBackupFile.assessments) {
      assessment.selected = false;
      let oldAssessmentId = assessment.id;
      delete assessment.id;
      assessment.directoryId = assessment.directoryId === 1 ? assessment.directoryId : this.importDirectoryIdMap[assessment.directoryId];
      let newAssessment = await firstValueFrom(this.assessmentDbService.addWithObservable(assessment));

      await this.updateRelatedAssessmentSettings(newAssessment, oldAssessmentId);
      this.importAssessmentIdMap[oldAssessmentId] = newAssessment.id;
    };
    let assessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
    console.log('all assessments', assessments);


    for await (let calculator of measurBackupFile.calculators) {
      delete calculator.id;
      let oldAssessmentId = calculator.assessmentId;
      let oldDirectoryId = calculator.directoryId;
      delete calculator.assessmentId;
      delete calculator.directoryId;

      calculator.assessmentId = this.importAssessmentIdMap[oldAssessmentId];
      calculator.directoryId = this.importDirectoryIdMap[oldDirectoryId];
      await firstValueFrom(this.calculatorDbService.addWithObservable(calculator));
    };
    let allCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
    this.calculatorDbService.setAll(allCalculators);
    console.log('all calculators', allCalculators);


    for await (let inventory of measurBackupFile.inventories) {
      inventory.selected = false;
      let oldInventoryId = inventory.id;
      delete inventory.id;
      inventory.directoryId = inventory.directoryId === 1 ? inventory.directoryId : this.importDirectoryIdMap[inventory.directoryId];
      let newInventory = await firstValueFrom(this.inventoryDbService.addWithObservable(inventory));
      await this.updateRelatedInventorySettings(newInventory, oldInventoryId);
    };
    let inventories = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(inventories);
    console.log('all inventories', inventories);


    console.log('importAssessmentIdMap', this.importAssessmentIdMap)
    console.log('importAssessmentSettingsIdMap', this.importAssessmentSettingsIdMap)
    console.log('importInventorySettingsIdMap', this.importInventorySettingsIdMap)
    console.log('importDirectoryIdMap', this.importDirectoryIdMap)
    console.log('importDirectorySettingsIdMap', this.importDirectorySettingsIdMap)


    console.log('all settings', settings);

    // * ======================================================

    for await (let material of measurBackupFile.gasLoadChargeMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertGasLoadChargeMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.gasLoadDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.liquidLoadChargeMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertLiquidLoadChargeMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.liquidLoadMaterialDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.solidLoadChargeMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertSolidLoadChargeMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.solidLoadMaterialDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.atmosphereSpecificHeats) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertAtmosphereSpecificHeat(material);
      if (isAdded) {
        await firstValueFrom(this.atmosphereDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.wallLossesSurfaces) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertWallLossesSurface(material);
      if (isAdded) {
        await firstValueFrom(this.wallLossesSurfaceDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.flueGasMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertGasFlueGasMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.flueGasMaterialDbService.addWithObservable(material));
      }
    };

    for await (let material of measurBackupFile.solidLiquidFlueGasMaterials) {
      material.selected = false;
      delete material.id;
      let isAdded = this.sqlDbApiService.insertSolidLiquidFlueGasMaterial(material);
      if (isAdded) {
        await firstValueFrom(this.solidLiquidMaterialDbService.addWithObservable(material));
      }
    };
  }

  async updateRelatedDirectorySettings(newDirectory: Directory, oldDirId: number) {
    if (this.importDirectorySettingsIdMap[oldDirId] !== undefined) {
      let settings: Settings = this.settingsDbService.findById(this.importDirectorySettingsIdMap[oldDirId]);
      settings.directoryId = newDirectory.id;
      await firstValueFrom(this.settingsDbService.updateWithObservable(settings));
    }
  }

  async updateRelatedAssessmentSettings(newAssessment: Assessment, oldAssessmentId: number) {
    if (this.importAssessmentSettingsIdMap[oldAssessmentId] !== undefined) {
      let settings: Settings = this.settingsDbService.findById(this.importAssessmentSettingsIdMap[oldAssessmentId]);
      settings.assessmentId = newAssessment.id;
      await firstValueFrom(this.settingsDbService.updateWithObservable(settings));
    }
  }

  async updateRelatedInventorySettings(inventoryItem: InventoryItem, oldInventoryId: number) {
    if (this.importInventorySettingsIdMap[oldInventoryId] !== undefined) {
      let settings: Settings = this.settingsDbService.findById(this.importInventorySettingsIdMap[oldInventoryId]);
      settings.inventoryId = inventoryItem.id;
      await firstValueFrom(this.settingsDbService.updateWithObservable(settings));
    }
  }


}
