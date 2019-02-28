import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PreAssessment } from '../pre-assessment';
@Component({
  selector: 'app-pre-assessment-help',
  templateUrl: './pre-assessment-help.component.html',
  styleUrls: ['./pre-assessment-help.component.css']
})
export class PreAssessmentHelpComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  @Input()
  currentField: string;
  @Input()
  assessmentType: string;
  @Input()
  currentEnergySourceType: string;
  @Input()
  currentAssessmentType: string;
  @Input()
  calcType: string;
  @Output('emitAssessmentType')
  emitAssessmentType = new EventEmitter<string>();

  // showElectricity: boolean = false;
  // showSteam: boolean = false;
  // showFuel: boolean = false;
  showDescription: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  setAssessmentType(str: string) {
    if (str !== this.currentAssessmentType) {
      this.currentAssessmentType = str;
    }
  }
  ngOnChanges() {

  }
}
