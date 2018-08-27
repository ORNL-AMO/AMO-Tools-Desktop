import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { SuiteDbService } from '../../suiteDb/suite-db.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Settings } from '../../shared/models/settings';
import { MockPhastSettings, MockPhast } from '../../core/mockPhast';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { MockPsat, MockPsatCalculator, MockPsatSettings } from '../../core/mockPsat';
import { MockFsat, MockFsatSettings } from '../../core/mockFsat';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { Directory } from '../../shared/models/directory';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-reset-data-modal',
  templateUrl: './reset-data-modal.component.html',
  styleUrls: ['./reset-data-modal.component.css']
})
export class ResetDataModalComponent implements OnInit {
  @Output('closeModal')
  closeModal = new EventEmitter<boolean>();
  @ViewChild('resetSystemSettingsModal') public resetSystemSettingsModal: ModalDirective;

  resetAll: boolean = false;
  resetAppSettings: boolean = false;
  resetExampleAssessments: boolean = false;
  resetUserAssessments: boolean = false;
  resetCustomMaterials: boolean = false;
  constructor(private suiteDbService: SuiteDbService, private directoryDbService: DirectoryDbService, private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService, private assessmentDbService: AssessmentDbService) { }

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
    if (this.resetAppSettings) {
      this.resetFactorySystemSettings();
    }
    if (this.resetExampleAssessments) {
      this.resetFactoryExampleAssessments();
    }
    if (this.resetUserAssessments) {
      this.resetFactoryUserAssessments();
    }
    if (this.resetCustomMaterials) {
      this.resetFactoryCustomMaterials();
    }

    setTimeout(() => {
      console.log('hide')
      this.hideResetSystemSettingsModal();
    },1500)
    // this.hideResetSystemSettingsModal();
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
    delete tmpSettings.facilityInfo;
    this.indexedDbService.putSettings(tmpSettings).then(() => {
      this.settingsDbService.setAll().then(() => {
        console.log('reset settings')
        // this.hideResetSystemSettingsModal();
      });
    })
  }

  resetFactoryExampleAssessments() {
    let exampleDirectory: Directory = this.directoryDbService.getExample();
    if (exampleDirectory) {
      //example directory exists
      //create assessments
      this.createExampleAssessments(exampleDirectory.id);
    } else {
      //example directory doesnt exists
      //create example directory
      let tmpDirectory: Directory = {
        name: 'Examples',
        createdDate: new Date(),
        modifiedDate: new Date(),
        parentDirectoryId: 1,
        isExample: true
      }
      //create example directory
      this.indexedDbService.addDirectory(tmpDirectory).then(dirId => {
        console.log('CREATED directory example...')
        //add example settings
        let tmpSettings: Settings = JSON.parse(JSON.stringify(MockPhastSettings));
        tmpSettings.directoryId = dirId;
        delete tmpSettings.facilityInfo;
        this.indexedDbService.addSettings(tmpSettings).then(() => {
          console.log('CREATED directory settings...')
          //create assessments
          this.createExampleAssessments(dirId);
        })
      })
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
        console.log('DELETED psat example...')
        //create
        this.createPsatExample(id);
      })
    } else {
      this.createPsatExample(id);
    }
    //fsat
    let fsatExample: Assessment = this.assessmentDbService.getFsatExample();
    if (fsatExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(fsatExample.id).then(() => {
        console.log('DELETED fsat example...')
        //create
        this.createFsatExample(id);
      })
    } else {
      this.createFsatExample(id);
    }
    //phast
    let phastExample: Assessment = this.assessmentDbService.getPhastExample();
    if (phastExample) {
      //exists
      //delete
      this.indexedDbService.deleteAssessment(phastExample.id).then(() => {
        console.log('DELETED phast example...')
        //create
        this.createPhastExample(id);
      })
    } else {
      //create
      this.createPhastExample(id);
    }

  }

  createPhastExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockPhast.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockPhast).then((mockPhastId) => {
        console.log('CREATED phast example...')
        delete MockPhastSettings.directoryId;
        MockPhastSettings.assessmentId = mockPhastId;
        //add settings
        this.indexedDbService.addSettings(MockPhastSettings).then(() => {
          console.log('CREATED phast settings...')
          resolve(true)
        });
      });
    })
  }

  createPsatExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockPsat.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockPsat).then((assessmentId) => {
        console.log('CREATED psat example...')
        MockPsatSettings.assessmentId = assessmentId;
        MockPsatSettings.facilityInfo.date = new Date().toDateString();
        //add settings
        this.indexedDbService.addSettings(MockPsatSettings).then(() => {
          console.log('CREATED psat settings...')
          //add psat calcs
          MockPsatCalculator.assessmentId = assessmentId;
          this.indexedDbService.addCalculator(MockPsatCalculator).then(() => {
            console.log('CREATED psat calculator...')
            resolve(true)
          });
        });
      });
    });
  }

  createFsatExample(dirId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      MockFsat.directoryId = dirId;
      //add example
      this.indexedDbService.addAssessment(MockFsat).then(() => {
        console.log('CREATED fsat example...')

        MockFsatSettings.assessmentId = 3;
        MockFsatSettings.facilityInfo.date = new Date().toDateString();
        //add settings
        this.indexedDbService.addSettings(MockFsatSettings).then(() => {
          console.log('CREATED fsat settings...')
          resolve(true);
        });
      });
    })
  }

  resetFactoryUserAssessments() {
    console.log('resetFactoryUserAssessments()');
  }

  resetFactoryCustomMaterials() {
    console.log('resetFactoryCustomMaterials()');
    if (this.suiteDbService.hasStarted == true && this.indexedDbService.initCustomObjects == true) {
      console.log('initCustomDbMaterials()');
      this.suiteDbService.initCustomDbMaterials();
    }
  }
}
