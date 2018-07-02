import { Component, OnInit } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { PipeSizingInput, PipeSizingOutput } from "../../../shared/models/standalone";

@Component({
  selector: 'app-pipe-sizing',
  templateUrl: './pipe-sizing.component.html',
  styleUrls: ['./pipe-sizing.component.css']
})
export class PipeSizingComponent implements OnInit {
  inputs: PipeSizingInput;
  outputs: PipeSizingOutput;
  currentField: string = 'default';
  constructor() {
  }

  ngOnInit() {
    this.inputs = {
      airFlow: 0,
      airlinePressure: 0,
      designVelocity: 20,
      atmosphericPressure: 14.7
    };

    this.outputs = {
      crossSectionalArea: 0,
      pipeDiameter: 0
    };
  }

  calculatePipeSize(inputs: PipeSizingInput) {
    this.outputs = StandaloneService.pipeSizing(inputs);
  }

  setField(str: string) {
    this.currentField = str;
  }
}
