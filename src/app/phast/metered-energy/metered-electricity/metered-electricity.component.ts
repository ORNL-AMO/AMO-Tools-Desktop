import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeteredEnergyElectricity, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { PhastService } from '../../phast.service';
import { Settings } from '../../../shared/models/settings';
import { MeteredEnergyService } from '../metered-energy.service';

@Component({
  selector: 'app-metered-electricity',
  templateUrl: './metered-electricity.component.html',
  styleUrls: ['./metered-electricity.component.css', '../../aux-equipment/aux-equipment.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredElectricityComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

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
    if (!this.phast.meteredEnergy.meteredEnergyElectricity) {
      this.phast.meteredEnergy.meteredEnergyElectricity = {
        electricityCollectionTime: 0,
        electricityUsed: 0,
        auxElectricityUsed: 0,
        auxElectricityCollectionTime: 0
      };
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
    this.results = this.meteredEnergyService.meteredElectricity(this.phast.meteredEnergy.meteredEnergyElectricity, this.phast, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }
}
