import { Component, OnInit, Input } from '@angular/core';
import { MeteredEnergyResults } from '../../../../shared/models/phast/meteredEnergy';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-metered-electricity-results',
  templateUrl: './metered-electricity-results.component.html',
  styleUrls: ['./metered-electricity-results.component.css']
})
export class MeteredElectricityResultsComponent implements OnInit {
  @Input()
  resultsSum: MeteredEnergyResults;
  @Input()
  fuelResults: MeteredEnergyResults;
  @Input()
  electricResults: MeteredEnergyResults;
  @Input()
  settings: Settings;
  resultUnits: { energyPerMassUnit: string, energyPerTimeUnit: string, electricityUsedUnit: string } = {
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
