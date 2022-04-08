import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
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
import { AtmosphereDbService } from '../../../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../../../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../../../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../../../indexedDb/solid-load-material-db.service';

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
    private gasLoadDbService: GasLoadMaterialDbService,
    private liquidLoadMaterialDbService: LiquidLoadMaterialDbService,
    private solidLoadMaterialDbService: SolidLoadMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private atmosphereDbService: AtmosphereDbService,
    private inventoryDbService: InventoryDbService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.showResetSystemSettingsModal();
  }

  showResetSystemSettingsModal() {
    this.resetSystemSettingsModal.show();
  }

  // hideResetSystemSettingsModal() {
  //   if (this.hidingModal) {
  //     clearTimeout(this.hidingModal);
  //   }
  //   this.hidingModal = setTimeout(() => {
  //     console.log('hiding modal');
  //     this.resetSystemSettingsModal.hide();
  //     this.dashboardService.updateDashboardData.next(true);
  //     this.closeModal.emit(true);
  //   }, 1000)
  // }
  hideResetSystemSettingsModal() {
    // if (this.hidingModal) {
    //   clearTimeout(this.hidingModal);
    // }
    this.dashboardService.updateDashboardData.next(true);
    this.resetSystemSettingsModal.hide();
    this.closeModal.emit(true);
    console.log('**** hiding modal');
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
  async resetSystemSettingsAccept() {
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
    }
    // let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    // this.assessmentDbService.setAll(updatedAssessments);
    // console.log('updatedAssessments', updatedAssessments);
    // this.hideResetSystemSettingsModal();
  }

  async resetAllExampleAssessments(dirId: number) {
    // TODO - not updating assessment/dirs correctly after reset 
    // this method should resolve all through forkjoin or subscribe
    let psatExample: Assessment = this.assessmentDbService.getExample('PSAT');
    MockPsatSettings.facilityInfo.date = new Date().toDateString();
    this.resetExampleAssessment(psatExample, MockPsat, MockPsatSettings, dirId, MockPsatCalculator);

    MockFsatSettings.facilityInfo.date = new Date().toDateString();
    let fsatExample: Assessment = this.assessmentDbService.getExample('FSAT');
    this.resetExampleAssessment(fsatExample, MockFsat, MockFsatSettings, dirId);

    MockWasteWaterSettings.facilityInfo.date = new Date().toDateString();
    let wasteWaterExample: Assessment = this.assessmentDbService.getExample('WasteWater');
    this.resetExampleAssessment(wasteWaterExample, MockWasteWater, MockWasteWaterSettings, dirId);

    let phastExample: Assessment = this.assessmentDbService.getExample('PHAST');
    if (phastExample) {
      await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(phastExample.id));
    }
    this.createPhastExample(dirId);

    let ssmtExample: Assessment = this.assessmentDbService.getExample('SSMT');
    this.resetExampleAssessment(ssmtExample, MockSsmt, MockSsmtSettings, dirId);

    let treasureHuntExample: Assessment = this.assessmentDbService.getExample('TreasureHunt');
    this.resetExampleAssessment(treasureHuntExample, MockTreasureHunt, MockTreasureHuntSettings, dirId);

    let compressedAirAssessmentExample: Assessment = this.assessmentDbService.getExample('CompressedAir');
    this.resetExampleAssessment(compressedAirAssessmentExample, MockCompressedAirAssessment, MockCompressedAirAssessmentSettings, dirId);
  
    let motorInventoryExample: InventoryItem = this.inventoryDbService.getMotorInventoryExample();
    if (motorInventoryExample) {
      await firstValueFrom(this.inventoryDbService.deleteByIdWithObservable(motorInventoryExample.id));
    } 
    this.createMotorInventoryExample(dirId);

    let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(updatedAssessments);
    console.log('updatedAssessments', updatedAssessments);
    this.hideResetSystemSettingsModal();
  }

  async resetExampleAssessment(assessment: Assessment, mockAssessment: Assessment, mockSettings: Settings, dirId: number, calculator?: Calculator) {
    console.log(assessment, mockAssessment, mockSettings, dirId);
    console.log('assessment id', assessment.id);
    console.log('dir id', assessment.directoryId);
    if (assessment) {
      await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(assessment.id));
      this.createExample(mockAssessment, mockSettings, dirId, calculator);
    } else {
      this.createExample(mockAssessment, mockSettings, dirId, calculator);
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
    this.gasLoadDbService.clearGasLoadChargeMaterial();
    this.atmosphereDbService.clearAtmosphereSpecificHeat();
    this.flueGasMaterialDbService.clearFlueGasMaterials();
    this.liquidLoadMaterialDbService.clearLiquidLoadChargeMaterial();
    this.solidLiquidMaterialDbService.clearSolidLiquidFlueGasMaterials();
    this.solidLoadMaterialDbService.clearSolidLoadChargeMaterial();
    this.wallLossesSurfaceDbService.clearWallLossesSurface();
  }

  async resetAllData() {
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
