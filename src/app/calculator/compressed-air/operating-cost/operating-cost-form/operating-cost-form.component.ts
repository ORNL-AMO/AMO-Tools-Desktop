import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {OperatingCostInput, OperatingCostOutput} from "../../../../shared/models/standalone";

@Component({
  selector: 'app-operating-cost-form',
  templateUrl: './operating-cost-form.component.html',
  styleUrls: ['./operating-cost-form.component.css']
})
export class OperatingCostFormComponent implements OnInit {
  @Input()
  inputs: OperatingCostInput;
  @Input()
  outputs: OperatingCostOutput;
  @Output('calculate')
  calculate = new EventEmitter<OperatingCostInput>();

  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }
}
