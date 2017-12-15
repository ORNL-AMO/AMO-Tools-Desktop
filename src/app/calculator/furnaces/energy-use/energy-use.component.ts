import { Component, OnInit, Input } from '@angular/core';
import { FlowCalculations, FlowCalculationsOutput } from '../../../shared/models/phast/flowCalculations';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-energy-use',
  templateUrl: './energy-use.component.html',
  styleUrls: ['./energy-use.component.css']
})
export class EnergyUseComponent implements OnInit {
  @Input()
  inPhast: boolean;
  @Input()
  settings: Settings;

  flowCalculations: FlowCalculations = {
    //natural gas
    gasType: 9,
    specificGravity: 0.14,
    orificeDiameter: 3.5,
    insidePipeDiameter: 8,
    // 1 is sharp edge
    sectionType: 1,
    dischargeCoefficient: 0.6,
    gasHeatingValue: 7325,
    gasTemperature: 85,
    gasPressure: 85,
    orificePressureDrop: 10,
    operatingTime: 10
  }

  flowCalculationResults: FlowCalculationsOutput = {
    flow: 0,
    heatInput: 0,
    totalFlow: 0
  };

  currentField: string = 'orificeDiameter';
  tabSelect: string = 'results';

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
  setCurrentField(str: string) {
    this.currentField = str;
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    this.flowCalculationResults = this.phastService.flowCalculations(this.flowCalculations, this.settings);
  }

}
