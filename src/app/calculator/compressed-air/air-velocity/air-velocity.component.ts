import { Component, OnInit } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {AirVelocityInput} from "../../../shared/models/standalone";

@Component({
  selector: 'app-air-velocity',
  templateUrl: './air-velocity.component.html',
  styleUrls: ['./air-velocity.component.css']
})
export class AirVelocityComponent implements OnInit {

  inputs: AirVelocityInput;
  airVelocityOutput: number;
  constructor() { }

  ngOnInit() {
    this.inputs = {
      airFlow: 0,
      pipePressure: 0,
      atmosphericPressure: 0,
    };
  }
  // getAirVelocity () {
  //   this.airVelocityOutput = StandaloneService.airVelocity(this.inputs);
  // }

}
