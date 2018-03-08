import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {AirVelocityInput, PipeSizes} from "../../../../shared/models/standalone";

@Component({
  selector: 'app-air-velocity-form',
  templateUrl: './air-velocity-form.component.html',
  styleUrls: ['./air-velocity-form.component.css']
})
export class AirVelocityFormComponent implements OnInit {
  @Input()
  inputs: AirVelocityInput;
  @Input()
  outputs: PipeSizes;
  @Output('calculate')
  calculate = new EventEmitter<AirVelocityInput>();
  @Input()
  airVelocityOutput: number;

  constructor() { }

  ngOnInit() {
  }
  emitChange() {
    this.calculate.emit(this.inputs);
  }
}
