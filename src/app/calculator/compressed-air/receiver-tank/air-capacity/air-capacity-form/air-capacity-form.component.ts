import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {CalculateUsableCapacity} from "../../../../../shared/models/standalone";

@Component({
  selector: 'app-air-capacity-form',
  templateUrl: './air-capacity-form.component.html',
  styleUrls: ['./air-capacity-form.component.css']
})
export class AirCapacityFormComponent implements OnInit {
  @Input()
  inputs: CalculateUsableCapacity;
  @Input()
  airCapacity: number;
  @Input()
  tankCubicFoot: number;
  @Output('calculate')
  calculate = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  emitChange() {
    this.calculate.emit(this.inputs);
    this.getTankSize();
  }

  getTankSize() {
    this.tankCubicFoot = this.inputs.tankSize / 7.48;
  }
}
