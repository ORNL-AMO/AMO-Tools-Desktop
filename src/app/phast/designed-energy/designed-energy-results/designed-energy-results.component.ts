import { Component, OnInit, Input } from '@angular/core';
import { DesignedEnergyResults } from '../../../shared/models/phast/designedEnergy';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-designed-energy-results',
  templateUrl: './designed-energy-results.component.html',
  styleUrls: ['./designed-energy-results.component.css']
})
export class DesignedEnergyResultsComponent implements OnInit {
  @Input()
  results: DesignedEnergyResults;
  @Input()
  settings: Settings;

  resultUnits: any;
  constructor() { }

  ngOnInit() {
    if (this.settings.energySourceType == 'Fuel') {
      this.resultUnits = {
        designedEnergyUsed: 'Btu/hr',
        designedEnergyIntensity: 'Btu/lb',
        designedElectricityUsed: 'kW',
        calculatedFuelEnergyUsed: 'Btu/hr',
        calculatedEnergyIntensity: 'Btu/lb',
        calculatedElectricityUsed: 'kW'
      }
    } else if (this.settings.energySourceType == 'Electricity') {
      this.resultUnits = {
        designedEnergyUsed: 'kW',
        designedEnergyIntensity: 'kW',
        designedElectricityUsed: 'kW',
        calculatedFuelEnergyUsed: 'kW',
        calculatedEnergyIntensity: 'kW',
        calculatedElectricityUsed: 'kW'
      }
    } else if (this.settings.energySourceType == 'Steam') {
      this.resultUnits = {
        designedEnergyUsed: 'Btu/hr',
        designedEnergyIntensity: 'Btu/lb',
        designedElectricityUsed: 'kW',
        calculatedFuelEnergyUsed: 'Btu/hr',
        calculatedEnergyIntensity: 'Btu/lb',
        calculatedElectricityUsed: 'kW'
      }
    }
  }

}
