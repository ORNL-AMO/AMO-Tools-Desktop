import { Component, OnInit } from '@angular/core';
import { FlowCalculations, FlowCalculationsOutput } from '../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../phast/phast.service';
@Component({
  selector: 'app-energy-use',
  templateUrl: './energy-use.component.html',
  styleUrls: ['./energy-use.component.css']
})
export class EnergyUseComponent implements OnInit {

  flowCalculations: FlowCalculations = {
    //helium
    gasType: 7,
    specificGravity: 0.14,
    orificeDiameter: 5,
    insidePipeDiameter: 9,
    // 1 is sharp edge
    sectionType: 1,
    dischargeCoefficient: 0.6,
    gasHeatingValue: 7325,
    gasTemperature: 52,
    gasPressure: 63,
    orificePressureDrop: 26,
    operatingTime: 16
  }

  flowCalculationResults: FlowCalculationsOutput = {
    flow: 0,
    heatInput: 0,
    totalFlow: 0
  };

  currentField: string;


  constructor(private phastService: PhastService) { }

  ngOnInit() {
  }
  setCurrentField(str: string) {
    this.currentField = str;
  }

}
