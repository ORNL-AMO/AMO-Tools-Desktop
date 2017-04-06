import { Component, OnInit } from '@angular/core';
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
  isValid: any = {
    test: 'false'
  };
  constructor(private location: Location, private assessmentService: AssessmentService, private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
    this.isValid = false;
  }

  valid() {
    console.log(this.assessment)
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
    //wizard steps
    //if (this.currentTab > 4) {
    //   this.panelView = 'data-panel';
    //}
    //assessment tabs show help panel
    // else {
    //  this.panelView = 'help-panel';
    //}
    //System curve hides panel
    //if (this.currentTab == 6) {
    // this.isPanelOpen = false;
    //}
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
    console.log('continue')
    this.tabIndex++;
    this.currentTab = this.tabs[this.tabIndex];
    // if (this.currentTab > 4) {
    //   this.panelView = 'data-panel';
    // } else {
    //   this.panelView = 'help-panel';
    // }
  }

  close() {
    this.location.back();
  }

  goBack() {
    this.tabIndex--;
    this.currentTab = this.tabs[this.tabIndex];
    // if (this.currentTab > 4) {
    //   this.panelView = 'data-panel';
    // } else {
    //   this.panelView = 'help-panel';
    // }
  }

  showReport() {
    this.showDetailedReport = true;
  }

  closeReport() {
    this.showDetailedReport = false;
  }

  toggleSave(){
    this.saveClicked = !this.saveClicked;
  }

  save() {
    this.assessmentService.setWorkingAssessment(this.assessment);
    console.log(this.assessment);
  }

  exportData() {
    //TODO: Logic for exporting assessment
  }

}
