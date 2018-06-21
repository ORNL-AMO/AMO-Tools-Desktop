import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { PSAT, PsatInputs, Modification } from '../shared/models/psat';
import { PsatService } from './psat.service';
import * as _ from 'lodash';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../shared/models/settings';

import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { JsonToCsvService } from '../shared/json-to-csv/json-to-csv.service';
import { CompareService } from './compare.service';
import { SettingsService } from '../settings/settings.service';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { Directory } from '../shared/models/directory';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';

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

  subTabs: Array<string> = [
    'system-basics',
    'pump-fluid',
    'motor',
    'field-data'
  ];

  tab1Status: string;
  tab2Status: string;
  tab3Status: string;
  tab4Status: string;
  badge1Hover: boolean;
  badge2Hover: boolean;
  badge3Hover: boolean;
  badge4Hover: boolean;
  display1: boolean;
  display2: boolean;
  display3: boolean;
  display4: boolean;

  psat: PSAT;
  psatOptions: Array<any>;
  psatOptionsLength: number;
  psat1: PSAT;
  psat2: PSAT;

  subTabIndex: number = 0;

  isValid: boolean;

  _psat: PSAT;
  fieldDataReady: boolean = false;
  motorReady: boolean = false;
  subTab: string = 'system-basics';
  settings: Settings;
  isAssessmentSettings: boolean = false;
  isModalOpen: boolean = false;
  viewingReport: boolean = false;
  tabBeforeReport: string = 'explore-opportunities';
  mainTab: string = 'system-setup';
  calcTab: string;
  saveContinue: boolean = false;
  modificationIndex: number = 0;
  selectedModSubscription: Subscription;
  addNewSub: Subscription;
  modificationExists: boolean = false;
  mainTabSub: Subscription;
  secondaryTabSub: Subscription;
  calcTabSub: Subscription;
  openModSub: Subscription;
  showAdd: boolean;
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
    private assessmentDbService: AssessmentDbService) {

    this.toastyConfig.theme = 'bootstrap';
    this.toastyConfig.position = 'bottom-right';
    this.toastyConfig.limit = 1;
  }

  ngOnInit() {
    this.tab1Status = '';
    this.tab2Status = '';
    this.tab3Status = '';
    this.tab4Status = '';
    this.badge1Hover = false;
    this.badge2Hover = false;
    this.badge3Hover = false;
    this.badge4Hover = false;
    this.display1 = false;
    this.display2 = false;
    this.display3 = false;
    this.display4 = false;

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
        this.isValid = true;
        this.getSettings();
      })
      let tmpTab = this.assessmentService.getTab();
      if (tmpTab) {
        this.psatService.mainTab.next(tmpTab);
      }
      this.mainTabSub = this.psatService.mainTab.subscribe(val => {
        this.mainTab = val;
        if (this.mainTab == 'diagram') {
          this.psatService.secondaryTab.next('system-curve');
        }
        else if (this.mainTab == 'assessment') {
          if (this.currentTab != 'explore-opportunities' && this.currentTab != 'modify-conditions') {
            this.psatService.secondaryTab.next('explore-opportunities');
          }
        }
        this.getContainerHeight();
      })
      this.secondaryTabSub = this.psatService.secondaryTab.subscribe(val => {
        this.currentTab = val;
        this.getContainerHeight();
      })

      this.calcTabSub = this.psatService.calcTab.subscribe(val => {
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
    })
  }

  ngOnDestroy() {
    this.psatService.secondaryTab.next('explore-opportunities');
    this.psatService.mainTab.next('system-setup');
    this.compareService.baselinePSAT = undefined;
    this.compareService.modifiedPSAT = undefined;
    if (this.addNewSub) this.addNewSub.unsubscribe();
    if (this.openModSub) this.openModSub.unsubscribe();
    if (this.selectedModSubscription) this.selectedModSubscription.unsubscribe();
    if (this.calcTabSub) this.calcTabSub.unsubscribe();
    if (this.secondaryTabSub) this.secondaryTabSub.unsubscribe();
    if (this.mainTabSub) this.mainTabSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.getContainerHeight();
    }, 100);
  }

  // setCompareVal() {
  //   this.compareService.baselinePSAT = this._psat;
  //   if (this._psat.modifications) {
  //     if (this._psat.modifications) {
  //       this.compareService.modifiedPSAT = this._psat.modifications[this.modificationIndex].psat;
  //     }
  //   }
  // }
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

  validateSettings() {
    if (this.settings === undefined) {
      return 'input-error';
    }
    if (this.settings.flowMeasurement === undefined || this.settings.flowMeasurement == '') {
      return 'missing-data';
    }
    if (this.settings.language === undefined || this.settings.language == '') {
      return 'missing-data';
    }
    if (this.settings.powerMeasurement === undefined || this.settings.powerMeasurement == '') {
      return 'missing-data';
    }
    if (this.settings.pressureMeasurement === undefined || this.settings.pressureMeasurement == '') {
      return 'missing-data';
    }
    if (this.settings.temperatureMeasurement === undefined || this.settings.pressureMeasurement == '') {
      return 'missing-data';
    }
    if (this.settings.distanceMeasurement === undefined || this.settings.distanceMeasurement == '') {
      return 'missing-data';
    }
    return 'success';
  }

  getSettings(update?: boolean) {
    //get assessment settings
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (tmpSettings) {
      this.settings = tmpSettings;
      this.isAssessmentSettings = true;
    } else {
      //if no settings found for assessment, check directory settings
      this.getParentDirectorySettings(this.assessment.directoryId);
    }
    this.tab1Status = this.validateSettings();
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

  checkPumpFluid() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
    let tmpBool = this.psatService.isPumpFluidFormValid(tmpForm);
    return !tmpBool;
  }

  checkMotor() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
    //check both steps
    let tmpBoolMotor = this.psatService.isMotorFormValid(tmpForm);
    let tmpBoolPump = this.psatService.isPumpFluidFormValid(tmpForm);
    let test = tmpBoolMotor && tmpBoolPump;
    return !test;
  }

  valid() {
    this.isValid = !this.isValid
  }

  setValid() {
    this.isValid = true;
  }

  setInvalid() {
    this.isValid = false;
  }

  changeSubTab(str: string) {
    if (str == 'motor') {
      let tmpBool = this.checkPumpFluid();
      if (!tmpBool == true) {
        this.subTabIndex = _.findIndex(this.subTabs, function (tab) { return tab == str });
        this.subTab = this.subTabs[this.subTabIndex];
      }
    } else if (str == 'field-data') {
      let tmpBool = this.checkMotor();
      if (!tmpBool == true) {
        this.subTabIndex = _.findIndex(this.subTabs, function (tab) { return tab == str });
        this.subTab = this.subTabs[this.subTabIndex];
      }
    } else {
      this.subTabIndex = _.findIndex(this.subTabs, function (tab) { return tab == str });
      this.subTab = this.subTabs[this.subTabIndex];
    }
    this.getContainerHeight();
  }

  continue(bool?: boolean) {
    if (this.subTab == 'field-data') {
      this.psatService.mainTab.next('assessment');
    } else {
      this.subTabIndex++;
      this.subTab = this.subTabs[this.subTabIndex];
    }
    this.getContainerHeight();
  }

  back() {
    if (this.mainTab == 'assessment') {
      this.psatService.mainTab.next('system-setup')
    } else {
      this.subTabIndex--;
      this.subTab = this.subTabs[this.subTabIndex];
    }
  }

  getCanContinue() {
    if (this.subTab == 'system-basics') {
      return true;
    }
    else if (this.subTab == 'pump-fluid') {
      let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
      return this.psatService.isPumpFluidFormValid(tmpForm);
    } else if (this.subTab == 'motor') {
      let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
      return this.psatService.isMotorFormValid(tmpForm);
    } else if (this.subTab == 'field-data') {
      let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
      return this.psatService.isFieldDataFormValid(tmpForm);
    }
  }

  close() {
    this.location.back();
  }

  save() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);

    if (!this.psatService.isPumpFluidFormValid(tmpForm)) {
      this.tab2Status = 'missing-data';
      this.tab3Status = 'input-error';
      this.tab4Status = 'input-error';
    }
    else {
      this.tab2Status = 'success';
      if (!this.psatService.isMotorFormValid(tmpForm)) {
        this.tab3Status = 'missing-data';
        this.tab4Status = 'input-error';
      }
      else {
        this.tab3Status = 'success';
        if (!this.psatService.isFieldDataFormValid(tmpForm)) {
          this.tab4Status = 'missing-data';
        }
        else {
          this.tab4Status = 'success';
        }
      }
    }

    if (
      this.psatService.isPumpFluidFormValid(tmpForm) &&
      this.psatService.isMotorFormValid(tmpForm) &&
      this.psatService.isFieldDataFormValid(tmpForm)
    ) {
      this._psat.setupDone = true;

      //debug
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
    this.psatService.mainTab.next('report');
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


  showTooltip(num: number) {
    if (num == 1) {
      this.badge1Hover = true;
    }
    else if (num == 2) {
      this.badge2Hover = true;
    }
    else if (num == 3) {
      this.badge3Hover = true;
    }
    else if (num == 4) {
      this.badge4Hover = true;
    }

    setTimeout(() => {
      this.checkHover(num);
    }, 1000);
  }

  hideTooltip(num: number) {
    if (num == 1) {
      this.badge1Hover = false;
      this.display1 = false;
    }
    else if (num == 2) {
      this.badge2Hover = false;
      this.display2 = false;
    }
    else if (num == 3) {
      this.badge3Hover = false;
      this.display3 = false;
    }
    else if (num == 4) {
      this.badge4Hover = false;
      this.display4 = false;
    }
  }

  checkHover(num: number) {
    if (num == 1) {
      if (this.badge1Hover) {
        this.display1 = true;
      }
      else {
        this.display1 = false;
      }
    }
    else if (num == 2) {
      if (this.badge2Hover) {
        this.display2 = true;
      }
      else {
        this.display2 = false;
      }
    }
    else if (num == 3) {
      if (this.badge3Hover) {
        this.display3 = true;
      }
      else {
        this.display3 = false;
      }
    }
    else if (num == 4) {
      if (this.badge4Hover) {
        this.display4 = true;
      }
      else {
        this.display4 = false;
      }
    }
  }

}
