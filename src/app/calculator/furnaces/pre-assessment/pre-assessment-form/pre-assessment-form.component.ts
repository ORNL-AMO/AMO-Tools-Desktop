import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PreAssessment } from '../pre-assessment';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-pre-assessment-form',
  templateUrl: './pre-assessment-form.component.html',
  styleUrls: ['./pre-assessment-form.component.css']
})
export class PreAssessmentFormComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalcualte = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  calculate(){
    this.emitCalcualte.emit(true);
  }

}
