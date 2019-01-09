import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Assessment } from '../shared/models/assessment';
import { FsatService } from './fsat.service';
import { Settings } from '../shared/models/settings';
import { SettingsService } from '../settings/settings.service';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { Directory } from '../shared/models/directory';
import { Subscription } from 'rxjs';
import { FSAT, Modification, BaseGasDensity, FanMotor, FanSetup, FieldData, FsatOutput } from '../shared/models/fans';
import * as _ from 'lodash';
import { CompareService } from './compare.service';
import { AssessmentService } from '../assessment/assessment.service';
import { FsatFluidService } from './fsat-fluid/fsat-fluid.service';
import { FanMotorService } from './fan-motor/fan-motor.service';
import { FanFieldDataService } from './fan-field-data/fan-field-data.service';
import { FanSetupService } from './fan-setup/fan-setup.service';
import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';

@Component({
  selector: 'app-fsat',
  templateUrl: './fsat.component.html',
  styleUrls: ['./fsat.component.css']
})
export class FsatComponent implements OnInit {
  @ViewChild('changeModificationModal') public changeModificationModal: ModalDirective;

  @ViewChild('fsat203Modal') public fsat203Modal: ModalDirective;
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;

  @ViewChild('addNewModal') public addNewModal: ModalDirective;
  containerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  stepTabs: Array<string> = [
    'system-basics',
    'fsat-fluid',
    'fan-setup',
    'fan-motor',
    'fan-field-data'
  ];

  _fsat: FSAT;
  assessment: Assessment;
  mainTab: string;
  stepTab: string;
  stepTabIndex: number;
  settings: Settings;
  isAssessmentSettings: boolean;
  assessmentTab: string;
  mainTabSub: Subscription;
  stepTabSub: Subscription;
  assessmentTabSub: Subscription;
  modificationExists: boolean;
  modificationIndex: number;
  selectedModSubscription: Subscription;
  addNewSub: Subscription;
  showAdd: boolean;
  isModalOpen: boolean;
  openModSub: Subscription;
  modalOpenSubscription: Subscription;
  calcTab: string;
  calcTabSubscription: Subscription;


  fsatOptions: Array<any>;
  fsatOptionsLength: number;
  fsat1: FSAT;
  fsat2: FSAT;
  exploreOppsToast: boolean = false;

  constructor(private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
    private fsatService: FsatService,
    private settingsService: SettingsService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private compareService: CompareService,
    private assessmentService: AssessmentService,
    private fsatFluidService: FsatFluidService,
    private fanMotorService: FanMotorService,
    private fanFieldDataService: FanFieldDataService,
    private fanSetupService: FanSetupService,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private cd: ChangeDetectorRef) {
    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this._fsat = (JSON.parse(JSON.stringify(this.assessment.fsat)));
        if (this._fsat.modifications) {
          if (this._fsat.modifications.length != 0) {
            this.modificationExists = true;
            this.modificationIndex = 0;
            this.compareService.setCompareVals(this._fsat, 0);
          } else {
            this.modificationExists = false;
            this.compareService.setCompareVals(this._fsat);
          }
        } else {
          this._fsat.modifications = new Array<Modification>();
          this.modificationExists = false;
          this.compareService.setCompareVals(this._fsat);
        }
        this.getSettings();
        this.initSankeyList();
        let tmpTab = this.assessmentService.getTab();
        if (tmpTab) {
          this.fsatService.mainTab.next(tmpTab);
        }
      })
    })
    this.mainTabSub = this.fsatService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
      this.checkTutorials();
    })
    this.stepTabSub = this.fsatService.stepTab.subscribe(val => {
      this.stepTab = val;
      this.stepTabIndex = _.findIndex(this.stepTabs, function (tab) { return tab == val });
      this.getContainerHeight();
    })
    this.assessmentTabSub = this.fsatService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
      this.getContainerHeight();
    })

    this.addNewSub = this.fsatService.openNewModal.subscribe(val => {
      this.showAdd = val;
      if (val) {
        this.showAddNewModal();
      }
    })
    this.openModSub = this.fsatService.openModificationModal.subscribe(val => {
      if (val) {
        this.selectModificationModal()
      }
    })
    this.selectedModSubscription = this.compareService.selectedModification.subscribe(mod => {
      if (mod && this._fsat) {
        this.modificationIndex = _.findIndex(this._fsat.modifications, (val) => {
          return val.fsat.name == mod.name
        })
      } else {
        this.modificationIndex = undefined;
      }
    })

    this.modalOpenSubscription = this.fsatService.modalOpen.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    })

    this.calcTabSubscription = this.fsatService.calculatorTab.subscribe(val => {
      this.calcTab = val;
    })

  }

  ngOnDestroy() {
    this.compareService.baselineFSAT = undefined;
    this.compareService.modifiedFSAT = undefined;
    this.compareService.selectedModification.next(undefined);
    this.mainTabSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.stepTabSub.unsubscribe();
    this.openModSub.unsubscribe();
    this.selectedModSubscription.unsubscribe();
    this.addNewSub.unsubscribe();
    this.fsatService.initData();
    this.modalOpenSubscription.unsubscribe();
    this.calcTabSubscription.unsubscribe();
  }
  ngAfterViewInit() {
    this.disclaimerToast();
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  checkTutorials() {
    if (this.mainTab == 'system-setup') {
      if (!this.settingsDbService.globalSettings.disableFsatSetupTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('fsat-system-setup');
      }
    } else if (this.mainTab == 'assessment') {
      if (!this.settingsDbService.globalSettings.disableFsatAssessmentTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('fsat-assessment-tutorial');
      }
    } else if (this.mainTab == 'report') {
      if (!this.settingsDbService.globalSettings.disableFsatReportTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('fsat-report-tutorial');
      }
    }
  }

  initSankeyList() {
    this.fsatOptions = new Array<any>();
    this.fsatOptions.push({ name: 'Baseline', fsat: this._fsat });
    this.fsat1 = this.fsatOptions[0];
    if (this._fsat.modifications) {
      this._fsat.modifications.forEach(mod => {
        this.fsatOptions.push({ name: mod.fsat.name, fsat: mod.fsat });
      });
      this.fsat2 = this.fsatOptions[1];
    }
    this.fsatOptionsLength = this.fsatOptions.length;
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

  saveSettings(newSettings: Settings) {
    this.settings = newSettings;
    //TODO:implement saving settings
    if (this.isAssessmentSettings) {
      this.indexedDbService.putSettings(this.settings).then(() => {
        this.settingsDbService.setAll().then(() => {
        });
      })
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
            // this.addToast('Settings Saved');
            this.getSettings();
          })
        })
    }
    else {
      //if no settings for directory check parent directory
      let tmpDir: Directory = this.directoryDbService.getById(parentId);
      this.getParentDirectorySettings(tmpDir.parentDirectoryId);
    }
  }

  show203Modal() {
    this.fsat203Modal.show();
  }

  hide203Modal() {
    this.fsat203Modal.hide();
  }

  showAddNewModal() {
    //this.isModalOpen = true;
    this.addNewModal.show();
  }
  closeAddNewModal() {
    //this.isModalOpen = false;
    this.fsatService.openNewModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(mod: Modification) {
    this._fsat.modifications.push(mod);
    this.compareService.setCompareVals(this._fsat, this._fsat.modifications.length - 1);
    this.save();
    this.closeAddNewModal();
  }
  saveGasDensity(newDensity: BaseGasDensity) {
    this._fsat.baseGasDensity = newDensity;
    this.save();
  }

  saveFanMotor(newFanMotor: FanMotor) {
    this._fsat.fanMotor = newFanMotor;
    this.save();
  }

  saveFanSetup(newFanSetup: FanSetup) {
    this._fsat.fanSetup = newFanSetup;
    this.save();
  }

  saveFieldData(newFieldData: FieldData) {
    this._fsat.fieldData = newFieldData;
    this.saveFsat(this._fsat);
    // this.save();
  }

  saveFsat(newFsat: FSAT) {
    this._fsat = newFsat;
    this.save();
  }

  save() {
    if (this._fsat.modifications) {
      if (this._fsat.modifications.length == 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
      }
    } else {
      this.modificationExists = false;
    }
    this.compareService.setCompareVals(this._fsat, this.modificationIndex);
    this._fsat.setupDone = this.checkSetupDone(this._fsat);
    this.assessment.fsat = (JSON.parse(JSON.stringify(this._fsat)));
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        this.fsatService.updateData.next(true);
      })
    })
  }

  checkSetupDone(fsat: FSAT): boolean {
    return this.fsatService.checkValid(fsat, true);
  }

  selectModificationModal() {
    this.isModalOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.isModalOpen = false;
    this.fsatService.openModificationModal.next(false);
    this.changeModificationModal.hide();
    this.fsatService.updateData.next(true);
  }

  getCanContinue() {
    if (this.stepTab == 'system-basics') {
      return true;
    } else if (this.stepTab == 'fsat-fluid') {
      let isValid: boolean = this.fsatFluidService.isFanFluidValid(this._fsat.baseGasDensity);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab == 'fan-setup') {
      let isValid: boolean = this.fanSetupService.isFanSetupValid(this._fsat.fanSetup, false);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab == 'fan-motor') {
      let isValid: boolean = this.fanMotorService.isFanMotorValid(this._fsat.fanMotor);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    } else if (this.stepTab == 'fan-field-data') {
      let isValid: boolean = this.fanFieldDataService.isFanFieldDataValid(this._fsat.fieldData);
      if (isValid) {
        return true;
      } else {
        return false;
      }
    }
  }

  continue() {
    if (this.stepTab == 'fan-field-data') {
      this.fsatService.mainTab.next('assessment');
    } else {
      let assessmentTabIndex: number = this.stepTabIndex + 1;
      let nextTab: string = this.stepTabs[assessmentTabIndex];
      this.fsatService.stepTab.next(nextTab);
    }
  }

  back() {
    if (this.stepTab != 'system-basics') {
      let assessmentTabIndex: number = this.stepTabIndex - 1;
      let nextTab: string = this.stepTabs[assessmentTabIndex];
      this.fsatService.stepTab.next(nextTab);
    }
  }

  goToReport() {
    this.fsatService.mainTab.next('report')
  }

  addNewMod() {
    let tmpModification: Modification = this.fsatService.getNewMod(this._fsat, this.settings);
    this.saveNewMod(tmpModification)
  }

  disclaimerToast() {
    let toastOptions: ToastOptions = {
      title: 'Disclaimer:',
      msg: 'Please keep in mind that this application is still in beta. Please let us know if you have any suggestions for improving our app.',
      showClose: true,
      timeout: 10000000,
      theme: 'default'
    }
    this.toastyService.info(toastOptions);
  }

  setExploreOppsToast(bool: boolean) {
    this.exploreOppsToast = bool;
    if (!this.exploreOppsToast) {
      this.toastyService.clearAll();
    }
    this.cd.detectChanges();
  }
}
