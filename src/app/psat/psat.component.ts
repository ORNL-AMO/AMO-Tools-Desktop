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
  @ViewChild('saveButton') saveButton: ElementRef;
  @ViewChild('continueButton') continueButton: ElementRef;
  assessment: Assessment;

  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  currentTab: string = 'system-basics';

  //TODO update tabs
  tabs: Array<string> = [
    'system-basics',
    'pump-fluid',
    'motor',
    'field-data',
    'modify-conditions',
    'system-curve'
  ]
  tabIndex: number = 0;

  showDetailedReport: boolean = false;

  saveClicked: boolean = false;
  adjustment: PSAT;
  currentField: string = 'default';
  isValid;
  canContinue;

  _psat: PSAT;
  constructor(private location: Location, private assessmentService: AssessmentService, private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
    this._psat = (JSON.parse(JSON.stringify(this.assessment.psat)));
    this.isValid = true;
  }

  valid() {
    this.isValid = !this.isValid
  }

  disableSave() {
    this.saveButton.nativeElement.disabled = true;
    this.continueButton.nativeElement.disabled = true;
  }

  enableSave() {
    this.saveButton.nativeElement.disabled = false;
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
    this.tabIndex++;
    this.currentTab = this.tabs[this.tabIndex];
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
  }

  exportData() {
    //TODO: Logic for exporting assessment
  }

}
