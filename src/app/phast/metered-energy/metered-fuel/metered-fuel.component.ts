import { Component, OnInit, Input } from '@angular/core';
import { MeteredEnergyFuel, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { PhastService } from '../../phast.service';


@Component({
  selector: 'app-metered-fuel',
  templateUrl: './metered-fuel.component.html',
  styleUrls: ['./metered-fuel.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredFuelComponent implements OnInit {
  @Input()
  phast: PHAST;
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

  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.calculate();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    console.log('save');
  }

  calculate() {
    //Metered Energy Use
    //Metered Fuel Used = HHV * Flow Rate
    this.results.meteredEnergyUsed = this.inputs.heatingValue * this.inputs.flowRate;
    //Energy Intensity for Charge Materials =  Metered Energy Used / Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(this.phast.losses.chargeMaterials);
    this.results.meteredEnergyIntensity = this.results.meteredEnergyUsed / sumFeedRate;
    //Electricity Used (Auxiliary) = Electricity used during collection / collection time
    this.results.meteredElectricityUsed = this.inputs.electricityUsed / this.inputs.electricityCollectionTime;
    
    //Calculated By PHAST
    //Fuel energy used
    this.results.calculatedFuelEnergyUsed = this.phastService.sumHeatInput(this.phast.losses);
    //energy intensity = fuel energy used / sum(charge material feed rate)
    this.results.calculatedEnergyIntensity = this.results.calculatedFuelEnergyUsed / sumFeedRate;
    //TODO aux equipment results
}


  setField(str: string) {
    this.currentField = str;
  }
}
