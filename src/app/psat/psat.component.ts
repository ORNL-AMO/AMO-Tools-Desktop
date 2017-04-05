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
  currentTab: number = 1;

  showDetailedReport: boolean = false;

  saveClicked: boolean = false;
  adjustment: PSAT;
  currentField: string = 'default';

  constructor(private location: Location, private assessmentService: AssessmentService, private formBuilder: FormBuilder, private psatService: PsatService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();

  }

  changeTab($event) {
    this.currentTab = $event;
    //wizard steps
    if (this.currentTab > 4) {
      this.panelView = 'data-panel';
    }
    //assessment tabs show help panel
    else {
      this.panelView = 'help-panel';
    }
    //System curve hides panel
    if (this.currentTab == 6) {
      this.isPanelOpen = false;
    }
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
    this.save();
    this.currentTab++;
    if (this.currentTab > 4) {
      this.panelView = 'data-panel';
    } else {
      this.panelView = 'help-panel';
    }
  }

  close() {
    this.location.back();
  }

  goBack() {
    this.currentTab--;
    if (this.currentTab > 4) {
      this.panelView = 'data-panel';
    } else {
      this.panelView = 'help-panel';
    }
  }

  showReport() {
    this.showDetailedReport = true;
  }

  closeReport() {
    this.showDetailedReport = false;
  }

  saveAdjustment() {
    this.saveClicked = !this.saveClicked;
  }

  save() {

    this.assessmentService.setWorkingAssessment(this.assessment);
  }

  exportData() {
    //TODO: Logic for exporting assessment
  }

}
