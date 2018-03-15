import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DesignedEnergyElectricity, DesignedEnergyResults, DesignedEnergyFuel } from '../../../shared/models/phast/designedEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { DesignedEnergyService } from '../designed-energy.service';
import { SettingsService } from '../../../settings/settings.service';

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
  electricResults: DesignedEnergyResults;
  fuelResults: DesignedEnergyResults;
  totalResults: DesignedEnergyResults;
  currentField: string = 'fuelType';

  constructor(private designedEnergyService: DesignedEnergyService, private settingsService: SettingsService) { }

  ngOnInit() {
    if(this.phast.designedEnergy.designedEnergyElectricity.length == 0){
      this.addZone();
    }else if(this.phast.designedEnergy.designedEnergyElectricity.length != this.phast.designedEnergy.designedEnergyFuel.length){
      this.phast.designedEnergy.designedEnergyElectricity = new Array();
      this.phast.designedEnergy.designedEnergyFuel = new Array();
      this.addZone();
    }else{
      this.calculate();
    }
    
    if (this.settingsService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsService.globalSettings.defaultPanelTab;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    this.emitSave.emit(true);
  }

  calculate() {
    this.electricResults = this.designedEnergyService.designedEnergyElectricity(this.phast.designedEnergy.designedEnergyElectricity, this.phast, this.settings);
    this.fuelResults = this.designedEnergyService.designedEnergyFuel(this.phast.designedEnergy.designedEnergyFuel, this.phast, this.settings);
    this.fuelResults = this.designedEnergyService.convertFuelToElectric(this.fuelResults, this.settings);
    this.totalResults = this.designedEnergyService.sumFuelElectric(this.fuelResults, this.electricResults);
  }

  setField(str: string) {
    this.currentField = str;
  }
  addZone(){
    this.addFuelZone();
    this.addElectricZone();
  }

  addFuelZone(){    
    let eqNum = 1;
    if (this.phast.designedEnergy.designedEnergyElectricity) {
      eqNum = this.phast.designedEnergy.designedEnergyElectricity.length + 1;
    }
    let tmpFuelZone: DesignedEnergyFuel = {
      name: 'Zone #' + eqNum,
      fuelType: 0,
      percentCapacityUsed: 0,
      totalBurnerCapacity: 0,
      percentOperatingHours: 0
    }
    this.phast.designedEnergy.designedEnergyFuel.push(tmpFuelZone);
  }

  addElectricZone(){
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
    this.save();
    this.calculate();
  }

  removeZone(index: number) {
    this.phast.designedEnergy.designedEnergyElectricity.splice(index, 1);
    this.save();
    this.calculate();
  }
}
