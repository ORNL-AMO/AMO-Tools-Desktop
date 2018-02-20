import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {PneumaticAirRequirementInput, PneumaticAirRequirementOutput} from "../../../../shared/models/standalone";

@Component({
  selector: 'app-pneumatic-air-form',
  templateUrl: './pneumatic-air-form.component.html',
  styleUrls: ['./pneumatic-air-form.component.css']
})
export class PneumaticAirFormComponent implements OnInit {

  @Input()
  inputs: PneumaticAirRequirementInput;
  @Input()
  outputs: PneumaticAirRequirementOutput;
  @Output('calculate')
  calculate = new EventEmitter<PneumaticAirRequirementInput>();
  pistonTypes: Array<string> = [
    'Single Acting',
    'Double Acting',
  ];
  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }

}
