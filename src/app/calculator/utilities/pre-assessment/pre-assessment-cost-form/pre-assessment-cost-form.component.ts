import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-pre-assessment-cost-form',
  templateUrl: './pre-assessment-cost-form.component.html',
  styleUrls: ['./pre-assessment-cost-form.component.css']
})
export class PreAssessmentCostFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  inModal: boolean;
  constructor() { }

  ngOnInit() {
  }

  calculate(){
    this.emitCalculate.emit(true);
  }

}
