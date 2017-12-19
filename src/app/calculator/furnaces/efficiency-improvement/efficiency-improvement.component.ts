import { Component, OnInit, Input } from '@angular/core';
import { EfficiencyImprovementInputs, EfficiencyImprovementOutputs } from '../../../shared/models/phast/efficiencyImprovement';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
@Component({
  selector: 'app-efficiency-improvement',
  templateUrl: './efficiency-improvement.component.html',
  styleUrls: ['./efficiency-improvement.component.css']
})
export class EfficiencyImprovementComponent implements OnInit {
  @Input()
  settings: Settings

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
  constructor(private phastService: PhastService, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    if(!this.settings){
      this.indexedDbService.getDirectorySettings(1).then(results => {
        if(results){
          this.settings = results[0];
          this.calculate();
        }
      })
    }else{
      this.calculate();
    }
  }

  calculate() {
    this.efficiencyImprovementOutputs = this.phastService.efficiencyImprovement(this.efficiencyImprovementInputs, this.settings);
  }

  setCurrentField(str: string){
    this.currentField = str;
  }
}
