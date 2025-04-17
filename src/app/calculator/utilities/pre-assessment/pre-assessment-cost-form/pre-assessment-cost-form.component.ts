import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { PreAssessment } from '../pre-assessment';

@Component({
    selector: 'app-pre-assessment-cost-form',
    templateUrl: './pre-assessment-cost-form.component.html',
    styleUrls: ['./pre-assessment-cost-form.component.css'],
    standalone: false
})
export class PreAssessmentCostFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  preAssessment: PreAssessment;

  constructor() { }

  ngOnInit() {
    if (!this.preAssessment.fuelCost) {
      this.preAssessment.fuelCost = this.settings.fuelCost;
    }
    if (!this.preAssessment.steamCost) {
      this.preAssessment.steamCost = this.settings.steamCost;
    }
    if (!this.preAssessment.electricityCost) {
      this.preAssessment.electricityCost = this.settings.electricityCost;
    }
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

}
