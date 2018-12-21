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
  calculate = new EventEmitter<EfficiencyImprovementInputs>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;

  form: FormGroup;

  constructor(private efficiencyImprovementService: EfficiencyImprovementService) { }

  ngOnInit() {
    this.form = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
    this.calc();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.efficiencyImprovementInputs) {
      this.form = this.efficiencyImprovementService.getFormFromObj(this.efficiencyImprovementInputs);
    }
  }


  calc() {
    this.efficiencyImprovementInputs = this.efficiencyImprovementService.getObjFromForm(this.form);
    this.efficiencyImprovementService.updateFormValidators(this.form, this.efficiencyImprovementInputs);
    this.form.controls.currentCombustionAirTemp.markAsDirty({ onlySelf: true });
    this.form.controls.currentCombustionAirTemp.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    this.form.controls.newCombustionAirTemp.markAsDirty({ onlySelf: true });
    this.form.controls.newCombustionAirTemp.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    if (this.form.valid) {
      this.calculate.emit(this.efficiencyImprovementInputs);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  focusOut() {
    this.changeField.emit('default');
  }
}
