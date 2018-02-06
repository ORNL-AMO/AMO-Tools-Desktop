import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergyElectricity, DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { DesignedEnergyService } from '../designed-energy.service';

@Component({
  selector: 'app-designed-energy-electricity',
  templateUrl: './designed-energy-electricity.component.html',
  styleUrls: ['./designed-energy-electricity.component.css']
})
export class DesignedEnergyElectricityComponent implements OnInit {
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
    if(this.phast.designedEnergy.designedEnergyElectricity.length == 0){
      this.addZone();
    }else{
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
    this.results = this.designedEnergyService.designedEnergyElectricity(this.phast.designedEnergy.designedEnergyElectricity, this.phast, this.settings);
  }

  setField(str: string) {
    this.currentField = str;
  }
  addZone() {
    let eqNum = 1;
    if (this.phast.designedEnergy.designedEnergyElectricity) {
      eqNum = this.phast.designedEnergy.designedEnergyElectricity.length + 1;
    }
    let tmpZone: DesignedEnergyElectricity = {
      name: 'Zone #'+eqNum,          
      kwRating: 0,
      percentCapacityUsed: 0,
      percentOperatingHours: 0
    }
    this.phast.designedEnergy.designedEnergyElectricity.push(tmpZone);
    this.calculate();
  }

  removeZone(index: number) {
    this.phast.designedEnergy.designedEnergyElectricity.splice(index, 1);
    this.calculate();
  }
}
