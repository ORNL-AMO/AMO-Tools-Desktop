import { Component, OnInit, Input } from '@angular/core';
import { MeteredEnergyResults } from '../../../shared/models/phast/meteredEnergy';
import { Settings } from '../../../shared/models/settings';
@Component({
    selector: 'app-metered-energy-results',
    templateUrl: './metered-energy-results.component.html',
    styleUrls: ['./metered-energy-results.component.css'],
    standalone: false
})
export class MeteredEnergyResultsComponent implements OnInit {
  @Input()
  results: MeteredEnergyResults;
  @Input()
  settings: Settings;
  @Input()
  label: string;
  resultUnits: { energyPerMassUnit: string, energyPerTimeUnit: string, electricityUsedUnit: string } = {
    energyPerMassUnit: '',
    energyPerTimeUnit: '',
    electricityUsedUnit: ''
  };
  constructor() { }

  ngOnInit() {
    if (this.settings.energyResultUnit === 'kWh') {
      this.resultUnits.energyPerTimeUnit = 'kW';
    } else {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit;
    }
    this.resultUnits.electricityUsedUnit = 'kW';
    this.setEnergyIntensity();
  }

  setEnergyIntensity() {
    let denominator: string = '/lb';
    if (this.settings.unitsOfMeasure === 'Metric') {
      denominator = '/kg';
    }
    if (this.settings.energyResultUnit === 'kWh') {
      this.resultUnits.energyPerMassUnit = 'kW' + denominator;
    }else if (this.settings.energyResultUnit === 'MMBtu') {
      this.resultUnits.energyPerMassUnit = 'Btu' + denominator;
    } else if (this.settings.energyResultUnit === 'GJ') {
      this.resultUnits.energyPerMassUnit = 'kJ' + denominator;
    } else {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + denominator;
    }
  }

}
