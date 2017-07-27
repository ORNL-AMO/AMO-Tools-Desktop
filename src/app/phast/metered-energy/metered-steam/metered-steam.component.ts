import { Component, OnInit } from '@angular/core';
import { MeteredEnergySteam, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';

@Component({
  selector: 'app-metered-steam',
  templateUrl: './metered-steam.component.html',
  styleUrls: ['./metered-steam.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredSteamComponent implements OnInit {

  tabSelect: string = 'results';
  inputs: MeteredEnergySteam = {
    totalHeatSteam: 0,
    flowRate: 0,
    collectionTime: 0,
    electricityUsed: 0,
    electricityCollectionTime: 0
  };
  results: MeteredEnergyResults = {
    meteredEnergyUsed: 0,
    meteredEnergyIntensity: 0,
    meteredElectricityUsed: 0,
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
    this.results.meteredEnergyUsed = this.inputs.totalHeatSteam * this.inputs.flowRate;
  }

  setField(str: string) {
    this.currentField = str;
  }

}
