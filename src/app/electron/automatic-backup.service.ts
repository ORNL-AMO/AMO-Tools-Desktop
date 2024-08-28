import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { BackupDataService, MeasurBackupFile } from '../shared/backup-data.service';
import { BehaviorSubject, combineLatestWith, debounce, interval, Observable } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { ApplicationInstanceData, ApplicationInstanceDbService } from '../indexedDb/application-instance-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AtmosphereDbService } from '../indexedDb/atmosphere-db.service';
import { WallLossesSurfaceDbService } from '../indexedDb/wall-losses-surface-db.service';
import { FlueGasMaterialDbService } from '../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../indexedDb/solid-load-material-db.service';

@Injectable({
  providedIn: 'root'
})
export class AutomaticBackupService {
  backupTimer: any;
  fileExists: boolean;
  saving: BehaviorSubject<boolean>;
  forceModal: boolean = false;
  creatingFile: boolean = false;
  observableDataChanges: Observable<any>;

  constructor(
    private electronService: ElectronService,
    private backupDataService: BackupDataService,
    private applicationInstanceDbService: ApplicationInstanceDbService,
    private assessmentDbService: AssessmentDbService,
    private inventoryDbService: InventoryDbService,
    private calculatorDbService: CalculatorDbService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private atmosphereDbService: AtmosphereDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
  ) {
    this.saving = new BehaviorSubject<boolean>(false);
  }

  // todo 6925 split up veersioned backup and subscribe
  // initializeBackups(applicationInstanceData: ApplicationInstanceData) {
  //     if (applicationInstanceData.isAutomaticBackupOn) {
  //       if (applicationInstanceData.createVersionedBackups) {
  //         this.saveBackup(true);
  //       }
  //       this.subscribeToDataChanges();
  //     }
  // }

  saveVersionedBackup() {
    let applicationInstanceData: ApplicationInstanceData = this.applicationInstanceDbService.applicationInstanceData.getValue();
    if (applicationInstanceData && applicationInstanceData.isAutomaticBackupOn && applicationInstanceData.createVersionedBackups) {
      this.saveBackup(true);
    }
  }


  subscribeToDataChanges() {
      this.observableDataChanges = this.assessmentDbService.dbAssessments.pipe(
        combineLatestWith([
          this.inventoryDbService.dbInventories,
          this.calculatorDbService.dbCalculators,
          this.directoryDbService.dbDirectories,
          this.settingsDbService.dbSettings,
          this.atmosphereDbService.dbAtmospherSpecificHeatMaterials,
          this.wallLossesSurfaceDbService.dbWallLossesSurfaceMaterials,
          this.gasLoadDbService.dbGasLoadChargeMaterials,
          this.flueGasMaterialDbService.dbFlueGasMaterials,
          this.liquidLoadMaterialDbService.dbLiquidLoadChargeMaterials,
          this.solidLiquidMaterialDbService.dbSolidLiquidFlueGasMaterials,
          this.solidLoadMaterialDbService.dbSolidLoadChargeMaterials,
        ]),
        debounce(obs => {
          let combinedChangesDelay = 2000;
          return interval(combinedChangesDelay);
        }),
      );

      this.observableDataChanges.subscribe(dataChanges => {
        console.log('** changes observed **')
        this.saveBackup();
      });
  }

  async saveBackup(isVersioned: boolean = false) {
    let applicationInstanceData = this.applicationInstanceDbService.applicationInstanceData.getValue();
    console.log('saveBackup applicationInstanceData', applicationInstanceData)
    if (applicationInstanceData.isAutomaticBackupOn) {
      if (applicationInstanceData.dataBackupFilePath) {
        this.saving.next(true);
        let backupFile: MeasurBackupFile = await this.backupDataService.getBackupFile();
        if (isVersioned) {
          this.backupDataService.setVersionedFileName(backupFile, applicationInstanceData);
          console.log('SAVING versioned backup', backupFile.filename);
        } else {
          console.log('SAVING main backup', backupFile.dataBackupFilePath);
        }
        this.electronService.saveToFileSystem(backupFile);
        console.log('saveToFileSystem backup file', backupFile)
        this.saving.next(false);
      } else {
        this.alertFilePathDoesNotExist();
      }
    }
  }

  alertFilePathDoesNotExist() {
    // todo must select new file path
    // this.toastNotificationService.showToast('Missing Backup File', 'The file selected to backup this account no longer exists. Please navigate to the settings page for the account to update the file selection.', 10000, false, 'alert-danger')
    console.log('alert file does not exist')
    // this.dbChangesService.updateAccount(this.account);
  }
}
