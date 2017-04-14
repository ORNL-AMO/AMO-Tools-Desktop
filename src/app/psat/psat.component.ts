import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { FormBuilder } from '@angular/forms';
import { PSAT, PsatInputs } from '../shared/models/psat';
import { PsatService } from './psat.service';
import * as _ from 'lodash';

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
    'modify-conditions',
    'system-curve',
    'achievable-efficiency',
    'motor-performance',
    'nema-energy-efficiency',
    'specific-speed',
    'results'
  ]
  tabIndex: number = 0;

  subTabs: Array<string> = [
    'system-basics',
    'pump-fluid',
    'motor',
    'field-data'
  ]

  subTabIndex: number = 0;

  showDetailedReport: boolean = false;

  saveClicked: boolean = false;
  adjustment: PSAT;
  currentField: string = 'default';
  isValid;
  canContinue;

  _psat: PSAT;
  fieldDataReady: boolean = false;
  motorReady: boolean = false;
  subTab: string = 'system-basics';

  constructor(private location: Location, private assessmentService: AssessmentService, private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
    this._psat = (JSON.parse(JSON.stringify(this.assessment.psat)));
    this.isValid = true;
    this.canContinue = true;
  }

  checkPumpFluid() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
    let tmpBool = this.psatService.isPumpFluidFormValid(tmpForm);
    return !tmpBool;
  }

  checkMotor() {
    let tmpForm = this.psatService.getFormFromPsat(this._psat.inputs);
    let tmpBool = this.psatService.isMotorFormValid(tmpForm);
    return !tmpBool;
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

  changeTab($event) {
    let tmpIndex = 0;
    this.tabs.forEach(tab => {
      if (tab == $event) {
        this.tabIndex = tmpIndex;
        this.currentTab = this.tabs[this.tabIndex];
      } else {
        tmpIndex++;
      }
    })
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

  changeField($event) {
    this.currentField = $event;
  }

  selectAdjustment($event) {
    this.adjustment = $event;
  }

  continue() {
    if (this.subTab == 'field-data') {
      this.currentTab = 'modify-conditions';
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
    this.currentTab = 'system-setup';
  }

  showReport() {
    this.showDetailedReport = true;
  }

  closeReport() {
    this.showDetailedReport = false;
  }

  toggleSave() {
    this.saveClicked = !this.saveClicked;
  }

  save() {
    this.assessment.psat = (JSON.parse(JSON.stringify(this._psat)));
    this.assessmentService.setWorkingAssessment(this.assessment);
    this.canContinue = true;
  }

  exportData() {
    //TODO: Logic for exporting assessment
  }

}
