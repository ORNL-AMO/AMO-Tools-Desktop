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
import { catchError, firstValueFrom} from 'rxjs';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { AtmosphereDbService } from '../../../indexedDb/atmosphere-db.service';
import { FlueGasMaterialDbService } from '../../../indexedDb/flue-gas-material-db.service';
import { GasLoadMaterialDbService } from '../../../indexedDb/gas-load-material-db.service';
import { LiquidLoadMaterialDbService } from '../../../indexedDb/liquid-load-material-db.service';
import { SolidLiquidMaterialDbService } from '../../../indexedDb/solid-liquid-material-db.service';
import { SolidLoadMaterialDbService } from '../../../indexedDb/solid-load-material-db.service';
import { MockPumpInventory } from '../../../examples/mockPumpInventoryData';

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

  async resetSystemSettingsAccept() {
    this.deleting = true;
    if (this.resetAll) {
      this.resetAllData();
    } else if (this.resetUserAssessments) {
      this.resetAllUserAssessments();
    } else if (this.resetAppSettings) {
      this.resetFactorySystemSettings();
    } else if (this.resetExampleAssessments) {
      this.resetFactoryExampleAssessments();
    } else if (this.resetCustomMaterials) {
      this.resetFactoryCustomMaterials();
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
    this.hideResetSystemSettingsModal();
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
  let exampleInventory: InventoryItem = this.inventoryDbService.allInventoryItems.find(item => { return item.isExample && item.directoryId === dirId});
  if (exampleInventory) {
    let allInventoryItems: Array<InventoryItem> = await firstValueFrom(this.inventoryDbService.deleteByIdWithObservable(exampleInventory.id));
    this.inventoryDbService.setAll(allInventoryItems);
  }


  this.assessmentDbService.setAll(allAssessments[0]);
  this.settingsDbService.setAll(allSettings[0]);
  this.calculatorDbService.setAll(allCalculators[0]);

  // Set new examples/mock and add
  MockPsatSettings.facilityInfo.date = new Date().toDateString();
  MockPsat.directoryId = dirId;
  let createdPsat: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockPsat));
  MockPsatSettings.assessmentId = createdPsat.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));
  MockPsatCalculator.assessmentId = createdPsat.id;
  await firstValueFrom(this.calculatorDbService.addWithObservable(MockPsatCalculator));

  MockFsatSettings.facilityInfo.date = new Date().toDateString();
  MockFsat.directoryId = dirId;
  let createdFsat: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockFsat));
  MockFsatSettings.assessmentId = createdFsat.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockFsatSettings));

  MockWasteWaterSettings.facilityInfo.date = new Date().toDateString();
  MockWasteWater.directoryId = dirId;
  let createdWasteWater: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockWasteWater));
  MockWasteWaterSettings.assessmentId = createdWasteWater.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockWasteWaterSettings));

  MockPhast.directoryId = dirId;
  let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockPhast));
  delete MockPhastSettings.directoryId;
  MockPhastSettings.assessmentId = createdAssessment.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockPhastSettings));

  MockSsmt.directoryId = dirId;
  let createdSSMT: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockSsmt));
  MockSsmtSettings.assessmentId = createdSSMT.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockSsmtSettings));

  MockTreasureHunt.directoryId = dirId;
  let createdTreasureHunt: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockTreasureHunt));
  MockTreasureHuntSettings.assessmentId = createdTreasureHunt.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockTreasureHuntSettings));

  MockCompressedAirAssessment.directoryId = dirId;
  let createdCompressedAir: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockCompressedAirAssessment));
  MockCompressedAirAssessmentSettings.assessmentId = createdCompressedAir.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockCompressedAirAssessmentSettings));

  MockMotorInventory.directoryId = dirId;
  let motorInventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(MockMotorInventory));
  delete MockPsatSettings.directoryId;
  delete MockPsatSettings.assessmentId;
  MockPsatSettings.assessmentId = motorInventory.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));

  MockPumpInventory.directoryId = dirId;
  let pumpInventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(MockPumpInventory));
  delete MockPsatSettings.directoryId;
  delete MockPsatSettings.assessmentId;
  MockPsatSettings.assessmentId = pumpInventory.id;
  await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));

  let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
  let settings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
  let calculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators());
  let inventoryItems: InventoryItem[] = await firstValueFrom(this.inventoryDbService.getAllInventory());
  this.assessmentDbService.setAll(assessments);
  this.settingsDbService.setAll(settings);
  this.calculatorDbService.setAll(calculators);
  this.inventoryDbService.setAll(inventoryItems);
  this.hideResetSystemSettingsModal();
}

  async resetAllUserAssessments() {
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
    await firstValueFrom(this.gasLoadDbService.clearGasLoadChargeMaterial());
    await firstValueFrom(this.atmosphereDbService.clearAtmosphereSpecificHeat());
    await firstValueFrom(this.flueGasMaterialDbService.clearFlueGasMaterials());
    await firstValueFrom(this.liquidLoadMaterialDbService.clearLiquidLoadChargeMaterial());
    await firstValueFrom(this.solidLiquidMaterialDbService.clearSolidLiquidFlueGasMaterials());
    await firstValueFrom(this.solidLoadMaterialDbService.clearSolidLoadChargeMaterial());
    await firstValueFrom(this.wallLossesSurfaceDbService.clearWallLossesSurface());
    this.hideResetSystemSettingsModal();
  }

  async resetAllData() {
    try {
      this.dbService.deleteDatabase()
        .pipe(
          catchError(err => {
            throw new Error(`Database error`);
          })
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
    // TODO if not in electron, do location.reload()
    this.coreService.relaunchApp();
  }


}

export interface DirectoryDataIds {
  assessments: Array<number>, 
  settings: Array<number>, 
  calculators: Array<number>
}