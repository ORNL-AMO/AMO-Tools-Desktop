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
  userFlowRate: boolean = false;
  constructor() { }

  ngOnInit() {
    this.inputs = {
      inletPressure: 0,
      outletPressure: 0,
      flowRate: 0
    };
  }

setUserFlowRate(bool: boolean) {
  this.userFlowRate = bool;
}
  getFlowRate() {
    this.inputs.flowRate = StandaloneService.pneumaticValveCalculateFlowRate(this.inputs.inletPressure, this.inputs.outletPressure);
  }

  getValveFlowFactor() {
    if (!this.userFlowRate) {
      this.getFlowRate();
      console.log('get');
    }
    this.valveFlowFactor = StandaloneService.pneumaticValve(this.inputs);
    console.log('calc');
  }
}
