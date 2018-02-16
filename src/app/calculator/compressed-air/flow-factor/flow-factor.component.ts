import { Component, OnInit } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {PneumaticValve} from "../../../shared/models/standalone";

@Component({
  selector: 'app-flow-factor',
  templateUrl: './flow-factor.component.html',
  styleUrls: ['./flow-factor.component.css']
})
export class FlowFactorComponent implements OnInit  {

  inputs: PneumaticValve;
  valveFlowFactor: number;
  constructor() { }

  ngOnInit() {
    this.inputs = {
      inletPressure: 0,
      outletPressure: 0,
      flowRate: 0
    };
  }


  getFlowRate() {
    this.inputs.flowRate = StandaloneService.pneumaticValveCalculateFlowRate(this.inputs.inletPressure, this.inputs.outletPressure);
  }

  getValveFlowFactor() {
    this.valveFlowFactor = StandaloneService.pneumaticValve(this.inputs);
  }
}
