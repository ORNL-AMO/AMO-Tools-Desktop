import { Component, OnInit } from '@angular/core';
import { MeteredEnergyFuel, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
@Component({
  selector: 'app-metered-fuel',
  templateUrl: './metered-fuel.component.html',
  styleUrls: ['./metered-fuel.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredFuelComponent implements OnInit {

  tabSelect: string = 'results';
  inputs: MeteredEnergyFuel = {
    fuelType: 0,
    heatingValue: 0,
    collectionTime: 0,
    electricityUsed: 0,
    electricityCollectionTime: 0,
    flowRate: 0
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

  save(){
    console.log('save');
  }

  calculate(){
    this.results.meteredEnergyUsed = this.inputs.heatingValue * this.inputs.flowRate;
  }

  setField(str: string){
    this.currentField = str;
  }
}
