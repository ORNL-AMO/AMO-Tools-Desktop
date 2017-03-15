import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';

@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
  assessment: Assessment;

  currentTab: number = 1;
  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  constructor(private location: Location, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
  }

  changeTab($event) {
    this.currentTab = $event;
    if (this.currentTab > 2) {
      this.panelView = 'data-panel';
    }else {
      this.panelView = 'help-panel';
    }
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

  continue() {
    this.save();
    this.currentTab++;
    if (this.currentTab > 2) {
      this.panelView = 'data-panel';
    }else{
      this.panelView = 'help-panel';
    }
  }

  close() {
    this.location.back();
  }

  goBack() {
    this.currentTab--;
    if(this.currentTab > 2){
      this.panelView = 'data-panel';
    }else{
      this.panelView = 'help-panel';
    }
  }

  save() {
    //TODO: Logic for saving assessment
  }

  exportData() {
    //TODO: Logic for exporting data
  }
}
