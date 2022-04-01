import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Settings } from '../../../shared/models/settings';
import { MockPhastSettings, MockPhast } from '../../../examples/mockPhast';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { MockPsat, MockPsatCalculator, MockPsatSettings } from '../../../examples/mockPsat';
import { MockFsat, MockFsatSettings } from '../../../examples/mockFsat';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { Directory } from '../../../shared/models/directory';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { CoreService } from '../../../core/core.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { MockSsmt, MockSsmtSettings } from '../../../examples/mockSsmt';
import { MockTreasureHunt, MockTreasureHuntSettings } from '../../../examples/mockTreasureHunt';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { InventoryDbService } from '../../../indexedDb/inventory-db.service';
import { InventoryItem } from '../../../shared/models/inventory/inventory';
import { MockMotorInventory } from '../../../examples/mockMotorInventoryData';
import { MockWasteWater, MockWasteWaterSettings } from '../../../examples/mockWasteWater';
import { MockCompressedAirAssessment, MockCompressedAirAssessmentSettings } from '../../../examples/mockCompressedAirAssessment';
import { Calculator } from '../../../shared/models/calculators';
import { WallLossesSurfaceDbService } from '../../../indexedDb/wall-losses-surface-db.service';
import { firstValueFrom, forkJoin, Observable } from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { AssessmentStoreMeta, CalculatorStoreMeta, dbConfig, DirectoryStoreMeta, InventoryStoreMeta, SettingsStoreMeta, WallLossesSurfaceStoreMeta } from '../../../indexedDb/dbConfig';

@Component({
  selector: 'app-reset-data-modal',
  templateUrl: './reset-data-modal.component.html',
  styleUrls: ['./reset-data-modal.component.css']
})
export class ResetDataModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();
  @ViewChild('resetSystemSettingsModal', { static: false }) public resetSystemSettingsModal: ModalDirective;

  resetAll: boolean = false;
  resetAppSettings: boolean = false;
  resetExampleAssessments: boolean = false;
  resetUserAssessments: boolean = false;
  resetCustomMaterials: boolean = false;
  deleting: boolean = false;
  hidingModal: any;
  constructor(private dashboardService: DashboardService, 
    private calculatorDbService: CalculatorDbService,
    private coreService: CoreService, 
    private directoryDbService: DirectoryDbService, 
    private settingsDbService: SettingsDbService, 
    private dbService: NgxIndexedDBService,
    private assessmentDbService: AssessmentDbService,
    private wallLossesSurfaceDbService: WallLossesSurfaceDbService,
    private inventoryDbService: InventoryDbService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showResetSystemSettingsModal();
  }

  showResetSystemSettingsModal() {
    this.resetSystemSettingsModal.show();
  }

  hideResetSystemSettingsModal() {
    if (this.hidingModal) {
      clearTimeout(this.hidingModal);
    }
    this.hidingModal = setTimeout(() => {
      this.resetSystemSettingsModal.hide();
      this.dashboardService.updateDashboardData.next(true);
      this.closeModal.emit(true);
    }, 1000)
  }

  toggleResetSystemSettingsOption(option: string) {
    switch (option) {
      case "reset-all": {
        this.resetAll = !this.resetAll;
        if (this.resetAll) {
          this.resetAppSettings = true;
          this.resetExampleAssessments = true;
          this.resetUserAssessments = true;
          this.resetCustomMaterials = true;
        }
        else {
          this.resetAppSettings = false;
          this.resetExampleAssessments = false;
          this.resetUserAssessments = false;
          this.resetCustomMaterials = false;
        }
        break;
      }
      case "app-settings": {
        this.resetAppSettings = !this.resetAppSettings;
        break;
      }
      case "example-assessments": {
        this.resetExampleAssessments = !this.resetExampleAssessments;
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

  // needs help
  resetSystemSettingsAccept() {
    this.deleting = true;
    if (this.resetCustomMaterials) {
      this.resetFactoryCustomMaterials();
    }

    if (this.resetAll) {
      this.resetAllData();
    } else if (this.resetUserAssessments) {
      this.resetAllUserAssessments();
    } else {
      if (this.resetAppSettings) {
        this.resetFactorySystemSettings();
      }
      if (this.resetExampleAssessments) {
        this.resetFactoryExampleAssessments();
      }
    }
    this.hideResetSystemSettingsModal();
  }

  async resetFactorySystemSettings() {
    let defaultSettings: Settings = JSON.parse(JSON.stringify(MockPhastSettings));
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
    delete defaultSettings.facilityInfo;
    let settings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(defaultSettings));
    this.settingsDbService.setAll(settings);
  }

  async resetFactoryExampleAssessments() {
    let exampleDirectory: Directory = this.directoryDbService.getExample();
    if (exampleDirectory) {
      this.resetAllExampleAssessments(exampleDirectory.id);
    } else {
      let examplesDirectory: Directory = {
        name: 'Examples',
        createdDate: new Date(),
        modifiedDate: new Date(),
        parentDirectoryId: 1,
        isExample: true
      };
      let createdDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(examplesDirectory));
      let tmpSettings: Settings = JSON.parse(JSON.stringify(MockPhastSettings));
      tmpSettings.directoryId = createdDirectory.id;
      delete tmpSettings.facilityInfo;
      await firstValueFrom(this.settingsDbService.addWithObservable(tmpSettings));
      this.resetAllExampleAssessments(createdDirectory.id);
      this.assessmentDbService.setAll();
    }
  }

  async resetAllExampleAssessments(id: number) {
    let psatExample: Assessment = this.assessmentDbService.getExample('PSAT');
    MockPsatSettings.facilityInfo.date = new Date().toDateString();
    this.resetExampleAssessment(psatExample, MockPsat, MockPsatSettings, id, MockPsatCalculator);

    MockFsatSettings.facilityInfo.date = new Date().toDateString();
    let fsatExample: Assessment = this.assessmentDbService.getExample('FSAT');
    this.resetExampleAssessment(fsatExample, MockFsat, MockFsatSettings, id);

    MockWasteWaterSettings.facilityInfo.date = new Date().toDateString();
    let wasteWaterExample: Assessment = this.assessmentDbService.getExample('WasteWater');
    this.resetExampleAssessment(wasteWaterExample, MockWasteWater, MockWasteWaterSettings, id);

    let phastExample: Assessment = this.assessmentDbService.getExample('PHAST');
    if (phastExample) {
      console.log('phast delete id', phastExample.id);
      await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(phastExample.id));
      this.createPhastExample(id);
    } else {
      this.createPhastExample(id);
    }

    let ssmtExample: Assessment = this.assessmentDbService.getExample('SSMT');
    this.resetExampleAssessment(ssmtExample, MockSsmt, MockSsmtSettings, id);

    let treasureHuntExample: Assessment = this.assessmentDbService.getExample('TreasureHunt');
    this.resetExampleAssessment(treasureHuntExample, MockTreasureHunt, MockTreasureHuntSettings, id);

    let compressedAirAssessmentExample: Assessment = this.assessmentDbService.getExample('CompressedAir');
    this.resetExampleAssessment(compressedAirAssessmentExample, MockCompressedAirAssessment, MockCompressedAirAssessmentSettings, id);
  
    let motorInventoryExample: InventoryItem = this.inventoryDbService.getMotorInventoryExample();
    if (motorInventoryExample) {
      await firstValueFrom(this.inventoryDbService.deleteByIdWithObservable(motorInventoryExample.id));
      this.createMotorInventoryExample(id);
    } else {
      this.createMotorInventoryExample(id);
    }
    this.assessmentDbService.setAll();
    console.log('allAssessments after reset', this.assessmentDbService.allAssessments)
  }

  async resetExampleAssessment(assessment: Assessment, mockAssessment: Assessment, mockSettings: Settings, id: number, calculator?: Calculator) {
    console.log(assessment, mockAssessment, mockSettings, id);
    console.log('ids: assessment, dir', assessment.id, assessment.directoryId)
    if (assessment) {
      await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(assessment.id));
      this.createExample(mockAssessment, mockSettings, id, calculator);
    } else {
      this.createExample(mockAssessment, mockSettings, id, calculator);
    }
  }

  async createExample(MockAssessment: Assessment, mockSettings: Settings, dirId: number, calculator?: Calculator) {
    MockAssessment.directoryId = dirId;
    let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockAssessment));
    mockSettings.assessmentId = createdAssessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(mockSettings));
    if (calculator) {
      calculator.assessmentId = createdAssessment.id;
      this.calculatorDbService.add(calculator);
    }
  }

  async createPhastExample(dirId: number) {
    MockPhast.directoryId = dirId;
    let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockPhast));
    delete MockPhastSettings.directoryId;
    MockPhastSettings.assessmentId = createdAssessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockPhastSettings));
  }

  async createMotorInventoryExample(dirId: number) {
    MockMotorInventory.directoryId = dirId;
    let inventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(MockMotorInventory));
    delete MockPsatSettings.directoryId;
    delete MockPsatSettings.assessmentId;
    MockPsatSettings.assessmentId = inventory.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));
  }

  async resetAllUserAssessments() {
    let resetAssessmentsIds: Array<number> = [];
    // let resetInventoryIds = this.inventoryDbService.allInventoryItems.filter(item => !item.isExample);
    let resetSettingsIds: Array<number> = [];
    let resetCalculatorIds: Array<number> = [];
    for (let index: number = 0; index < this.assessmentDbService.allAssessments.length; index++) {
      let assessment: Assessment = this.assessmentDbService.allAssessments[index];
      if (!assessment.isExample) {
        resetAssessmentsIds.push(assessment.id);
        resetSettingsIds.push(this.settingsDbService.allSettings.find(settings => { return settings.assessmentId == assessment.id }).id);
        let assessmentCalculator = this.calculatorDbService.allCalculators.find(calculator => { return calculator.assessmentId == assessment.id });
        if (assessmentCalculator) {
          resetCalculatorIds.push(assessmentCalculator.id);
        }
      }
    }

    let resetActions: Array<Observable<Assessment | Settings | Calculator>> = [
          this.assessmentDbService.bulkDeleteWithObservable(resetAssessmentsIds),
          this.settingsDbService.bulkDeleteWithObservable(resetSettingsIds),
          this.calculatorDbService.bulkDeleteWithObservable(resetCalculatorIds),
      ];
      console.log('user assessment delete ids', resetAssessmentsIds, resetSettingsIds, resetCalculatorIds);
    forkJoin(
          resetActions
        ).subscribe(completedActions => {
          console.log('All user items deleted', completedActions);
          this.calculatorDbService.setAll();
          this.assessmentDbService.setAll();
          this.settingsDbService.setAll();
          this.hideResetSystemSettingsModal();
        }); 
  }

  setAllDbData() {
    this.coreService.getAllAppData().subscribe(initializedData => {
      console.log('reset-data-modal.component data reset', initializedData);
      this.directoryDbService.setAll(initializedData.directories);
      this.settingsDbService.setAll(initializedData.settings);
      this.assessmentDbService.setAll(initializedData.assessments);
      this.calculatorDbService.setAll(initializedData.calculators);
      this.inventoryDbService.setAll(initializedData.inventoryItems);
      this.dashboardService.updateDashboardData.next(true);
      this.hideResetSystemSettingsModal();
    });
    
    
  }

  resetFactoryCustomMaterials() {
    // this.indexedDbService.clearGasLoadChargeMaterial();
    // this.indexedDbService.clearAtmosphereSpecificHeat();
    // this.indexedDbService.clearFlueGasMaterials();
    // this.indexedDbService.clearLiquidLoadChargeMaterial();
    // this.indexedDbService.clearSolidLiquidFlueGasMaterials();
    // this.indexedDbService.clearSolidLoadChargeMaterial();
    this.wallLossesSurfaceDbService.clearWallLossesSurface();
  }

  async resetAllData() {
    // let isDatabaseDeleted = this.deleteDatabase();
    // console.log('is database deleted', isDatabaseDeleted);
    // if (isDatabaseDeleted) {
    //   this.createObjectStores();
    //   this.coreService.createDefaultDirectories();
    //   if (!this.resetAppSettings) {
    //     await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    //   }
      
    //   this.coreService.createExamples();
    //   this.coreService.createDirectorySettings();
    //   this.setAllDbData();
    // }
      try {
          this.dbService.deleteDatabase().subscribe(
            {
              next: (v) => {
                console.log('database deleted..');
                  this.coreService.relaunchApp();
              },
              error: (e) => {
                console.log(e);
                  this.finishDelete();
              },
              complete: () => {
                this.finishDelete();
              } 
          });
      } catch (err) {
          console.log(err);
          this.finishDelete();
      }

  }

  finishDelete(){
    // TODO if not in electron, do location.reload()
    this.coreService.relaunchApp();
  }


}
