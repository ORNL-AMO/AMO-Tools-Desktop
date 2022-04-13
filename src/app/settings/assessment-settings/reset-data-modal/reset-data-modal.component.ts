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

  hideResetSystemSettingsModal() {
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

  async resetSystemSettingsAccept() {
    this.deleting = true;
    if (this.resetCustomMaterials) {
      console.log('RESET CUSTOM MATERIALS')
      this.resetFactoryCustomMaterials();

    }

    if (this.resetAll) {
      console.log('RESET ALL DATA')

      this.resetAllData();
    } else if (this.resetUserAssessments) {
      console.log('RESET USER ASSESSMENTS')
      this.resetAllUserAssessments();
    } else {
      if (this.resetAppSettings) {
      console.log('RESET SETTINGS')
        this.resetFactorySystemSettings();
      }
      if (this.resetExampleAssessments) {
      console.log('RESET EXAMPLES')
        this.resetFactoryExampleAssessments();
      }
    }
  }

//   // needs help
//   async resetSystemSettingsAccept() {
//     this.deleting = true;
//     if (this.resetCustomMaterials) {
//       this.resetFactoryCustomMaterials();
//       console.log('RESET CUSTOM MATERIALS')
//     }
//     if (this.resetAll) {
//       this.resetAllData();
//       console.log('RESET ALL DATA')
//     }
//     if (this.resetUserAssessments) {
//       console.log('RESET USER ASSESSMENTS')
//       this.resetAllUserAssessments();
//     }
//     if (this.resetAppSettings) {
//       console.log('RESET SETTINGS')
//       this.resetFactorySystemSettings();
//     }
//     if (this.resetExampleAssessments) {
//       console.log('RESET EXAMPLES')
//       this.resetFactoryExampleAssessments();
//     }
// }

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

//   async resetAllExampleAssessments(dirId: number) {
//     // TODO - not updating assessment/dirs correctly after reset 
//     // this method should resolve all through forkjoin or subscribe
//     let psatExample: Assessment = this.assessmentDbService.getExample('PSAT');
//     MockPsatSettings.facilityInfo.date = new Date().toDateString();
//     this.resetExampleAssessment(psatExample, MockPsat, MockPsatSettings, dirId, MockPsatCalculator);

//     MockFsatSettings.facilityInfo.date = new Date().toDateString();
//     let fsatExample: Assessment = this.assessmentDbService.getExample('FSAT');
//     this.resetExampleAssessment(fsatExample, MockFsat, MockFsatSettings, dirId);

//     MockWasteWaterSettings.facilityInfo.date = new Date().toDateString();
//     let wasteWaterExample: Assessment = this.assessmentDbService.getExample('WasteWater');
//     this.resetExampleAssessment(wasteWaterExample, MockWasteWater, MockWasteWaterSettings, dirId);

//     let phastExample: Assessment = this.assessmentDbService.getExample('PHAST');
//     if (phastExample) {
//       await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(phastExample.id));
//     }
//     this.createPhastExample(dirId);

//     let ssmtExample: Assessment = this.assessmentDbService.getExample('SSMT');
//     this.resetExampleAssessment(ssmtExample, MockSsmt, MockSsmtSettings, dirId);

//     let treasureHuntExample: Assessment = this.assessmentDbService.getExample('TreasureHunt');
//     this.resetExampleAssessment(treasureHuntExample, MockTreasureHunt, MockTreasureHuntSettings, dirId);

//     let compressedAirAssessmentExample: Assessment = this.assessmentDbService.getExample('CompressedAir');
//     this.resetExampleAssessment(compressedAirAssessmentExample, MockCompressedAirAssessment, MockCompressedAirAssessmentSettings, dirId);
  
//     let motorInventoryExample: InventoryItem = this.inventoryDbService.getMotorInventoryExample();
//     if (motorInventoryExample) {
//       await firstValueFrom(this.inventoryDbService.deleteByIdWithObservable(motorInventoryExample.id));
//     } 
//     this.createMotorInventoryExample(dirId);

//     let updatedAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
//     this.assessmentDbService.setAll(updatedAssessments);
//     console.log('updatedAssessments', updatedAssessments);


//     this.hideResetSystemSettingsModal();
//   }

getAssessmentsAndDataIds(isExampleDirectory: boolean = false): DirectoryDataIds {
  let assessmentsIds: Array<number> = [];
  let settingsIds: Array<number> = [];
  let calculatorIds: Array<number> = [];
  for (let index: number = 0; index < this.assessmentDbService.allAssessments.length; index++) {
    let assessment: Assessment = this.assessmentDbService.allAssessments[index];
    if (isExampleDirectory && assessment.isExample) {
      assessmentsIds.push(assessment.id);
      settingsIds.push(this.settingsDbService.allSettings.find(settings => { return settings.assessmentId == assessment.id }).id);
      let assessmentCalculator = this.calculatorDbService.allCalculators.find(calculator => { return calculator.assessmentId == assessment.id });
      if (assessmentCalculator) {
        calculatorIds.push(assessmentCalculator.id);
      }
    } else if (!isExampleDirectory && !assessment.isExample) {
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
  // extract for reset method
  let directoryDataIds: DirectoryDataIds = this.getAssessmentsAndDataIds(true);
  let exampleInventoryId: number = this.inventoryDbService.allInventoryItems.find(item => { return item.directoryId == dirId && item.isExample}).id;
  let allAssessments: Array<Assessment[]> = await firstValueFrom(this.assessmentDbService.bulkDeleteWithObservable(directoryDataIds.assessments));
  let allSettings: Array<Settings[]> = await firstValueFrom(this.settingsDbService.bulkDeleteWithObservable(directoryDataIds.settings));
  let allCalculators: Array<Calculator[]> = await firstValueFrom(this.calculatorDbService.bulkDeleteWithObservable(directoryDataIds.calculators));
  let allInventoryItems: Array<InventoryItem> = await firstValueFrom(this.inventoryDbService.deleteByIdWithObservable(exampleInventoryId));
  this.assessmentDbService.setAll(allAssessments[0]);
  this.inventoryDbService.setAll(allInventoryItems);
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
  let inventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(MockMotorInventory));
  delete MockPsatSettings.directoryId;
  delete MockPsatSettings.assessmentId;
  MockPsatSettings.assessmentId = inventory.id;
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

  // async resetExampleAssessment(assessment: Assessment, mockAssessment: Assessment, mockSettings: Settings, dirId: number, calculator?: Calculator) {
  //   console.log(assessment, mockAssessment, mockSettings, dirId);
  //   console.log('assessment id', assessment.id);
  //   console.log('asessnebt,dir id', assessment.directoryId);
  //   if (assessment) {
  //     console.log('assessment exists, delete id', assessment.id);
  //     let remainingAssessments = await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(assessment.id));
  //     console.log('remaining assessments', remainingAssessments);
  //     await this.createExample(mockAssessment, mockSettings, dirId, calculator);
  //   } else {
  //     await this.createExample(mockAssessment, mockSettings, dirId, calculator);
  //   }
  // }

  // async createExample(MockAssessment: Assessment, mockSettings: Settings, dirId: number, calculator?: Calculator) {
  //   MockAssessment.directoryId = dirId;
  //   let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockAssessment));
  //   mockSettings.assessmentId = createdAssessment.id;
  //   await firstValueFrom(this.settingsDbService.addWithObservable(mockSettings));
  //   if (calculator) {
  //     calculator.assessmentId = createdAssessment.id;
  //     await firstValueFrom(this.calculatorDbService.addWithObservable(calculator));
  //   }
  // }

  // async createPhastExample(dirId: number) {
  //   MockPhast.directoryId = dirId;
  //   let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(MockPhast));
  //   delete MockPhastSettings.directoryId;
  //   MockPhastSettings.assessmentId = createdAssessment.id;
  //   await firstValueFrom(this.settingsDbService.addWithObservable(MockPhastSettings));
  // }

  // async createMotorInventoryExample(dirId: number) {
  //   MockMotorInventory.directoryId = dirId;
  //   let inventory: InventoryItem = await firstValueFrom(this.inventoryDbService.addWithObservable(MockMotorInventory));
  //   delete MockPsatSettings.directoryId;
  //   delete MockPsatSettings.assessmentId;
  //   MockPsatSettings.assessmentId = inventory.id;
  //   await firstValueFrom(this.settingsDbService.addWithObservable(MockPsatSettings));
  // }

  async resetAllUserAssessments() {
    let directoryDataIds: DirectoryDataIds = this.getAssessmentsAndDataIds();
    console.log(directoryDataIds);
    let assessments: Array<Assessment[]> = await firstValueFrom(this.assessmentDbService.bulkDeleteWithObservable(directoryDataIds.assessments));
    let settings: Array<Settings[]> = await firstValueFrom(this.settingsDbService.bulkDeleteWithObservable(directoryDataIds.settings));
    let calculators: Array<Calculator[]> = await firstValueFrom(this.calculatorDbService.bulkDeleteWithObservable(directoryDataIds.calculators))
 
    this.assessmentDbService.setAll(assessments[0]);
    this.calculatorDbService.setAll(calculators[0]);
    this.settingsDbService.setAll(settings[0]);
    this.hideResetSystemSettingsModal();


    // let resetActions: Array<Observable<Assessment | Settings | Calculator>> = [
    //       this.assessmentDbService.bulkDeleteWithObservable(resetAssessmentsIds),
    //       this.settingsDbService.bulkDeleteWithObservable(resetSettingsIds),
    //       this.calculatorDbService.bulkDeleteWithObservable(resetCalculatorIds),
    //   ];
    //   console.log('user assessment delete ids', resetAssessmentsIds, resetSettingsIds, resetCalculatorIds);
    // forkJoin(
    //       resetActions
    //     ).subscribe((completedActions: Array<Assessment | Settings | Calculator>) => {
    //       console.log('All user items deleted', completedActions);
    //       this.calculatorDbService.setAll(completedActions[0]);
    //       this.assessmentDbService.setAll();
    //       this.settingsDbService.setAll();
    //       this.hideResetSystemSettingsModal();
    //     }); 
  }

  // setAllDbData() {
  //   this.coreService.getAllAppData().subscribe(initializedData => {
  //     console.log('reset-data-modal.component data reset', initializedData);
  //     this.directoryDbService.setAll(initializedData.directories);
  //     this.settingsDbService.setAll(initializedData.settings);
  //     this.assessmentDbService.setAll(initializedData.assessments);
  //     this.calculatorDbService.setAll(initializedData.calculators);
  //     this.inventoryDbService.setAll(initializedData.inventoryItems);
  //     this.hideResetSystemSettingsModal();
  //   });
  // }

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
    // this.coreService.relaunchApp();
  }


}

export interface DirectoryDataIds {
  assessments: Array<number>, 
  settings: Array<number>, 
  calculators: Array<number>
}