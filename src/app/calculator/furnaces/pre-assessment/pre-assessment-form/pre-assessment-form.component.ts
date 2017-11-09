import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PreAssessment } from '../pre-assessment';
@Component({
  selector: 'app-pre-assessment-form',
  templateUrl: './pre-assessment-form.component.html',
  styleUrls: ['./pre-assessment-form.component.css']
})
export class PreAssessmentFormComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  @Output('emitCalculate')
  emitCalcualte = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  calculate(){
    this.emitCalcualte.emit(true);
  }

}
