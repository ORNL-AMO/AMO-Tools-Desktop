import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CalculateUsableCapacity } from "../../../../shared/models/standalone";
import { StandaloneService } from '../../../standalone.service';

@Component({
  selector: 'app-air-capacity-form',
  templateUrl: './air-capacity-form.component.html',
  styleUrls: ['./air-capacity-form.component.css']
})
export class AirCapacityFormComponent implements OnInit {
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  inputs: CalculateUsableCapacity = {
    tankSize: 0,
    airPressureIn: 0,
    airPressureOut: 0,
  };
  airCapacity: number;
  tankCubicFoot: number;

  constructor() {
  }

  ngOnInit() {
  }

  getAirCapacity() {
    this.airCapacity = StandaloneService.usableAirCapacity(this.inputs);
    this.getTankSize();
  }

  getTankSize() {
    this.tankCubicFoot = this.inputs.tankSize / 7.48;
  }
}
