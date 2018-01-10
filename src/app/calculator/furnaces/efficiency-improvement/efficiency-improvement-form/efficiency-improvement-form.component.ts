import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../../shared/models/phast/efficiencyImprovement';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-efficiency-improvement-form',
  templateUrl: './efficiency-improvement-form.component.html',
  styleUrls: ['./efficiency-improvement-form.component.css']
})
export class EfficiencyImprovementFormComponent implements OnInit {
  @Input()
  efficiencyImprovementInputs: EfficiencyImprovementInputs;
  @Input()
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }


  calc() {
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
}
