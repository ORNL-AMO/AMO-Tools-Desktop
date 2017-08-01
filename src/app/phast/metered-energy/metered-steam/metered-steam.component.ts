import { Component, OnInit, Input } from '@angular/core';
import { MeteredEnergySteam, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { PhastService } from '../../phast.service';

@Component({
  selector: 'app-metered-steam',
  templateUrl: './metered-steam.component.html',
  styleUrls: ['./metered-steam.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredSteamComponent implements OnInit {
  @Input()
  phast: PHAST;
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

  constructor(private phastService: PhastService) { }


  ngOnInit() {
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  save() {
    console.log('save');
  }

  calculate() {
    //Metered Energy Use
    //Electricty Used = Total heat of steam * Steam flow
    this.results.meteredEnergyUsed = this.inputs.totalHeatSteam * this.inputs.flowRate;
    //Electricty Used = Electricity used during collection / collection time
    this.results.meteredElectricityUsed = this.inputs.electricityUsed / this.inputs.electricityCollectionTime;
    //Energy Intensity for Charge Materials =  Electricity Used during collection/ Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(this.phast.losses.chargeMaterials);
    this.results.meteredEnergyIntensity = this.inputs.electricityUsed / sumFeedRate;

  }

  setField(str: string) {
    this.currentField = str;
  }

}
