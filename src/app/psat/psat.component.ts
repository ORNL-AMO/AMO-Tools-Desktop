import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { PSAT, Modification } from '../shared/models/psat';
import { PsatService } from './psat.service';
import * as _ from 'lodash';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../shared/models/settings';

import { ToastyService, ToastyConfig, ToastOptions } from 'ng2-toasty';
import { JsonToCsvService } from '../shared/json-to-csv/json-to-csv.service';
import { CompareService } from './compare.service';
import { SettingsService } from '../settings/settings.service';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { Directory } from '../shared/models/directory';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { PsatTabService } from './psat-tab.service';

@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
  @ViewChild('changeModificationModal') public changeModificationModal: ModalDirective;
  @ViewChild('addNewModal') public addNewModal: ModalDirective;

  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  containerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  assessment: Assessment;

  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  currentTab: string = 'system-setup';

  tabIndex: number = 0;


  psatOptions: Array<any>;
  psatOptionsLength: number;
  psat1: PSAT;
  psat2: PSAT;

  _psat: PSAT;
  settings: Settings;
  isModalOpen: boolean = false;
  mainTab: string = 'system-setup';
  calcTab: string;
  modificationIndex: number = 0;
  selectedModSubscription: Subscription;
  addNewSub: Subscription;
  modificationExists: boolean = false;
  mainTabSub: Subscription;
  secondaryTabSub: Subscription;
  calcTabSub: Subscription;
  openModSub: Subscription;
  showAdd: boolean;
  stepTabSubscription: Subscription;
  stepTab: string;
  constructor(
    private location: Location,
    private assessmentService: AssessmentService,
    private psatService: PsatService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private jsonToCsvService: JsonToCsvService,
    private compareService: CompareService,
    private settingsService: SettingsService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private assessmentDbService: AssessmentDbService,
    private psatTabService: PsatTabService) {

    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    //this.psatService.test();
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        this._psat = (JSON.parse(JSON.stringify(this.assessment.psat)));
        if (this._psat.modifications) {
          if (this._psat.modifications.length != 0) {
            this.modificationExists = true;
            this.modificationIndex = 0;
          }
          if (this._psat.setupDone) {
            this.compareService.setCompareVals(this._psat, 0);
          }
        } else {
          this._psat.modifications = new Array();
          this.modificationExists = false;
        }
        this.getSettings();
      })
      let tmpTab = this.assessmentService.getTab();
      if (tmpTab) {
        this.psatTabService.mainTab.next(tmpTab);
      }
      this.mainTabSub = this.psatTabService.mainTab.subscribe(val => {
        this.mainTab = val;
        if (this.mainTab == 'diagram') {
          this.psatTabService.secondaryTab.next('system-curve');
        }
        else if (this.mainTab == 'assessment') {
          if (this.currentTab != 'explore-opportunities' && this.currentTab != 'modify-conditions') {
            this.psatTabService.secondaryTab.next('explore-opportunities');
          }
        }
        this.checkTutorials();
        this.getContainerHeight();
      })
      this.secondaryTabSub = this.psatTabService.secondaryTab.subscribe(val => {
        this.currentTab = val;
        this.getContainerHeight();
      })

      this.calcTabSub = this.psatTabService.calcTab.subscribe(val => {
        this.calcTab = val;
      })

      this.selectedModSubscription = this.compareService.selectedModification.subscribe(mod => {
        if (mod && this._psat) {
          this.modificationIndex = _.findIndex(this._psat.modifications, (val) => {
            return val.psat.name == mod.name
          })
        } else {
          this.modificationIndex = undefined;
        }
      })

      this.openModSub = this.compareService.openModificationModal.subscribe(val => {
        if (val) {
          this.selectModificationModal()
        }
      })

      this.addNewSub = this.compareService.openNewModal.subscribe(val => {
        this.showAdd = val;
        if (val) {
          this.showAddNewModal();
        }
      })

      this.stepTabSubscription = this.psatTabService.stepTab.subscribe(val => {
        this.stepTab = val;
      })
    })
  }

  ngOnDestroy() {
    this.compareService.baselinePSAT = undefined;
    this.compareService.modifiedPSAT = undefined;
    if (this.addNewSub) this.addNewSub.unsubscribe();
    if (this.openModSub) this.openModSub.unsubscribe();
    if (this.selectedModSubscription) this.selectedModSubscription.unsubscribe();
    if (this.calcTabSub) this.calcTabSub.unsubscribe();
    if (this.secondaryTabSub) this.secondaryTabSub.unsubscribe();
    if (this.mainTabSub) this.mainTabSub.unsubscribe();
    if (this.stepTabSubscription) this.stepTabSubscription.unsubscribe()
    this.psatTabService.secondaryTab.next('explore-opportunities');
    this.psatTabService.mainTab.next('system-setup');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
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

  checkTutorials() {
    if (this.mainTab == 'system-setup') {
      if (!this.settingsDbService.globalSettings.disablePsatSetupTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('psat-system-setup');
      }
    } else if (this.mainTab == 'assessment') {
      if (!this.settingsDbService.globalSettings.disablePsatAssessmentTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('psat-assessment-tutorial');
      }
    } else if (this.mainTab == 'report') {
      if (!this.settingsDbService.globalSettings.disablePsatReportTutorial) {
        this.assessmentService.tutorialShown = false;
        this.assessmentService.showTutorial.next('psat-report-tutorial');
      }
    }
  }

  initSankeyList() {
    this.psatOptions = new Array<any>();
    this.psatOptions.push({ name: 'Baseline', psat: this._psat });
    this.psat1 = this.psatOptions[0];
    if (this._psat.modifications) {
      this._psat.modifications.forEach(mod => {
        this.psatOptions.push({ name: mod.psat.name, psat: mod.psat });
      })
      this.psat2 = this.psatOptions[1];
      this.psatOptionsLength = this.psatOptions.length;
    }
  }


  getSettings(update?: boolean) {
    //get assessment settings
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (tmpSettings) {
      this.settings = tmpSettings;
    } else {
      //if no settings found for assessment, check directory settings
      this.getParentDirectorySettings(this.assessment.directoryId);
    }
    // this.tab1Status = this.validateSettings();
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
            this.addToast('Settings Saved');
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

  continue() {
    this.psatTabService.continue();
  }

  back() {
    this.psatTabService.back();
  }

  getCanContinue() {
    if (this.stepTab == 'system-basics') {
      return true;
    }
    else if (this.stepTab == 'pump-fluid') {
      let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
      return this.psatService.isPumpFluidFormValid(tmpForm);
    } else if (this.stepTab == 'motor') {
      let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
      return this.psatService.isMotorFormValid(tmpForm);
    } else if (this.stepTab == 'field-data') {
      let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
      return this.psatService.isFieldDataFormValid(tmpForm);
    }
  }

  close() {
    this.location.back();
  }

  save() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
    if (
      (this.psatService.isPumpFluidFormValid(tmpForm) &&
        this.psatService.isMotorFormValid(tmpForm) &&
        this.psatService.isFieldDataFormValid(tmpForm)) || this.modificationExists
    ) {
      this._psat.setupDone = true;
      this.initSankeyList();
    } else {
      this._psat.setupDone = false;
    }
    if (this._psat.modifications) {
      if (this._psat.modifications.length == 0) {
        this.modificationExists = false;
      } else {
        this.modificationExists = true;
      }
      this._psat.modifications.forEach(mod => {
        mod.psat.inputs.load_estimation_method = this._psat.inputs.load_estimation_method;
        mod.psat.inputs.motor_field_current = this._psat.inputs.motor_field_current;
        mod.psat.inputs.motor_field_power = this._psat.inputs.motor_field_power;
        mod.psat.inputs.motor_field_voltage = this._psat.inputs.motor_field_voltage;
      })
    } else {
      this.modificationExists = false;
    }
    this.compareService.setCompareVals(this._psat, this.modificationIndex)
    this.assessment.psat = (JSON.parse(JSON.stringify(this._psat)));
    this.indexedDbService.putAssessment(this.assessment).then(results => {
      this.assessmentDbService.setAll().then(() => {
        this.psatService.getResults.next(true);
      })
    })
  }

  exportData() {
    //TODO: Logic for exporting assessment
    this.jsonToCsvService.exportSinglePsat(this.assessment, this.settings);
  }


  addToast(msg: string) {
    let toastOptions: ToastOptions = {
      title: msg,
      timeout: 4000,
      showClose: true,
      theme: 'default'
    }
    this.toastyService.success(toastOptions);
  }
  goToReport() {
    this.psatTabService.mainTab.next('report');
  }

  modalOpen() {
    this.isModalOpen = true;
  }
  modalClose() {
    this.isModalOpen = false;
  }

  selectModificationModal() {
    this.isModalOpen = true;
    this.changeModificationModal.show();
  }
  closeSelectModification() {
    this.isModalOpen = false;
    this.compareService.openModificationModal.next(false);
    this.changeModificationModal.hide();
  }
  showAddNewModal() {
    this.isModalOpen = true;
    this.addNewModal.show();
  }
  closeAddNewModal() {
    this.isModalOpen = false;
    this.compareService.openNewModal.next(false);
    this.addNewModal.hide();
  }

  saveNewMod(mod: Modification) {
    this._psat.modifications.push(mod);
    this.compareService.setCompareVals(this._psat, this._psat.modifications.length - 1);
    this.save();
    this.closeAddNewModal();
  }

  addNewMod() {
    let modName: string = 'Scenario ' + (this._psat.modifications.length + 1);
    let tmpModification: Modification = {
      psat: {
        name: modName,
      },
      notes: {
        fieldDataNotes: '',
        motorNotes: '',
        pumpFluidNotes: '',
        systemBasicsNotes: ''
      },
    }
    tmpModification.psat.inputs = (JSON.parse(JSON.stringify(this._psat.inputs)));
    this.saveNewMod(tmpModification)
  }
}
