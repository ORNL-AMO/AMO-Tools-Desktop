import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
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
  @Input()
  title: string;
  resultUnits: { energyPerMassUnit: string, energyPerTimeUnit: string, electricityUsedUnit: string } = {
    energyPerMassUnit: '',
    energyPerTimeUnit: '',
    electricityUsedUnit: ''
  };

  constructor() { }

  ngOnInit() {
    if (this.settings.energyResultUnit == 'kWh') {
      this.resultUnits.energyPerTimeUnit = 'kW';
    } else {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit + '/hr';
    }
    this.resultUnits.electricityUsedUnit = 'kW';
    this.setEnergyIntensity();
  }

  setEnergyIntensity() {
    let denominator: string = '/lb';
    if (this.settings.unitsOfMeasure == 'Metric') {
      denominator = '/kg';
    }
    if (this.settings.energyResultUnit == 'kWh') {
      this.resultUnits.energyPerMassUnit = 'kW' + denominator;
    } else if (this.settings.energyResultUnit == 'MMBtu') {
      this.resultUnits.energyPerMassUnit = 'Btu' + denominator;
    } else if (this.settings.energyResultUnit == 'GJ') {
      this.resultUnits.energyPerMassUnit = 'kJ' + denominator;
    } else {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + denominator;
    }
  }
}
