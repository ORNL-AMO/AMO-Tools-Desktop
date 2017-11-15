import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
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
      transition('closed => open', animate('.5s ease-in')),
      transition('open => closed', animate('.5s ease-out'))
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
  @Output('emitAssessmentType')
  emitAssessmentType = new EventEmitter<string>();
  @Output('emitEnergyType')
  emitEnergyType = new EventEmitter<string>();

  isEditingName: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  editName() {
    this.isEditingName = true;
  }
  
  doneEditingName() {
    this.isEditingName = false;
  }

  calculate() {
    this.emitCalcualte.emit(true);
  }

  collapsePreAssessment() {
    this.emitCollapse.emit(true);
  }

  deletePreAssessment() {
    this.emitDelete.emit(true);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
    this.changeEnergyType();
    this.changeAssessmentType();
  }

  changeEnergyType() {
    this.emitEnergyType.emit(this.assessment.settings.energySourceType);
  }

  changeAssessmentType() {
    this.emitAssessmentType.emit(this.assessment.type);
  }
}
