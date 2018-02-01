import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeteredEnergyFuel, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { PhastService } from '../../phast.service';
import { MeteredEnergyService } from '../metered-energy.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-metered-fuel',
  templateUrl: './metered-fuel.component.html',
  styleUrls: ['./metered-fuel.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css', '../../aux-equipment/aux-equipment.component.css']
})
export class MeteredFuelComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  tabSelect: string = 'results';
  results: MeteredEnergyResults = {
    meteredEnergyUsed: 0,
    meteredEnergyIntensity: 0,
    meteredElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  };

  currentField: string = 'fuelType';

  constructor(private phastService: PhastService, private meteredEnergyService: MeteredEnergyService) { }

  ngOnInit() {
    if (!this.phast.meteredEnergy.meteredEnergyFuel) {
      this.phast.meteredEnergy.meteredEnergyFuel = {
        fuelDescription: 'gas',
        fuelType: 0,
        heatingValue: 0,
        collectionTime: 0,
        electricityUsed: 0,
        electricityCollectionTime: 0,
        fuelEnergy: 0
      };
    }else{
      if(!this.phast.meteredEnergy.meteredEnergyFuel.fuelDescription){
        this.phast.meteredEnergy.meteredEnergyFuel.fuelDescription = 'gas';
      }
    }
    this.calculate();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    this.emitSave.emit(true);
  }

  calculate() {
    this.results = this.meteredEnergyService.meteredFuel(this.phast.meteredEnergy.meteredEnergyFuel, this.phast, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }
}
