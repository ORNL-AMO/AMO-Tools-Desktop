import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { FormBuilder } from '@angular/forms';
import { PSAT, PsatInputs } from '../shared/models/psat';
import { PsatService } from './psat.service';
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

  subTab: string = 'system-basics';

  constructor(private location: Location, private assessmentService: AssessmentService, private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
    this._psat = (JSON.parse(JSON.stringify(this.assessment.psat)));
    this.isValid = true;
    this.canContinue = true;
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
    let tmpIndex = 0;
    this.subTabs.forEach(tab => {
      if (tab == str) {
        this.subTabIndex = tmpIndex;
        this.subTab = this.subTabs[this.subTabIndex];
      } else {
        tmpIndex++;
      }
    })
  }

  changeField($event) {
    this.currentField = $event;
  }

  toggleOpenPanel($event) {
    if (!this.isPanelOpen) {
      this.panelView = $event;
      this.isPanelOpen = true;
    } else if (this.isPanelOpen && $event != this.panelView) {
      this.panelView = $event;
    } else {
      this.isPanelOpen = false;
    }
  }

  selectAdjustment($event) {
    this.adjustment = $event;
  }

  continue() {
    console.log(this.subTabIndex);
    if (this.subTabIndex > 2) {
      this.tabIndex++;
      this.currentTab = this.tabs[this.tabIndex];
    } else if (this.subTabIndex < 3) {
      this.subTabIndex++;
      this.subTab = this.subTabs[this.subTabIndex];
    }
    this.canContinue = false;
  }

  close() {
    this.location.back();
  }

  goBack() {
    this.tabIndex--;
    this.currentTab = this.tabs[this.tabIndex];
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
    // this.continueButton.nativeElement.disabled = false;
    // console.log(this.continueButton);
    this.canContinue = true;
  }

  exportData() {
    //TODO: Logic for exporting assessment
  }

}
