import { Component, OnInit } from '@angular/core';
import {StandaloneService} from "../../standalone.service";
import {BagMethodInput, BagMethodOutput} from "../../../shared/models/standalone";

@Component({
  selector: 'app-bag-method',
  templateUrl: './bag-method.component.html',
  styleUrls: ['./bag-method.component.css']
})
export class BagMethodComponent implements OnInit {

  inputs: BagMethodInput;
  outputs: BagMethodOutput;
  currentField: string = 'default';
  constructor() { }

  ngOnInit() {
    this.inputs = {
      operatingTime: 0,
      bagFillTime: 0,
      heightOfBag: 0,
      diameterOfBag: 0,
      numberOfUnits: 0
    };

    this.outputs = {
      flowRate: 0,
      annualConsumption: 0
    };
  }

  calculateAnnualConsumption(inputs: BagMethodInput) {
    this.outputs = StandaloneService.bagMethod(inputs);
  }

  changeField(str: string) {
    this.currentField = str;
  }

}
