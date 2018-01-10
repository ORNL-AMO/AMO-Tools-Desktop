import { Component, OnInit, Input } from '@angular/core';
import { O2Enrichment, O2EnrichmentOutput } from '../../../shared/models/phast/o2Enrichment';
import { PhastService } from '../../../phast/phast.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
@Component({
  selector: 'app-o2-enrichment',
  templateUrl: './o2-enrichment.component.html',
  styleUrls: ['./o2-enrichment.component.css']
})
export class O2EnrichmentComponent implements OnInit {
  @Input()
  settings: Settings

  o2Enrichment: O2Enrichment = {
    o2CombAir: 21,
    o2CombAirEnriched: 100,
    flueGasTemp: 1800,
    flueGasTempEnriched: 1800,
    o2FlueGas: 5,
    o2FlueGasEnriched: 1,
    combAirTemp: 900,
    combAirTempEnriched: 80,
    fuelConsumption: 10
  };

  o2EnrichmentOutput: O2EnrichmentOutput = {
    availableHeatEnriched: 0.0,
    availableHeatInput: 0.0,
    fuelConsumptionEnriched: 0.0,
    fuelSavingsEnriched: 0.0
  };

  lines = [];
  tabSelect: string = 'results';
  currentField: string = 'o2CombAir';
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
      this.calculate()
    }
  }

  calculate() {
    console.log(this.settings)
    this.o2EnrichmentOutput = this.phastService.o2Enrichment(this.o2Enrichment, this.settings);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string){
    this.currentField = str;
  }
}
