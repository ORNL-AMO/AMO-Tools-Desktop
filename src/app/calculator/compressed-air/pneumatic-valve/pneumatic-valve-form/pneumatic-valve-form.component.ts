import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PneumaticValveCvInput, PneumaticValveCvOutput, PneumaticValveFlowRateInput, PneumaticValveFlowRateOutput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-pneumatic-valve-form',
    templateUrl: './pneumatic-valve-form.component.html',
    styleUrls: ['./pneumatic-valve-form.component.css'],
    standalone: false
})
export class PneumaticValveFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calcMode: string;
  @Input()
  flowRateInputs: PneumaticValveFlowRateInput;
  @Input()
  flowRateOutput: PneumaticValveFlowRateOutput;
  @Input()
  cvInputs: PneumaticValveCvInput;
  @Input()
  cvOutput: PneumaticValveCvOutput;
  @Output('calculate')
  calculate = new EventEmitter<void>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  emitChange() {
    this.calculate.emit();
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
