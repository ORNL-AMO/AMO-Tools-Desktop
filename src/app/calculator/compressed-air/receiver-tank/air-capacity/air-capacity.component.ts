import {Component, OnInit} from '@angular/core';
import {StandaloneService} from "../../../standalone.service";
import {CalculateUsableCapacity} from "../../../../shared/models/standalone";

@Component({
  selector: 'app-air-capacity',
  templateUrl: './air-capacity.component.html',
  styleUrls: ['./air-capacity.component.css']
})
export class AirCapacityComponent implements OnInit {

  inputs: CalculateUsableCapacity;
  airCapacity: number;
  tankCubicFoot: number;

  constructor() {
  }

  ngOnInit() {

    this.inputs = {
      tankSize: 0,
      airPressureIn: 0,
      airPressureOut: 0,
    };

  }

  getAirCapacity() {
    this.airCapacity = StandaloneService.usableAirCapacity(this.inputs);
  }
}
