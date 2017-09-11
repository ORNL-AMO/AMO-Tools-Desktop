import { Component, OnInit, Input } from '@angular/core';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-metered-energy-results',
  templateUrl: './metered-energy-results.component.html',
  styleUrls: ['./metered-energy-results.component.css']
})
export class MeteredEnergyResultsComponent implements OnInit {
  @Input()
  results: MeteredEnergyResults;
  @Input()
  settings: Settings;

  resultUnits: any = {
  }
  constructor() { }

  ngOnInit() {
    if (this.settings.energySourceType == 'Fuel' || this.settings.energySourceType == 'Steam') {
      if (this.settings.unitsOfMeasure == 'Imperial') {
        this.resultUnits = {
          meteredEnergyUsed: 'Btu/hr',
          meteredEnergyIntensity: 'Btu/lb',
          meteredElectricityUsed: 'kW',
          calculatedFuelEnergyUsed: 'Btu/hr',
          calculatedEnergyIntensity: 'Btu/lb',
          calculatedElectricityUsed: 'kW'
        }
      } else if (this.settings.unitsOfMeasure == 'Metric') {
        this.resultUnits = {
          meteredEnergyUsed: 'kJ/hr',
          meteredEnergyIntensity: 'kJ/kg',
          meteredElectricityUsed: 'kW',
          calculatedFuelEnergyUsed: 'kJ/hr',
          calculatedEnergyIntensity: 'kJ/kg',
          calculatedElectricityUsed: 'kW'
        }
      }
    }
    // } else if (this.settings.energySourceType == 'Steam') {
    //   this.resultUnits = {
    //     meteredEnergyUsed: 'Btu/hr',
    //     meteredEnergyIntensity: 'Btu/lb',
    //     meteredElectricityUsed: 'kW',
    //     calculatedFuelEnergyUsed: 'Btu/hr',
    //     calculatedEnergyIntensity: 'Btu/lb',
    //     calculatedElectricityUsed: 'kW'
    //   }
    // }
    else if (this.settings.energySourceType == 'Electricity') {
      if (this.settings.unitsOfMeasure == 'Imperial') {
        this.resultUnits = {
          meteredEnergyUsed: 'kW',
          meteredEnergyIntensity: 'kW/lb',
          meteredElectricityUsed: 'kW',
          calculatedFuelEnergyUsed: 'kW',
          calculatedEnergyIntensity: 'kW/lb',
          calculatedElectricityUsed: 'kW'
        }
      } else if (this.settings.unitsOfMeasure == 'Metric') {
        this.resultUnits = {
          meteredEnergyUsed: 'kW',
          meteredEnergyIntensity: 'kW/kg',
          meteredElectricityUsed: 'kW',
          calculatedFuelEnergyUsed: 'kW',
          calculatedEnergyIntensity: 'kW/kg',
          calculatedElectricityUsed: 'kW'
        }
      }
    }
  }

}
