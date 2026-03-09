import { Injectable } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Settings, getDefaultSettings } from '../shared/models/settings';
import { BehaviorSubject, firstValueFrom, forkJoin } from 'rxjs';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { CalculatorDbService } from '../indexedDb/calculator-db.service';
import { InventoryDbService } from '../indexedDb/inventory-db.service';
import { ElectronService } from '../electron/electron.service';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { ApplicationInstanceDbService, ApplicationInstanceData } from '../indexedDb/application-instance-db.service';
import { ImportService } from '../shared/import-export/import.service';
import { ImportExportData } from '../shared/import-export/importExportModel';
@Injectable()
export class CoreService {

  showShareDataModal: BehaviorSubject<boolean>;
  initializedToolsSuiteModule: BehaviorSubject<boolean>;
  constructor(
    private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService,
    private assessmentDbService: AssessmentDbService,
    private inventoryDbService: InventoryDbService,
    private electronService: ElectronService,
    private diagramIdbService: DiagramIdbService,
    private applicationDataService: ApplicationInstanceDbService,
    private directoryDbService: DirectoryDbService,
    private importService: ImportService) {
    this.showShareDataModal = new BehaviorSubject<boolean>(false);
    this.initializedToolsSuiteModule = new BehaviorSubject<boolean>(false);
  }

  getDefaultSettingsObject(): Settings {
    let defaultSettings: Settings = getDefaultSettings();
    defaultSettings.directoryId = 1;
    delete defaultSettings.facilityInfo;
    return defaultSettings;
  }

  relaunchApp() {
    this.electronService.sendAppRelaunch();
  }

  getAllAppData() {
    let initializedAppData = {
      directories: this.directoryDbService.getAllDirectories(),
      assessments: this.assessmentDbService.getAllAssessments(),
      diagrams: this.diagramIdbService.getAllDiagrams(),
      settings: this.settingsDbService.getAllSettings(),
      calculators: this.calculatorDbService.getAllCalculators(),
      inventoryItems: this.inventoryDbService.getAllInventory(),
    };
    return forkJoin(initializedAppData);
  }

  async setNewApplicationInstanceData() {
    let newInstanceData: ApplicationInstanceData = {
      dataBackupFilePath: undefined,
      createVersionedBackups: false,
      isSurveyToastDone: false,
      isSurveyDone: false,
      subscriberId: undefined,
      isAutomaticBackupOn: false,
      doSurveyReminder: false,
      appOpenCount: 0,
      createdDate: new Date(),
      modifiedDate: new Date(),
    };
    let applicationInstanceData = await firstValueFrom(this.applicationDataService.addWithObservable(newInstanceData));
    this.applicationDataService.applicationInstanceData.next(applicationInstanceData);
  }

  async setApplicationInstanceData() {
    let existingApplicationData: Array<ApplicationInstanceData> = await firstValueFrom(this.applicationDataService.getApplicationInstanceData());
    if (existingApplicationData.length === 0) {
      await this.setNewApplicationInstanceData();
    } else {
      if (existingApplicationData[0].appOpenCount === undefined) {
        existingApplicationData[0].appOpenCount = 0;
      }
      existingApplicationData[0].appOpenCount++;
      await firstValueFrom(this.applicationDataService.updateWithObservable(existingApplicationData[0]));
      this.applicationDataService.applicationInstanceData.next(existingApplicationData[0]);
    }
  }

  async loadExampleDirectory() {
    try {
      console.log('load example');
      const response = await fetch('assets/example-data/ExamplesData.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const backupData: ImportExportData = JSON.parse(text);
      await this.importService.importData(backupData, 1)
    } catch (err) {
      console.log(err);
    }
  }

  async createDefaultDirectories() {
    let allAssessmentsDir: Directory = {
      name: 'All Assessments',
      createdDate: new Date(),
      modifiedDate: new Date(),
      parentDirectoryId: null,
    };
    let allDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(allAssessmentsDir));
  }
}