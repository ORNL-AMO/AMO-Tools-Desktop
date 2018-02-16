import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {BagMethodInput, PneumaticValve} from '../../../../shared/models/standalone';

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
  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }
}
