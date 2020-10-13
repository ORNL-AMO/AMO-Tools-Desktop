import { Component, OnInit, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Subscription } from 'rxjs';
import { SsmtService } from './ssmt.service';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { SettingsService } from '../settings/settings.service';
import { Directory } from '../shared/models/directory';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { SSMT, Modification, BoilerInput, HeaderInput, TurbineInput, SsmtValid } from '../shared/models/steam/ssmt';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { CompareService } from './compare.service';
import * as _ from 'lodash';
import { AssessmentService } from '../dashboard/assessment.service';


@Component({
  selector: 'app-ssmt',
  templateUrl: './ssmt.component.html',
  styleUrls: ['./ssmt.component.css']
})
export class SsmtComponent implements OnInit {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('addNewModal', { static: false }) public addNewModal: ModalDirective;
  @ViewChild('changeModificationModal', { static: false }) public changeModificationModal: ModalDirective;

  stepTabs: Array<string> = [
    'system-basics',
    'operations',
    'boiler',
    'header',
    'turbine'
  ];

  containerHeight: number;
  assessment: Assessment;
  _ssmt: SSMT;
  mainTab: string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  modelTabSubscription: Subscription;
  modelTab: string;
  assessmentTabSubscription: Subscription;
  assessmentTab: string;
  isAssessmentSettings: boolean;
  settings: Settings;
  modificationExists: boolean;
  modificationIndex: number;

  addNewModificationSubscription: Subscription;
  openModificationSelectSubscription: Subscription;
  showAddModal: boolean;
  selectedModSubscription: Subscription;
  isModalOpen: boolean;
  stepTabIndex: number;
  modalOpenSubscription: Subscription;

  calcTab: string;
  calcTabSubscription: Subscription;

  saveSsmtSub: Subscription;
  modListOpen: boolean = false;
  toastData: { title: string, body: string, setTimeoutVal: number } = { title: '', body: '', setTimeoutVal: undefined };
  showToast: boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
    private ssmtService: SsmtService,
    private settingsDbService: SettingsDbService,
    private settingsService: SettingsService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private compareService: CompareService,
    private assessmentService: AssessmentService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this._ssmt = (JSON.parse(JSON.stringify(this.assessment.ssmt)));
        if (this._ssmt.modifications) {
          if (this._ssmt.modifications.length !== 0) {
            this.modificationExists = true;
            this.modificationIndex = 0;
            this.compareService.setCompareVals(this._ssmt, 0);
          } else {
            this.modificationExists = false;
            this.compareService.setCompareVals(this._ssmt);
          }
        } else {
          this._ssmt.modifications = new Array<Modification>();
          this.modificationExists = false;
          this.compareService.setCompareVals(this._ssmt);
        }

        this.getSettings();
        let tmpTab = this.assessmentService.getTab();
        if (tmpTab) {
          this.ssmtService.mainTab.next(tmpTab);
        }
      });
    });
    this.subscribeTabs();

    this.addNewModificationSubscription = this.ssmtService.openNewModificationModal.subscribe(val => {
      this.showAddModal = val;
      if (val) {
        this.showAddNewModal();
      }
    });

    this.selectedModSubscription = this.compareService.selectedModification.subscribe(mod => {
      if (mod && this._ssmt) {
        this.modificationIndex = _.findIndex(this._ssmt.modifications, (val) => {
          return val.ssmt.name === mod.name;
        });
      } else {
        this.modificationIndex = undefined;
      }
    });

    this.openModificationSelectSubscription = this.ssmtService.openModificationSelectModal.subscribe(val => {
      if (val) {
        this.selectModificationModal();
      }
    });

    this.modalOpenSubscription = this.ssmtService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.calcTabSubscription = this.ssmtService.calcTab.subscribe(val => {
      this.calcTab = val;
    });

    this.saveSsmtSub = this.ssmtService.saveSSMT.subscribe(newSSMT => {
      if (newSSMT) {
        this.saveSsmt(newSSMT);
      }
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.disclaimerToast();
      this.getContainerHeight();
    }, 100);
  }

  ngOnDestroy() {
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.modelTabSubscription.unsubscribe();
    this.assessmentTabSubscription.unsubscribe();
    this.selectedModSubscription.unsubscribe();
    this.openModificationSelectSubscription.unsubscribe();
    this.modalOpenSubscription.unsubscribe();
    this.addNewModificationSubscription.unsubscribe();
    this.ssmtService.mainTab.next('system-setup');
    this.ssmtService.stepTab.next('system-basics');
    this.ssmtService.assessmentTab.next('explore-opportunities');
    this.ssmtService.steamModelTab.next('operations');
    this.calcTabSubscription.unsubscribe();
    this.ssmtService.saveSSMT.next(undefined);
    this.saveSsmtSub.unsubscribe();
  }

  subscribeTabs() {
    this.mainTabSubscription = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.checkTutorials();
      this.getContainerHeight();
    });
    this.stepTabSubscription = this.ssmtService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.stepTabIndex = _.findIndex(this.stepTabs, function (tab) { return tab === val; });

      this.getContainerHeight();
    });
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
      this.getContainerHeight();
    });
    this.assessmentTabSubscription = this.ssmtService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
      this.getContainerHeight();
    });
  }

  saveSettings(newSettings: Settings) {
    this.settings = newSettings;
    if (this.isAssessmentSettings) {
      this.indexedDbService.putSettings(this.settings).then(() => {
        this.settingsDbService.setAll().then(() => {
        });
      });
    }
  }

  getSettings() {
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (tmpSettings) {
      this.settings = tmpSettings;
      this.isAssessmentSettings = true;
    } else {
      //if no settings found for assessment, check directory settings
      this.getParentDirectorySettings(this.assessment.directoryId);
    }
  }

  getParentDirectorySettings(parentId: number) {
    let dirSettings: Settings = this.settingsDbService.getByDirectoryId(parentId);
    if (dirSettings) {
      let settingsForm = this.settingsService.getFormFromSettings(dirSettings);
      let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
      tmpSettings.createdDate = new Date();
      tmpSettings.modifiedDate = new Date();
      tmpSettings.assessmentId = this.assessment.id;
      //create settings for assessment
      this.indexedDbService.addSettings(tmpSettings).then(
        results => {
          this.settingsDbService.setAll().then(() => {
            this.getSettings();
          });
        });
    }
    else {
      //if no settings for directory check parent directory
      let tmpDir: Directory = this.directoryDbService.getById(parentId);
      this.getParentDirectorySettings(tmpDir.parentDirectoryId);
    }
  }

  save() {
    if (this._ssmt.modifications) {
      if (this._ssmt.modifications.length === 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
      }
    } else {
      this.modificationExists = false;
    }
    this.checkSetupDone();
    this.compareService.setCompareVals(this._ssmt, this.modificationIndex);
    this.assessment.ssmt = (JSON.parse(JSON.stringify(this._ssmt)));
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        this.ssmtService.updateData.next(true);
      });
    });
  }
  
  checkSetupDone() {
    let ssmtValid: SsmtValid = this.ssmtService.checkValid(this._ssmt, this.settings);
    this._ssmt.setupDone = ssmtValid.isValid;
  }

  saveBoiler(boilerData: BoilerInput) {
    this._ssmt.boilerInput = boilerData;
    this.save();
  }

  saveHeaderData(headerInput: HeaderInput) {
    this._ssmt.headerInput = headerInput;
    this.save();
  }

  saveTurbineData(turbineData: TurbineInput) {
    this._ssmt.turbineInput = turbineData;
    this.save();
  }

  saveSetup(newSSMT: SSMT) {
    this.saveSsmt(newSSMT);
  }

  saveSsmt(newSSMT: SSMT) {
    this._ssmt = newSSMT;
    this.save();
  }

  back() {
    if (this.mainTab === 'system-setup') {
      if (this.stepTab !== 'system-basics') {
        let assessmentTabIndex: number = this.stepTabIndex - 1;
        let nextTab: string = this.stepTabs[assessmentTabIndex];
        this.ssmtService.stepTab.next(nextTab);
      }
    } else if (this.mainTab === 'assessment') {
      this.ssmtService.mainTab.next('system-setup');
    }
  }

  goToReport() {
    this.ssmtService.mainTab.next('report');
  }

  continue() {
    if (this.stepTab === 'turbine') {
      this.ssmtService.mainTab.next('assessment');
    } else {
      let assessmentTabIndex: number = this.stepTabIndex + 1;
      let nextTab: string = this.stepTabs[assessmentTabIndex];
      this.ssmtService.stepTab.next(nextTab);
    }
  }

  getCanContinue() {
    let ssmtValid: SsmtValid = this.ssmtService.checkValid(this._ssmt, this.settings);
    
    if (this.stepTab === 'operations' || this.stepTab === 'system-basics') {
      return true;
    } else if (this.stepTab === 'boiler') {
      if (ssmtValid.boilerValid && ssmtValid.operationsValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'header') {
      if (ssmtValid.boilerValid && ssmtValid.headerValid && ssmtValid.operationsValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab === 'turbine') {
      if (ssmtValid.boilerValid && ssmtValid.headerValid && ssmtValid.turbineValid && ssmtValid.operationsValid) {
        return true;
      } else {
        return false;
      }
    }
  }

  showAddNewModal() {
    this.addNewModal.show();
  }

  closeAddNewModal() {
    this.ssmtService.modalOpen.next(false);
    this.ssmtService.openNewModificationModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(modification: Modification) {
    this._ssmt.modifications.push(modification);
    this.modificationIndex = this._ssmt.modifications.length - 1;
    this.save();
    this.closeAddNewModal();
  }

  selectModificationModal() {
    this.ssmtService.modalOpen.next(true);
    this.modListOpen = true;
    this.changeModificationModal.show();
  }

  closeSelectModification() {
    this.ssmtService.modalOpen.next(false);
    this.ssmtService.openModificationSelectModal.next(false);
    this.changeModificationModal.hide();
    this.modListOpen = false;
    this.ssmtService.updateData.next(true);
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }

  disclaimerToast() {
    if (this.settingsDbService.globalSettings.disableDisclaimer != true) {
      this.toastData.title = 'Disclaimer';
      this.toastData.body = 'Please keep in mind that this application is still in beta. Let us know if you have any suggestions for improving our app.';
      this.showToast = true;
      this.cd.detectChanges();
    }
  }

  hideToast() {
    this.showToast = false;
    this.toastData = {
      title: '',
      body: '',
      setTimeoutVal: undefined
    };
    this.cd.detectChanges();
  }

  disableDisclaimer() {
    this.settingsDbService.globalSettings.disableDisclaimer = true;
    this.indexedDbService.putSettings(this.settingsDbService.globalSettings).then(() => {
      this.settingsDbService.setAll();
    });
    this.hideToast();
  }
  
  checkTutorials() {
    if (this.mainTab == 'system-setup') {
      if (!this.settingsDbService.globalSettings.disableSsmtSystemSetupTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-system-setup-tutorial');
      }
    } else if (this.mainTab == 'assessment') {
      if (!this.settingsDbService.globalSettings.disableSsmtAssessmentTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-assessment-tutorial');
      }
    } else if (this.mainTab == 'diagram') {
      if (!this.settingsDbService.globalSettings.disableSsmtDiagramTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-diagram-tutorial');
      }
    } else if (this.mainTab == 'report') {
      if (!this.settingsDbService.globalSettings.disableSsmtReportTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('ssmt-report-tutorial');
      }
    }
  }
}
