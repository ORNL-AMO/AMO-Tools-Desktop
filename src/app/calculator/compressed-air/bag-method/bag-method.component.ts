import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bag-method',
  templateUrl: './bag-method.component.html',
  styleUrls: ['./bag-method.component.css']
})
export class BagMethodComponent implements OnInit {

  inputs: BagMethod;
  constructor() { }

  ngOnInit() {
    this.inputs = {
      operatingHours: 0,
      fillTime: 0,
      height: 0,
      diameter: 0,
      flowRate: 0,
      airBlows: 0,
      annualConsumption: 0
    }
  }

  calculateFlowRate(inputs: BagMethod) {
    //flowRate = (.0273 * diameter^2 * height)/fillTime
    if (inputs.fillTime) {
      inputs.flowRate = (.0273 * (inputs.diameter * inputs.diameter) * inputs.height) / inputs.fillTime;
    }
  }

  calculateAnnualConsumption(inputs: BagMethod) {
    this.calculateFlowRate(inputs);
    inputs.annualConsumption = (inputs.flowRate * inputs.operatingHours * inputs.airBlows * 60) / 1000
  }
}


export interface BagMethod {
  operatingHours: number,
  fillTime: number,
  height: number,
  diameter: number,
  flowRate: number,
  airBlows: number,
  annualConsumption: number
}