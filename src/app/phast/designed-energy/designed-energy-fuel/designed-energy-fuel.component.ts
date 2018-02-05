import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergyFuel, DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { DesignedEnergyService } from '../designed-energy.service';

@Component({
  selector: 'app-designed-energy-fuel',
  templateUrl: './designed-energy-fuel.component.html',
  styleUrls: ['./designed-energy-fuel.component.css']
})
export class DesignedEnergyFuelComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  containerHeight: number;
  
  tabSelect: string = 'results';
  results: DesignedEnergyResults;

  currentField: string = 'fuelType';

  constructor(private designedEnergyService: DesignedEnergyService) { }

  ngOnInit() {
    if (this.phast.designedEnergy.designedEnergyFuel.length == 0) {
      this.addZone();
    } else {
      this.calculate();
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    this.emitSave.emit(true);
  }

  calculate() {
    this.results = this.designedEnergyService.designedEnergyFuel(this.phast.designedEnergy.designedEnergyFuel, this.phast, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }

  addZone() {
    let eqNum = 1;
    if (this.phast.designedEnergy.designedEnergyFuel) {
      eqNum = this.phast.designedEnergy.designedEnergyFuel.length + 1;
    }
    let tmpZone: DesignedEnergyFuel = {
      name: 'Zone #' + eqNum,
      fuelType: 0,
      percentCapacityUsed: 0,
      totalBurnerCapacity: 0,
      percentOperatingHours: 0
    }
    this.phast.designedEnergy.designedEnergyFuel.push(tmpZone);
    this.calculate();
  }

  removeZone(index: number) {
    this.phast.designedEnergy.designedEnergyFuel.splice(index, 1);
    this.calculate();
  }
}
