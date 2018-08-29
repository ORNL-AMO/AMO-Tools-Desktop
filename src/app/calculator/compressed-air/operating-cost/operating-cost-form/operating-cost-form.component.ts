import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OperatingCostInput, OperatingCostOutput } from "../../../../shared/models/standalone";
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-operating-cost-form',
  templateUrl: './operating-cost-form.component.html',
  styleUrls: ['./operating-cost-form.component.css']
})
export class OperatingCostFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inputs: OperatingCostInput;
  @Input()
  outputs: OperatingCostOutput;
  @Output('calculate')
  calculate = new EventEmitter<OperatingCostInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }
  
  emitChange() {
    this.calculate.emit(this.inputs);
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }
}
