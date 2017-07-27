import { Component, OnInit } from '@angular/core';
import { MeteredEnergyElectricity, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';

@Component({
  selector: 'app-metered-electricity',
  templateUrl: './metered-electricity.component.html',
  styleUrls: ['./metered-electricity.component.css','../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredElectricityComponent implements OnInit {
  tabSelect: string = 'results';
  inputs: MeteredEnergyElectricity = {
    electricityCollectionTime: 0,
    electricityUsed: 0,
    auxElectricityUsed: 0,
    auxElectricityCollectionTime: 0
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
    this.results.meteredEnergyUsed = this.inputs.electricityUsed / this.inputs.electricityCollectionTime;
  }

  setField(str: string){
    this.currentField = str;
  }
}
