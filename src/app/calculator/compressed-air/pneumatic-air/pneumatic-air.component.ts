import { Component, OnInit } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {  PneumaticAirRequirementInput, PneumaticAirRequirementOutput} from "../../../shared/models/standalone";

@Component({
  selector: 'app-pneumatic-air',
  templateUrl: './pneumatic-air.component.html',
  styleUrls: ['./pneumatic-air.component.css']
})
export class PneumaticAirComponent implements OnInit {

  inputs: PneumaticAirRequirementInput;
  outputs: PneumaticAirRequirementOutput;
  currentField: string = 'default';
  constructor() { }

  ngOnInit() {
    this.inputs = {
      pistonType: 0,
      cylinderDiameter: 0,
      cylinderStroke: 0,
      pistonRodDiameter: 0,
      airPressure: 0,
      cyclesPerMinute: 0
    };

    this.outputs = {
      airRequirementPneumaticCylinder: 0,
      volumeAirIntakePiston: 0,
      compressionRatio: 0
    };
  }
  calculatePneumaticAirRequirement(inputs: PneumaticAirRequirementInput) {
    this.outputs = StandaloneService.pneumaticAirRequirement(inputs);
  }


  setField(str: string){
    this.currentField = str;
  }
}
