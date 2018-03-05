import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {PneumaticValve} from '../../../../shared/models/standalone';

@Component({
  selector: 'app-flow-factor-form',
  templateUrl: './flow-factor-form.component.html',
  styleUrls: ['./flow-factor-form.component.css']
})
export class FlowFactorFormComponent implements OnInit {
  @Input()
  inputs: PneumaticValve;
  @Output('calculate')
  calculate = new EventEmitter<PneumaticValve>();
  @Output('setUser')
  setUser = new EventEmitter<boolean>();
  @Input()
  userFlowRate: boolean;
  @Input()
  valveFlowFactor: number;
  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }

  setUserFlowRate(bool: boolean) {
    this.setUser.emit(bool);
  }
}
