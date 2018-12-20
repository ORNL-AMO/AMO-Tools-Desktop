import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../../shared/models/phast/efficiencyImprovement';
import { Settings } from '../../../../shared/models/settings';
import { EfficiencyImprovementService } from '../efficiency-improvement.service';
import { FormGroup } from '@angular/forms';
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

  error = {
    currentCombAirTemp: null,
    newCombAirTemp: null
  };

  form: FormGroup;

  constructor(private efficiencyImprovementService: EfficiencyImprovementService) { }

  ngOnInit() {
    this.form = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.efficiencyImprovementInputs) {
      this.form = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
    }
  }


  calc() {
    this.error.currentCombAirTemp = null;
    this.error.newCombAirTemp = null;
    let canCalculate: boolean = true;

    if (this.efficiencyImprovementInputs.currentCombustionAirTemp > this.efficiencyImprovementInputs.currentFlueGasTemp) {
      this.error.currentCombAirTemp = 'Combustion air temperature must be less than flue gas temperature';
      canCalculate = false;
    }

    if (this.efficiencyImprovementInputs.newCombustionAirTemp > this.efficiencyImprovementInputs.newFlueGasTemp) {
      this.error.newCombAirTemp = 'Combustion air temperature must be less than flue gas temperature';
      canCalculate = false;
    }

    if (canCalculate) {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
}
