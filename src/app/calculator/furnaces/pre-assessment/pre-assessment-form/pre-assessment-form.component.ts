import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PreAssessment } from '../pre-assessment';
import { Settings } from '../../../../shared/models/settings';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-pre-assessment-form',
  templateUrl: './pre-assessment-form.component.html',
  styleUrls: ['./pre-assessment-form.component.css'],
  animations: [
    trigger('collapsed', [
      state('open', style({
        height: 500,
        opacity: 100
      })),
      state('closed', style({
        height: 0,
        opacity: 0
      })),
      transition('closed => open', animate('.75s ease-in')),
      transition('open => closed', animate('.75s ease-out'))
    ])
  ]
})
export class PreAssessmentFormComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalcualte = new EventEmitter<boolean>();
  @Output('emitCollapse')
  emitCollapse = new EventEmitter<boolean>();
  @Output('emitDelete')
  emitDelete = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  calculate(){
    this.emitCalcualte.emit(true);
  }

  collapsePreAssessment(){
    this.emitCollapse.emit(true);
  }

  deletePreAssessment(){
    this.emitDelete.emit(true);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }
}
