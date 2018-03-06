import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {AirSystemCapacityInput, AirSystemCapacityOutput} from "../../../../shared/models/standalone";

@Component({
  selector: 'app-system-capacity-form',
  templateUrl: './system-capacity-form.component.html',
  styleUrls: ['./system-capacity-form.component.css']
})
export class SystemCapacityFormComponent implements OnInit {

  @Input()
  inputs: AirSystemCapacityInput;
  @Input()
  outputs: AirSystemCapacityOutput;
  @Output('calculate')
  calculate = new EventEmitter<AirSystemCapacityInput>();
  constructor() { }

  ngOnInit() {
  }
emitChange() {
    this.calculate.emit(this.inputs);
  }
}
