import {Component, OnInit} from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {PipeSizingInput, PipeSizingOutput} from "../../../shared/models/standalone";

@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {
  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;

  constructor() {
  }

  ngOnInit() {
    this.inputs = {
      airFlow: 0,
      airlinePressure: 0,
      designVelocity: 0,
      atmosphericPressure: 0
    };

    this.outputs = {
      crossSectionalArea: 0,
      pipeDiameter: 0
    };
  }

  calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = StandaloneService.pipeSizing(inputs);
  }
}
