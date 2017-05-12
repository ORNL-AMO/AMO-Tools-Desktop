import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Assessment } from '../shared/models/assessment';
import { AssessmentService } from '../assessment/assessment.service';
import { PhastService } from './phast.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { ActivatedRoute } from '@angular/router';

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
    'metered-energy'
  ]
  tabIndex: number = 0;
  constructor(
    private location: Location,
    private assessmentService: AssessmentService,
    private phastService: PhastService,
    private indexedDbService: IndexedDbService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
      })
      let tmpTab = this.assessmentService.getTab();
      if (tmpTab == 'modify-conditions') {
        this.currentTab = 'losses';
      }
    });
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
  }

  saveDb() {
    this.indexedDbService.putAssessment(this.assessment).then(
      results => { console.log('saved!'); }
    )
  }

  exportData() {
    //TODO: Logic for exporting data
  }
}
