import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Settings, getDefaultSettings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { InventoryDbService } from '../../../indexedDb/inventory-db.service';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { Calculator } from '../../../shared/models/calculators';
import { WallLossesSurfaceDbService } from '../../../indexedDb/wall-losses-surface-db.service';
import { catchError, firstValueFrom } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { AtmosphereDbService } from '../../../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../../../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../../../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../../../indexedDb/solid-load-material-db.service';
import { ElectronService } from '../../../electron/electron.service';
import { AppErrorService } from '../../../shared/errors/app-error.service';
import { DiagramIdbService } from '../../../indexedDb/diagram-idb.service';
import { Diagram } from '../../../shared/models/diagram';
import { FeatureFlagService } from '../../../shared/feature-flag.service';
import { CoreService } from '../../../core/core.service';

@Component({
  selector: 'app-reset-data-modal',
  templateUrl: './reset-data-modal.component.html',
  styleUrls: ['./reset-data-modal.component.css'],
  standalone: false
})
export class ResetDataModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();
  @ViewChild('resetSystemSettingsModal', { static: false }) public resetSystemSettingsModal: ModalDirective;

  resetAll: boolean = false;
  resetAppSettings: boolean = false;
  resetExampleItems: boolean = false;
  resetUserAssessments: boolean = false;
  resetCustomMaterials: boolean = false;
  deleting: boolean = false;
  hidingModal: any;
  constructor(private dashboardService: DashboardService,
    private electronService: ElectronService,
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
    private diagramIdbService: DiagramIdbService,
    private appErrorService: AppErrorService,
    private inventoryDbService: InventoryDbService,
    private featureFlagService: FeatureFlagService,
    private coreService: CoreService
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showResetSystemSettingsModal();
  }

  showResetSystemSettingsModal() {
    this.resetSystemSettingsModal.show();
  }

  hideResetSystemSettingsModal() {
    this.dashboardService.updateDashboardData.next(true);
    this.resetSystemSettingsModal.hide();
    this.closeModal.emit(true);
  }

  toggleResetSystemSettingsOption(option: string) {
    switch (option) {
      case "reset-all": {
        this.resetAll = !this.resetAll;
        if (this.resetAll) {
          this.resetAppSettings = true;
          this.resetExampleItems = true;
          this.resetUserAssessments = true;
          this.resetCustomMaterials = true;
        }
        else {
          this.resetAppSettings = false;
          this.resetExampleItems = false;
          this.resetUserAssessments = false;
          this.resetCustomMaterials = false;
        }
        break;
      }
      case "app-settings": {
        this.resetAppSettings = !this.resetAppSettings;
        break;
      }
      case "example-items": {
        this.resetExampleItems = !this.resetExampleItems;
        break;
      }
      case "user-assessments": {
        this.resetUserAssessments = !this.resetUserAssessments;
        break;
      }
      case "custom-materials": {
        this.resetCustomMaterials = !this.resetCustomMaterials;
        break;
      }
      default: {
        break;
      }
    }
  }

  async resetSystemSettingsAccept() {
    this.deleting = true;
    try {
      if (this.resetAll) {
        this.resetAllData();
      } else if (this.resetUserAssessments) {
        this.resetAllUserAssessments();
      } else if (this.resetAppSettings) {
        this.resetFactorySystemSettings();
      } else if (this.resetExampleItems) {
        this.resetFactoryExampleItems();
      } else if (this.resetCustomMaterials) {
        this.resetFactoryCustomMaterials();
      }
    } catch (e) {
      this.appErrorService.handleAppError('Error restoring system settings', e)
    }
  }

  async resetFactorySystemSettings() {
    let defaultSettings: Settings = getDefaultSettings();
    defaultSettings.directoryId = 1;
    defaultSettings.id = 1;
    defaultSettings.disableDashboardTutorial = this.settingsDbService.globalSettings.disableDashboardTutorial;
    defaultSettings.disablePsatTutorial = this.settingsDbService.globalSettings.disablePsatTutorial;
    defaultSettings.disableFansTutorial = this.settingsDbService.globalSettings.disableFansTutorial;
    defaultSettings.disablePhastTutorial = this.settingsDbService.globalSettings.disablePhastTutorial;
    defaultSettings.disableWasteWaterTutorial = this.settingsDbService.globalSettings.disableWasteWaterTutorial;
    defaultSettings.disableSteamTutorial = this.settingsDbService.globalSettings.disableSteamTutorial;
    defaultSettings.disableMotorInventoryTutorial = this.settingsDbService.globalSettings.disableMotorInventoryTutorial;
    defaultSettings.disableTreasureHuntTutorial = this.settingsDbService.globalSettings.disableTreasureHuntTutorial;
    defaultSettings.disableDataExplorerTutorial = this.settingsDbService.globalSettings.disableDataExplorerTutorial;
    defaultSettings.disableTutorial = this.settingsDbService.globalSettings.disableTutorial;
    defaultSettings.printAll = this.settingsDbService.globalSettings.printAll;
    defaultSettings.suiteDbItemsInitialized = true;
    delete defaultSettings.facilityInfo;
    await firstValueFrom(this.settingsDbService.updateWithObservable(defaultSettings));
    let settings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(settings);
    this.featureFlagService.restoreUserFlagsToDefault();
    this.hideResetSystemSettingsModal();
  }

  async resetFactoryExampleItems() {
    let exampleDirectory: Directory = this.directoryDbService.getExample();
    if (exampleDirectory) {
      await this.resetAllExampleAssessments(exampleDirectory.id);
    } else {
      let examplesDirectory: Directory = {
        name: 'Examples',
        createdDate: new Date(),
        modifiedDate: new Date(),
        parentDirectoryId: 1,
        isExample: true
      };
      let createdDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(examplesDirectory));
      let tmpSettings: Settings = getDefaultSettings();
      tmpSettings.directoryId = createdDirectory.id;
      delete tmpSettings.facilityInfo;
      await firstValueFrom(this.settingsDbService.addWithObservable(tmpSettings));
      await this.resetAllExampleAssessments(createdDirectory.id);
    }
  }

  getAssessmentsAndDataIds(deleteExamples: boolean = false, dirId?: number): DirectoryDataIds {
    let assessmentsIds: Array<number> = [];
    let settingsIds: Array<number> = [];
    let calculatorIds: Array<number> = [];
    for (let index: number = 0; index < this.assessmentDbService.allAssessments.length; index++) {
      let assessment: Assessment = this.assessmentDbService.allAssessments[index];
      if (deleteExamples && assessment.isExample && dirId === assessment.directoryId) {
        assessmentsIds.push(assessment.id);
        settingsIds.push(this.settingsDbService.allSettings.find(settings => { return settings.assessmentId == assessment.id }).id);
        let assessmentCalculator = this.calculatorDbService.allCalculators.find(calculator => { return calculator.assessmentId == assessment.id });
        if (assessmentCalculator) {
          calculatorIds.push(assessmentCalculator.id);
        }
      } else if (!deleteExamples && !assessment.isExample) {
        assessmentsIds.push(assessment.id);
        settingsIds.push(this.settingsDbService.allSettings.find(settings => { return settings.assessmentId == assessment.id }).id);
        let assessmentCalculator = this.calculatorDbService.allCalculators.find(calculator => { return calculator.assessmentId == assessment.id });
        if (assessmentCalculator) {
          calculatorIds.push(assessmentCalculator.id);
        }
      }
    }
    return {
      assessments: assessmentsIds,
      settings: settingsIds,
      calculators: calculatorIds
    }
  }

  async resetAllExampleAssessments(dirId: number) {
    // Delete all
    let directoryDataIds: DirectoryDataIds = this.getAssessmentsAndDataIds(true, dirId);
    let allAssessments: Array<Assessment[]> = await firstValueFrom(this.assessmentDbService.bulkDeleteWithObservable(directoryDataIds.assessments));
    let allSettings: Array<Settings[]> = await firstValueFrom(this.settingsDbService.bulkDeleteWithObservable(directoryDataIds.settings));
    let allCalculators: Array<Calculator[]> = await firstValueFrom(this.calculatorDbService.bulkDeleteWithObservable(directoryDataIds.calculators));

    let updatedInventoryItems: Array<InventoryItem> = await firstValueFrom(this.inventoryDbService.getAllInventory());
    this.inventoryDbService.setAll(updatedInventoryItems);
    let exampleInventories: Array<InventoryItem> = this.inventoryDbService.allInventoryItems.filter(item => { return item.isExample && item.directoryId === dirId });
    let allInventoryItems: Array<InventoryItem[]> = await firstValueFrom(this.inventoryDbService.bulkDeleteWithObservable(exampleInventories.map(inventory => inventory.id)));


    let updatedDiagrams: Array<Diagram> = await firstValueFrom(this.diagramIdbService.getAllDiagrams());
    this.diagramIdbService.setAll(updatedDiagrams);
    let exampleDiagrams: Array<Diagram> = updatedDiagrams.filter(diagram => { return diagram.isExample && diagram.directoryId === dirId });
    let allDiagrams: Array<Diagram[]> = await firstValueFrom(this.diagramIdbService.bulkDeleteWithObservable(exampleDiagrams.map(diagram => diagram.id)));


    this.inventoryDbService.setAll(allInventoryItems[0]);
    this.assessmentDbService.setAll(allAssessments[0]);
    this.settingsDbService.setAll(allSettings[0]);
    this.calculatorDbService.setAll(allCalculators[0]);
    this.diagramIdbService.setAll(allDiagrams[0]);



    await this.coreService.loadExampleDirectory();
    await firstValueFrom(this.directoryDbService.deleteByIdWithObservable(dirId));
    await this.directoryDbService.setAll();
    this.hideResetSystemSettingsModal();
  }

  async resetAllUserAssessments() {
    // todo 6925 aren't these all stored within the directory as well?
    let directoryDataIds: DirectoryDataIds = this.getAssessmentsAndDataIds();
    let assessments: Array<Assessment[]> = await firstValueFrom(this.assessmentDbService.bulkDeleteWithObservable(directoryDataIds.assessments));
    let settings: Array<Settings[]> = await firstValueFrom(this.settingsDbService.bulkDeleteWithObservable(directoryDataIds.settings));
    let calculators: Array<Calculator[]> = await firstValueFrom(this.calculatorDbService.bulkDeleteWithObservable(directoryDataIds.calculators))

    this.assessmentDbService.setAll(assessments[0]);
    this.calculatorDbService.setAll(calculators[0]);
    this.settingsDbService.setAll(settings[0]);
    this.hideResetSystemSettingsModal();
  }

  async resetFactoryCustomMaterials() {
    await this.gasLoadDbService.deleteAllCustomMaterials();
    await this.atmosphereDbService.deleteAllCustomMaterials();
    await this.flueGasMaterialDbService.deleteAllCustomMaterials();
    await this.liquidLoadMaterialDbService.deleteAllCustomMaterials();
    await this.solidLiquidMaterialDbService.deleteAllCustomMaterials();
    await this.solidLoadMaterialDbService.deleteAllCustomMaterials();
    await this.wallLossesSurfaceDbService.deleteAllCustomMaterials();
    this.hideResetSystemSettingsModal();
  }

  async resetAllData() {
    this.featureFlagService.restoreUserFlagsToDefault();
    try {
      this.dbService.deleteDatabase()
        .pipe(
          catchError(e => this.appErrorService.handleObservableAppError('Error Resetting Data', e
          ))
        )
        .subscribe(
          {
            next: (v) => {
              this.finishDelete();
            },
            error: (e) => {
              console.log(e);
              this.finishDelete();
            },
            complete: () => {
              this.finishDelete();
            }
          });
    } catch (e) {
      this.finishDelete();
    }
  }

  finishDelete() {
    if (this.electronService.isElectron) {
      this.electronService.sendAppRelaunch();
    } else {
      location.reload()
    }
  }


}

export interface DirectoryDataIds {
  assessments: Array<number>,
  settings: Array<number>,
  calculators: Array<number>
}