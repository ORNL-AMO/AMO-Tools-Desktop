import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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

@Component({
  selector: 'app-psat',
  templateUrl: './psat.component.html',
  styleUrls: ['./psat.component.css']
})
export class PsatComponent implements OnInit {
  assessment: Assessment;

  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  currentTab: string = 'system-setup';

  //TODO update tabs
  tabs: Array<string> = [
    'system-setup',
    'explore-opportunities',
    'modify-conditions',
    'system-curve',
    'achievable-efficiency',
    'motor-performance',
    'nema-energy-efficiency',
    'specific-speed',

  ]
  tabIndex: number = 0;

  subTabs: Array<string> = [
    'system-basics',
    'pump-fluid',
    'motor',
    'field-data'
  ]

  subTabIndex: number = 0;

  saveClicked: boolean = false;
  adjustment: PSAT;
  isValid;
  canContinue;

  _psat: PSAT;
  fieldDataReady: boolean = false;
  motorReady: boolean = false;
  subTab: string = 'system-basics';
  settings: Settings;
  isAssessmentSettings: boolean = false;

  emitPrint: boolean = false;
  viewingReport: boolean = false;
  tabBeforeReport: string = 'explore-opportunities';
  mainTab: string = 'system-setup';
  constructor(
    private location: Location,
    private assessmentService: AssessmentService,
    private psatService: PsatService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute,
    private toastyService: ToastyService,
    private toastyConfig: ToastyConfig,
    private jsonToCsvService: JsonToCsvService) {

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
        this.canContinue = true;
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
      })
      this.psatService.secondaryTab.subscribe(val => {
        this.currentTab = val;
      })
    })
  }


  ngOnDestroy(){
    this.psatService.secondaryTab.next('explore-opportunities');
    this.psatService.mainTab.next('system-setup');
  }

  getSettings(update?: boolean) {
    //get assessment settings
    this.indexedDbService.getAssessmentSettings(this.assessment.id).then(
      results => {
        if (results.length != 0) {
          this.settings = results[0];
          this.isAssessmentSettings = true;
          if (update) {
            this.addToast('Settings Saved');
          }
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
          this.settings = results[0];
        }
        else {
          //if no settings for directory check parent directory
          this.indexedDbService.getDirectory(parentId).then(
            results => {
              this.getParentDirectorySettings(results.parentDirectoryId);
            }
          )
        }
      }
    )
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
  }

  selectAdjustment($event) {
    this.adjustment = $event;
  }

  continue() {
    if (this.subTab == 'field-data') {
      this.psatService.mainTab.next('assessment');
    } else {
      this.subTabIndex++;
      this.subTab = this.subTabs[this.subTabIndex];
    }
    this.canContinue = false;
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

  goBack() {
    this.psatService.secondaryTab.next('system-setup');
  }

  toggleSave() {
    this.saveClicked = !this.saveClicked;
  }

  togglePrint() {
    this.emitPrint = !this.emitPrint;
  }

  save() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
    if (
      this.psatService.isPumpFluidFormValid(tmpForm) &&
      this.psatService.isMotorFormValid(tmpForm) &&
      this.psatService.isFieldDataFormValid(tmpForm)
    ) {
      this._psat.setupDone = true;
    } else {
      this._psat.setupDone = false;
    }
    this.assessment.psat = (JSON.parse(JSON.stringify(this._psat)));
    this.indexedDbService.putAssessment(this.assessment).then(
      results => {
        this.addToast('Assessment Saved');
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

}
