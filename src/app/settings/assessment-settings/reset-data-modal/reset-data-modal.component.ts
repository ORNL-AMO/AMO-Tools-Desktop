import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
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
  constructor(private dashboardService: DashboardService, private calculatorDbService: CalculatorDbService, private coreService: CoreService, private directoryDbService: DirectoryDbService, private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private assessmentDbService: AssessmentDbService,
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
    this.resetSystemSettingsModal.hide();
    this.dashboardService.updateDashboardData.next(true);
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

  resetSystemSettingsAccept() {
    this.deleting = true;
    //independent of indexed db
    if (this.resetCustomMaterials) {
      this.resetFactoryCustomMaterials();
    }
    //reset all data if resetting user assessments
    if (this.resetUserAssessments) {
      this.resetFactoryUserAssessments();
    } else {
      //reset settings
      if (this.resetAppSettings) {
        this.resetFactorySystemSettings();
      }
      //reset just examples
      if (this.resetExampleAssessments) {
        this.resetFactoryExampleAssessments();
      }
      setTimeout(() => {
        this.setAllDbData();
      }, 1500);
    }
  }

  resetFactorySystemSettings() {
    let tmpSettings: Settings = JSON.parse(JSON.stringify(MockPhastSettings));
    tmpSettings.directoryId = 1;
    tmpSettings.id = 1;
    tmpSettings.disableDashboardTutorial = this.settingsDbService.globalSettings.disableDashboardTutorial;
    tmpSettings.disablePhastAssessmentTutorial = this.settingsDbService.globalSettings.disablePhastAssessmentTutorial;
    tmpSettings.disablePhastReportTutorial = this.settingsDbService.globalSettings.disablePhastReportTutorial;
    tmpSettings.disablePhastSetupTutorial = this.settingsDbService.globalSettings.disablePhastSetupTutorial;
    tmpSettings.disablePsatAssessmentTutorial = this.settingsDbService.globalSettings.disablePsatAssessmentTutorial;
    tmpSettings.disablePsatReportTutorial = this.settingsDbService.globalSettings.disablePsatReportTutorial;
    tmpSettings.disablePsatSetupTutorial = this.settingsDbService.globalSettings.disablePsatSetupTutorial;
    tmpSettings.disableTutorial = this.settingsDbService.globalSettings.disableTutorial;
    tmpSettings.printAll = this.settingsDbService.globalSettings.printAll;
    delete tmpSettings.facilityInfo;
    this.indexedDbService.putSettings(tmpSettings).then(() => {
      this.settingsDbService.setAll().then(() => {
      });
    });
  }

  resetFactoryExampleAssessments() {
    let exampleDirectory: Directory = this.directoryDbService.getExample();
    if (exampleDirectory) {
      //example directory exists
      //create assessments
      this.createExampleAssessments(exampleDirectory.id);
    } else {
      //example directory doesn't exists
      //create example directory
      let tmpDirectory: Directory = {
        name: 'Examples',
        createdDate: new Date(),
        modifiedDate: new Date(),
        parentDirectoryId: 1,
        isExample: true
      };
      //create example directory
      this.indexedDbService.addDirectory(tmpDirectory).then(dirId => {
        //add example settings
        let tmpSettings: Settings = JSON.parse(JSON.stringify(MockPhastSettings));
        tmpSettings.directoryId = dirId;
        delete tmpSettings.facilityInfo;
        this.indexedDbService.addSettings(tmpSettings).then(() => {
          //create assessments
          this.createExampleAssessments(dirId);
        });
      });
    }
  }

  createExampleAssessments(id: number) {
    //check examples exists
    //psat
    let psatExample: Assessment = this.assessmentDbService.getPsatExample();
    if (psatExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(psatExample.id).then(() => {
        //create
        this.createPsatExample(id);
      });
    } else {
      this.createPsatExample(id);
    }
    //fsat
    let fsatExample: Assessment = this.assessmentDbService.getFsatExample();
    if (fsatExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(fsatExample.id).then(() => {
        //create
        this.createFsatExample(id);
      });
    } else {
      this.createFsatExample(id);
    }
    // Waste Water
    let wasteWaterExample: Assessment = this.assessmentDbService.getWasteWaterExample();
    if (wasteWaterExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(wasteWaterExample.id).then(() => {
        //create
        this.createWasteWaterExample(id);
      });
    } else {
      this.createWasteWaterExample(id);
    }
    //phast
    let phastExample: Assessment = this.assessmentDbService.getPhastExample();
    if (phastExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(phastExample.id).then(() => {
        //create
        this.createPhastExample(id);
      });
    } else {
      //create
      this.createPhastExample(id);
    }
    //ssmt
    let ssmtExample: Assessment = this.assessmentDbService.getSsmtExample();
    if (ssmtExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(ssmtExample.id).then(() => {
        //create
        this.createSsmtExample(id);
      });
    } else {
      //create
      this.createSsmtExample(id);
    }

    //treasureHunt
    let treasureHuntExample: Assessment = this.assessmentDbService.getTreasureHuntExample();
    if (treasureHuntExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(treasureHuntExample.id).then(() => {
        //create
        this.createTreasureHuntExample(id);
      });
    } else {
      //create
      this.createTreasureHuntExample(id);
    }

    //motorInventory
    let motorInventoryExample: InventoryItem = this.inventoryDbService.getMotorInventoryExample();
    if (motorInventoryExample) {
      //exists 
      //delete
      this.indexedDbService.deleteInventoryItem(motorInventoryExample.id).then(() => {
        this.createMotorInventoryExample(id);
      })
    } else {
      this.createMotorInventoryExample(id);
    }

  }

  createPhastExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockPhast.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockPhast).then((mockPhastId) => {
        delete MockPhastSettings.directoryId;
        MockPhastSettings.assessmentId = mockPhastId;
        //add settings
        this.indexedDbService.addSettings(MockPhastSettings).then(() => {
          resolve(true);
        });
      });
    });
  }

  createPsatExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockPsat.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockPsat).then((assessmentId) => {
        MockPsatSettings.assessmentId = assessmentId;
        MockPsatSettings.facilityInfo.date = new Date().toDateString();
        //add settings
        this.indexedDbService.addSettings(MockPsatSettings).then(() => {
          //add psat calcs
          MockPsatCalculator.assessmentId = assessmentId;
          this.indexedDbService.addCalculator(MockPsatCalculator).then(() => {
            resolve(true);
          });
        });
      });
    });
  }

  createFsatExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockFsat.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockFsat).then(assessmentId => {
        MockFsatSettings.assessmentId = assessmentId;
        MockFsatSettings.facilityInfo.date = new Date().toDateString();
        //add settings
        this.indexedDbService.addSettings(MockFsatSettings).then(() => {
          resolve(true);
        });
      });
    });
  }

  createWasteWaterExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockWasteWater.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockWasteWater).then(assessmentId => {
        MockWasteWaterSettings.assessmentId = assessmentId;
        MockWasteWaterSettings.facilityInfo.date = new Date().toDateString();
        //add settings
        this.indexedDbService.addSettings(MockWasteWaterSettings).then(() => {
          resolve(true);
        });
      });
    });
  }
  
  createSsmtExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockSsmt.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockSsmt).then(assessmentId => {
        MockSsmtSettings.assessmentId = assessmentId;
        //add settings
        this.indexedDbService.addSettings(MockSsmtSettings).then(() => {
          resolve(true);
        });
      });
    });
  }

  createTreasureHuntExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockTreasureHunt.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockTreasureHunt).then(assessmentId => {
        MockTreasureHuntSettings.assessmentId = assessmentId;
        //add settings
        this.indexedDbService.addSettings(MockTreasureHuntSettings).then(() => {
          resolve(true);
        });
      });
    });
  }

  createMotorInventoryExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockMotorInventory.directoryId = dirId;
      //add example
      this.indexedDbService.addInventoryItem(MockMotorInventory).then((mockInventoryId) => {
        delete MockPsatSettings.directoryId;
        delete MockPsatSettings.assessmentId;
        MockPsatSettings.inventoryId = mockInventoryId;
        //add settings
        this.indexedDbService.addSettings(MockPsatSettings).then(() => {
          resolve(true);
        });
      });
    });
  }

  resetFactoryUserAssessments() {
    //reset entire Db
    this.indexedDbService.deleteDb().then(
      results => {
        this.indexedDbService.db = this.indexedDbService.initDb().then(() => {
          this.coreService.createDirectory().then(() => {
            //after dir settings add check to see if we want to reset settings or keep existing
            if (!this.resetAppSettings) {
              //keep existing
              this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
                this.coreService.createExamples().then(() => {
                  this.coreService.createDirectorySettings().then(() => {
                    this.setAllDbData();
                  });
                });
              });
            } else {
              //use reset settings
              this.coreService.createExamples().then(() => {
                this.coreService.createDirectorySettings().then(() => {
                  this.setAllDbData();
                });
              });
            }
          });
        });
      });
  }

  setAllDbData() {
    //after resetting data initialize db services
    this.directoryDbService.setAll().then(() => {
      this.assessmentDbService.setAll().then(() => {
        this.settingsDbService.setAll().then(() => {
          this.calculatorDbService.setAll().then(() => {
            this.inventoryDbService.setAll().then(() => {
              this.dashboardService.updateDashboardData.next(true);
              this.hideResetSystemSettingsModal();
            })
          });
        });
      });
    });
  }

  resetFactoryCustomMaterials() {
    this.indexedDbService.clearGasLoadChargeMaterial();
    this.indexedDbService.clearAtmosphereSpecificHeat();
    this.indexedDbService.clearFlueGasMaterials();
    this.indexedDbService.clearLiquidLoadChargeMaterial();
    this.indexedDbService.clearSolidLiquidFlueGasMaterials();
    this.indexedDbService.clearSolidLoadChargeMaterial();
    this.indexedDbService.clearWallLossesSurface();
  }
}
