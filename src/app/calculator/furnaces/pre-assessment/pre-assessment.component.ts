import { Component, OnInit } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { PreAssessment } from './pre-assessment';

@Component({
  selector: 'app-pre-assessment',
  templateUrl: './pre-assessment.component.html',
  styleUrls: ['./pre-assessment.component.css'],
})
export class PreAssessmentComponent implements OnInit {

  preAssessments: Array<PreAssessment>;
  tabSelect: string = 'results';
  currentField: string;
  unitsOfMeasure: string = 'Imperial';
  constructor() { }

  ngOnInit() {
    this.preAssessments = new Array<PreAssessment>();
  }
  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {

  }

  addPreAssessment() {
    let tmpSettings: Settings = {
      unitsOfMeasure: this.unitsOfMeasure,
      energySourceType: 'Fuel'
    }
    this.preAssessments.push({
      type: 'Metered',
      settings: tmpSettings
    })
  }
}
