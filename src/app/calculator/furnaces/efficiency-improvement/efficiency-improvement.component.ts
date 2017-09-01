import { Component, OnInit } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../shared/models/phast/efficiencyImprovement';
import { PhastService } from '../../../phast/phast.service';
@Component({
  selector: 'app-efficiency-improvement',
  templateUrl: './efficiency-improvement.component.html',
  styleUrls: ['./efficiency-improvement.component.css']
})
export class EfficiencyImprovementComponent implements OnInit {

  efficiencyImprovementInputs: EfficiencyImprovementInputs = {
    currentFlueGasOxygen: 6,
    newFlueGasOxygen: 2,
    currentFlueGasTemp: 80,
    currentCombustionAirTemp: 80,
    newCombustionAirTemp: 750,
    currentEnergyInput: 10,
    newFlueGasTemp: 1600
  }
  efficiencyImprovementOutputs: EfficiencyImprovementOutputs;
  currentField: string = 'flueGasOxygen';
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.calculate();
  }

  calculate() {
    this.efficiencyImprovementOutputs = this.phastService.efficiencyImprovement(this.efficiencyImprovementInputs);
  }

  setCurrentField(str: string){
    this.currentField = str;
  }
}
