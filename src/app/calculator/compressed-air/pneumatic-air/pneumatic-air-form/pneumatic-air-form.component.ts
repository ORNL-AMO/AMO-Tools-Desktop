import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PneumaticAirRequirementInput, PneumaticAirRequirementOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-pneumatic-air-form',
    templateUrl: './pneumatic-air-form.component.html',
    styleUrls: ['./pneumatic-air-form.component.css'],
    standalone: false
})
export class PneumaticAirFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: PneumaticAirRequirementInput;
  @Input()
  outputs: PneumaticAirRequirementOutput;
  @Output('calculate')
  calculate = new EventEmitter<PneumaticAirRequirementInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  
  pistonTypes: Array<any> = [
    {
      name: 'Single Acting',
      value: 0
    },
    {
      name: 'Double Acting',
      value: 1
    },
  ];
  constructor() { }

  ngOnInit() {
  }

  emitChange() {
    this.calculate.emit(this.inputs);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }

}
