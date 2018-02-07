import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { PSAT, PsatInputs } from '../shared/models/psat';
import { PsatService } from './psat.service';
import * as _ from 'lodash';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';
import { Settings } from '../shared/models/settings';

import { ToastyService, ToastyConfig, ToastOptions, ToastData } from 'ng2-toasty';
import { JsonToCsvService } from '../shared/json-to-csv/json-to-csv.service';
import { CompareService } from './compare.service';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
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
  ]

  psat: PSAT;
  modification: PSAT;
  psatOptions: Array<any>;
  psatOptionsLength: number;
  psat1: PSAT;
  psat2: PSAT;

  subTabIndex: number = 0;

  saveClicked: boolean = false;
  adjustment: PSAT;
  isValid;

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
    private settingsService: SettingsService) {

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
        this.isValid = true;
        this.getSettings();
      })
      let tmpTab = this.assessmentService.getTab();
      if (tmpTab) {
        this.psatService.mainTab.next(tmpTab);
      }
      this.psatService.mainTab.subscribe(val => {
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
      this.psatService.secondaryTab.subscribe(val => {
        this.currentTab = val;
        this.getContainerHeight();
      })

      this.psatService.calcTab.subscribe(val => {
        this.calcTab = val;
      })
    })
  }

  ngOnDestroy() {
    this.psatService.secondaryTab.next('explore-opportunities');
    this.psatService.mainTab.next('system-setup');
    this.compareService.baselinePSAT = undefined;
    this.compareService.modifiedPSAT = undefined;
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
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          // if(!this.settings.temperatureMeasurement){
          //   this.settings = this.settingsService.setTemperatureUnit(this.settings);
          // }
          this.isAssessmentSettings = true;
          // if (update) {
          //   this.addToast('Settings Saved');
          //   if (this.saveContinue) {
          //     this.continue(this.saveContinue)
          //   }
          // }
        } else {
          //if no settings found for assessment, check directory settings
          this.getParentDirectorySettings(this.assessment.directoryId);
        }
      }
    )
  }

  getParentDirectorySettings(parentId: number) {
    this.indexedDbService.getDirectorySettings(parentId).then(
      results => {
        if (results.length != 0) {
          let settingsForm = this.settingsService.getFormFromSettings(results[0]);
          let tmpSettings: Settings = this.settingsService.getSettingsFromForm(settingsForm);
          tmpSettings.createdDate = new Date();
          tmpSettings.modifiedDate = new Date();
          tmpSettings.assessmentId = this.assessment.id;
          //create settings for assessment
          this.indexedDbService.addSettings(tmpSettings).then(
            results => {
              this.addToast('Settings Saved');
              this.getSettings();
            })
        }
        else {
          //if no settings for directory check parent directory
          this.indexedDbService.getDirectory(parentId).then(
            results => {
              this.getParentDirectorySettings(results.parentDirectoryId);
            }
          )
        }
      })

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

  selectAdjustment($event) {
    this.adjustment = $event;
  }

  continue(bool?: boolean) {
    if (this.subTab == 'field-data') {
      this.psatService.mainTab.next('assessment');
    } else {
      this.subTabIndex++;
      this.subTab = this.subTabs[this.subTabIndex];
    }

    //if (this.subTab != 'system-basics' || bool) {
    // if (!bool) {
    //   this.save();
    // } else {
    //   this.saveContinue = false;
    // }
    //   if (this.subTab == 'field-data') {
    //     this.psatService.mainTab.next('assessment');
    //   } else {
    //     this.subTabIndex++;
    //     this.subTab = this.subTabs[this.subTabIndex];
    //   }
    // } else {
    //   this.saveContinue = true;
    //   this.toggleSave();
    // }
    this.getContainerHeight();
  }

  back(){
    if(this.mainTab == 'assessment'){
      this.psatService.mainTab.next('system-setup')
    }else{
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

  toggleSave() {
    this.saveClicked = !this.saveClicked;
  }

  save() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
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
      this._psat.modifications.forEach(mod => {
        mod.psat.inputs.load_estimation_method = this._psat.inputs.load_estimation_method;
        mod.psat.inputs.motor_field_current = this._psat.inputs.motor_field_current;
        mod.psat.inputs.motor_field_power = this._psat.inputs.motor_field_power;
        mod.psat.inputs.motor_field_voltage = this._psat.inputs.motor_field_voltage;
      })
    }

    this.assessment.psat = (JSON.parse(JSON.stringify(this._psat)));
    this.indexedDbService.putAssessment(this.assessment).then(
      results => {
        this.psatService.getResults.next(true);
      }
    )
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

}
