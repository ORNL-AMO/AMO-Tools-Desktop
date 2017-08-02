import { Component, OnInit, Input } from '@angular/core';
import { MeteredEnergyElectricity, MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { PHAST } from '../../../shared/models/phast/phast';
import { PhastService } from '../../phast.service';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-metered-electricity',
  templateUrl: './metered-electricity.component.html',
  styleUrls: ['./metered-electricity.component.css', '../../../psat/explore-opportunities/explore-opportunities.component.css']
})
export class MeteredElectricityComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;

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
    //Electricty Used = Electricity used during collection / collection time
    this.results.meteredEnergyUsed = this.inputs.electricityUsed / this.inputs.electricityCollectionTime;
    //Electricty Used = Electricity used during collection / collection time
    this.results.meteredElectricityUsed = this.inputs.electricityUsed / this.inputs.electricityCollectionTime;
    //Energy Intensity for Charge Materials =  Electricity used during collection / Sum(charge material feed rates)
    let sumFeedRate = this.phastService.sumChargeMaterialFeedRate(this.phast.losses.chargeMaterials);
    this.results.meteredEnergyIntensity = this.inputs.electricityUsed / sumFeedRate;

  }

  setField(str: string) {
    this.currentField = str;
  }
}
