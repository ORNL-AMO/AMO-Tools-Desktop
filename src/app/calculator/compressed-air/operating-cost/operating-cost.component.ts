import { Component, OnInit } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {OperatingCostInput, OperatingCostOutput} from "../../../shared/models/standalone";

@Component({
  selector: 'app-operating-cost',
  templateUrl: './operating-cost.component.html',
  styleUrls: ['./operating-cost.component.css']
})
export class OperatingCostComponent implements OnInit {

  inputs: OperatingCostInput;
  outputs: OperatingCostOutput;
  isLoad: boolean;
  currentField: string = 'default';
  constructor() { }

  ngOnInit() {
    this.inputs = {
      motorBhp: 0,
      bhpUnloaded: 0,
      annualOperatingHours: 0,
      runTimeLoaded: 0,
      runTimeUnloaded: 0,
      efficiencyLoaded: 0,
      efficiencyUnloaded: 0,
      costOfElectricity: 0,

    };

    this.outputs = {
      runTimeUnloaded: 0,
      costForLoaded: 0,
      costForUnloaded: 0,
      totalAnnualCost: 0,
    };
  }
  calculateOperationCost(inputs: OperatingCostInput) {
    this.outputs = StandaloneService.operatingCost(inputs);
  }

  setField(str: string){
    this.currentField = str;
  }
}
