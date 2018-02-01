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
    energyPerMassUnit: '',
    energyPerTimeUnit: '',
    electricityUsedUnit: ''
  }
  constructor() { }

  ngOnInit() {
    if (this.settings.energyResultUnit == 'kWh') {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit;
    } else {
      this.resultUnits.energyPerTimeUnit = this.settings.energyResultUnit + '/hr';
    }
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + '/kg';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.resultUnits.energyPerMassUnit = this.settings.energyResultUnit + '/lb';
    }
    this.resultUnits.electricityUsedUnit = 'kW';
  }

}
