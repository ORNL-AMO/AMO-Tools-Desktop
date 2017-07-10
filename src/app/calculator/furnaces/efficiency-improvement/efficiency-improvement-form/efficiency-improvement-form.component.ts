import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../../shared/models/phast/efficiencyImprovement';

@Component({
  selector: 'app-efficiency-improvement-form',
  templateUrl: './efficiency-improvement-form.component.html',
  styleUrls: ['./efficiency-improvement-form.component.css']
})
export class EfficiencyImprovementFormComponent implements OnInit {
  @Input()
  efficiencyImprovementInputs:EfficiencyImprovementInputs;
  @Input()
  efficiencyImprovementOutputs:EfficiencyImprovementOutputs
  @Output('calculate')
  calculate = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }


  calc(){
    this.calculate.emit(true);
  }
}
