import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { PhastService } from './phast.service';
@Component({
  selector: 'app-phast',
  templateUrl: './phast.component.html',
  styleUrls: ['./phast.component.css']
})
export class PhastComponent implements OnInit {
  assessment: Assessment;

  currentTab: string = 'system-setup';
  panelView: string = 'help-panel';
  isPanelOpen: boolean = true;
  saveClicked: boolean = false;

  tabs: Array<string> = [
    'system-setup',
    'losses',
    'designed-energy-use',
    'aux-equipment',
    'metered-energy',
    'sankey'
  ]
  tabIndex: number = 0;
  constructor(private location: Location, private assessmentService: AssessmentService, private phastService: PhastService) { }

  ngOnInit() {
    this.assessment = this.assessmentService.getWorkingAssessment();
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

  save() {
    this.saveClicked = !this.saveClicked;
    this.assessmentService.setWorkingAssessment(this.assessment);
  }

  exportData() {
    //TODO: Logic for exporting data
  }
}
