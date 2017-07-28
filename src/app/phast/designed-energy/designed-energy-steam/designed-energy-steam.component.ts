import { Component, OnInit } from '@angular/core';
import { DesignedEnergySteam, DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';

@Component({
  selector: 'app-designed-energy-steam',
  templateUrl: './designed-energy-steam.component.html',
  styleUrls: ['./designed-energy-steam.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class DesignedEnergySteamComponent implements OnInit {
  tabSelect: string = 'results';
  inputs: DesignedEnergySteam = {
    zoneNumber: 0,
    totalHeat: 0,
    steamFlow: 0,
    percentCapacityUsed: 0,
    percentOperatingHours: 0
  };
  results: DesignedEnergyResults = {
    designedEnergyUsed: 0,
    designedEnergyIntensity: 0,
    designedElectricityUsed: 0,
    calculatedFuelEnergyUsed: 0,
    calculatedEnergyIntensity: 0,
    calculatedElectricityUsed: 0
  };

  currentField: string = 'fuelType';

  constructor() { }

  ngOnInit() {
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    console.log('save');
  }

  calculate() {
    // this.results.designedEnergyUsed = this.inputs.totalHeatSteam * this.inputs.flowRate;
  }

  setField(str: string) {
    this.currentField = str;
  }
}
