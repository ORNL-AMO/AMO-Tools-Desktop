import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergySteam, DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { DesignedEnergyService } from '../designed-energy.service';

@Component({
  selector: 'app-designed-energy-steam',
  templateUrl: './designed-energy-steam.component.html',
  styleUrls: ['./designed-energy-steam.component.css']
})
export class DesignedEnergySteamComponent implements OnInit {
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
    if (this.phast.designedEnergy.designedEnergySteam.length == 0) {
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
    this.results = this.designedEnergyService.designedEnergySteam(this.phast.designedEnergy.designedEnergySteam, this.phast, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }
  addZone() {
    let eqNum = 1;
    if (this.phast.designedEnergy.designedEnergySteam) {
      eqNum = this.phast.designedEnergy.designedEnergySteam.length + 1;
    }
    let tmpZone: DesignedEnergySteam = {
      name: 'Zone #' + eqNum,
      totalHeat: 0,
      steamFlow: 0,
      percentCapacityUsed: 0,
      percentOperatingHours: 0
    }
    this.phast.designedEnergy.designedEnergySteam.push(tmpZone);
    this.calculate();
  }

  removeZone(index: number) {
    this.phast.designedEnergy.designedEnergySteam.splice(index, 1);
    this.calculate();
  }
}
